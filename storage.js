// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js) ---
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
            navigator.storage.persist().catch(function(e) {
                console.warn("Persistencia no disponible:", e);
            });
        }

        if (this.dbInstance) {
            if (callback) callback();
            return;
        }

        var self = this;
        var request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = function(e) {
            console.error("Error IndexedDB:", e);
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("Error en almacenamiento local");
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
                var store = db.createObjectStore('documents', { keyPath: 'id' });
                store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
        };
    },

    save: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        var title = titleInput ? titleInput.value.trim() : '';
        var content = bodyInput ? bodyInput.innerText : '';

        if (!title && !content.trim()) return;
        if (!title) title = 'Nota ' + new Date().toLocaleDateString();

        var self = this;
        this.initDB(function() {
            if (!self.dbInstance) return;

            if (!self.currentDocId) {
                self.currentDocId = 'doc_' + Date.now();
            }

            var docData = {
                id: self.currentDocId,
                title: title,
                content: content,
                updatedAt: new Date().getTime()
            };

            var tx = self.dbInstance.transaction(['documents'], 'readwrite');
            var store = tx.objectStore('documents');
            store.put(docData);

            tx.oncomplete = function() {
                localStorage.setItem('retorica_last_doc_id', self.currentDocId);
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.notify("Guardado ✓");
                }
            };
        });
    },

    loadDoc: function(id) {
        var self = this;
        this.initDB(function() {
            if (!self.dbInstance) return;

            var tx = self.dbInstance.transaction(['documents'], 'readonly');
            var store = tx.objectStore('documents');
            var request = store.get(id);

            request.onsuccess = function() {
                var doc = request.result;
                if (doc) {
                    self.currentDocId = doc.id;
                    var titleInput = document.getElementById('editor-title');
                    var bodyInput = document.getElementById('editor-body');

                    if (titleInput) titleInput.value = doc.title || '';
                    if (bodyInput) bodyInput.innerText = doc.content || '';

                    localStorage.setItem('retorica_last_doc_id', doc.id);
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                    }
                }
            };
        });
    },

    newDoc: function() {
        this.currentDocId = null;
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        if (titleInput) titleInput.value = '';
        if (bodyInput) bodyInput.innerText = '';

        localStorage.removeItem('retorica_last_doc_id');
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.notify("Nuevo documento listo");
        }
    },

    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        var bodyInput = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');

        reader.onload = function(e) {
            if (bodyInput) bodyInput.innerText = e.target.result;
            if (titleInput && !titleInput.value) {
                titleInput.value = file.name.replace(/\.[^/.]+$/, "");
            }
            RetoricaStorage.save();
        };

        // Lectura limpia de texto plano
        reader.readAsText(file);
    }
};
