// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var RetoricaUI = {
    state: { zoom: 1.0 },

    init: function() {
        var editor = document.getElementById('editor-body');
        if (editor) {
            editor.oninput = function() { RetoricaUI.updateCounters(); };
        }
        if (typeof RetoricaI18n !== 'undefined') RetoricaI18n.init();
        
        var unifiedContainer = document.getElementById('unified-sel-container');
        if (unifiedContainer) {
            unifiedContainer.onclick = function(e) {
                if (e.target === unifiedContainer) {
                    var body = document.getElementById('editor-body');
                    if (body) body.focus();
                }
            };
        }
        this.bindSwipeEvents();
        this.updateCounters();
        if (typeof RetoricaAuth !== 'undefined') RetoricaAuth.initLifecycle();\n    },

    toggleSidebar: function() {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
        if (sidebar && sidebar.classList.contains('active') && typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        this.notify("Paleta modificada.");
    },

    adjustZoom: function(delta) {
        var targetZoom = this.state.zoom + delta;
        if (targetZoom < 0.6) targetZoom = 0.6;
        if (targetZoom > 1.8) targetZoom = 1.8;
        this.state.zoom = targetZoom;
        
        var wrapper = document.getElementById('zoom-wrapper');
        if (wrapper) {
            wrapper.style.transform = "scale(" + this.state.zoom + ")";
            wrapper.style.transformOrigin = "top left";
            wrapper.style.width = (100 / this.state.zoom) + "%";
        }
        this.notify("Zoom: " + Math.round(this.state.zoom * 100) + "%");
    },

    bindSwipeEvents: function() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        sidebar.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, false);
        sidebar.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, false);
    },

    updateCounters: function() {
        var editor = document.getElementById('editor-body');
        if (!editor) return;
        var text = editor.innerText || editor.textContent || "";
        
        var chars = text.length;
        var words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        var lines = text.split('\n').length;
        
        if (document.getElementById('count-chars')) document.getElementById('count-chars').innerText = "CHARS: " + chars;
        if (document.getElementById('count-words')) document.getElementById('count-words').innerText = "WORDS: " + words;
        if (document.getElementById('count-lines')) document.getElementById('count-lines').innerText = "LINES: " + lines;
    },

    notify: function(msg) {
        var toast = document.getElementById('toast-notif');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2500);
    },

    // --- MÓDULO ENRIQUECIDO DE EDICIÓN AVANZADA ---
    execEditorCmd: function(cmd, val) {
        document.execCommand(cmd, false, val || null);
        this.focusBody();
    },
    
    insertTable: function() {
        var rows = prompt("Número de Filas:", "3");
        var cols = prompt("Número de Columnas:", "3");
        if(!rows || !cols) return;
        var html = "<table style='width:100%; border-collapse:collapse; margin:10px 0; border:1px solid var(--border);'>";
        for(var r=0; r<parseInt(rows); r++){
            html += "<tr>";
            for(var c=0; c<parseInt(cols); c++){
                html += "<td style='border:1px solid var(--border); padding:6px; min-width:30px; color:var(--text-main);'>...</td>";
            }
            html += "</tr>";
        }
        html += "</table><br>";
        this.execEditorCmd('insertHTML', html);
    },
    
    insertLocalImage: function() {
        var url = prompt("Introduce la URL de la imagen o Base64:", "https://");
        if(url) this.execEditorCmd('insertImage', url);
    },

    focusBody: function() {
        var b = document.getElementById('editor-body');
        if(b) b.focus();
    },

    // --- ENLACES DE EXPORTACIÓN DEL SUBMENÚ DESLIZABLE ---
    expPDFPlano: function() {
        this.notify("Exportando PDF Fijo...");
        var title = (document.getElementById('editor-title').value || "guion_plano").trim();
        var element = document.getElementById('unified-sel-container');
        html2pdf().from(element).set({ margin:15, filename: title+'.pdf' }).save();
    },

    expPDFEditable: function() {
        this.notify("Construyendo Formulario PDF...");
        var title = (document.getElementById('editor-title').value || "guion_editable").trim();
        var bodyValue = document.getElementById('editor-body').innerHTML;
        var htmlForm = "<html><body><h2>" + title + "</h2><textarea style='width:100%; height:500px;'>" + bodyValue + "</textarea></body></html>";
        html2pdf().from(htmlForm).set({ margin: 15, filename: title + '_editable.pdf' }).save();
        this.notify("PDF Editable generado ✓");
    },

    expDOC: function() {
        var body = document.getElementById('editor-body').innerHTML;
        var title = (document.getElementById('editor-title').value || "guion").trim();
        var htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>" + title + "</title></head><body><h2>" + title + "</h2>" + body + "</body></html>";
        var blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = title + ".doc"; a.click();
        this.notify("Documento de Word generado ✓");
    }
};

window.onload = function() { RetoricaUI.init(); };
