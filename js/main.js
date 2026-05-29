// --- CONMUTADOR CENTRAL Y CONTROLADOR DE INTERFAZ (MAIN) ---

import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto } from './audio.js';
import { cargarSelectores, aplicarTraduccionInterfaz } from './idiomas.js';

let idDocumentoActual = null;
let dictadoActivo = false;
let lecturaActiva = false;

let touchStartX = 0;
let touchEndX = 0;

const editor = document.getElementById('editor');
const statsBar = document.getElementById('stats-bar');
const btnMic = document.getElementById('btn-mic');
const btnLectura = document.getElementById('btn-lectura');
const comboApp = document.getElementById('app-lang');
const comboVoz = document.getElementById('voice-lang');
const btnTema = document.getElementById('btn-toggle-tema');
const btnGuardar = document.getElementById('btn-main-guardar');
const toast = document.getElementById('toast-notif');

function inicializarApp() {
    cargarSelectores(comboApp, comboVoz);
    configurarEventosBasicos();
    configurarGestoDeslizamiento();
    
    initDB().then(() => {
        actualizarContadoresEditor();
        mostrarNotificacion("Retórica Lista");
    }).catch(err => console.error("Error IndexedDB:", err));
}

function configurarEventosBasicos() {
    editor.addEventListener('input', actualizarContadoresEditor);

    const sidebar = document.getElementById('sidebar');
    const btnTogglePestaña = document.getElementById('btn-toggle-pestaña');

    if (btnTogglePestaña && sidebar) {
        btnTogglePestaña.onclick = async () => {
            const seOculta = sidebar.classList.toggle('hidden');
            btnTogglePestaña.textContent = seOculta ? "▶" : "◀";
            
            if (seOculta) {
                document.body.classList.remove('sidebar-open');
                btnTogglePestaña.style.left = "12px";
            } else {
                document.body.classList.add('sidebar-open');
                btnTogglePestaña.style.left = "292px";
                await renderizarListaDocumentos();
            }
        };
    }

    document.getElementById('btn-nuevo').onclick = () => {
        if (editor.value.trim() && confirm("¿Deseas crear una nueva nota?")) {
            editor.value = ''; idDocumentoActual = null;
            actualizarContadoresEditor();
        } else if (!editor.value.trim()) {
            idDocumentoActual = null;
        }
    };

    btnMic.onclick = () => {
        if (dictadoActivo) {
            detenerDictado(); cambiarEstadoMic(false);
        } else {
            cambiarEstadoMic(true);
            // CORRECCIÓN: El micrófono se inicializa usando el idioma unificado del texto/app
            iniciarDictado(comboApp.value, (textoFinal) => {
                if (textoFinal) { 
                    editor.value += (editor.value ? ' ' : '') + textoFinal; 
                    actualizarContadoresEditor(); 
                }
            }, () => cambiarEstadoMic(false));
        }
    };

    btnLectura.onclick = () => {
        const comenzo = leerTexto(editor.value, comboVoz.value, () => {
            lecturaActiva = false; btnLectura.textContent = "🔊";
        });
        if (comenzo) { lecturaActiva = true; btnLectura.textContent = "⏹️"; }
        else if (!lecturaActiva) { btnLectura.textContent = "🔊"; }
    };

    btnTema.onclick = () => {
        const esClaro = document.body.classList.toggle('light-theme');
        btnTema.textContent = esClaro ? "☀️" : "🌙";
    };

    btnGuardar.onclick = async () => {
        const contenido = editor.value;
        if (!contenido.trim()) return;

        if (!idDocumentoActual) idDocumentoActual = Date.now();
        const titulo = contenido.split('\n')[0].substring(0, 25).trim() || "Nota Nueva";
        const exito = await guardarDocumento(idDocumentoActual, titulo, contenido);
        
        if (exito) {
            const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = `${titulo}.html`;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            URL.revokeObjectURL(url);
            mostrarNotificacion("Guardado con éxito");
            if (!sidebar.classList.contains('hidden')) await renderizarListaDocumentos();
        }
    };

    comboApp.onchange = (e) => {
        const idiomaSeleccionado = e.target.value;
        
        const config = aplicarTraduccionInterfaz(idiomaSeleccionado, {
            lblSaveAs: document.getElementById('lbl-save-as'),
            btnNuevo: document.getElementById('btn-nuevo'),
            btnGuardar: btnGuardar,
            editor: editor
        });

        if (config && config.voiceCode) {
            comboVoz.value = config.voiceCode;
        }
    };
}

