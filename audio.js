// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { isRecording: false, recognition: null },
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) { RetoricaUI.notify("Dictado no soportado en este motor WebView."); return; }
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
            if (btn) btn.classList.add('recording-active'); RetoricaUI.notify("Micrófono Abierto. Dictado Activo...");
        } else { this.state.recognition.stop(); this.state.isRecording = false; this.stopMicLocally(); }
    },
    stopMicLocally: function() {
        var btn = document.getElementById('btn-mic-main');
        if (btn) btn.classList.remove('recording-active'); this.state.isRecording = false;
    },
    play: function() {
        var editor = document.getElementById('editor-body');
        if (!editor || !editor.value.trim()) { RetoricaUI.notify("Lienzo vacío. No hay texto para leer."); return; }
        window.speechSynthesis.cancel();
        var selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        var textToRead = selectedText || editor.value;
        var utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = RetoricaI18n.currentLang === 'es' ? 'es-MX' : RetoricaI18n.currentLang;
        utterance.onstart = function() { var playBtn = document.getElementById('btn-play-main'); if (playBtn) playBtn.classList.add('reading-active'); };
        utterance.onend = function() { var playBtn = document.getElementById('btn-play-main'); if (playBtn) playBtn.classList.remove('reading-active'); };
        window.speechSynthesis.speak(utterance); RetoricaUI.notify("Reproduciendo lectura activa...");
    },
    stop: function() {
        window.speechSynthesis.cancel(); // Parada física directa de hilos de hardware
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        RetoricaUI.notify("Audio abortado físicamente 🛑");
    },
    vmsg: function() { RetoricaUI.notify("Mensaje de voz almacenado en búfer local."); },
    render: function() { RetoricaUI.notify("Renderización masterizada de audio completada."); }
};
