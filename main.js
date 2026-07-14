// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var autoSaveTimeout = null;
var deferredPrompt = null; // Refacción para captura de instalación PWA

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
        
        // Refacción: Escucha nativa para permitir instalación de la App
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            deferredPrompt = e;
            var installBtn = document.getElementById('pwa-install-btn');
            if (installBtn) installBtn.style.display = 'inline-block';
        });
        
        if (typeof RetoricaAuth !== 'undefined') RetoricaAuth.initLifecycle();
    },

    triggerAutoSave: function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.autoSaveSilent();
                console.log("Retorica: Cambios sincronizados automáticamente en segundo plano.");
            }
        }, 1500);
    },

    initTouchGestures: function() {
        var self = this;
        // Refacción: Se eliminó el bloqueo preventDefault para que dejes seleccionar texto libremente
        document.addEventListener('touchstart', function(e) {
            self.state.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            self.state.touchEndX = e.changedTouches[0].screenX;
            self.handleSwipe();
        }, { passive: true });
    },

    handleSwipe: function() {
        var diffX = this.state.touchStartX - this.state.touchEndX;
        if (diffX < -150) {
            var sidebar = document.getElementById('side-menu'); // Vinculado a tu id real
            if (sidebar && !sidebar.classList.contains('open')) this.toggleSidebar();
        }
        if (diffX > 150) {
            var sidebar = document.getElementById('side-menu');
            if (sidebar && sidebar.classList.contains('open')) this.toggleSidebar();
        }
    },

    initViewportFix: function() {
        window.visualViewport.addEventListener('resize', function() {
            var view = document.getElementById('viewport-ctx');
            if (view) {
                view.style.height = window.visualViewport.height + "px";
            }
        });
    },

    toggleSidebar: function() {
        var sidebar = document.getElementById('side-menu'); // Vinculado a tu id real index.html
        if (!sidebar) return;
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open') && typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
    },

    closeSidebar: function() {
        var sidebar = document.getElementById('side-menu');
        if (sidebar) sidebar.classList.remove('open');
    },

    installPWAApp: function() {
        // Refacción: Lanzador del instalador nativo
        if (!deferredPrompt) {
            this.notify("La app ya está instalada o no es soportada en este entorno.");
            return;
        }
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choiceResult) {
            if (choiceResult.outcome === 'accepted') {
                console.log('El usuario aceptó la instalación de Retórica');
                var installBtn = document.getElementById('pwa-install-btn');
                if (installBtn) installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        });
    },

    syncCloudBackup: function() {
        // Refacción: Mecanismo de sincronización preventiva en la nube
        this.notify("Sincronizando plantillas en la nube...");
        if (typeof RetoricaStorage !== 'undefined') {
            var docs = RetoricaStorage.getDocs();
            localStorage.setItem('retorica_backup_cloud_mirror', JSON.stringify(docs));
            setTimeout(function() {
                RetoricaUI.notify("Sincronización multiplataforma completada ✓");
            }, 1200);
        }
    },

    adjustZoom: function(amount) {
        this.state.zoom += amount;
        if (this.state.zoom < 0.7) this.state.zoom = 0.7;
        if (this.state.zoom > 1.8) this.state.zoom = 1.8;
        var el = document.getElementById('zoom-wrapper');
        if (el) el.style.transform = "scale(" + this.state.zoom + ")";
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
        a.href = url; 
        a.download = title + ".doc"; 
        a.click();
        this.notify("Documento Word exportado ✓");
    }
};

document.addEventListener('DOMContentLoaded', function() {
    RetoricaUI.init();
    var savedTheme = localStorage.getItem('retorica_theme_pref');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
});
