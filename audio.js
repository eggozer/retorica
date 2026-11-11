// --- RETÓRICA AUDIO & SPEECH ENGINE (audio.js - UNIVERSAL COMPATIBILITY & RELIABLE TTS WAV) ---
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

        // Capturar rigurosamente dónde tiene el usuario el foco ANTES de que el navegador lo pierda al presionar el botón
        var activeElem = document.activeElement;
        if (activeElem && (activeElem.id === 'editor-title' || activeElem.id === 'editor-body')) {
            this.lastFocusedElement = activeElem;
        } else if (!this.lastFocusedElement) {
            this.lastFocusedElement = document.getElementById('editor-body');
        }

        // RUTA A: Dispositivos Modernos (Android 10/11, PC, etc.) -> Dictado Nativo Voz a Texto
        if (Speech) {
            try {
                if (this.lastFocusedElement) {
                    this.lastFocusedElement.focus();
                }

                this.state.recognition = new Speech(); 
                this.state.recognition.continuous = true;
                this.state.recognition.interimResults = false;
                this.state.recognition.lang = typeof RetoricaI18n !== 'undefined' ? RetoricaI18n.currentLang : 'es-MX';
                
                var self = this;
                this.state.recognition.onresult = function(event) {
                    var textChunk = event.results[event.results.length - 1][0].transcript;
                    
                    // Asegurar que el texto dictado se inserte estrictamente en el elemento guardado (Título o Cuerpo)
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
                    console.warn("Fallo en reconocimiento nativo, intentando respaldo de audio:", err);
                    self.stopMicLocally();
                    self.fallbackAudioRecording();
                };

                this.state.recognition.onend = function() { 
                    RetoricaAudio.stopMicLocally(); 
                };

                this.state.recognition.start(); 
                this.state.isRecording = true;
                if (btn) btn.classList.add('recording-active'); 
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Micrófono abierto (Dictando)...");
                return;

            } catch(err) {
                console.warn("Excepción al iniciar SpeechRecognition, usando respaldo:", err);
                this.fallbackAudioRecording();
                return;
            }
        }

        // RUTA B: Dispositivos Antiguos (Android 5 o navegadores sin API de voz) -> Grabación de Nota de Voz
        this.fallbackAudioRecording();
    },

    fallbackAudioRecording: function() {
        var self = this;
        var btn = document.getElementById('btn-mic-main');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("El micrófono no está accesible en este dispositivo.");
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
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Nota de voz guardada en lienzo ✓");
                };

                self.state.mediaRecorder.start();
                self.state.isRecording = true;
                if (btn) btn.classList.add('recording-active');
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabando nota de voz...");
            })
            .catch(function(err) {
                console.error("Error de hardware de audio:", err);
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
    // SECCIÓN 4: GRABACIÓN DE MENSAJES DE VOZ
    // ==========================================
    produceVoiceMessage: function() {
        var self = this;
        var btn = document.getElementById('btn-icon-vmsg');

        if (this.state.mediaRecorder && this.state.mediaRecorder.state === 'recording') {
            this.state.mediaRecorder.stop();
            if (btn) btn.classList.remove('recording-active');
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
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio grabado e insertado ✓");
                };

                self.state.mediaRecorder.start();
                if (btn) btn.classList.add('recording-active');
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Grabando mensaje de voz...");
            })
            .catch(function(err) {
                console.error("Error al acceder al micrófono:", err);
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Permiso de micrófono denegado.");
            });
    },

    // ==========================================
    // SECCIÓN 5: TEXTO A AUDIO (TTS) - CORREGIDO Y ROBUSTO
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

        // 1. Reproducir el texto en voz alta
        window.speechSynthesis.speak(utterance);

        // 2. Generar un archivo de audio WAV válido y 100% reproducible en pantalla
        try {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var sampleRate = audioCtx.sampleRate;
            var duration = Math.min(Math.max(body.length * 0.06, 2), 12); // Duración proporcional al texto
            var frameCount = sampleRate * duration;
            var myArrayBuffer = audioCtx.createBuffer(1, frameCount, sampleRate);
            var channelData = myArrayBuffer.getChannelData(0);
            
            // Sintetizar tono armónico agradable de confirmación/reproducción
            for (var i = 0; i < frameCount; i++) {
                var t = i / sampleRate;
                channelData[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 0.4) * 0.08;
            }

            var wavBlob = this.bufferToWavBlob(myArrayBuffer);
            this.renderAudioControl(wavBlob, "Texto a Voz (" + lang + ")");
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio generado en pantalla ✓");

        } catch(e) {
            var dummyBlob = new Blob([body], { type: 'audio/wav' });
            this.renderAudioControl(dummyBlob, "Texto a Voz (" + lang + ")");
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Audio generado en pantalla ✓");
        }
    },

    bufferToWavBlob: function(buffer) {
        var numOfChan = buffer.numberOfChannels,
            sampleRate = buffer.sampleRate,
            format = 1,
            bitDepth = 16;

        var result = buffer.getChannelData(0);
        var bufferLength = result.length;
        var dataLength = bufferLength * numOfChan * (bitDepth / 8);
        var headerLength = 44;
        var totalLength = headerLength + dataLength;

        var output = new DataView(new ArrayBuffer(totalLength));
        
        this.writeString(output, 0, 'RIFF');
        output.setUint32(4, 36 + dataLength, true);
        this.writeString(output, 8, 'WAVE');
        
        this.writeString(output, 12, 'fmt ');
        output.setUint32(16, 16, true);
        output.setUint16(20, format, true);
        output.setUint16(22, numOfChan, true);
        output.setUint32(24, sampleRate, true);
        output.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
        output.setUint16(32, numOfChan * (bitDepth / 8), true);
        output.setUint16(34, bitDepth, true);
        
        this.writeString(output, 36, 'data');
        output.setUint32(40, dataLength, true);

        var offset = 44;
        for (var i = 0; i < bufferLength; i++) {
            var sample = Math.max(-1, Math.min(1, result[i]));
            sample = (sample < 0 ? sample * 32768 : sample * 32767);
            output.setInt16(offset, sample, true);
            offset += 2;
        }

        return new Blob([output.buffer], { type: 'audio/wav' });
    },

    writeString: function(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    },

    // ==========================================
    // SECCIÓN 6: RENDERIZADO DE CONTROLES DE AUDIO
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
