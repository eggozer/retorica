// --- CONMUTADOR CENTRAL Y CONTROLADOR DE INTERFAZ (MAIN) ---

import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, toggleGrabacionMensajeVoz, renderizarTextoAAudioArchivo } from './audio.js';
import { cargarSelectores, aplicarTraduccionInterfaz } from './idiomas.js';

// Estado global de la aplicación
let idDocumentoActual = null;
let dictadoActivo = false;
let lecturaActiva = false;

// Elementos de la Interfaz de Usuario (DOM)
const editor = document.getElementById('editor');
const statsBar = document.getElementById('stats-bar');
const btnMic = document.getElementById('btn-mic');
const btnLectura = document.getElementById('btn-lectura');
const comboApp = document.getElementById('app-lang');
const comboVoz = document.getElementById('voice-lang');
const btnTema = document.getElementById('btn-toggle-tema');
const btnGuardar = document.getElementById('btn-main-guardar');
const toast = document.getElementById('toast-notif');

// 1. INICIALIZACIÓN DE COMPONENTES
async function inicializarApp() {
    cargarSelectores(comboApp, comboVoz);
    
    try {
        await initDB();
        configurarEventosBasicos();
        actualizarContadoresEditor();
        mostrarNotificacion("Retórica Modular Inicializada");
    } catch (err) {
        console.error("Error al levantar la persistencia IndexedDB:", err);
    }
}

// 2. CONTROLADORES DE EVENTOS (ACCIONES DE BOTONES)
function configurarEventosBasicos() {
    editor.addEventListener('input', actualizarContadoresEditor);

    // Botón para Limpiar el Editor y Crear un Documento Nuevo
    document.getElementById('btn-nuevo').onclick = () => {
        if (editor.value.trim() && confirm("¿Deseas crear una nueva nota? Asegúrate de haber guardado tus cambios actuales.")) {
            editor.value = '';
            idDocumentoActual = null;
            actualizarContadoresEditor();
            mostrarNotificacion("Nuevo documento listo");
        } else if (!editor.value.trim()) {
            idDocumentoActual = null;
            mostrarNotificacion("Editor listo");
        }
    };

    // Botón Dictado por Voz (Microfóno)
    btnMic.onclick = () => {
        if (dictadoActivo) {
            detenerDictado();
            cambiarEstadoMic(false);
        } else {
            cambiarEstadoMic(true);
            iniciarDictado(comboVoz.value, 
                (textoFinal, textoIntermedio) => {
                    if (textoFinal) {
                        editor.value += (editor.value ? ' ' : '') + textoFinal;
                        actualizarContadoresEditor();
                    }
                }, 
                () => cambiarEstadoMic(false)
            );
        }
    };

    // Botón Lectura en Voz Alta
    btnLectura.onclick = () => {
        const comenzoLectura = leerTexto(editor.value, comboVoz.value.split('-')[0], () => {
            lecturaActiva = false;
            btnLectura.textContent = "🔊";
        });

        if (comenzoLectura) {
            lecturaActiva = true;
            btnLectura.textContent = "⏹️";
        } else if (!lecturaActiva) {
            btnLectura.textContent = "🔊";
        }
    };

    // Botón Alternar Tema Visual (Luz / Oscuridad)
    btnTema.onclick = () => {
        const esClaro = document.body.classList.toggle('light-theme');
        btnTema.textContent = esClaro ? "☀️" : "🌙";
    };

    // Botón Guardar Directo (IndexedDB + Descarga Física HTML)
    btnGuardar.onclick = async () => {
        const contenido = editor.value;
        if (!contenido.trim()) {
            mostrarNotificacion("El editor está vacío");
            return;
        }

        if (!idDocumentoActual) idDocumentoActual = Date.now();
        const lineas = contenido.split('\n');
        const titulo = lineas[0].substring(0, 25).trim() || "Nota Nueva";

        const exito = await guardarDocumento(idDocumentoActual, titulo, contenido);
        
        if (exito) {
            const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${titulo}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            mostrarNotificacion("Nota guardada y descargada");
        }
    };

    // Manejo de cambio de idioma en la App
    comboApp.onchange = (e) => {
        aplicarTraduccionInterfaz(e.target.value, {
            lblSaveAs: document.getElementById('lbl-save-as'),
            btnNuevo: document.getElementById('btn-nuevo')
        });
    };
}

// 3. AUXILIARES VINCULADOS
function actualizarContadoresEditor() {
    const texto = editor.value;
    const caracteres = texto.length;
    const palabras = texto.trim() === "" ? 0 : texto.trim().split(/\s+/).length;
    const lineas = texto === "" ? 0 : texto.split('\n').length;
    
    statsBar.textContent = `Caracteres: ${caracteres} | Palabras: ${palabras} | Líneas: ${lineas}`;
}

function cambiarEstadoMic(estaActivo) {
    dictadoActivo = estaActivo;
    btnMic.textContent = estaActivo ? "🛑" : "🎙️";
    btnMic.style.borderColor = estaActivo ? "var(--danger)" : "var(--border)";
}

// Asegurar renderizado visual de alertas
function mostrarNotificacion(mensaje) {
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

window.addEventListener('DOMContentLoaded', inicializarApp);
