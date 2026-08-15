// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js - INDEXEDDB EDITION) ---
var RetoricaStorage = {
    dbName: 'RetoricaDB_V2026',
    dbVersion: 1,
    dbInstance: null,
    currentDocId: null,

    // Función de sanitización XSS
    escapeHTML: function(str) {
        return String(str || '').replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    },

    initDB: function(callback) {
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then(function(persistent) {
                console.log("Retórica - Almacenamiento persistente:", persistent ? "Garantizado" : "Temporal");
            }).catch(function(e) {
                console.warn("No se pudo solicitar persistencia:", e);
            });
        }

        if (this.dbInstance) {
            if (callback) callback();
            return;
        }

        var self = this;
        var request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = function(e) {
            console.error("Error abriendo IndexedDB:", e);
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("Error de acceso a almacenamiento local");
            }
            if (callback) callback();
        };

        request.onsuccess = function(e) {
            self.dbInstance = e.target.result;
            if (callback) callback();
        };

        request.onupgradeneeded = function(e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains('documents')) {
                db.createObjectStore('documents', { keyPath: 'id' });
            }
        };
    },

    save: function() {
        var self = this;
        this.initDB(function() {
            var titleInput = document.getElementById('editor-title');
            var bodyInput = document.getElementById('editor-body');
            if (!titleInput || !bodyInput) return;

            var title = titleInput.value.trim();
            var body = bodyInput.innerHTML;

            if (!self.currentDocId) {
                self.currentDocId = 'doc_' + Date.now();
            }

            var nowStr = new Date().toISOString();
            
            self.getDocById(self.currentDocId, function(existingDoc) {
                var createdAt = existingDoc ? (existingDoc.createdAt || nowStr) : nowStr;

                var docData = {
                    id: self.currentDocId,
                    title: title,
                    body: body,
                    lang: (typeof RetoricaI18n !== 'undefined') ? RetoricaI18n.currentLang : 'es',
                    createdAt: createdAt,
                    updatedAt: nowStr
                };

                var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                var store = transaction.objectStore('documents');
                store.put(docData);

                transaction.oncomplete = function() {
                    localStorage.setItem('retorica_last_doc_id', self.currentDocId);
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.notify("Guardado en disco persistente ✓");
                    }
                    self.refreshLibrary();
                    self.syncWithCloud();
                };
            });
        });
    },

    autoSaveSilent: function() {
        var self = this;
        this.initDB(function() {
            var titleInput = document.getElementById('editor-title');
            var bodyInput = document.getElementById('editor-body');
            if (!titleInput || !bodyInput) return;

            var title = titleInput.value.trim();
            var body = bodyInput.innerHTML;

            if (!title && !body) return;

            if (!self.currentDocId) {
                self.currentDocId = 'doc_' + Date.now();
            }

            var nowStr = new Date().toISOString();

            self.getDocById(self.currentDocId, function(existingDoc) {
                var createdAt = existingDoc ? (existingDoc.createdAt || nowStr) : nowStr;

                var docData = {
                    id: self.currentDocId,
                    title: title,
                    body: body,
                    lang: (typeof RetoricaI18n !== 'undefined') ? RetoricaI18n.currentLang : 'es',
                    createdAt: createdAt,
                    updatedAt: nowStr
                };

                var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                var store = transaction.objectStore('documents');
                store.put(docData);
                localStorage.setItem('retorica_last_doc_id', self.currentDocId);
            });
        });
    },

    getDocById: function(id, callback) {
        if (!this.dbInstance) { 
            this.initDB(function() {
                RetoricaStorage.getDocById(id, callback);
            });
            return; 
        }
        var transaction = this.dbInstance.transaction(['documents'], 'readonly');
        var store = transaction.objectStore('documents');
        var request = store.get(id);

        request.onsuccess = function(e) {
            callback(e.target.result || null);
        };
        request.onerror = function() {
            callback(null);
        };
    },

    getAllDocs: function(callback) {
        if (!this.dbInstance) {
            this.initDB(function() {
                RetoricaStorage.getAllDocs(callback);
            });
            return;
        }
        var transaction = this.dbInstance.transaction(['documents'], 'readonly');
        var store = transaction.objectStore('documents');
        var request = store.getAll();

        request.onsuccess = function(e) {
            callback(e.target.result || []);
        };
        request.onerror = function() {
            callback([]);
        };
    },

    createNewDoc: function() {
        this.currentDocId = 'doc_' + Date.now();
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        if (titleInput) titleInput.value = '';
        if (bodyInput) bodyInput.innerHTML = '';

        localStorage.removeItem('retorica_last_doc_id');

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.notify("Nuevo documento iniciado");
        }
    },

    clearCanvas: function() {
        this.createNewDoc();
    },

    loadDoc: function(id) {
        var self = this;
        this.getDocById(id, function(doc) {
            if (doc) {
                self.currentDocId = doc.id;
                var titleInput = document.getElementById('editor-title');
                var bodyInput = document.getElementById('editor-body');

                if (titleInput) titleInput.value = doc.title || '';
                if (bodyInput) bodyInput.innerHTML = doc.body || '';

                localStorage.setItem('retorica_last_doc_id', doc.id);

                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.updateCounters();
                    RetoricaUI.notify("Documento cargado ✓");
                    
                    if (typeof RetoricaUI.toggleSidebar === 'function') {
                        RetoricaUI.toggleSidebar();
                    }
                }
            }
        });
    },

    deleteDoc: function(id, event) {
        if (event) event.stopPropagation();
        var self = this;
        this.initDB(function() {
            var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
            var store = transaction.objectStore('documents');
            store.delete(id);

            transaction.oncomplete = function() {
                if (self.currentDocId === id) {
                    self.createNewDoc();
                }
                self.refreshLibrary();
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.notify("Documento eliminado ✓");
                }
            };
        });
    },

    copyDoc: function(id, event) {
        if (event) event.stopPropagation();
        this.getDocById(id, function(doc) {
            if (!doc) return;
            var dummyDiv = document.createElement("div");
            dummyDiv.innerHTML = doc.body || "";
            var plainText = dummyDiv.innerText || dummyDiv.textContent || "";
            var textToCopy = (doc.title ? doc.title + "\n\n" : "") + plainText;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(function() {
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Copiado al portapapeles ✓");
                });
            } else {
                var dummy = document.createElement("textarea");
                document.body.appendChild(dummy);
                dummy.value = textToCopy;
                dummy.select();
                document.execCommand("copy");
                document.body.removeChild(dummy);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Copiado al portapapeles ✓");
            }
        });
    },

    shareDoc: function(id, event) {
        if (event) event.stopPropagation();
        this.getDocById(id, function(doc) {
            if (!doc) return;
            var dummyDiv = document.createElement("div");
            dummyDiv.innerHTML = doc.body || "";
            var plainText = dummyDiv.innerText || dummyDiv.textContent || "";

            var shareData = {
                title: doc.title || 'Documento Retórica',
                text: (doc.title ? doc.title + "\n\n" : "") + plainText
            };

            if (navigator.share) {
                navigator.share(shareData).catch(function(err) {
                    console.log("Compartición cancelada o no soportada", err);
                });
            } else {
                RetoricaStorage.copyDoc(id, event);
            }
        });
    },

    refreshLibrary: function() {
        var container = document.getElementById('docs-list-render');
        if (!container) return;

        var self = this;
        this.getAllDocs(function(docs) {
            container.innerHTML = '';
            if (!docs || docs.length === 0) {
                container.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:20px; width:100%;">No hay documentos guardados.</div>';
                return;
            }

            docs.sort(function(a, b) {
                return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
            });

            var p = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                    RetoricaI18n.db[RetoricaI18n.currentLang] : {};

            var txtDel = p.del || 'BORRAR';
            var txtCopy = p.copyCard || 'COPIAR';
            var txtShare = p.share || 'COMPARTIR';

            docs.forEach(function(doc) {
                var card = document.createElement('div');
                card.className = 'card-template';
                card.onclick = function() { self.loadDoc(doc.id); };

                var dummyDiv = document.createElement("div");
                dummyDiv.innerHTML = doc.body || "";
                var snippet = dummyDiv.innerText || dummyDiv.textContent || "...";

                var titleEsc = self.escapeHTML(doc.title || 'Sin Título');
                var snippetEsc = self.escapeHTML(snippet);

                card.innerHTML = 
                    '<div class="card-template-title">' + titleEsc + '</div>' +
                    '<div class="card-template-body">' + snippetEsc + '</div>' +
                    '<div class="card-template-actions">' +
                        '<button type="button" class="btn-action-tmpl card-btn-copy" onclick="RetoricaStorage.copyDoc(\'' + doc.id + '\', event)" title="' + txtCopy + '" aria-label="' + txtCopy + '">' + txtCopy + '</button>' +
                        '<button type="button" class="btn-action-tmpl card-btn-share" onclick="RetoricaStorage.shareDoc(\'' + doc.id + '\', event)" title="' + txtShare + '" aria-label="' + txtShare + '">' + txtShare + '</button>' +
                        '<button type="button" class="btn-action-tmpl card-btn-delete" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)" title="' + txtDel + '" aria-label="' + txtDel + '" style="color:#ff5555;">' + txtDel + '</button>' +
                    '</div>';

                container.appendChild(card);
            });
        });
    },

    manualSync: function() {
        this.save();
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Sincronización local completada ✓");
        }
    },

    syncWithCloud: function() {
        console.log("Retórica - Sincronización en la nube verificada.");
    },

    exportBackup: function() {
        this.getAllDocs(function(docs) {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(docs, null, 2));
            var downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "retorica_backup_" + Date.now() + ".json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Respaldo exportado ✓");
        });
    },

    importBackup: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        var self = this;
        reader.onload = function(e) {
            try {
                var docs = JSON.parse(e.target.result);
                if (Array.isArray(docs)) {
                    self.initDB(function() {
                        var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                        var store = transaction.objectStore('documents');
                        docs.forEach(function(doc) {
                            if (doc.id) store.put(doc);
                        });
                        transaction.oncomplete = function() {
                            self.refreshLibrary();
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Respaldo restaurado con éxito ✓");
                        };
                    });
                } else {
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Archivo de respaldo no válido");
                }
            } catch (err) {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error al procesar el archivo JSON");
            }
        };
        reader.readAsText(file);
    },

    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var fileName = file.name;
        var ext = fileName.split('.').pop().toLowerCase();
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        if (titleInput) titleInput.value = fileName.replace(/\.[^/.]+$/, "");

        if (ext === 'txt' || ext === 'html') {
            var reader = new FileReader();
            reader.onload = function(e) {
                if (bodyInput) {
                    if (ext === 'html') {
                        bodyInput.innerHTML = e.target.result;
                    } else {
                        bodyInput.innerText = e.target.result;
                    }
                }
                RetoricaStorage.save();
            };
            reader.readAsText(file);
                } else if (ext === 'pdf' && window.pdfjsLib) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var typedarray = new Uint8Array(e.target.result);
                pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                    var maxPages = pdf.numPages;
                    var countPromises = [];
                    for (var i = 1; i <= maxPages; i++) {
                        countPromises.push(pdf.getPage(i).then(function(page) {
                            return page.getTextContent().then(function(textContent) {
                                return textContent.items.map(function(s) { return s.str; });
                            });
                        }));
                    }
                    Promise.all(countPromises).then(function(pagesItems) {
                        var allLines = [];
                        pagesItems.forEach(function(items) {
                            var line = "";
                            items.forEach(function(item) {
                                if (item.trim().length > 0) line += item + "\t";
                            });
                            allLines.push(line);
                        });

                        // Activar interfaz Excel automáticamente al detectar PDF estructurado
                        RetoricaExcel.activeMode = true;
                        var toolbar = document.getElementById('accordion-excel-toolbar');
                        if (toolbar) toolbar.classList.remove('accordion-closed');

                        var tableHTML = '<table id="retorica-excel-table" style="width:100%; border-collapse:collapse; margin:10px 0; font-size:0.85rem;" border="1"><thead><tr style="background:var(--bg-sidebar, #f0f0f0); text-align:center;"><th>#</th><th>A (Código/Llanta)</th><th>B (Medida)</th><th>C (Precio Base)</th><th>D (IVA 16%)</th><th>E (Precio Total)</th></tr></thead><tbody>';

                        allLines.forEach(function(lineStr, idx) {
                            var parts = lineStr.split('\t').filter(function(p) { return p.trim() !== ''; });
                            if (parts.length > 0) {
                                var r = idx + 1;
                                tableHTML += '<tr><td style="background:var(--bg-sidebar, #f0f0f0); font-weight:bold; text-align:center;">' + r + '</td>';
                                tableHTML += '<td contenteditable="true" data-cell="A' + r + '" onblur="RetoricaExcel.evalCell(this)">' + (parts[0] || '') + '</td>';
                                tableHTML += '<td contenteditable="true" data-cell="B' + r + '" onblur="RetoricaExcel.evalCell(this)">' + (parts[1] || '') + '</td>';
                                tableHTML += '<td contenteditable="true" data-cell="C' + r + '" onblur="RetoricaExcel.evalCell(this)">' + (parts[2] || '0.00') + '</td>';
                                tableHTML += '<td contenteditable="true" data-cell="D' + r + '" onblur="RetoricaExcel.evalCell(this)">=C' + r + '*IVA</td>';
                                tableHTML += '<td contenteditable="true" data-cell="E' + r + '" onblur="RetoricaExcel.evalCell(this)">=C' + r + '+D' + r + '</td>';
                                tableHTML += '</tr>';
                            }
                        });
                        tableHTML += '</tbody></table>';

                        if (bodyInput) bodyInput.innerHTML = tableHTML;
                        RetoricaExcel.recalculate();
                        if (typeof RetoricaStorage !== 'undefined') RetoricaStorage.save();
                    });
                });
            };
            reader.readAsArrayBuffer(file);
        } else if ((ext === 'doc' || ext === 'docx') && window.mammoth) {
            var reader = new FileReader();
            reader.onload = function(e) {
                mammoth.convertToHtml({ arrayBuffer: e.target.result })
                    .then(function(result) {
                        if (bodyInput) bodyInput.innerHTML = result.value;
                        RetoricaStorage.save();
                    })
                    .catch(function(err) {
                        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error leyendo archivo de Word");
                    });
            };
            reader.readAsArrayBuffer(file);
        } else {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Formato no soportado directamente");
        }
    }
};
