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

    // ==========================================
    // SECCIÓN 4: ELIMINACIÓN SEGURA Y SISTEMA DE "DESHACER" (UNDO)
    // ==========================================
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

            var fragment = document.createDocumentFragment();
            docs.forEach(function(doc) {
                var card = document.createElement('div');
                var isActive = (doc.id === self.currentDocId);
                
                card.className = 'card-template' + (isActive ? ' active-template-indicator' : '');
                card.onclick = function() { self.loadDoc(doc.id); };

                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = doc.body || '';
                var plainText = tempDiv.innerText || tempDiv.textContent || '';

                var createdStr = doc.createdAt ? new Date(doc.createdAt).toLocaleString() : 'N/A';
                var updatedStr = doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : 'N/A';

                // Renderizado con botones idénticos a la barra superior (Redondos 3D, icono interior y leyenda inferior)
                card.innerHTML = 
                    '<div class="card-template-title">' + self.escapeHTML(doc.title || 'Sin Título') + '</div>' +
                    '<div class="card-template-body">' + self.escapeHTML(plainText || 'Documento vacío...') + '</div>' +
                    '<div style="font-size:0.55rem; color:var(--text-muted); margin-bottom:8px; text-align:center;">Creado: ' + createdStr + '<br>Modificado: ' + updatedStr + '</div>' +
                    '<div class="card-template-actions">' +
                        
                        /* 1. Editar Título */
                        '<div class="btn-wrapper-3d">' +
                            '<button type="button" class="btn-round-3d card-btn-action" onclick="RetoricaStorage.triggerActionWithFlash(this, function() { RetoricaStorage.renameDoc(\'' + doc.id + '\', event); })" title="Editar Título" aria-label="Editar Título">' +
                                '<span class="emoji-icon" aria-hidden="true">✏️</span>' +
                            '</button>' +
                            '<div class="btn-label-3d">Editar</div>' +
                        '</div>' +

                        /* 2. Copiar */
                        '<div class="btn-wrapper-3d">' +
                            '<button type="button" class="btn-round-3d card-btn-action" onclick="RetoricaStorage.triggerActionWithFlash(this, function() { RetoricaStorage.copyDoc(\'' + doc.id + '\', event); })" title="Copiar" aria-label="Copiar">' +
                                '<span class="emoji-icon" aria-hidden="true">📋</span>' +
                            '</button>' +
                            '<div class="btn-label-3d">Copiar</div>' +
                        '</div>' +

                        /* 3. Compartir */
                        '<div class="btn-wrapper-3d">' +
                            '<button type="button" class="btn-round-3d card-btn-action" onclick="RetoricaStorage.triggerActionWithFlash(this, function() { RetoricaStorage.shareDoc(\'' + doc.id + '\', event); })" title="Compartir" aria-label="Compartir">' +
                                '<span class="emoji-icon" aria-hidden="true">📤</span>' +
                            '</button>' +
                            '<div class="btn-label-3d">Compartir</div>' +
                        '</div>' +

                        /* 4. Borrar */
                        '<div class="btn-wrapper-3d">' +
                            '<button type="button" class="btn-round-3d card-btn-action" onclick="RetoricaStorage.triggerActionWithFlash(this, function() { RetoricaStorage.deleteDoc(\'' + doc.id + '\', event); })" title="Borrar" aria-label="Borrar">' +
                                '<span class="emoji-icon" aria-hidden="true">🗑️</span>' +
                            '</button>' +
                            '<div class="btn-label-3d">Borrar</div>' +
                        '</div>' +

                    '</div>';

                fragment.appendChild(card);
            });
            container.appendChild(fragment);
        });
    },

    // Función auxiliar para activar el destello amarillo únicamente al presionar el botón de acción
    triggerActionWithFlash: function(btnElement, actionCallback) {
        if (event) event.stopPropagation();
        if (btnElement) {
            btnElement.classList.add('active-action-flash');
            setTimeout(function() {
                btnElement.classList.remove('active-action-flash');
            }, 1200);
        }
        if (typeof actionCallback === 'function') {
            actionCallback();
        }
    },

    const RetoricaStorageExtension = {
  // 1. Borrar con timer de 10s y opción de deshacer (Entre líneas 300 y 370)
  deleteDocWithTimer(id) {
    if (pendingDeletion) {
      this.finalizeDelete(pendingDeletion);
    }

    pendingDeletion = id;
    const cardElement = document.getElementById(`doc-card-${id}`);
    if (cardElement) cardElement.style.opacity = '0.4';

    this.showUndoToast("Documento marcado para eliminar. ¿Deshacer?", () => {
      this.undoDelete();
    }, 10000);

    deleteTimer = setTimeout(() => {
      if (pendingDeletion === id) {
        this.finalizeDelete(id);
      }
    }, 10000);
  },

  undoDelete() {
    if (deleteTimer) clearTimeout(deleteTimer);
    if (pendingDeletion) {
      const cardElement = document.getElementById(`doc-card-${pendingDeletion}`);
      if (cardElement) cardElement.style.opacity = '1';
      pendingDeletion = null;
      this.refreshLibrary();
      this.hideUndoToast();
    }
  },

  finalizeDelete(id) {
    let docs = JSON.parse(localStorage.getItem('retorica_docs') || '[]');
    docs = docs.filter(doc => doc.id !== id);
    localStorage.setItem('retorica_docs', JSON.stringify(docs));
    pendingDeletion = null;
    this.refreshLibrary();
  },

  showUndoToast(message, undoCallback, duration) {
    let toast = document.getElementById('undo-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'undo-toast';
      toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:#333; color:#fff; padding:12px 20px; border-radius:8px; display:flex; gap:12px; align-items:center; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>${message}</span> <button id="undo-btn" style="background:#00ffcc; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-weight:bold; color:#000;">Deshacer</button>`;
    
    document.getElementById('undo-btn').onclick = () => {
      undoCallback();
      this.hideUndoToast();
    };

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.hideUndoToast();
    }, duration);
  },

  hideUndoToast() {
    const toast = document.getElementById('undo-toast');
    if (toast) toast.remove();
  },

  // 2 y 4. Renderizado con fechas, indicador multicolor y acciones autoajustables (Entre líneas 450 y 510)
  renderDocCard(doc) {
    const isActive = doc.id === this.currentDocId;
    const activeClass = isActive ? 'active-template-indicator' : '';
    
    const createdDate = new Date(doc.createdAt || Date.now()).toLocaleString();
    const updatedDate = new Date(doc.updatedAt || Date.now()).toLocaleString();

    return `
      <div id="doc-card-${doc.id}" class="doc-card ${activeClass}" style="position:relative; padding:12px; margin-bottom:10px; background:#222; border-radius:8px; border:1px solid #444;">
        <h4>${doc.title || 'Sin título'}</h4>
        <div style="font-size: 0.75rem; color: #aaa; margin: 4px 0;">
          <div>Creado: ${createdDate}</div>
          <div>Modificado: ${updatedDate}</div>
        </div>
        <p style="font-size: 0.85rem; color: #ccc;">${doc.content ? doc.content.substring(0, 60) + '...' : 'Vacío'}</p>
        
        <div class="card-template-actions">
          <button onclick="RetoricaStorage.loadDoc('${doc.id}')" title="Abrir">📂</button>
          <button onclick="RetoricaStorage.deleteDocWithTimer('${doc.id}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  },

  // 3. Filtrado en tiempo real por palabras o contenido
  filterLibrary(query) {
    const q = query.toLowerCase();
    const cards = document.querySelectorAll('.doc-card');
    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(q) ? 'block' : 'none';
    });
  }
};
    
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
