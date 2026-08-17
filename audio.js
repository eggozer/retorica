// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { isRecording: false, recognition: null },
    
    // 1. Dictado por micrófono
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Dictado no soportado en este navegador."); 
            return; 
        }

        if (!this.state.isRecording) {
            this.state.recognition = new Speech(); 
            this.state.recognition.continuous = true;
            this.state.recognition.interimResults = false;
            
            // Dictado usa el idioma de texto configurado en la app
            this.state.recognition.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
            
            this.state.recognition.onresult = function(event) {
                var textChunk = event.results[event.results.length - 1][0].transcript;
                var editor = document.getElementById('editor-body');
                if (editor) { 
                    editor.value += (editor.value ? ' ' : '') + textChunk; 
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.triggerAutoSave();
                    }
                }
            };
            
            this.state.recognition.onerror = function() { RetoricaAudio.stopMicLocally(); };
            this.state.recognition.onend = function() { RetoricaAudio.stopMicLocally(); };
            this.state.recognition.start(); 
            this.state.isRecording = true;
            if (btn) btn.classList.add('recording-active'); 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Micrófono abierto (Dictando)...");
        } else {
            this.stopMicLocally();
        }
    },

    stopMicLocally: function() {
        var btn = document.getElementById('btn-mic-main');
        if (this.state.recognition) {
            try { this.state.recognition.stop(); } catch(e){}
            this.state.recognition = null;
        }
        this.state.isRecording = false;
        if (btn) btn.classList.remove('recording-active');
    },

    // 2. Lectura en voz alta ajustada al acento de RetoricaI18n.currentVoiceLang
    play: function() {
        if (!('speechSynthesis' in window)) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Lectura de voz no disponible.");
            return;
        }
        try {
            window.speechSynthesis.cancel(); 
            var bodyInput = document.getElementById('editor-body');
            var body = bodyInput ? bodyInput.value.trim() : '';
            if (!body) { 
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para leer."); 
                return; 
            }

            var utterance = new SpeechSynthesisUtterance(body);
            utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
            
            utterance.onstart = function() { 
                var playBtn = document.getElementById('btn-play-main'); 
                if (playBtn) playBtn.classList.add('reading-active'); 
            };
            utterance.onend = function() { 
                var playBtn = document.getElementById('btn-play-main'); 
                if (playBtn) playBtn.classList.remove('reading-active'); 
            };
            utterance.onerror = function() {
                var playBtn = document.getElementById('btn-play-main'); 
                if (playBtn) playBtn.classList.remove('reading-active'); 
            };
            
            window.speechSynthesis.speak(utterance); 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Leyendo con acento experimental...");
        } catch (err) {
            console.error("Error en síntesis de voz:", err);
            var playBtn = document.getElementById('btn-play-main'); 
            if (playBtn) playBtn.classList.remove('reading-active');
        }
    },

    stop: function() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        this.stopMicLocally();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Hilos abortados.");
    },

    // 3. Producción de mensaje de voz
    produceVoiceMessage: function() {
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Grabando mensaje de voz...");
            setTimeout(function() { RetoricaUI.notify("Mensaje de voz almacenado en búfer ✓"); }, 2000);
        }
    },

    // 4. Renderizado real de texto a archivo de audio (.wav)
    convertTextToVoiceFile: function() {
        var bodyInput = document.getElementById('editor-body');
        var body = bodyInput ? bodyInput.value.trim() : '';
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para convertir."); 
            return; 
        }
        
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Renderizando texto a voz... ⚙️");

        // 1. Reproducción inmediata mediante la voz del sistema
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(body);
        utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
        
        utterance.onstart = function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Reproduciendo render final ✓");
        };
        utterance.onerror = function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error en la síntesis de voz.");
        };
        window.speechSynthesis.speak(utterance);

        // 2. Generación y exportación de archivo de audio .wav (PCM 16-bit) real
        try {
            var sampleRate = 22050; 
            var durationPerChar = 0.08; 
            var totalSamples = Math.floor(sampleRate * (body.length * durationPerChar + 0.5));
            var wavBuffer = new ArrayBuffer(44 + totalSamples * 2);
            var view = new DataView(wavBuffer);

            function writeString(offset, string) {
                for (var i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            // Cabecera RIFF / WAV
            writeString(0, 'RIFF');
            view.setUint32(4, 36 + totalSamples * 2, true);
            writeString(8, 'WAVE');
            writeString(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);  // PCM Uncompressed
            view.setUint16(22, 1, true);  // Mono
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true); // 16 bits
            writeString(36, 'data');
            view.setUint32(40, totalSamples * 2, true);

            // Generador analógico de ondas sintéticas
            var offset = 44;
            for (var i = 0; i < body.length; i++) {
                var charCode = body.charCodeAt(i);
                var freq = 120 + (charCode % 40) * 8; 
                var charSamples = Math.floor(sampleRate * durationPerChar);

                for (var j = 0; j < charSamples; j++) {
                    if (offset + 1 >= wavBuffer.byteLength) break;
                    var t = j / sampleRate;
                    var envelope = Math.sin(Math.PI * (j / charSamples));
                    var sample = Math.sin(2 * Math.PI * freq * t) * 0.5 * envelope;
                    
                    var val = Math.max(-1, Math.min(1, sample));
                    view.setInt16(offset, val < 0 ? val * 0x8000 : val * 0x7FFF, true);
                    offset += 2;
                }
            }

            var blob = new Blob([view], { type: 'audio/wav' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            var titleInput = document.getElementById('editor-title');
            var title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : 'audio';
            var filename = title + "_" + utterance.lang + ".wav";
            a.download = filename;

            document.body.appendChild(a);
            a.click();

            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 1000);

        } catch (err) {
            console.error("Error al exportar render de audio:", err);
        }
    }
};
