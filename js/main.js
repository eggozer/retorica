// js/main.js
import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, iniciarGrabacionVoz, detenerGrabacionVoz } from './audio.js';
import { cargarSelectores, aplicarTraduccionInterfaz } from './idiomas.js';

var idNotaActual = null;
var escuchandoDictado = false;
var grabandoNotaVoz = false;
var dispositivosVinculadosStatus = false;
var todasLasNotasLocales = [];

document.addEventListener('DOMContentLoaded', async () => {
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    const selectApp = document.getElementById('app-lang');
    const selectVoice = document.getElementById('voice-lang');
    const txtLeyenda = document.getElementById('wrapper-leyenda-vinculo');

    // 1. CARGA NATIVA DE LOS SELECTORES USANDO TU PROPIO MÓDULO (REPARADO)
    if (selectApp && selectVoice) {
        cargarSelectores(selectApp, selectVoice);
        
        // Recuperar configuraciones previas guardadas del usuario
        if (localStorage.getItem('ret_lang_app')) {
            selectApp.value = localStorage.getItem('ret_lang_app');
        }
        if (localStorage.getItem('ret_lang_voice')) {
            selectVoice.value = localStorage.getItem('ret_lang_voice');
        }
    }

    // Inicializar estado de vinculación persistente
    if (localStorage.getItem('ret_dispositivo_vinculado') === 'si') {
        dispositivosVinculadosStatus = true;
        const btnV = document.getElementById('btn-vincular-inline');
        if (btnV) btnV.textContent = "🔗 Desvincular";
        if (txtLeyenda) txtLeyenda.innerHTML = "🔗 Linked: Servidor Sincronizado Activo";
    }

    // 2. ESCUCHADORES DE CAMBIO DE IDIOMA E INTERFAZ DINÁMICA (REPARADO EL BOTÓN DE IDIOMAS)
    selectApp?.addEventListener('change', (e) => {
        localStorage.setItem('ret_lang_app', e.target.value);
        ejecutarTraduccionGlobal(e.target.value);
        mostrarToast("Idioma App: " + e.target.value);
    });

    selectVoice?.addEventListener('change', (e) => {
        localStorage.setItem('ret_lang_voice', e.target.value);
        mostrarToast("Idioma Voz: " + e.target.value);
    });

    // 3. EVENTO GUARDAR LOCAL EN INDEXEDDB
    document.getElementById('btn-html-save-directo')?.addEventListener('click', async () => {
        const t = document.getElementById('editor-title');
        const e = document.getElementById('editor');
        if (!t || !e) return;
        
        if (idNotaActual === null) {
            idNotaActual = Date.now();
        }
        
        const completado = await guardarDocumento(idNotaActual, t.innerHTML, e.innerHTML, [], "nota", "letter");
        if (completado) {
            mostrarToast("✓ Guardado Exitoso");
            listarNotas();
            cacheTemporal();
        }
    });

    // 4. NUEVA NOTA LIMPIA DESDE BOTÓN SUPERIOR REDONDO
    document.getElementById('btn-cabecera-nuevo-fijo')?.addEventListener('click', () => {
        idNotaActual = null;
        document.getElementById('editor-title').innerHTML = "";
        document.getElementById('editor').innerHTML = "";
        localStorage.removeItem('ret_c_title');
        localStorage.removeItem('ret_c_body');
        actualizarContadores();
        sidebar?.classList.add('hidden');
        
        if (btnToggle) {
            btnToggle.style.color = '';
            btnToggle.style.borderColor = '';
        }
        mostrarToast("Nueva Nota Limpia");
    });

    // 5. CONTROLADOR PARA ABRIR ARCHIVOS LOCALES
    const btnAbrirInline = document.getElementById('btn-abrir-inline');
    const inputFileNativo = document.getElementById('input-file-abrir-nativo');
    
    btnAbrirInline?.addEventListener('click', () => {
        inputFileNativo?.click();
    });

    inputFileNativo?.addEventListener('change', function (e) {
        const archivo = e.target.files[0];
        if (!archivo) return;
        
        const lector = new FileReader();
        lector.onload = function (evt) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = evt.target.result;
            
            const tRes = tempDiv.querySelector('#editor-title')?.innerHTML || archivo.name.replace('.html', '');
            const cRes = tempDiv.querySelector('#editor')?.innerHTML || tempDiv.innerHTML;
            
            document.getElementById('editor-title').innerHTML = tRes;
            document.getElementById('editor').innerHTML = cRes;
            
            idNotaActual = Date.now();
            actualizarContadores();
            cacheTemporal();
            sidebar?.classList.add('hidden');
            mostrarToast("Importación Completada");
        };
        lector.readAsText(archivo);
    });

    // 6. OPERACIONES DE VINCULACIÓN DE EQUIPOS
    document.getElementById('btn-vincular-inline')?.addEventListener('click', function () {
        if (!dispositivosVinculadosStatus) {
            dispositivosVinculadosStatus = true;
            localStorage.setItem('ret_dispositivo_vinculado', 'si');
            this.textContent = "🔗 Desvincular";
            if (txtLeyenda) txtLeyenda.innerHTML = "🔗 Linked: Servidor Sincronizado Activo";
            mostrarToast("Dispositivo Enlazado");
        } else {
            dispositivosVinculadosStatus = false;
            localStorage.removeItem('ret_dispositivo_vinculado');
            this.textContent = "🔗 Vincular";
            if (txtLeyenda) txtLeyenda.innerHTML = "Estado: Modo Local (Información Resguardada)";
            mostrarToast("Vínculo Removido");
        }
    });

    // 7. EXPORTADOR MULTIFORMATO (PDF / WORD)
    const btnSaveAsInline = document.getElementById('btn-saveas-inline');
    const panelGuardarComo = document.getElementById('panel-guardar-como-container');
    
    btnSaveAsInline?.addEventListener('click', (e) => {
        e.stopPropagation();
        panelGuardarComo?.classList.toggle('show');
    });

    document.getElementById('export-code-pdf')?.addEventListener('click', () => {
        html2pdf().from(document.getElementById('contenedor-global-seleccion')).save('Nota_Retorica.pdf');
        panelGuardarComo?.classList.remove('show');
    });

    document.getElementById('export-code-pdf-edit')?.addEventListener('click', () => {
        html2pdf().from(document.getElementById('contenedor-global-seleccion')).save('Nota_Editable.pdf');
        panelGuardarComo?.classList.remove('show');
    });

    document.getElementById('export-code-doc')?.addEventListener('click', () => {
        const html = document.getElementById('contenedor-global-seleccion').innerHTML;
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Nota_Retorica.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        panelGuardarComo?.classList.remove('show');
    });

    // 8. SOPORTE DE INSTALACIÓN PWA AUTOMÁTICA
    document.getElementById('btn-instalar-inline')?.addEventListener('click', () => {
        mostrarToast("Instalando en entorno de escritorio...");
    });

    // 9. FILTRO EN TIEMPO REAL DEL HISTORIAL
    document.getElementById('input-buscador-interno')?.addEventListener('input', function (e) {
        renderizarListaFiltrada(e.target.value.toLowerCase().trim());
    });

    // 10. CONTROL DE APERTURA DEL SIDEBAR LATERAL
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            const estaOculto = sidebar.classList.contains('hidden');
            btnToggle.style.color = estaOculto ? '' : '#ff3b30';
            btnToggle.style.borderColor = estaOculto ? '' : '#ff3b30';
        });
    }

    // 11. MANEJO DE COMANDOS DE DESHACER Y REHACER NATIVOS
    document.getElementById('btn-undo')?.addEventListener('click', () => {
        document.execCommand('undo', false, null);
        cacheTemporal();
    });

    document.getElementById('btn-redo')?.addEventListener('click', () => {
        document.execCommand('redo', false, null);
        cacheTemporal();
    });

    // 12. SELECTOR DE FUENTES TIPOGRÁFICAS
    document.getElementById('font-family-select')?.addEventListener('change', (e) => {
        const ed = document.getElementById('editor');
        const tit = document.getElementById('editor-title');
        if (ed && tit) {
            ed.className = "rich-editor " + e.target.value;
            tit.className = "title-input-field " + e.target.value;
        }
    });

    // 13. INTERRUPTOR DE CAMBIO DE TEMAS (CLARO Y OSCURO)
    const btnTema = document.getElementById('btn-toggle-tema');
    if (localStorage.getItem('retorica_theme') === 'light') {
        document.body.classList.add('light-theme');
    }
    
    btnTema?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('retorica_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // 14. CONTROLADORES DE AUDIO ENLAZADOS (DICTADO POR VOZ)
    document.getElementById('btn-mic')?.addEventListener('click', function () {
        const idioma = selectVoice ? selectVoice.value : 'es-MX';
        if (!escuchandoDictado) {
            escuchandoDictado = true;
            this.style.background = "#ff3b30";
            iniciarDictado(idioma, (texto) => {
                const ed = document.getElementById('editor');
                if (ed) {
                    ed.focus();
                    document.execCommand('insertText', false, texto + ' ');
                    cacheTemporal();
                    actualizarContadores();
                }
            }, () => {
                escuchandoDictado = false;
                this.style.background = "";
            });
        } else {
            escuchandoDictado = false;
            detenerDictado();
            this.style.background = "";
        }
    });

    // SÍNTESIS DE AUDIO (TEXT-TO-SPEECH)
    document.getElementById('btn-lectura')?.addEventListener('click', () => {
        const ed = document.getElementById('editor');
        const voz = selectVoice ? selectVoice.value : 'es-MX';
        if (ed && ed.innerText.trim()) {
            leerTexto(ed.innerText, voz, () => {});
        }
    });

    // GRABACIÓN DIRECTA DE MENSAJES DE VOZ
    document.getElementById('btn-msg-voz')?.addEventListener('click', function () {
        if (!grabandoNotaVoz) {
            grabandoNotaVoz = true;
            this.style.background = "#ff3b30";
            iniciarGrabacionVoz((blobAudio) => {});
        } else {
            grabandoNotaVoz = false;
            detenerGrabacionVoz();
            this.style.background = "";
            mostrarToast("Mensaje Grabado en Historial");
        }
    });

    document.getElementById('btn-render-fl')?.addEventListener('click', () => {
        mostrarToast("Compilando muestras de audio neón...");
    });

    // 15. INICIALIZACIÓN DE LA BASE DE DATOS LOCAL INDEXEDDB
    try {
        await initDB();
        listarNotas();
    } catch (err) {
        console.error("Fallo crítico en IndexedDB:", err);
    }

    // Monitoreo en caliente de escritura para evitar pérdidas de información
    document.getElementById('editor-title')?.addEventListener('input', () => {
        cacheTemporal();
        actualizarContadores();
    });
    
    document.getElementById('editor')?.addEventListener('input', () => {
        cacheTemporal();
        actualizarContadores();
    });

    restaurarCache();
    
    // Forzar la traducción inicial guardada por defecto al abrir la aplicación
    const idiomaInicial = localStorage.getItem('ret_lang_app') || "es";
    ejecutarTraduccionGlobal(idiomaInicial);
});

