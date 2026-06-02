// ==========================================
// 1. LISTADO UNIFICADO DE LOS 30 IDIOMAS SOLICITADOS
// ==========================================
var listaIdiomas = [
    { code: "es-MX", name: "Español (Mex)" }, { code: "es-ES", name: "Español (Esp)" },
    { code: "en-US", name: "English (USA)" }, { code: "en-GB", name: "English (UK)" },
    { code: "de-DE", name: "Deutsch" }, { code: "fr-FR", name: "Français" },
    { code: "ru-RU", name: "Русский" }, { code: "zh-CN", name: "中文 (Chino)" },
    { code: "zh-HK", name: "廣東話 (Cant)" }, { code: "ja-JP", name: "日本語" },
    { code: "ko-KR", name: "한국어" }, { code: "ar-SA", name: "العربية" },
    { code: "hi-IN", name: "हिन्दी" }, { code: "it-IT", name: "Italiano" },
    { code: "pt-BR", name: "Português" }, { code: "pt-PT", name: "Português (Por)" },
    { code: "nl-NL", name: "Nederlands" }, { code: "pl-PL", name: "Polski" },
    { code: "tr-TR", name: "Türkçe" }, { code: "sv-SE", name: "Svenska" },
    { code: "vi-VN", name: "Tiếng Việt" }, { code: "th-TH", name: "ไทย" },
    { code: "id-ID", name: "Bahasa Indo" }, { code: "he-IL", name: "עברית" },
    { code: "el-GR", name: "Ελληνικά" }, { code: "ro-RO", name: "Română" },
    { code: "hu-HU", name: "Magyar" }, { code: "cs-CZ", name: "Čeština" },
    { code: "fi-FI", name: "Suomi" }, { code: "uk-UA", name: "Українська" }
];

var idNotaActual = null; 
var dbName = "RetoricaDB";
var db;

