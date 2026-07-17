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

        // --- CORRECCIÓN PUNTO 1 (PARTE 2): ALMACENAMIENTO PERSISTENTE CONTRA BORRADO DE CACHÉ ---
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persisted().then(function(persistent) {
                if (!persistent) {
                    navigator.storage.persist().then(function(granted) {
                        if (granted) {
                            console.log("Almacenamiento marcado como persistente protegido ✓");
                        }
                    });
                } else {
                    console.log("El almacenamiento ya estaba protegido ✓");
                }
            });
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
        
        // --- CORRECCIÓN PUNTO 2: INSTALACIÓN DE LA PWA (APP) ---
        window.deferredInstallPrompt = null;
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.deferredInstallPrompt = e;
            console.log("Retorica: Instalación PWA lista para ser reclamada por el usuario.");
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("¡Retórica lista para instalar en tu dispositivo! 📱");
            }
        });

        window.addEventListener('appinstalled', function(evt) {
            window.deferredInstallPrompt = null;
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("¡Retórica instalada con éxito!");
            }
        });
    },

    // --- CORRECCIÓN PUNTO 8: FUNCIÓN PARA COPIAR TODO AL PORTAPAPELES ---
    copyFullTemplate: function() {
        var title = document.getElementById('editor-title').value.trim();
        var body = document.getElementById('editor-body').value.trim();
        
        if (!title && !body) {
            this.notify("No hay contenido para copiar.");
            return;
        }
        
        var fullText = (title ? title + "\n\n" : "") + body;
        
        navigator.clipboard.writeText(fullText).then(function() {
            RetoricaUI.notify("¡Plantilla completa copiada! ✓");
        }).catch(function() {
            var dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.value = fullText;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            RetoricaUI.notify("Plantilla copiada ✓");
        });
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

// --- CORRECCIÓN PUNTO 2: DETONAR INSTALACIÓN NATIVA ---
    installPWA: function() {
        var promptEvent = window.deferredInstallPrompt;
        if (!promptEvent) {
            this.notify("La app ya está instalada o no está lista para instalación en este navegador.");
            return;
        }
        promptEvent.prompt();
        promptEvent.userChoice.then(function(choiceResult) {
            if (choiceResult.outcome === 'accepted') {
                console.log('El usuario aceptó la instalación de Retórica');
            } else {
                console.log('El usuario rechazó la instalación');
            }
            window.deferredInstallPrompt = null;
        });
    },
    
    initTouchGestures: function() {
        var self = this;
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
            if (view) {
                view.style.height = window.visualViewport.height + "px";
            }
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
        ...
        html2pdf().from(element).set(opt).save();
    },

    expPDFEditable: function() {
        this.notify("Generando PDF Formulario...");
        ...
        html2pdf().from(htmlForm).set(opt).save();
        this.notify("PDF Formulario listo ✓");
    },

    expDOC: function() {
        this.notify("Procesando Word nativo...");
        ...
        docx.Packer.toBlob(doc).then(function(blob) {
            saveAs(blob, title + ".docx");
            RetoricaUI.notify("Documento Word exportado ✓");
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    RetoricaUI.init();
    var savedTheme = localStorage.getItem('retorica_theme_pref');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
});
