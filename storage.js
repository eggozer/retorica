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
            var textToCopy = (doc.title ? doc.title + "\n\n" : "") + (doc.body || "");
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
            var shareData = {
                title: doc.title || 'Documento Retórica',
                text: (doc.title ? doc.title + "\n\n" : "") + (doc.body || "")
            };

            if (navigator.share) {
                navigator.share(shareData).catch(function(err) {
                    console.log("Compartir cancelado o no soportado:", err);
                });
            } else {
                RetoricaStorage.copyDoc(id, null);
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.notify("Compartir no soportado: Copiado al portapapeles ✓");
                }
            }
        });
    },
    
    // REEMPLAZO DE LA FUNCIÓN refreshLibrary EN storage.js
refreshLibrary: function() {
    var self = this;
    var container = document.getElementById('docs-list-render');
    if (!container) return;

    this.getAllDocs(function(docs) {
        container.innerHTML = '';
        if (!docs || docs.length === 0) {
            container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); font-size:0.8rem; padding:20px;">Sin documentos guardados</div>';
            return;
        }

        var p = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) 
                ? RetoricaI18n.db[RetoricaI18n.currentLang] 
                : { del: 'BORRAR', copyCard: 'COPIAR', share: 'COMPARTIR' };

        docs.sort(function(a, b) {
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });

        docs.forEach(function(doc) {
            var card = document.createElement('div');
            card.className = 'card-template';
            card.onclick = function() { self.loadDoc(doc.id); };

            var title = document.createElement('div');
            title.className = 'card-template-title';
            title.innerText = doc.title || 'Sin Título';

            var cleanBody = (doc.body || '').replace(/<[^>]*>?/gm, '');
            var body = document.createElement('div');
            body.className = 'card-template-body';
            body.innerText = cleanBody || 'Vacio...';

            var actions = document.createElement('div');
            actions.className = 'card-template-actions';
            actions.style.display = 'flex';
            actions.style.justifyContent = 'space-around';
            actions.style.alignItems = 'center';

            // Botón 3D Redondo - Copiar
            var btnCopyWrapper = document.createElement('div');
            btnCopyWrapper.className = 'btn-wrapper-3d';
            btnCopyWrapper.style.width = '40px';
            btnCopyWrapper.innerHTML = '<button type="button" class="btn-round-3d card-btn-copy" style="width:36px!important;height:36px!important;" title="' + p.copyCard + '"><span class="icon-raw">📋</span></button>';
            btnCopyWrapper.onclick = function(e) { self.copyDoc(doc.id, e); };

            // Botón 3D Redondo - Compartir / Exportar
            var btnShareWrapper = document.createElement('div');
            btnShareWrapper.className = 'btn-wrapper-3d';
            btnShareWrapper.style.width = '40px';
            btnShareWrapper.innerHTML = '<button type="button" class="btn-round-3d card-btn-share" style="width:36px!important;height:36px!important;" title="' + p.share + '"><span class="icon-raw">🔗</span></button>';
            btnShareWrapper.onclick = function(e) { self.shareDoc(doc.id, e); };

            // Botón 3D Redondo - Eliminar
            var btnDelWrapper = document.createElement('div');
            btnDelWrapper.className = 'btn-wrapper-3d';
            btnDelWrapper.style.width = '40px';
            btnDelWrapper.innerHTML = '<button type="button" class="btn-round-3d card-btn-delete" style="width:36px!important;height:36px!important;" title="' + p.del + '"><span class="icon-raw">🗑️</span></button>';
            btnDelWrapper.onclick = function(e) { self.deleteDoc(doc.id, e); };

            actions.appendChild(btnCopyWrapper);
            actions.appendChild(btnShareWrapper);
            actions.appendChild(btnDelWrapper);

            card.appendChild(title);
            card.appendChild(body);
            card.appendChild(actions);

            container.appendChild(card);
        });
    });
}

    syncWithCloud: function() {
        if (typeof window.retoricaActiveUser === 'undefined' || !window.retoricaActiveUser) return;
        var activeUid = window.retoricaActiveUser;

        this.getAllDocs(async function(docs) {
            try {
                var plainData = JSON.stringify(docs);
                var encryptedData = await RetoricaCrypto.encryptData(plainData, activeUid);
                localStorage.setItem('ret_cloud_sync_' + activeUid, encryptedData);
            } catch (err) {
                console.error("Error en sincronización encriptada:", err);
            }
        });
    },

    manualSync: function() {
        if (typeof window.retoricaActiveUser === 'undefined' || !window.retoricaActiveUser) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Inicia sesión para sincronizar.");
            return;
        }

        var activeUid = window.retoricaActiveUser;
        var encryptedCloud = localStorage.getItem('ret_cloud_sync_' + activeUid);
        if (!encryptedCloud) {
            this.syncWithCloud();
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Respaldo local sincronizado.");
            return;
        }

        var self = this;
        RetoricaCrypto.decryptData(encryptedCloud, activeUid).then(function(plainJson) {
            try {
                var cloudDocs = JSON.parse(plainJson);
                if (Array.isArray(cloudDocs)) {
                    self.initDB(function() {
                        var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                        var store = transaction.objectStore('documents');
                        cloudDocs.forEach(function(doc) { store.put(doc); });
                        transaction.oncomplete = function() {
                            self.refreshLibrary();
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Sincronización manual exitosa ✓");
                        };
                    });
                }
            } catch (e) {
                console.error("Fallo al descifrar paquete de sincronización:", e);
            }
        });
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
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Respaldo importado ✓");
                        };
                    });
                }
            } catch (err) {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Archivo de respaldo inválido.");
            }
        };
        reader.readAsText(file);
    },

    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        var ext = file.name.split('.').pop().toLowerCase();

        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        if (titleInput) titleInput.value = nameWithoutExt;

        if (ext === 'txt' || ext === 'html') {
            var reader = new FileReader();
            reader.onload = function(e) {
                if (bodyInput) bodyInput.innerHTML = e.target.result;
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
            };
            reader.readAsText(file);
        } else if (ext === 'pdf') {
            var fileReader = new FileReader();
            fileReader.onload = function() {
                var typedarray = new Uint8Array(this.result);
                if (window['pdfjs-dist/build/pdf']) {
                    window['pdfjs-dist/build/pdf'].getDocument(typedarray).promise.then(function(pdf) {
                        var maxPages = pdf.numPages;
                        var countPromises = [];
                        for (var i = 1; i <= maxPages; i++) {
                            countPromises.push(pdf.getPage(i).then(function(page) {
                                return page.getTextContent().then(function(textContent) {
                                    return textContent.items.map(function(item) { return item.str; }).join(' ');
                                });
                            }));
                        }
                        Promise.all(countPromises).then(function(texts) {
                            if (bodyInput) bodyInput.innerHTML = texts.join('<br><br>');
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
                        });
                    });
                }
            };
            fileReader.readAsArrayBuffer(file);
        } else if (ext === 'docx' || ext === 'doc') {
            var readerDoc = new FileReader();
            readerDoc.onload = function(e) {
                if (typeof mammoth !== 'undefined') {
                    mammoth.convertToHtml({ arrayBuffer: e.target.result }).then(function(result) {
                        if (bodyInput) bodyInput.innerHTML = result.value;
                        if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
                    });
                }
            };
            readerDoc.readAsArrayBuffer(file);
        }
    }
};
