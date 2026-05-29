// --- CONTROLADOR GENERAL MAESTRO RETÓRICA (MAIN) ---

import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, iniciarGrabacionVoz, detenerGrabacionVoz, renderizarTextoAAudio } from './audio.js';
import { cargarSelectores, aplicarTraduccionInterfaz } from './idiomas.js';

let idDocumentoActual = null;
let dictadoActivo = false;
let lecturaActiva = false;
let grabandoAudioWA = false;
let notaAudiosLocales = [];
let documentoCreadoTimestamp = null;

const editor = document.getElementById('editor');
const statsText = document.getElementById('stats-text');
const lblFileDates = document.getElementById('lbl-file-dates');
const txtRenameFile = document.getElementById('txt-rename-file');
const btnMic = document.getElementById('btn-mic');
const btnGrabWA = document.getElementById('btn-grab-audio-wa');
const btnRenderFL = document.getElementById('btn-render-fl');
const btnLectura = document.getElementById('btn-lectura');
const comboApp = document.getElementById('app-lang');
const comboVoz = document.getElementById('voice-lang');
const comboModalidad = document.getElementById('combo-modalidad');
const btnTema = document.getElementById('btn-toggle-tema');
const btnGuardar = document.getElementById('btn-main-guardar');
const btnCompartir = document.getElementById('btn-compartir-nota');
const toast = document.getElementById('toast-notif');

const sidebar = document.getElementById('sidebar');
const btnTogglePestaña = document.getElementById('btn-toggle-pestaña');

function inicializarApp() {
    cargarSelectores(comboApp, comboVoz);
    configurarEventosBasicos();
    configurarSeguimientoUsuarios();
    
    initDB().then(() => {
        actualizarContadoresEditor();
        renderizarListaDocumentos();
    }).catch(err => console.error(err));
}

function configurarEventosBasicos() {
    editor.addEventListener('input', () => {
        actualizarContadoresEditor();
        ejecutarAutoGuardadoSilencioso();
    });

    comboModalidad.onchange = () => {
        if (comboModalidad.value === 'nota') {
            editor.className = '';
        } else {
            editor.className = 'modo-word';
        }
    };

    if (btnTogglePestaña && sidebar) {
        btnTogglePestaña.onclick = async () => {
            const seOculta = sidebar.classList.toggle('hidden');
            btnTogglePestaña.textContent = seOculta ? "▶" : "◀";
            btnTogglePestaña.style.left = seOculta ? "12px" : "292px";
            if (!seOculta) await renderizarListaDocumentos();
        };
    }

    document.getElementById('btn-nuevo').onclick = () => {
        editor.value = ''; idDocumentoActual = null;
        notaAudiosLocales = []; documentoCreadoTimestamp = null;
        txtRenameFile.value = '';
        actualizarContadoresEditor();
        lblFileDates.textContent = "Nota nueva limpia";
    };

    btnMic.onclick = () => {
        if (dictadoActivo) {
            detenerDictado(); btnMic.textContent = "🎙️"; dictadoActivo = false;
        } else {
            dictadoActivo = true; btnMic.textContent = "🛑";
            iniciarDictado(comboApp.value, (t) => { editor.value += (editor.value ? ' ' : '') + t; actualizarContadoresEditor(); }, () => { btnMic.textContent = "🎙️"; dictadoActivo = false; });
        }
    };

    btnGrabWA.onclick = () => {
        if (grabandoAudioWA) {
            detenerGrabacionVoz();
            btnGrabWA.textContent = "🎙️💬"; grabandoAudioWA = false;
        } else {
            grabandoAudioWA = true; btnGrabWA.textContent = "🛑💬 (Grabando...)";
            iniciarGrabacionVoz((blobAudio) => {
                notaAudiosLocales.push(Date.now());
                mostrarNotificacion("Mensaje de voz guardado en esta plantilla");
                ejecutarAutoGuardadoSilencioso();
                renderizarListaDocumentos();
            });
        }
    };

    btnRenderFL.onclick = () => {
        const seleccion = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        const textoAFononizar = seleccion.trim() ? seleccion : editor.value;
        renderizarTextoAAudio(textoAFononizar, comboVoz.value);
        mostrarNotificacion("Renderizando track de audio...");
    };

    btnLectura.onclick = () => {
        const comenzo = leerTexto(editor.value, comboVoz.value, () => { lecturaActiva = false; btnLectura.textContent = "🔊"; });
        btnLectura.textContent = comenzo ? "⏹️" : "🔊";
    };

    btnTema.onclick = () => {
        const esClaro = document.body.classList.toggle('light-theme');
        btnTema.textContent = esClaro ? "☀️" : "🌙";
    };

    btnGuardar.onclick = async () => {
        await ejecutarGuardadoFisicoCompleto();
    };

    btnCompartir.onclick = () => {
        if (!editor.value.trim()) return;
        if (navigator.share) {
            navigator.share({ title: txtRenameFile.value || 'Guion Retórica', text: editor.value });
        } else {
            navigator.clipboard.writeText(editor.value);
            mostrarNotificacion("Texto copiado al portapapeles para compartir");
        }
    };
}

