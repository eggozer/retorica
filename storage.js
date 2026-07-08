// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js) ---
var RetoricaStorage = {
    dbKey: 'retorica_pro_docs_v2026',
    currentDocId: null,

    getDocs: function() {
        var data = localStorage.getItem(this.dbKey);
        return data ? JSON.parse(data) : {};
    },

    // Punto 1 y 7: Validación de lienzo vacío y Guardado Silencioso Local por defecto
    save: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;

        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();

        // Punto 1: Si ambos campos están vacíos, detener el flujo y avisar al usuario
        if (!title && !body) {
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("El archivo está vacío. Operación cancelada.");
            }
            return;
        }

        // Si no tiene título pero sí cuerpo, asignamos una marca temporal para no perderlo
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
        this.refreshLibrary();

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Guardado local silencioso ✓");
        }
    },

    // Punto 8: Función rápida de autoguardado silencioso (sin alertas intrusivas)
    autoSaveSilent: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;

        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();

        if (!title && !body) return; // Evita guardar lienzos completamente limpios

        if (!title) title = "Autoguardado (" + new Date().toLocaleDateString() + ")";

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
        this.refreshLibrary();
    },

    loadDoc: function(id) {
        var docs = this.getDocs();
        if (!docs[id]) return;

        this.currentDocId = id;
        document.getElementById('editor-title').value = docs[id].title;
        document.getElementById('editor-body').value = docs[id].body;

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.toggleSidebar();
            RetoricaUI.notify("Guion cargado");
        }
    },

    deleteDoc: function(id, event) {
        if (event) event.stopPropagation(); // Evita que se abra el documento al querer borrarlo
        if (!confirm("¿Seguro que deseas eliminar este guion de tu biblioteca?")) return;

        var docs = this.getDocs();
        if (docs[id]) {
            delete docs[id];
            localStorage.setItem(this.dbKey, JSON.stringify(docs));
            
            if (this.currentDocId === id) {
                this.clearCanvasSilent();
            }
            this.refreshLibrary();
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("Documento eliminado");
            }
        }
    },

    clearCanvas: function() {
        this.clearCanvasSilent();
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Lienzo limpio para nuevo guion");
        }
    },

    clearCanvasSilent: function() {
        this.currentDocId = null;
        document.getElementById('editor-title').value = '';
        document.getElementById('editor-body').value = '';
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
        }
    },

    // Punto 9: Unificación de tarjetas mostrando obligatoriamente título y 3 líneas de vista previa limpias
    refreshLibrary: function() {
        var container = document.getElementById('docs-list-render');
        if (!container) return;
        container.innerHTML = '';

        var docs = this.getDocs();
        var sortedDocs = Object.values(docs).sort(function(a, b) {
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

            // Forzar visualización del título y extracto limpio
            var titleText = doc.title || "Sin Título";
            var bodySnippet = doc.body ? doc.body.substring(0, 90) + "..." : "Sin contenido adicional...";

            card.innerHTML = 
                '<div class="card-template-title">' + titleText + '</div>' +
                '<div class="card-template-body">' + bodySnippet + '</div>' +
                '<div class="card-template-actions">' +
                    '<button class="btn-action-tmpl" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)">Eliminar</button>' +
                '</div>';

            container.appendChild(card);
        });
    },

    exportToHTML: function() {
        var title = document.getElementById('editor-title').value.trim() || "retorica_export";
        var body = document.getElementById('editor-body').value;
        
        var blob = new Blob([body], { type: "text/html;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = title + ".html";
        a.click();
    },

    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            var content = e.target.result;
            // Si el archivo viene con estructura HTML básica, extraemos solo el texto interno plano
            if (file.name.endsWith('.html')) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                content = tempDiv.innerText || tempDiv.textContent;
            }
            
            document.getElementById('editor-title').value = file.name.replace(/\.[^/.]+$/, "");
            document.getElementById('editor-body').value = content;
            RetoricaStorage.currentDocId = null; // Lo trata como un archivo nuevo importado
            
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.updateCounters();
                RetoricaUI.notify("Archivo importado con éxito");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset selector
    }
};
