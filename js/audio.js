// --- MÓDULO DE PROCESAMIENTO DE AUDIO, DICTADO Y LECTURA ---

let reconocimiento = null;

export function iniciarDictado(idiomaDictado, alRecibirTexto, alTerminar) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tu navegador o dispositivo no soporta el dictado por voz de Google.");
        alTerminar();
        return;
    }

    reconocimiento = new SpeechRecognition();
    reconocimiento.continuous = true;
    reconocimiento.interimResults = false; // Desactivado para evitar mezclas o textos revueltos provisionales
    reconocimiento.lang = idiomaDictado;

    reconocimiento.onresult = (evento) => {
        let fragmentoFinal = "";
        for (let i = evento.resultIndex; i < evento.results.length; ++i) {
            if (evento.results[i].isFinal) {
                fragmentoFinal += evento.results[i][0].transcript;
            }
        }
        if (fragmentoFinal) {
            alRecibirTexto(fragmentoFinal.trim());
        }
    };

    reconocimiento.onerror = (evento) => {
        console.error("Error en reconocimiento de voz:", evento.error);
        if (evento.error === 'no-speech') {
            console.log("No se detectó habla activa.");
        } else {
            alTerminar();
        }
    };

    reconocimiento.onend = () => {
        alTerminar();
    };

    reconocimiento.start();
}

export function detenerDictado() {
    if (reconocimiento) {
        reconocimiento.stop();
        reconocimiento = null;
    }
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
