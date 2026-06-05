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
    // Configurar menús de lenguajes e interfaz
    cargarSelectores(comboApp, comboVoz);
    
    // Conectar base de datos persistente y cargar biblioteca de notas
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
    // Evento de escucha para contadores de texto en tiempo real
    editor.addEventListener('input', actualizarContadoresEditor);

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
        } else if (lecturaActiva === false) {
            btnLectura.textContent = "🔊";
        }
    };

    // Botón Alternar Tema Visual (Luz / Oscuridad)
    btnTema.onclick = () => {
        const esClaro = document.body.classList.toggle('light-theme');
        btnTema.textContent = esClaro ? "☀️" : "🌙";
    };

    // Botón Guardar Directo (HTML y Persistencia)
    btnGuardar.onclick = async () => {
        const contenido = editor.value;
        if (!contenido.trim()) {
            mostrarNotificacion("El editor está vacío");
            return;
        }

        if (!idDocumentoActual) idDocumentoActual = Date.now();
        const lineas = contenido.split('\n');
        const titulo = lineas[0].substring(0, 25) || "Nota Nueva";

        const exito = await guardarDocumento(idDocumentoActual, titulo, contenido);
        if (exito) {
            mostrarNotificacion("Nota guardada con éxito");
            // Aquí puedes enlazar la descarga física si se requiere
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

function mostrarNotificacion(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// Ejecutar al cargar el documento por completo
window.addEventListener('DOMContentLoaded', inicializarApp);
