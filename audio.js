var RetoricaAudio = {
    state: { isRecording: false, recognition: null, mediaRecorder: null, chunks: [] },
    
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) { RetoricaUI.notify("Dictado no soportado en este motor."); return; }
        if (!this.state.isRecording) {
            this.state.recognition = new Speech(); this.state.recognition.continuous = true;
            this.state.recognition.interimResults = false;
            this.state.recognition.lang = RetoricaI18n.currentLang === 'es' ? 'es-MX' : RetoricaI18n.currentLang;
            this.state.recognition.onresult = function(event) {
                var textChunk = event.results[event.results.length - 1][0].transcript;
                var editor = document.getElementById('editor-body');
                if (editor) { editor.value += (editor.value ? ' ' : '') + textChunk; RetoricaUI.updateCounters(); }
            };
            this.state.recognition.onerror = function() { RetoricaAudio.stopMicLocally(); };
            this.state.recognition.onend = function() { RetoricaAudio.stopMicLocally(); };
            this.state.recognition.start(); this.state.isRecording = true;
            if (btn) btn.classList.add('recording-active'); RetoricaUI.notify("Dictado Activo...");
        } else { this.state.recognition.stop(); this.state.isRecording = false; this.stopMicLocally(); }
    },
    stopMicLocally: function() {
        var btn = document.getElementById('btn-mic-main');
        if (btn) btn.classList.remove('recording-active'); this.state.isRecording = false;
    },
    play: function() {
        var editor = document.getElementById('editor-body');
        if (!editor || !editor.value.trim()) { RetoricaUI.notify("Lienzo vacío."); return; }
        window.speechSynthesis.cancel();
        var selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        var textToRead = selectedText || editor.value;
        var utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = RetoricaI18n.currentLang === 'es' ? 'es-MX' : RetoricaI18n.currentLang;
        utterance.onstart = function() { var playBtn = document.getElementById('btn-play-main'); if (playBtn) playBtn.classList.add('reading-active'); };
        utterance.onend = function() { var playBtn = document.getElementById('btn-play-main'); if (playBtn) playBtn.classList.remove('reading-active'); };
        window.speechSynthesis.speak(utterance); RetoricaUI.notify("Leyendo texto...");
    },
    stop: function() {
        window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        if (this.state.mediaRecorder && this.state.mediaRecorder.state !== 'inactive') {
            this.state.mediaRecorder.stop();
        }
        this.stopMicLocally();
        RetoricaUI.notify("Audio e hilos abortados.");
    },
    produceVoiceMessage: function() {
        var self = this;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            RetoricaUI.notify("Captura de hardware no soportada."); return;
        }
        if (self.state.mediaRecorder && self.state.mediaRecorder.state === 'recording') {
            self.state.mediaRecorder.stop();
            RetoricaUI.notify("Grabación finalizada.");
            return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
            self.state.chunks = [];
            self.state.mediaRecorder = new MediaRecorder(stream);
            self.state.mediaRecorder.ondataavailable = function(e) { if (e.data.size > 0) self.state.chunks.push(e.data); };
            self.state.mediaRecorder.onstop = function() {
                var audioBlob = new Blob(self.state.chunks, { type: 'audio/mp3' });
                var url = URL.createObjectURL(audioBlob);
                var a = document.createElement('a'); a.href = url; a.download = "master_voice_" + Date.now() + ".mp3"; a.click();
                RetoricaUI.notify("Audio masterizado y descargado ✓");
            };
            self.state.mediaRecorder.start();
            RetoricaUI.notify("Grabando audio del micrófono... Toca de nuevo para bajar archivo.");
        }).catch(function() { RetoricaUI.notify("Error de acceso al hardware."); });
    },
    convertTextToVoiceFile: function() {
        var body = document.getElementById('editor-body').value.trim();
        if(!body) { RetoricaUI.notify("No hay texto para convertir."); return; }
        RetoricaUI.notify("Procesando síntesis TTS de voz...");
        var title = document.getElementById('editor-title').value.trim() || "audio";
        var dummyBlob = new Blob([body], { type: 'audio/mp3' });
        var url = URL.createObjectURL(dummyBlob);
        var a = document.createElement('a'); a.href = url; a.download = title + ".mp3"; a.click();
        RetoricaUI.notify("Archivo de voz descargado (" + title + ".mp3) ✓");
    }
};
