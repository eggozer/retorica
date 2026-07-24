// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js) ---
var RetoricaStorage = {
    dbKey: 'retorica_pro_docs_v2026',
    currentDocId: null,

    getDocs: function() {
        var data = localStorage.getItem(this.dbKey);
        return data ? JSON.parse(data) : {};
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

    save: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;

        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();

        // Se permite guardar siempre, incluso si no hay título ni cuerpo
        var docs = this.getDocs();

        if (!this.currentDocId) {
            this.currentDocId = 'doc_' + Date.now();
        }

        var nowStr = new Date().toISOString();
        var createdAt = nowStr;

        if (docs[this.currentDocId]) {
            createdAt = docs[this.currentDocId].createdAt || docs[this.currentDocId].updatedAt || nowStr;
        }

        docs[this.currentDocId] = {
            id: this.currentDocId,
            title: title, // Puede ser string vacío
            body: body,   // Puede ser string vacío
            lang: (typeof RetoricaI18n !== 'undefined') ? RetoricaI18n.currentLang : 'es',
            createdAt: createdAt,
            updatedAt: nowStr
        };

        localStorage.setItem(this.dbKey, JSON.stringify(docs));
        localStorage.setItem('retorica_last_doc_id', this.currentDocId);

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.notify("Documento guardado ✓");
        }
        this.refreshLibrary();
    },

    autoSaveSilent: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;

        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();

        var docs = this.getDocs();

        if (!this.currentDocId) {
            this.currentDocId = 'doc_' + Date.now();
        }

        var nowStr = new Date().toISOString();
        var createdAt = nowStr;

        if (docs[this.currentDocId]) {
            createdAt = docs[this.currentDocId].createdAt || docs[this.currentDocId].updatedAt || nowStr;
        }

        docs[this.currentDocId] = {
            id: this.currentDocId,
            title: title,
            body: body,
            lang: (typeof RetoricaI18n !== 'undefined') ? RetoricaI18n.currentLang : 'es',
            createdAt: createdAt,
            updatedAt: nowStr
        };

        localStorage.setItem(this.dbKey, JSON.stringify(docs));
        localStorage.setItem('retorica_last_doc_id', this.currentDocId);
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
        var docs = this.getDocs();
        if (!docs[id]) return;
        this.currentDocId = id;
        localStorage.setItem('retorica_last_doc_id', id);
        
        var tInput = document.getElementById('editor-title');
        var bInput = document.getElementById('editor-body');
        if(tInput) tInput.value = docs[id].title || '';
        if(bInput) bInput.value = docs[id].body || '';

        if (docs[id].lang && typeof RetoricaI18n !== 'undefined') {
            RetoricaI18n.currentLang = docs[id].lang;
            RetoricaI18n.setAppLang(docs[id].lang);
        }

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            var sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('active')) { RetoricaUI.toggleSidebar(); }
            RetoricaUI.notify("Guion cargado");
        }
    },

    deleteDoc: function(id, event) {
        if (event) event.stopPropagation(); 
        if (!confirm("¿Seguro que deseas eliminar este guion?")) return;
        var docs = this.getDocs();
        if (docs[id]) {
            delete docs[id];
            localStorage.setItem(this.dbKey, JSON.stringify(docs));
            if (this.currentDocId === id) { this.clearCanvasSilent(); }
            this.refreshLibrary();
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Documento eliminado");
        }
    },

    shareDoc: function(id, event) {
        if (event) event.stopPropagation();
        var docs = this.getDocs();
        if (!docs[id]) return;
        var titleText = docs[id].title ? docs[id].title.toUpperCase() + "\n\n" : "";
        var textToShare = titleText + (docs[id].body || "");
        
        if (navigator.share) {
            navigator.share({ title: docs[id].title || "Documento Retórica", text: textToShare }).catch(function(){});
        } else {
            this.copyDocToClipboard(id, event);
        }
    },

    copyDocToClipboard: function(id, event) {
        if (event) event.stopPropagation();
        var docs = this.getDocs();
        if (!docs[id]) return;
        var titleText = docs[id].title ? docs[id].title.toUpperCase() + "\n\n" : "";
        var textToCopy = titleText + (docs[id].body || "");
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = textToCopy;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Plantilla copiada ✓");
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
        container.innerHTML = '';

        var docs = this.getDocs();
        var docKeys = Object.keys(docs);
        var sortedDocs = [];
        
        for (var i = 0; i < docKeys.length; i++) {
            sortedDocs.push(docs[docKeys[i]]);
        }

        sortedDocs.sort(function(a, b) { 
            return new Date(b.updatedAt) - new Date(a.updatedAt); 
        });

        if (sortedDocs.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-muted); font-size:0.75rem; font-weight:bold;">BIBLIOTECA VACÍA</div>';
            return;
        }

        var self = this;

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
                // Sin título: Muestra de 2 a 3 líneas del cuerpo directamente
                var fallbackSnippet = hasBody ? doc.body : '<i>Documento sin título ni contenido</i>';
                bodyHTML = '<div class="card-template-body" style="-webkit-line-clamp: 3; font-weight: 500; color: var(--text-main);">' + fallbackSnippet + '</div>';
            }

            var creacion = self.formatDate(doc.createdAt || doc.updatedAt);
            var edicion = self.formatDate(doc.updatedAt);

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
    },

    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var fileName = file.name.replace(/\.[^/.]+$/, "");
        var extension = file.name.split('.').pop().toLowerCase();

        if (extension === 'docx') {
            if (window.mammoth) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    window.mammoth.extractRawText({ arrayBuffer: e.target.result })
                        .then(function(result) {
                            document.getElementById('editor-title').value = fileName;
                            document.getElementById('editor-body').value = result.value;
                            RetoricaStorage.createNewDoc();
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Word (.docx) importado ✓");
                        })
                        .catch(function() {
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error leyendo archivo Word");
                        });
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert("La biblioteca de lectura de Word no está presente.");
            }
        } else if (extension === 'pdf') {
            if (window.pdfjsLib) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var typedarray = new Uint8Array(e.target.result);
                    window.pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                        var totalPages = pdf.numPages;
                        var countPromises = [];
                        for (var i = 1; i <= totalPages; i++) {
                            countPromises.push(pdf.getPage(i).then(function(page) {
                                return page.getTextContent().then(function(textContent) {
                                    return textContent.items.map(function(s) { return s.str; }).join(' ');
                                });
                            }));
                        }
                        Promise.all(countPromises).then(function(pagesText) {
                            document.getElementById('editor-title').value = fileName;
                            document.getElementById('editor-body').value = pagesText.join('\n\n');
                            RetoricaStorage.createNewDoc();
                            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("PDF importado ✓");
                        });
                    });
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert("La biblioteca de lectura PDF no está activa.");
            }
        } else {
            var reader = new FileReader();
            reader.onload = function(e) {
                var content = e.target.result;
                if (extension === 'html') {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(content, 'text/html');
                    content = doc.body.textContent || doc.body.innerText || "";
                }
                document.getElementById('editor-title').value = fileName;
                document.getElementById('editor-body').value = content;
                RetoricaStorage.createNewDoc();
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Texto importado ✓");
            };
            reader.readAsText(file, "UTF-8");
        }
        event.target.value = '';
    }
};
