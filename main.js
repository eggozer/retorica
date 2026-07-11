// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var autoSaveTimeout = null;

var RetoricaUI = {
    state: { zoom: 1.0, touchStartX: 0, touchEndX: 0 },

    init: function() {
        var editor = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');

        if (typeof RetoricaI18n !== 'undefined') RetoricaI18n.init();

        if (editor) { 
            editor.oninput = function() { 
                RetoricaUI.updateCounters(); 
                RetoricaUI.triggerAutoSave();
            }; 
        }
        if (titleInput) {
            titleInput.oninput = function() {
                RetoricaUI.triggerAutoSave();
            };
        }
        
        var unifiedContainer = document.getElementById('unified-sel-container');
        if (unifiedContainer) {
            unifiedContainer.onclick = function(e) {
                if (e.target === unifiedContainer && editor) {
                    editor.focus();
                }
            };
        }
        
        this.initTouchGestures();
        this.initViewportFix();
        this.updateCounters();
        
        if (typeof RetoricaAuth !== 'undefined') RetoricaAuth.initLifecycle();

        // PUNTO 12: PREVENIR DUPLICACIÓN AL ACTUALIZAR. Carga el último documento editado
        var lastEditedId = localStorage.getItem('retorica_last_doc_id');
        if (lastEditedId && typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.loadDoc(lastEditedId);
        }
    },

    triggerAutoSave: function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.autoSaveSilent();
            }
        }, 1500);
    },

    initTouchGestures: function() {
        var self = this;
        document.addEventListener('touchstart', function(e) { self.state.touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        document.addEventListener('touchend', function(e) { self.state.touchEndX = e.changedTouches[0].screenX; self.handleSwipe(); }, { passive: true });
    },

    handleSwipe: function() {
        var diffX = this.state.touchStartX - this.state.touchEndX;
        if (diffX < -150) {
            var sidebar = document.getElementById('sidebar');
            if (sidebar && !sidebar.classList.contains('active')) this.toggleSidebar();
        }
        if (diffX > 150) {
            var sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('active')) this.toggleSidebar();
        }
    },

    initViewportFix: function() {
        window.visualViewport.addEventListener('resize', function() {
            var view = document.getElementById('viewport-ctx');
            if (view) { view.style.height = window.visualViewport.height + "px"; }
        });
    },

    toggleSidebar: function() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active') && typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        var isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('retorica_theme_pref', isLight ? 'light' : 'dark');
        this.notify(isLight ? "Tema Claro Activo" : "Tema Oscuro Activo");
    },

    updateCounters: function() {
        var body = document.getElementById('editor-body');
        var text = body ? body.value : "";
        var chars = text.length;
        var words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        var lines = text === "" ? 1 : text.split('\n').length;
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

    // PUNTO 11: SELECCIONAR Y COPIAR TÍTULO Y CUERPO JUNTOS
    copyAll: function() {
        var title = document.getElementById('editor-title').value.trim();
        var body = document.getElementById('editor-body').value;
        if (!title && !body) { this.notify("El lienzo está vacío."); return; }
        
        var compiledText = (title ? title.toUpperCase() + "\n" + "=".repeat(title.length) + "\n\n" : "") + body;
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = compiledText;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        this.notify("Texto completo copiado al portapapeles ✓");
    },

    // PUNTO 4: INSERTAR TABLAS AUTOAJUSTABLES (Formato Texto Estructurado)
    insertTable: function() {
        var rows = parseInt(prompt("Número de filas:", "3"), 10) || 3;
        var cols = parseInt(prompt("Número de columnas:", "3"), 10) || 3;
        var tableStr = "\n| ";
        for (var i=0; i<cols; i++) { tableStr += "Columna " + (i+1) + " | "; }
        tableStr += "\n|";
        for (var j=0; j<cols; j++) { tableStr += "---|"; }
        tableStr += "\n";
        for (var r=0; r<rows; r++) {
            tableStr += "| ";
            for (var c=0; c<cols; c++) { tableStr += "Dato | "; }
            tableStr += "\n";
        }
        var editor = document.getElementById('editor-body');
        if (editor) {
            editor.value += tableStr;
            this.updateCounters();
            this.notify("Tabla de texto insertada ✓");
        }
    },

    // PUNTO 3: INSERTAR IMAGEN DE PERFIL (Vía URL o Base64 Tag)
    insertImage: function() {
        var url = prompt("Pega el link de tu foto o currículum aquí (ej. https://... o Base64):");
        if (!url) return;
        var editor = document.getElementById('editor-body');
        if (editor) {
            editor.value += "\n[IMAGEN_ADJUNTA: " + url + "]\n";
            this.updateCounters();
            this.notify("Etiqueta de imagen insertada ✓");
        }
    },

    expPDF: function() {
        this.notify("Exportando PDF...");
        var element = document.getElementById('unified-sel-container');
        var title = document.getElementById('editor-title').value.trim() || "guion";
        html2pdf().from(element).set({ margin: 15, filename: title + '.pdf' }).save();
    },

    expDOC: function() {
        var body = document.getElementById('editor-body').value;
        var title = document.getElementById('editor-title').value.trim() || "guion";
        var htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>" + title + "</title></head><body><h2>" + title + "</h2>" + body.replace(/\n/g, "<br>") + "</body></html>";
        var blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); 
        a.href = url; a.download = title + ".doc"; a.click();
        setTimeout(function() { URL.revokeObjectURL(url); }, 100);
        this.notify("Documento Word exportado ✓");
    }
};

document.addEventListener('DOMContentLoaded', function() {
    RetoricaUI.init();
    var savedTheme = localStorage.getItem('retorica_theme_pref');
    if (savedTheme === 'light') { document.body.classList.add('light-theme'); }
});
