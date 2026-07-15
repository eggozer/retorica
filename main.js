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
        
        // --- CORRECCIÓN PUNTO 2: INSTALACIÓN DE LA PWA (APP) ---
        window.deferredInstallPrompt = null;
        window.addEventListener('beforeinstallprompt', function(e) {
            // Previene que el navegador la lance automáticamente de forma invasiva
            e.preventDefault();
            // Guarda el evento para que lo podamos detonar cuando tú decidas
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
        // -------------------------------------------------------
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
        var element = document.getElementById('unified-sel-container');
        var title = document.getElementById('editor-title').value.trim() || "guion";
        
        // Clonamos temporalmente para asegurar un renderizado A4 limpio e impecable
        var opt = {
            margin: 15,
            filename: title + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    },

    expPDFEditable: function() {
        this.notify("Generando PDF Formulario...");
        var title = document.getElementById('editor-title').value.trim() || "guion_editable";
        var bodyValue = document.getElementById('editor-body').value;
        
        var htmlForm = document.createElement('div');
        htmlForm.style.padding = "20px";
        htmlForm.style.color = "#000000";
        htmlForm.innerHTML = "<h2>" + title + "</h2><br><textarea style='width:100%; height:500px; font-family:Arial; font-size:12pt; border:1px solid #ccc; padding:10px;'>" + bodyValue + "</textarea>";
        
        var opt = {
            margin: 15,
            filename: title + '_editable.pdf',
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(htmlForm).set(opt).save();
        this.notify("PDF Formulario listo ✓");
    },

    expDOC: function() {
        this.notify("Procesando Word nativo...");
        var title = document.getElementById('editor-title').value.trim() || "guion";
        var bodyText = document.getElementById('editor-body').value;

        // Inyección de la librería pesada DOCX en lugar del blob plano viejo
        var paragraphs = bodyText.split('\n').map(function(line) {
            return new docx.Paragraph({
                children: [new docx.TextRun({ text: line, size: 24 })],
                spacing: { after: 120 }
            });
        });

        var doc = new docx.Document({
            sections: [{
                properties: {},
                children: [
                    new docx.Paragraph({
                        children: [new docx.TextRun({ text: title, bold: true, size: 36 })],
                        alignment: docx.AlignmentType.CENTER,
                        spacing: { after: 300 }
                    }),
                    ...paragraphs
                ]
            }]
        });

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
