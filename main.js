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
            // SI EL CLIC O TOQUE VIENE DE LAS BOTONERAS HORIZONTALES, IGNORAR LA GESTIÓN DE SWIPE
            if (e.target.closest('.top-navbar') || e.target.closest('#carousel-panel-languages')) {
                self.state.touchStartX = 0; // Reseteamos para que no haga swipe
                return;
            }
            self.state.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            // IGUALMENTE IGNORAMOS EN EL TOCHEND
            if (e.target.closest('.top-navbar') || e.target.closest('#carousel-panel-languages') || self.state.touchStartX === 0) {
                return;
            }
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
        
        // Creamos un clon temporal para evitar distorsiones visuales en el editor activo
        var clone = element.cloneNode(true);
        clone.style.padding = "20px";
        clone.style.background = "#ffffff";
        clone.style.color = "#000000";
        clone.style.width = "100%";
        
        // Forzar estilos limpios de impresión en el clon
        var titleEl = clone.querySelector('#editor-title');
        var bodyEl = clone.querySelector('#editor-body');
        if (titleEl) {
            titleEl.style.color = "#000000";
            titleEl.style.borderBottom = "1px solid #000000";
        }
        if (bodyEl) {
            bodyEl.style.color = "#000000";
            bodyEl.style.whiteSpace = "pre-wrap"; // Respeta los saltos de línea en el PDF
        }

        var opt = {
            margin: 15,
            filename: title + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().from(clone).set(opt).save().then(function() {
            RetoricaUI.notify("PDF descargado con éxito ✓");
        });
    },

    expPDFEditable: function() {
        this.notify("Generando PDF Formulario...");
        var title = document.getElementById('editor-title').value.trim() || "guion_editable";
        var bodyValue = document.getElementById('editor-body').value;
        
        var htmlForm = document.createElement('div');
        htmlForm.style.padding = "25px";
        htmlForm.style.color = "#000000";
        htmlForm.style.background = "#ffffff";
        htmlForm.style.fontFamily = "Arial, sans-serif";
        
        // Estructura visual simulando un documento editable real que html2pdf puede digerir
        htmlForm.innerHTML = 
            "<h2 style='border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 15px;'>" + title + "</h2>" +
            "<p style='font-size: 0.8rem; color: #666; margin-bottom: 10px;'><i>* Este documento permite edición de texto directa en lectores PDF compatibles.</i></p>" +
            "<div contenteditable='true' style='width:100%; min-height:500px; border:1px solid #999; padding:15px; border-radius:4px; font-size:11pt; line-height:1.6; white-space: pre-wrap; background:#fafafa; outline:none;'>" + 
                bodyValue + 
            "</div>";
        
        var opt = {
            margin: 15,
            filename: title + '_editable.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().from(htmlForm).set(opt).save().then(function() {
            RetoricaUI.notify("PDF Formulario listo ✓");
        });
    },

    expDOC: function() {
        this.notify("Procesando Word nativo...");
        var title = document.getElementById('editor-title').value.trim() || "guion";
        var bodyText = document.getElementById('editor-body').value;

        // Validar si la librería docx está correctamente instanciada en el navegador
        var docxInstance = window.docx;
        if (!docxInstance) {
            RetoricaUI.notify("Error: Librería Word no cargada. Revisa la conexión.");
            return;
        }

        // Dividir el texto en párrafos de Word
        var paragraphs = bodyText.split('\n').map(function(line) {
            return new docxInstance.Paragraph({
                children: [new docxInstance.TextRun({ text: line, size: 24 })],
                spacing: { after: 120 }
            });
        });

        // Crear el encabezado principal
        var headerParagraph = new docxInstance.Paragraph({
            children: [new docxInstance.TextRun({ text: title.toUpperCase(), bold: true, size: 36, color: "000000" })],
            alignment: docxInstance.AlignmentType.CENTER,
            spacing: { after: 300 }
        });

        // Concatenar de forma segura evitando problemas de compatibilidad del operador Spread (...)
        var documentChildren = [headerParagraph].concat(paragraphs);

        // Crear documento usando la instancia validada
        var doc = new docxInstance.Document({
            sections: [{
                properties: {},
                children: documentChildren
            }]
        });

        docxInstance.Packer.toBlob(doc).then(function(blob) {
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, title + ".docx");
                RetoricaUI.notify("Documento Word exportado ✓");
            } else {
                // Fallback por si FileSaver no cargó a tiempo en celular
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = title + ".docx";
                link.click();
                RetoricaUI.notify("Word descargado vía fallback ✓");
            }
        }).catch(function(err) {
            console.error("Error en DOCX Packer: ", err);
            RetoricaUI.notify("Error al compilar el archivo Word.");
        });
    }, // <-- Se agregó la coma aquí

    openCarousel: function(type) {
        var panel = document.getElementById('carousel-panel-languages');
        var track = document.getElementById('carousel-slider-track');
        if (!panel || !track) return;

        var isVisible = panel.style.display === 'block';
        if (isVisible && panel.dataset.currentType === type) {
            panel.style.display = 'none';
            return;
        }

        // Posicionamiento dinámico relativo a la barra de navegación
        var navBar = document.querySelector('.top-navbar');
        if (navBar) {
            panel.style.position = 'fixed';
            panel.style.top = navBar.getBoundingClientRect().bottom + 'px';
            panel.style.left = '0';
            panel.style.width = '100%';
        }

        panel.style.display = 'block';
        panel.dataset.currentType = type;
        if (typeof this.renderCarouselTracks === 'function') {
            this.renderCarouselTracks(type);
        }
    } // <-- Se quitó la llave extra que sobraba aquí
};

document.addEventListener('DOMContentLoaded', function() {
    RetoricaUI.init();
    var savedTheme = localStorage.getItem('retorica_theme_pref');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
});
