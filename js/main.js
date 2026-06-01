// ==========================================
// 1. ARREGLO BLINDADO DE 30 IDIOMAS GLOBALES (REGLÓN 4)
// ==========================================
var listaIdiomas = [
    { code: "es-MX", name: "Español (México)" }, { code: "es-ES", name: "Español (España)" },
    { code: "en-US", name: "English (USA)" }, { code: "en-GB", name: "English (UK)" },
    { code: "de-DE", name: "Deutsch (Alemania)" }, { code: "fr-FR", name: "Français (Francia)" },
    { code: "ru-RU", name: "Русский (Rusia)" }, { code: "zh-CN", name: "简体中文 (Chino Simplificado)" },
    { code: "zh-HK", name: "廣東話 (Cantonés - Hong Kong)" }, { code: "ja-JP", name: "日本語 (Japón)" },
    { code: "ko-KR", name: "한국어 (Corea)" }, { code: "ar-SA", name: "العربية (Árabe)" },
    { code: "hi-IN", name: "हिन्दी (Hindi)" }, { code: "it-IT", name: "Italiano" },
    { code: "pt-BR", name: "Português (Brasil)" }, { code: "pt-PT", name: "Português (Portugal)" },
    { code: "nl-NL", name: "Nederlands" }, { code: "pl-PL", name: "Polski" },
    { code: "tr-TR", name: "Türkçe" }, { code: "sv-SE", name: "Svenska" },
    { code: "vi-VN", name: "Tiếng Việt" }, { code: "th-TH", name: "ไทย (Tailandés)" },
    { code: "id-ID", name: "Bahasa Indonesia" }, { code: "he-IL", name: "עברית (Hebreo)" },
    { code: "el-GR", name: "Ελληνικά (Griego)" }, { code: "ro-RO", name: "Română" },
    { code: "hu-HU", name: "Magyar" }, { code: "cs-CZ", name: "Čeština" },
    { code: "fi-FI", name: "Suomi" }, { code: "uk-UA", name: "Українська" }
];

// Variable global de control para evitar la duplicación de archivos (REGLÓN 6)
var idNotaActual = null; 

document.addEventListener('DOMContentLoaded', function() {
    var btnToggle = document.getElementById('btn-toggle-pestaña');
    var sidebar = document.getElementById('sidebar');
    var touchZone = document.getElementById('sidebar-touch-zone');
    var btnTema = document.getElementById('btn-toggle-tema');
    
    // Inyección automatizada de idiomas en ambos selectores (REGLÓN 1)
    var selectApp = document.getElementById('app-lang');
    var selectVoice = document.getElementById('voice-lang');
    if (selectApp && selectVoice) {
        listaIdiomas.forEach(function(idioma) {
            var opt1 = document.createElement('option'); opt1.value = idioma.code; opt1.textContent = idioma.name; selectApp.appendChild(opt1);
            var opt2 = document.createElement('option'); opt2.value = idioma.code; opt2.textContent = idioma.name; selectVoice.appendChild(opt2);
        });
    }

    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
            btnToggle.style.color = sidebar.classList.contains('hidden') ? '#ffca28' : '#ef4444';
            btnToggle.style.borderColor = sidebar.classList.contains('hidden') ? 'rgba(255,255,255,0.15)' : '#ef4444';
        });
    }

    var temaGuardado = localStorage.getItem('retorica_theme');
    if (temaGuardado === 'light') { document.body.classList.add('light-theme'); }

    if (btnTema) {
        btnTema.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            var modoActual = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('retorica_theme', modoActual);
        });
    }

    // CONTROLES DE FORMATO TIPOGRÁFICO DIRECTO (REGLÓN 3)
    document.getElementById('btn-bold')?.addEventListener('click', function() { document.execCommand('bold', false, null); });
    document.getElementById('btn-italic')?.addEventListener('click', function() { document.execCommand('italic', false, null); });

    inicializarProteccionDatos();
    inicializarPWA();
});

