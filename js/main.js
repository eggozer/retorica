// ==========================================
// 1. MANEJO DEL DESPLIEGUE, GESTOS (SWIPE) Y SELECTOR DE TEMA
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    var btnToggle = document.getElementById('btn-toggle-pestaña');
    var sidebar = document.getElementById('sidebar');
    var touchZone = document.getElementById('sidebar-touch-zone');
    var btnTema = document.getElementById('btn-toggle-tema');
    
    // Control de despliegue por botón
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
            btnToggle.textContent = sidebar.classList.contains('hidden') ? '▼' : '▲';
        });
    }

    // INTERRUPTOR DE TEMA (DESTRABADO COMPLETAMENTE)
    var temaGuardado = localStorage.getItem('retorica_theme');
    if (temaGuardado === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    if (btnTema) {
        btnTema.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            var modoActual = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('retorica_theme', modoActual);
            mostrarToast("Tema " + (modoActual === 'light' ? 'Claro' : 'Oscuro') + " activado");
        });
    }

    // CONTROL DE DESLIZAMIENTO CON LOS DEDOS HACIA ARRIBA EN LA ZONA GRANDE
    if (touchZone && sidebar) {
        var startY = 0;
        touchZone.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });

        touchZone.addEventListener('touchmove', function(e) {
            var diffY = e.touches[0].clientY - startY;
            if (diffY < -40 && !sidebar.classList.contains('hidden')) {
                sidebar.classList.add('hidden');
                if (btnToggle) btnToggle.textContent = '▼';
            }
        }, { passive: true });
    }
    cargarNotas();
});

// ==========================================
// 2. ALMACENAMIENTO INDEXEDDB LOCAL
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
// 3. DICTADO POR VOZ (FRASERIZADO SIN REPETICIÓN)
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
        if (!recognition) return;
        if (!estaEscuchando) {
            estaEscuchando = true;
            recognition.start();
            btnMic.style.background = "#ef4444";
            mostrarToast("Grabando voz...");
        } else {
            estaEscuchando = false;
            recognition.stop();
            btnMic.style.background = "";
            mostrarToast("Micrófono en pausa");
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

// ==========================================
// 4. PERSISTENCIA DE PLANTILLAS Y EXPORTACIÓN
// ==========================================
document.getElementById('btn-main-guardar')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor) return;
    var content = editor.innerHTML;
    var tx = db.transaction("notas", "readwrite");
    tx.objectStore("notas").add({ contenido: content, fecha: new Date().toLocaleString() });
    tx.oncomplete = function() {
        mostrarToast("Nota respaldada");
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
                document.getElementById('btn-toggle-pestaña').textContent = '▼';
            });
            lista.appendChild(item);
            cursor.continue();
        }
    };
}

document.getElementById('export-pdf')?.addEventListener('click', function() {
    html2pdf().from(document.getElementById('editor')).save('nota.pdf');
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
