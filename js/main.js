// ==========================================
// 1. CONTROL VISUAL DE DESPLIEGUE CON TRANSPARENCIA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            btnToggle.textContent = sidebar.classList.contains('hidden') ? '▼' : '▲';
            // Ajustar la posición de la pestaña flotante de arriba a abajo
            btnToggle.style.top = sidebar.classList.contains('hidden') ? '10px' : 'calc(45vh - 20px)';
        });
    }
    cargarNotas();
});

// ==========================================
// 2. BASE DE DATOS LOCAL (INDEXEDDB) BLINDADA
// ==========================================
const dbName = "RetoricaDB";
let db;
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("notas")) {
        db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function(e) {
    db = e.target.result;
};

request.onerror = function() {
    mostrarToast("Error al inicializar almacenamiento");
};

// ==========================================
// 3. CONTROL DE DICTADO POR VOZ SIN DUPLICACIÓN DE PALABRAS
// ==========================================
let recognition;
let estaEscuchando = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechObj();
    recognition.continuous = false; // Cambiado a falso para obligar limpieza de búfer por frase
    recognition.interimResults = false; // Desactivar resultados previos inestables que duplican texto

    recognition.onresult = function(e) {
        // Tomar estrictamente la frase final procesada sin acumular buffers basura
        const resultadoFinal = e.results[0][0].transcript;
        if (resultadoFinal && resultadoFinal.trim() !== "") {
            insertarTextoEnEditor(resultadoFinal.trim() + ' ');
        }
    };

    recognition.onend = function() {
        // Si el usuario no lo apagó manualmente, reiniciamos el ciclo de escucha limpio
        if (estaEscuchando) {
            recognition.start();
        }
    };
}

const btnMic = document.getElementById('btn-mic');
if(btnMic) {
    btnMic.addEventListener('click', () => {
        if (!recognition) {
            mostrarToast("Dictado no soportado");
            return;
        }
        if (!estaEscuchando) {
            recognition.lang = document.getElementById('app-lang').value;
            estaEscuchando = true;
            recognition.start();
            btnMic.style.background = "#ef4444";
            mostrarToast("Micrófono activo");
        } else {
            estaEscuchando = false;
            recognition.stop();
            btnMic.style.background = "var(--bg-card)";
            mostrarToast("Micrófono apagado");
        }
    });
}

function insertarTextoEnEditor(texto) {
    const editor = document.getElementById('editor');
    if(editor) {
        editor.focus();
        document.execCommand('insertText', false, texto);
        actualizarContadores();
    }
}

// LECTURA DE TEXTO
document.getElementById('btn-lectura')?.addEventListener('click', () => {
    const editor = document.getElementById('editor');
    if(!editor || !editor.innerText.trim()) return;
    window.speechSynthesis.cancel(); // Limpiar lecturas anteriores
    const utterance = new SpeechSynthesisUtterance(editor.innerText);
    utterance.lang = document.getElementById('voice-lang').value;
    window.speechSynthesis.speak(utterance);
});

// ==========================================
// 4. FUNCIONES DE ALMACENAMIENTO Y EXPORTACIÓN
// ==========================================
document.getElementById('btn-main-guardar')?.addEventListener('click', () => {
    const editor = document.getElementById('editor');
    if(!editor) return;
    const content = editor.innerHTML;
    const tx = db.transaction("notas", "readwrite");
    const store = tx.objectStore("notas");
    store.add({ contenido: content, fecha: new Date().toLocaleString() });
    tx.oncomplete = function() {
        mostrarToast("Nota guardada");
        cargarNotas();
    };
});

function cargarNotas() {
    const lista = document.getElementById('document-list');
    if(!lista) return;
    lista.innerHTML = "";

    // Evitar fallas si DB aún está cargando en milisegundos iniciales
    if (!db) { setTimeout(cargarNotas, 200); return; }

    const tx = db.transaction("notas", "readonly");
    const store = tx.objectStore("notas");
    store.openCursor().onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            const item = document.createElement('div');
            item.className = "document-list-item";
            item.innerHTML = `📄 Nota #${cursor.value.id}<br><small>${cursor.value.fecha.split(' ')[0]}</small>`;
            
            item.addEventListener('click', () => {
                document.getElementById('editor').innerHTML = cursor.value.contenido;
                actualizarContadores();
                document.getElementById('sidebar').classList.add('hidden');
                document.getElementById('btn-toggle-pestaña').textContent = '▼';
                document.getElementById('btn-toggle-pestaña').style.top = '10px';
            });
            lista.appendChild(item);
            cursor.continue();
        }
    };
}

document.getElementById('export-pdf')?.addEventListener('click', () => {
    const element = document.getElementById('editor');
    html2pdf().from(element).save('retorica-documento.pdf');
});

document.getElementById('export-doc')?.addEventListener('click', () => {
    const html = document.getElementById('editor').innerHTML;
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retorica-export.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// ==========================================
// 5. CONTADORES Y EVENTOS AUXILIARES
// ==========================================
function actualizarContadores() {
    const editor = document.getElementById('editor');
    const stats = document.getElementById('stats-text');
    if(editor && stats) {
        stats.textContent = `Caracteres: ${editor.innerText.trim().length}`;
    }
}

document.getElementById('editor')?.addEventListener('input', actualizarContadores);

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast-notif');
    if(toast) {
        toast.textContent = mensaje;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
}

document.getElementById('combo-modalidad')?.addEventListener('change', (e) => {
    const editor = document.getElementById('editor');
    if(!editor) return;
    editor.className = "rich-editor";
    if(e.target.value === 'carta') editor.classList.add('modo-carta');
    if(e.target.value === 'oficio') editor.classList.add('modo-oficio');
});

document.getElementById('btn-nuevo')?.addEventListener('click', () => {
    const editor = document.getElementById('editor');
    if(editor) {
        editor.innerHTML = "";
        actualizarContadores();
        mostrarToast("Nueva nota limpia");
    }
});
