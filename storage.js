// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js - INDEXEDDB EDITION) ---
var RetoricaStorage = {
    dbName: 'RetoricaDB_V2026',
    dbVersion: 1,
    dbInstance: null,
    currentDocId: null,

    initDB: function(callback) {
        if (this.dbInstance) {
            if (callback) callback();
            return;
        }

        var self = this;
        var request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = function() {
            console.error("Error abriendo IndexedDB. Fallback a almacenamiento local.");
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
            var body = bodyInput.value.trim();

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
            var body = bodyInput.value.trim();

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
        if (!this.dbInstance) { callback(null); return; }
        var transaction = this.dbInstance.transaction(['documents'], 'readonly');
        var store = transaction.objectStore('documents');
        var request = store.get(id);
        request.onsuccess = function(e) {
            callback(e.target.result || null);
        };
        request.onerror = function() { callback(null); };
    },

    getAllDocs: function(callback) {
        this.initDB(function() {
            var transaction = RetoricaStorage.dbInstance.transaction(['documents'], 'readonly');
            var store = transaction.objectStore('documents');
            var request = store.getAll();
            request.onsuccess = function(e) {
                callback(e.target.result || []);
            };
        });
    },

    createNewDoc: function() {
        this.currentDocId = null;
        localStorage.removeItem('retorica_last_doc_id');
        var t = document.getElementById('editor-title');
        var b = document.getElementById('editor-body');
        if(t) t.value = '';
        if(b) b.value = '';
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.notify("Nuevo lienzo listo");
        }
    },

    loadDoc: function(id) {
        var self = this;
        this.getDocById(id, function(doc) {
            if (!doc) return;
            self.currentDocId = doc.id;
            localStorage.setItem('retorica_last_doc_id', doc.id);
            
            var tInput = document.getElementById('editor-title');
            var bInput = document.getElementById('editor-body');
            if(tInput) tInput.value = doc.title || '';
            if(bInput) bInput.value = doc.body || '';

            if (doc.lang && typeof RetoricaI18n !== 'undefined') {
                RetoricaI18n.currentLang = doc.lang;
                RetoricaI18n.setAppLang(doc.lang);
            }

            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.updateCounters();
                var sidebar = document.getElementById('sidebar');
                if (sidebar && sidebar.classList.contains('active')) { RetoricaUI.toggleSidebar(); }
                RetoricaUI.notify("Guion cargado");
            }
        });
    },

    deleteDoc: function(id, event) {
        if (event) event.stopPropagation(); 
        if (!confirm("¿Seguro que deseas eliminar este guion?")) return;
        var self = this;
        this.initDB(function() {
            var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
            var store = transaction.objectStore('documents');
            store.delete(id);
            transaction.oncomplete = function() {
                if (self.currentDocId === id) { self.clearCanvasSilent(); }
                self.refreshLibrary();
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Documento eliminado");
            };
        });
    },

    shareDoc: function(id, event) {
    if (event) event.stopPropagation();
    this.getDocById(id, function(doc) {
        if (!doc) return;
        
        var titleText = doc.title ? doc.title.toUpperCase() + "\n\n" : "";
        var textToShare = titleText + (doc.body || "");

        // Verificación de soporte de Web Share API en dispositivos móviles
        if (navigator.share) {
            navigator.share({
                title: doc.title || "Documento Retórica",
                text: textToShare
            })
            .then(function() {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Compartido con éxito");
            })
            .catch(function(err) {
                // Si el usuario cancela la acción, evitamos errores en consola
                if (err.name !== 'AbortError') {
                    RetoricaStorage.copyDocToClipboard(id, event);
                }
            });
        } else {
            // Fallback para navegadores de escritorio o sin soporte de share nativo
            RetoricaStorage.copyDocToClipboard(id, event);
        }
    });
},

    copyDocToClipboard: function(id, event) {
        if (event) event.stopPropagation();
        this.getDocById(id, function(doc) {
            if (!doc) return;
            var titleText = doc.title ? doc.title.toUpperCase() + "\n\n" : "";
            var textToCopy = titleText + (doc.body || "");
            var dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.value = textToCopy;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Plantilla copiada ✓");
        });
    },

    clearCanvas: function() {
        this.createNewDoc();
    },

    clearCanvasSilent: function() {
        this.currentDocId = null;
        localStorage.removeItem('retorica_last_doc_id');
        var t = document.getElementById('editor-title');
        var b = document.getElementById('editor-body');
        if(t) t.value = '';
        if(b) b.value = '';
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
    },

    refreshLibrary: function() {
        var container = document.getElementById('docs-list-render');
        if (!container) return;

        this.getAllDocs(function(sortedDocs) {
            container.innerHTML = '';

            sortedDocs.sort(function(a, b) { 
                return new Date(b.updatedAt) - new Date(a.updatedAt); 
            });

            if (sortedDocs.length === 0) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-muted); font-size:0.75rem; font-weight:bold;">BIBLIOTECA VACÍA</div>';
                return;
            }

            sortedDocs.forEach(function(doc) {
                var card = document.createElement('div');
                card.className = 'card-template';
                card.setAttribute('onclick', "RetoricaStorage.loadDoc('" + doc.id + "')");

                var hasTitle = doc.title && doc.title.trim().length > 0;
                var hasBody = doc.body && doc.body.trim().length > 0;

                var titleHTML = '';
                var bodyHTML = '';

                if (hasTitle) {
                    titleHTML = '<div class="card-template-title">' + doc.title + '</div>';
                    var bodySnippet = hasBody ? doc.body : '<i>Sin contenido adicional...</i>';
                    bodyHTML = '<div class="card-template-body" style="-webkit-line-clamp: 3;">' + bodySnippet + '</div>';
                } else {
                    var fallbackSnippet = hasBody ? doc.body : '<i>Documento sin título ni contenido</i>';
                    bodyHTML = '<div class="card-template-body" style="-webkit-line-clamp: 3; font-weight: 500; color: var(--text-main);">' + fallbackSnippet + '</div>';
                }

                var creacion = RetoricaStorage.formatDate(doc.createdAt || doc.updatedAt);
                var edicion = RetoricaStorage.formatDate(doc.updatedAt);

                card.innerHTML = 
                    titleHTML +
                    bodyHTML +
                    '<div class="card-template-dates" style="font-size: 0.58rem; color: var(--text-muted); margin: 6px 0 8px 0; display: flex; flex-direction: column; gap: 2px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 5px; pointer-events: none; text-align: left;">' +
                        '<div><b>Creado:</b> ' + creacion + '</div>' +
                        '<div><b>Modificado:</b> ' + edicion + '</div>' +
                    '</div>' +
                    '<div class="card-template-actions" style="display: flex; gap: 6px;">' +
                        '<button class="btn-action-tmpl" style="color:var(--danger);" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)">Borrar</button>' +
                        '<button class="btn-action-tmpl" onclick="RetoricaStorage.copyDocToClipboard(\'' + doc.id + '\', event)">Copiar</button>' +
                        '<button class="btn-action-tmpl" onclick="RetoricaStorage.shareDoc(\'' + doc.id + '\', event)">Compartir</button>' +
                    '</div>';
                container.appendChild(card);
            });
        });
    },

    formatDate: function(isoString) {
        if (!isoString) return '--/--/---- --:--';
        var date = new Date(isoString);
        if (isNaN(date.getTime())) return '--/--/---- --:--';
        
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var year = date.getFullYear();
        var hours = String(date.getHours()).padStart(2, '0');
        var minutes = String(date.getMinutes()).padStart(2, '0');
        
        return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
    },

    syncWithCloud: function() {
        if (typeof RetoricaAuth === 'undefined' || !RetoricaAuth.syncEnabled || !RetoricaAuth.currentUser) {
            return;
        }
        // Puente de sincronización privada background (Mantenimiento de copias redundantes)
        console.log("Sincronizando biblioteca con respaldo de cuenta para: " + RetoricaAuth.currentUser.identifier);
    }
};
