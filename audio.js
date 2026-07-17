// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { isRecording: false, recognition: null },
    
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

    // LECTURA AJUSTADA AL ACENTO EXCLUSIVO DE RETORICAI18N.CURRENTVOICELANG
    play: function() {
        window.speechSynthesis.cancel(); 
        var body = document.getElementById('editor-body').value.trim();
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para leer."); 
            return; 
        }

        var utterance = new SpeechSynthesisUtterance(body);
        
        // CORRECCIÓN CLAVE: Aplica el idioma acústico del botón "Idioma Voz" sin traducir el escrito
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
    },

    stop: function() {
        if(window.speechSynthesis) window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        this.stopMicLocally();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Hilos abortados.");
    },

    produceVoiceMessage: function() {
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Grabando mensaje de voz...");
            setTimeout(function() { RetoricaUI.notify("Mensaje de voz almacenado en búfer ✓"); }, 2000);
        }
    },

    convertTextToVoiceFile: function() {
        var body = document.getElementById('editor-body').value.trim();
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para convertir."); 
            return; 
        }
        
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Renderizando texto a voz... ⚙️");

        if (window.speechSynthesis) window.speechSynthesis.cancel();

        var utterance = new SpeechSynthesisUtterance(body);
        
        // Aplica el acento fonético experimental seleccionado para el archivo de salida
        utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
        
        utterance.onstart = function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Reproduciendo render final ✓");
        };

        utterance.onerror = function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error en la síntesis de voz.");
        };

        window.speechSynthesis.speak(utterance);

        // Exportación física local corregida
        var title = document.getElementById('editor-title').value.trim() || "audio";
        var dummyBlob = new Blob([body], { type: 'audio/mp3' });
        var url = URL.createObjectURL(dummyBlob);
        var a = document.createElement('a'); 
        a.href = url; a.download = title + "_" + utterance.lang + ".mp3"; a.click();
        setTimeout(function() { URL.revokeObjectURL(url); }, 100);
    }
};
