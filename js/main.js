// js/main.js

// Importaciones unificadas de tu arquitectura modular original
import { initDB, guardarDocumento, obtenerDocumentos } from './storage.js';
import { iniciarDictado, detenerDictado, leerTexto, iniciarGrabacionVoz, detenerGrabacionVoz } from './audio.js';

var idNotaActual = null;
var escuchandoDictado = false;
var grabandoNotaVoz = false;

// Los 30 idiomas solicitados para alimentar dinámicamente tus combos
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
    const btnMainGuardar = document.getElementById('btn-main-guardar');
    const dropdownFormatos = document.getElementById('dropdown-formatos');
    const contenedorPrincipal = document.getElementById('contenedor-principal');

    // 1. POBLADO EXCLUSIVO DE LOS COMBOS DE IDIOMAS EN LA TIRA HORIZONTAL
    if (selectApp && selectVoice) {
        selectApp.innerHTML = "";
        selectVoice.innerHTML = "";
        listaIdiomas.forEach(idioma => {
            const opt1 = document.createElement('option');
            opt1.value = idioma.code;
            opt1.textContent = "📝 " + idioma.name;
            selectApp.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = idioma.code;
            opt2.textContent = "🔊 " + idioma.name;
            selectVoice.appendChild(opt2);
        });
    }

    // 2. LOGICA DEL BOTÓN DESPLEGABLE "GUARDAR TODO"
    btnMainGuardar?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownFormatos.classList.toggle('show');
        if (dropdownFormatos.classList.contains('show')) {
            contenedorPrincipal.style.paddingTop = "146px"; // Baja el área de trabajo dinámicamente
        } else {
            contenedorPrincipal.style.paddingTop = "110px"; // Recupera margen original
        }
    });

    document.addEventListener('click', () => {
        if (dropdownFormatos && dropdownFormatos.classList.contains('show')) {
            dropdownFormatos.classList.remove('show');
            contenedorPrincipal.style.paddingTop = "110px";
        }
    });

    dropdownFormatos?.addEventListener('click', (e) => e.stopPropagation());

    // 3. FUNCIÓN APERTURA DE ARCHIVOS HTML LOCALES (INDICACIÓN NUEVA)
    const btnTriggerAbrir = document.getElementById('btn-trigger-abrir');
    const inputAbrirArchivo = document.getElementById('input-abrir-archivo');

    btnTriggerAbrir?.addEventListener('click', () => inputAbrirArchivo?.click());

    inputAbrirArchivo?.addEventListener('change', function(e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function(evt) {
            const contenidoBruto = evt.target.result;
            
            // Creamos un elemento temporal en memoria para limpiar estructuras raras
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contenidoBruto;
            
            // Buscamos si tiene el formato interno de Retórica o si extraemos el texto plano limpio
            const tituloRescatado = tempDiv.querySelector('#editor-title')?.innerHTML || archivo.name.replace('.html', '');
            const cuerpoRescatado = tempDiv.querySelector('#editor')?.innerHTML || tempDiv.innerHTML;

            document.getElementById('editor-title').innerHTML = tituloRescatado;
            document.getElementById('editor').innerHTML = cuerpoRescatado;

            idNotaActual = Date.now(); // Le asignamos un ID local para re-incorporarla
            actualizarContadores();
            cacheTemporal();

            sidebar?.classList.add('hidden');
            if (btnToggle) { btnToggle.style.color = '#ffca28'; btnToggle.style.borderColor = 'rgba(255,255,255,0.15)'; }
            mostrarToast("Archivo cargado con éxito en el editor");
        };
        lector.readAsText(archivo);
    });

    // 4. CONTROL DEL MENÚ DE LA TUERCA (SIDEBAR INTERRUPTOR)
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            btnToggle.style.color = sidebar.classList.contains('hidden') ? '#ffca28' : '#ef4444';
            btnToggle.style.borderColor = sidebar.classList.contains('hidden') ? 'rgba(255,255,255,0.15)' : '#ef4444';
        });
    }

    // GESTOS TÁCTILES CONTROLADOS: LIMITADOS AL MARGEN DE 35 PIXÉLES ANTI-TRABAS
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

    // 5. BOTONES DESHACER / REHACER Y CONTROL TIPOGRÁFICO
    document.getElementById('btn-undo')?.addEventListener('click', () => { document.execCommand('undo', false, null); cacheTemporal(); });
    document.getElementById('btn-redo')?.addEventListener('click', () => { document.execCommand('redo', false, null); cacheTemporal(); });

    document.getElementById('font-family-select')?.addEventListener('change', (e) => {
        const ed = document.getElementById('editor');
        const tit = document.getElementById('editor-title');
        if (ed && tit) {
            ed.classList.remove('font-sans', 'font-serif', 'font-mono'); ed.classList.add(e.target.value);
            tit.classList.remove('font-sans', 'font-serif', 'font-mono'); tit.classList.add(e.target.value);
        }
    });

    // ALTERNADOR DE TEMAS (CLARO Y OSCURO)
    const btnTema = document.getElementById('btn-toggle-tema');
    if (localStorage.getItem('retorica_theme') === 'light') { document.body.classList.add('light-theme'); }
    btnTema?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('retorica_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // 6. ENLACE DE HERRAMIENTAS AUDIO MÓDULO (DICTADO Y LECTURA)
    document.getElementById('btn-mic')?.addEventListener('click', function() {
        const idioma = selectApp ? selectApp.value : 'es-MX';
        if (!escuchandoDictado) {
            escuchandoDictado = true;
            this.style.background = "#ef4444"; this.style.color = "#ffffff";
            mostrarToast("Dictado por voz iniciado...");
            iniciarDictado(idioma, (texto) => {
                const ed = document.getElementById('editor');
                if (ed) { ed.focus(); document.execCommand('insertText', false, texto + ' '); cacheTemporal(); actualizarContadores(); }
            }, () => {
                escuchandoDictado = false; this.style.background = ""; this.style.color = "";
            });
        } else {
            escuchandoDictado = false; detenerDictado(); this.style.background = ""; this.style.color = "";
            mostrarToast("Dictado detenido");
        }
    });

    document.getElementById('btn-lectura')?.addEventListener('click', () => {
        const ed = document.getElementById('editor');
        const voz = selectVoice ? selectVoice.value : 'es-MX';
        if (ed && ed.innerText.trim()) {
            mostrarToast("Leyendo texto en voz alta...");
            leerTexto(ed.innerText, voz, () => mostrarToast("Lectura concluida"));
        }
    });

    // 7. FUNCIÓN MENSAJE DE VOZ (INDICACIÓN NUEVA)
    document.getElementById('btn-msg-voz')?.addEventListener('click', function() {
        if (!grabandoNotaVoz) {
            grabandoNotaVoz = true;
            this.style.background = "#b91c1c"; this.style.color = "#ffffff";
            mostrarToast("Grabando archivo de audio directo...");
            iniciarGrabacionVoz((blobAudio) => {
                mostrarToast("Audio capturado con éxito");
                console.log("Blob listo para persistencia local: ", blobAudio);
            });
        } else {
            grabandoNotaVoz = false;
            detenerGrabacionVoz();
            this.style.background = ""; this.style.color = "";
            mostrarToast("Grabación finalizada");
        }
    });

    document.getElementById('btn-render-fl')?.addEventListener('click', () => mostrarToast("Procesando mezcla de audio..."));

    // 8. INICIALIZADOR DE LA BASE DE DATOS LOCAL
    try {
        await initDB();
        listarNotas();
    } catch (err) {
        console.error("Fallo IndexedDB:", err);
    }

    // CONTROLADORES DE GUARDADO DESDE EL DESPLEGABLE HORIZONTAL
    document.getElementById('save-native-html')?.addEventListener('click', async () => {
        const t = document.getElementById('editor-title');
        const e = document.getElementById('editor');
        if (!t || !e) return;

        if (idNotaActual === null) idNotaActual = Date.now();

        const completado = await guardarDocumento(idNotaActual, t.innerHTML, e.innerHTML, [], "nota", "letter");
        if (completado) {
            mostrarToast("Nota indexada en la Base de Datos");
            listarNotas();
            // Disparamos la descarga del HTML físico de respaldo automáticamente hacia tu teléfono
            const estructuraHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div id="editor-title">${t.innerHTML}</div><div id="editor">${e.innerHTML}</div></body></html>`;
            const blob = new Blob([estructuraHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${t.innerText.trim() || 'nota-retorica'}.html`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            
            localStorage.removeItem('ret_c_title'); localStorage.removeItem('ret_c_body');
            dropdownFormatos.classList.remove('show'); contenedorPrincipal.style.paddingTop = "110px";
        }
    });

    // EXPORTADORES ORIGINALES COMPATIBILIZADOS
    document.getElementById('export-pdf')?.addEventListener('click', () => {
        html2pdf().from(document.getElementById('editor')).save('documento.pdf');
        dropdownFormatos.classList.remove('show'); contenedorPrincipal.style.paddingTop = "110px";
    });
    document.getElementById('export-pdf-edit')?.addEventListener('click', () => {
        html2pdf().from(document.getElementById('editor')).save('documento-editable.pdf');
        dropdownFormatos.classList.remove('show'); contenedorPrincipal.style.paddingTop = "110px";
    });
    document.getElementById('export-doc')?.addEventListener('click', () => {
        const html = document.getElementById('editor').innerHTML;
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = 'retorica-export.doc'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        dropdownFormatos.classList.remove('show'); contenedorPrincipal.style.paddingTop = "110px";
    });

    document.getElementById('btn-nuevo')?.addEventListener('click', () => {
        idNotaActual = null;
        document.getElementById('editor-title').innerHTML = "";
        document.getElementById('editor').innerHTML = "";
        localStorage.removeItem('ret_c_title'); localStorage.removeItem('ret_c_body');
        actualizarContadores();
        sidebar?.classList.add('hidden');
        if (btnToggle) { btnToggle.style.color = '#ffca28'; btnToggle.style.borderColor = 'rgba(255,255,255,0.15)'; }
    });

    // 9. COPIA DE SEGURIDAD PREVENTIVA EN CALIENTE CONTRA APAGONES
    document.getElementById('editor-title')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });
    document.getElementById('editor')?.addEventListener('input', () => { cacheTemporal(); actualizarContadores(); });

    restaurarCache();
});

async function listarNotas() {
    const lista = document.getElementById('document-list');
    if (!lista) return; lista.innerHTML = "";
    
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
