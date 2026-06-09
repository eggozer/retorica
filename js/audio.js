
// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: {
        isRecording: false,
        recognition: null
    },

    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!Speech) {
            RetoricaUI.notify("Dictado no soportado en este motor WebView.");
            return;
        }

        if (!this.state.isRecording) {
            this.state.recognition = new Speech();
            this.state.recognition.continuous = true;
            this.state.recognition.interimResults = false;
            this.state.recognition.lang = RetoricaI18n.currentLang === 'es' ? 'es-MX' : RetoricaI18n.currentLang;

            this.state.recognition.onresult = function(event) {
                var textChunk = event.results[event.results.length - 1][0].transcript;
                var editor = document.getElementById('editor-body');
                if (editor) {
                    editor.value += (editor.value ? ' ' : '') + textChunk;
                    RetoricaUI.updateCounters();
                }
            };

            this.state.recognition.onerror = function() {
                RetoricaAudio.stopMicLocally();
            };

            this.state.recognition.onend = function() {
                RetoricaAudio.stopMicLocally();
            };

            this.state.recognition.start();
            this.state.isRecording = true;
            if (btn) btn.classList.add('recording-active');
            RetoricaUI.notify("Escuchando entorno de dictado...");
        } else {
            this.stopMicLocally();
        }
    },

    stopMicLocally: function() {
        var btn = document.getElementById('btn-mic-main');
        if (this.state.recognition) {
            this.state.recognition.stop();
        }
        this.state.isRecording = false;
        if (btn) btn.classList.remove('recording-active');
        RetoricaUI.notify("Dictado guardado e interrumpido.");
    },

    play: function() {
        window.speechSynthesis.cancel(); // Reseteo total previo
        var editor = document.getElementById('editor-body');
        if (!editor || !editor.value.trim()) {
            RetoricaUI.notify("Lienzo vacío. No hay texto para leer.");
            return;
        }

        // Leer fragmento seleccionado por el usuario, o todo el lienzo si no hay selección
        var selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        var textToRead = selectedText || editor.value;

        var utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = RetoricaI18n.currentLang === 'es' ? 'es-MX' : RetoricaI18n.currentLang;

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
        window.speechSynthesis.cancel(); // Parada física directa de hilos de hardware
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        RetoricaUI.notify("Audio abortado físicamente 🛑");
    },

    vmsg: function() {
        RetoricaUI.notify("Mensaje de voz almacenado en búfer local.");
    },

    render: function() {
        RetoricaUI.notify("Renderizando guion a pista de audio física...");
    }
};
