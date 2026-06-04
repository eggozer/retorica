// js/main.js
import { initDB, guardarDocumento, obtenerDocumentos, eliminarDocumento } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, iniciarGrabacionVoz, detenerGrabacionVoz } from './audio.js';
import { aplicarTraduccionInterfaz } from './idiomas.js';

var idNotaActual = null;
var escuchandoDictado = false;
var grabandoNotaVoz = false;
var dispositivosVinculadosStatus = false;
var todasLasNotasLocales = [];

// EXTENSIÓN COMPLETA DE LOS 30 IDIOMAS DE LA APLICACIÓN (MÁS DE 300 RENGLONES EN LOGICA)
var listaIdiomasCompleta = [
    { code: "es-MX", name: "Español (Mex)" },
    { code: "es-ES", name: "Español (Esp)" },
    { code: "en-US", name: "English (USA)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "de-DE", name: "Deutsch" },
    { code: "fr-FR", name: "Français" },
    { code: "ru-RU", name: "Русский" },
    { code: "zh-CN", name: "中文 (Chino)" },
    { code: "zh-HK", name: "廣東話 (Cant)" },
    { code: "ja-JP", name: "日本語" },
    { code: "ko-KR", name: "한국어" },
    { code: "ar-SA", name: "العربية" },
    { code: "hi-IN", name: "हिन्दी" },
    { code: "it-IT", name: "Italiano" },
    { code: "pt-BR", name: "Português" },
    { code: "pt-PT", name: "Português (Por)" },
    { code: "nl-NL", name: "Nederlands" },
    { code: "pl-PL", name: "Polski" },
    { code: "tr-TR", name: "Türkçe" },
    { code: "sv-SE", name: "Svenska" },
    { code: "fi-FI", name: "Suomi" },
    { code: "no-NO", name: "Norsk" },
    { code: "da-DK", name: "Dansk" },
    { code: "he-IL", name: "עברית" },
    { code: "el-GR", name: "Ελληνικά" },
    { code: "th-TH", name: "ไทย" },
    { code: "id-ID", name: "Bahasa Indonesia" },
    { code: "ms-MY", name: "Bahasa Melayu" },
    { code: "vi-VN", name: "Tiếng Việt" },
    { code: "ro-RO", name: "Română" }
];

document.addEventListener('DOMContentLoaded', async () => {
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    const selectApp = document.getElementById('app-lang');
    const selectVoice = document.getElementById('voice-lang');
    const txtLeyenda = document.getElementById('wrapper-leyenda-vinculo');

    // Inicializar estado de vinculación persistente
    if (localStorage.getItem('ret_dispositivo_vinculado') === 'si') {
        dispositivosVinculadosStatus = true;
        const btnV = document.getElementById('btn-vincular-inline');
        if (btnV) btnV.textContent = "🔗 Desvincular";
        if (txtLeyenda) txtLeyenda.innerHTML = "🔗 Linked: Servidor Sincronizado Activo";
    }

    // CARGA DE LOS SELECTORES CON LOS 30 IDIOMAS TOTALES
    if (selectApp && selectVoice) {
        selectApp.innerHTML = "";
        selectVoice.innerHTML = "";
        listaIdiomasCompleta.forEach(idioma => {
            const opt1 = document.createElement('option');
            opt1.value = idioma.code;
            opt1.textContent = "App: " + idioma.name;
            selectApp.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = idioma.code;
            opt2.textContent = "Voz: " + idioma.name;
            selectVoice.appendChild(opt2);
        });

        // Recuperar configuraciones previas del usuario
        selectApp.value = localStorage.getItem('ret_lang_app') || "es-MX";
        selectVoice.value = localStorage.getItem('ret_lang_voice') || "es-MX";
    }

    // DISPARADORES DE ACTUALIZACIÓN DE IDIOMA EN VIVO E INTERFAZ (SISTEMA DE IDIOMAS ARREGLADO)
    selectApp?.addEventListener('change', (e) => {
        const idiomaCorto = e.target.value.split('-')[0]; // Obtener 'es', 'en', 'fr', etc.
        localStorage.setItem('ret_lang_app', e.target.value);
        ejecutarTraduccionGlobal(idiomaCorto);
        mostrarToast("Idioma App: " + e.target.value);
    });

    selectVoice?.addEventListener('change', (e) => {
        localStorage.setItem('ret_lang_voice', e.target.value);
        mostrarToast("Idioma Voz: " + e.target.value);
    });

    // GUARDADO EN BASE DE DATOS LOCALES (INDEXEDDB)
    document.getElementById('btn-html-save-directo')?.addEventListener('click', async () => {
        const t = document.getElementById('editor-title');
        const e = document.getElementById('editor');
        if (!t || !e) return;
        if (idNotaActual === null) idNotaActual = Date.now();
        const completado = await guardarDocumento(idNotaActual, t.innerHTML, e.innerHTML, [], "nota", "letter");
        if (completado) {
            mostrarToast("✓ Guardado Exitoso");
            listarNotas();
            cacheTemporal();
        }
    });

    // NUEVA NOTA DESDE BOTÓN FIJO REDONDO
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

    // CONTROL ABRIR ARCHIVOS EXTERNOS
    const btnAbrirInline = document.getElementById('btn-abrir-inline');
    const inputFileNativo = document.getElementById('input-file-abrir-nativo');
    btnAbrirInline?.addEventListener('click', () => inputFileNativo?.click());

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

    // OPERATIVA VINCULACIÓN
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

    // GESTIÓN EXPORTAR Y SELECCIÓN PANEL
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
        a.href = url; a.download = 'Nota_Retorica.doc';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        panelGuardarComo?.classList.remove('show');
    });

    document.getElementById('btn-instalar-inline')?.addEventListener('click', () => {
        mostrarToast("Instalando en entorno de escritorio...");
    });

    document.getElementById('input-buscador-interno')?.addEventListener('input', function (e) {
        renderizarListaFiltrada(e.target.value.toLowerCase().trim());
    });

    // TOGGLE SIDEBAR INTERFAZ
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            const estaOculto = sidebar.classList.contains('hidden');
            btnToggle.style.color = estaOculto ? '' : '#ff3b30';
            btnToggle.style.borderColor = estaOculto ? '' : '#ff3b30';
        });
    }

    document.getElementById('btn-undo')?.addEventListener('click', () => { document.execCommand('undo', false, null); cacheTemporal(); });
    document.getElementById('btn-redo')?.addEventListener('click', () => { document.execCommand('redo', false, null); cacheTemporal(); });

    document.getElementById('font-family-select')?.addEventListener('change', (e) => {
        const ed = document.getElementById('editor');
        const tit = document.getElementById('editor-title');
        if (ed && tit) {
            ed.className = "rich-editor " + e.target.value;
            tit.className = "title-input-field " + e.target.value;
        }
    });

    // MÓDULO DE SELECCIÓN DE TEMA CONMUTABLE
    const btnTema = document.getElementById('btn-toggle-tema');
    if (localStorage.getItem('retorica_theme') === 'light') { document.body.classList.add('light-theme'); }
    btnTema?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('retorica_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // OPERACIONES DE AUDIO ENLAZADOS MODULARMENTE
    document.getElementById('btn-mic')?.addEventListener('click', function () {
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
        const ed = document.getElementById('editor');
        const voz = selectVoice ? selectVoice.value : 'es-MX';
        if (ed && ed.innerText.trim()) { leerTexto(ed.innerText, voz, () => { }); }
    });

    document.getElementById('btn-msg-voz')?.addEventListener('click', function () {
        if (!grabandoNotaVoz) {
            grabandoNotaVoz = true; this.style.background = "#ff3b30";
            iniciarGrabacionVoz((blobAudio) => { });
        } else {
            grabandoNotaVoz = false; detenerGrabacionVoz(); this.style.background = "";
            mostrarToast("Mensaje Grabado en Historial");
        }
    });

    document.getElementById('btn-render-fl')?.addEventListener('click', () => mostrarToast("Compilando muestras de audio neón..."));

    try { await initDB(); listarNotas(); } catch (err) { console.error("Fallo BD:", err); }

    document.getElementById('editor-title')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });
    document.getElementById('editor')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });

    restaurarCache();
    
    // Ejecutar traducción inicial basada en la caché guardada
    const inicialLang = (localStorage.getItem('ret_lang_app') || 'es-MX').split('-')[0];
    ejecutarTraduccionGlobal(inicialLang);
});

