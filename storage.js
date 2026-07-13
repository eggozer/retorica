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

        // Validación de lienzo vacío
        if (!title && !body) {
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("El archivo está vacío. Operación cancelada.");
            }
            return;
        }

        if (!title) title = "Sin Título (" + new Date().toLocaleDateString() + ")";

        var docs = this.getDocs();
        var nowStr = new Date().toLocaleString();

        // Identificar si es un documento existente para actualizar y no duplicar
        if (!this.currentDocId) {
            var foundId = null;
            for (var key in docs) {
                if (docs.hasOwnProperty(key) && docs[key].title === title) {
                    foundId = key;
                    break;
                }
            }
            if (foundId) {
                this.currentDocId = foundId;
            } else {
                this.currentDocId = 'doc_' + Date.now();
            }
        }

        var isNew = !docs[this.currentDocId];
        var createdTime = isNew ? nowStr : (docs[this.currentDocId].createdAt || nowStr);

        docs[this.currentDocId] = {
            id: this.currentDocId,
            title: title,
            body: body,
            createdAt: createdTime,
            updatedAt: nowStr
        };

        localStorage.setItem(this.dbKey, JSON.stringify(docs));
        localStorage.setItem('retorica_last_doc_id', this.currentDocId);

        this.refreshLibrary();
        
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Cambios guardados localmente ✓");
        }
    },

    loadDoc: function(id) {
        var docs = this.getDocs();
        if (!docs[id]) return;

        this.currentDocId = id;
        localStorage.setItem('retorica_last_doc_id', id);

        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        if (titleInput) titleInput.value = docs[id].title;
        if (bodyInput) bodyInput.value = docs[id].body;

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.closeSidebar();
            
            var metaInfo = "Creado: " + (docs[id].createdAt || "N/A") + " | Modificado: " + (docs[id].updatedAt || "N/A");
            RetoricaUI.notify("Cargado: " + docs[id].title);
            console.log(metaInfo);
        }
    },

    deleteDoc: function(id, event) {
        if (event) event.stopPropagation();
        if (!confirm("¿Seguro que deseas eliminar esta plantilla?")) return;

        var docs = this.getDocs();
        delete docs[id];
        localStorage.setItem(this.dbKey, JSON.stringify(docs));

        if (this.currentDocId === id) {
            this.createNewDoc();
        } else {
            this.refreshLibrary();
        }

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Plantilla eliminada con éxito");
        }
    },

    createNewDoc: function() {
        this.currentDocId = null;
        localStorage.removeItem('retorica_last_doc_id');

        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        if (titleInput) titleInput.value = "";
        if (bodyInput) bodyInput.value = "";

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.closeSidebar();
            RetoricaUI.notify("Nuevo lienzo preparado");
        }
        this.refreshLibrary();
    },

    refreshLibrary: function() {
        var container = document.getElementById('library-container');
        if (!container) return;

        container.innerHTML = "";
        var docs = this.getDocs();
        var keys = Object.keys(docs).sort(function(a, b) {
            return b.split('_')[1] - a.split('_')[1];
        });

        if (keys.length === 0) {
            container.innerHTML = "<div style='color:var(--text-muted); font-size:0.8rem; text-align:center; padding:20px;'>No hay plantillas guardadas.</div>";
            return;
        }

        for (var i = 0; i < keys.length; i++) {
            var doc = docs[keys[i]];
            var card = document.createElement('div');
            card.className = 'doc-card';
            if (this.currentDocId === doc.id) card.style.borderLeft = "3px solid #00ffcc";
            card.setAttribute('onclick', "RetoricaStorage.loadDoc('" + doc.id + "')");

            var cTime = doc.createdAt || "N/A";
            var mTime = doc.updatedAt || "N/A";

            card.innerHTML = 
                "<div style='flex:1; min-width:0;'>" +
                    "<div style='font-weight:bold; color:var(--text-main); font-size:0.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'>" + doc.title + "</div>" +
                    "<div style='font-size:0.65rem; color:var(--text-muted); margin-top:2px;'>C: " + cTime + "</div>" +
                    "<div style='font-size:0.65rem; color:var(--text-muted);'>M: " + mTime + "</div>" +
                "</div>" +
                "<button class='btn-delete-doc' onclick='RetoricaStorage.deleteDoc(\"" + doc.id + "\", event)'>×</button>";

            container.appendChild(card);
        }
    },

    exportHTML: function() {
        var title = document.getElementById('editor-title').value.trim() || "retorica_export";
        var body = document.getElementById('editor-body').value;
        
        var blob = new Blob([body], { type: "text/html;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = title + \".html\";
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
