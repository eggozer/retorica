// Procesador de Documentos y Exportación para Retórica (Compatibilidad ES5 / Android 5+)

var DocEditor = {
    editorElement: null,

    // 1. Inicialización del Lienzo WYSIWYG
    init: function(elementId) {
        this.editorElement = document.getElementById(elementId);
        if (this.editorElement) {
            this.editorElement.contentEditable = "true";
            this.editorElement.style.outline = "none";
            this.editorElement.style.minHeight = "300px";
            this.editorElement.style.padding = "15px";
        }
    },

    // 2. Ejecutar Formatos de Texto (Negrita, Itálica, Subrayado, Alineación)
    execCmd: function(command, value) {
        var val = value || null;
        document.execCommand(command, false, val);
    },

    // 3. Inserción de Tablas
    insertTable: function(rows, cols) {
        var r = rows || 2;
        var c = cols || 2;
        var html = '<table border="1" style="width:100%; border-collapse:collapse; margin:10px 0;">';
        
        for (var i = 0; i < r; i++) {
            html += '<tr>';
            for (var j = 0; j < c; j++) {
                html += '<td style="padding:8px; border:1px solid #ccc;">&nbsp;</td>';
            }
            html += '</tr>';
        }
        html += '</table><p>&nbsp;</p>';
        
        this.execCmd('insertHTML', html);
    },

    // 4. Inserción de Imágenes Locales (Base64)
    insertImageFromLocal: function(fileInputEvent) {
        var file = fileInputEvent.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        var self = this;

        reader.onload = function(e) {
            var imgHtml = '<img src="' + e.target.result + '" style="max-width:100%; height:auto; margin:10px 0;" /><p>&nbsp;</p>';
            self.execCmd('insertHTML', imgHtml);
        };

        reader.readAsDataURL(file);
    },

    // 5. Exportación Local a Word (.doc via HTML-MIME)
    exportToWord: function(fileName) {
        if (!this.editorElement) return;

        var title = fileName || 'documento-retorica';
        var htmlContent = this.editorElement.innerHTML;

        var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
                     "xmlns:w='urn:schemas-microsoft-com:office:word' " +
                     "xmlns='http://www.w3.org/TR/REC-html40'>" +
                     "<head><meta charset='utf-8'><title>Documento</title></head><body>";
        var footer = "</body></html>";
        
        var sourceHTML = header + htmlContent + footer;
        var blob = new Blob(['\ufeff' + sourceHTML], {
            type: 'application/msword'
        });

        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = title + '.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    // 6. Exportación a PDF Nativa (Impresión o Ventana Limpia)
    exportToPdf: function(fileName) {
        if (!this.editorElement) return;

        var title = fileName || 'documento-retorica';
        var content = this.editorElement.innerHTML;
        
        var printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>' + title + '</title>');
        printWindow.document.write('<style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse;} td,th{border:1px solid #ccc; padding:8px;} img{max-width:100%;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};
