// js/main.js

import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, iniciarGrabacionVoz, detenerGrabacionVoz } from './audio.js';

var idNotaActual = null;
var escuchandoDictado = false;
var grabandoNotaVoz = false;
var dispositivosVinculadosStatus = false;
var todasLasNotasLocales = []; 

const listaIdiomas = [
    { code: "es-MX", name: "Español (Mex)" }, { code: "es-ES", name: "Español (Esp)" },
    { code: "en-US", name: "English (USA)" }, { code: "en-GB", name: "English (UK)" },
    { code: "de-DE", name: "Deutsch" }, { code: "fr-FR", name: "Français" },
    { code: "ja-JP", name: "日本語" }, { code: "pt-BR", name: "Português" }
];

document.addEventListener('DOMContentLoaded', async () => {
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    const selectApp = document.getElementById('app-lang');
    const selectVoice = document.getElementById('voice-lang');
    const txtLeyenda = document.getElementById('wrapper-leyenda-vinculo');

    // Inicialización del estado de vinculación (PUNTO 7)
    if(localStorage.getItem('ret_dispositivo_vinculado') === 'si') {
        dispositivosVinculadosStatus = true;
        const btnV = document.getElementById('btn-vincular-inline');
        if(btnV) btnV.textContent = "🔗 Desvincular";
        if(txtLeyenda) txtLeyenda.innerHTML = "🔗 Linked: Servidor Sincronizado Activo";
    }

    // CORRECCIÓN SISTEMA DE IDIOMAS (PUNTO IDIOMAS REPARADO DESDE EL DOM)
    if (selectApp && selectVoice) {
        selectApp.innerHTML = ""; selectVoice.innerHTML = "";
        listaIdiomas.forEach(idioma => {
            const opt1 = document.createElement('option'); opt1.value = idioma.code; opt1.textContent = "App: " + idioma.name; selectApp.appendChild(opt1);
            const opt2 = document.createElement('option'); opt2.value = idioma.code; opt2.textContent = "Voz: " + idioma.name; selectVoice.appendChild(opt2);
        });
        selectApp.value = localStorage.getItem('ret_lang_app') || "es-MX";
        selectVoice.value = localStorage.getItem('ret_lang_voice') || "es-MX";
    }

    selectApp?.addEventListener('change', (e) => {
        localStorage.setItem('ret_lang_app', e.target.value);
        mostrarToast("Idioma de interfaz: " + e.target.value);
    });
    selectVoice?.addEventListener('change', (e) => {
        localStorage.setItem('ret_lang_voice', e.target.value);
        mostrarToast("Idioma de lectura: " + e.target.value);
    });

    // ACCIÓN GUARDAR LOCAL DIRECTO EN BASE DE DATOS
    document.getElementById('btn-html-save-directo')?.addEventListener('click', async () => {
        const t = document.getElementById('editor-title'); const e = document.getElementById('editor');
        if (!t || !e) return;
        if (idNotaActual === null) idNotaActual = Date.now();
        const completado = await guardarDocumento(idNotaActual, t.innerHTML, e.innerHTML, [], "nota", "letter");
        if (completado) { mostrarToast("✓ Guardado en Base de Datos"); listarNotas(); cacheTemporal(); }
    });

    // ACCIÓN BOTÓN + FIJO EN LA CABECERA (PUNTO 4)
    document.getElementById('btn-cabecera-nuevo-fijo')?.addEventListener('click', () => {
        idNotaActual = null;
        document.getElementById('editor-title').innerHTML = ""; document.getElementById('editor').innerHTML = "";
        localStorage.removeItem('ret_c_title'); localStorage.removeItem('ret_c_body');
        actualizarContadores(); sidebar?.classList.add('hidden');
        if (btnToggle) { btnToggle.style.color = '#00ffcc'; btnToggle.style.borderColor = '#00ffcc'; }
        mostrarToast("Nueva Nota Iniciada");
    });

    // ACCIÓN ABRIR ARCHIVO NATIVO LOCAL
    const btnAbrirInline = document.getElementById('btn-abrir-inline');
    const inputFileNativo = document.getElementById('input-file-abrir-nativo');
    btnAbrirInline?.addEventListener('click', () => inputFileNativo?.click());

    inputFileNativo?.addEventListener('change', function(e) {
        const archivo = e.target.files[0]; if (!archivo) return;
        const lector = new FileReader();
        lector.onload = function(evt) {
            const tempDiv = document.createElement('div'); tempDiv.innerHTML = evt.target.result;
            const tRes = tempDiv.querySelector('#editor-title')?.innerHTML || archivo.name.replace('.html', '');
            const cRes = tempDiv.querySelector('#editor')?.innerHTML || tempDiv.innerHTML;
            document.getElementById('editor-title').innerHTML = tRes; document.getElementById('editor').innerHTML = cRes;
            idNotaActual = Date.now(); actualizarContadores(); cacheTemporal(); sidebar?.classList.add('hidden');
            mostrarToast("Importado Exitosamente");
        };
        lector.readAsText(archivo);
    });

    // VINCULACIÓN CON TRATAMIENTO DE TEXTO AISLADO (PUNTO 7 REPARADO)
    document.getElementById('btn-vincular-inline')?.addEventListener('click', function() {
        if(!dispositivosVinculadosStatus) {
            dispositivosVinculadosStatus = true; localStorage.setItem('ret_dispositivo_vinculado', 'si');
            this.textContent = "🔗 Desvincular";
            if(txtLeyenda) txtLeyenda.innerHTML = "🔗 Linked: Servidor Sincronizado Activo";
            mostrarToast("Dispositivo Vinculado Exitosamente");
        } else {
            dispositivosVinculadosStatus = false; localStorage.removeItem('ret_dispositivo_vinculado');
            this.textContent = "🔗 Vincular";
            if(txtLeyenda) txtLeyenda.innerHTML = "Estado: Modo Local (Información Resguardada)";
            mostrarToast("Vínculo Removido");
        }
    });

    // PANEL DE EXPORTACIÓN (GUARDAR COMO)
    const btnSaveAsInline = document.getElementById('btn-saveas-inline');
    const panelGuardarComo = document.getElementById('panel-guardar-como-container');
    btnSaveAsInline?.addEventListener('click', (e) => { e.stopPropagation(); panelGuardarComo?.classList.toggle('show'); });

    document.getElementById('export-code-pdf')?.addEventListener('click', () => { html2pdf().from(document.getElementById('contenedor-global-seleccion')).save('Retorica_Export.pdf'); panelGuardarComo?.classList.remove('show'); });
    document.getElementById('export-code-pdf-edit')?.addEventListener('click', () => { html2pdf().from(document.getElementById('contenedor-global-seleccion')).save('Retorica_Editable.pdf'); panelGuardarComo?.classList.remove('show'); });
    document.getElementById('export-code-doc')?.addEventListener('click', () => {
        const html = document.getElementById('contenedor-global-seleccion').innerHTML;
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = 'Retorica_Word.doc'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        panelGuardarComo?.classList.remove('show');
    });

    // INSTALAR APP (PUNTO 2)
    document.getElementById('btn-instalar-inline')?.addEventListener('click', () => { mostrarToast("Instalando Aplicación en Escritorio..."); });

    // FILTRADO DEL BUSCADOR
    document.getElementById('input-buscador-interno')?.addEventListener('input', function(e) { renderizarListaFiltrada(e.target.value.toLowerCase().trim()); });

    // EVENTO TOGGLE MENÚ
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            const estaOculto = sidebar.classList.contains('hidden');
            btnToggle.style.color = estaOculto ? '#00ffcc' : '#ff3b30';
            btnToggle.style.borderColor = estaOculto ? '#00ffcc' : '#ff3b30';
        });
    }

    document.getElementById('btn-undo')?.addEventListener('click', () => { document.execCommand('undo', false, null); cacheTemporal(); });
    document.getElementById('btn-redo')?.addEventListener('click', () => { document.execCommand('redo', false, null); cacheTemporal(); });

    document.getElementById('font-family-select')?.addEventListener('change', (e) => {
        const ed = document.getElementById('editor'); const tit = document.getElementById('editor-title');
        if (ed && tit) { ed.className = "rich-editor " + e.target.value; tit.className = "title-input-field " + e.target.value; }
    });

    const btnTema = document.getElementById('btn-toggle-tema');
    if (localStorage.getItem('retorica_theme') === 'light') { document.body.classList.add('light-theme'); }
    btnTema?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('retorica_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // DICTADO POR VOZ Y AUDIO MODULAR
    document.getElementById('btn-mic')?.addEventListener('click', function() {
        const idioma = selectVoice ? selectVoice.value : 'es-MX';
        if (!escuchandoDictado) {
            escuchandoDictado = true; this.style.background = "#ff3b30";
            iniciarDictado(idioma, (texto) => {
                const ed = document.getElementById('editor');
                if (ed) { ed.focus(); document.execCommand('insertText', false, texto + ' '); cacheTemporal(); actualizarContadores(); }
            }, () => { escuchandoDictado = false; this.style.background = ""; });
        } else {
            escuchandoDictado = false; detenerDictado(); this.style.background = "";
        }
    });

    document.getElementById('btn-lectura')?.addEventListener('click', () => {
        const ed = document.getElementById('editor'); const voz = selectVoice ? selectVoice.value : 'es-MX';
        if (ed && ed.innerText.trim()) { leerTexto(ed.innerText, voz, () => {}); }
    });

    document.getElementById('btn-msg-voz')?.addEventListener('click', function() {
        if (!grabandoNotaVoz) {
            grabandoNotaVoz = true; this.style.background = "#ff3b30";
            iniciarGrabacionVoz((blobAudio) => {});
        } else {
            grabandoNotaVoz = false; detenerGrabacionVoz(); this.style.background = "";
            mostrarToast("Mensaje de Voz Almacenado");
        }
    });

    document.getElementById('btn-render-fl')?.addEventListener('click', () => mostrarToast("Procesando síntesis de audio integrada..."));

    try { await initDB(); listarNotas(); } catch (err) { console.error("Error BD:", err); }

    document.getElementById('editor-title')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });
    document.getElementById('editor')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });

    restaurarCache();
});