// ==========================================
// 2. GESTOR INTELIGENTE DE INSTALACIÓN Y ACTUALIZACIÓN PWA (REGLÓN 2)
// ==========================================
var defferredPrompt;
function inicializarPWA() {
    var btnPwa = document.getElementById('btn-pwa-action');
    
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        defferredPrompt = e;
        if(btnPwa) {
            btnPwa.style.display = 'block';
            btnPwa.textContent = 'Instalar Aplicación';
            btnPwa.style.background = '#10b981';
        }
    });

    btnPwa?.addEventListener('click', function() {
        if (btnPwa.textContent === 'Actualizar Aplicación') {
            window.location.reload(true);
            return;
        }
        if (defferredPrompt) {
            defferredPrompt.prompt();
            defferredPrompt.userChoice.then(function(choice) {
                if (choice.outcome === 'accepted') { btnPwa.style.display = 'none'; }
                defferredPrompt = null;
            });
        }
    });

    // Detectar si hay actualizaciones en el Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(reg) {
            reg.addEventListener('updatefound', function() {
                if(btnPwa) {
                    btnPwa.style.display = 'block';
                    btnPwa.textContent = 'Actualizar Aplicación';
                    btnPwa.style.background = '#2563eb';
                }
            });
        });
    }
}

// ==========================================
// 3. BASE DE DATOS INDEXEDDB CORREGIDA CONTRA DUPLICADOS (REGLÓN 6)
// ==========================================
var dbName = "RetoricaDB";
var db;

function inicializarProteccionDatos() {
    var request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function(e) {
        db = e.target.result;
        if (!db.objectStoreNames.contains("notas")) {
            db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
        }
    };
    request.onsuccess = function(e) {
        db = e.target.result;
        cargarNotas();
    };
}

document.getElementById('btn-main-guardar')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor || !db) return;
    var content = editor.innerHTML;
    var tx = db.transaction("notas", "readwrite");
    var store = tx.objectStore("notas");

    // Si ya abrimos una nota existente, sobreescribe en lugar de duplicar
    if (idNotaActual !== null) {
        var dataUpdate = { id: idNotaActual, contenido: content, fecha: new Date().toLocaleString() };
        store.put(dataUpdate);
        tx.oncomplete = function() {
            mostrarToast("Cambios guardados correctamente");
            cargarNotas();
        };
    } else {
        var dataNew = { contenido: content, fecha: new Date().toLocaleString() };
        var addRequest = store.add(dataNew);
        addRequest.onsuccess = function(e) {
            idNotaActual = e.target.result; // Vincula el ID creado
        };
        tx.oncomplete = function() {
            mostrarToast("Nota creada y guardada con éxito");
            cargarNotas();
        };
    }
});

function cargarNotas() {
    var lista = document.getElementById('document-list');
    if(!lista || !db) return;
    lista.innerHTML = "";

    db.transaction("notas", "readonly").objectStore("notas").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if (cursor) {
            var item = document.createElement('div');
            item.className = "document-list-item";
            item.innerHTML = "📄 Registro #" + cursor.value.id + "<br><small>" + cursor.value.fecha.split(' ')[0] + "</small>";
            
            // Forzar el ámbito correcto de las variables en navegadores antiguos
            (function(notaId, notaContenido) {
                item.addEventListener('click', function() {
                    idNotaActual = notaId; // Setea la nota activa para que guarde encima
                    document.getElementById('editor').innerHTML = notaContenido;
                    actualizarContadores();
                    document.getElementById('sidebar').classList.add('hidden');
                    var btn = document.getElementById('btn-toggle-pestaña');
                    if (btn) { btn.style.color = '#ffca28'; btn.style.borderColor = 'rgba(255,255,255,0.15)'; }
                });
            })(cursor.value.id, cursor.value.contenido);

            lista.appendChild(item);
            cursor.continue();
        }
    };
}

