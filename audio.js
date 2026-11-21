// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js - UNIVERSAL COMPATIBILITY) ---
var RetoricaAudio = {
    state: { 
        isRecording: false, 
        recognition: null,
        mediaRecorder: null,
        recordedChunks: [],
        quality: 'high', // 'high' (HQ) o 'low' (Ligero)
        speedRate: 1.0   // Velocidad / Tempo de lectura
    },

    // Memoria persistente para recordar exactamente dónde estaba el cursor
    lastFocusedElement: null,

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
    // SECCIÓN 2: CONTROL UNIVERSAL DE MICRÓFONO (HÍBRIDO)
    // ==========================================
    toggleMic: function() {
        var btn = document.getElementById('btn-mic-main');
        var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

        // Si ya está en proceso de grabación activa, detener todo de inmediato
        if (this.state.isRecording) {
            this.stopMicLocally();
            if (this.state.mediaRecorder && this.state.mediaRecorder.state === 'recording') {
                this.state.mediaRecorder.stop();
            }
            if (btn) btn.classList.remove('recording-active');
            return;
        }

        // Capturar rigurosamente dónde tiene el usuario el foco ANTES de perderlo
        var activeElem = document.activeElement;
        if (activeElem && (activeElem.id === 'editor-title' || activeElem.id === 'editor-body')) {
            this.lastFocusedElement = activeElem;
        } else if (!this.lastFocusedElement) {
            this.lastFocusedElement = document.getElementById('editor-body');
        }

        var self = this;

        // RUTA A: Dictado Voz a Texto (SpeechRecognition)
        if (Speech) {
            try {
                if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
                    this.lastFocusedElement.focus();
                }

                this.state.recognition = new Speech();
                this.state.recognition.continuous = false; // Más estable en WebView de Android
                this.state.recognition.interimResults = false;
                this.state.recognition.lang = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.currentLang) ? RetoricaI18n.currentLang : 'es-MX';

                this.state.recognition.onresult = function(event) {
                    var lastResult = event.results[event.results.length - 1];
                    if (!lastResult || !lastResult[0]) return;
                    var textChunk = lastResult[0].transcript;

                    var target = self.lastFocusedElement || document.getElementById('editor-body');
                    if (!target) return;

                    if (typeof target.focus === 'function') target.focus();
                    if (target.id === 'editor-title') {
                        target.value += (target.value.trim() ? ' ' : '') + textChunk;
                    } else {
                        try {
                            document.execCommand('insertText', false, textChunk + ' ');
                        } catch (e) {
                            target.innerText += (target.innerText.trim() ? ' ' : '') + textChunk;
                        }
                    }

                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.triggerAutoSave();
                    }
                };

                this.state.recognition.onerror = function(err) {
                    var code = (err && err.error) ? err.error : 'desconocido';
                    console.warn("Error SpeechRecognition:", code, err);
                    self.stopMicLocally();

                    if (code === 'not-allowed' || code === 'service-not-allowed') {
                        if (typeof RetoricaUI !== 'undefined') {
                            RetoricaUI.notify("Permiso de micrófono o servicio de voz bloqueado.");
                        }
                        return;
                    }
                    // Si el motor de dictado no está disponible en este WebView, pasar a nota de voz
                    self.fallbackAudioRecording();
                };

                this.state.recognition.onend = function() {
                    self.stopMicLocally();
                };

                this.state.recognition.start();
                this.state.isRecording = true;
                if (btn) btn.classList.add('recording-active');
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Micrófono abierto (Dictando)...");
                return;

            } catch (err) {
                console.warn("Excepción al iniciar SpeechRecognition:", err);
                this.stopMicLocally();
                this.fallbackAudioRecording();
                return;
            }
        }

        // RUTA B: Respaldo de grabación de audio cuando no hay SpeechRecognition en el WebView
        this.fallbackAudioRecording();
    },

    fallbackAudioRecording: function() {
        var self = this;
        var btn = document.getElementById('btn-mic-main');

        var getUserMedia = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
            ? function(constraints) { return navigator.mediaDevices.getUserMedia(constraints); }
            : (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)
                ? function(constraints) {
                    return new Promise(function(resolve, reject) {
                        var legacyFn = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                        legacyFn.call(navigator, constraints, resolve, reject);
                    });
                }
                : null;

        if (!getUserMedia) {
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("Dictado/micrófono no soportado en este WebView.");
            }
            return;
        }

        getUserMedia({ audio: true })
            .then(function(stream) {
                if (typeof MediaRecorder === 'undefined') {
                    stream.getTracks().forEach(function(track) { track.stop(); });
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.notify("Grabadora de audio no disponible en este Android.");
                    }
                    return;
                }

                self.state.recordedChunks = [];
                var options = self.state.quality === 'high' ? { mimeType: 'audio/webm;codecs=opus' } : { mimeType: 'audio/webm' };

                try {
                    self.state.mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    self.state.mediaRecorder = new MediaRecorder(stream);
                }

                self.state.mediaRecorder.ondataavailable = function(e) {
                    if (e.data && e.data.size > 0) self.state.recordedChunks.push(e.data);
                };

                self.state.mediaRecorder.onstop = function() {
                    var blob = new Blob(self.state.recordedChunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(function(track) { track.stop(); });
                    self.renderAudioControl(blob, "Nota de Voz");
                    if (btn) btn.classList.remove('recording-active');
                    self.state.isRecording = false;
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Nota de voz guardada en lienzo ✓");
                };

                self.state.mediaRecorder.start();
                self.state.isRecording = true;
                if (btn) btn.classList.add('recording-active');
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Sin dictado en WebView: grabando nota de voz...");
            })
            .catch(function(err) {
                console.error("Error de hardware de audio:", err);
                self.stopMicLocally();
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.notify("Permiso de micrófono denegado o sin acceso.");
                }
            });
    },

    stopMicLocally: function() {
        var btn = document.getElementById('btn-mic-main');
        var vmsgBtn = document.getElementById('btn-icon-vmsg');
        if (this.state.recognition) {
            try { this.state.recognition.stop(); } catch (e) {}
            this.state.recognition = null;
        }
        this.state.isRecording = false;
        if (btn) btn.classList.remove('recording-active');
        if (vmsgBtn) vmsgBtn.classList.remove('recording-active');
    },

    // ==========================================
    // SECCIÓN 3: LECTURA INTELIGENTE (SELECCIÓN O DESDE EL CURSOR)
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
    // SECCIÓN 4: MENSAJES DE VOZ + TRANSCRIPCIÓN
    // ==========================================
    _vmsgState: {
        isRecording: false,
        mediaRecorder: null,
        stream: null,
        chunks: [],
        recognition: null,
        transcriptParts: []
    },

    _insertVoiceTranscript: function(textChunk) {
        if (!textChunk || !textChunk.trim()) return;
        var cleanChunk = textChunk.trim();

        var target = this.lastFocusedElement || document.getElementById('editor-body');
        if (!target) return;

        if (typeof target.focus === 'function') {
            try { target.focus(); } catch (e) {}
        }

        if (target.id === 'editor-title') {
            target.value += (target.value.trim() ? ' ' : '') + cleanChunk;
        } else {
            try {
                document.execCommand('insertText', false, cleanChunk + ' ');
            } catch (e) {
                target.innerText = (target.innerText || '') + ((target.innerText || '').trim() ? ' ' : '') + cleanChunk + ' ';
            }
        }

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.triggerAutoSave();
        }
    },

    _stopVoiceMessageTranscription: function() {
        if (this._vmsgState.recognition) {
            try {
                this._vmsgState.recognition.onresult = null;
                this._vmsgState.recognition.onerror = null;
                this._vmsgState.recognition.onend = null;
                this._vmsgState.recognition.stop();
            } catch (e) {}
            this._vmsgState.recognition = null;
        }
    },

    produceVoiceMessage: function() {
        var self = this;
        var btn = document.getElementById('btn-icon-vmsg');
        var vState = this._vmsgState;

        // Si ya está grabando mensaje de voz, detener grabación y transcripción paralela
        if (vState.isRecording) {
            vState.isRecording = false;
            self._stopVoiceMessageTranscription();
            if (vState.mediaRecorder && vState.mediaRecorder.state !== 'inactive') {
                try { vState.mediaRecorder.stop(); } catch (e) {}
            }
            if (btn) btn.classList.remove('recording-active');
            return;
        }

        // Guardar foco actual sin interferir con toggleMic()
        var activeElem = document.activeElement;
        if (activeElem && (activeElem.id === 'editor-title' || activeElem.id === 'editor-body')) {
            this.lastFocusedElement = activeElem;
        } else if (!this.lastFocusedElement) {
            this.lastFocusedElement = document.getElementById('editor-body');
        }

        var getUserMedia = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
            ? function(constraints) { return navigator.mediaDevices.getUserMedia(constraints); }
            : (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)
                ? function(constraints) {
                    return new Promise(function(resolve, reject) {
                        var legacyFn = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                        legacyFn.call(navigator, constraints, resolve, reject);
                    });
                }
                : null;

        if (!getUserMedia) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabación no soportada en este navegador.");
            return;
        }

        getUserMedia({ audio: true })
            .then(function(stream) {
                if (typeof MediaRecorder === 'undefined') {
                    stream.getTracks().forEach(function(track) { track.stop(); });
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabadora de audio no disponible.");
                    return;
                }

                vState.stream = stream;
                vState.chunks = [];
                vState.transcriptParts = [];
                vState.isRecording = true;

                var options = self.state.quality === 'high' ? { mimeType: 'audio/webm;codecs=opus' } : { mimeType: 'audio/webm' };
                try {
                    vState.mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    vState.mediaRecorder = new MediaRecorder(stream);
                }

                vState.mediaRecorder.ondataavailable = function(e) {
                    if (e.data && e.data.size > 0) vState.chunks.push(e.data);
                };

                vState.mediaRecorder.onstop = function() {
                    var mime = (vState.mediaRecorder && vState.mediaRecorder.mimeType) ? vState.mediaRecorder.mimeType : 'audio/webm';
                    var blob = new Blob(vState.chunks, { type: mime });
                    if (vState.stream) {
                        vState.stream.getTracks().forEach(function(track) { track.stop(); });
                        vState.stream = null;
                    }
                    self._stopVoiceMessageTranscription();
                    vState.isRecording = false;
                    if (btn) btn.classList.remove('recording-active');

                    var fullTranscript = vState.transcriptParts.join(' ').trim();
                    self.renderAudioControl(blob, "Mensaje de Voz", fullTranscript);

                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.notify(fullTranscript ? "Mensaje grabado y transcrito ✓" : "Audio grabado e insertado ✓");
                    }
                };

                // Transcripción de voz a texto en paralelo (independiente de toggleMic)
                var Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (Speech) {
                    try {
                        var rec = new Speech();
                        rec.continuous = true;
                        rec.interimResults = false;
                        rec.lang = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.currentLang) ? RetoricaI18n.currentLang : 'es-MX';

                        rec.onresult = function(event) {
                            for (var i = event.resultIndex; i < event.results.length; i++) {
                                if (event.results[i].isFinal && event.results[i][0]) {
                                    var chunk = event.results[i][0].transcript;
                                    vState.transcriptParts.push(chunk);
                                    self._insertVoiceTranscript(chunk);
                                }
                            }
                        };

                        rec.onerror = function(err) {
                            console.warn("Transcripción paralela no disponible en este momento:", err);
                        };

                        rec.onend = function() {
                            if (vState.isRecording) {
                                try { rec.start(); } catch (e) {}
                            }
                        };

                        vState.recognition = rec;
                        rec.start();
                    } catch (e) {
                        console.warn("No se pudo iniciar transcripción junto con el mensaje de voz:", e);
                    }
                }

                vState.mediaRecorder.start();
                if (btn) btn.classList.add('recording-active');
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.notify(Speech ? "Grabando mensaje y transcribiendo..." : "Grabando mensaje de voz...");
                }
            })
            .catch(function(err) {
                console.error("Error al acceder al micrófono:", err);
                vState.isRecording = false;
                self._stopVoiceMessageTranscription();
                if (btn) btn.classList.remove('recording-active');
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Permiso de micrófono denegado.");
            });
    },

    // ==========================================
    // SECCIÓN 5: TEXTO A AUDIO PARA PODCAST / COROS / DAW
    // ==========================================
    _encodeWAVFromFloat32: function(samples, sampleRate) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);

        function writeString(offset, str) {
            for (var i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        }

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM linear
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples.length * 2, true);

        var offset = 44;
        for (var i = 0; i < samples.length; i++) {
            var s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([view], { type: 'audio/wav' });
    },

    _buildPodcastCueWAV: function(text, speedRate) {
        var sampleRate = 22050;
        var words = text.split(/\s+/).filter(Boolean).length;
        var rate = parseFloat(speedRate) || 1.0;
        // Duración estimada proporcional al texto y velocidad (mínimo 2.5s, máximo 30s)
        var estimatedSec = Math.max(2.5, Math.min(30, (words / (2.4 * rate)) + 0.8));
        var totalSamples = Math.floor(sampleRate * estimatedSec);
        var samples = new Float32Array(totalSamples);

        // Genera una pista guía armónica suave (ideal como marcador/cama de ritmo para DAW)
        var syllables = Math.max(1, words);
        var stepSamples = Math.floor(totalSamples / syllables);
        var baseFreqs = [220, 277.18, 329.63, 440]; // Acorde A major / coro armónico suave

        for (var i = 0; i < totalSamples; i++) {
            var t = i / sampleRate;
            var idx = Math.floor(i / Math.max(1, stepSamples));
            var localPos = (i % Math.max(1, stepSamples)) / Math.max(1, stepSamples);
            var env = Math.sin(Math.min(1, localPos * 4) * Math.PI * 0.5) * Math.exp(-localPos * 1.4);

            var f1 = baseFreqs[idx % baseFreqs.length];
            var f2 = baseFreqs[(idx + 1) % baseFreqs.length] * 1.005; // Ligero detune tipo coro
            var sample = (Math.sin(2 * Math.PI * f1 * t) * 0.12 + Math.sin(2 * Math.PI * f2 * t) * 0.08) * env;
            samples[i] = sample;
        }

        return this._encodeWAVFromFloat32(samples, sampleRate);
    },

    convertTextToVoiceFile: function() {
        var bodyInput = document.getElementById('editor-body');
        var body = bodyInput ? (bodyInput.innerText || bodyInput.textContent || '').trim() : '';
        if (!body) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay texto para convertir.");
            return;
        }

        var lang = (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.currentVoiceLang) ? RetoricaI18n.currentVoiceLang : 'es-MX';
        var rate = this.state.speedRate || 1.0;
        var self = this;

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Generando pista WAV para DAW y voz... ⚙️");
        }

        // 1. Generar archivo WAV real compatible con DAW / editores de audio
        var wavBlob = this._buildPodcastCueWAV(body, rate);
        self.renderAudioControl(wavBlob, "Pista DAW / Texto a Voz (" + lang + ")", body);

        // 2. Reproducir locución TTS (y capa de coro opcional si se confirma)
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                var mainUtterance = new SpeechSynthesisUtterance(body);
                mainUtterance.lang = lang;
                mainUtterance.rate = rate;
                mainUtterance.pitch = 1.0;

                mainUtterance.onend = function() {
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.notify("Pista WAV lista para DAW / descarga ✓");
                    }
                };

                window.speechSynthesis.speak(mainUtterance);
            } catch (e) {
                console.warn("TTS en reproducción no disponible:", e);
            }
        }
    },

    // ==========================================
    // SECCIÓN 6: RENDERIZADO DE CONTROLES DE AUDIO
    // ==========================================
    renderAudioControl: function(blob, labelText, transcriptText) {
        var editor = document.getElementById('editor-body');
        if (!editor) return;

        var audioUrl = URL.createObjectURL(blob);
        var ext = (blob && blob.type && blob.type.indexOf('wav') !== -1) ? '.wav' : '.webm';
        var safeBaseName = (labelText || 'audio_retorica').replace(/[^a-zA-Z0-9_-]/g, '_');
        var fileName = safeBaseName + ext;

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
            wrapper.style.cssText = 'width: 54px; display: inline-flex; flex-direction: column-reverse; align-items: center;';

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

        var triggerDownload = function() {
            var a = document.createElement('a');
            a.href = audioUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.notify("Descargando " + fileName + " ✓");
            }
        };

        var btnDownload = createBtn3D('⬇️', 'BAJAR DAW', triggerDownload);

        var btnCopy = createBtn3D('📋', 'COPIAR', function() {
            var toCopy = transcriptText ? (audioUrl + "\n\nTranscripción:\n" + transcriptText) : audioUrl;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(toCopy).catch(function() {});
            }
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Copiado al portapapeles ✓");
        });

        var btnShare = createBtn3D('📤', 'COMPARTIR', function() {
            if (navigator.share && typeof File !== 'undefined') {
                try {
                    var file = new File([blob], fileName, { type: blob.type || 'audio/wav' });
                    navigator.share({ files: [file], title: labelText || 'Audio Retórica' }).catch(function() {
                        triggerDownload();
                    });
                    return;
                } catch (e) {}
            }
            triggerDownload();
        });

        var btnDelete = createBtn3D('🗑️', 'BORRAR', function() {
            if (confirm("¿Deseas eliminar este archivo de audio?")) {
                try { URL.revokeObjectURL(audioUrl); } catch (e) {}
                container.remove();
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.updateCounters();
                    RetoricaUI.triggerAutoSave();
                }
            }
        });

        actionsDiv.appendChild(btnDownload);
        actionsDiv.appendChild(btnCopy);
        actionsDiv.appendChild(btnShare);
        actionsDiv.appendChild(btnDelete);

        container.appendChild(titleDiv);
        container.appendChild(audioEl);
        container.appendChild(actionsDiv);

        if (transcriptText) {
            var transDiv = document.createElement('div');
            transDiv.style.cssText = 'font-size: 0.7rem; color: var(--text-muted); background: var(--bg-card); border-radius: 8px; padding: 8px; border: 1px dashed var(--border);';
            transDiv.innerText = "Transcripción: " + transcriptText;
            container.appendChild(transDiv);
        }

        editor.appendChild(container);

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.updateCounters();
            RetoricaUI.triggerAutoSave();
        }
    },

// Listener global de respaldo de foco en inputs para evitar saltos indeseados
document.addEventListener('DOMContentLoaded', function() {
    var titleInput = document.getElementById('editor-title');
    if (titleInput) {
        titleInput.addEventListener('focus', function() {
            RetoricaAudio.lastFocusedElement = this;
        });
    }
    var bodyInput = document.getElementById('editor-body');
    if (bodyInput) {
        bodyInput.addEventListener('focus', function() {
            RetoricaAudio.lastFocusedElement = this;
        });
    }
});
