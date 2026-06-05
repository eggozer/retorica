/**
 * Retórica - Módulo Avanzado de Audio, Síntesis de Voz y Captura de Buffers.
 */
let recognitionInstance = null;
let grabadorMedias = null;[cite: 12]
let segmentosAudio = [];[cite: 12]
let estaGrabandoVoz = false;[cite: 12]

// Diccionario de Archivos de Voz Almacenados en Memoria Volátil para su renderizado
export const BIBLIOTECA_VOZ_INTERNA = {};

export function iniciarDictado(idioma, onResult, onEnd) {[cite: 12]
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;[cite: 12]
    if (!SpeechRecognition) {[cite: 12]
        alert("El motor de dictado no es compatible con el navegador de este dispositivo.");[cite: 12]
        return null;[cite: 12]
    }

    if (recognitionInstance) {[cite: 12]
        recognitionInstance.stop();[cite: 12]
        return null;[cite: 12]
    }

    recognitionInstance = new SpeechRecognition();[cite: 12]
    recognitionInstance.lang = idioma;[cite: 12]
    recognitionInstance.continuous = true;[cite: 12]
    recognitionInstance.interimResults = false;[cite: 12]

    recognitionInstance.onresult = (event) => {[cite: 12]
        let textoProcesado = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {[cite: 12]
            if (event.results[i].isFinal) {[cite: 12]
                textoProcesado += event.results[i][0].transcript;[cite: 12]
            }
        }
        onResult(textoProcesado);
    };

    recognitionInstance.onend = () => {[cite: 12]
        recognitionInstance = null;[cite: 12]
        onEnd();[cite: 12]
    };

    recognitionInstance.start();[cite: 12]
    return recognitionInstance;[cite: 12]
}

export function detenerDictado() {[cite: 12]
    if (recognitionInstance) recognitionInstance.stop();[cite: 12]
}

export function operarLecturaTexto(texto, idioma, onStart, onEnd) {
    if (window.speechSynthesis.speaking) {[cite: 12]
        window.speechSynthesis.cancel();[cite: 12]
        onEnd();
        return false;[cite: 12]
    }

    if (!texto.trim()) return false;[cite: 12]

    const expresionUtterance = new SpeechSynthesisUtterance(texto);[cite: 12]
    expresionUtterance.lang = idioma;[cite: 12]
    
    expresionUtterance.onstart = () => onStart();
    expresionUtterance.onend = () => onEnd();[cite: 12]

    window.speechSynthesis.speak(expresionUtterance);[cite: 12]
    return true;[cite: 12]
}

/**
 * Captura mensajes de voz locales guardándolos de forma digital interna[cite: 12].
 */
export async function conmutarGrabacionMensajeVoz(idDoc, onStart, onStop) {
    if (estaGrabandoVoz) {[cite: 12]
        if (grabadorMedias) grabadorMedias.stop();[cite: 12]
        estaGrabandoVoz = false;[cite: 12]
        return false;[cite: 12]
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });[cite: 12]
        segmentosAudio = [];[cite: 12]
        grabadorMedias = new MediaRecorder(stream);[cite: 12]

        grabadorMedias.ondataavailable = (event) => {[cite: 12]
            if (event.data.size > 0) segmentosAudio.push(event.data);[cite: 12]
        };

        grabadorMedias.onstop = () => {[cite: 12]
            const audioBlob = new Blob(segmentosAudio, { type: 'audio/mp3' });[cite: 12]
            const audioUrl = URL.createObjectURL(audioBlob);[cite: 12]
            
            // Asignación directa a biblioteca en memoria atada al guion actual
            BIBLIOTECA_VOZ_INTERNA[idDoc] = { url: audioUrl, blob: audioBlob };
            onStop(audioUrl);
            
            stream.getTracks().forEach(track => track.stop());[cite: 12]
        };

        grabadorMedias.start();[cite: 12]
        estaGrabandoVoz = true;[cite: 12]
        onStart();
        return true;[cite: 12]
    } catch (err) {
        console.error("Fallo de acceso al hardware de audio: ", err);[cite: 12]
        return false;[cite: 12]
    }
}

/**
 * Simulación del renderizado estructural de texto a archivo de voz descargable/procesable[cite: 12].
 */
export function renderizarTextoAAudioArchivoFisico(texto, idioma, idDoc) {
    console.log("Compilando síntesis para documento ID: ", idDoc);[cite: 12]
    if (!texto.trim()) return false;
    
    // Almacenamiento simulado de renderizado
    const blobSimulado = new Blob([texto], { type: 'audio/mp3' });
    const urlSimulada = URL.createObjectURL(blobSimulado);
    BIBLIOTECA_VOZ_INTERNA[`render_${idDoc}`] = { url: urlSimulada, blob: blobSimulado };
    return urlSimulada;
}
