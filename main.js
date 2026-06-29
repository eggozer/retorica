// --- RETÓRICA INTERFACE & MAIN ORCHESTRATION MODULE (main.js) ---
let autoSaveTimeout = null;
let dictationTarget = 'body';

var RetoricaUI = {
    state: { zoom: 1.0, touchStartX: 0, touchEndX: 0 },

    init: function() {
        var editor = document.getElementById('textarea-main');
        if (editor) { editor.oninput = function() { RetoricaUI.updateCounters(); }; }
        if (typeof RetoricaI18n !== 'undefined') RetoricaI18n.init();

        const titleInput = document.getElementById('doc-title');
        const mainTextarea = document.getElementById('textarea-main');

        const triggerAutoSave = () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (typeof guardarTexto === 'function') {
                    guardarTexto();
                } else if (typeof RetoricaStorage !== 'undefined') {
                    RetoricaStorage.save();
                }
                console.log("Cambios guardados automáticamente.");
            }, 1500);
        };

        if (titleInput) titleInput.addEventListener('input', triggerAutoSave);
        if (mainTextarea) mainTextarea.addEventListener('input', triggerAutoSave);
        
        var unifiedContainer = document.getElementById('unified-container');
        if (unifiedContainer) {
            unifiedContainer.onclick = function(e) {
                if (e.target === unifiedContainer) {
                    var body = document.getElementById('textarea-main');
                    if (body) body.focus();
                }
            };
        }
        
        this.initTouchGestures();
        this.initViewportFix();
        this.updateCounters();
        if (typeof RetoricaAuth !== 'undefined') RetoricaAuth.initLifecycle();
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
        var diffX = this.state.touchEndX - this.state.touchStartX;
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        if (diffX > 80 && this.state.touchStartX < 50 && !sidebar.classList.contains('active')) {
            this.toggleSidebar();
        }
        if (diffX < -80 && sidebar.classList.contains('active')) {
            this.toggleSidebar();
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
        if (sidebar) sidebar.classList.toggle('active');
        if (sidebar && sidebar.classList.contains('active') && typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        this.notify("Paleta modificada.");
    },

    adjustZoom: function(delta) {
        var targetZoom = this.state.zoom + delta;
        if (targetZoom < 0.6) targetZoom = 0.6;
        if (targetZoom > 2.0) targetZoom = 2.0;
        this.state.zoom = targetZoom;
        var wrapper = document.getElementById('zoom-wrapper');
        if (wrapper) wrapper.style.transform = "scale(" + targetZoom + ")";
    },

    updateCounters: function() {
        var body = document.getElementById('textarea-main') ? document.getElementById('textarea-main').value : "";
        var chars = body.length;
        var words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
        var lines = body === "" ? 1 : body.split('\n').length;

        var countCharsEl = document.getElementById('count-chars');
        var countWordsEl = document.getElementById('count-words');
        var countLinesEl = document.getElementById('count-lines');

        if (countCharsEl) countCharsEl.innerText = "CHARS: " + chars;
        if (countWordsEl) countWordsEl.innerText = "WORDS: " + words;
        if (countLinesEl) countLinesEl.innerText = "LINES: " + lines;
    },

    notify: function(msg) {
        var toast = document.getElementById('toast-notif');
        if (!toast) return;
        toast.innerText = msg; toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2200);
    },

    expPDF: function() {
        this.notify("Generando PDF plano...");
        var wrapper = document.getElementById('unified-container');
        var title = document.getElementById('doc-title').value.trim() || "guion";
        if (wrapper && typeof html2pdf !== 'undefined') {
            var opt = { margin: 15, filename: title + '.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
            html2pdf().from(wrapper).set(opt).save();
        }
    },

    expPDFEditable: function() {
        this.notify("Generando PDF Formulario Editable...");
        var title = document.getElementById('doc-title').value.trim() || "guion_editable";
        var bodyValue = document.getElementById('textarea-main').value;
        var htmlForm = "<html><body><h2>" + title + "</h2><p>Formulario interactivo:</p><input type='text' value='" + title + "' style='width:100%; font-weight:bold; margin-bottom:10px;'><br><textarea style='width:100%; height:400px;'>" + bodyValue + "</textarea></body></html>";
        var worker = html2pdf().from(htmlForm).set({ margin: 15, filename: title + '_editable.pdf' }).save();
        this.notify("PDF Editable exportado ✓");
    },

    expDOC: function() {
        var body = document.getElementById('textarea-main').value;
        var title = document.getElementById('doc-title').value.trim() || "guion";
        var htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>" + title + "</title><style>body{font-family:Arial;line-height:1.6;}</style></head><body><h2>" + title + "</h2>" + body.replace(/\n/g, "<br>") + "</body></html>";
        var blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = title + ".doc"; a.click();
        this.notify("Documento Word (.doc) generado ✓");
    }
}; // AQUÍ SE CIERRA RETORICAUI CORRECTAMENTE

// Las funciones globales de utilidad quedan abajo libres:
function setDictationTarget(target) {
    dictationTarget = target;
}

function cambiarFuente(fontName) {
    const editor = document.getElementById('textarea-main');
    if (editor) {
        editor.style.fontFamily = fontName;
        // Lanzamos el evento input para asegurar que se entere el sistema
        editor.dispatchEvent(new Event('input'));
    }
}

function solicitarTabla() {
    const filas = prompt("¿Cuántas filas deseas?", "3");
    const columnas = prompt("¿Cuántas columnas deseas?", "3");
    
    if (filas && columnas) {
        const numFilas = parseInt(filas);
        const numCols = parseInt(columnas);
        const editor = document.getElementById('textarea-main');
        
        if (!editor) return;

        let tablaMarkdown = "\n";
        for (let i = 0; i < numCols; i++) { tablaMarkdown += `| Col ${i+1} `; }
        tablaMarkdown += "|\n";
        for (let i = 0; i < numCols; i++) { tablaMarkdown += "| --- "; }
        tablaMarkdown += "|\n";
        for (let f = 0; f < numFilas; f++) {
            for (let c = 0; c < numCols; c++) { tablaMarkdown += "| Dato "; }
            tablaMarkdown += "|\n";
        }
        
        const startPos = editor.selectionStart;
        const endPos = editor.selectionEnd;
        const textAreaValue = editor.value;
        
        editor.value = textAreaValue.substring(0, startPos) + tablaMarkdown + textAreaValue.substring(endPos);
        editor.dispatchEvent(new Event('input'));
    }
}

let canvas, ctx, dibujando = false;

function togglePizarra() {
    const contenedor = document.getElementById('pizarra-container');
    if (!contenedor) return;
    if (contenedor.style.display === 'none') {
        contenedor.style.display = 'block';
        inicializarPizarra();
    } else {
        contenedor.style.display = 'none';
    }
}

function inicializarPizarra() {
    canvas = document.getElementById('canvas-pizarra');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    canvas.addEventListener('mousedown', (e) => { dibujando = true; dibujar(e); });
    canvas.addEventListener('mousemove', dibujar);
    canvas.addEventListener('mouseup', () => dibujando = false);
    canvas.addEventListener('mouseleave', () => dibujando = false);
    
    canvas.addEventListener('touchstart', (e) => {
        dibujando = true;
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: true });
    
    canvas.addEventListener('touchend', () => dibujando = false);
}

function dibujar(e) {
    if (!dibujando || !canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    
    if (e.type === 'mousedown' || e.type === 'touchstart') {
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function limpiarPizarra() {
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

window.onload = function() { RetoricaUI.init(); };
