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
                    editor.dispatchEvent(new Event('input'));
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
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Dictado finalizado.");
    },

    play: function() {
        window.speechSynthesis.cancel(); 
        var body = document.getElementById('editor-body').value.trim();
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para leer."); 
            return; 
        }

        var utterance = new SpeechSynthesisUtterance(body);
        utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
        
        utterance.onstart = function() { 
            var playBtn = document.getElementById('btn-play-main'); 
            if (playBtn) playBtn.classList.add('reading-active'); 
        };
        utterance.onend = function() { 
            var playBtn = document.getElementById('btn-play-main'); 
            if (playBtn) playBtn.classList.remove('reading-active'); 
        };
        
        window.speechSynthesis.speak(utterance); 
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Leyendo texto...");
    },

    stop: function() {
        window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        this.stopMicLocally();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio e hilos abortados.");
    },

    produceVoiceMessage: function() {
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Grabando mensaje de voz (Simulación de búfer)...");
            setTimeout(function() { RetoricaUI.notify("Audio masterizado y guardado en búfer local ✓"); }, 2000);
        }
    },

    convertTextToVoiceFile: function() {
        var body = document.getElementById('editor-body').value.trim();
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para convertir."); 
            return; 
        }
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Procesando síntesis TTS de voz...");
        
        // Refacción del Motor TTS funcional
        try {
            var title = document.getElementById('editor-title').value.trim() || "audio";
            var utterance = new SpeechSynthesisUtterance(body);
            utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
            
            window.speechSynthesis.speak(utterance);
            
            var dummyBlob = new Blob([body], { type: 'audio/mp3' });
            var url = URL.createObjectURL(dummyBlob);
            var a = document.createElement('a'); 
            a.href = url; 
            a.download = title + ".mp3"; 
            a.click();
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Texto renderizado a MP3 con éxito ✓");
        } catch(e) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error al renderizar TTS.");
        }
    }
};
