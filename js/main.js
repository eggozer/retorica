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
        
        // Inicializar el motor de idiomas de la interfaz de forma segura
        if (typeof RetoricaI18n !== 'undefined') {
            RetoricaI18n.init();
            RetoricaI18n.setAppLang('es'); 
        }

        // Habilitar cierre por software deslizante (Swipe Gestures) a pantalla completa
        this.bindSwipeEvents();
        this.updateCounters();
    },

    toggleSidebar: function() {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    },

    bindSwipeEvents: function() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        var touchstartX = 0;
        var touchendX = 0;

        sidebar.addEventListener('touchstart', function(event) {
            touchstartX = event.changedTouches[0].screenX;
        }, { passive: true });

        sidebar.addEventListener('touchend', function(event) {
            touchendX = event.changedTouches[0].screenX;
            // Si el deslizamiento de derecha a izquierda supera el umbral táctil de resguardo
            if (touchstartX - touchendX > 60) {
                sidebar.classList.remove('active');
            }
        }, { passive: true });
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        this.notify("Paleta de color modificada.");
    },

    adjustZoom: function(delta) {
        var targetZoom = this.state.zoom + delta;
        
        if (targetZoom < 0.6) targetZoom = 0.6;
        if (targetZoom > 2.2) targetZoom = 2.2;
        
        this.state.zoom = targetZoom;
        
        var wrapper = document.getElementById('zoom-wrapper');
        if (wrapper) {
            wrapper.style.transform = "scale(" + targetZoom + ")";
        }

        var indicator = document.getElementById('zoom-indicator-tag');
        if (indicator) {
            indicator.innerText = Math.round(targetZoom * 100) + "%";
        }
    },

    clearEditor: function() {
        if (confirm("¿Limpiar el lienzo activo? Perderás los datos no guardados.")) {
            document.getElementById('editor-title').value = "";
            document.getElementById('editor-body').value = "";
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.activeDocId = null;
            }
            this.updateCounters();
            this.notify("Lienzo restaurado.");
        }
    },

    updateCounters: function() {
        var body = document.getElementById('editor-body') ? document.getElementById('editor-body').value : "";
        
        var chars = body.length;
        var words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
        var lines = body === "" ? 1 : body.split('\n').length;

        if (document.getElementById('count-chars')) document.getElementById('count-chars').innerText = "CHARS: " + chars;
        if (document.getElementById('count-words')) document.getElementById('count-words').innerText = "WORDS: " + words;
        if (document.getElementById('count-lines')) document.getElementById('count-lines').innerText = "LINES: " + lines;
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
        link.download = title + \".txt\";
        link.click();
        this.notify("Archivo TXT descargado.");
    }
};

// Inicialización estricta del ciclo de vida
window.onload = function() {
    RetoricaUI.init();
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=GOD_MODE')
    .then(function() { console.log("Retorica Service Worker Sincronizado."); })
    .catch(function(err) { console.error("Fallo de Service Worker: ", err); });
}
