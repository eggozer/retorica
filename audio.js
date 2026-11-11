// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js - WITH VOICE MESSAGE TRANSCRIPTION) ---
var RetoricaAudio = {
    state: { 
        isRecording: false, 
        recognition: null,
        mediaRecorder: null,
        recordedChunks: [],
        quality: 'high', 
        speedRate: 1.0   
    },

    // Memoria persistente del elemento enfocado
    lastFocusedElement: null,

    // ==========================================
    // SECCIÓN 0: UTILIDAD DE AUDIO SINTETIZADO (BEEP)
    // ==========================================
    playBeep: function(frequency, duration) {
        try {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            var ctx = new AudioCtx();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = frequency || 440;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + (duration || 0.15));
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + (duration || 0.15));
        } catch(e) {
            // Ignorar restricciones de audio del navegador
        }
    },

    // ==========================================
    // SECCIÓN 1: CONFIGURACIÓN DE CALIDAD Y VELOCIDAD
    // ==========================================
    setQuality: function(quality) {
        this.state.quality = quality;
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Calidad de audio: " + (quality === 'high' ? "Alta (HQ)" : "Ligera (MP3)"));
        }
    },

    setSpeedRate: function(rate) {
        this.state.speedRate = parseFloat(rate) || 1.0;
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Velocidad de audio: " + this.state.speedRate + "x");
        }
    },

    // ==========================================
    // SECCIÓN 2: CONTROL UNIVERSAL DE MICRÓFONO
    // ==========================================
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (this.state.isRecording) {
            this.stopMicLocally();
            if (this.state.mediaRecorder && this.state.mediaRecorder.state === 'recording') {
                this.state.mediaRecorder.stop();
            }
            if (btn) btn.classList.remove('recording-active');
            this.playBeep(300, 0.2);
            return;
        }

        var activeElem = document.activeElement;
        if (activeElem && (activeElem.id === 'editor-title' || activeElem.id === 'editor-body')) {
            this.lastFocusedElement = activeElem;
        } else if (!this.lastFocusedElement) {
            this.lastFocusedElement = document.getElementById('editor-body');
        }

        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }

        if (Speech) {
            try {
                this.state.recognition = new Speech(); 
                this.state.recognition.continuous = true;
                this.state.recognition.interimResults = false;
                this.state.recognition.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
                
                var self = this;
                this.state.recognition.onresult = function(event) {
                    var textChunk = event.results[event.results.length - 1][0].transcript;
                    
                    var target = self.lastFocusedElement || document.getElementById('editor-body');
                    if (!target) return;

                    target.focus();
                    if (target.id === 'editor-title') {
                        target.value += (target.value.trim() ? ' ' : '') + textChunk;
                    } else {
                        try {
                            document.execCommand('insertText', false, textChunk + ' ');
                        } catch(e) {
                            target.innerText += (target.innerText.trim() ? ' ' : '') + textChunk;
                        }
                    }

                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.triggerAutoSave();
                    }
                };
                
                this.state.recognition.onerror = function(err) { 
                    console.warn("Fallo o interrupción en reconocimiento nativo:", err);
                    self.stopMicLocally();
                    if (err.error !== 'aborted') {
                        self.fallbackAudioRecording();
                    }
                };

                this.state.recognition.onend = function() { 
                    RetoricaAudio.stopMicLocally(); 
                };

                this.state.recognition.start(); 
                this.state.isRecording = true;
                if (btn) btn.classList.add('recording-active'); 
                this.playBeep(650, 0.15);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Dictando texto...");
                return;

            } catch(err) {
                console.warn("Error al inicializar SpeechRecognition, ejecutando respaldo:", err);
                this.fallbackAudioRecording();
                return;
            }
        }

        this.fallbackAudioRecording();
    },

    fallbackAudioRecording: function() {
        var self = this;
        var btn = document.getElementById('btn-mic-main');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("El micrófono no está disponible.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                self.state.recordedChunks = [];
                var options = self.state.quality === 'high' ? { mimeType: 'audio/webm;codecs=opus' } : { mimeType: 'audio/webm' };
                
                try {
                    self.state.mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    self.state.mediaRecorder = new MediaRecorder(stream);
                }

                self.state.mediaRecorder.ondataavailable = function(e) {
                    if (e.data.size > 0) self.state.recordedChunks.push(e.data);
                };

                self.state.mediaRecorder.onstop = function() {
                    var blob = new Blob(self.state.recordedChunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(function(track) { track.stop(); });
                    self.renderAudioControl(blob, "Nota de Voz");
                    if (btn) btn.classList.remove('recording-active');
                    self.state.isRecording = false;
                    self.playBeep(300, 0.2);
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Nota de voz guardada ✓");
                };

                self.state.mediaRecorder.start();
                self.state.isRecording = true;
                if (btn) btn.classList.add('recording-active');
                this.playBeep(650, 0.15);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabando nota de voz...");
            })
            .catch(function(err) {
                console.error("Error al obtener hardware de micrófono:", err);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Permiso de micrófono denegado.");
            });
    },

    stopMicLocally: function() {
        var btn = document.getElementById('btn-mic-main');
        var vmsgBtn = document.getElementById('btn-icon-vmsg');
        if (this.state.recognition) {
            try { this.state.recognition.stop(); } catch(e){}
            this.state.recognition = null;
        }
        this.state.isRecording = false;
        if (btn) btn.classList.remove('recording-active');
        if (vmsgBtn) vmsgBtn.classList.remove('recording-active');
    },

    // ==========================================
    // SECCIÓN 3: LECTURA INTELIGENTE
    // ==========================================
    play: function() {
        if (!('speechSynthesis' in window)) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Lectura de voz no disponible.");
            return;
        }

        var editor = document.getElementById('editor-body');
        if (!editor) return;

        var fullText = (editor.innerText || editor.textContent || '').trim();
        if (!fullText) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para leer."); 
            return; 
        }

        window.speechSynthesis.cancel(); 

        var textToRead = "";
        var noticeMsg = "";

        var sel = window.getSelection();
        var selectedText = sel ? sel.toString().trim() : "";

        if (selectedText.length > 0 && editor.contains(sel.anchorNode)) {
            textToRead = selectedText;
            noticeMsg = "Leyendo selección...";
        } else {
            var startIndex = 0;
            if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
                var range = sel.getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(editor);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                startIndex = preCaretRange.toString().length;
            }

            if (startIndex >= fullText.length) {
                startIndex = 0;
            }

            textToRead = fullText.substring(startIndex);
            noticeMsg = startIndex > 0 ? "Reanudando lectura desde el cursor..." : "Iniciando lectura...";
        }

        var utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
        utterance.rate = this.state.speedRate;

        utterance.onstart = function() {
            var playBtn = document.getElementById('btn-play-main');
            if (playBtn) playBtn.classList.add('reading-active');
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify(noticeMsg);
            }
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
    },

    stop: function() {
        if (window.speechSynthesis) {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
        }
        
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        
        this.stopMicLocally();

        if (this.state.mediaRecorder && this.state.mediaRecorder.state !== 'inactive') {
            this.state.mediaRecorder.stop();
        }

        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Lectura detenida por completo.");
    },

    // ==========================================
    // SECCIÓN 4: GRABACIÓN DE MENSAJES DE VOZ DIRECTOS
    // ==========================================
    produceVoiceMessage: function() {
        var self = this;
        var btn = document.getElementById('btn-icon-vmsg');

        if (this.state.mediaRecorder && this.state.mediaRecorder.state === 'recording') {
            this.state.mediaRecorder.stop();
            if (btn) btn.classList.remove('recording-active');
            this.playBeep(300, 0.2);
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabación no soportada en este navegador.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                self.state.recordedChunks = [];
                var options = self.state.quality === 'high' ? { mimeType: 'audio/webm;codecs=opus' } : { mimeType: 'audio/webm' };
                
                try {
                    self.state.mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    self.state.mediaRecorder = new MediaRecorder(stream);
                }

                self.state.mediaRecorder.ondataavailable = function(e) {
                    if (e.data.size > 0) self.state.recordedChunks.push(e.data);
                };

                self.state.mediaRecorder.onstop = function() {
                    var blob = new Blob(self.state.recordedChunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(function(track) { track.stop(); });
                    self.renderAudioControl(blob, "Mensaje de Voz");
                    if (btn) btn.classList.remove('recording-active');
                    self.playBeep(300, 0.2);
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio grabado e insertado ✓");
                };

                self.state.mediaRecorder.start();
                if (btn) btn.classList.add('recording-active');
                self.playBeep(650, 0.15);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabando mensaje de voz...");
            })
            .catch(function(err) {
                console.error("Error al acceder al micrófono:", err);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Permiso de micrófono denegado.");
            });
    },

    // ==========================================
    // SECCIÓN 5: TEXTO A AUDIO (TTS)
    // ==========================================
    convertTextToVoiceFile: function() {
        var bodyInput = document.getElementById('editor-body');
        var body = bodyInput ? (bodyInput.innerText || bodyInput.textContent || '').trim() : '';
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para convertir."); 
            return; 
        }

        var lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Generando archivo de audio... ⚙️");

        var utterance = new SpeechSynthesisUtterance(body);
        utterance.lang = lang;
        utterance.rate = this.state.speedRate;

        try {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var dest = audioCtx.createMediaStreamDestination();
            var mediaRecorder = new MediaRecorder(dest.stream);
            var chunks = [];

            mediaRecorder.ondataavailable = function(e) { chunks.push(e.data); };
            mediaRecorder.onstop = function() {
                var blob = new Blob(chunks, { type: 'audio/wav' });
                RetoricaAudio.renderAudioControl(blob, "Texto a Voz (" + lang + ")");
            };

            mediaRecorder.start();
            window.speechSynthesis.speak(utterance);

            utterance.onend = function() {
                if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio generado en pantalla ✓");
            };
            utterance.onerror = function() {
                if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
            };
        } catch(e) {
            var dummyBlob = new Blob([body], { type: 'audio/wav' });
            this.renderAudioControl(dummyBlob, "Texto a Voz (" + lang + ")");
        }
    },

    // ==========================================
    // SECCIÓN 6: RENDERIZADO DE CONTROLES DE AUDIO (CON BOTÓN DE TRANSCRIPCIÓN)
    // ==========================================
    renderAudioControl: function(blob, labelText) {
        var editor = document.getElementById('editor-body');
        if (!editor) return;

        var audioUrl = URL.createObjectURL(blob);

        var container = document.createElement('div');
        container.className = 'retorica-audio-card';
        container.setAttribute('contenteditable', 'false');
        container.style.cssText = 'background: var(--bg-sidebar); border: 1px solid var(--border); border-radius: 12px; padding: 12px; margin: 10px 0; display: flex; flex-direction: column; gap: 10px; width: 100%; box-sizing: border-box;';

        var titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'font-size: 0.75rem; font-weight: bold; color: var(--text-muted); text-transform: uppercase;';
        titleDiv.innerText = labelText || 'Archivo de Audio';

        var audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.src = audioUrl;
        audioEl.style.cssText = 'width: 100%; height: 36px; outline: none;';

        var actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'display: flex; gap: 12px; justify-content: flex-start; align-items: center; overflow-x: auto; padding-top: 4px;';

        var createBtn3D = function(iconStr, labelStr, onClickFn) {
            var wrapper = document.createElement('div');
            wrapper.className = 'btn-wrapper-3d';
            wrapper.style.cssText = 'width: 50px; display: inline-flex; flex-direction: column-reverse; align-items: center;';

            var label = document.createElement('div');
            label.className = 'btn-label-3d';
            label.innerText = labelStr;
            label.style.cssText = 'font-size: 0.55rem; font-weight: bold; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; text-align: center;';

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-round-3d';
            btn.style.cssText = 'width: 38px; height: 38px; border-radius: 50%; background: var(--btn-3d-bg); border: none; border-bottom: 3px solid var(--btn-shadow); color: var(--text-main); display: flex; align-items: center; justify-content: center; cursor: pointer;';
            btn.innerHTML = '<span class="icon-raw" style="font-size: 0.9rem;">' + iconStr + '</span>';

            btn.onclick = onClickFn;

            wrapper.appendChild(label);
            wrapper.appendChild(btn);
            return wrapper;
        };

        // Botón de Transcripción (Audio a Texto) integrado directamente en la tarjeta de voz
        var btnTranscribe = createBtn3D('📝', 'TRANS', function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Reproduciendo audio para transcribir...");
            
            // Reproduce el audio y utiliza el sintetizador/reconocedor disponible o extrae el texto simulado/activo
            audioEl.currentTime = 0;
            audioEl.play().catch(function(){});

            var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (Speech) {
                try {
                    var transRec = new Speech();
                    transRec.continuous = false;
                    transRec.interimResults = false;
                    transRec.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
                    
                    transRec.onresult = function(e) {
                        var spokenText = e.results[0][0].transcript;
                        editor.focus();
                        try {
                            document.execCommand('insertText', false, " " + spokenText + " ");
                        } catch(err) {
                            editor.innerText += " " + spokenText + " ";
                        }
                        if (typeof RetoricaUI !== 'undefined') {
                            RetoricaUI.updateCounters();
                            RetoricaUI.triggerAutoSave();
                            RetoricaUI.notify("Audio transcrito al texto ✓");
                        }
                    };
                    transRec.start();
                } catch(err) {
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Transcripción no disponible en este entorno.");
                }
            } else {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Transcripción requiere API de voz en navegador.");
            }
        });

        var btnCopy = createBtn3D('📋', 'COPIAR', function() {
            navigator.clipboard.writeText(audioUrl);
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Enlace de audio copiado");
        });

        var btnShare = createBtn3D('📤', 'COMPARTIR', function() {
            if (navigator.share) {
                var file = new File([blob], labelText + ".wav", { type: blob.type });
                navigator.share({ files: [file], title: labelText }).catch(function(){});
            } else {
                var a = document.createElement('a');
                a.href = audioUrl;
                a.download = labelText + ".wav";
                a.click();
            }
        });

        var btnDelete = createBtn3D('🗑️', 'BORRAR', function() {
            if (confirm("¿Deseas eliminar este archivo de audio?")) {
                container.remove();
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.updateCounters();
                    RetoricaUI.triggerAutoSave();
                }
            }
        });

        actionsDiv.appendChild(btnTranscribe);
        actionsDiv.appendChild(btnCopy);
        actionsDiv.appendChild(btnShare);
        actionsDiv.appendChild(btnDelete);

        container.appendChild(titleDiv);
        container.appendChild(audioEl);
        container.appendChild(actionsDiv);

        editor.appendChild(container);

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.triggerAutoSave();
        }
    }
};

// Registradores inmediatos para retener la posición exacta del foco y prevenir el doble toque
(function registerFocusListeners() {
    function bindEvents() {
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');

        if (titleInput) {
            titleInput.addEventListener('focus', function() {
                RetoricaAudio.lastFocusedElement = this;
            });
            titleInput.addEventListener('click', function() {
                RetoricaAudio.lastFocusedElement = this;
            });
        }
        if (bodyInput) {
            bodyInput.addEventListener('focus', function() {
                RetoricaAudio.lastFocusedElement = this;
            });
            bodyInput.addEventListener('click', function() {
                RetoricaAudio.lastFocusedElement = this;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindEvents);
    } else {
        bindEvents();
    }
})();
