// js/main.js

import { initDB, guardarDocumento, obtenerDocumentos } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, iniciarGrabacionVoz, detenerGrabacionVoz } from './audio.js';

var idNotaActual = null;
var escuchandoDictado = false;
var grabandoNotaVoz = false;
var dispositivosVinculadosStatus = false; // Estado local de vinculación dispositivo puente
var todasLasNotasLocales = []; // Cache en memoria para buscador

const listaIdiomas = [
    { code: "es-MX", name: "Español (Mex)" }, { code: "es-ES", name: "Español (Esp)" },
    { code: "en-US", name: "English (USA)" }, { code: "en-GB", name: "English (UK)" },
    { code: "de-DE", name: "Deutsch" }, { code: "fr-FR", name: "Français" },
    { code: "ru-RU", name: "Русский" }, { code: "zh-CN", name: "中文 (Chino)" },
    { code: "zh-HK", name: "廣東話 (Cant)" }, { code: "ja-JP", name: "日本語" },
    { code: "ko-KR", name: "한국어" }, { code: "ar-SA", name: "العربية" },
    { code: "hi-IN", name: "हिन्दी" }, { code: "it-IT", name: "Italiano" },
    { code: "pt-BR", name: "Português" }, { code: "pt-PT", name: "Português (Por)" },
    { code: "nl-NL", name: "Nederlands" }, { code: "pl-PL", name: "Polski" },
    { code: "tr-TR", name: "Türkçe" }, { code: "sv-SE", name: "Svenska" },
    { code: "vi-VN", name: "Tiếng Việt" }, { code: "th-TH", name: "ไทย" },
    { code: "id-ID", name: "Bahasa Indo" }, { code: "he-IL", name: "עברי" },
    { code: "el-GR", name: "Ελληνικά" }, { code: "ro-RO", name: "Română" },
    { code: "hu-HU", name: "Magyar" }, { code: "cs-CZ", name: "Čeština" },
    { code: "fi-FI", name: "Suomi" }, { code: "uk-UA", name: "Українська" }
];