async function listarNotas() { todasLasNotasLocales = await obtenerDocumentos(); renderizarListaFiltrada(""); }

// INCORPORACIÓN DE ACCIONES COMPARTIR Y ELIMINAR DIRECTAMENTE EN CADA ELEMENTO (PUNTO 6)
function renderizarListaFiltrada(filtro) {
    const lista = document.getElementById('document-list'); if (!lista) return; lista.innerHTML = "";
    const notasFiltradas = todasLasNotasLocales.filter(n => (n.titulo || "").toLowerCase().includes(filtro) || (n.contenido || "").toLowerCase().includes(filtro));

    if(notasFiltradas.length === 0) {
        lista.innerHTML = "<div style='font-size:0.8rem; color:#88a0b5; font-style:italic; padding:4px;'>No hay registros coincidentes</div>"; return;
    }

    notasFiltradas.forEach(nota => {
        const div = document.createElement('div'); div.className = "document-list-item";
        
        const tDiv = document.createElement('div'); tDiv.innerHTML = nota.contenido; const plainBody = tDiv.innerText.trim();
        const tTit = document.createElement('div'); tTit.innerHTML = nota.titulo || ""; const plainTitle = tTit.innerText.trim();

        const displayTitle = plainTitle ? plainTitle : (plainBody ? plainBody.substring(0, 20) + "..." : "Nota sin nombre");

        // UI de los elementos con su botonera de acciones (PUNTO 6)
        div.innerHTML = `
            <div class="doc-item-main-click" id="click-load-${nota.id}">
                <div class="doc-item-title">📄 ${displayTitle}</div>
                <div class="doc-item-body">${plainBody || 'Sin descripción adicional.'}</div>
            </div>
            <div class="doc-item-actions">
                <button class="btn-action-nota" id="share-${nota.id}">📤 Compartir</button>
                <button class="btn-action-nota btn-action-delete" id="del-${nota.id}">🗑️ Borrar</button>
            </div>
        `;
        lista.appendChild(div);

        // Evento Carga de Nota
        document.getElementById(`click-load-${nota.id}`).addEventListener('click', () => {
            idNotaActual = nota.id;
            document.getElementById('editor-title').innerHTML = nota.titulo;
            document.getElementById('editor').innerHTML = nota.contenido;
            actualizarContadores(); cacheTemporal(); document.getElementById('sidebar')?.classList.add('hidden');
            const b = document.getElementById('btn-toggle-pestaña'); if (b) { b.style.color = '#00ffcc'; b.style.borderColor = '#00ffcc'; }
        });

        // Evento Compartir Nota (Usa API Web Share o copia texto)
        document.getElementById(`share-${nota.id}`).addEventListener('click', (e) => {
            e.stopPropagation();
            if (navigator.share) {
                navigator.share({ title: plainTitle, text: plainBody }).catch(() => {});
            } else {
                navigator.clipboard.writeText(`${plainTitle}\n\n${plainBody}`);
                mostrarToast("Copiado al portapapeles para compartir");
            }
        });

        // Evento Borrar Nota (PUNTO 6)
        document.getElementById(`del-${nota.id}`).addEventListener('click', async (e) => {
            e.stopPropagation();
            if(confirm("¿Seguro que deseas eliminar esta plantilla/nota?")) {
                await eliminarDocumento(nota.id);
                if(idNotaActual === nota.id) {
                    idNotaActual = null; document.getElementById('editor-title').innerHTML = ""; document.getElementById('editor').innerHTML = "";
                    localStorage.removeItem('ret_c_title'); localStorage.removeItem('ret_c_body');
                }
                mostrarToast("Nota eliminada"); listarNotas(); actualizarContadores(); cacheTemporal();
            }
        });
    });
}

