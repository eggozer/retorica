// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var RetoricaUI = {
    state: { zoom: 1.0, deferredPrompt: null },

    init: function() {
        var editor = document.getElementById('editor-body');
        if (editor) { 
            editor.oninput = function() { RetoricaUI.updateCounters(); }; 
        }
        if (typeof RetoricaI18n !== 'undefined') { 
            RetoricaI18n.init(); 
            RetoricaI18n.setAppLang('es'); 
        }
        
        this.bindSwipeEvents();
        this.updateCounters();
        this.listenPWAInstallation();
        
        if (typeof RetoricaAuth !== 'undefined') { 
            RetoricaAuth.initLifecycle(); 
        }
    },

    toggleSidebar: function() {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
        if (sidebar && sidebar.classList.contains('active') && typeof RetoricaAdmin !== 'undefined') {
            RetoricaAdmin.renderUsers();
        }
    },

    bindSwipeEvents: function() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        var touchstartX = 0;
        var touchendX = 0;

        // Escuchadores estructurados de forma tradicional sin parámetros que congelen el hardware antiguo
        sidebar.addEventListener('touchstart', function(e) { 
            touchstartX = e.changedTouches[0].screenX; 
        });

        sidebar.addEventListener('touchend', function(e) {
            touchendX = e.changedTouches[0].screenX;
            if (touchstartX - touchendX > 60) { 
                sidebar.classList.remove('active'); 
            }
        });
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        this.notify("Paleta de color modificada.");
    },

    adjustZoom: function(delta) {
        var targetZoom = this.state.zoom + delta;
        if (targetZoom < 0.6) targetZoom = 0.6;
        if (targetZoom > 2.0) targetZoom = 2.0;
        this.state.zoom = targetZoom;
        
        var wrapper = document.getElementById('zoom-wrapper');
        if (wrapper) { 
            wrapper.style.transform = "scale(" + targetZoom + ")"; 
        }
    },

    updateCounters: function() {
        var body = document.getElementById('editor-body') ? document.getElementById('editor-body').value : "";
        var chars = body.length;
        var words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
        var lines = body === "" ? 1 : body.split('\n').length;

        var countCharsEl = document.getElementById('count-chars');
        var countWordsEl = document.getElementById('count-words');
        var countLinesEl = document.getElementById('count-lines');

        if (countCharsEl) countCharsEl.innerText = "CHARS: " + chars;
        if (countWordsEl) countWordsEl.innerText = "WORDS: " + words;
        if (countLinesEl) countLinesEl.innerText = "LINES: " + lines;
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
        if (wrapper && typeof html2pdf !== 'undefined') {
            var opt = {
                margin: 10,
                filename: title + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(wrapper).set(opt).save();
        }
    },

    expDOC: function() {
        var body = document.getElementById('editor-body').value;
        var title = document.getElementById('editor-title').value.trim() || "guion";
        var htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>" + title + "</title><style>body{font-family:Arial;line-height:1.6;}</style></head><body>" + body.replace(/\n/g, "<br>") + "</body></html>";
        var blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); 
        a.href = url; 
        a.download = title + ".doc"; 
        a.click();
        this.notify("Documento de Word (.doc) generado.");
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
    },

    listenPWAInstallation: function() {
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            RetoricaUI.state.deferredPrompt = e;
            var installBtn = document.getElementById('btn-install-pwa');
            if (installBtn) installBtn.style.display = 'block';
        });
        window.addEventListener('appinstalled', function() {
            RetoricaUI.state.deferredPrompt = null;
            var installBtn = document.getElementById('btn-install-pwa');
            if (installBtn) installBtn.style.display = 'none';
            RetoricaUI.notify("¡Retórica instalada con éxito!");
        });
    },

    triggerInstallPWA: function() {
        var promptEvent = this.state.deferredPrompt; 
        if (!promptEvent) return;
        promptEvent.prompt();
        promptEvent.userChoice.then(function(choiceResult) {
            RetoricaUI.state.deferredPrompt = null;
            var installBtn = document.getElementById('btn-install-pwa');
            if (installBtn) installBtn.style.display = 'none';
        });
    }
};

// Inicialización estricta al cargar la ventana
window.onload = function() { 
    RetoricaUI.init(); 
};

// Registro seguro del Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=GOD_MODE')
    .then(function() { console.log("Retorica Service Worker Sincronizado Físicamente ✓"); })
    .catch(function(err) { console.error("Fallo de Service Worker en este motor WebView:", err); });
}