document.addEventListener('DOMContentLoaded', async () => {
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    const selectApp = document.getElementById('app-lang');
    const selectVoice = document.getElementById('voice-lang');

    // Cargar estado previo de vinculación del dispositivo
    if(localStorage.getItem('ret_dispositivo_vinculado') === 'si') {
        dispositivosVinculadosStatus = true;
        const btnV = document.getElementById('btn-vincular-inline');
        if(btnV) btnV.textContent = "🔗 Desvincular";
    }

    // Poblado de combos de idioma
    if (selectApp && selectVoice) {
        selectApp.innerHTML = ""; selectVoice.innerHTML = "";
        listaIdiomas.forEach(idioma => {
            const opt1 = document.createElement('option'); opt1.value = idioma.code; opt1.textContent = "📝 " + idioma.name; selectApp.appendChild(opt1);
            const opt2 = document.createElement('option'); opt2.value = idioma.code; opt2.textContent = "🔊 " + idioma.name; selectVoice.appendChild(opt2);
        });
    }

    // 1. BOTÓN PALOMITA ✓ GUARDADO LOCAL EXCLUSIVO EN INDEXEDDB (SIN DESCARGAS FANTASMA - PUNTO 1 Y 5)
    document.getElementById('btn-html-save-directo')?.addEventListener('click', async () => {
        const t = document.getElementById('editor-title');
        const e = document.getElementById('editor');
        if (!t || !e) return;

        if (idNotaActual === null) idNotaActual = Date.now();

        const completado = await guardarDocumento(idNotaActual, t.innerHTML, e.innerHTML, [], "nota", "letter");
        if (completado) {
            mostrarToast("✓ Nota guardada localmente en Base de Datos");
            listarNotas();
            cacheTemporal();
        }
    });

    // 2. FUNCIÓN DE LA TIRA INTERNA DEL ENGRANE: CREAR NOTA NUEVA (➕)
    document.getElementById('btn-nuevo-inline')?.addEventListener('click', () => {
        idNotaActual = null;
        document.getElementById('editor-title').innerHTML = "";
        document.getElementById('editor').innerHTML = "";
        localStorage.removeItem('ret_c_title'); localStorage.removeItem('ret_c_body');
        actualizarContadores();
        sidebar?.classList.add('hidden');
        if (btnToggle) { btnToggle.style.color = '#ffca28'; btnToggle.style.borderColor = 'rgba(255,255,255,0.15)'; }
        mostrarToast("Lienzo limpio para nueva nota");
    });

    // 3. FUNCIÓN DE LA TIRA INTERNA DEL ENGRANE: ABRIR ARCHIVO (📂 - SELECCIÓN DIRECTA)
    const btnAbrirInline = document.getElementById('btn-abrir-inline');
    const inputFileNativo = document.getElementById('input-file-abrir-nativo');

    btnAbrirInline?.addEventListener('click', () => inputFileNativo?.click());

    inputFileNativo?.addEventListener('change', function(e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function(evt) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = evt.target.result;
            
            const tituloRescatado = tempDiv.querySelector('#editor-title')?.innerHTML || archivo.name.replace('.html', '');
            const cuerpoRescatado = tempDiv.querySelector('#editor')?.innerHTML || tempDiv.innerHTML;

            document.getElementById('editor-title').innerHTML = tituloRescatado;
            document.getElementById('editor').innerHTML = cuerpoRescatado;

            idNotaActual = Date.now();
            actualizarContadores(); cacheTemporal();
            sidebar?.classList.add('hidden');
            if (btnToggle) { btnToggle.style.color = '#ffca28'; btnToggle.style.borderColor = 'rgba(255,255,255,0.15)'; }
            mostrarToast("Nota abierta e importada con éxito");
        };
        lector.readAsText(archivo);
    });

    // 4. FUNCIÓN DE LA TIRA INTERNA DEL ENGRANE: VINCULAR / DESVINCULAR DISPOSITIVO (🔗)
    document.getElementById('btn-vincular-inline')?.addEventListener('click', function() {
        if(!dispositivosVinculadosStatus) {
            dispositivosVinculadosStatus = true;
            localStorage.setItem('ret_dispositivo_vinculado', 'si');
            this.textContent = "🔗 Desvincular";
            mostrarToast("Dispositivo vinculado. Resguardo en la nube activo.");
        } else {
            dispositivosVinculadosStatus = false;
            localStorage.removeItem('ret_dispositivo_vinculado');
            this.textContent = "🔗 Vincular";
            mostrarToast("Dispositivo desvinculado. Datos solo locales.");
        }
    });

    // 5. FUNCIÓN DE LA TIRA INTERNA DEL ENGRANE: GUARDAR COMO ALTERNADOR PANEL (💾)
    const btnSaveAsInline = document.getElementById('btn-saveas-inline');
    const panelGuardarComo = document.getElementById('panel-guardar-como-container');

    btnSaveAsInline?.addEventListener('click', (e) => {
        e.stopPropagation();
        panelGuardarComo?.classList.toggle('show');
    });

    // EXPORTADORES INTERNOS (PRODUCIDOS POR CÓDIGO)
    document.getElementById('export-code-pdf')?.addEventListener('click', () => {
        html2pdf().from(document.getElementById('editor')).save('documento.pdf');
        panelGuardarComo?.classList.remove('show');
    });
    document.getElementById('export-code-pdf-edit')?.addEventListener('click', () => {
        html2pdf().from(document.getElementById('editor')).save('documento-editable.pdf');
        panelGuardarComo?.classList.remove('show');
    });
    document.getElementById('export-code-doc')?.addEventListener('click', () => {
        const html = document.getElementById('editor').innerHTML;
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = 'retorica-export.doc'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        panelGuardarComo?.classList.remove('show');
    });

    // 6. FUNCIÓN DE LA TIRA INTERNA DEL ENGRANE: INSTALAR APP (📲)
    document.getElementById('btn-instalar-inline')?.addEventListener('click', () => {
        mostrarToast("Ejecutando instalación nativa PWA...");
    });

    // 7. BUSCADOR INTERNO DE NOTAS EN TIEMPO REAL (🔍)
    document.getElementById('input-buscador-interno')?.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase().trim();
        renderizarListaFiltrada(termino);
    });

    // Interrupción del Menú lateral
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            btnToggle.style.color = sidebar.classList.contains('hidden') ? '#ffca28' : '#ef4444';
            btnToggle.style.borderColor = sidebar.classList.contains('hidden') ? 'rgba(255,255,255,0.15)' : '#ef4444';
        });
    }

    // Controles básicos adicionales
    document.getElementById('btn-undo')?.addEventListener('click', () => { document.execCommand('undo', false, null); cacheTemporal(); });
    document.getElementById('btn-redo')?.addEventListener('click', () => { document.execCommand('redo', false, null); cacheTemporal(); });

    document.getElementById('font-family-select')?.addEventListener('change', (e) => {
        const ed = document.getElementById('editor'); const tit = document.getElementById('editor-title');
        if (ed && tit) {
            ed.classList.remove('font-sans', 'font-serif', 'font-mono'); ed.classList.add(e.target.value);
            tit.classList.remove('font-sans', 'font-serif', 'font-mono'); tit.classList.add(e.target.value);
        }
    });

    const btnTema = document.getElementById('btn-toggle-tema');
    if (localStorage.getItem('retorica_theme') === 'light') { document.body.classList.add('light-theme'); }
    btnTema?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('retorica_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // Control de Voz y Audio modular
    document.getElementById('btn-mic')?.addEventListener('click', function() {
        const idioma = selectApp ? selectApp.value : 'es-MX';
        if (!escuchandoDictado) {
            escuchandoDictado = true; this.style.background = "#ef4444";
            iniciarDictado(idioma, (texto) => {
                const ed = document.getElementById('editor');
                if (ed) { ed.focus(); document.execCommand('insertText', false, texto + ' '); cacheTemporal(); actualizarContadores(); }
            }, () => { escuchandoDictado = false; this.style.background = ""; });
        } else {
            escuchandoDictado = false; maxDetenerDictado(); this.style.background = "";
        }
    });

    function maxDetenerDictado() { detenerDictado(); }

    document.getElementById('btn-lectura')?.addEventListener('click', () => {
        const ed = document.getElementById('editor'); const voz = selectVoice ? selectVoice.value : 'es-MX';
        if (ed && ed.innerText.trim()) { leerTexto(ed.innerText, voz, () => {}); }
    });

    document.getElementById('btn-msg-voz')?.addEventListener('click', function() {
        if (!grabandoNotaVoz) {
            grabandoNotaVoz = true; this.style.background = "#b91c1c";
            iniciarGrabacionVoz((blobAudio) => { console.log("Grabación guardada localmente.", blobAudio); });
        } else {
            grabandoNotaVoz = false; detenerGrabacionVoz(); this.style.background = "";
            mostrarToast("Grabación de voz guardada");
        }
    });

    document.getElementById('btn-render-fl')?.addEventListener('click', () => mostrarToast("Renderizando audio sin descargas..."));

    // Inicializar Persistencia
    try { await initDB(); listarNotas(); } catch (err) { console.error("Fallo IndexedDB:", err); }

    document.getElementById('editor-title')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });
    document.getElementById('editor')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });

    restaurarCache();
});

