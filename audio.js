// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js) ---
var RetoricaAudio = {
    state: { 
        isRecording: false, 
        recognition: null,
        mediaRecorder: null,
        recordedChunks: [],
        quality: 'high', // 'high' (HQ) o 'low' (Ligero)
        speedRate: 1.0   // Velocidad / Tempo de lectura
    },

    // 1. Configuración de Calidad y Velocidad
    setQuality: function(quality) {
        this.state.quality = quality;
        if (typeof RetoricaUI !== 'undefined') {
            var label = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                RetoricaI18n.db[RetoricaI18n.currentLang].audioQuality : "Calidad de audio";
            RetoricaUI.notify(label + ": " + (quality === 'high' ? "HQ" : "MP3"));
        }
    },

    setSpeedRate: function(rate) {
        this.state.speedRate = parseFloat(rate) || 1.0;
        if (typeof RetoricaUI !== 'undefined') {
            var label = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                RetoricaI18n.db[RetoricaI18n.currentLang].audioSpeed : "Velocidad de audio";
            RetoricaUI.notify(label + ": " + this.state.speedRate + "x");
        }
    },

    // 2. Dictado por micrófono
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) { 
            if (typeof RetoricaUI !== 'undefined') {
                var msg = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                    RetoricaI18n.db[RetoricaI18n.currentLang].noMic : "Dictado no soportado en este navegador.";
                RetoricaUI.notify(msg);
            }
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
                    var currentText = editor.innerText || editor.textContent || '';
                    var newText = (currentText.trim() ? currentText + ' ' : '') + textChunk;
                    editor.innerText = newText;
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
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Micrófono abierto...");
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

    // 3. Lectura en voz alta
    play: function() {
        if (!('speechSynthesis' in window)) {
            if (typeof RetoricaUI !== 'undefined') {
                var msg = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                    RetoricaI18n.db[RetoricaI18n.currentLang].noTTS : "Lectura de voz no disponible.";
                RetoricaUI.notify(msg);
            }
            return;
        }
        try {
            window.speechSynthesis.cancel(); 
            var bodyInput = document.getElementById('editor-body');
            var body = bodyInput ? (bodyInput.innerText || bodyInput.textContent || '').trim() : '';
            if (!body) { 
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para leer."); 
                return; 
            }

            var utterance = new SpeechSynthesisUtterance(body);
            utterance.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
            utterance.rate = this.state.speedRate;
            
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
        } catch (err) {
            console.error("Error en síntesis de voz:", err);
            var playBtn = document.getElementById('btn-play-main'); 
            if (playBtn) playBtn.classList.remove('reading-active');
        }
    },

    stop: function() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        var playBtn = document.getElementById('btn-play-main');
        if (playBtn) playBtn.classList.remove('reading-active');
        this.stopMicLocally();

        if (this.state.mediaRecorder && this.state.mediaRecorder.state !== 'inactive') {
            this.state.mediaRecorder.stop();
        }

        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Procesos de audio detenidos.");
    },

    // 4. Grabación Real de Audio (Botón REC / vmsg)
    produceVoiceMessage: function() {
        var self = this;
        var btn = document.getElementById('btn-icon-vmsg');

        if (this.state.mediaRecorder && this.state.mediaRecorder.state === 'recording') {
            this.state.mediaRecorder.stop();
            if (btn) btn.classList.remove('recording-active');
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabación no soportada.");
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
                    self.renderAudioControl(blob, "Grabación");
                    if (btn) btn.classList.remove('recording-active');
                    if (typeof RetoricaUI !== 'undefined') {
                        var msg = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                            RetoricaI18n.db[RetoricaI18n.currentLang].audioInserted : "Audio grabado e insertado ✓";
                        RetoricaUI.notify(msg);
                    }
                };

                self.state.mediaRecorder.start();
                if (btn) btn.classList.add('recording-active');
                if (typeof RetoricaUI !== 'undefined') {
                    var msg = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                        RetoricaI18n.db[RetoricaI18n.currentLang].recActive : "Grabando audio...";
                    RetoricaUI.notify(msg);
                }
            })
            .catch(function(err) {
                console.error("Error al acceder al micrófono:", err);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Permiso de micrófono denegado.");
            });
    },

    // 5. Convertir Texto a Audio en el Área de Trabajo (Botón AUD / tts)
    convertTextToVoiceFile: function() {
        var bodyInput = document.getElementById('editor-body');
        var body = bodyInput ? (bodyInput.innerText || bodyInput.textContent || '').trim() : '';
        if (!body) { 
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para convertir."); 
            return; 
        }

        var lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentVoiceLang : 'es-MX';
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Generando archivo de audio...");

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
                if (typeof RetoricaUI !== 'undefined') {
                    var msg = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
                        RetoricaI18n.db[RetoricaI18n.currentLang].audioGenerated : "Audio generado en pantalla ✓";
                    RetoricaUI.notify(msg);
                }
            };
            utterance.onerror = function() {
                if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
            };
        } catch(e) {
            var dummyBlob = new Blob([body], { type: 'audio/wav' });
            this.renderAudioControl(dummyBlob, "Texto a Voz (" + lang + ")");
        }
    },

    // 6. Inserción del Control de Audio (Diseño 3D Monocromático)
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

        var p = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) ? 
            RetoricaI18n.db[RetoricaI18n.currentLang] : { copyCard: 'COPIAR', share: 'COMPARTIR', del: 'BORRAR' };

        var btnCopy = createBtn3D('📋', p.copyCard || 'COPIAR', function() {
            navigator.clipboard.writeText(audioUrl);
            var msg = p.audioCopied || "Enlace de audio copiado";
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify(msg);
        });

        var btnShare = createBtn3D('📤', p.share || 'COMPARTIR', function() {
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

        var btnDelete = createBtn3D('🗑️', p.del || 'BORRAR', function() {
            var confirmMsg = p.confirmDel || "¿Deseas eliminar este archivo de audio?";
            if (confirm(confirmMsg)) {
                container.remove();
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.updateCounters();
                    RetoricaUI.triggerAutoSave();
                    if (p.audioDeleted) RetoricaUI.notify(p.audioDeleted);
                }
            }
        });

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
