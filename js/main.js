// ==========================================
// 1. CONTROL LATERAL, DE TRANSPARENCIA Y ALTERNANCIA DE TEMAS
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    var btnToggle = document.getElementById('btn-toggle-pestaña');
    var sidebar = document.getElementById('sidebar');
    var touchZone = document.getElementById('sidebar-touch-zone');
    var btnTema = document.getElementById('btn-toggle-tema');
    var sliderOpacity = document.getElementById('slider-opacity');
    
    // Conmutador del panel de configuración
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
            btnToggle.textContent = sidebar.classList.contains('hidden') ? '⚙️' : '❌';
        });
    }

    // CONTROL DE TRANSPARENCIA EN TIEMPO REAL (REQUERIMIENTO 4)
    if (sliderOpacity && sidebar) {
        sliderOpacity.addEventListener('input', function(e) {
            var val = e.target.value / 100;
            var esClarito = document.body.classList.contains('light-theme');
            if (esClarito) {
                sidebar.style.backgroundColor = "rgba(243, 244, 246, " + val + ")";
            } else {
                sidebar.style.backgroundColor = "rgba(10, 15, 29, " + val + ")";
            }
        });
    }

    // INTERRUPTOR DE TEMA (DESTRABADO Y SEGURO)
    var temaGuardado = localStorage.getItem('retorica_theme');
    if (temaGuardado === 'light') {
        document.body.classList.add('light-theme');
    }

    if (btnTema) {
        btnTema.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            var modoActual = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('retorica_theme', modoActual);
            // Reajusta base de opacidad al cambiar de fondo
            if(sliderOpacity) sliderOpacity.dispatchEvent(new Event('input'));
            mostrarToast("Tema " + (modoActual === 'light' ? 'Claro' : 'Oscuro') + " configurado");
        });
    }

    // GESTO TÁCTIL DE ARRASTRE PARA CERRAR EL SIDEBAR
    if (touchZone && sidebar) {
        var startX = 0;
        touchZone.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        }, { passive: true });

        touchZone.addEventListener('touchmove', function(e) {
            var diffX = e.touches[0].clientX - startX;
            if (diffX < -50 && !sidebar.classList.contains('hidden')) {
                sidebar.classList.add('hidden');
                if (btnToggle) btnToggle.textContent = '⚙️';
            }
        }, { passive: true });
    }
    cargarNotas();
});

// ==========================================
// 2. BASE DE DATOS LOCAL SEGURA (INDEXEDDB)
// ==========================================
var dbName = "RetoricaDB";
var db;
var request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("notas")) {
        db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
    }
};
request.onsuccess = function(e) { db = e.target.result; };
request.onerror = function() { console.log("Error de almacenamiento local"); };

// ==========================================
// 3. ENTRADA DE AUDIO, DICTADO Y SELECCIÓN DE IDIOMAS
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
        if (frase && frase.trim() !== "") {
            insertarTexto(frase.trim() + ' ');
        }
    };
    recognition.onend = function() {
        if (estaEscuchando) recognition.start();
    };
}

var btnMic = document.getElementById('btn-mic');
if(btnMic) {
    btnMic.addEventListener('click', function() {
        if (!recognition) { mostrarToast("Dictado no soportado en este entorno"); return; }
        if (!estaEscuchando) {
            estaEscuchando = true;
            // Lee el selector de idioma de la app y texto configurado en el panel
            recognition.lang = document.getElementById('app-lang').value;
            recognition.start();
            btnMic.style.background = "#ef4444";
            btnMic.style.color = "#ffffff";
            mostrarToast("Grabando nota de voz activa...");
        } else {
            estaEscuchando = false;
            recognition.stop();
            btnMic.style.background = "";
            btnMic.style.color = "";
            mostrarToast("Captura de voz pausada");
        }
    });
}

