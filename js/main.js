// --- ORQUESTADOR CENTRAL INTERACTIVO CON SWIPE DIRECCIONAL ---

import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, detenerLecturaManual, iniciarGrabacionVoz, detenerGrabacionVoz, renderizarTextoAAudio } from './audio.js';
import { cargarSelectores } from './idiomas.js';

let idDocumentoActual = null;
let dictadoActivo = false;
let lecturaActiva = false;
let grabandoAudioWA = false;
let notaAudiosLocales = [];
let documentoCreadoTimestamp = null;

let touchStartX = 0;

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
const sidebar = document.getElementById('sidebar');
const btnTogglePestaña = document.getElementById('btn-toggle-pestaña');

function inicializarApp() {
    cargarSelectores(comboApp, comboVoz);
    configurarEventosBasicos();
    configurarGestosDeslizamiento();
    
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
        editor.className = '';
        if (comboModalidad.value === 'carta') editor.classList.add('modo-carta');
        if (comboModalidad.value === 'oficio') editor.classList.add('modo-oficio');
    };

    btnTogglePestaña.onclick = async () => {
        const seOculta = sidebar.classList.toggle('hidden');
        btnTogglePestaña.textContent = seOculta ? "▶" : "◀";
        btnTogglePestaña.style.left = seOculta ? "12px" : "292px";
        if (!seOculta) await renderizarListaDocumentos();
    };

    document.getElementById('btn-nuevo').onclick = () => {
        editor.value = ''; idDocumentoActual = null;
        notaAudiosLocales = []; documentoCreadoTimestamp = null;
        txtRenameFile.value = ''; actualizarContadoresEditor();
        lblFileDates.textContent = "Nota limpia";
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
            detenerGrabacionVoz(); btnGrabWA.textContent = "🎙️💬"; grabandoAudioWA = false;
        } else {
            grabandoAudioWA = true; btnGrabWA.textContent = "🛑💬";
            iniciarGrabacionVoz((blobAudio) => {
                notaAudiosLocales.push(Date.now());
                mostrarNotificacion("Mensaje de voz acoplado");
                ejecutarAutoGuardadoSilencioso();
                renderizarListaDocumentos();
            });
        }
    };

    btnRenderFL.onclick = () => {
        const sel = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        renderizarTextoAAudio(sel.trim() ? sel : editor.value, comboVoz.value);
        mostrarNotificacion("Audio exportado");
    };

    btnLectura.onclick = () => {
        if (lecturaActiva) {
            detenerLecturaManual(); btnLectura.textContent = "🔊"; lecturaActiva = false;
        } else {
            const act = leerTexto(editor.value, comboVoz.value, () => { btnLectura.textContent = "🔊"; lecturaActiva = false; });
            if (act) { btnLectura.textContent = "⏹️"; lecturaActiva = true; }
        }
    };

    btnTema.onclick = () => {
        const esClaro = document.body.classList.toggle('light-theme');
        btnTema.textContent = esClaro ? "☀️" : "🌙";
    };

    btnGuardar.onclick = async () => {
        if (!editor.value.trim()) return;
        await ejecutarAutoGuardadoSilencioso();
        lblFileDates.textContent = `Guardado: ${new Date().toLocaleTimeString()}`;
        mostrarNotificacion("Guardado local exitoso");
        await renderizarListaDocumentos();
    };

    txtRenameFile.addEventListener('input', () => {
        if (idDocumentoActual) ejecutarAutoGuardadoSilencioso().then(() => renderizarListaDocumentos());
    });
}

function configurarGestosDeslizamiento() {
    // ABRE DESLIZANDO DESDE LA IZQUIERDA, CIERRA DESLIZANDO A LA IZQUIERDA
    window.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    window.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        if (diffX > 80 && sidebar.classList.contains('hidden')) { 
            sidebar.classList.remove('hidden'); btnTogglePestaña.textContent = "◀"; btnTogglePestaña.style.left = "292px";
        } else if (diffX < -80 && !sidebar.classList.contains('hidden')) {
            sidebar.classList.add('hidden'); btnTogglePestaña.textContent = "▶"; btnTogglePestaña.style.left = "12px";
        }
    }, { passive: true });
}

async function ejecutarAutoGuardadoSilencioso() {
    if (!editor.value.trim()) return;
    if (!idDocumentoActual) { idDocumentoActual = Date.now(); documentoCreadoTimestamp = Date.now(); }
    const defTitle = txtRenameFile.value.trim() || editor.value.split('\n')[0].substring(0, 20) || "Nota Activa";
    await guardarDocumento(idDocumentoActual, defTitle, editor.value, notaAudiosLocales, comboModalidad.value, "letter", documentoCreadoTimestamp);
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
        const box = document.createElement('div');
        const esActivo = idDocumentoActual === d.id;
        box.style = `padding:10px; border-bottom:1px solid var(--border); margin-bottom:4px; border-radius:4px; background-color:${esActivo ? 'var(--bg-card-active)' : 'transparent'}`;
        
        const wavs = d.audios && d.audios.length > 0 ? ` ▶️ (${d.audios.length})` : '';
        box.innerHTML = `
            <div style="display:flex; justify-content:between; align-items:center; font-size:13px; font-weight:bold;">
                <span style="flex:1;">📄 ${d.titulo}${wavs}</span>
                ${esActivo ? `<span id="btn-share-inline" title="Compartir" style="margin-right:8px; cursor:pointer;">🔗</span><span id="btn-del-inline" title="Borrar" style="cursor:pointer; color:var(--danger);">🗑️</span>` : ''}
            </div>
        `;

        box.querySelector('span').onclick = () => {
            idDocumentoActual = d.id; editor.value = d.contenido;
            notaAudiosLocales = d.audios || []; documentoCreadoTimestamp = d.creado;
            txtRenameFile.value = d.titulo; comboModalidad.value = d.tipo || "nota";
            comboModalidad.onchange();
            lblFileDates.textContent = `Modificado: ${new Date(d.modificado).toLocaleTimeString()}`;
            actualizarContadoresEditor(); renderizarListaDocumentos();
        };

        if (esActivo) {
            box.querySelector('#btn-share-inline').onclick = (e) => {
                e.stopPropagation();
                if (navigator.share) navigator.share({ title: d.titulo, text: editor.value });
                else { navigator.clipboard.writeText(editor.value); mostrarNotificacion("Copiado al portapapeles"); }
            };
            box.querySelector('#btn-del-inline').onclick = async (e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar "${d.titulo}"?`)) {
                    await eliminarDocumento(d.id); editor.value = ''; idDocumentoActual = null;
                    txtRenameFile.value = ''; renderizarListaDocumentos();
                }
            };
        }
        lista.appendChild(box);
    });
}

function mostrarNotificacion(m) {
    if (!toast) return; toast.textContent = m; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

window.addEventListener('DOMContentLoaded', inicializarApp);