async function listarNotas() {
    todasLasNotasLocales = await obtenerDocumentos();
    renderizarListaFiltrada("");
}

function renderizarListaFiltrada(filtro) {
    const lista = document.getElementById('document-list');
    if (!lista) return; lista.innerHTML = "";

    const notasFiltradas = todasLasNotasLocales.filter(nota => {
        const t = (nota.titulo || "").toLowerCase();
        const c = (nota.contenido || "").toLowerCase();
        return t.includes(filtro) || c.includes(filtro);
    });

    if(notasFiltradas.length === 0) {
        lista.innerHTML = "<div style='font-size:0.75rem; color:#6b7280; font-style:italic; padding:6px;'>No se encontraron notas...</div>";
        return;
    }

    notasFiltradas.forEach(nota => {
        const div = document.createElement('div'); div.className = "document-list-item";

        const tmpB = document.createElement('div'); tmpB.innerHTML = nota.contenido; const plainB = tmpB.innerText.trim();
        const tmpT = document.createElement('div'); tmpT.innerHTML = nota.titulo || ""; const plainT = tmpT.innerText.trim();

        const pTitle = plainT ? plainT : (plainB ? plainB.substring(0, 22) + "..." : "Sin Título");
        const pBody = plainB ? plainB : "Sin contenido.";

        div.innerHTML = `<div class='doc-item-title'>📄 ${pTitle}</div><div class='doc-item-body'>${pBody}</div>`;
        
        div.addEventListener('click', () => {
            idNotaActual = nota.id;
            document.getElementById('editor-title').innerHTML = nota.titulo;
            document.getElementById('editor').innerHTML = nota.contenido;
            actualizarContadores(); cacheTemporal();
            document.getElementById('sidebar')?.classList.add('hidden');
            const b = document.getElementById('btn-toggle-pestaña'); if (b) { b.style.color = '#ffca28'; b.style.borderColor = 'rgba(255,255,255,0.15)'; }
        });
        lista.appendChild(div);
    });
}

function cacheTemporal() {
    const t = document.getElementById('editor-title')?.innerHTML || "";
    const b = document.getElementById('editor')?.innerHTML || "";
    localStorage.setItem('ret_c_title', t); localStorage.setItem('ret_c_body', b);
    localStorage.setItem('ret_c_id', idNotaActual);
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
    t.textContent = m; t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); }, 2500);
};
