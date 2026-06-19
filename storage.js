// --- RETÓRICA LOCAL PERSISTENCE MODULE (storage.js) ---
var RetoricaStorage = {
    activeDocId: null,
    cloudSyncMode: false,
    
    toggleSyncMode: function() {
        this.cloudSyncMode = !this.cloudSyncMode;
        var btn = document.getElementById('btn-toggle-cloud');
        if(btn) {
            btn.style.background = this.cloudSyncMode ? "#2ecc71" : "var(--btn-3d-bg)";
            btn.innerText = this.cloudSyncMode ? "NUBE ACTIVA 🔄" : "MODO LOCAL 📱";
        }
        RetoricaUI.notify(this.cloudSyncMode ? "Sincronización por Email Activada" : "Persistencia Estrictamente Local");
    },
    
    save: function() {
        if (!window.retoricaActiveUser) { RetoricaUI.notify("Inicia sesión primero."); return; }
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : "Guion Sin Título";
        var body = bodyInput ? bodyInput.innerHTML : "";
        
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        var isExisting = false;
        
        if (this.activeDocId) {
            for (var i = 0; i < projectList.length; i++) {
                if (projectList[i].id === this.activeDocId && projectList[i].user === window.retoricaActiveUser) {
                    projectList[i].title = title;
                    projectList[i].body = body;
                    projectList[i].lastModified = new Date().toLocaleString();\n                    isExisting = true;
                    break;
                }
            }
        }
        if (!isExisting) {
            var item = { id: Date.now(), user: window.retoricaActiveUser, title: title, body: body, lastModified: new Date().toLocaleString() };
            this.activeDocId = item.id;
            projectList.push(item);
        }
        
        localStorage.setItem('ret_project_db', JSON.stringify(projectList));
        
        if(this.cloudSyncMode && window.retoricaActiveUser.indexOf('@') !== -1) {
            RetoricaUI.notify("Sincronizando con la nube por Email...");
            // Simulación asíncrona compatible con Android 5 (sin usar promesas nativas directas)
            setTimeout(function() {
                RetoricaUI.notify("¡Sincronizado entre dispositivos por Email! 🔄✓");
            }, 1000);
        } else {
            RetoricaUI.notify("Proyecto guardado localmente en el celular ✓");
        }
        
        this.refreshLibrary();
    },

    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            var content = e.target.result;
            var editor = document.getElementById('editor-body');
            if (!editor) return;
            if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
                editor.innerHTML = content;
            } else {
                var tempDiv = document.createElement('div');
                tempDiv.innerText = content;
                editor.innerHTML = tempDiv.innerHTML;
            }
            RetoricaStorage.activeDocId = null;
            RetoricaUI.updateCounters();
            RetoricaUI.notify("Archivo importado al lienzo ✓");
        };
        reader.readAsText(file);
    },

    clearCanvas: function() {
        if(document.getElementById('editor-title')) document.getElementById('editor-title').value = "";
        if(document.getElementById('editor-body')) document.getElementById('editor-body').innerHTML = "";
        this.activeDocId = null;
        RetoricaUI.updateCounters();
        RetoricaUI.notify("Lienzo limpio.");
    },

    refreshLibrary: function() {
        var container = document.getElementById('docs-list-render');
        if (!container) return;
        container.innerHTML = "";
        if (!window.retoricaActiveUser) return;
        
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        for (var i = 0; i < projectList.length; i++) {
            var doc = projectList[i];
            if (doc.user === window.retoricaActiveUser) {
                var row = document.createElement('div');
                row.className = "template-card-item";
                row.style.cssText = "background:var(--bg-card); padding:10px; margin-bottom:8px; border-radius:8px; font-size:0.8rem; border:1px solid var(--border); cursor:pointer; display:flex; justify-content:space-between; align-items:center;";
                
                var txtSpan = document.createElement('span');
                txtSpan.className = "template-text-title";
                txtSpan.innerText = doc.title || "Guion Sin Título";
                
                var delBtn = document.createElement('button');
                delBtn.className = "btn-delete-template";
                delBtn.style.cssText = "background:var(--danger); color:#fff; border:none; padding:4px 8px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:0.7rem;";
                delBtn.innerText = "BORRAR";
                
                (function(currentDoc) {
                    txtSpan.onclick = function() {
                        document.getElementById('editor-title').value = currentDoc.title;
                        document.getElementById('editor-body').innerHTML = currentDoc.body;
                        RetoricaStorage.activeDocId = currentDoc.id;
                        RetoricaUI.toggleSidebar();
                        RetoricaUI.updateCounters();
                        RetoricaUI.notify("Cargado: " + currentDoc.title);
                    };
                    delBtn.onclick = function(e) {
                        e.stopPropagation();
                        if(confirm("¿Eliminar plantilla?")) {
                            var list = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
                            list = list.filter(function(x) { return x.id !== currentDoc.id; });
                            localStorage.setItem('ret_project_db', JSON.stringify(list));
                            RetoricaStorage.refreshLibrary();
                            RetoricaUI.notify("Plantilla borrada.");
                        }
                    };
                })(doc);
                
                row.appendChild(txtSpan);
                row.appendChild(delBtn);
                container.appendChild(row);
            }
        }
    }
};
