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
let eventoInstalacionPWA = null;

const editor = document.getElementById('editor');
const statsText = document.getElementById('stats-text');
const lblFileDates = document.getElementById('lbl-file-dates');
const btnMic = document.getElementById('btn-mic');
const btnGrabWA = document.getElementById('btn-grab-audio-wa');
const btnRenderFL = document.getElementById('btn-render-fl');
const btnLectura = document.getElementById('btn-lectura');
const comboApp = document.getElementById('app-lang');
const comboVoz = document.getElementById('voice-lang');
const fontSelect = document.getElementById('font-family-select');
const btnTable = document.getElementById('btn-insert-table');
const btnOpenLocal = document.getElementById('btn-open-local');
const fileInputHidden = document.getElementById('file-input-hidden');
const comboModalidad = document.getElementById('combo-modalidad');
const btnTema = document.getElementById('btn-toggle-tema');
const btnGuardar = document.getElementById('btn-main-guardar');
const sidebar = document.getElementById('sidebar');
const btnTogglePestaña = document.getElementById('btn-toggle-pestaña');
const toast = document.getElementById('toast-notif');

const btnInstalarPWA = document.getElementById('btn-instalar-pwa');
const btnActualizarPWA = document.getElementById('btn-actualizar-pwa');

function inicializarApp() {
    cargarSelectores(comboApp, comboVoz);
    configurarEventosBasicos();
    configurarGestosDeslizamiento();
    configurarCicloVidaPWA();
    
    initDB().then(() => {
        actualizarContadoresEditor();
        renderizarListaDocumentos();
    }).catch(err => console.error(err));
}

function insertarNodoEnCursor(nodo) {
    editor.focus();
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(nodo);
        range.setStartAfter(nodo);
        range.setEndAfter(nodo);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        editor.appendChild(nodo);
    }
}

function configurarEventosBasicos() {
    editor.addEventListener('input', () => {
        actualizarContadoresEditor();
        ejecutarAutoGuardadoSilencioso();
    });

    comboModalidad.onchange = () => {
        editor.className = 'rich-editor';
        if (comboModalidad.value === 'carta') editor.classList.add('modo-carta');
        if (comboModalidad.value === 'oficio') editor.classList.add('modo-oficio');
    };

    fontSelect.onchange = () => {
        document.execCommand('fontName', false, fontSelect.value);
    };

    btnTable.onclick = () => {
        const tabla = document.createElement('table');
        tabla.className = 'editor-table';
        for (let i = 0; i < 2; i++) {
            const fila = tabla.insertRow();
            for (let j = 0; j < 3; j++) {
                const celda = fila.insertCell();
                celda.innerHTML = '...';
                celda.contentEditable = "true";
            }
        }
        insertarNodoEnCursor(tabla);
        ejecutarAutoGuardadoSilencioso();
    };

    btnOpenLocal.onclick = () => fileInputHidden.click();
    fileInputHidden.onchange = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        const lector = new FileReader();
        lector.onload = (evt) => {
            editor.innerHTML = evt.target.result;
            idDocumentoActual = null;
            actualizarContadoresEditor();
            mostrarNotificacion("Archivo importado listo");
        };
        lector.readAsText(archivo);
    };

    btnTogglePestaña.onclick = async () => {
        const seOculta = sidebar.classList.toggle('hidden');
        btnTogglePestaña.textContent = seOculta ? "▶" : "◀";
        btnTogglePestaña.style.left = seOculta ? "12px" : "292px";
        if (!seOculta) await renderizarListaDocumentos();
    };

    document.getElementById('btn-nuevo').onclick = () => {
        editor.innerHTML = ''; idDocumentoActual = null;
        notaAudiosLocales = []; documentoCreadoTimestamp = null;
        actualizarContadoresEditor();
        lblFileDates.textContent = "Nota limpia";
        renderizarListaDocumentos();
    };

    btnMic.onclick = () => {
        if (dictadoActivo) {
            detenerDictado(); btnMic.textContent = "🎙️"; dictadoActivo = false;
        } else {
            dictadoActivo = true; btnMic.textContent = "🛑";
            iniciarDictado(comboApp.value, (text) => {
                document.execCommand('insertText', false, text + ' ');
                actualizarContadoresEditor();
            }, () => { btnMic.textContent = "🎙️"; dictadoActivo = false; });
        }
    };

    btnGrabWA.onclick = () => {
        if (grabandoAudioWA) {
            detenerGrabacionVoz(); btnGrabWA.textContent = "🎙️💬"; grabandoAudioWA = false;
        } else {
            grabandoAudioWA = true; btnGrabWA.textContent = "🛑💬";
            iniciarGrabacionVoz((blobAudio) => {
                const url = URL.createObjectURL(blobAudio);
                const aud = document.createElement('audio');
                aud.controls = true; aud.src = url;
                insertarNodoEnCursor(aud);
                notaAudiosLocales.push(Date.now());
                mostrarNotificacion("Audio acoplado al renglón");
                ejecutarAutoGuardadoSilencioso();
                renderizarListaDocumentos();
            });
        }
    };

    btnRenderFL.onclick = () => {
        const selObj = window.getSelection();
        const textoFiltrado = selObj.toString().trim() ? selObj.toString() : editor.innerText;
        if (!textoFiltrado.trim()) return;

        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(textoFiltrado);
        u.lang = comboVoz.value;
        
        mostrarNotificacion("Renderizando texto a voz...");
        const aud = document.createElement('audio');
        aud.controls = true;
        
        const rec = new webkitSpeechRecognition();
        insertarNodoEnCursor(aud);
        synth.speak(u);
    };

    btnLectura.onclick = () => {
        if (lecturaActiva) {
            detenerLecturaManual(); btnLectura.textContent = "🔊"; lecturaActiva = false;
        } else {
            const act = leerTexto(editor.innerText, comboVoz.value, () => { btnLectura.textContent = "🔊"; lecturaActiva = false; });
            if (act) { btnLectura.textContent = "⏹️"; lecturaActiva = true; }
        }
    };

    btnTema.onclick = () => {
        const esClaro = document.body.classList.toggle('light-theme');
        btnTema.textContent = esClaro ? "☀️" : "🌙";
    };

    btnGuardar.onclick = async () => {
        if (!editor.innerText.trim()) return;
        await ejecutarAutoGuardadoSilencioso();
        lblFileDates.textContent = `Guardado: ${new Date().toLocaleTimeString()}`;
        mostrarNotificacion("Guardado local exitoso");
        await renderizarListaDocumentos();
    };
}

