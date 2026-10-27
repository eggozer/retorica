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

    // ==========================================
    // SECCIÓN 1: INICIALIZACIÓN DE INDEXEDDB Y PERSISTENCIA
    // ==========================================
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

    // ==========================================
    // SECCIÓN 2: GUARDADO Y AUTOGUARDADO DE DOCUMENTOS
    // ==========================================
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

    // ==========================================
    // SECCIÓN 3: CONSULTA, CARGA Y GESTIÓN DE LIENZOS
    // ==========================================
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

        this.currentDocId = 'doc_' + Date.now();
        if (titleInput) titleInput.value = '';
        if (bodyInput) bodyInput.innerHTML = '';

        localStorage.removeItem('retorica_last_doc_id');

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
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

    // ==========================================
    // SECCIÓN 4: ELIMINACIÓN SEGURA Y SISTEMA DE "DESHACER" / "CONTINUAR"
    // ==========================================
    pendingDeletion: null,

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
        
        var svgUndo = '<svg class="svg-retorica-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>';
        var svgPlay = '<svg class="svg-retorica-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
       
        toast.innerHTML = 
            '<span>Documento eliminado</span>' +
            '<div class="btn-wrapper-3d">' +
                '<button type="button" class="btn-round-3d undo-standby" onclick="RetoricaStorage.triggerUndoPress(this)" title="Deshacer borrado" aria-label="Deshacer borrado">' +
                    svgUndo +
                '</button>' +
                '<div class="btn-label-3d"><span class="scroll-txt-fast">Deshacer</span></div>' +
            '</div>' +
            '<div class="btn-wrapper-3d">' +
                '<button type="button" class="btn-round-3d undo-standby" onclick="RetoricaStorage.triggerConfirmDeletePress(this)" title="Continuar y autorizar borrado" aria-label="Continuar y autorizar borrado">' +
                    svgPlay +
                '</button>' +
                '<div class="btn-label-3d"><span class="scroll-txt-fast">Continuar</span></div>' +
            '</div>';
            
        document.body.appendChild(toast);

        // Aplicar la misma posición guardada del submenú anterior
        if (typeof window.RetoricaDragManager !== 'undefined') {
            window.RetoricaDragManager.initElement(toast);
        } else {
            let savedX = localStorage.getItem('retorica_menu_pos_x');
            let savedY = localStorage.getItem('retorica_menu_pos_y');
            if (savedX !== null && savedY !== null) {
                toast.style.left = savedX + 'px';
                toast.style.top = savedY + 'px';
                toast.style.transform = 'none';
            }
        }
    },

    triggerUndoPress: function(btnElem) {
        if (!btnElem) return;
        btnElem.classList.remove('undo-standby');
        btnElem.style.animation = 'none';
        btnElem.offsetHeight;
        btnElem.style.animation = 'flash-yellow-burst 0.4s ease-in-out 2 !important';
        
        setTimeout(function() {
            RetoricaStorage.undoDelete();
        }, 300);
    },

    triggerConfirmDeletePress: function(btnElem) {
        if (!btnElem) return;
        btnElem.classList.remove('undo-standby');
        btnElem.style.animation = 'none';
        btnElem.offsetHeight;
        btnElem.style.animation = 'flash-yellow-burst 0.4s ease-in-out 2 !important';

        var self = this;
        setTimeout(function() {
            if (self.pendingDeletion) {
                clearTimeout(self.pendingDeletion.timer);
                self.finalizeDelete(self.pendingDeletion.doc.id);
            } else {
                self.removeUndoToast();
            }
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("Borrado confirmado ✓");
            }
        }, 300);
    },

    removeUndoToast: function() {
        var elem = document.getElementById('undo-toast-banner');
        if (elem && elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    },

    // ==========================================
    // SECCIÓN 5: ACCESOS RÁPIDOS, COPIA Y COMPARTICIÓN
    // ==========================================
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

    // ==========================================
    // SECCIÓN 6: RENDERIZADO DE BIBLIOTECA LATERAL Y BACKUPS
    // ==========================================
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
            
var svgEdit = '<svg class="svg-retorica-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
var svgCopy = '<svg class="svg-retorica-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
var svgShare = '<svg class="svg-retorica-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>';
var svgDelete = '<svg class="svg-retorica-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
var svgDots = '<svg class="svg-retorica-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>';
 
                        var fragment = document.createDocumentFragment();
            docs.forEach(function(doc) {
                var card = document.createElement('div');
                var isActive = (doc.id === self.currentDocId);
                
                card.className = 'card-template' + (isActive ? ' active-template-indicator' : '');
                
                card.onclick = function(e) {
                    if (!e.target.closest('.card-template-actions') && !e.target.closest('.card-menu-btn')) {
                        self.loadDoc(doc.id);
                    }
                };

                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = doc.body || '';
                var plainText = tempDiv.innerText || tempDiv.textContent || '';

                var createdStr = doc.createdAt ? new Date(doc.createdAt).toLocaleString() : 'N/A';
                var updatedStr = doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : 'N/A';

                var btnActiveClass = isActive ? ' active-card-btn' : '';

                card.innerHTML = 
                    '<button type="button" class="card-menu-btn' + btnActiveClass + '" onclick="RetoricaStorage.toggleCardMenu(\'' + doc.id + '\', event)" title="Opciones">' + svgDots + '</button>' +
                    '<div class="card-template-title">' + self.escapeHTML(doc.title || 'Sin Título') + '</div>' +
                    '<div class="card-template-body">' + self.escapeHTML(plainText || 'Documento vacío...') + '</div>' +
                    '<div style="font-size:0.55rem; color:var(--text-muted); margin-bottom:6px; text-align:center;">Creado: ' + createdStr + '<br>Modificado: ' + updatedStr + '</div>' +
                    '<div id="actions-menu-' + doc.id + '" class="card-template-actions">' +
                        '<div class="card-action-wrapper">' +
                            '<button type="button" class="btn-action-tmpl" onclick="RetoricaStorage.renameDoc(\'' + doc.id + '\', event)">' + svgEdit + '</button>' +
                            '<div class="card-action-label"><span class="scroll-txt">Editar Título</span></div>' +
                        '</div>' +
                        '<div class="card-action-wrapper">' +
                            '<button type="button" class="btn-action-tmpl" onclick="RetoricaStorage.copyDoc(\'' + doc.id + '\', event)">' + svgCopy + '</button>' +
                            '<div class="card-action-label">Copiar</div>' +
                        '</div>' +
                        '<div class="card-action-wrapper">' +
                            '<button type="button" class="btn-action-tmpl" onclick="RetoricaStorage.shareDoc(\'' + doc.id + '\', event)">' + svgShare + '</button>' +
                            '<div class="card-action-label"><span class="scroll-txt">Compartir</span></div>' +
                        '</div>' +
                        '<div class="card-action-wrapper">' +
                            '<button type="button" class="btn-action-tmpl" style="color: #ef4444 !important;" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)">' + svgDelete + '</button>' +
                            '<div class="card-action-label">Borrar</div>' +
                        '</div>' +
                    '</div>';

                fragment.appendChild(card);
            });
            container.appendChild(fragment);
        });
    },

    toggleCardMenu: function(id, event) {
        if (event) event.stopPropagation();
        
        var allMenus = document.querySelectorAll('.card-template-actions');
        allMenus.forEach(function(menu) {
            if (menu.id !== 'actions-menu-' + id) {
                menu.classList.remove('visible');
            }
        });

        var menuElem = document.getElementById('actions-menu-' + id);
        if (menuElem) {
            menuElem.classList.toggle('visible');
            if (menuElem.classList.contains('visible') && typeof window.RetoricaDragManager !== 'undefined') {
                window.RetoricaDragManager.initElement(menuElem);
            }
        }
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
