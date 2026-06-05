// js/main.js
import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto } from './audio.js';
import { cargarSelectores, aplicarTraduccionInterfaz } from './idiomas.js';

let idNotaActual = null;
let todasLasNotasLocales = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a la UI
    const editorTitle = document.getElementById('editor-title');
    const editorBody = document.getElementById('editor');
    const selectApp = document.getElementById('app-lang');
    const selectVoice = document.getElementById('voice-lang');
    const statsText = document.getElementById('stats-text');

    // 1. Inicializar Idiomas
    if (selectApp && selectVoice) {
        cargarSelectores(selectApp, selectVoice);
        selectApp.value = localStorage.getItem('ret_lang_app') || 'es';
        selectVoice.value = localStorage.getItem('ret_lang_voice') || 'es-MX';
    }

    // 2. Función de Traducción (Usa tu lógica de idiomas.js)
    const traducir = (codigo) => {
        const elementos = {
            lblSaveAs: document.getElementById('btn-saveas-inline'),
            btnNuevo: document.getElementById('btn-cabecera-nuevo-fijo'),
            btnGuardar: document.getElementById('btn-html-save-directo'),
            editor: editorBody
        };
        aplicarTraduccionInterfaz(codigo, elementos);
    };

    // 3. Inicializar Base de Datos y cargar notas
    try {
        await initDB();
        await refrescarLista();
        restaurarCache();
        traducir(selectApp.value);
    } catch (e) { console.error("Error DB:", e); }

    // 4. Evento Guardar (Respeta tus 7 parámetros de storage.js)
    document.getElementById('btn-html-save-directo')?.addEventListener('click', async () => {
        if (!idNotaActual) idNotaActual = Date.now();
        
        // id, titulo, contenido, audios, tipo, tamaño, creado
        const exito = await guardarDocumento(
            idNotaActual, 
            editorTitle.innerHTML, 
            editorBody.innerHTML, 
            [], "nota", "letter", null
        );

        if (exito) {
            window.mostrarToast("✓ Guardado");
            refrescarLista();
        }
    });

    // 5. Dictado por Voz
    document.getElementById('btn-mic')?.addEventListener('click', function() {
        const micBtn = this;
        iniciarDictado(selectVoice.value, (texto) => {
            editorBody.focus();
            document.execCommand('insertText', false, texto + ' ');
            actualizarContadores();
        }, () => micBtn.style.background = "");
        micBtn.style.background = "#ff3b30";
    });

    // 6. Contadores y Caché
    const actualizarContadores = () => {
        if (statsText) statsText.textContent = `Caracteres: ${editorBody.innerText.trim().length}`;
        localStorage.setItem('ret_c_title', editorTitle.innerHTML);
        localStorage.setItem('ret_c_body', editorBody.innerHTML);
        localStorage.setItem('ret_c_id', idNotaActual);
    };

    editorTitle.addEventListener('input', actualizarContadores);
    editorBody.addEventListener('input', actualizarContadores);
});

async function refrescarLista() {
    todasLasNotasLocales = await obtenerDocumentos();
    const lista = document.getElementById('document-list');
    if (!lista) return;
    lista.innerHTML = todasLasNotasLocales.map(n => `
        <div class="document-list-item">
            <span onclick="window.cargarNota(${n.id})">📄 ${n.titulo || 'Sin título'}</span>
            <button onclick="window.borrarNota(${n.id})">🗑️</button>
        </div>
    `).join('');
}

function restaurarCache() {
    const t = localStorage.getItem('ret_c_title');
    const b = localStorage.getItem('ret_c_body');
    if (t) document.getElementById('editor-title').innerHTML = t;
    if (b) document.getElementById('editor').innerHTML = b;
}