async function ejecutarAutoGuardadoSilencioso() {
    if (!editor.value.trim()) return;
    if (!idDocumentoActual) { idDocumentoActual = Date.now(); documentoCreadoTimestamp = Date.now(); }
    const titulo = txtRenameFile.value.trim() || editor.value.split('\n')[0].substring(0, 22) || "Nota Automática";
    await guardarDocumento(idDocumentoActual, titulo, editor.value, notaAudiosLocales, comboModalidad.value, "letter", documentoCreadoTimestamp);
}

async function ejecutarGuardadoFisicoCompleto() {
    if (!editor.value.trim()) return;
    await ejecutarAutoGuardadoSilencioso();
    mostrarNotificacion("Cambios sincronizados localmente sin descargas repetidas");
    lblFileDates.textContent = `Modificado: ${new Date().toLocaleTimeString()}`;
    await renderizarListaDocumentos();
}

function configurarSeguimientoUsuarios() {
    const emailInput = document.getElementById('txt-user-email');
    const lblStatus = document.getElementById('lbl-user-status');
    
    const emailGuardado = localStorage.getItem('retorica_user_session');
    if (emailGuardado) {
        emailInput.value = emailGuardado;
        lblStatus.textContent = `Sincronizado: ${emailGuardado}`;
    }

    document.getElementById('btn-user-login').onclick = () => {
        if (emailInput.value.trim()) {
            localStorage.setItem('retorica_user_session', emailInput.value.trim());
            lblStatus.textContent = `Sincronizado: ${emailInput.value.trim()}`;
            mostrarNotificacion("Perfil acoplado");
        }
    };

    document.getElementById('btn-user-logout').onclick = () => {
        localStorage.removeItem('retorica_user_session');
        emailInput.value = '';
        lblStatus.textContent = "Dispositivo: Autónomo";
        mostrarNotificacion("Sesión cerrada en este nodo");
    };
}

function actualizarContadoresEditor() {
    const t = editor.value;
    statsText.textContent = `Caracteres: ${t.length} | Palabras: ${t.trim() === "" ? 0 : t.trim().split(/\s+/).length} | Líneas: ${t === "" ? 0 : t.split('\n').length}`;
}

async function renderizarListaDocumentos() {
    const lista = document.getElementById('document-list');
    if (!lista) return; lista.innerHTML = '';
    const docs = await obtenerDocumentos();

    docs.forEach(d => {
        const itemBox = document.createElement('div');
        itemBox.style = 'padding:10px; border-bottom:1px solid var(--border); cursor:pointer; background-color:' + (idDocumentoActual === d.id ? 'var(--bg-card-active)' : 'transparent');
        
        const titleSpan = document.createElement('div');
        titleSpan.style = 'font-size:13px; font-weight:bold; display:flex; align-items:center; justify-content:space-between;';
        
        // ICONO PLAY WHATSAPP SI CUENTA CON AUDIOS INTERNOS GRABADOS
        const infoAudios = d.audios && d.audios.length > 0 ? ` ▶️🎵 (${d.audios.length})` : '';
        titleSpan.innerHTML = `<span>📄 ${d.titulo}${infoAudios}</span>`;
        
        const dateDiv = document.createElement('div');
        dateDiv.style = 'font-size:10px; color:var(--text-muted); margin-top:4px;';
        dateDiv.textContent = `Modificado: ${new Date(d.modificado).toLocaleDateString()}`;

        itemBox.onclick = () => {
            idDocumentoActual = d.id; editor.value = d.contenido;
            notaAudiosLocales = d.audios || [];
            documentoCreadoTimestamp = d.creado;
            txtRenameFile.value = d.titulo;
            comboModalidad.value = d.tipo || "nota";
            comboModalidad.onchange();
            lblFileDates.textContent = `Creado: ${new Date(d.creado).toLocaleTimeString()}`;
            actualizarContadoresEditor();
            renderizarListaDocumentos();
        };

        itemBox.appendChild(titleSpan);
        itemBox.appendChild(dateDiv);
        lista.appendChild(itemBox);
    });
}

function mostrarNotificacion(m) {
    if (!toast) return; toast.textContent = m; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

window.addEventListener('DOMContentLoaded', inicializarApp);
