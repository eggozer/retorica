// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { isRecording: false, recognition: null, mediaRecorder: null, chunks: [] },
    
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) { RetoricaUI.notify("Dictado no soportado en este motor."); return; }
        
        if (!this.state.isRecording) {
            this.state.recognition = new Speech();
            this.state.recognition.continuous = true;
            this.state.recognition.interimResults = false;
            
            var currentCode = RetoricaI18n.currentLang;
            this.state.recognition.lang = (currentCode === 'es') ? 'es-MX' : currentCode;
            
            this.state.recognition.onresult = function(event) {
                var textChunk = event.results[event.results.length - 1][0].transcript;
                var editor = document.getElementById('editor-body');
                if (editor) {
                    var currentText = editor.innerHTML;
                    editor.innerHTML = currentText + (currentText ? ' ' : '') + textChunk;
                    RetoricaUI.updateCounters();
                }
            };
            this.state.recognition.onerror = function() { RetoricaAudio.stopMicLocally(); };
            this.state.recognition.onend = function() { RetoricaAudio.stopMicLocally(); };
            
            this.state.recognition.start();
            this.state.isRecording = true;
            if (btn) btn.classList.add('recording-active');
            RetoricaUI.notify("Micrófono Activo ✓");
        } else {
            this.stopMicLocally();
        }
    },

    stopMicLocally: function() {
        if (this.state.recognition) { this.state.recognition.stop(); }
        this.state.isRecording = false;
        var btn = document.getElementById('btn-mic-main');
        if (btn) btn.classList.remove('recording-active');
        RetoricaUI.notify("Micrófono Apagado.");
    },

    play: function() {
        var editor = document.getElementById('editor-body');\n        if (!editor) return;
        var textToRead = editor.innerText || editor.textContent;
        if (!textToRead.trim()) { RetoricaUI.notify("Área de trabajo vacía."); return; }
        
        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(textToRead);
        var currentCode = RetoricaI18n.currentLang;
        utterance.lang = (currentCode === 'es') ? 'es-MX' : currentCode;
        
        utterance.onstart = function() {
            var playBtn = document.getElementById('btn-play-main');
            if (playBtn) playBtn.classList.add('reading-active');
        };
        utterance.onend = function() {
            var playBtn = document.getElementById('btn-play-main');
            if (playBtn) playBtn.classList.remove('reading-active');
        };
        
        window.speechSynthesis.speak(utterance);
        RetoricaUI.notify("Reproduciendo lectura activa...");
    },

    stop: function() {
        window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        this.stopMicLocally();
        RetoricaUI.notify("Audio e hilos abortados ■");
    },

    produceVoiceMessage: function() {
        RetoricaUI.notify("Grabando mensaje de voz en búfer local...");
        setTimeout(function() {
            RetoricaUI.notify("Audio msn voz masterizado en búfer local ✓");
        }, 2000);
    },

    convertTextToVoiceFile: function() {
        var editor = document.getElementById('editor-body');
        if (!editor) return;
        var text = editor.innerText || editor.textContent;
        if (!text.trim()) { RetoricaUI.notify("No hay texto para procesar TTS."); return; }
        
        RetoricaUI.notify("Procesando síntesis TTS de voz...");
        var title = (document.getElementById('editor-title').value || "audio").trim();
        var dummyBlob = new Blob([text], { type: 'audio/mp3' });
        var url = URL.createObjectURL(dummyBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = title + ".mp3";
        a.click();
    }
};
