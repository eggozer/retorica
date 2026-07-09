// --- RETÓRICA LOCAL PERSISTENCE MODULE (storage.js) ---
var RetoricaStorage = {
    activeDocId: null,
    
    save: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : "";
        var body = bodyInput ? bodyInput.innerHTML : ""; // Guarda HTML enriquecido completo
        
        if (!title && !body.replace(/<[^>]*>/g, '').trim()) {
            RetoricaUI.notify("Lienzo vacío. No se guardará nada.");
            return;
        }
        if (!title) title = "Documento Nuevo (" + new Date().toLocaleDateString() + ")";

        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        var isExisting = false;
        
        // CORRECCIÓN PUNTO 12: Si existe el ID activo, actualiza estrictamente sobre él sin clonar
        if (this.activeDocId) {
            for (var i = 0; i < projectList.length; i++) {
                if (projectList[i].id === this.activeDocId) {
                    projectList[i].title = title;
                    projectList[i].body = body;
                    projectList[i].lastModified = new Date().toLocaleString();
                    isExisting = true;
                    break;
                }
            }
        }
        
        if (!isExisting) {
            var item = { id: 'doc_' + Date.now(), title: title, body: body, lastModified: new Date().toLocaleString() };
            this.activeDocId = item.id;
            projectList.push(item);
        }
        
        localStorage.setItem('ret_project_db', JSON.stringify(projectList));
        this.refreshLibrary();
        RetoricaUI.notify("Documento guardado y sincronizado ✓");
    },

    // Autoguardado veloz en segundo plano invocado por el temporizador input sin disparar alertas invasivas
    saveSilent: function() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (!titleInput || !bodyInput) return;
        var title = titleInput.value.trim() || "Autoguardado";
        var body = bodyInput.innerHTML;

        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        if (this.activeDocId) {
            for (var i = 0; i < projectList.length; i++) {
                if (projectList[i].id === this.activeDocId) {
                    projectList[i].title = title;
                    projectList[i].body = body;
                    projectList[i].lastModified = new Date().toLocaleString();
                    localStorage.setItem('ret_project_db', JSON.stringify(projectList));
                    this.refreshLibrary();
                    return;
                }
            }
        }
        // Si no hay sesión activa, crea una nueva para evitar fugas de información
        var item = { id: 'doc_' + Date.now(), title: title, body: body, lastModified: new Date().toLocaleString() };
        this.activeDocId = item.id;
        projectList.push(item);
        localStorage.setItem('ret_project_db', JSON.stringify(projectList));
        this.refreshLibrary();
    },
    
    loadDoc: function(id) {
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        for (var i = 0; i < projectList.length; i++) {
            if (projectList[i].id === id) {
                this.activeDocId = id;
                document.getElementById('editor-title').value = projectList[i].title;
                document.getElementById('editor-body').innerHTML = projectList[i].body;
                RetoricaUI.updateCounters();
                RetoricaUI.toggleSidebar();
                RetoricaUI.notify("Guion cargado");
                return;
            }
        }
    },
    
    deleteDoc: function(id, event) {
        if (event) event.stopPropagation();
        if (!confirm("¿Deseas eliminar este archivo permanentemente?")) return;
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        var filtered = projectList.filter(function(item) { return item.id !== id; });
        localStorage.setItem('ret_project_db', JSON.stringify(filtered));
        if (this.activeDocId === id) this.clearCanvas();
        this.refreshLibrary();
        RetoricaUI.notify("Documento eliminado");
    },

    // FUNCIÓN SOLICITADA PUNTO 11: Compartir directamente el contenido del documento mediante Web Share API
    shareDoc: function(id, event) {
        if (event) event.stopPropagation();
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        var doc = projectList.find(function(item) { return item.id === id; });
        if (!doc) return;
        
        var plainText = doc.body.replace(/<[^>]*>/g, ''); // Limpieza rápida de HTML para apps de chat
        if (navigator.share) {
            navigator.share({ title: doc.title, text: plainText }).catch(console.error);
        } else {
            navigator.clipboard.writeText(doc.title + "\n\n" + plainText);
            RetoricaUI.notify("Enlace/Texto copiado al portapapeles ✓");
        }
    },
    
    refreshLibrary: function() {
        var container = document.getElementById('docs-list-render');
        if (!container) return;
        container.innerHTML = "";
        var projectList = JSON.parse(localStorage.getItem('ret_project_db') || '[]');
        
        if (projectList.length === 0) {
            container.innerHTML = "<div style='color:var(--text-muted); font-size:0.65rem; text-align:center; padding:20px;'>BIBLIOTECA VACÍA</div>";
            return;
        }
        
        projectList.forEach(function(item) {
            var card = document.createElement('div');
            card.className = "card-template";
            card.setAttribute('onclick', "RetoricaStorage.loadDoc('" + item.id + "')");
            
            var snippet = item.body.replace(/<[^>]*>/g, '').substring(0, 70) + "...";
            card.innerHTML = 
                "<div class='card-template-title'>" + item.title + "</div>" +
                "<div class='card-template-body'>" + snippet + "</div>" +
                "<div class='card-template-actions'>" +
                    "<button class='btn-card btn-card-share' onclick='RetoricaStorage.shareDoc(\"" + item.id + "\", event)'>Compartir</button>" +
                    "<button class='btn-card btn-card-del' onclick='RetoricaStorage.deleteDoc(\"" + item.id + "\", event)'>Eliminar</button>" +
                "</div>";
            container.appendChild(card);
        });
    },

    triggerLocalImport: function() {
        document.getElementById('file-uploader-hidden').click();
    },
    
    // CORRECCIÓN PUNTO 1 Y 2: Motor de renderizado dinámico e inteligente. Lee formatos nativos sin alteración
    importLocalFile: function(event) {
        var file = event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        
        // Si es HTML nativo de Retórica, inyectamos directamente su marcado completo para rescatar tablas y fotos
        if (file.name.endsWith('.html') || file.type === "text/html") {
            reader.onload = function(e) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(e.target.result, 'text/html');
                var parsedBody = doc.querySelector('.rich-editor') || doc.body;
                document.getElementById('editor-title').value = file.name.replace(/\.[^/.]+$/, "");
                document.getElementById('editor-body').innerHTML = parsedBody.innerHTML;
                RetoricaStorage.activeDocId = null;
                RetoricaUI.updateCounters();
                RetoricaUI.notify("Documento HTML cargado con éxito ✓");
            };
            reader.readAsText(file);
        } else {
            // Para documentos externos como Currículums en .doc o archivos de texto, extrae el texto de forma limpia evitando el cifrado
            reader.onload = function(e) {
                var rawContent = e.target.result;
                // Filtración rápida de cabeceras binarias corruptas
                var cleanText = rawContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
                document.getElementById('editor-title').value = file.name.replace(/\.[^/.]+$/, "");
                document.getElementById('editor-body').innerHTML = "<div>" + cleanText.replace(/\n/g, "<br>") + "</div>";
                RetoricaStorage.activeDocId = null;
                RetoricaUI.updateCounters();
                RetoricaUI.notify("Currículum importado como Texto Limpio ✓");
            };
            reader.readAsText(file, "UTF-8");
        }
        event.target.value = "";
    },
    
    clearCanvas: function() {
        this.activeDocId = null;
        document.getElementById('editor-title').value = "";
        document.getElementById('editor-body').innerHTML = "";
        RetoricaUI.updateCounters();
        RetoricaUI.notify("Lienzo limpio preparado");
    }
};
