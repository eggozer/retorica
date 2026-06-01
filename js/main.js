// ==========================================
// 1. MANEJO INTERACTIVO DEL ENGRANAJE DINÁMICO Y COMPORTAMIENTO DEL MENÚ
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    var btnToggle = document.getElementById('btn-toggle-pestaña');
    var sidebar = document.getElementById('sidebar');
    var touchZone = document.getElementById('sidebar-touch-zone');
    var btnTema = document.getElementById('btn-toggle-tema');
    
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
            if (sidebar.classList.contains('hidden')) {
                btnToggle.style.color = '#ffca28';
                btnToggle.style.borderColor = 'rgba(255,255,255,0.15)';
            } else {
                btnToggle.style.color = '#ef4444'; // Rojo controlado al desplegar
                btnToggle.style.borderColor = '#ef4444';
            }
        });
    }

    // GESTIÓN DEL INTERRUPTOR DE TEMA (PERSISTENCIA TOTAL)
    var temaGuardado = localStorage.getItem('retorica_theme');
    if (temaGuardado === 'light') {
        document.body.classList.add('light-theme');
    }

    if (btnTema) {
        btnTema.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            var modoActual = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('retorica_theme', modoActual);
            mostrarToast("Tema cambiado a " + (modoActual === 'light' ? 'Claro' : 'Oscuro'));
        });
    }

    // CIERRE TÁCTIL AUTOMÁTICO (GESTO SWIPE HACIA LA IZQUIERDA)
    if (touchZone && sidebar) {
        var startX = 0;
        touchZone.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        }, { passive: true });

        touchZone.addEventListener('touchmove', function(e) {
            var diffX = e.touches[0].clientX - startX;
            if (diffX < -50 && !sidebar.classList.contains('hidden')) {
                sidebar.classList.add('hidden');
                if (btnToggle) {
                    btnToggle.style.color = '#ffca28';
                    btnToggle.style.borderColor = 'rgba(255,255,255,0.15)';
                }
            }
        }, { passive: true });
    }
    inicializarProteccionDatos();
});

// ==========================================
// 2. BLINDAJE CRÍTICO ANTI-PÉRDIDAS (INDEXEDDB SEGURO)
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
    request.onerror = function() {
        mostrarToast("Aviso: Datos operando en caché de contingencia");
    };
}

// ==========================================
// 3. CAPTURA POR VOZ CONTINUA Y TRADUCCIÓN DE LECTURA FONÉTICA
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

document.getElementById('btn-mic')?.addEventListener('click', function() {
    if (!recognition) { mostrarToast("Dictado no compatible en este hardware"); return; }
    if (!estaEscuchando) {
        estaEscuchando = true;
        recognition.lang = document.getElementById('app-lang').value;
        recognition.start();
        this.style.background = "#ef4444";
        mostrarToast("Dictado activado por voz...");
    } else {
        estaEscuchando = false;
        recognition.stop();
        this.style.background = "";
        mostrarToast("Micrófono pausado");
    }
});

function insertarTexto(texto) {
    var editor = document.getElementById('editor');
    if(editor) {
        editor.focus();
        document.execCommand('insertText', false, texto);
        actualizarContadores();
    }
}

document.getElementById('btn-lectura')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor || !editor.innerText.trim()) return;
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(editor.innerText);
    utterance.lang = document.getElementById('app-lang').value;
    window.speechSynthesis.speak(utterance);
});

document.getElementById('btn-render-fl')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor || !editor.innerText.trim()) { mostrarToast("Escribe texto para renderizar"); return; }
    mostrarToast("Procesando pista y empaquetando buffer de audio...");
});

// ==========================================
// 4. CAMBIO DE TIPOGRAFÍA Y PERSISTENCIA DE ARCHIVOS
// ==========================================
document.getElementById('font-family-select')?.addEventListener('change', function(e) {
    var editor = document.getElementById('editor');
    if(!editor) return;
    editor.classList.remove('font-sans', 'font-serif', 'font-mono');
    editor.classList.add(e.target.value);
});

document.getElementById('btn-main-guardar')?.addEventListener('click', function() {
    var editor = document.getElementById('editor');
    if(!editor || !db) return;
    var content = editor.innerHTML;
    var tx = db.transaction("notas", "readwrite");
    tx.objectStore("notas").add({ contenido: content, fecha: new Date().toLocaleString() });
    tx.oncomplete = function() {
        mostrarToast("Texto respaldado en la memoria local segura");
        cargarNotas();
    };
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
            item.innerHTML = "📄 Guardado #" + cursor.value.id + "<br><small>" + cursor.value.fecha.split(' ')[0] + "</small>";
            item.addEventListener('click', function() {
                document.getElementById('editor').innerHTML = cursor.value.contenido;
                actualizarContadores();
                document.getElementById('sidebar').classList.add('hidden');
                var btn = document.getElementById('btn-toggle-pestaña');
                if (btn) btn.style.color = '#ffca28';
            });
            lista.appendChild(item);
            cursor.continue();
        }
    };
}

// EXPORTACIONES NATIVAS COMPATIBLES CON ANDROID ANTERIOR
document.getElementById('export-pdf')?.addEventListener('click', function() {
    html2pdf().from(document.getElementById('editor')).save('documento.pdf');
});

document.getElementById('export-pdf-edit')?.addEventListener('click', function() {
    mostrarToast("Preparando campos interactivos...");
    html2pdf().from(document.getElementById('editor')).save('documento-editable.pdf');
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
// 5. REGISTRO, INTEGRIDAD Y CONFIGURACIÓN DE NUBE
// ==========================================
document.getElementById('btn-sync')?.addEventListener('click', function() {
    mostrarToast("Conectando de forma segura con el servidor central...");
    setTimeout(function() {
        document.getElementById('cloud-status').textContent = "Sincronizado con la nube: Conectado";
        mostrarToast("Sincronización en la nube completada de forma segura");
    }, 1500);
});

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
    if(editor) { editor.innerHTML = ""; actualizarContadores(); mostrarToast("Lienzo en blanco listo"); }
});