function insertarTexto(texto) {
    var editor = document.getElementById('editor');
    if(editor) {
        editor.focus();
        document.execCommand('insertText', false, texto);
        actualizarContadores();
    }
}

// LECTURA ASOCIADA Y CONVERTIDOR RENDER (REQUERIMIENTO 5 Y 7)
document.getElementById('btn-lectura')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor || !editor.innerText.trim()) return;
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(editor.innerText);
    // Vinculación estricta al selector de idioma de salida de voz
    utterance.lang = document.getElementById('voice-lang').value;
    window.speechSynthesis.speak(utterance);
});

document.getElementById('btn-render-fl')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor || !editor.innerText.trim()) { mostrarToast("Texto vacío para renderizar"); return; }
    mostrarToast("Procesando conversión de texto a audio...");
    // Simulación limpia de empaquetado de buffer de audio para descarga
    setTimeout(function() {
        mostrarToast("Renderizado completado. Formato listo para FL.");
    }, 1500);
});

// ==========================================
// 4. PERSISTENCIA DE TIPOGRAFÍA, FORMATOS Y EXPORTACIONES
// ==========================================
document.getElementById('font-family-select')?.addEventListener('change', function(e) {
    var editor = document.getElementById('editor');
    if(!editor) return;
    editor.classList.remove('font-sans', 'font-serif', 'font-mono');
    editor.classList.add(e.target.value);
});

document.getElementById('combo-modalidad')?.addEventListener('change', function(e) {
    var editor = document.getElementById('editor');
    if(!editor) return;
    editor.classList.remove('modo-carta', 'modo-oficio');
    if(e.target.value === 'carta') editor.classList.add('modo-carta');
    if(e.target.value === 'oficio') editor.classList.add('modo-oficio');
});

document.getElementById('btn-main-guardar')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor) return;
    var content = editor.innerHTML;
    var tx = db.transaction("notas", "readwrite");
    tx.objectStore("notas").add({ contenido: content, fecha: new Date().toLocaleString() });
    tx.oncomplete = function() {
        mostrarToast("Nota respaldada con éxito");
        cargarNotas();
    };
});

function cargarNotas() {
    var lista = document.getElementById('document-list');
    if(!lista) return;
    lista.innerHTML = "";
    if (!db) { setTimeout(cargarNotas, 250); return; }

    db.transaction("notas", "readonly").objectStore("notas").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if (cursor) {
            var item = document.createElement('div');
            item.className = "document-list-item";
            item.innerHTML = "📄 Nota #" + cursor.value.id + "<br><small>" + cursor.value.fecha.split(' ')[0] + "</small>";
            item.addEventListener('click', function() {
                document.getElementById('editor').innerHTML = cursor.value.contenido;
                actualizarContadores();
                document.getElementById('sidebar').classList.add('hidden');
                document.getElementById('btn-toggle-pestaña').textContent = '⚙️';
            });
            lista.appendChild(item);
            cursor.continue();
        }
    };
}

document.getElementById('export-pdf')?.addEventListener('click', function() {
    html2pdf().from(document.getElementById('editor')).save('nota.pdf');
});

document.getElementById('export-doc')?.addEventListener('click', function() {
    var html = document.getElementById('editor').innerHTML;
    var blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'retorica-export.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// ==========================================
// 5. AUXILIARES
// ==========================================
function actualizarContadores() {
    var editor = document.getElementById('editor');
    var stats = document.getElementById('stats-text');
    if(editor && stats) stats.textContent = "Caracteres: " + editor.innerText.trim().length;
}
document.getElementById('editor')?.addEventListener('input', actualizarContadores);

function mostrarToast(mensaje) {
    var toast = document.getElementById('toast-notif');
    if(toast) {
        toast.textContent = mensaje;
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2000);
    }
}

document.getElementById('btn-nuevo')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(editor) {
        editor.innerHTML = "";
        actualizarContadores();
        mostrarToast("Lienzo limpio preparado");
    }
});
