// --- RETÓRICA PERSISTENCE & STORAGE ENGINE (storage.js) ---
var RetoricaStorage = {
    dbKey: 'retorica_pro_docs_v2026',
    currentDocId: null,

    getDocs: function() {
        var data = localStorage.getItem(this.dbKey);
        // Respaldo preventivo anticaché si se borró el principal
        if (!data) {
            data = localStorage.getItem('retorica_backup_cloud_mirror');
        }
        return data ? JSON.parse(data) : {};
    },

    save: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;

        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();

        if (!title && !body) {
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("El archivo está vacío. Operación cancelada.");
            }
            return;
        }

        if (!title) title = "Sin Título (" + new Date().toLocaleDateString() + ")";

        var docs = this.getDocs();
        
        // Refacción Anti-duplicidad: Busca si ya existe un documento con este mismo título
        if (!this.currentDocId) {
            var existingId = null;
            Object.keys(docs).forEach(function(key) {
                if (docs[key].title.toLowerCase() === title.toLowerCase()) {
                    existingId = key;
                }
            });
            this.currentDocId = existingId ? existingId : 'doc_' + Date.now();
        }

        var nowIso = new Date().toISOString();
        var isNew = !docs[this.currentDocId];

        docs[this.currentDocId] = {
            id: this.currentDocId,
            title: title,
            body: body,
            createdAt: isNew ? nowIso : (docs[this.currentDocId].createdAt || nowIso),
            updatedAt: nowIso
        };

        localStorage.setItem(this.dbKey, JSON.stringify(docs));
        // Refacción: Exportación automática transparente al guardar
        this.exportToHTML();
        this.refreshLibrary();

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Guardado y Exportado HTML ✓");
        }
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
        
        // Refacción Anti-duplicidad en segundo plano
        if (!this.currentDocId) {
            var existingId = null;
            Object.keys(docs).forEach(function(key) {
                if (docs[key].title.toLowerCase() === title.toLowerCase()) {
                    existingId = key;
                }
            });
            this.currentDocId = existingId ? existingId : 'doc_' + Date.now();
        }

        var nowIso = new Date().toISOString();
        var isNew = !docs[this.currentDocId];

        docs[this.currentDocId] = {
            id: this.currentDocId,
            title: title,
            body: body,
            createdAt: isNew ? nowIso : (docs[this.currentDocId].createdAt || nowIso),
            updatedAt: nowIso
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
        if (event) event.stopPropagation(); 
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

    refreshLibrary: function() {
        // Vinculación exacta con tu id del index.html de producción
        var container = document.getElementById('library-container');
        if (!container) return;
        container.innerHTML = '';

        var docs = this.getDocs();
        var sortedDocs = Object.values(docs).sort(function(a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        if (sortedDocs.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.75rem; font-weight:bold;">BIBLIOTECA VACÍA</div>';
            return;
        }

        sortedDocs.forEach(function(doc) {
            var card = document.createElement('div');
            card.className = 'doc-card'; // Mapeo de clase fiel a tu css production
            card.setAttribute('onclick', "RetoricaStorage.loadDoc('" + doc.id + "')");

            var titleText = doc.title || "Sin Título";
            var bodySnippet = doc.body ? doc.body.substring(0, 60) + "..." : "Sin contenido...";
            
            // Refacción: Formatear las marcas de tiempo para la tarjeta
            var createdDate = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A';
            var updatedTime = doc.updatedAt ? new Date(doc.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';

            card.innerHTML = 
                '<div>' +
                    '<div style="font-weight:bold; font-size:0.9rem; color:var(--text-main);">' + titleText + '</div>' +
                    '<div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">' + bodySnippet + '</div>' +
                    '<div style="font-size:0.65rem; color:var(--accent); margin-top:5px;">Creado: ' + createdDate + ' | Modif: ' + updatedTime + '</div>' +
                '</div>' +
                '<button class="btn-delete-doc" onclick="RetoricaStorage.deleteDoc(\'' + doc.id + '\', event)">×</button>';

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
            if (file.name.endsWith('.html')) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                content = tempDiv.innerText || tempDiv.textContent;
            }
            
            document.getElementById('editor-title').value = file.name.replace(/\.[^/.]+$/, "");
            document.getElementById('editor-body').value = content;
            RetoricaStorage.currentDocId = null; 
            
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.updateCounters();
                RetoricaUI.notify("Archivo importado con éxito");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; 
    }
};
