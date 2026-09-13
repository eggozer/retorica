// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js - INDEXEDDB EDITION) ---
var RetoricaStorage = {
    dbName: 'RetoricaDB_V2026',
    dbVersion: 1,
    dbInstance: null,
    currentDocId: null,

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
                    lang: (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.currentLang) ? RetoricaI18n.currentLang : 'es',
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
                    lang: (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.currentLang) ? RetoricaI18n.currentLang : 'es',
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
        var bodyInput = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');
        
        // Validación UX: Evita borrado accidental si hay contenido activo
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
                    
                    // Cierre explícito para evitar alternancia involuntaria del menú
                    if (typeof RetoricaUI.closeSidebar === 'function') {
                        RetoricaUI.closeSidebar();
                    }
                }
            }
        });
    },

    pendingDeletion: null,

    deleteDoc: function(id, event) {
        if (event) event.stopPropagation();
        var self = this;

        // Obtener el documento antes de removerlo temporalmente
        this.getDocById(id, function(doc) {
            if (!doc) return;

            // Almacenar respaldo en memoria
            self.pendingDeletion = {
                doc: doc,
                timer: setTimeout(function() {
                    // Confirmación definitiva tras 10 segundos
                    self.finalizeDelete(id);
                }, 10000)
            };

            // Ocultar de IndexedDB inmediatamente para respuesta visual rápida
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
        });
    },

    undoDelete: function() {
        if (!this.pendingDeletion) return;

        clearTimeout(this.pendingDeletion.timer);
        var restoredDoc = this.pendingDeletion.doc;
        var self = this;

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
        toast.innerHTML = '<span>Documento eliminado</span><button onclick="RetoricaStorage.undoDelete()">DESHACER</button>';
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

            // Renderizado con menú superior de 3 puntos y botones redondos 3D fosforescentes
            card.innerHTML = 
                '<div class="card-template-header">' +
                    '<div class="card-template-title">' + self.escapeHTML(doc.title || 'Sin Título') + '</div>' +
                    '<button type="button" class="btn-more-actions" onclick="RetoricaStorage.toggleCardMenu(\'' + doc.id + '\', event)">⋮</button>' +
                '</div>' +
                '<div class="card-template-body">' + self.escapeHTML(plainText || 'Documento vacío...') + '</div>' +
                '<div class="card-template-actions" id="actions-' + doc.id + '">' +
                    
                    '<!-- EDITAR -->' +
                    '<div class="card-action-wrapper">' +
                        '<button type="button" class="btn-round-mini" onclick="RetoricaStorage.renameDoc(\'' + doc.id + '\', event)">✏️</button>' +
                        '<div class="btn-mini-label">Editar</div>' +
                    '</div>' +

                    '<!-- COPIAR (Con indicador fosforescente activo) -->' +
                    '<div class="card-action-wrapper">' +
                        '<button type="button" class="btn-round-mini active" onclick="RetoricaStorage.copyDoc(\'' + doc.id + '\', event)">📋</button>' +
                        '<div class="btn-mini-label">Copiar</div>' +
                    '</div>' +

                    '<!-- COMPARTIR (Con desplazamiento de 2 palabras) -->' +
                    '<div class="card-action-wrapper">' +
                        '<button type="button" class="btn-round-mini" onclick="RetoricaStorage.shareDoc(\'' + doc.id + '\', event)">🔗</button>' +
                        '<div class="btn-mini-label"><span class="scroll-txt">Enviar Enlace</span></div>' +
                    '</div>' +

                    '<!-- BORRAR -->' +
                    '<div class="card-action-wrapper">' +
                        '<button type="button" class="btn-round-mini" style="color:#ef4444 !important;" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)">🗑️</button>' +
                        '<div class="btn-mini-label">Borrar</div>' +
                    '</div>' +

                '</div>';

            fragment.appendChild(card);
        });
        container.appendChild(fragment);
    });
},

// Método para alternar el menú desplegable de 3 puntos
toggleCardMenu: function(id, event) {
    if (event) event.stopPropagation();
    
    // Ocultar cualquier otro menú abierto
    var allMenus = document.querySelectorAll('.card-template-actions');
    allMenus.forEach(function(menu) {
        if (menu.id !== 'actions-' + id) {
            menu.classList.remove('visible');
        }
    });

    var targetMenu = document.getElementById('actions-' + id);
    if (targetMenu) {
        targetMenu.classList.toggle('visible');
    }
}

    renameDoc: function(id, event) {
        if (event) event.stopPropagation();
        var self = this;
        this.getDocById(id, function(doc) {
            if (!doc) return;
            var newTitle = prompt("Ingresa el nuevo título para este documento:", doc.title || "");
            if (newTitle !== null && newTitle.trim() !== "") {
                doc.title = newTitle.trim();
                doc.updatedAt = new Date().toISOString();

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
                    var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                    var store = transaction.objectStore('documents');
                    docs.forEach(function(doc) { store.put(doc); });

                    transaction.oncomplete = function() {
                        self.refreshLibrary();
                        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Copia de seguridad restaurada ✓");
                    };
                }
            } catch (err) {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Archivo de respaldo inválido");
            }
        };
        reader.readAsText(file);
    }
};
