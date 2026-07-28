var autoSaveTimeout = null;

var RetoricaUI = {
    state: { zoom: 1.0, touchStartX: 0, touchEndX: 0 },

    init: function() {
        var editor = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');

        if (typeof RetoricaI18n !== 'undefined') {
            RetoricaI18n.init();
        }

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

        var lastDocId = localStorage.getItem('retorica_last_doc_id');
        if (lastDocId && typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.loadDoc(lastDocId);
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
    },

    newDocumentAction: function() {
        if (typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.createNewDoc();
        }
    },

    copyFullTemplate: function() {
        var title = document.getElementById('editor-title').value.trim();
        var body = document.getElementById('editor-body').value.trim();
        
        if (!title && !body) {
            this.notify("No hay contenido para copiar.");
            return;
        }
        
        var fullText = (title ? title + "\n\n" : "") + body;
        
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = fullText;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        RetoricaUI.notify("Plantilla copiada ✓");
    },

    triggerAutoSave: function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.autoSaveSilent();
            }
        }, 1500);
    },

    initTouchGestures: function() {
        var self = this;
        document.addEventListener('touchstart', function(e) {
            if (e.target.closest && (e.target.closest('.top-navbar') || e.target.closest('#accordion-languages') || e.target.closest('.main-view'))) {
                self.state.touchStartX = 0;
                return;
            }
            self.state.touchStartX = e.changedTouches[0].screenX;
        }, false);

        document.addEventListener('touchend', function(e) {
            if (e.target.closest && (e.target.closest('.top-navbar') || e.target.closest('#accordion-languages') || self.state.touchStartX === 0)) {
                return;
            }
            self.state.touchEndX = e.changedTouches[0].screenX;
            self.handleSwipe();
        }, false);
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
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
                var view = document.getElementById('viewport-ctx');
                if (view) {
                    view.style.height = window.visualViewport.height + "px";
                }
            });
        }
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
        this.notify("Exportando PDF completo...");
        var title = document.getElementById('editor-title').value.trim() || "Promociones Mega";
        var bodyText = document.getElementById('editor-body').value;

        var pdfContainer = document.createElement('div');
        pdfContainer.style.padding = "30px";
        pdfContainer.style.background = "#ffffff";
        pdfContainer.style.color = "#000000";
        pdfContainer.style.fontFamily = "sans-serif";
        pdfContainer.style.width = "790px"; 

        pdfContainer.innerHTML = 
            "<h1 style='font-size:20pt; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:20px; text-transform:uppercase;'>" + title + "</h1>" +
            "<div style='font-size:12pt; line-height:1.6; white-space: pre-wrap; word-wrap: break-word;'>" + bodyText + "</div>";

        document.body.appendChild(pdfContainer);

        var opt = {
            margin: 10,
            filename: title + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().from(pdfContainer).set(opt).save().then(function() {
            document.body.removeChild(pdfContainer);
            RetoricaUI.notify("PDF descargado con éxito ✓");
        });
    },

    expPDFEditable: function() {
        this.notify("Generando PDF Formulario...");
        var title = document.getElementById('editor-title').value.trim() || "Promociones Mega Editable";
        var bodyValue = document.getElementById('editor-body').value;
        
        var htmlForm = document.createElement('div');
        htmlForm.style.padding = "30px";
        htmlForm.style.color = "#000000";
        htmlForm.style.background = "#ffffff";
        htmlForm.style.fontFamily = "sans-serif";
        htmlForm.style.width = "790px";
        
        htmlForm.innerHTML = 
            "<h1 style='border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 15px; font-size:18pt;'>" + title + "</h1>" +
            "<p style='font-size: 0.8rem; color: #666; margin-bottom: 10px;'><i>* Este documento permite edición de texto directa en lectores PDF compatibles.</i></p>" +
            "<div contenteditable='true' style='width:100%; min-height:600px; border:1px solid #999; padding:15px; border-radius:4px; font-size:11pt; line-height:1.6; white-space: pre-wrap; word-wrap: break-word; background:#fafafa; outline:none;'>" + 
                bodyValue + 
            "</div>";
        
        document.body.appendChild(htmlForm);

        var opt = {
            margin: 10,
            filename: title + '_editable.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().from(htmlForm).set(opt).save().then(function() {
            document.body.removeChild(htmlForm);
            RetoricaUI.notify("PDF Formulario listo ✓");
        });
    },

    expDOC: function() {
        this.notify("Procesando Word nativo...");
        var title = document.getElementById('editor-title').value.trim() || "guion";
        var bodyText = document.getElementById('editor-body').value;

        var docxInstance = window.docx;
        if (!docxInstance) {
            RetoricaUI.notify("Error: Librería Word no cargada.");
            return;
        }

        var paragraphs = bodyText.split('\n').map(function(line) {
            return new docxInstance.Paragraph({
                children: [new docxInstance.TextRun({ text: line, size: 24 })],
                spacing: { after: 120 }
            });
        });

        var headerParagraph = new docxInstance.Paragraph({
            children: [new docxInstance.TextRun({ text: title.toUpperCase(), bold: true, size: 36, color: "000000" })],
            alignment: docxInstance.AlignmentType.CENTER,
            spacing: { after: 300 }
        });

        var documentChildren = [headerParagraph].concat(paragraphs);

        var doc = new docxInstance.Document({
            sections: [{
                properties: {},
                children: documentChildren
            }]
        });

        docxInstance.Packer.toBlob(doc).then(function(blob) {
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, title + ".docx");
                RetoricaUI.notify("Word exportado ✓");
            } else {
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = title + ".docx";
                link.click();
                RetoricaUI.notify("Word descargado ✓");
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    try {
        RetoricaUI.init();
        var savedTheme = localStorage.getItem('retorica_theme_pref');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    } catch (err) {
        console.error("Error al inicializar Retórica:", err);
    }
});
