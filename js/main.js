/**
 * Retórica V2026 - Conmutador Central y Controlador de Ciclo de Vida Blindado
 */
import { AuthManager } from './auth.js';
import { initDB, guardarDocumento, obtenerDocumentosPorUsuario, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, operarLecturaTexto, conmutarGrabacionMensajeVoz, renderizarTextoAAudioArchivoFisico, BIBLIOTECA_VOZ_INTERNA } from './audio.js';
import { cargarSelectores, aplicarTraduccionInterfaz, DICCIONARIO_30_IDIOMAS } from './idiomas.js';

// Registro de Instancias en Capa Global Inmutable contra borrados accidentales
window.RetoricaModules = Object.freeze({
    auth: new AuthManager(),
    storage: { initDB, guardarDocumento, obtenerDocumentosPorUsuario, eliminarDocumento },
    audio: { iniciarDictado, detenerDictado, operarLecturaTexto, conmutarGrabacionMensajeVoz, renderizarTextoAAudioArchivoFisico }
});

// Estado atómico de ejecución
let idDocumentoActual = null;
let dictadoActivo = false;
let lecturaActiva = false;
let diferidoPromptPWA = null;

// Captura de Nodos Críticos bajo firma de anclaje (Blindaje estructural)
const editorTextArea = document.getElementById('editor-core-textarea');
const editorTitleInput = document.getElementById('editor-document-title');
const txtContadorCaracteres = document.getElementById('txt-contador-caracteres');
const txtContadorPalabras = document.getElementById('txt-contador-palabras');
const txtContadorLineas = document.getElementById('txt-contador-lineas');
const btnMic = document.getElementById('btn-operar-dictado');
const btnLectura = document.getElementById('btn-operar-lectura');
const btnGrabacionVoz = document.getElementById('btn-operar-grabacion-voz');
const btnRenderAudio = document.getElementById('btn-operar-render-audio');
const comboApp = document.getElementById('selector-idioma-app');
const comboVoz = document.getElementById('selector-idioma-voz');
const btnGuardarNativo = document.getElementById('btn-confirmar-guardado-nativo');
const btnNuevoDoc = document.getElementById('btn-nuevo-documento-limpio');
const contenedorLista = document.getElementById('contenedor-lista-documentos');
const btnPwaInstalar = document.getElementById('btn-pwa-instalar-nativo');

async function inicializarEcosistema() {
    // Rastro e Inspección de Blindaje: Verificar que los elementos vitales existen
    const anclajesVitales = ['editor-core-textarea', 'editor-document-title', 'btn-confirmar-guardado-nativo'];
    anclajesVitales.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`🚨 ALERTA ESTRUCTURAL CRÍTICA: El elemento vital [${id}] fue omitido en el HTML.`);
        }
    });

    cargarSelectores(comboApp, comboVoz);
    
    // Forzar lectura de caché e idiomas preferidos desde localStorage
    comboApp.value = localStorage.getItem('ret_pref_lang_app') || 'es';
    comboVoz.value = localStorage.getItem('ret_pref_lang_voz') || 'es-MX';

    try {
        await initDB();
        await ejecutarDeteccionSilenciosaDispositivo();
        verificarFirmaUsuarioYSesion();
        configurarEventosOperacionales();
        procesarContadoresInternos();
    } catch (err) {
        console.error("Fallo crítico en el encendido de base de datos indexada: ", err);
    }
}

// NUEVO: Motor de detección en caliente de credenciales del ecosistema del teléfono
async function ejecutarDeteccionSilenciosaDispositivo() {
    const sesionLocal = localStorage.getItem("retorica_user_session");
    
    // Si ya existe registro previo en almacenamiento local rápido, forzar logueo en auth.js
    if (sesionLocal) {
        try {
            const datos = JSON.parse(sesionLocal);
            if (datos && datos.email) {
                window.RetoricaModules.auth.autenticarOServirUsuario(datos.email);
                return;
            }
        } catch(e) { console.error("Error al leer sesión previa", e); }
    }

    // Si está limpio, intentar pescar la sesión nativa de la cuenta activa vinculada al smartphone
    if (navigator.credentials && navigator.credentials.get) {
        try {
            const credencial = await navigator.credentials.get({ password: true, mediation: "silent" });
            if (credencial && credencial.id) {
                console.log("Cuenta detectada de forma nativa en el dispositivo:", credencial.id);
                localStorage.setItem("retorica_user_session", JSON.stringify({ email: credencial.id, provider: "device-auto" }));
                window.RetoricaModules.auth.autenticarOServirUsuario(credencial.id);
            }
        } catch (err) {
            console.log("Comprobación silenciosa omitida o no soportada en este navegador.");
        }
    }
}

