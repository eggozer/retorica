// Motor de Audio y Voz para Retórica (Compatibilidad ES5 / Android 5+)

var AudioEngine = {
    recognition: null,
    synth: window.speechSynthesis || null,
    isRecording: false,
    isSpeaking: false,
    audioContext: null,

    // 1. Inicialización de Reconocimiento de Voz (STT)
    initSpeechToText: function(onResultCallback, onErrorCallback) {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            if (onErrorCallback) onErrorCallback("El dictado no es compatible con este navegador/WebView.");
            return false;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = navigator.language || 'es-MX';

        this.recognition.onresult = function(event) {
            var transcript = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (onResultCallback) onResultCallback(transcript);
        };

        this.recognition.onerror = function(event) {
            if (onErrorCallback) onErrorCallback("Error en dictado: " + event.error);
        };

        return true;
    },

    toggleRecording: function(btnElement, onResultCallback, onErrorCallback) {
        if (!this.recognition && !this.initSpeechToText(onResultCallback, onErrorCallback)) {
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            if (btnElement) btnElement.classList.remove('active');
        } else {
            this.recognition.start();
            this.isRecording = true;
            if (btnElement) btnElement.classList.add('active');
        }
    },

    // 2. Lectura de Texto (TTS) por Bloques de Párrafos
    speakText: function(text, btnElement, onEndCallback) {
        if (!this.synth) {
            alert("La síntesis de voz no está disponible en este dispositivo.");
            return;
        }

        // Cancelar lecturas previas
        this.synth.cancel();

        if (!text || text.trim() === '') return;

        var self = this;
        // Dividir por párrafos para prevenir fallos de búfer en Android 5
        var paragraphs = text.split(/\n+/);
        var currentIdx = 0;

        this.isSpeaking = true;
        if (btnElement) btnElement.classList.add('active');

        function speakNext() {
            if (currentIdx >= paragraphs.length || !self.isSpeaking) {
                self.stopSpeaking(btnElement);
                if (onEndCallback) onEndCallback();
                return;
            }

            var chunk = paragraphs[currentIdx].trim();
            if (chunk === '') {
                currentIdx++;
                speakNext();
                return;
            }

            var utterance = new SpeechSynthesisUtterance(chunk);
            utterance.lang = navigator.language || 'es-MX';

            utterance.onend = function() {
                currentIdx++;
                speakNext();
            };

            utterance.onerror = function() {
                currentIdx++;
                speakNext();
            };

            self.synth.speak(utterance);
        }

        speakNext();
    },

    // 3. Detener Lectura y Cancelar Procesos
    stopSpeaking: function(btnElement) {
        if (this.synth) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
        if (btnElement) btnElement.classList.remove('active');
    },

    // 4. Conversión/Generación de Archivo WAV Local (Web Audio API)
    generateWavAudio: function(text, sampleRate) {
        var rate = sampleRate || 44100;
        var duration = Math.max(1, text.length * 0.08); // Estimación de duración
        var numSamples = Math.floor(rate * duration);
        
        var buffer = new ArrayBuffer(44 + numSamples * 2);
        var view = new DataView(buffer);

        // Cabecera RIFF / WAV
        this._writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        this._writeString(view, 8, 'WAVE');
        this._writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM Mono
        view.setUint16(22, 1, true);
        view.setUint32(24, rate, true);
        view.setUint32(28, rate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        this._writeString(view, 36, 'data');
        view.setUint32(40, numSamples * 2, true);

        // Generar un tono audible de prueba (Sintetizador básico)
        for (var i = 0; i < numSamples; i++) {
            var sample = Math.sin(i * 0.05) * 0.2 * 32767;
            view.setInt16(44 + i * 2, sample, true);
        }

        var blob = new Blob([buffer], { type: 'audio/wav' });
        var url = URL.createObjectURL(blob);
        
        var a = document.createElement('a');
        a.href = url;
        a.download = 'retorica-audio.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    _writeString: function(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
};
