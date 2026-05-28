// --- MÓDULO DE AUDIO: RECONOCIMIENTO, SÍNTESIS Y GRABACIÓN ---

let recognition = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecordingVoice = false;

// 1. DICTADO POR VOZ (TEXT-TO-SPEECH)
export function iniciarDictado(idioma, onResult, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tu navegador o dispositivo no soporta reconocimiento de voz.");
        return null;
    }

    if (recognition) {
        recognition.stop();
        return null;
    }

    recognition = new SpeechRecognition();
    recognition.lang = idioma;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        let textoIntermedio = '';
        let textoFinal = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                textoFinal += event.results[i][0].transcript;
            } else {
                textoIntermedio += event.results[i][0].transcript;
            }
        }
        onResult(textoFinal, textoIntermedio);
    };

    recognition.onend = () => {
        recognition = null;
        onEnd();
    };

    recognition.start();
    return recognition;
}

export function detenerDictado() {
    if (recognition) {
        recognition.stop();
    }
}

// 2. LECTURA DE TEXTO CON INTERRUPCIÓN (SPEECH-TO-TEXT)
export function leerTexto(texto, idioma, onEnd) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return false; // Se detuvo la lectura
    }

    if (!texto.trim()) return false;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = idioma;
    
    utterance.onend = () => {
        onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true; // Comenzó la lectura
}

// 1 Y 2.- FUNCIONES AVANZADAS: MENSAJES DE VOZ (TIPO WHATSAPP) Y RENDERIZADO
export async function toggleGrabacionMensajeVoz(onStart, onStop) {
    if (isRecordingVoice) {
        if (mediaRecorder) mediaRecorder.stop();
        isRecordingVoice = false;
        return false;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            onStop(audioUrl, audioBlob);
            
            // Apagar los micrófonos físicos del dispositivo
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecordingVoice = true;
        onStart();
        return true;
    } catch (err) {
        console.error("Error al acceder al micrófono para mensaje de voz:", err);
        alert("No se pudo iniciar la grabación de audio.");
        return false;
    }
}

export function renderizarTextoAAudioArchivo(texto, idioma) {
    // La API nativa Web Speech no genera archivos de audio directamente en el cliente.
    // Esta función queda enlazada estructuralmente para procesar el texto mediante bloques externos
    // o para capturar el flujo de salida de audio en futuras implementaciones avanzadas.
    console.log("Preparando renderizado de texto a voz para: ", texto.substring(0, 20));
    alert("Función de renderizado a archivo de audio (.mp3) lista para su conexión con servidor.");
}