function configurarGestoDeslizamiento() {
    const sidebar = document.getElementById('sidebar');
    const btnTogglePestaña = document.getElementById('btn-toggle-pestaña');
    const capaInvisible = document.getElementById('swipe-capture-edge');

    const manejarTouchStart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
    };

    const manejarTouchEnd = (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (!sidebar.classList.contains('hidden') && (touchStartX - touchEndX > 50)) {
            sidebar.classList.add('hidden');
            document.body.classList.remove('sidebar-open');
            btnTogglePestaña.textContent = "▶";
            btnTogglePestaña.style.left = "12px";
            mostrarNotificacion("Biblioteca oculta");
        }
    };

    editor.addEventListener('touchstart', manejarTouchStart, { passive: true });
    editor.addEventListener('touchend', manejarTouchEnd, { passive: true });
    capaInvisible.addEventListener('touchstart', manejarTouchStart, { passive: true });
    capaInvisible.addEventListener('touchend', manejarTouchEnd, { passive: true });
}

function actualizarContadoresEditor() {
    const texto = editor.value;
    statsBar.textContent = `Caracteres: ${texto.length} | Palabras: ${texto.trim() === "" ? 0 : texto.trim().split(/\s+/).length} | Líneas: ${texto === "" ? 0 : texto.split('\n').length}`;
}

function cambiarEstadoMic(estaActivo) {
    dictadoActivo = estaActivo;
    btnMic.textContent = estaActivo ? "🛑" : "🎙️";
    btnMic.style.borderColor = estaActivo ? "var(--danger)" : "var(--border)";
}

async function renderizarListaDocumentos() {
    const listaContenedor = document.getElementById('document-list');
    if (!listaContenedor) return;
    listaContenedor.innerHTML = '';
    const documentos = await obtenerDocumentos();
    if (documentos.length === 0) { listaContenedor.innerHTML = '<p style="color:var(--text-muted); padding:10px; font-size:14px;">No hay notas</p>'; return; }

    documentos.forEach(doc => {
        const div = document.createElement('div');
        div.style = 'display:flex; justify-content:space-between; align-items:center; padding:8px 4px; border-bottom:1px solid var(--border); cursor:pointer;';
        
        const span = document.createElement('span'); span.textContent = doc.titulo; span.style = 'flex:1; font-size:14px;';
        span.onclick = () => {
            editor.value = doc.contenido; idDocumentoActual = doc.id; actualizarContadoresEditor();
            document.getElementById('sidebar').classList.add('hidden');
            document.body.classList.remove('sidebar-open');
            btnTogglePestaña.textContent = "▶";
            btnTogglePestaña.style.left = "12px";
        };

        const btn = document.createElement('button'); btn.textContent = "🗑️"; btn.style = 'background:none; border:none; cursor:pointer; padding:4px;';
        btn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar "${doc.titulo}"?`)) {
                await eliminarDocumento(doc.id);
                if (idDocumentoActual === doc.id) { editor.value = ''; idDocumentoActual = null; actualizarContadoresEditor(); }
                renderizarListaDocumentos();
            }
        };
        div.appendChild(span); div.appendChild(btn); listaContenedor.appendChild(div);
    });
}

function mostrarNotificacion(mensaje) {
    if (!toast) return;
    toast.textContent = mensaje; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

window.addEventListener('DOMContentLoaded', inicializarApp);
