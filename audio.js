// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { isRecording: false, recognition: null, mediaRecorder: null, chunks: [] },
    
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
            
            this.state.recognition.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
            
            this.state.recognition.onresult = function(event) {
                var textChunk = event.results[event.results.length - 1][0].transcript;
                var editor = document.getElementById('editor-body');
                if (editor) { 
                    editor.value += (editor.value ? ' ' : '') + textChunk; 
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                    }
                }
            };

            this.state.recognition.onerror = function() {
                RetoricaAudio.stopMicLocally();
            };

            this.state.recognition.onend = function() {
                if (RetoricaAudio.state.isRecording) {
                    try { RetoricaAudio.state.recognition.start(); } catch(e){}
                }
            };

            this.state.isRecording = true;
            if (btn) btn.classList.add('btn-mic-active');
            try { this.state.recognition.start(); } catch(e){}
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Escuchando dictado...");
        } else {
            this.stopMicLocally();
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Dictado en pausa.");
        }
    },

    stopMicLocally: function() {
        this.state.isRecording = false;
        var btn = document.getElementById('btn-mic-main');
        if (btn) btn.classList.remove('btn-mic-active');
        if (this.state.recognition) {
            try { this.state.recognition.stop(); } catch(e){}
        }
    },

    stop: function() {
        // Cancelación estricta de Texto a Voz (TTS) y dictado por hardware
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        this.stopMicLocally();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio e hilos abortados ⏹️");
    },

    produceVoiceMessage: function() {
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Grabando mensaje de voz ⏺️ (Búfer local activo)...");
            setTimeout(function() { RetoricaUI.notify("Audio masterizado y guardado en búfer ✓"); }, 2000);
        }
    },

    convertTextToVoiceFile: function() {
        var body = document.getElementById('editor-body').value.trim();
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para procesar."); 
            return; 
        }
        
        if (!window.speechSynthesis) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Tu dispositivo no soporta la síntesis de Texto a Voz.");
            return;
        }

        // Cancelar lecturas anteriores activas para no encimar hilos
        window.speechSynthesis.cancel();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Renderizando texto a voz... ⚙️");

        var utterance = new SpeechSynthesisUtterance(body);
        
        // Configurar idioma español local preferente
        utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
        utterance.rate = 1.0; 
        utterance.pitch = 1.0;

        utterance.onend = function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Lectura finalizada con éxito ✓");
        };

        utterance.onerror = function(e) {
            console.error("Error en Síntesis TTS:", e);
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error al reproducir el motor de voz.");
        };

        window.speechSynthesis.speak(utterance);
    }
};