function configurarGestosDeslizamiento() {
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

function configurarCicloVidaPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); eventoInstalacionPWA = e;
        btnInstalarPWA.style.display = 'block';
    });
    btnInstalarPWA.onclick = () => {
        if (!eventoInstalacionPWA) return;
        eventoInstalacionPWA.prompt();
        eventoInstalacionPWA.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') btnInstalarPWA.style.display = 'none';
            eventoInstalacionPWA = null;
        });
    };
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
            reg.addEventListener('updatefound', () => {
                const nuevoWorker = reg.installing;
                nuevoWorker.addEventListener('statechange', () => {
                    if (nuevoWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        btnActualizarPWA.style.display = 'block';
                    }
                });
            });
        });
        btnActualizarPWA.onclick = () => {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg && reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            });
        };
    }
}

async function ejecutarAutoGuardadoSilencioso() {
    if (!editor.innerText.trim()) return;
    if (!idDocumentoActual) { idDocumentoActual = Date.now(); documentoCreadoTimestamp = Date.now(); }
    const inputInterno = document.getElementById(`rename-input-${idDocumentoActual}`);
    const defTitle = inputInterno ? inputInterno.value.trim() : (editor.innerText.split('\n')[0].substring(0, 16) || "Nota Activa");
    await guardarDocumento(idDocumentoActual, defTitle, editor.innerHTML, notaAudiosLocales, comboModalidad.value, "letter", documentoCreadoTimestamp);
}

function actualizarContadoresEditor() {
    const rawText = editor.innerText;
    statsText.textContent = `Caracteres: ${rawText.length} | Palabras: ${rawText.trim() === "" ? 0 : rawText.trim().split(/\s+/).length} | Líneas: ${rawText === "" ? 0 : rawText.split('\n').length}`;
}

async function renderizarListaDocumentos() {
    const lista = document.getElementById('document-list');
    if (!lista) return; lista.innerHTML = '';
    const docs = await obtenerDocumentos();

    docs.forEach(d => {
        const box = document.createElement('div');
        const esActivo = idDocumentoActual === d.id;
        box.style = `padding:10px; border-bottom:1px solid var(--border); margin-bottom:4px; border-radius:4px; background-color:${esActivo ? 'var(--bg-card-active)' : 'transparent'};`;
        
        box.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:bold;">
                    <span class="doc-clickable-title" style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📄 ${d.titulo}</span>
                    ${esActivo ? `<span id="btn-share-inline" style="margin-right:12px; font-size:16px; cursor:pointer;">🔗</span><span id="btn-del-inline" style="font-size:16px; color:var(--danger); cursor:pointer;">🗑️</span>` : ''}
                </div>
                ${esActivo ? `<input type="text" id="rename-input-${d.id}" value="${d.titulo}" style="width:100%; height:30px; background:rgba(0,0,0,0.2); font-size:12px;" placeholder="Renombrar plantilla...">` : ''}
            </div>
        `;

        box.querySelector('.doc-clickable-title').onclick = () => {
            idDocumentoActual = d.id; editor.innerHTML = d.contenido;
            notaAudiosLocales = d.audios || []; documentoCreadoTimestamp = d.creado;
            comboModalidad.value = d.tipo || "nota"; comboModalidad.onchange();
            lblFileDates.textContent = `Modificado: ${new Date(d.modificado).toLocaleTimeString()}`;
            actualizarContadoresEditor(); renderizarListaDocumentos();
        };

        if (esActivo) {
            const renameInput = box.querySelector(`#rename-input-${d.id}`);
            renameInput.addEventListener('input', () => {
                ejecutarAutoGuardadoSilencioso().then(() => {
                    box.querySelector('.doc-clickable-title').textContent = `📄 ${renameInput.value}`;
                });
            });

            box.querySelector('#btn-share-inline').onclick = (e) => {
                e.stopPropagation();
                if (navigator.share) navigator.share({ title: d.titulo, text: editor.innerText });
            };
            box.querySelector('#btn-del-inline').onclick = async (e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar "${d.titulo}"?`)) {
                    await eliminarDocumento(d.id); editor.innerHTML = ''; idDocumentoActual = null;
                    lblFileDates.textContent = "Sin guardar"; actualizarContadoresEditor(); renderizarListaDocumentos();
                }
            };
        }
        lista.appendChild(box);
    });
}

window.addEventListener('DOMContentLoaded', inicializarApp);
