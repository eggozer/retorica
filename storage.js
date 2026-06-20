var RetoricaStorage = {
    activeDocId: null,
    
    save: function() {
        if (!window.retoricaActiveUser) { RetoricaUI.notify("Inicia sesión primero."); return; }
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : "";
        var body = bodyInput ? bodyInput.value : "";
        
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        var isExisting = false;
        
        if (this.activeDocId) {
            for (var i = 0; i < projectList.length; i++) {
                if (projectList[i].id === this.activeDocId && projectList[i].user === window.retoricaActiveUser) {
                    projectList[i].title = title;
                    projectList[i].body = body;
                    projectList[i].lastModified = new Date().toLocaleString();
                    isExisting = true;
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
        this.refreshLibrary();
        RetoricaUI.notify("Proyecto guardado y actualizado ✓");
    },
    
    refreshLibrary: function() {
        var container = document.getElementById('docs-list-render'); if (!container) return;
        container.innerHTML = ""; if (!window.retoricaActiveUser) return;
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        
        for (var i = 0; i < projectList.length; i++) {
            var doc = projectList[i];
            if (doc.user !== window.retoricaActiveUser) continue;
            
            var card = document.createElement('div'); card.className = "card-template";
            var displayTitle = doc.title.trim() ? doc.title : "Sin Título";
            var snippet = doc.body.trim() ? doc.body : "(Lienzo vacío)";
            
            var htmlCard = "<div class='card-template-title'>" + displayTitle + "</div>";
            htmlCard += "<div class='card-template-body'>" + snippet.replace(/\n/g, '<br>') + "</div>";
            htmlCard += "<div class='card-template-actions'>";
            htmlCard += "<button class='btn-action-tmpl' onclick='event.stopPropagation(); RetoricaStorage.shareDoc(" + doc.id + ")'>Compartir</button>";
            htmlCard += "<button class='btn-action-tmpl' onclick='event.stopPropagation(); RetoricaStorage.copyDoc(" + doc.id + ")'>Copiar</button>";
            htmlCard += "<button class='btn-action-tmpl' style='background:#4a5568;' onclick='event.stopPropagation(); RetoricaStorage.deleteDoc(" + doc.id + ")'>Borrar</button>";
            htmlCard += "</div>";
            
            card.innerHTML = htmlCard;
            (function(cDoc) {
                card.onclick = function() {
                    document.getElementById('editor-title').value = cDoc.title;
                    document.getElementById('editor-body').value = cDoc.body;
                    RetoricaStorage.activeDocId = cDoc.id;
                    RetoricaUI.toggleSidebar(); RetoricaUI.updateCounters();
                };
            })(doc);
            container.appendChild(card);
        }
    },
    shareDoc: function(id) {
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        var doc = projectList.find(function(x) { return x.id === id; });
        if (!doc) return;
        if (navigator.share) {
            navigator.share({ title: doc.title, text: doc.body }).catch(function(){});
        } else {
            RetoricaStorage.copyDoc(id);
            RetoricaUI.notify("Compartir no soportado. ¡Copiado al portapapeles!");
        }
    },
    copyDoc: function(id) {
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        var doc = projectList.find(function(x) { return x.id === id; });
        if (!doc) return;
        navigator.clipboard.writeText((doc.title ? doc.title + "\n\n" : "") + doc.body);
        RetoricaUI.notify("Copiado al portapapeles ✓");
    },
    deleteDoc: function(id) {
        if (!confirm("¿Deseas eliminar esta plantilla?")) return;
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        projectList = projectList.filter(function(x) { return x.id !== id; });
        localStorage.setItem('ret_project_db', JSON.stringify(projectList));
        if (this.activeDocId === id) this.clearCanvas();
        this.refreshLibrary(); RetoricaUI.notify("Plantilla eliminada.");
    },
    importLocalFile: function(event) {
        var file = event.target.files[0]; if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            var content = e.target.result;
            document.getElementById('editor-title').value = file.name.split('.')[0];
            if (file.type === "text/html" || file.name.endsWith('.html')) {
                var tempDiv = document.createElement('div'); tempDiv.innerHTML = content;
                document.getElementById('editor-body').value = tempDiv.innerText || tempDiv.textContent;
            } else {
                document.getElementById('editor-body').value = content;
            }
            RetoricaStorage.activeDocId = null; RetoricaUI.updateCounters();
            RetoricaUI.notify("Archivo estructurado importado con éxito ✓");
        };
        reader.readAsText(file);
    },
    exportToHTML: function() {
        var title = document.getElementById('editor-title').value.trim() || "Guion Sin Título";
        var body = document.getElementById('editor-body').value;
        var htmlContent = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>" + title + "</title></head><body><h1>" + title + "</h1><p>" + body.replace(/\n/g, "<br>") + "</p></body></html>";
        var blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        var link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = title + ".html"; link.click();
    },
    clearCanvas: function() {
        if(document.getElementById('editor-title')) document.getElementById('editor-title').value = "";
        if(document.getElementById('editor-body')) document.getElementById('editor-body').value = "";
        this.activeDocId = null; RetoricaUI.updateCounters();
    }
};
