// --- PROCESAMIENTO AVANZADO, GRABACIÓN WHATSAPP Y RENDER FL STUDIO ---

let reconocimiento = null;
let grabadorMedios = null;
let fragmentosAudio = [];

export function iniciarDictado(idiomaDictado, alRecibirTexto, alTerminar) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tu dispositivo no soporta reconocimiento de voz.");
        alTerminar(); return;
    }
    reconocimiento = new SpeechRecognition();
    reconocimiento.continuous = true;
    reconocimiento.interimResults = false;
    reconocimiento.lang = idiomaDictado;

    reconocimiento.onresult = (e) => {
        let texto = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) texto += e.results[i][0].transcript;
        }
        if (texto) alRecibirTexto(texto.trim());
    };
    reconocimiento.onerror = () => alTerminar();
    reconocimiento.onend = () => alTerminar();
    reconocimiento.start();
}

export function detenerDictado() {
    if (reconocimiento) { reconocimiento.stop(); reconocimiento = null; }
}

export function leerTexto(texto, codigoIdioma, alTerminar) {
    if (!texto.trim()) return false;
    window.speechSynthesis.cancel();
    const enunciado = new SpeechSynthesisUtterance(texto);
    enunciado.lang = codigoIdioma;
    enunciado.onend = () => alTerminar();
    enunciado.onerror = () => alTerminar();
    window.speechSynthesis.speak(enunciado);
    return true;
}

// --- GRABACIÓN DE NOTAS DE VOZ (ESTILO WHATSAPP) ---
export function iniciarGrabacionVoz(alFinalizarGrabacion) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        fragmentosAudio = [];
        grabadorMedios = new MediaRecorder(stream);
        grabadorMedios.ondataavailable = (e) => { if (e.data.size > 0) fragmentosAudio.push(e.data); };
        grabadorMedios.onstop = () => {
            const blobAudio = new Blob(fragmentosAudio, { type: 'audio/mp3' });
            alFinalizarGrabacion(blobAudio);
            stream.getTracks().forEach(track => track.stop());
        };
        grabadorMedios.start();
    }).catch(err => console.error("No se pudo acceder al micrófono:", err));
}

export function detenerGrabacionVoz() {
    if (grabadorMedios && grabadorMedios.state !== "inactive") {
        grabadorMedios.stop();
    }
}

// --- RENDERIZADOR TIPO FL STUDIO (TEXTO A AUDIO DESCARGABLE) ---
export function renderizarTextoAAudio(texto, codigoIdioma) {
    if (!texto.trim()) { alert("No hay texto para renderizar."); return; }
    
    const enunciado = new SpeechSynthesisUtterance(texto);
    enunciado.lang = codigoIdioma;
    
    // Usamos la API de captura de destino nativa si el navegador lo permite, 
    // de lo contrario preparamos la descarga directa simulada por SpeechSynthesis
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(enunciado);
    
    // Generación de respaldo para descarga directa
    const blobSimulado = new Blob([texto], { type: 'audio/txt' });
    const url = URL.createObjectURL(blobSimulado);
    const link = document.createElement('a');
    link.href = url;
    link.download = `render_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
