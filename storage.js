// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js - DUAL STORAGE EDITION) ---
var RetoricaStorage = {
    dbName: 'RetoricaDB_V2026',
    dbVersion: 1,
    dbInstance: null,
    currentDocId: null,
    pendingDeletion: null,

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
            self.recoverFromLocalStorageFallback(callback);
        };

        request.onsuccess = function(e) {
            self.dbInstance = e.target.result;
            // Verificar si IndexedDB está vacío pero hay respaldo en localStorage
            self.getAllDocs(function(docs) {
                if ((!docs || docs.length === 0)) {
                    self.restoreFromLocalStorageFallback(function() {
                        if (callback) callback();
                    });
                } else {
                    if (callback) callback();
                }
            });
        };

        request.onupgradeneeded = function(e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains('documents')) {
                db.createObjectStore('documents', { keyPath: 'id' });
            }
        };
    },

    // Respaldo de emergencia en localStorage por si IndexedDB se borra al limpiar caché
    saveToLocalStorageFallback: function(docData) {
        try {
            var backupList = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
            var index = backupList.findIndex(function(d) { return d.id === docData.id; });
            if (index >= 0) {
                backupList[index] = docData;
            } else {
                backupList.push(docData);
            }
            localStorage.setItem('retorica_fallback_docs', JSON.stringify(backupList));
        } catch (err) {
            console.warn("No se pudo guardar en el respaldo de localStorage", err);
        }
    },

    recoverFromLocalStorageFallback: function(callback) {
        var self = this;
        try {
            var backupList = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
            if (backupList.length > 0 && self.dbInstance) {
                var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                var store = transaction.objectStore('documents');
                backupList.forEach(function(doc) {
                    store.put(doc);
                });
                transaction.oncomplete = function() {
                    console.log("Biblioteca recuperada desde el respaldo de localStorage.");
                };
            }
        } catch (err) {
            console.error("Error al recuperar respaldo de localStorage", err);
        }
        if (callback) callback();
    },

    restoreFromLocalStorageFallback: function(callback) {
        var self = this;
        try {
            var backupList = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
            if (backupList.length > 0 && self.dbInstance) {
                var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                var store = transaction.objectStore('documents');
                backupList.forEach(function(doc) {
                    store.put(doc);
                });
                transaction.oncomplete = function() {
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.notify("Biblioteca restaurada tras limpieza de caché ✓");
                    }
                    self.refreshLibrary();
                    if (callback) callback();
                    return;
                };
            }
        } catch (err) {
            console.error("Error restaurando fallback", err);
        }
        if (callback) callback();
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
                    lang: (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.currentLang) ? RetoricaI18n.currentLang : 'es',
                    createdAt: createdAt,
                    updatedAt: nowStr
                };

                // Guardar respaldo inmediato en localStorage para evitar pérdidas por borrado de caché
                self.saveToLocalStorageFallback(docData);

                if (!self.dbInstance) {
                    localStorage.setItem('retorica_last_doc_id', self.currentDocId);
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.notify("Guardado en respaldo local ✓");
                    }
                    self.refreshLibrary();
                    return;
                }

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
                    lang: (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.currentLang) ? RetoricaI18n.currentLang : 'es',
                    createdAt: createdAt,
                    updatedAt: nowStr
                };

                self.saveToLocalStorageFallback(docData);

                if (self.dbInstance) {
                    var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                    var store = transaction.objectStore('documents');
                    store.put(docData);
                }
                localStorage.setItem('retorica_last_doc_id', self.currentDocId);
            });
        });
    },

    getDocById: function(id, callback) {
        if (!this.dbInstance) { 
            // Buscar primero en el respaldo local si IndexedDB no está listo
            try {
                var backupList = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
                var found = backupList.find(function(d) { return d.id === id; });
                if (found) {
                    callback(found);
                    return;
                }
            } catch (e) {}

            this.initDB(function() {
                RetoricaStorage.getDocById(id, callback);
            });
            return; 
        }
        var transaction = this.dbInstance.transaction(['documents'], 'readonly');
        var store = transaction.objectStore('documents');
        var request = store.get(id);

        request.onsuccess = function(e) {
            var res = e.target.result;
            if (!res) {
                try {
                    var backupList = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
                    res = backupList.find(function(d) { return d.id === id; }) || null;
                } catch (err) {}
            }
            callback(res);
        };
        request.onerror = function() {
            callback(null);
        };
    },

    getAllDocs: function(callback) {
        if (!this.dbInstance) {
            try {
                var backupList = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
                if (backupList.length > 0) {
                    callback(backupList);
                    return;
                }
            } catch (e) {}

            this.initDB(function() {
                RetoricaStorage.getAllDocs(callback);
            });
            return;
        }
        var transaction = this.dbInstance.transaction(['documents'], 'readonly');
        var store = transaction.objectStore('documents');
        var request = store.getAll();

        request.onsuccess = function(e) {
            var results = e.target.result || [];
            if (results.length === 0) {
                try {
                    results = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
                } catch (err) {}
            }
            callback(results);
        };
        request.onerror = function() {
            var fallback = [];
            try {
                fallback = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
            } catch (err) {}
            callback(fallback);
        };
    },

    createNewDoc: function() {
        var bodyInput = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');
        
        if (bodyInput && (bodyInput.innerText || bodyInput.textContent || "").trim().length > 0) {
            if (!confirm("¿Deseas iniciar un nuevo lienzo? Se limpiará el texto no guardado de la pantalla.")) {
                return;
            }
        }

        this.currentDocId = 'doc_' + Date.now();
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
                    
                    if (typeof RetoricaUI.closeSidebar === 'function') {
                        RetoricaUI.closeSidebar();
                    }
                }
            }
        });
    },

    deleteDoc: function(id, event) {
        if (event) event.stopPropagation();
        var self = this;

        this.getDocById(id, function(doc) {
            if (!doc) return;

            self.pendingDeletion = {
                doc: doc,
                timer: setTimeout(function() {
                    self.finalizeDelete(id);
                }, 10000)
            };

            // Eliminar de localStorage fallback también
            try {
                var backupList = JSON.parse(localStorage.getItem('retorica_fallback_docs') || '[]');
                backupList = backupList.filter(function(d) { return d.id !== id; });
                localStorage.setItem('retorica_fallback_docs', JSON.stringify(backupList));
            } catch (e) {}

            if (self.dbInstance) {
                var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                var store = transaction.objectStore('documents');
                store.delete(id);

                transaction.oncomplete = function() {
                    if (self.currentDocId === id) {
                        self.createNewDoc();
                    }
                    self.refreshLibrary();
                    self.showUndoToast();
                };
            } else {
                if (self.currentDocId === id) {
                    self.createNewDoc();
                }
                self.refreshLibrary();
                self.showUndoToast();
            }
        });
    },

    undoDelete: function() {
        if (!this.pendingDeletion) return;

        clearTimeout(this.pendingDeletion.timer);
        var restoredDoc = this.pendingDeletion.doc;
        var self = this;

        self.saveToLocalStorageFallback(restoredDoc);

        if (this.dbInstance) {
            var transaction = this.dbInstance.transaction(['documents'], 'readwrite');
            var store = transaction.objectStore('documents');
            store.put(restoredDoc);

            transaction.oncomplete = function() {
                self.pendingDeletion = null;
                self.removeUndoToast();
                self.loadDoc(restoredDoc.id);
                self.refreshLibrary();
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.notify("Documento restaurado ✓");
                }
            };
        } else {
            self.pendingDeletion = null;
            self.removeUndoToast();
            self.loadDoc(restoredDoc.id);
            self.refreshLibrary();
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("Documento restaurado ✓");
            }
        }
    },

    finalizeDelete: function(id) {
        this.pendingDeletion = null;
        this.removeUndoToast();
    },

    showUndoToast: function() {
        this.removeUndoToast();
        var toast = document.createElement('div');
        toast.id = 'undo-toast-banner';
        toast.className = 'undo-toast-banner';
        toast.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:4px; z-index:9999; display:flex; align-items:center; gap:15px;";
        toast.innerHTML = '<span>Documento eliminado</span><button type="button" onclick="RetoricaStorage.undoDelete()" style="background:#ffc107; border:none; padding:5px 10px; cursor:pointer; font-weight:bold; border-radius:3px;">DESHACER</button>';
        document.body.appendChild(toast);
    },

    removeUndoToast: function() {
        var elem = document.getElementById('undo-toast-banner');
        if (elem && elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
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

            var fragment = document.createDocumentFragment();
            docs.forEach(function(doc) {
                var card = document.createElement('div');
                card.className = 'card-template';
                card.onclick = function() { self.loadDoc(doc.id); };

                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = doc.body || '';
                var plainText = tempDiv.innerText || tempDiv.textContent || '';

                card.innerHTML = 
                    '<div class="card-template-title">' + self.escapeHTML(doc.title || 'Sin Título') + '</div>' +
                    '<div class="card-template-body">' + self.escapeHTML(plainText || 'Documento vacío...') + '</div>' +
                    '<div class="card-template-actions">' +
                        '<button type="button" class="btn-action-tmpl" onclick="RetoricaStorage.renameDoc(\'' + doc.id + '\', event)">EDITAR TÍTULO</button>' +
                        '<button type="button" class="btn-action-tmpl card-btn-copy" onclick="RetoricaStorage.copyDoc(\'' + doc.id + '\', event)">COPIAR</button>' +
                        '<button type="button" class="btn-action-tmpl card-btn-share" onclick="RetoricaStorage.shareDoc(\'' + doc.id + '\', event)">COMPARTIR</button>' +
                        '<button type="button" class="btn-action-tmpl card-btn-delete" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)">BORRAR</button>' +
                    '</div>';

                fragment.appendChild(card);
            });
            container.appendChild(fragment);
        });
    },

    renameDoc: function(id, event) {
        if (event) event.stopPropagation();
        var self = this;
        this.getDocById(id, function(doc) {
            if (!doc) return;
            var newTitle = prompt("Ingresa el nuevo título para este documento:", doc.title || "");
            if (newTitle !== null && newTitle.trim() !== "") {
                doc.title = newTitle.trim();
                doc.updatedAt = new Date().toISOString();

                self.saveToLocalStorageFallback(doc);

                if (self.dbInstance) {
                    var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                    var store = transaction.objectStore('documents');
                    store.put(doc);

                    transaction.oncomplete = function() {
                        if (self.currentDocId === id) {
                            var titleInput = document.getElementById('editor-title');
                            if (titleInput) titleInput.value = doc.title;
                        }
                        self.refreshLibrary();
                        if (typeof RetoricaUI !== 'undefined') {
                            RetoricaUI.notify("Título actualizado ✓");
                        }
                    };
                } else {
                    if (self.currentDocId === id) {
                        var titleInput = document.getElementById('editor-title');
                        if (titleInput) titleInput.value = doc.title;
                    }
                    self.refreshLibrary();
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.notify("Título actualizado ✓");
                    }
                }
            }
        });
    },

    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            var content = e.target.result;
            var titleInput = document.getElementById('editor-title');
            var bodyInput = document.getElementById('editor-body');

            if (titleInput) titleInput.value = file.name.replace(/\.[^/.]+$/, "");
            if (bodyInput) bodyInput.innerText = content;

            RetoricaStorage.currentDocId = 'doc_' + Date.now();
            RetoricaStorage.save();
        };
        reader.readAsText(file);
    },

    manualSync: function() {
        this.save();
    },

    syncWithCloud: function() {
        // Reservado para futuras integraciones remotas
    },

    exportBackup: function() {
        this.getAllDocs(function(docs) {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(docs));
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
                    docs.forEach(function(doc) {
                        self.saveToLocalStorageFallback(doc);
                    });

                    if (self.dbInstance) {
                        var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                        var store = transaction.objectStore('documents');
                        docs.forEach(function(doc) { store.put(doc); });

                        transaction.oncomplete = function() {
                            self.refreshLibrary();
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Copia de seguridad restaurada ✓");
                        };
                    } else {
                        self.refreshLibrary();
                        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Copia de seguridad restaurada ✓");
                    }
                }
            } catch (err) {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Archivo de respaldo inválido");
            }
        };
        reader.readAsText(file);
    }
};
