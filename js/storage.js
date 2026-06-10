// --- RETÓRICA LOCAL PERSISTENCE MODULE (storage.js) ---
var RetoricaStorage = {
    activeDocId: null,
    save: function() {
        if (!window.retoricaActiveUser) { RetoricaUI.notify("Inicia sesión para guardar tus proyectos."); return; }
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : "Guion Sin Título";
        var body = bodyInput ? bodyInput.value : "";
        var item = { id: this.activeDocId || Date.now(), user: window.retoricaActiveUser, title: title, body: body, lastModified: new Date().toLocaleString() };
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        projectList = projectList.filter(function(x) { return x.id !== item.id; });
        projectList.push(item);
        localStorage.setItem('ret_project_db', JSON.stringify(projectList));
        this.activeDocId = item.id;
        this.refreshLibrary();
        // Exportación nativa automática a HTML al presionar Guardar
        var htmlBlobContent = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>" + title + "</title><style>body{background:#0f111a;color:#f3f4f6;padding:30px;font-family:sans-serif;line-height:1.6;}h1{color:#00ffcc;border-bottom:1px solid #2d3748;padding-bottom:10px;}</style></head><body><h1>" + title + "</h1><p style='font-size:0.8rem;color:#a0aec0;'>Última modificación: " + item.lastModified + "</p><article style='white-space:pre-wrap;margin-top:20px;'>" + body + "</article></body></html>";
        var blob = new Blob([htmlBlobContent], { type: 'text/html;charset=utf-8' });
        var link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = title + ".html"; link.click();
        RetoricaUI.notify("Proyecto guardado localmente y descargado en HTML ✓");
    },
    refreshLibrary: function() {
        var container = document.getElementById('docs-list-render'); if (!container) return;
        container.innerHTML = ""; if (!window.retoricaActiveUser) return;
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        for (var i = 0; i < projectList.length; i++) {
            var doc = projectList[i];
            if (doc.user === window.retoricaActiveUser) {
                var row = document.createElement('div');
                row.style.cssText = "background:var(--bg-card); padding:10px; margin-bottom:8px; border-radius:8px; font-size:0.8rem; border:1px solid var(--border); cursor:pointer;";
                row.innerText = doc.title;
                (function(currentDoc) {
                    row.onclick = function() {
                        document.getElementById('editor-title').value = currentDoc.title;
                        document.getElementById('editor-body').value = currentDoc.body;
                        RetoricaStorage.activeDocId = currentDoc.id;
                        RetoricaUI.toggleSidebar(); RetoricaUI.updateCounters();
                        RetoricaUI.notify("Proyecto cargado: " + currentDoc.title);
                    };
                })(doc);
                container.appendChild(row);
            }
        }
    }
};
