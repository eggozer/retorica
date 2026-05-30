// ==========================================
// 1. INFRAESTRUCTURA DE BLINDAJE Y CONTROLES VISUALES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    
    // Control de apertura y cierre del menú lateral (Pestaña)
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            btnToggle.textContent = sidebar.classList.contains('hidden') ? '▶' : '◀';
            // Desplazamiento dinámico para que la pestaña no tape el signo ➕
            btnToggle.style.left = sidebar.classList.contains('hidden') ? '12px' : 'calc(100vw - 54px)';
        });
    }

    // CONTROL DE MONETIZACIÓN: INTERRUPTOR DE USUARIO (GRATIS / PREMIUM)
    const MODO_SUSCRIPCION = false; // Cambiar a true cuando se active el pago por suscripción
    const contenedorGratis = document.getElementById('document-list');
    const contenedorPremium = document.getElementById('document-list-premium');

    if (MODO_SUSCRIPCION) {
        if(contenedorGratis) contenedorGratis.style.display = 'none';
        if(contenedorPremium) contenedorPremium.style.display = 'grid';
    } else {
        if(contenedorGratis) contenedorGratis.style.display = 'flex';
        if(contenedorPremium) contenedorPremium.style.display = 'none';
    }

    // INICIALIZACIÓN DEL REGISTRO Y DISPOSITIVOS VINCULADOS
    initAutenticacionSincronizada();
});

function initAutenticacionSincronizada() {
    console.log("Retórica: Inicializando control de identidad del dispositivo...");
    const cuentaGuardada = localStorage.getItem('retorica_user_session');
    if (cuentaGuardada) {
        sincronizarDispositivosYNotas(cuentaGuardada);
    }
}

function sincronizarDispositivosYNotas(userId) {
    console.log(`Retórica: Sincronizando datos para el usuario ${userId}`);
}

// ==========================================
// 2. BASE DE DATOS LOCAL (INDEXEDDB) - ORIGINAL INTACTO
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
    cargarNotas();
};

request.onerror = function() {
    mostrarToast("Error al abrir la base de datos");
};

// ==========================================
// 3. LOGICA DE DICTADO POR VOZ Y AUDIO (ORAL)
// ==========================================
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechObj();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function(e) {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
                finalTranscript += e.results[i][0].transcript;
            } else {
                interimTranscript += e.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
            insertarTextoEnEditor(finalTranscript + ' ');
        }
    };
}

const btnMic = document.getElementById('btn-mic');
if(btnMic) {
    btnMic.addEventListener('click', () => {
        if (!recognition) {
            mostrarToast("Dictado no soportado en este navegador");
            return;
        }
        const lang = document.getElementById('app-lang').value;
        recognition.lang = lang;
        try {
            recognition.start();
            mostrarToast("Escuchando...");
        } catch(e) {
            recognition.stop();
            mostrarToast("Dictado detenido");
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

// LECTURA DE TEXTO (TEXT TO SPEECH)
const btnLectura = document.getElementById('btn-lectura');
if(btnLectura) {
    btnLectura.addEventListener('click', () => {
        const editor = document.getElementById('editor');
        if(!editor || !editor.innerText.trim()) return;
        const utterance = new SpeechSynthesisUtterance(editor.innerText);
        utterance.lang = document.getElementById('voice-lang').value;
        window.speechSynthesis.speak(utterance);
    });
}

// ==========================================
// 4. FUNCIONES DE EXPORTACIÓN (PDF, DOC, HTML)
// ==========================================
const btnGuardarHTML = document.getElementById('btn-main-guardar');
if(btnGuardarHTML) {
    btnGuardarHTML.addEventListener('click', () => {
        guardarNotaActual();
    });
}

function guardarNotaActual() {
    const editor = document.getElementById('editor');
    if(!editor) return;
    const content = editor.innerHTML;
    const tx = db.transaction("notas", "readwrite");
    const store = tx.objectStore("notas");
    store.add({ contenido: content, fecha: new Date().toLocaleString() });
    tx.oncomplete = function() {
        mostrarToast("Nota guardada en el dispositivo");
        cargarNotas();
    };
}

function cargarNotas() {
    const lista = document.getElementById('document-list');
    const listaPremium = document.getElementById('document-list-premium');
    if(!lista) return;
    lista.innerHTML = "";
    if(listaPremium) listaPremium.innerHTML = "";

    const tx = db.transaction("notas", "readonly");
    const store = tx.objectStore("notas");
    store.openCursor().onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            const item = document.createElement('div');
            item.className = "document-list-item";
            item.innerHTML = `📄 Note #${cursor.value.id}<br><small>${cursor.value.fecha.split(' ')[0]}</small>`;
            
            item.addEventListener('click', () => {
                document.getElementById('editor').innerHTML = cursor.value.contenido;
                actualizarContadores();
                document.getElementById('sidebar').classList.add('hidden');
                document.getElementById('btn-toggle-pestaña').textContent = '▶';
                document.getElementById('btn-toggle-pestaña').style.left = '12px';
            });

            // Se inyecta en el contenedor activo según suscripción
            if (listaPremium && listaPremium.style.display === 'grid') {
                listaPremium.appendChild(item);
            } else {
                lista.appendChild(item);
            }
            cursor.continue();
        }
    };
}

// EXPORTACIONES A FORMATOS EXTERNOS
document.getElementById('export-pdf')?.addEventListener('click', () => {
    const element = document.getElementById('editor');
    html2pdf().from(element).save('retorica-documento.pdf');
});

document.getElementById('export-pdf-edit')?.addEventListener('click', () => {
    mostrarToast("Generando PDF estructurado editable...");
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
// 5. CONTADORES Y CONFIGURACIONES COMPLEMENTARIAS
// ==========================================
function actualizarContadores() {
    const editor = document.getElementById('editor');
    const stats = document.getElementById('stats-text');
    if(editor && stats) {
        const len = editor.innerText.trim().length;
        stats.textContent = `Caracteres: ${len}`;
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

// Control del selector de plantillas/modalidades físicas de hoja
document.getElementById('combo-modalidad')?.addEventListener('change', (e) => {
    const editor = document.getElementById('editor');
    if(!editor) return;
    editor.className = "rich-editor";
    if(e.target.value === 'carta') editor.classList.add('modo-carta');
    if(e.target.value === 'oficio') editor.classList.add('modo-oficio');
});

// Botón nueva nota limpia
document.getElementById('btn-nuevo')?.addEventListener('click', () => {
    const editor = document.getElementById('editor');
    if(editor) {
        editor.innerHTML = "";
        actualizarContadores();
        mostrarToast("Nueva plantilla limpia lista");
    }
});
