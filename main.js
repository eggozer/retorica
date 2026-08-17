// --- RETÓRICA MAIN INTERFACE & EXPORT ENGINE (main.js) ---
var autoSaveTimeout = null;

var RetoricaUI = {
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

        this.updateCounters();
    },

    notify: function(msg) {
        var toast = document.getElementById('toast-notif');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 2500);
    },

    updateCounters: function() {
        var editor = document.getElementById('editor-body');
        if (!editor) return;

        var text = editor.innerText || '';
        var chars = text.length;
        var words = text.trim() ? text.trim().split(/\s+/).length : 0;
        var lines = text ? text.split('\n').length : 1;

        var charEl = document.getElementById('count-chars');
        var wordEl = document.getElementById('count-words');
        var lineEl = document.getElementById('count-lines');

        if (charEl) charEl.innerText = 'CHARS: ' + chars;
        if (wordEl) wordEl.innerText = 'WORDS: ' + words;
        if (lineEl) lineEl.innerText = 'LINES: ' + lines;
    },

    triggerAutoSave: function() {
        if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.save();
            }
        }, 1000);
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        var isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('retorica_theme_pref', isLight ? 'light' : 'dark');
        this.notify(isLight ? "Tema Claro" : "Tema Oscuro");
    },

    // Exportación directa a PDF limpia
    expPDF: function() {
        var editor = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');
        
        if (!editor || !editor.innerText.trim()) {
            this.notify("No hay texto para exportar");
            return;
        }

        var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : 'Documento_Retorica';

        var element = document.createElement('div');
        element.style.padding = '30px';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.fontSize = '12pt';
        element.style.lineHeight = '1.6';
        element.style.color = '#000000';
        element.style.backgroundColor = '#ffffff';

        var h1 = document.createElement('h1');
        h1.style.textAlign = 'center';
        h1.style.marginBottom = '20px';
        h1.style.fontSize = '18pt';
        h1.innerText = title.toUpperCase();
        element.appendChild(h1);

        var p = document.createElement('div');
        p.style.whiteSpace = 'pre-wrap';
        p.innerText = editor.innerText;
        element.appendChild(p);

        var opt = {
            margin:       15,
            filename:     title + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        if (typeof html2pdf !== 'undefined') {
            this.notify("Generando PDF...");
            html2pdf().set(opt).from(element).save().then(function() {
                RetoricaUI.notify("PDF exportado ✓");
            });
        } else {
            this.notify("Librería PDF no cargada");
        }
    },

    // Exportación directa a Word (.docx) limpia
    expDOC: function() {
        var editor = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');

        if (!editor || !editor.innerText.trim()) {
            this.notify("No hay texto para exportar");
            return;
        }

        if (typeof docx === 'undefined') {
            this.notify("Librería Word no cargada");
            return;
        }

        var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : 'Documento_Retorica';
        var text = editor.innerText;
        var lines = text.split('\n');

        var docxInstance = window.docx;
        var paragraphs = [];

        var headerParagraph = new docxInstance.Paragraph({
            children: [new docxInstance.TextRun({ text: title.toUpperCase(), bold: true, size: 32, color: "000000" })],
            alignment: docxInstance.AlignmentType.CENTER,
            spacing: { after: 300 }
        });
        paragraphs.push(headerParagraph);

        lines.forEach(function(line) {
            paragraphs.push(new docxInstance.Paragraph({
                children: [new docxInstance.TextRun({ text: line, size: 24 })],
                spacing: { after: 120 }
            }));
        });

        var doc = new docxInstance.Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });

        this.notify("Generando Word...");
        docxInstance.Packer.toBlob(doc).then(function(blob) {
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, title + ".docx");
            } else {
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = title + ".docx";
                link.click();
            }
            RetoricaUI.notify("Word exportado ✓");
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