function verificarFirmaUsuarioYSesion() {
    const usuarioActivo = window.RetoricaModules.auth.getUsuarioActivo();
    const overlayAuth = document.getElementById('modulo-auth-screen');
    
    if (!usuarioActivo) {
        if (overlayAuth) {
            overlayAuth.classList.remove('hidden');
            overlayAuth.style.display = 'flex';
        }
    } else {
        if (overlayAuth) {
            overlayAuth.classList.add('hidden');
            overlayAuth.style.setProperty("display", "none", "important");
        }
        // Limpiamos el formato para mostrar un nombre estético en la biblioteca
        const nombreLimpio = usuarioActivo.includes('@') ? usuarioActivo.split('@')[0] : usuarioActivo;
        document.getElementById('display-user-activo').textContent = `👤 ${nombreLimpio.toUpperCase()}`;
        refrescarBibliotecaVisual();
    }
}

function configurarEventosOperacionales() {
    // Escucha de entrada para contadores e invalidación automática de caché
    editorTextArea.addEventListener('input', () => {
        procesarContadoresInternos();
        salvaguardarCacheTemporalInmediato();
    });
    editorTitleInput.addEventListener('input', salvaguardarCacheTemporalInmediato);

    // MODIFICADO: Interceptor del formulario de acceso propio (Correo y Contraseña creados por Retórica)
    const formularioAuth = document.getElementById('retorica-form-autenticacion');
    if (formularioAuth) {
        formularioAuth.onsubmit = (event) => {
            event.preventDefault();
            const txtEmail = document.getElementById('auth-username-field').value;
            const txtPass = document.getElementById('auth-password-field').value;

            if (txtEmail.trim() && txtPass.trim()) {
                localStorage.setItem("retorica_user_session", JSON.stringify({ email: txtEmail, provider: "retorica_secure" }));
                window.RetoricaModules.auth.autenticarOServirUsuario(txtEmail);
                verificarFirmaUsuarioYSesion();
                mostrarNotificacionToast("Cuenta Vinculada Exitosamente");
            }
        };
    } else {
        // Fallback de seguridad en caso de que no se use la etiqueta <form>
        const btnAuthConfirmar = document.getElementById('btn-auth-confirmar');
        if (btnAuthConfirmar) {
            btnAuthConfirmar.onclick = () => {
                const txtEmail = document.getElementById('auth-username-field').value;
                if (txtEmail.trim()) {
                    localStorage.setItem("retorica_user_session", JSON.stringify({ email: txtEmail, provider: "retorica_secure" }));
                    window.RetoricaModules.auth.autenticarOServirUsuario(txtEmail);
                    verificarFirmaUsuarioYSesion();
                    mostrarNotificacionToast("Sesión Iniciada de Forma Segura");
                }
            };
        }
    }

    // EXPOSITOR GLOBAL: Inyección de funciones para los clics de Google, Face y WhatsApp desde el HTML
    window.procesarAccesoTerceros = function(proveedorPlataforma) {
        console.log(`Iniciando pasarela de autenticación federada: ${proveedorPlataforma}`);
        const emailSimulado = `usuario.${proveedorPlataforma.toLowerCase()}@retorica.app`;
        
        localStorage.setItem("retorica_user_session", JSON.stringify({ email: emailSimulado, provider: proveedorPlataforma }));
        window.RetoricaModules.auth.autenticarOServirUsuario(emailSimulado);
        verificarFirmaUsuarioYSesion();
        mostrarNotificacionToast(`Conectado vía ${proveedorPlataforma}`);
    };

    // Cerrar Sesión (Limpia memorias locales de inmediato)
    document.getElementById('btn-cerrar-sesion-activo').onclick = () => {
        localStorage.removeItem("retorica_user_session");
        window.RetoricaModules.auth.cerrarSesion();
        idDocumentoActual = null;
        editorTitleInput.value = '';
        editorTextArea.value = '';
        verificarFirmaUsuarioYSesion();
    };

    // Manejo de Menú Desplegable Lateral (Pestaña Flotante)
    document.getElementById('btn-toggle-pestaña').onclick = function() {
        const sidebar = document.getElementById('sidebar-container');
        const activo = sidebar.classList.toggle('hidden');
        this.textContent = activo ? "▶" : "◀";
    };

    // Botón Inamovible de Guardado Silencioso (✓)
    btnGuardarNativo.onclick = async () => {
        const contenido = editorTextArea.value;
        const titulo = editorTitleInput.value;
        const usuario = window.RetoricaModules.auth.getUsuarioActivo();

        if (!contenido.trim() && !titulo.trim()) {
            mostrarNotificacionToast("Editor Vacío");
            return;
        }

        if (!idDocumentoActual) idDocumentoActual = Date.now();
        
        const exito = await guardarDocumento(idDocumentoActual, titulo || "Nota Sin Título", contenido, usuario);
        if (exito) {
            mostrarNotificacionToast("✓ Guardado en Memoria Interna");
            refrescarBibliotecaVisual();
            
            const todosLosDocs = await obtenerDocumentosPorUsuario(usuario);
            window.RetoricaModules.auth.sincronizarNotasNubeEsquemaRestringido(todosLosDocs);
        }
    };

    // Botón Limpiar para Creación de Nueva Nota
    btnNuevoDoc.onclick = () => {
        idDocumentoActual = null;
        editorTitleInput.value = '';
        editorTextArea.value = '';
        procesarContadoresInternos();
        mostrarNotificacionToast("Lienzo Limpio Iniciado");
    };

    // Operador de Dictado por Voz (Microfóno Integrado)
    btnMic.onclick = () => {
        if (dictadoActivo) {
            detenerDictado();
            conmutarEstadoEstiloMic(false);
        } else {
            conmutarEstadoEstiloMic(true);
            iniciarDictado(comboVoz.value, (textoFragmento) => {
                if (textoFragmento) {
                    editorTextArea.value += (editorTextArea.value ? ' ' : '') + textoFragmento;
                    procesarContadoresInternos();
                    salvaguardarCacheTemporalInmediato();
                }
            }, () => conmutarEstadoEstiloMic(false));
        }
    };

    // Operador de Lectura de Texto (Speech Synthesis)
    btnLectura.onclick = () => {
        const ejecutando = operarLecturaTexto(editorTextArea.value, comboVoz.value.split('-')[0], 
            () => { btnLectura.classList.add('active-mode'); },
            () => { btnLectura.classList.remove('active-mode'); }
        );
        if (!ejecutando) btnLectura.classList.remove('active-mode');
    };

    // Captura de Notas de Voz Física (Tipo Mensaje)
    btnGrabacionVoz.onclick = async () => {
        if (!idDocumentoActual) idDocumentoActual = Date.now();
        
        await conmutarGrabacionMensajeVoz(idDocumentoActual,
            () => { btnGrabacionVoz.classList.add('active-mode'); mostrarNotificacionToast("Grabando Audio..."); },
            (urlGenerada) => { 
                btnGrabacionVoz.classList.remove('active-mode'); 
                mostrarNotificacionToast("Audio Resguardado Internamente");
                console.log(`Firma de Audio enlazada al guion: ${urlGenerada}`);
            }
        );
    };

    // Compilar e Iniciar Simulación de Renderizado de Audio
    btnRenderAudio.onclick = () => {
        if (!idDocumentoActual) idDocumentoActual = Date.now();
        const urlFile = renderizarTextoAAudioArchivoFisico(editorTextArea.value, comboVoz.value, idDocumentoActual);
        if (urlFile) {
            mostrarNotificacionToast("Audio Compilado en Buffer Virtual");
        } else {
            mostrarNotificacionToast("Contenido Insuficiente");
        }
    };

    // Cambios Dinámicos de Idioma e Internacionalización
    comboApp.onchange = (e) => {
        localStorage.setItem('ret_pref_lang_app', e.target.value);
        aplicarTraduccionInterfaz(e.target.value, { btnGuardar: btnGuardarNativo, btnNuevo: btnNuevoDoc });
    };
    comboVoz.onchange = (e) => {
        localStorage.setItem('ret_pref_lang_voz', e.target.value);
    };

    // Alternar Tema Estético Luz / Obscuridad
    document.getElementById('btn-conmutar-tema-visual').onclick = () => {
        const claro = document.body.classList.toggle('light-theme');
        localStorage.setItem('ret_theme_claro', claro ? 'si' : 'no');
    };
    if (localStorage.getItem('ret_theme_claro') === 'si') document.body.classList.add('light-theme');

    // Apertura de Archivos del Dispositivo
    const cargadorArchivosEntrada = document.getElementById('fallback-file-loader');
    document.getElementById('btn-abrir-archivo-local').onclick = () => cargadorArchivosEntrada.click();
    
    cargadorArchivosEntrada.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const lectorInstancia = new FileReader();
        lectorInstancia.onload = (evt) => {
            const extraido = evt.target.result;
            
            if (extraido.includes('<body')) {
                const innerMarrow = extraido.split(/<body[^>]*>/i)[1].split(/<\/body>/i)[0];
                editorTextArea.value = innerMarrow.replace(/<[^>]*>/g, '').trim();
            } else {
                editorTextArea.value = extraido;
            }
            
            editorTitleInput.value = file.name.split('.')[0].toUpperCase();
            idDocumentoActual = Date.now();
            procesarContadoresInternos();
            salvaguardarCacheTemporalInmediato();
            mostrarNotificacionToast("Documento Cargado con Éxito");
        };
        lectorInstancia.readAsText(file);
    };

    // --- MANEJADORES DE EXPORTACIÓN DIRECTA ---
    
    // PDF Fijo
    document.getElementById('btn-exportar-pdf-fijo').onclick = () => {
        const element = document.getElementById('bloque-editor-retorica');
        const opt = { margin: 10, filename: `${editorTitleInput.value || 'Guion'}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' } };
        html2pdf().set(opt).from(element).save();
    };

    // PDF Editable
    document.getElementById('btn-exportar-pdf-editable').onclick = () => {
        const plantillaHTML = `
            <div style="padding:20px; font-family:sans-serif;">
                <h2>${editorTitleInput.value || 'Documento Retórica'}</h2>
                <hr/><br/>
                <textarea style="width:100%; height:400px; border:1px solid #ccc; padding:10px;">${editorTextArea.value}</textarea>
            </div>
        `;
        html2pdf().from(plantillaHTML).save(`${editorTitleInput.value || 'Formulario_Editable'}.pdf`);
    };

    // DOC de Microsoft Word
    document.getElementById('btn-exportar-word-doc').onclick = () => {
        const esqueletoDoc = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><title>Retorica Document Export</title><style>body {font-family: Arial; font-size:12pt;}</style></head>
            <body><h2>${editorTitleInput.value || 'Sin Título'}</h2><p>${editorTextArea.value.replace(/\n/g, '<br/>')}</p></body>
            </html>
        `;
        const blob = new Blob(['\ufeff' + esqueletoDoc], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const anclaDescargaVirtual = document.createElement('a');
        anclaDescargaVirtual.href = url;
        anclaDescargaVirtual.download = `${editorTitleInput.value || 'Nota'}.doc`;
        document.body.appendChild(anclaDescargaVirtual);
        anclaDescargaVirtual.click();
        document.body.removeChild(anclaDescargaVirtual);
    };
}

async function refrescarBibliotecaVisual() {
    const user = window.RetoricaModules.auth.getUsuarioActivo();
    if (!user) return;

    const lista = await obtenerDocumentosPorUsuario(user);
    contenedorLista.innerHTML = '';

    if (lista.length === 0) {
        contenedorLista.innerHTML = `<div style="color:var(--text-muted); font-size:0.75rem; text-align:center; padding:20px;">No hay documentos registrados</div>`;
        return;
    }

    lista.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'document-list-item';
        item.innerHTML = `
            <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.8rem; font-weight:bold;">
                📄 ${doc.titulo}
            </div>
            <button class="btn-3d-round" id="btn-eliminar-nota-${doc.id}" style="width:28px; height:28px; font-size:0.8rem; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🗑️</button>
        `;
        
        item.onclick = (e) => {
            if (e.target.id === `btn-eliminar-nota-${doc.id}`) return;
            
            idDocumentoActual = doc.id;
            editorTitleInput.value = doc.titulo;
            editorTextArea.value = doc.contenido;
            procesarContadoresInternos();
            document.getElementById('sidebar-container').classList.add('hidden');
            document.getElementById('btn-toggle-pestaña').textContent = "▶";
            mostrarNotificacionToast("Documento Abierto");
        };

        contenedorLista.appendChild(item);

        document.getElementById(`btn-eliminar-nota-${doc.id}`).onclick = async (e) => {
            e.stopPropagation();
            if (confirm("¿Deseas eliminar permanentemente esta nota de tu almacenamiento?")) {
                await eliminarDocumento(doc.id);
                if (idDocumentoActual === doc.id) {
                    idDocumentoActual = null;
                    editorTitleInput.value = '';
                    editorTextArea.value = '';
                    procesarContadoresInternos();
                }
                refrescarBibliotecaVisual();
                mostrarNotificacionToast("Nota Eliminada");
            }
        };
    });
}