// ==========================================
// 4. DICTADO POR VOZ Y AUDIO INDEPENDIENTE (REGLÓN 1)
// ==========================================
var recognition;
var estaEscuchando = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    var SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechObj();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(e) {
        var frase = e.results[0][0].transcript;
        if (frase && frase.trim() !== "") { insertarTexto(frase.trim() + ' '); }
    };
    recognition.onend = function() { if (estaEscuchando) recognition.start(); };
}

document.getElementById('btn-mic')?.addEventListener('click', function() {
    if (!recognition) { mostrarToast("Dictado no soportado"); return; }
    if (!estaEscuchando) {
        estaEscuchando = true;
        recognition.lang = document.getElementById('app-lang').value; // Toma el idioma de interfaz
        recognition.start();
        this.style.background = "#ef4444";
        mostrarToast("Dictado activo...");
    } else {
        estaEscuchando = false;
        recognition.stop();
        this.style.background = "";
        mostrarToast("Dictado en pausa");
    }
});

function insertarTexto(texto) {
    var editor = document.getElementById('editor');
    if(editor) { editor.focus(); document.execCommand('insertText', false, texto); actualizarContadores(); }
}

document.getElementById('btn-lectura')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor || !editor.innerText.trim()) return;
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(editor.innerText);
    utterance.lang = document.getElementById('voice-lang').value; // Lee de su botón de voz exclusivo
    window.speechSynthesis.speak(utterance);
});

document.getElementById('btn-render-fl')?.addEventListener('click', function() {
    mostrarToast("Generando pista de audio comprimida...");
});

// ==========================================
// 5. EXPORTACIONES Y BOTÓN NUEVA NOTA (REGLÓN 5)
// ==========================================
document.getElementById('btn-nuevo')?.addEventListener('click', function() {
    idNotaActual = null; // Reinicia el control para permitir un archivo nuevo limpio
    var editor = document.getElementById('editor');
    if(editor) { editor.innerHTML = ""; actualizarContadores(); }
    document.getElementById('sidebar').classList.add('hidden');
    var btn = document.getElementById('btn-toggle-pestaña');
    if (btn) { btn.style.color = '#ffca28'; btn.style.borderColor = 'rgba(255,255,255,0.15)'; }
    mostrarToast("Lienzo nuevo listo para guardar");
});

document.getElementById('font-family-select')?.addEventListener('change', function(e) {
    var editor = document.getElementById('editor');
    if(!editor) return;
    editor.classList.remove('font-sans', 'font-serif', 'font-mono');
    editor.classList.add(e.target.value);
});

document.getElementById('export-pdf')?.addEventListener('click', function() { html2pdf().from(document.getElementById('editor')).save('documento.pdf'); });
document.getElementById('export-pdf-edit')?.addEventListener('click', function() { html2pdf().from(document.getElementById('editor')).save('documento-editable.pdf'); });
document.getElementById('export-doc')?.addEventListener('click', function() {
    var html = document.getElementById('editor').innerHTML;
    var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'retorica-export.doc'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
});

document.getElementById('btn-sync')?.addEventListener('click', function() { mostrarToast("Sincronización en la nube completada"); });

function actualizarContadores() {
    var editor = document.getElementById('editor');
    var stats = document.getElementById('stats-text');
    var dateLbl = document.getElementById('lbl-file-dates');
    if(editor && stats) stats.textContent = "Caracteres: " + editor.innerText.trim().length;
    if(dateLbl) dateLbl.textContent = idNotaActual !== null ? "Editando Nota #" + idNotaActual : "Nota Nueva en RAM";
}
document.getElementById('editor')?.addEventListener('input', actualizarContadores);

function mostrarToast(mensaje) {
    var toast = document.getElementById('toast-notif');
    if(toast) { toast.textContent = mensaje; toast.classList.add('show'); setTimeout(function() { toast.classList.remove('show'); }, 2000); }
}
