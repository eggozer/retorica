var RetoricaUI = {
    state: { zoom: 1.0 },

    init: function() {
        var editor = document.getElementById('editor-body');
        if (editor) { editor.oninput = function() { RetoricaUI.updateCounters(); }; }
        if (typeof RetoricaI18n !== 'undefined') RetoricaI18n.init();
        
        var unifiedContainer = document.getElementById('unified-sel-container');
        if (unifiedContainer) {
            unifiedContainer.onclick = function(e) {
                if (e.target === unifiedContainer) {
                    var body = document.getElementById('editor-body');
                    if (body) body.focus();
                }
            };
        }
        
        // Corrección del colapso del Viewport por el Teclado Virtual (Android)
        var updateViewportHeight = function() {
            var vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            var headerH = document.querySelector('.header-app').offsetHeight;
            var navH = document.querySelector('.top-navbar').offsetHeight;
            var footerH = document.querySelector('footer').offsetHeight;
            var freeSpace = vh - (headerH + navH + footerH);
            document.getElementById('viewport-ctx').style.height = freeSpace + "px";
        };
        if (window.visualViewport) { window.visualViewport.addEventListener('resize', updateViewportHeight); }
        window.addEventListener('resize', updateViewportHeight);
        updateViewportHeight();

        this.updateCounters();
        if (typeof RetoricaAuth !== 'undefined') RetoricaAuth.initLifecycle();
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
        if (wrapper) {
            wrapper.style.transform = "scale(" + targetZoom + ")";
            wrapper.style.transformOrigin = "top left";
            wrapper.style.width = (100 / targetZoom) + "%";
            wrapper.style.height = (100 / targetZoom) + "%";
        }
    },

    updateCounters: function() {
        var body = document.getElementById('editor-body') ? document.getElementById('editor-body').value : "";
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
        var wrapper = document.getElementById('unified-sel-container');
        var title = document.getElementById('editor-title').value.trim() || "guion";
        if (wrapper && typeof html2pdf !== 'undefined') {
            var opt = { margin: 15, filename: title + '.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
            html2pdf().from(wrapper).set(opt).save();
        }
    },

    expPDFEditable: function() {
        this.notify("Generando PDF Formulario Editable...");
        var title = document.getElementById('editor-title').value.trim() || "guion_editable";
        var bodyValue = document.getElementById('editor-body').value;
        var htmlForm = "<html><body><h2>" + title + "</h2><p>Formulario interactivo:</p><input type='text' value='" + title + "' style='width:100%; font-weight:bold; margin-bottom:10px;'><br><textarea style='width:100%; height:400px;'>" + bodyValue + "</textarea></body></html>";
        var worker = html2pdf().from(htmlForm).set({ margin: 15, filename: title + '_editable.pdf' }).save();
        this.notify("PDF Editable exportado ✓");
    },

    expDOC: function() {
        var body = document.getElementById('editor-body').value;
        var title = document.getElementById('editor-title').value.trim() || "guion";
        var htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>" + title + "</title><style>body{font-family:Arial;line-height:1.6;}</style></head><body><h2>" + title + "</h2>" + body.replace(/\n/g, "<br>") + "</body></html>";
        var blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = title + ".doc"; a.click();
        this.notify("Documento Word (.doc) generado ✓");
    }
};

window.onload = function() { RetoricaUI.init(); };
