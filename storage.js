// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js - INDEXEDDB EDITION) ---
var RetoricaStorage = {
    dbName: 'RetoricaDB_V2026',
    dbVersion: 1,
    dbInstance: null,
    currentDocId: null,

    initDB: function(callback) {
        // Solicitar persistencia de almacenamiento nativa para prevenir borrado de caché
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
            if (!RetoricaStorage.dbInstance) {
                callback([]);
                return;
            }
            var transaction = RetoricaStorage.dbInstance.transaction(['documents'], 'readonly');
            var store = transaction.objectStore('documents');
            var request = store.getAll();
            request.onsuccess = function(e) {
                callback(e.target.result || []);
            };
            request.onerror = function() {
                callback([]);
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

            if (navigator.share) {
                navigator.share({
                    title: doc.title || "Documento Retórica",
                    text: textToShare
                })
                .then(function() {
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Compartido con éxito");
                })
                .catch(function(err) {
                    if (err.name !== 'AbortError') {
                        RetoricaStorage.copyDocToClipboard(id, event);
                    }
                });
            } else {
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

    syncWithCloud: async function() {
        if (typeof window.retoricaActiveUser === 'undefined' || !window.retoricaActiveUser) return;
        
        var userId = window.retoricaActiveUser;
        var encodedUid = encodeURIComponent(userId);
        var self = this;

        this.getAllDocs(async function(docs) {
            if (docs.length === 0) return;

            // Cifrado E2EE local de cada documento antes de enviar
            var encryptedDocs = await Promise.all(docs.map(async function(doc) {
                return {
                    id: doc.id,
                    title: await RetoricaCrypto.encryptData(doc.title || '', userId),
                    body: await RetoricaCrypto.encryptData(doc.body || '', userId),
                    lang: doc.lang,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                    isEncrypted: true
                };
            }));

            // Endpoint del backend (ej. Firebase Realtime DB)
            var cloudUrl = 'https://tu-proyecto-firebase.firebaseio.com/users/' + encodedUid + '/docs.json';

            fetch(cloudUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(encryptedDocs)
            })
            .then(function(res) {
                if (res.ok) console.log("Retórica: Respaldo cifrado E2EE guardado con éxito.");
            })
            .catch(function(err) {
                console.error("Error de red en respaldo cifrado", err);
            });
        });
    },

    manualSync: async function() {
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Sincronizando de extremo a extremo...");
        
        if (typeof window.retoricaActiveUser === 'undefined' || !window.retoricaActiveUser) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error: Inicia sesión primero");
            return;
        }
        
        var self = this;
        var userId = window.retoricaActiveUser;
        var encodedUid = encodeURIComponent(userId);
        var cloudUrl = 'https://tu-proyecto-firebase.firebaseio.com/users/' + encodedUid + '/docs.json';

        try {
            var response = await fetch(cloudUrl);
            var rawData = await response.json();

            // Normalización para aceptar tanto Arrays como Objetos de Firebase
            var encryptedDocs = [];
            if (rawData) {
                if (Array.isArray(rawData)) {
                    encryptedDocs = rawData;
                } else if (typeof rawData === 'object') {
                    encryptedDocs = Object.values(rawData);
                }
            }

            if (encryptedDocs.length > 0) {
                // Descifrar cada documento localmente en el dispositivo
                var decryptedDocs = await Promise.all(encryptedDocs.map(async function(doc) {
                    if (doc && doc.isEncrypted) {
                        return {
                            id: doc.id,
                            title: await RetoricaCrypto.decryptData(doc.title || '', userId),
                            body: await RetoricaCrypto.decryptData(doc.body || '', userId),
                            lang: doc.lang || 'es',
                            createdAt: doc.createdAt,
                            updatedAt: doc.updatedAt
                        };
                    }
                    return doc;
                }));

                self.initDB(function() {
                    var transaction = self.dbInstance.transaction(['documents'], 'readwrite');
                    var store = transaction.objectStore('documents');
                    
                    decryptedDocs.forEach(function(doc) {
                        if (doc && doc.id) store.put(doc);
                    });
                    
                    transaction.oncomplete = function() {
                        self.refreshLibrary();
                        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Información restaurada y descifrada ✓");
                    };
                });
            } else {
                // Si la nube está vacía, enviamos el respaldo cifrado local
                self.syncWithCloud();
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Respaldo local cifrado enviado ✓");
            }
        } catch(err) {
            console.error("Error al sincronizar datos cifrados:", err);
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error al conectar con la nube");
        }
    },

    // --- MÓDULO DE IMPORTACIÓN LOCAL DE DOCUMENTOS (PDF, WORD, TXT, HTML) ---
    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var self = this;
        var fileName = file.name.replace(/\.[^/.]+$/, "");
        var ext = file.name.split('.').pop().toLowerCase();

        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Leyendo archivo...");

        if (ext === 'pdf') {
            this.readPdfFile(file, function(extractedText) {
                self.injectAndSaveDoc(fileName, extractedText);
            });
        } else if (ext === 'docx' || ext === 'doc') {
            this.readWordFile(file, function(extractedText) {
                self.injectAndSaveDoc(fileName, extractedText);
            });
        } else {
            var reader = new FileReader();
            reader.onload = function(e) {
                self.injectAndSaveDoc(fileName, e.target.result);
            };
            reader.readAsText(file);
        }

        event.target.value = '';
    },

    readPdfFile: function(file, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var typedarray = new Uint8Array(e.target.result);
            
            // Detección de motor PDF
            var pdfEngine = (typeof pdfjsLib !== 'undefined') ? pdfjsLib : window['pdfjs-dist/build/pdf'];
            
            if (!pdfEngine) {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error: Motor PDF no disponible");
                return;
            }

            var loadingTask = pdfEngine.getDocument({ data: typedarray });
            loadingTask.promise.then(function(pdf) {
                var maxPages = pdf.numPages;
                var pagePromises = [];

                for (var i = 1; i <= maxPages; i++) {
                    pagePromises.push(
                        pdf.getPage(i).then(function(page) {
                            return page.getTextContent().then(function(textContent) {
                                return textContent.items.map(function(item) { return item.str; }).join(' ');
                            });
                        })
                    );
                }

                Promise.all(pagePromises).then(function(pagesText) {
                    var fullText = pagesText.join('\n\n').trim();
                    if (!fullText) {
                        fullText = "[PDF escaneado o sin texto seleccionable detectado]";
                    }
                    callback(fullText);
                });
            }).catch(function(err) {
                console.error("Error al procesar PDF:", err);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error al leer el archivo PDF");
                callback("[Error al extraer texto del archivo PDF]");
            });
        };
        reader.readAsArrayBuffer(file);
    },

    readWordFile: function(file, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var arrayBuffer = e.target.result;
            if (typeof mammoth === 'undefined') {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error: Motor Word no disponible");
                return;
            }
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then(function(result) {
                    var text = (result && result.value) ? result.value.trim() : "";
                    if (!text) {
                        text = "[Documento Word sin texto detectable]";
                    }
                    callback(text);
                })
                .catch(function(err) {
                    console.error("Error al leer Word:", err);
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error al procesar archivo Word");
                    callback("[Error al extraer texto de Word]");
                });
        };
        reader.readAsArrayBuffer(file);
    },

    injectAndSaveDoc: function(title, body) {
        this.createNewDoc();
        var tInput = document.getElementById('editor-title');
        var bInput = document.getElementById('editor-body');

        if (tInput) tInput.value = title || 'Documento Importado';
        if (bInput) bInput.value = body || '';

        this.save();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Documento importado con éxito ✓");
    }
};
