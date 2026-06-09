
// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var RetoricaUI = {
    state: {
        zoom: 1.0
    },

    init: function() {
        // Enlazar eventos de teclado para actualizar contadores en tiempo real
        var editor = document.getElementById('editor-body');
        if (editor) {
            editor.oninput = function() {
                RetoricaUI.updateCounters();
            };
        }
        
        // Inicializar el motor de idiomas de la interfaz
        if (typeof RetoricaI18n !== 'undefined') {
            RetoricaI18n.init();
            RetoricaI18n.setAppLang('es'); // Forzar inicio en español base
        }

        RetoricaUI.updateCounters();
    },

    toggleSidebar: function() {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        this.notify("Paleta de color modificada.");
    },

    adjustZoom: function(delta) {
        var targetZoom = this.state.zoom + delta;
        
        // Límites estrictos del Zoómetro para evitar desbordes del Lienzo
        if (targetZoom < 0.6) targetZoom = 0.6;
        if (targetZoom > 2.2) targetZoom = 2.2;
        
        this.state.zoom = targetZoom;
        
        var wrapper = document.getElementById('zoom-wrapper');
        if (wrapper) {
            wrapper.style.transform = "scale(" + targetZoom + ")";
            wrapper.style.transformOrigin = "top left";
        }

        var tag = document.getElementById('zoom-indicator-tag');
        if (tag) {
            var percentage = Math.round(targetZoom * 100);
            var statusMsg = "(Normal)";
            if (targetZoom <= 0.6) statusMsg = "(Mínimo)";
            if (targetZoom >= 2.2) statusMsg = "(Máximo)";
            tag.innerText = percentage + "% " + statusMsg;
        }
    },

    updateCounters: function() {
        var editor = document.getElementById('editor-body');
        var text = editor ? editor.value : "";

        var charCount = text.length;
        var wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        var lineCount = text ? text.split('\n').length : 1;

        var elChars = document.getElementById('count-chars');
        var elWords = document.getElementById('count-words');
        var elLines = document.getElementById('count-lines');

        if (elChars) elChars.innerText = "CHARS: " + charCount;
        if (elWords) elWords.innerText = "WORDS: " + wordCount;
        if (elLines) elLines.innerText = "LINES: " + lineCount;
    },

    clearEditor: function() {
        var title = document.getElementById('editor-title');
        var body = document.getElementById('editor-body');
        
        if (title) title.value = "";
        if (body) body.value = "";
        
        if (typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.activeDocId = null;
        }
        
        this.updateCounters();
        this.notify("Lienzo reiniciado limpia y modularmente.");
    },

    notify: function(msg) {
        var toast = document.getElementById('toast-notif');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 2200);
    },

    expPDF: function() {
        this.notify("Generando PDF profesional...");
        var wrapper = document.getElementById('zoom-wrapper');
        var title = document.getElementById('editor-title').value.trim() || "guion";
        if (wrapper) {
            html2pdf().from(wrapper).save(title + ".pdf");
        }
    },

    expTXT: function() {
        var body = document.getElementById('editor-body').value;
        var title = document.getElementById('editor-title').value.trim() || "guion";
        var blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = title + ".txt";
        link.click();
        this.notify("Archivo TXT descargado.");
    }
};

// Disparador de Carga Estricta del Ciclo de Vida
window.onload = function() {
    RetoricaUI.init();
};

// Registro automático del Service Worker Modular
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=GOD_MODE')
    .then(function() { console.log("Retorica PWA: Service Worker enlazado ✓"); })
    .catch(function(err) { console.error("Error PWA Register: ", err); });
}