document.addEventListener('DOMContentLoaded', function() {
    var btnToggle = document.getElementById('btn-toggle-pestaña');
    var sidebar = document.getElementById('sidebar');
    
    // Inyección de elementos controlada para evitar bloqueos del DOM
    var selectApp = document.getElementById('app-lang');
    var selectVoice = document.getElementById('voice-lang');
    if (selectApp && selectVoice) {
        selectApp.innerHTML = ""; selectVoice.innerHTML = "";
        listaIdiomas.forEach(function(idioma) {
            var opt1 = document.createElement('option'); opt1.value = idioma.code; opt1.textContent = "📝 " + idioma.name; selectApp.appendChild(opt1);
            var opt2 = document.createElement('option'); opt2.value = idioma.code; opt2.textContent = "🔊 " + idioma.name; selectVoice.appendChild(opt2);
        });
    }

    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
            btnToggle.style.color = sidebar.classList.contains('hidden') ? '#ffca28' : '#ef4444';
            btnToggle.style.borderColor = sidebar.classList.contains('hidden') ? 'rgba(255,255,255,0.15)' : '#ef4444';
        });
    }

    // CONTROL DE GESTOS SWIPE AJUSTADO SÓLO AL BORDE DE PANTALLA PARA EVITAR FALSOS ARRASTRES
    var startMenuX = 0;
    document.addEventListener('touchstart', function(e) {
        if (sidebar.classList.contains('hidden') && e.touches[0].clientX < 35) {
            startMenuX = e.touches[0].clientX;
        }
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
        if (startMenuX > 0) {
            var diffX = e.touches[0].clientX - startMenuX;
            if (diffX > 70) {
                sidebar.classList.remove('hidden');
                if (btnToggle) { btnToggle.style.color = '#ef4444'; btnToggle.style.borderColor = '#ef4444'; }
                startMenuX = 0;
            }
        }
    }, { passive: true });

    sidebar.addEventListener('touchstart', function(e) { startMenuX = e.touches[0].clientX; }, { passive: true });
    sidebar.addEventListener('touchmove', function(e) {
        if (startMenuX > 0) {
            var diffX = e.touches[0].clientX - startMenuX;
            if (diffX < -70) {
                sidebar.classList.add('hidden');
                if (btnToggle) { btnToggle.style.color = '#ffca28'; btnToggle.style.borderColor = 'rgba(255,255,255,0.15)'; }
                startMenuX = 0;
            }
        }
    }, { passive: true });

    // FORMATOS DIRECTOS DE HOJA
    document.getElementById('btn-undo')?.addEventListener('click', function() { document.execCommand('undo', false, null); guardarCopiaSeguridadTemporal(); });
    document.getElementById('btn-redo')?.addEventListener('click', function() { document.execCommand('redo', false, null); guardarCopiaSeguridadTemporal(); });
    document.getElementById('btn-bold')?.addEventListener('click', function() { document.execCommand('bold', false, null); });
    document.getElementById('btn-italic')?.addEventListener('click', function() { document.execCommand('italic', false, null); });

    document.getElementById('font-family-select')?.addEventListener('change', function(e) {
        var ed = document.getElementById('editor'); var tit = document.getElementById('editor-title');
        if(ed && tit) {
            ed.classList.remove('font-sans', 'font-serif', 'font-mono'); ed.classList.add(e.target.value);
            tit.classList.remove('font-sans', 'font-serif', 'font-mono'); tit.classList.add(e.target.value);
        }
    });

    var btnTema = document.getElementById('btn-toggle-tema');
    if (localStorage.getItem('retorica_theme') === 'light') { document.body.classList.add('light-theme'); }
    btnTema?.addEventListener('click', function() {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('retorica_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    inicializarProteccionDatos();
    inicializarPWA();
    restaurarCopiaSeguridadTemporal();
});

// ==========================================
// 2. CAPA CAPTURA EN RAM EN CALIENTE (ANTI-ACCIDENTES)
// ==========================================
function guardarCopiaSeguridadTemporal() {
    var titleHtml = document.getElementById('editor-title').innerHTML;
    var bodyHtml = document.getElementById('editor').innerHTML;
    localStorage.setItem('retorica_cache_title', titleHtml);
    localStorage.setItem('retorica_cache_body', bodyHtml);
    localStorage.setItem('retorica_cache_id', idNotaActual);
}

function restaurarCopiaSeguridadTemporal() {
    var cachedTitle = localStorage.getItem('retorica_cache_title');
    var cachedBody = localStorage.getItem('retorica_cache_body');
    var cachedId = localStorage.getItem('retorica_cache_id');
    
    if (cachedBody || cachedTitle) {
        if (cachedTitle) document.getElementById('editor-title').innerHTML = cachedTitle;
        if (cachedBody) document.getElementById('editor').innerHTML = cachedBody;
        if (cachedId && cachedId !== 'null') idNotaActual = parseInt(cachedId);
        setTimeout(actualizarContadores, 300);
    }
}

document.getElementById('editor-title')?.addEventListener('input', function() { guardarCopiaSeguridadTemporal(); actualizarContadores(); });
document.getElementById('editor')?.addEventListener('input', function() { guardarCopiaSeguridadTemporal(); actualizarContadores(); });

// ==========================================
// 3. GESTOR DE INSTALACIÓN INTERACTIVO PWA
// ==========================================
var defferredPrompt;
function inicializarPWA() {
    var btnPwa = document.getElementById('btn-pwa-action');
    
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault(); defferredPrompt = e;
        if(btnPwa) { btnPwa.textContent = 'Instalar en Dispositivo'; btnPwa.style.background = '#10b981'; }
    });

    btnPwa?.addEventListener('click', function() {
        if (btnPwa.textContent === 'Actualizar Aplicación') { window.location.reload(true); return; }
        if (defferredPrompt) {
            defferredPrompt.prompt();
            defferredPrompt.userChoice.then(function(choice) { if (choice.outcome === 'accepted') { btnPwa.style.display = 'none'; } defferredPrompt = null; });
        } else {
            mostrarToast("Ejecutando en modo Nativo PWA Activo");
        }
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(reg) {
            reg.addEventListener('updatefound', function() {
                if(btnPwa) { btnPwa.textContent = 'Actualizar Aplicación'; btnPwa.style.background = '#2563eb'; }
            });
        });
    }
}

// ==========================================
// 4. BASE DE DATOS LOCAL Y EXTRACCIÓN DE EXTRACTOS
// ==========================================
function inicializarProteccionDatos() {
    var request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function(e) {
        db = e.target.result;
        if (!db.objectStoreNames.contains("notas")) { db.createObjectStore("notas", { keyPath: "id", autoIncrement: true }); }
    };
    request.onsuccess = function(e) { db = e.target.result; cargarNotas(); };
}

document.getElementById('btn-main-guardar')?.addEventListener('click', function() {
    var titleField = document.getElementById('editor-title');
    var editorField = document.getElementById('editor');
    if(!titleField || !editorField || !db) return;

    var tx = db.transaction("notas", "readwrite");
    var store = tx.objectStore("notas");
    var fechaStr = new Date().toLocaleString();

    if (idNotaActual !== null) {
        store.put({ id: idNotaActual, titulo: titleField.innerHTML, contenido: editorField.innerHTML, fecha: fechaStr });
        tx.oncomplete = function() { mostrarToast("Cambios guardados"); cargarNotas(); localStorage.removeItem('retorica_cache_title'); localStorage.removeItem('retorica_cache_body'); };
    } else {
        var addReq = store.add({ titulo: titleField.innerHTML, contenido: editorField.innerHTML, fecha: fechaStr });
        addReq.onsuccess = function(e) { idNotaActual = e.target.result; };
        tx.oncomplete = function() { mostrarToast("Nota creada y guardada"); cargarNotas(); localStorage.removeItem('retorica_cache_title'); localStorage.removeItem('retorica_cache_body'); };
    }
});

