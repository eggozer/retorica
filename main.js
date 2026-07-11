// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var autoSaveTimeout = null;

var RetoricaUI = {
    state: { zoom: 1.0, touchStartX: 0, touchEndX: 0 },

    init: function() {
        var editor = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');

        // Inicializa el motor de lenguajes e internacionalización si existe
        if (typeof RetoricaI18n !== 'undefined') RetoricaI18n.init();

        // Control antipérdida reactivo en tiempo real
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
        
        // Enfoque elástico táctil del contenedor unificado
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
        
        // Inicializa ciclo de vida crítico de autenticación
        if (typeof RetoricaAuth !== 'undefined') RetoricaAuth.initLifecycle();

        // Carga automática del último documento editado para evitar pérdida en recarga accidental
        var lastEditedId = localStorage.getItem('retorica_last_doc_id');
        if (lastEditedId && typeof RetoricaStorage !== 'undefined') {
            var docs = RetoricaStorage.getDocs();
            if (docs[lastEditedId]) {
                RetoricaStorage.currentDocId = lastEditedId;
                if (titleInput) titleInput.value = docs[lastEditedId].title || "";
                if (editor) editor.value = docs[lastEditedId].body || "";
                this.updateCounters();
            }
        }
    },

    triggerAutoSave: function() {
        if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.save();
            }
        }, 3000); // Guardado silencioso cada 3 segundos tras parar de escribir
    },

    updateCounters: function() {
        var body = document.getElementById('editor-body');
        var txt = body ? body.value : "";
        
        var chars = txt.length;
        var words = txt.trim() === "" ? 0 : txt.trim().split(/\s+/).length;
        var lines = txt === "" ? 1 : txt.split('\n').length;

        var lblChars = document.getElementById('count-chars');
        var lblWords = document.getElementById('count-words');
        var lblLines = document.getElementById('count-lines');

        if (lblChars) lblChars.innerText = "CHARS: " + chars;
        if (lblWords) lblWords.innerText = "WORDS: " + words;
        if (lblLines) lblLines.innerText = "LINES: " + lines;
    },

    cleanCanvas: function() {
        var title = document.getElementById('editor-title');
        var body = document.getElementById('editor-body');
        if (title) title.value = "";
        if (body) body.value = "";
        if (typeof RetoricaStorage !== 'undefined') RetoricaStorage.currentDocId = null;
        localStorage.removeItem('retorica_last_doc_id');
        this.updateCounters();
        this.notify("Lienzo limpio para nuevo guion.");
    },

    notify: function(msg) {
        var toast = document.getElementById('toast-notif');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 2500);
    },

    initTouchGestures: function() {
        var self = this;
        document.addEventListener('touchstart', function(e) {
            self.state.touchStartX = e.changedTouches[0].screenX;
        }, false);

        document.addEventListener('touchend', function(e) {
            self.state.touchEndX = e.changedTouches[0].screenX;
            self.handleSwipe();
        }, false);
    },

    handleSwipe: function() {
        var sidebar = document.getElementById('app-sidebar');
        if (!sidebar) return;
        var diff = this.state.touchEndX - this.state.touchStartX;
        
        // Swipe a la derecha abre la barra lateral, swipe a la izquierda la oculta
        if (diff > 120) {
            sidebar.style.transform = "translateX(0px)";
        } else if (diff < -120) {
            sidebar.style.transform = "translateX(-260px)";
        }
    },

    initViewportFix: function() {
        // Corrección nativa elástica para navegadores en Android/iOS (Mobile Viewport Reset)
        window.visualViewport.addEventListener('resize', function() {
            var view = document.getElementById('viewport-ctx');
            if (view) {
                view.style.height = window.visualViewport.height + "px";
            }
        });
    },

    expPDF: function() {
        this.notify("Generando PDF local...");
        var element = document.getElementById('unified-sel-container');
        var title = document.getElementById('editor-title').value.trim() || "retorica_export";
        if (typeof html2pdf !== 'undefined') {
            html2pdf().from(element).set({
                margin: 15,
                filename: title + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save();
        } else {
            alert("Librería PDF no cargada.");
        }
    },

    expDOC: function() {
        var body = document.getElementById('editor-body').value;
        var title = document.getElementById('editor-title').value.trim() || "retorica_export";
        var htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>" + title + "</title></head><body><h2>" + title + "</h2>" + body.replace(/\n/g, "<br>") + "</body></html>";
        var blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); 
        a.href = url; 
        a.download = title + ".doc"; 
        a.click();
        setTimeout(function() { URL.revokeObjectURL(url); }, 100);
        this.notify("Documento Word exportado ✓");
    }
};

// Disparador del arranque de la App al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    RetoricaUI.init();
});