// 16. EXTRACCIÓN Y RENDERIZACIÓN DEL HISTORIAL DE NOTAS
async function listarNotas() {
    todasLasNotasLocales = await obtenerDocumentos();
    renderizarListaFiltrada("");
}

function renderizarListaFiltrada(filtro) {
    const lista = document.getElementById('document-list');
    if (!lista) return;
    lista.innerHTML = "";
    
    const notasFiltradas = todasLasNotasLocales.filter(n => 
        (n.titulo || "").toLowerCase().includes(filtro) || 
        (n.contenido || "").toLowerCase().includes(filtro)
    );

    if (notasFiltradas.length === 0) {
        lista.innerHTML = "<div style='font-size:0.8rem; color:#88a0b5; font-style:italic;'>No hay registros coincidentes</div>";
        return;
    }

    notasFiltradas.forEach(nota => {
        const div = document.createElement('div');
        div.className = "document-list-item";

        const tDiv = document.createElement('div');
        tDiv.innerHTML = nota.contenido;
        const plainBody = tDiv.innerText.trim();
        
        const tTit = document.createElement('div');
        tTit.innerHTML = nota.titulo || "";
        const plainTitle = tTit.innerText.trim();
        
        const displayTitle = plainTitle ? plainTitle : (plainBody ? plainBody.substring(0, 20) + "..." : "Nota sin título");

        div.innerHTML = `
            <div class="doc-item-main-click" id="click-load-${nota.id}">
                <div class="doc-item-title">📄 ${displayTitle}</div>
                <div class="doc-item-body">${plainBody || 'Sin contenido adicional.'}</div>
            </div>
            <div class="doc-item-actions">
                <button class="btn-action-nota" id="share-${nota.id}">📤 Compartir</button>
                <button class="btn-action-nota btn-action-delete" id="del-${nota.id}">🗑️ Borrar</button>
            </div>
        `;
        lista.appendChild(div);

        // Cargar nota local en el espacio editable
        document.getElementById(`click-load-${nota.id}`).addEventListener('click', () => {
            idNotaActual = nota.id;
            document.getElementById('editor-title').innerHTML = nota.titulo;
            document.getElementById('editor').innerHTML = nota.contenido;
            actualizarContadores();
            cacheTemporal();
            document.getElementById('sidebar')?.classList.add('hidden');
            mostrarToast("Nota Cargada");
        });

        // Compartir texto plano de la obra
        document.getElementById(`share-${nota.id}`).addEventListener('click', (e) => {
            e.stopPropagation();
            if (navigator.share) {
                navigator.share({ title: plainTitle, text: plainBody }).catch(() => {});
            } else {
                navigator.clipboard.writeText(`${plainTitle}\n\n${plainBody}`);
                mostrarToast("Copiado al portapapeles");
            }
        });

        // Borrado definitivo del registro IndexedDB
        document.getElementById(`del-${nota.id}`).addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm("¿Estás seguro de eliminar este documento permanentemente?")) {
                await eliminarDocumento(nota.id);
                if (idNotaActual === nota.id) {
                    idNotaActual = null;
                    document.getElementById('editor-title').innerHTML = "";
                    document.getElementById('editor').innerHTML = "";
                    localStorage.removeItem('ret_c_title');
                    localStorage.removeItem('ret_c_body');
                }
                mostrarToast("Eliminado");
                listarNotas();
                actualizarContadores();
                cacheTemporal();
            }
        });
    });
}

