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
        
        // Disparar ciclo de autenticación local e inyección offline de forma estricta
        if (typeof RetoricaAuth !== 'undefined') { 
            RetoricaAuth.initLifecycle(); 
        }
    },
    
    toggleSidebar: function() {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    },
    
    bindSwipeEvents: function() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        var touchstartX = 0, touchendX = 0;
        sidebar.addEventListener('touchstart', function(e) { touchstartX = e.changedTouches[0].screenX; }, { passive: true });
        sidebar.addEventListener('touchend', function(e) {
            touchendX = e.changedTouches[0].screenX;
            if (touchstartX - touchendX > 60) { sidebar.classList.remove('active'); }
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
        if (wrapper) { wrapper.style.transform = "scale(" + targetZoom + ")"; }
    },
    
    updateCounters: function() {
        var editor = document.getElementById('editor-body');
        var txt = editor ? editor.value : "";
        var chars = txt.length;
        var words = txt.trim() === "" ? 0 : txt.trim().split(/\s+/).length;
        var lines = txt === "" ? 1 : txt.split('\n').length;
        
        var cChars = document.getElementById('count-chars');
        var cWords = document.getElementById('count-words');
        var cLines = document.getElementById('count-lines');
        
        if (cChars) cChars.innerText = "CHARS: " + chars;
        if (cWords) cWords.innerText = "WORDS: " + words;
        if (cLines) cLines.innerText = "LINES: " + lines;
    },
    
    notify: function(msg) {
        var toast = document.getElementById('toast-notif');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2200);
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

window.onload = function() { RetoricaUI.init(); };

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=GOD_MODE')
    .then(function() { console.log("Retorica Service Worker Sincronizado Físicamente ✓"); })
    .catch(function(err) { console.error("Error en Service Worker:", err); });
}