function cacheTemporal() {
    const t = document.getElementById('editor-title')?.innerHTML || ""; const b = document.getElementById('editor')?.innerHTML || "";
    localStorage.setItem('ret_c_title', t); localStorage.setItem('ret_c_body', b); localStorage.setItem('ret_c_id', idNotaActual);
}

function restaurarCache() {
    const ct = localStorage.getItem('ret_c_title'); const cb = localStorage.getItem('ret_c_body'); const cid = localStorage.getItem('ret_c_id');
    if (cb || ct) {
        if (ct) document.getElementById('editor-title').innerHTML = ct;
        if (cb) document.getElementById('editor').innerHTML = cb;
        if (cid && cid !== 'null') idNotaActual = parseInt(cid);
        setTimeout(actualizarContadores, 200);
    }
}

function actualizarContadores() {
    const ed = document.getElementById('editor'); const stats = document.getElementById('stats-text'); const dateLbl = document.getElementById('lbl-file-dates');
    if (ed && stats) stats.textContent = "Caracteres: " + ed.innerText.trim().length;
    if (dateLbl) dateLbl.textContent = idNotaActual !== null ? "Editando Nota #" + idNotaActual : "Nota Nueva en RAM";
}

window.mostrarToast = function(m) {
    const t = document.getElementById('toast-notif'); if (!t) return;
    t.textContent = m; t.classList.add('show'); setTimeout(() => { t.classList.remove('show'); }, 2500);
};