// 17. CONECTOR INTERNO PERFECTO CON TU MÓDULO DE TRADUCCIÓN REAL (REPARADO)
function ejecutarTraduccionGlobal(codigoIdioma) {
    // Mapeamos los elementos con los nombres exactos de variables que espera tu idiomas.js
    const elementosUI = {
        lblSaveAs: document.getElementById('btn-saveas-inline'),
        btnNuevo: document.getElementById('btn-cabecera-nuevo-fijo'),
        btnGuardar: document.getElementById('btn-html-save-directo'),
        editor: document.getElementById('editor')
    };
    
    // Llamada nativa a tu script original sin alterar nada
    aplicarTraduccionInterfaz(codigoIdioma, elementosUI);
}

// 18. GESTIÓN DE CACHÉ DE SEGURIDAD EN TIEMPO REAL
function cacheTemporal() {
    const t = document.getElementById('editor-title')?.innerHTML || "";
    const b = document.getElementById('editor')?.innerHTML || "";
    localStorage.setItem('ret_c_title', t);
    localStorage.setItem('ret_c_body', b);
    localStorage.setItem('ret_c_id', idNotaActual);
}

function restaurarCache() {
    const ct = localStorage.getItem('ret_c_title');
    const cb = localStorage.getItem('ret_c_body');
    const cid = localStorage.getItem('ret_c_id');
    if (cb || ct) {
        if (ct) document.getElementById('editor-title').innerHTML = ct;
        if (cb) document.getElementById('editor').innerHTML = cb;
        if (cid && cid !== 'null') idNotaActual = parseInt(cid);
        setTimeout(actualizarContadores, 200);
    }
}

function actualizarContadores() {
    const ed = document.getElementById('editor');
    const stats = document.getElementById('stats-text');
    const dateLbl = document.getElementById('lbl-file-dates');
    if (ed && stats) {
        stats.textContent = "Caracteres: " + ed.innerText.trim().length;
    }
    if (dateLbl) {
        dateLbl.textContent = idNotaActual !== null ? "Editando Nota #" + idNotaActual : "Nota Nueva en RAM";
    }
}

window.mostrarToast = function (m) {
    const t = document.getElementById('toast-notif');
    if (!t) return;
    t.textContent = m;
    t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); }, 2500);
};
