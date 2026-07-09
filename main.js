// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
var autoSaveTimeout = null;

var RetoricaUI = {
    state: { zoom: 1.0 },

    init: function() {
        var editor = document.getElementById('editor-body');
        if (editor) {
            // Monitoreo elástico instantáneo en el contenedor editable
            editor.addEventListener('input', function() {
                RetoricaUI.updateCounters();
                RetoricaUI.triggerAutoSave();
            });
        }
        var titleInput = document.getElementById('editor-title');
        if (titleInput) {
            titleInput.addEventListener('input', function() {
                RetoricaUI.triggerAutoSave();
            });
        }
        
        if (typeof RetoricaI18n !== 'undefined') RetoricaI18n.init();
        if (typeof RetoricaStorage !== 'undefined') RetoricaStorage.refreshLibrary();
        this.updateCounters();
    },

    triggerAutoSave: function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            if (typeof RetoricaStorage !== 'undefined') {
                RetoricaStorage.saveSilent();
                console.log("Retorica DB: Resguardo antipérdida ejecutado.");
            }
        }, 1500);
    },

    execCmd: function(command, value) {
        document.execCommand(command, false, value || null);
        this.updateCounters();
    },

    // FUNCIÓN SOLICITADA PUNTO 4: Inserción de matrices y tablas adaptables de forma limpia
    insertTable: function(size) {
        var parts = size.split('x');
        var cols = parseInt(parts[0]);
        var rows = parseInt(parts[1]);
        
        var tableHtml = "<table>";
        for (var r = 0; r < rows; r++) {
            tableHtml += "<tr>";
            for (var c = 0; c < cols; c++) {
                tableHtml += "<td>Dato</td>";
            }
            tableHtml += "</tr>";
        }
        tableHtml += "</table><p>&nbsp;</p>";
        document.execCommand('insertHTML', false, tableHtml);
    },

    styleTableBorders: function(color) {
        var editor = document.getElementById('editor-body');
        var tables = editor.getElementsByTagName('table');
        for (var i = 0; i < tables.length; i++) {
            var cells = tables[i].getElementsByTagName('td');
            for (var j = 0; j < cells.length; j++) {
                cells[j].style.borderColor = color;
                cells[j].style.borderWidth = "2px";
            }
            var headers = tables[i].getElementsByTagName('th');
            for (var k = 0; k < headers.length; k++) {
                headers[k].style.borderColor = color;
            }
        }
        RetoricaUI.notify("Color de bordes aplicado a las tablas ✓");
    },

    // FUNCIÓN SOLICITADA PUNTO 3: Carga e inserción de imágenes/fotos locales para Currículums
    triggerImageInsert: function() {
        document.getElementById('img-uploader-hidden').click();
    },

    insertImageEntity: function(event) {
        var file = event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            var imgHtml = "<img src='" + e.target.result + "' style='max-width:200px; display:block; margin:10px 0;' alt='Foto Currículum'>";
            document.execCommand('insertHTML', false, imgHtml);
            RetoricaUI.notify("Imagen acoplada correctamente ✓");
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    },

    toggleSidebar: function() {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    },

    adjustZoom: function(amount) {
        this.state.zoom += amount;
        if (this.state.zoom < 0.6) this.state.zoom = 0.6;
        if (this.state.zoom > 1.6) this.state.zoom = 1.6;
        document.getElementById('zoom-wrapper').style.transform = "scale(" + this.state.zoom + ")";
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        this.notify("Esquema visual alternado");
    },

    // MANEJO DE EXPORTACIONES PROFESIONALES COMO ARCHIVOS RAW NATIVOS
    runExport: function(type) {
        var title = document.getElementById('editor-title').value.trim() || "Documento_Retorica";
        var bodyHtml = document.getElementById('editor-body').innerHTML;
        
        if (type === 'doc') {
            var htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>" + title + "</title><style>table{border-collapse:collapse;width:100%;} td{border:1px solid #000;padding:5px;}</style></head><body><h2>" + title + "</h2>" + bodyHtml + "</body></html>";
            var blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a'); a.href = url; a.download = title + ".doc"; a.click();
            this.notify("Word .doc exportado ✓");
        } 
        else if (type === 'pdf') {
            this.notify("Generando PDF...");
            var element = document.getElementById('unified-sel-container');
            html2pdf().from(element).set({ margin: 12, filename: title + '.pdf', html2canvas: { scale: 2 } }).save();
        } 
        else if (type === 'pdf_edit') {
            this.notify("Generando Formulario...");
            var cleanText = document.getElementById('editor-body').innerText;
            var htmlForm = "<html><body><h2>" + title + "</h2><textarea style='width:100%; height:400px; border:1px solid #333;'>" + cleanText + "</textarea></body></html>";
            html2pdf().from(htmlForm).set({ margin: 15, filename: title + '_formulario.pdf' }).save();
        }
    },

    updateCounters: function() {
        var editor = document.getElementById('editor-body');
        var text = editor ? editor.innerText : "";
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
        toast.innerText = msg; toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2500);
    },
    
    logout: function() {
        if(confirm("¿Deseas salir del sistema?")) {
            location.reload();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    RetoricaUI.init();
});
