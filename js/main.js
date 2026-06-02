// js/main.js

// Importaciones de tus módulos de respaldo originales
import { initDB, guardarDocumento, obtenerDocumentos } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto } from './audio.js';

var idNotaActual = null;
var escuchandoDictado = false;

// 30 Idiomas solicitados para alimentar los selectores de forma segura al cargar el DOM
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
    { code: "id-ID", name: "Bahasa Indo" }, { code: "he-IL", name: "עibri" },
    { code: "el-GR", name: "Ελληνικά" }, { code: "ro-RO", name: "Română" },
    { code: "hu-HU", name: "Magyar" }, { code: "cs-CZ", name: "Čeština" },
    { code: "fi-FI", name: "Suomi" }, { code: "uk-UA", name: "Українська" }
];

document.addEventListener('DOMContentLoaded', async () => {
    const btnToggle = document.getElementById('btn-toggle-pestaña');
    const sidebar = document.getElementById('sidebar');
    const selectApp = document.getElementById('app-lang');
    const selectVoice = document.getElementById('voice-lang');

    // 1. LLENADO SEGURO DE SELECTORES DE IDIOMA
    if (selectApp && selectVoice) {
        selectApp.innerHTML = "";
        selectVoice.innerHTML = "";
        listaIdiomas.forEach(idioma => {
            const opt1 = document.createElement('option');
            opt1.value = idioma.code;
            opt1.textContent = "📝 " + idioma.name;
            selectApp.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = idioma.voiceCode || idioma.code;
            opt2.textContent = "🔊 " + idioma.name;
            selectVoice.appendChild(opt2);
        });
    }

    // 2. CONMUTADOR DEL MENÚ LATERAL INTERRUPTOR
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            btnToggle.style.color = sidebar.classList.contains('hidden') ? '#ffca28' : '#ef4444';
            btnToggle.style.borderColor = sidebar.classList.contains('hidden') ? 'rgba(255,255,255,0.15)' : '#ef4444';
        });
    }

    // 3. GESTOS TÁCTILES INTELIGENTES: LIMITADOS AL MARGEN DE 35PX
    // Así puedes hacer scroll vertical en tus notas largas sin que el menú se trabe o salte horizontalmente
    let startMenuX = 0;
    document.addEventListener('touchstart', (e) => {
        if (sidebar && sidebar.classList.contains('hidden') && e.touches[0].clientX < 35) {
            startMenuX = e.touches[0].clientX;
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (startMenuX > 0) {
            let diffX = e.touches[0].clientX - startMenuX;
            if (diffX > 70) {
                sidebar.classList.remove('hidden');
                if (btnToggle) { btnToggle.style.color = '#ef4444'; btnToggle.style.borderColor = '#ef4444'; }
                startMenuX = 0;
            }
        }
    }, { passive: true });

    sidebar?.addEventListener('touchstart', (e) => { startMenuX = e.touches[0].clientX; }, { passive: true });
    sidebar?.addEventListener('touchmove', (e) => {
        if (startMenuX > 0) {
            let diffX = e.touches[0].clientX - startMenuX;
            if (diffX < -70) {
                sidebar.classList.add('hidden');
                if (btnToggle) { btnToggle.style.color = '#ffca28'; btnToggle.style.borderColor = 'rgba(255,255,255,0.15)'; }
                startMenuX = 0;
            }
        }
    }, { passive: true });

    // 4. ATAJOS DE EDICIÓN Y TIPOGRAFÍAS
    document.getElementById('btn-undo')?.addEventListener('click', () => { document.execCommand('undo', false, null); cacheTemporal(); });
    document.getElementById('btn-redo')?.addEventListener('click', () => { document.execCommand('redo', false, null); cacheTemporal(); });
    document.getElementById('btn-bold')?.addEventListener('click', () => document.execCommand('bold', false, null));
    document.getElementById('btn-italic')?.addEventListener('click', () => document.execCommand('italic', false, null));

    document.getElementById('font-family-select')?.addEventListener('change', (e) => {
        const ed = document.getElementById('editor');
        const tit = document.getElementById('editor-title');
        if (ed && tit) {
            ed.classList.remove('font-sans', 'font-serif', 'font-mono'); ed.classList.add(e.target.value);
            tit.classList.remove('font-sans', 'font-serif', 'font-mono'); tit.classList.add(e.target.value);
        }
    });

    // 5. CONTROL DE TEMA VISUAL CLARO / OSCURO
    const btnTema = document.getElementById('btn-toggle-tema');
    if (localStorage.getItem('retorica_theme') === 'light') { document.body.classList.add('light-theme'); }
    btnTema?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('retorica_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // 6. ENLACE CON MÓDULO AUDIO.JS (DICTADO Y LECTURA)
    document.getElementById('btn-mic')?.addEventListener('click', function() {
        const idiomaSeleccionado = selectApp ? selectApp.value : 'es-MX';
        if (!escuchandoDictado) {
            escuchandoDictado = true;
            this.style.background = "#ef4444";
            mostrarToast("Dictado en tiempo real activo...");
            iniciarDictado(idiomaSeleccionado, (textoRecibido) => {
                const ed = document.getElementById('editor');
                if (ed) {
                    ed.focus();
                    document.execCommand('insertText', false, textoRecibido + ' ');
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
            mostrarToast("Dictado en pausa");
        }
    });

    document.getElementById('btn-lectura')?.addEventListener('click', () => {
        const ed = document.getElementById('editor');
        const idiomaVoz = selectVoice ? selectVoice.value : 'es-MX';
        if (ed && ed.innerText.trim()) {
            mostrarToast("Leyendo texto...");
            leerTexto(ed.innerText, idiomaVoz, () => {
                mostrarToast("Lectura finalizada");
            });
        }
    });

    document.getElementById('btn-render-fl')?.addEventListener('click', () => mostrarToast("Procesando búfer de audio..."));

    // 7. INICIALIZAR BASE DE DATOS LOCAL Y VER HISTORIAL
    try {
        await initDB();
        listarNotas();
    } catch (err) {
        console.error("Error inicializando IndexedDB:", err);
    }

    // INTERRUPTORES DE GUARDADO E HISTORIAL
    document.getElementById('btn-main-guardar')?.addEventListener('click', async () => {
        const tF = document.getElementById('editor-title');
        const eF = document.getElementById('editor');
        if (!tF || !eF) return;

        if (idNotaActual === null) {
            idNotaActual = Date.now(); // ID único temporal basado en timestamp
        }

        const exito = await guardarDocumento(idNotaActual, tF.innerHTML, eF.innerHTML, [], "nota", "letter");
        if (exito) {
            mostrarToast("Nota guardada localmente");
            listarNotas();
            localStorage.removeItem('ret_c_title');
            localStorage.removeItem('ret_c_body');
        } else {
            mostrarToast("Error al guardar nota");
        }
    });

    document.getElementById('btn-nuevo')?.addEventListener('click', () => {
        idNotaActual = null;
        document.getElementById('editor-title').innerHTML = "";
        document.getElementById('editor').innerHTML = "";
        localStorage.removeItem('ret_c_title');
        localStorage.removeItem('ret_c_body');
        actualizarContadores();
        sidebar?.classList.add('hidden');
        if (btnToggle) { btnToggle.style.color = '#ffca28'; btnToggle.style.borderColor = 'rgba(255,255,255,0.15)'; }
    });

    // 8. AUTOGUARDADO PREVENTIVO EN CALIENTE CONTRA APAGONES
    document.getElementById('editor-title')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });
    document.getElementById('editor')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });

    restaurarCache();
});

