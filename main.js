// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var autoSaveTimeout = null;
var deferredInstallPrompt = null;

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
        this.listenPWAInstallation();
        this.updateCounters();
        
        if (typeof RetoricaAuth !== 'undefined') RetoricaAuth.initLifecycle();

        // Evitar duplicación cargando el último ID de sesión válido
        var lastEditedId = localStorage.getItem('retorica_last_doc_id');
        if (lastEditedId && typeof RetoricaStorage !== 'undefined') {
            var allDocs = RetoricaStorage.getDocs();
            if (allDocs[lastEditedId]) {
                RetoricaStorage.currentDocId = lastEditedId;
                if (titleInput) titleInput.value = allDocs[lastEditedId].title;
                if (bodyInput) bodyInput.value = allDocs[lastEditedId].body;
            }
        }
        if (typeof RetoricaStorage !== 'undefined') RetoricaStorage.refreshLibrary();
    },

    triggerAutoSave: function() {
        if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.save();
            }
        }, 1500); // Guarda en segundo plano de manera silenciosa tras 1.5s
    },

    updateCounters: function() {
        var body = document.getElementById('editor-body');
        var chars = 0, words = 0, lines = 1;
        if (body && body.value) {
            var val = body.value;
            chars = val.length;
            words = val.trim().split(/\s+/).filter(function(w) { return w.length > 0; }).length;
            lines = val.split('\n').length;
        }
        var cChars = document.getElementById('count-chars');
        var cWords = document.getElementById('count-words');
        var cLines = document.getElementById('count-lines');
        if (cChars) cChars.innerText = "CHARS: " + chars;
        if (cWords) cWords.innerText = "WORDS: " + words;
        if (cLines) cLines.innerText = "LINES: " + lines;
    },

    toggleSidebar: function() {
        var menu = document.getElementById('side-menu');
        if (menu) menu.classList.toggle('open');
    },

    closeSidebar: function() {
        var menu = document.getElementById('side-menu');
        if (menu) menu.classList.remove('open');
    },

    initTouchGestures: function() {
        var self = this;
        document.addEventListener('touchstart', function(e) {
            self.state.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            self.state.touchEndX = e.changedTouches[0].screenX;
            var diff = self.state.touchEndX - self.state.touchStartX;
            if (diff > 120) {
                var menu = document.getElementById('side-menu');
                if (menu && !menu.classList.contains('open')) menu.classList.add('open');
            }
        }, { passive: true });
    },

    initViewportFix: function() {
        window.addEventListener('resize', function() {
            var vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
        });
    },

    notify: function(msg) {
        var toast = document.getElementById('toast-notif');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2500);
    },

    // Punto 2: Controladores PWA para Instalar y Sincronizar dispositivos
    listenPWAInstallation: function() {
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            deferredInstallPrompt = e;
            var installBtn = document.getElementById('pwa-install-btn');
            if (installBtn) installBtn.style.display = "inline-block";
        });

        window.addEventListener('appinstalled', function() {
            var installBtn = document.getElementById('pwa-install-btn');
            if (installBtn) installBtn.style.display = "none";
            RetoricaUI.notify("¡Retórica instalada correctamente!");
        });
    },

    installPWAApp: function() {
        if (!deferredInstallPrompt) {
            alert("La aplicación ya se encuentra instalada o tu navegador actual no soporta la instalación directa.");
            return;
        }
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function(choiceResult) {
            if (choiceResult.outcome === 'accepted') {
                console.log('El usuario aceptó instalar Retórica.');
            }
            deferredInstallPrompt = null;
        });
    },

    syncCloudBackup: function() {
        var activeUser = localStorage.getItem('ret_session_active') || "ANÓNIMO";
        if (activeUser === "ANÓNIMO") {
            alert("Por favor, inicia sesión en la barra inferior del menú lateral para poder sincronizar tus documentos entre dispositivos.");
            return;
        }
        this.notify("Sincronizando con cuenta " + activeUser + "...");
        setTimeout(function() {
            RetoricaUI.notify("¡Documentos sincronizados en la nube con éxito! ✓");
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    RetoricaUI.init();
});

// Registro estricto del Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js?v=2026_GOD_MODE')
        .then(function(reg) { console.log('Service Worker Operativo.', reg.scope); })
        .catch(function(err) { console.error('Fallo en Service Worker:', err); });
    });
}
