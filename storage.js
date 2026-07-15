// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js) ---
var RetoricaStorage = {
    dbKey: 'retorica_pro_docs_v2026',
    currentDocId: null,

    getDocs: function() {
        var data = localStorage.getItem(this.dbKey);
        return data ? JSON.parse(data) : {};
    },

    save: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;

        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();

        if (!title && !body) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Lienzo vacío. No se guardó.");
            return;
        }

        if (!title) title = "Sin Título (" + new Date().toLocaleDateString() + ")";

        var docs = this.getDocs();
        if (!this.currentDocId) {
            this.currentDocId = 'doc_' + Date.now();
        }

        docs[this.currentDocId] = {
            id: this.currentDocId,
            title: title,
            body: body,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(this.dbKey, JSON.stringify(docs));
        // PUNTO 12: Almacenar la referencia del último ID para sobrevivir al reinicio de la página
        localStorage.setItem('retorica_last_doc_id', this.currentDocId);
        
        this.refreshLibrary();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Guardado local silencioso ✓");
    },

    autoSaveSilent: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;
        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();
        if (!title && !body) return; 
        if (!title) title = "Autoguardado (" + new Date().toLocaleDateString() + ")";
        var docs = this.getDocs();
        if (!this.currentDocId) { this.currentDocId = 'doc_' + Date.now(); }

        docs[this.currentDocId] = { id: this.currentDocId, title: title, body: body, updatedAt: new Date().toISOString() };
        localStorage.setItem(this.dbKey, JSON.stringify(docs));
        localStorage.setItem('retorica_last_doc_id', this.currentDocId);
        this.refreshLibrary();
    },

    loadDoc: function(id) {
        var docs = this.getDocs();
        if (!docs[id]) return;
        this.currentDocId = id;
        localStorage.setItem('retorica_last_doc_id', id);
        
        var tInput = document.getElementById('editor-title');
        var bInput = document.getElementById('editor-body');
        if(tInput) tInput.value = docs[id].title;
        if(bInput) bInput.value = docs[id].body;

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

    // PUNTO 11 y 13: Funciones para Compartir y Copiar desde la Plantilla (Biblioteca)
    shareDoc: function(id, event) {
        if (event) event.stopPropagation();
        var docs = this.getDocs();
        if (!docs[id]) return;
        var textToShare = docs[id].title.toUpperCase() + "\n\n" + docs[id].body;
        
        if (navigator.share) {
            navigator.share({ title: docs[id].title, text: textToShare }).catch(function(){});
        } else {
            this.copyDocToClipboard(id, event);
        }
    },

    copyDocToClipboard: function(id, event) {
        if (event) event.stopPropagation();
        var docs = this.getDocs();
        if (!docs[id]) return;
        var textToCopy = docs[id].title.toUpperCase() + "\n\n" + docs[id].body;
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = textToCopy;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Plantilla copiada ✓");
    },

    clearCanvas: function() {
        this.clearCanvasSilent();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Lienzo limpio");
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
        var sortedDocs = Object.values(docs).sort(function(a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });

        if (sortedDocs.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-muted); font-size:0.75rem; font-weight:bold;">BIBLIOTECA VACÍA</div>';
            return;
        }

        // PUNTO 11 y 13: Tarjetas centradas con botones adicionales
        sortedDocs.forEach(function(doc) {
            var card = document.createElement('div');
            card.className = 'card-template';
            card.setAttribute('onclick', "RetoricaStorage.loadDoc('" + doc.id + "')");

            var titleText = doc.title || "Sin Título";
            var bodySnippet = doc.body ? doc.body.substring(0, 90) + "..." : "Sin contenido...";

            card.innerHTML = 
                '<div class="card-template-title">' + titleText + '</div>' +
                '<div class="card-template-body">' + bodySnippet + '</div>' +
                '<div class="card-template-actions">' +
                    '<button class="btn-action-tmpl" style="color:var(--danger);" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)">Borrar</button>' +
                    '<button class="btn-action-tmpl" onclick="RetoricaStorage.copyDocToClipboard(\'' + doc.id + '\', event)">Copiar</button>' +
                    '<button class="btn-action-tmpl" onclick="RetoricaStorage.shareDoc(\'' + doc.id + '\', event)">Compartir</button>' +
                '</div>';
            container.appendChild(card);
        });
    },

    // PUNTO 1: Filtro anti-cifrado, solo admite y procesa texto plano y HTML nativo.
    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            var content = e.target.result;
            if (file.name.endsWith('.html')) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(content, 'text/html');
                content = doc.body.textContent || doc.body.innerText || "";
            }
            document.getElementById('editor-title').value = file.name.replace(/\.[^/.]+$/, "");
            document.getElementById('editor-body').value = content;
            RetoricaStorage.currentDocId = null; 
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.updateCounters();
                RetoricaUI.notify("Texto importado con éxito");
            }
        };
        reader.readAsText(file, "UTF-8");
        event.target.value = ''; 
    }
};
