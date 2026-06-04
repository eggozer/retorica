// js/main.js - Versión Corregida y Unificada
import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, iniciarGrabacionVoz, detenerGrabacionVoz } from './audio.js';
import { cargarSelectores, aplicarTraduccionInterfaz, LISTA_IDIOMAS } from './idiomas.js';

// Variables de estado global
let idNotaActual = null;
let escuchandoDictado = false;
let grabandoNotaVoz = false;
let todasLasNotasLocales = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a elementos de la interfaz
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    const selectApp = document.getElementById('app-lang');
    const selectVoice = document.getElementById('voice-lang');
    const editorTitle = document.getElementById('editor-title');
    const editorBody = document.getElementById('editor');

    // 1. INICIALIZACIÓN DE IDIOMAS (Usando tu lógica de idiomas.js)
    if (selectApp && selectVoice) {
        cargarSelectores(selectApp, selectVoice);
        
        // Cargar preferencias guardadas
        const langGuardado = localStorage.getItem('ret_lang_app') || 'es';
        const vozGuardada = localStorage.getItem('ret_lang_voice') || 'es-MX';
        
        selectApp.value = langGuardado;
        selectVoice.value = vozGuardada;

        // Primera traducción al cargar
        ejecutarTraduccionGlobal(langGuardado);
    }

    // 2. LISTENERS DE IDIOMAS
    selectApp?.addEventListener('change', (e) => {
        const nuevoIdioma = e.target.value;
        localStorage.setItem('ret_lang_app', nuevoIdioma);
        ejecutarTraduccionGlobal(nuevoIdioma);
        mostrarToast(`App: ${nuevoIdioma.toUpperCase()}`);
    });

    selectVoice?.addEventListener('change', (e) => {
        localStorage.setItem('ret_lang_voice', e.target.value);
        mostrarToast(`Voz: ${e.target.value}`);
    });

    // 3. FUNCIÓN PUENTE PARA TRADUCCIÓN (Crucial para idiomas.js)
    function ejecutarTraduccionGlobal(codigo) {
        const elementosUI = {
            lblSaveAs: document.getElementById('btn-saveas-inline'),
            btnNuevo: document.getElementById('btn-cabecera-nuevo-fijo'),
            btnGuardar: document.getElementById('btn-html-save-directo'),
            editor: editorBody
        };
        // Llama a tu función original en idiomas.js
        aplicarTraduccionInterfaz(codigo, elementosUI);
        
        // Actualizar placeholder manual si el editor está vacío
        if (editorBody && !editorBody.innerText.trim()) {
            const config = LISTA_IDIOMAS.find(l => l.code === codigo);
            if (config) editorBody.setAttribute('data-placeholder', config.placeholder);
        }
    }

    // 4. GESTIÓN DE NOTAS (GUARDAR / NUEVO)
    document.getElementById('btn-html-save-directo')?.addEventListener('click', async () => {
        if (!editorTitle || !editorBody) return;
        
        if (idNotaActual === null) idNotaActual = Date.now();
        
        const exito = await guardarDocumento(
            idNotaActual, 
            editorTitle.innerHTML, 
            editorBody.innerHTML
        );

        if (exito) {
            mostrarToast("✓ Guardado");
            actualizarLista();
            persistirCache();
        }
    });

    document.getElementById('btn-cabecera-nuevo-fijo')?.addEventListener('click', () => {
        idNotaActual = null;
        editorTitle.innerHTML = "";
        editorBody.innerHTML = "";
        localStorage.removeItem('ret_cache_nota');
        actualizarContadores();
        sidebar?.classList.add('hidden');
        mostrarToast("Nueva Nota");
    });

    // 5. AUDIO Y DICTADO (Usando audio.js)
    document.getElementById('btn-mic')?.addEventListener('click', function() {
        const lang = selectVoice.value;
        if (!escuchandoDictado) {
            escuchandoDictado = true;
            this.style.background = "#ff3b30";
            iniciarDictado(lang, (texto) => {
                editorBody.focus();
                document.execCommand('insertText', false, texto + ' ');
                actualizarContadores();
            }, () => {
                escuchandoDictado = false;
                this.style.background = "";
            });
        } else {
            detenerDictado();
        }
    });

    document.getElementById('btn-lectura')?.addEventListener('click', () => {
        const texto = editorBody.innerText;
        const lang = selectVoice.value;
        if (texto.trim()) leerTexto(texto, lang, () => {});
    });

    // 6. UI Y SIDEBAR
    btnToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('hidden');
    });

    // 7. INICIALIZAR DB Y CARGAR DATOS
    try {
        await initDB();
        actualizarLista();
        restaurarCache();
    } catch (err) {
        console.error("Error DB:", err);
    }

    // Eventos de escritura
    editorTitle?.addEventListener('input', () => { persistirCache(); actualizarContadores(); });
    editorBody?.addEventListener('input', () => { persistirCache(); actualizarContadores(); });
});

// --- FUNCIONES DE APOYO ---

async function actualizarLista() {
    todasLasNotasLocales = await obtenerDocumentos();
    const lista = document.getElementById('document-list');
    if (!lista) return;
    lista.innerHTML = "";

    todasLasNotasLocales.forEach(nota => {
        const item = document.createElement('div');
        item.className = "document-list-item";
        item.innerHTML = `
            <div class="doc-item-title">${nota.titulo || 'Sin título'}</div>
            <div class="doc-item-actions">
                <button onclick="cargarNota(${nota.id})">📂</button>
                <button class="btn-action-delete" onclick="borrarNota(${nota.id})">🗑️</button>
            </div>
        `;
        lista.appendChild(item);
    });
}

window.cargarNota = async (id) => {
    const nota = todasLasNotasLocales.find(n => n.id === id);
    if (nota) {
        document.getElementById('editor-title').innerHTML = nota.titulo;
        document.getElementById('editor').innerHTML = nota.contenido;
        window.idNotaActual = id;
        document.getElementById('sidebar').classList.add('hidden');
        window.mostrarToast("Cargado");
    }
};

window.borrarNota = async (id) => {
    if (confirm("¿Eliminar nota?")) {
        await eliminarDocumento(id);
        actualizarLista();
    }
};

function persistirCache() {
    const data = {
        id: window.idNotaActual,
        t: document.getElementById('editor-title').innerHTML,
        b: document.getElementById('editor').innerHTML
    };
    localStorage.setItem('ret_cache_nota', JSON.stringify(data));
}

function restaurarCache() {
    const cache = localStorage.getItem('ret_cache_nota');
    if (cache) {
        const data = JSON.parse(cache);
        document.getElementById('editor-title').innerHTML = data.t;
        document.getElementById('editor').innerHTML = data.b;
        window.idNotaActual = data.id;
    }
}

function actualizarContadores() {
    const ed = document.getElementById('editor');
    const stats = document.getElementById('stats-text');
    if (ed && stats) stats.textContent = `Caracteres: ${ed.innerText.trim().length}`;
}

window.mostrarToast = (msg) => {
    const t = document.getElementById('toast-notif');
    if (t) {
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }
};
