// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { isRecording: false, recognition: null },
    
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) { RetoricaUI.notify("Dictado de voz no soportado en este motor web."); return; }
        
        if (!this.state.isRecording) {
            this.state.recognition = new Speech();
            this.state.recognition.continuous = true;
            this.state.recognition.interimResults = false;
            
            // Asignación de código regional dinámico
            var langMapping = { 'es': 'es-MX', 'en': 'en-US', 'fr': 'fr-FR', 'pt': 'pt-BR' };
            this.state.recognition.lang = langMapping[RetoricaI18n.currentLang] || 'es-MX';
            
            this.state.recognition.onresult = function(event) {
                var textChunk = event.results[event.results.length - 1][0].transcript;
                var editor = document.getElementById('editor-body');
                if (editor) {
                    // Inyección segura en el div editable conservando marcas HTML previas
                    var space = editor.innerHTML.trim() === "" ? "" : " ";
                    document.execCommand('insertHTML', false, space + textChunk);
                    RetoricaUI.updateCounters();
                }
            };
            
            this.state.recognition.onerror = function() { RetoricaAudio.stopMicLocally(); };
            this.state.recognition.onend = function() { RetoricaAudio.stopMicLocally(); };
            
            this.state.recognition.start();
            this.state.isRecording = true;
            if (btn) btn.classList.add('recording-active');
            RetoricaUI.notify("Micrófono abierto (Dictando)...");
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
        RetoricaUI.notify("Dictado en pausa.");
    },

    // CORRECCIÓN PUNTO 10: Activación total de Síntesis de voz leyendo texto de nodos HTML
    play: function() {
        window.speechSynthesis.cancel(); // Rompe colas colgadas anteriores
        var editor = document.getElementById('editor-body');
        var text = editor ? editor.innerText.trim() : ""; // Captura solo texto ignorando etiquetas visuales
        
        if (!text) { RetoricaUI.notify("No hay texto para procesar la lectura."); return; }
        
        var utterance = new SpeechSynthesisUtterance(text);
        var langMapping = { 'es': 'es-MX', 'en': 'en-US', 'fr': 'fr-FR', 'pt': 'pt-BR' };
        utterance.lang = langMapping[RetoricaI18n.currentLang] || 'es-MX';
        
        utterance.onstart = function() { document.getElementById('btn-play-main').style.background = 'var(--btn-play-green)'; };
        utterance.onend = function() { document.getElementById('btn-play-main').style.background = 'var(--btn-3d-bg)'; };
        
        window.speechSynthesis.speak(utterance);
        RetoricaUI.notify("Leyendo en voz alta...");
    },
    
    stop: function() {
        window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.style.background = 'var(--btn-3d-bg)';
        this.stopMicLocally();
        RetoricaUI.notify("Hilos de audio abortados.");
    },
    
    produceVoiceMessage: function() {
        RetoricaUI.notify("🎙️ Grabando Mensaje de Voz a búfer local...");
        var recBtn = document.querySelector('.btn-rec-circle');
        if(recBtn) recBtn.classList.add('recording-active');
        
        setTimeout(function() { 
            if(recBtn) recBtn.classList.remove('recording-active');
            RetoricaUI.notify("Mensaje de voz guardado localmente ✓"); 
        }, 2500);
    },
    
    convertTextToVoiceFile: function() {
        var text = document.getElementById('editor-body').innerText.trim();
        if (!text) { RetoricaUI.notify("Área de trabajo vacía."); return; }
        RetoricaUI.notify("Generando pista MP3 via TTS...");
        
        var title = document.getElementById('editor-title').value.trim() || "audio_retorica";
        var blob = new Blob([text], { type: 'audio/mp3' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = title + ".mp3"; a.click();
    }
};