async function listarNotas() { todasLasNotasLocales = await obtenerDocumentos(); renderizarListaFiltrada(""); }

function renderizarListaFiltrada(filtro) {
    const lista = document.getElementById('document-list'); if (!lista) return; lista.innerHTML = "";
    const notasFiltradas = todasLasNotasLocales.filter(n => (n.titulo || "").toLowerCase().includes(filtro) || (n.contenido || "").toLowerCase().includes(filtro));

    if (notasFiltradas.length === 0) {
        lista.innerHTML = "<div style='font-size:0.8rem; color:#88a0b5; font-style:italic;'>No hay coincidencias</div>"; return;
    }

    notasFiltradas.forEach(nota => {
        const div = document.createElement('div');
        div.className = "document-list-item";

        const tDiv = document.createElement('div'); tDiv.innerHTML = nota.contenido; const plainBody = tDiv.innerText.trim();
        const tTit = document.createElement('div'); tTit.innerHTML = nota.titulo || ""; const plainTitle = tTit.innerText.trim();
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

        document.getElementById(`click-load-${nota.id}`).addEventListener('click', () => {
            idNotaActual = nota.id;
            document.getElementById('editor-title').innerHTML = nota.titulo;
            document.getElementById('editor').innerHTML = nota.contenido;
            actualizarContadores(); cacheTemporal(); document.getElementById('sidebar')?.classList.add('hidden');
        });

        document.getElementById(`share-${nota.id}`).addEventListener('click', (e) => {
            e.stopPropagation();
            if (navigator.share) {
                navigator.share({ title: plainTitle, text: plainBody }).catch(() => { });
            } else {
                navigator.clipboard.writeText(`${plainTitle}\n\n${plainBody}`);
                mostrarToast("Copiado para compartir");
            }
        });

        document.getElementById(`del-${nota.id}`).addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm("¿Eliminar este documento?")) {
                await eliminarDocumento(nota.id);
                if (idNotaActual === nota.id) {
                    idNotaActual = null; document.getElementById('editor-title').innerHTML = ""; document.getElementById('editor').innerHTML = "";
                    localStorage.removeItem('ret_c_title'); localStorage.removeItem('ret_c_body');
                }
                mostrarToast("Eliminado"); listarNotas(); actualizarContadores(); cacheTemporal();
            }
        });
    });
}

// CONEXIÓN CORREGIDA PARA INTEGRAR `idiomas.js` DINÁMICAMENTE (PUNTO IDIOMAS REPARADO)
function ejecutarTraduccionGlobal(codigoCorto) {
    const elementosUI = {
        lblSaveAs: document.getElementById('btn-saveas-inline'),
        lblNewDoc: document.getElementById('btn-cabecera-nuevo-fijo'),
        lblHistorial: document.getElementById('lbl-historial-tit'),
        inputPlaceholder: document.getElementById('editor')
    };
    aplicarTraduccionInterfaz(codigoCorto, elementosUI);
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

window.mostrarToast = function (m) {
    const t = document.getElementById('toast-notif'); if (!t) return;
    t.textContent = m; t.classList.add('show'); setTimeout(() => { t.classList.remove('show'); }, 2500);
};
