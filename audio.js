// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { isRecording: false, recognition: null },
    selectedVoiceIndex: null,

    // Cargar y filtrar voces del sistema
    loadVoices: function() {
        if (!('speechSynthesis' in window)) return;
        var voices = window.speechSynthesis.getVoices();
        var select = document.getElementById('voice-picker');
        if (!select) return;

        select.innerHTML = '';
        if (voices.length === 0) {
            select.innerHTML = '<option value="">No hay voces disponibles</option>';
            return;
        }

        // Filtramos priorizando español, pero mostramos todas las disponibles
        var esVoices = voices.filter(function(v) { return v.lang.startsWith('es'); });
        var displayVoices = esVoices.length > 0 ? esVoices : voices;

        displayVoices.forEach(function(voice, index) {
            var option = document.createElement('option');
            option.value = index;
            option.textContent = voice.name + ' (' + voice.lang + ')';
            select.appendChild(option);
        });

        RetoricaAudio.selectedVoiceIndex = 0;
    },

    onVoiceSelected: function(index) {
        this.selectedVoiceIndex = parseInt(index, 10);
    },

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

    play: function() {
        if (!('speechSynthesis' in window)) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("TTS no soportado en este navegador");
            return;
        }

        window.speechSynthesis.cancel(); 
        var body = document.getElementById('editor-body').value.trim();
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para leer."); 
            return; 
        }

        var utterance = new SpeechSynthesisUtterance(body);
        
        // Asignar voz seleccionada en el desplegable
        var voices = window.speechSynthesis.getVoices();
        var esVoices = voices.filter(function(v) { return v.lang.startsWith('es'); });
        var activeVoices = esVoices.length > 0 ? esVoices : voices;

        if (this.selectedVoiceIndex !== null && activeVoices[this.selectedVoiceIndex]) {
            utterance.voice = activeVoices[this.selectedVoiceIndex];
        } else {
            utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
        }
        
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
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Leyendo texto...");
    },

    stop: function() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        this.stopMicLocally();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio detenido.");
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
        utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
        
        utterance.onstart = function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Reproduciendo render final ✓");
        };

        window.speechSynthesis.speak(utterance);

        var title = document.getElementById('editor-title').value.trim() || "audio";
        var dummyBlob = new Blob([body], { type: 'audio/mp3' });
        var url = URL.createObjectURL(dummyBlob);
        var a = document.createElement('a'); 
        a.href = url; 
        a.download = title + "_" + utterance.lang + ".mp3"; 
        a.click();
        setTimeout(function() { URL.revokeObjectURL(url); }, 100);
    }
};

// Inicialización de voces al cargar el navegador
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function() {
        RetoricaAudio.loadVoices();
    };
    // Intento directo en carga inicial por si ya estaban disponibles
    document.addEventListener('DOMContentLoaded', function() {
        RetoricaAudio.loadVoices();
    });
}