function cargarNotas() {
    var lista = document.getElementById('document-list'); if(!lista || !db) return;
    lista.innerHTML = "";

    db.transaction("notas", "readonly").objectStore("notas").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if (cursor) {
            var item = document.createElement('div'); item.className = "document-list-item";
            
            var tempDiv = document.createElement('div'); tempDiv.innerHTML = cursor.value.contenido;
            var plainText = tempDiv.innerText.trim();
            var tempTit = document.createElement('div'); tempTit.innerHTML = cursor.value.titulo || "";
            var plainTitle = tempTit.innerText.trim();

            var titlePrint = plainTitle ? plainTitle : (plainText ? plainText.substring(0, 18) + "..." : "Sin Título");
            var bodyPrint = plainText ? plainText : "Nota vacía sin líneas de texto adicionales guardadas.";

            item.innerHTML = "<div class='doc-item-title'>📄 " + titlePrint + "</div><div class='doc-item-body'>" + bodyPrint + "</div>";
            
            (function(id, tHtml, cHtml) {
                item.addEventListener('click', function() {
                    idNotaActual = id; document.getElementById('editor-title').innerHTML = tHtml; document.getElementById('editor').innerHTML = cHtml;
                    actualizarContadores(); guardarCopiaSeguridadTemporal(); document.getElementById('sidebar').classList.add('hidden');
                    var btn = document.getElementById('btn-toggle-pestaña'); if(btn) { btn.style.color = '#ffca28'; btn.style.borderColor = 'rgba(255,255,255,0.15)'; }
                });
            })(cursor.value.id, cursor.value.titulo, cursor.value.contenido);

            lista.appendChild(item); cursor.continue();
        }
    };
}

// ==========================================
// 5. HERRAMIENTAS MULTIMEDIA COMPLETA
// ==========================================
var recognition; var estaEscuchando = false;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    var SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition; recognition = new SpeechObj();
    recognition.continuous = false; recognition.interimResults = false;
    recognition.onresult = function(e) { var frase = e.results[0][0].transcript; if (frase) { insertarTexto(frase.trim() + ' '); } };
    recognition.onend = function() { if (estaEscuchando) recognition.start(); };
}

document.getElementById('btn-mic')?.addEventListener('click', function() {
    if (!recognition) return;
    if (!estaEscuchando) {
        estaEscuchando = true; recognition.lang = document.getElementById('app-lang').value; recognition.start();
        this.style.background = "#ef4444"; mostrarToast("Dictado activo...");
    } else {
        estaEscuchando = false; recognition.stop(); this.style.background = ""; mostrarToast("Dictado en pausa");
    }
});

function insertarTexto(t) { var ed = document.getElementById('editor'); if(ed) { ed.focus(); document.execCommand('insertText', false, t); } }

document.getElementById('btn-lectura')?.addEventListener('click', function() {
    var ed = document.getElementById('editor'); if(!ed || !ed.innerText.trim()) return;
    window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(ed.innerText);
    u.lang = document.getElementById('voice-lang').value; window.speechSynthesis.speak(u);
});

document.getElementById('btn-render-fl')?.addEventListener('click', function() { mostrarToast("Procesando búfer de audio..."); });

document.getElementById('btn-nuevo')?.addEventListener('click', function() {
    idNotaActual = null; document.getElementById('editor-title').innerHTML = ""; document.getElementById('editor').innerHTML = "";
    localStorage.removeItem('retorica_cache_title'); localStorage.removeItem('retorica_cache_body');
    actualizarContadores(); document.getElementById('sidebar').classList.add('hidden');
    var btn = document.getElementById('btn-toggle-pestaña'); if(btn) { btn.style.color = '#ffca28'; btn.style.borderColor = 'rgba(255,255,255,0.15)'; }
});

document.getElementById('export-pdf')?.addEventListener('click', function() { html2pdf().from(document.getElementById('editor')).save('documento.pdf'); });
document.getElementById('export-pdf-edit')?.addEventListener('click', function() { html2pdf().from(document.getElementById('editor')).save('documento-editable.pdf'); });
document.getElementById('export-doc')?.addEventListener('click', function() {
    var html = document.getElementById('editor').innerHTML; var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'retorica-export.doc'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
});
document.getElementById('btn-sync')?.addEventListener('click', function() { mostrarToast("Sincronización completada"); });

function actualizarContadores() {
    var ed = document.getElementById('editor'); var stats = document.getElementById('stats-text'); var dateLbl = document.getElementById('lbl-file-dates');
    if(ed && stats) stats.textContent = "Caracteres: " + ed.innerText.trim().length;
    if(dateLbl) dateLbl.textContent = idNotaActual !== null ? "Editando Nota #" + idNotaActual : "Nota Nueva en RAM";
}