function procesarContadoresInternos() {
    const rawTexto = editorTextArea.value;
    const caracteres = rawTexto.length;
    const palabras = rawTexto.trim() === "" ? 0 : rawTexto.trim().split(/\s+/).length;
    const lineas = rawTexto === "" ? 0 : rawTexto.split('\n').length;

    txtContadorCaracteres.textContent = `Caracteres: ${caracteres}`;
    txtContadorPalabras.textContent = `Palabras: ${palabras}`;
    txtContadorLineas.textContent = `Líneas: ${lineas}`;
}

function conmutarEstadoEstiloMic(activo) {
    dictadoActivo = activo;
    if (activo) {
        btnMic.classList.add('active-mode');
    } else {
        btnMic.classList.remove('active-mode');
    }
}

function salvaguardarCacheTemporalInmediato() {
    localStorage.setItem('ret_cache_fast_title', editorTitleInput.value);
    localStorage.setItem('ret_cache_fast_body', editorTextArea.value);
    if (idDocumentoActual) localStorage.setItem('ret_cache_fast_id', idDocumentoActual);
}

function restaurarCacheTemporal() {
    const t = localStorage.getItem('ret_cache_fast_title');
    const b = localStorage.getItem('ret_cache_fast_body');
    const i = localStorage.getItem('ret_cache_fast_id');

    if (t || b) {
        editorTitleInput.value = t || '';
        editorTextArea.value = b || '';
        if (i) idDocumentoActual = Number(i);
        procesarContadoresInternos();
    }
}

function mostrarNotificacionToast(msg) {
    const box = document.getElementById('toast-notificador-global');
    if (box) {
        box.textContent = msg;
        box.classList.add('show');
        setTimeout(() => box.classList.remove('show'), 2500);
    }
}

// Inicialización de la captura del evento de instalación nativa PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    diferidoPromptPWA = e;
    btnPwaInstalar.style.display = 'block';
});

btnPwaInstalar.onclick = () => {
    if (!diferidoPromptPWA) return;
    btnPwaInstalar.style.display = 'none';
    diferidoPromptPWA.prompt();
    diferidoPromptPWA.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('El usuario instaló Retórica de forma nativa.');
        }
        diferidoPromptPWA = null;
    });
};

window.addEventListener('DOMContentLoaded', () => {
    inicializarEcosistema();
    restaurarCacheTemporal();
});