// FUNCIONES COMPLEMENTARIAS DE HISTORIAL Y CACHÉ
async function listarNotas() {
    const lista = document.getElementById('document-list');
    if (!lista) return;
    lista.innerHTML = "";
    
    const notas = await obtenerDocumentos();
    notas.forEach(nota => {
        const div = document.createElement('div');
        div.className = "document-list-item";

        const tmpB = document.createElement('div'); tmpB.innerHTML = nota.contenido; const plainB = tmpB.innerText.trim();
        const tmpT = document.createElement('div'); tmpT.innerHTML = nota.titulo || ""; const plainT = tmpT.innerText.trim();

        const pTitle = plainT ? plainT : (plainB ? plainB.substring(0, 18) + "..." : "Sin Título");
        const pBody = plainB ? plainB : "Sin contenido adicional.";

        div.innerHTML = `<div class='doc-item-title'>📄 ${pTitle}</div><div class='doc-item-body'>${pBody}</div>`;
        
        div.addEventListener('click', () => {
            idNotaActual = nota.id;
            document.getElementById('editor-title').innerHTML = nota.titulo;
            document.getElementById('editor').innerHTML = nota.contenido;
            actualizarContadores();
            cacheTemporal();
            document.getElementById('sidebar')?.classList.add('hidden');
            const b = document.getElementById('btn-toggle-pestaña');
            if (b) { b.style.color = '#ffca28'; b.style.borderColor = 'rgba(255,255,255,0.15)'; }
        });

        lista.appendChild(div);
    });
}

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
    const st = document.getElementById('stats-text');
    const dt = document.getElementById('lbl-file-dates');
    if (ed && st) st.textContent = "Caracteres: " + ed.innerText.trim().length;
    if (dt) dt.textContent = idNotaActual !== null ? "Editando Nota #" + idNotaActual : "Nota Nueva en RAM";
}

// Ventana flotante global reutilizable por otros módulos
window.mostrarToast = function(m) {
    const t = document.getElementById('toast-notif');
    if (!t) return;
    t.textContent = m;
    t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); }, 2500);
};
