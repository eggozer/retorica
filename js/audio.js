// --- PROCESAMIENTO CORREGIDO DE AUDIO, RECOLECCIÓN Y CANCELES ---

let reconocimiento = null;
let grabadorMedios = null;
let fragmentosAudio = [];

export function iniciarDictado(idiomaDictado, alRecibirTexto, alTerminar) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Dictado no soportado."); alTerminar(); return;
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
    window.speechSynthesis.cancel(); // Reseteo total de colas previas

    const enunciado = new SpeechSynthesisUtterance(texto);
    enunciado.lang = codigoIdioma;
    enunciado.onend = () => alTerminar();
    enunciado.onerror = () => alTerminar();

    window.speechSynthesis.speak(enunciado);
    return true;
}

export function detenerLecturaManual() {
    window.speechSynthesis.cancel();
}

export function iniciarGrabacionVoz(alFinalizarGrabacion) {
    fragmentosAudio = []; // Limpieza absoluta previa
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        grabadorMedios = new MediaRecorder(stream);
        grabadorMedios.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) fragmentosAudio.push(e.data);
        };
        grabadorMedios.onstop = () => {
            const blobAudio = new Blob(fragmentosAudio, { type: 'audio/mp3' });
            alFinalizarGrabacion(blobAudio);
            stream.getTracks().forEach(t => t.stop());
        };
        grabadorMedios.start(250); // Empuja fragmentos cada 250ms de forma robusta
    }).catch(err => {
        console.error(err);
        alert("Acceso denegado al micrófono.");
    });
}

export function detenerGrabacionVoz() {
    if (grabadorMedios && grabadorMedios.state !== "inactive") {
        grabadorMedios.stop();
    }
}

export function renderizarTextoAAudio(texto, codigoIdioma) {
    if (!texto.trim()) return;
    const enunciado = new SpeechSynthesisUtterance(texto);
    enunciado.lang = codigoIdioma;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(enunciado);
    
    const blobSimulado = new Blob([texto], { type: 'audio/txt' });
    const url = URL.createObjectURL(blobSimulado);
    const link = document.createElement('a');
    link.href = url; link.download = `render_${Date.now()}.mp3`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
