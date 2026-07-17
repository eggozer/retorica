// --- RETÓRICA INTERNATIONALIZATION & TRANSLATION ENGINE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es-MX',
    currentVoiceLang: 'es-MX', // Control independiente para acento de lectura
    
    // 13 Idiomas ordenados alfabéticamente de forma estricta por su nombre de visualización
    langsOrder: ['ar-SA', 'zh-CN', 'de-DE', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'hi-IN', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'uk-UA'],
    
    db: {
        'ar-SA': { name: 'Al-Arabiya', save: 'حفظ', new: 'جديد', mic: 'إملاء', read: 'قراءة', stop: 'إحباط', vmsg: 'رسالة', tts: 'نص\nصوت', pTitle: 'عنوان النص...', pBody: 'اكتب أو أملي نصوصك هنا...' },
        'zh-CN': { name: 'Chinese', save: '保存', new: '新的', mic: '听写', read: '读', stop: '中止', vmsg: '语音', tts: '文字\n声音', pTitle: '剧本标题...', pBody: '在此处编写您的剧本...' },
        'de-DE': { name: 'Deutsch', save: 'Speichern', new: 'Neu', mic: 'Diktieren', read: 'Lesen', stop: 'Abbrechen', vmsg: 'Sprach\nNachr', tts: 'Text\nStimme', pTitle: 'Skripttitel...', pBody: 'Schreiben oder diktieren Sie hier...' },
        'en-GB': { name: 'English', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', stop: 'Abort', vmsg: 'Voice\nMsg', tts: 'Text\nVoice', pTitle: 'Script Title...', pBody: 'Write or dictate your rhetoric here...' },
        'es-ES': { name: 'Español (ES)', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Mensaje\nVoz', tts: 'Texto\nA Voz', pTitle: 'Titular de la Obra...', pBody: 'Escribe o dicta aquí tu obra...' },
        'es-MX': { name: 'Español (MX)', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Mensaje\nVoz', tts: 'Texto\nA Voz', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí tu retórica...' },
        'fr-FR': { name: 'Français', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', stop: 'Avorter', vmsg: 'Message\nVocal', tts: 'Texte\nVoix', pTitle: 'Titre du Scénario...', pBody: 'Écrivez ou dictez votre rhétorique ici...' },
        'hi-IN': { name: 'Hindi', save: 'बचाना', new: 'नया', mic: 'श्रुतलेख', read: 'पढ़ना', stop: 'रद्द', vmsg: 'आवाज़', tts: 'पाठ\nआवाज़', pTitle: 'शीर्षक...', pBody: 'अपनी पटकथा यहाँ लिखें...' },
        'it-IT': { name: 'Italiano', save: 'Salva', new: 'Nuovo', mic: 'Dettato', read: 'Lettura', stop: 'Interrompi', vmsg: 'Mess\nVocal', tts: 'Testo\nVoce', pTitle: 'Titolo dello Script...', pBody: 'Scrivi o detta qui la tua retorica...' },
        'ja-JP': { name: 'Japanese', save: '保存', new: '新', mic: '口述', read: '読む', stop: '中止', vmsg: '音声', tts: '文字\n音声', pTitle: 'タイトル...', pBody: 'ここにレトリックを書きます...' },
        'pt-PT': { name: 'Português', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', stop: 'Abortar', vmsg: 'Mensagem\nVoz', tts: 'Texto\nVoz', pTitle: 'Título do Roteiro...', pBody: 'Escreva ou dite sua retórica aqui...' },
        'ru-RU': { name: 'Русский', save: 'Сохранить', new: 'Новый', mic: 'Диктовка', read: 'Читать', stop: 'Отмена', vmsg: 'Голос', tts: 'Текст\nГолос', pTitle: 'Название...', pBody: 'Пишите здесь...' },
        'uk-UA': { name: 'Ukrainian', save: 'Зберегти', new: 'Новий', mic: 'Диктувати', read: 'Читати', stop: 'Перервати', vmsg: 'Голос\nПовід', tts: 'Текст\nГолос', pTitle: 'Назва Сценарію...', pBody: 'Пишіть або диктуйте риторику тут...' }
    },

    init: function() { this.setAppLang(this.currentLang); },

    setAppLang: function(lang) {
        this.currentLang = lang;
        var p = this.db[lang] || this.db['es-MX'];
        
        var btnSave = document.getElementById('lbl-tool-save'); if(btnSave) btnSave.innerText = p.save;
        var btnNew = document.getElementById('lbl-tool-new'); if(btnNew) btnNew.innerText = p.new;
        var btnMic = document.getElementById('lbl-tool-mic'); if(btnMic) btnMic.innerText = p.mic;
        var btnRead = document.getElementById('lbl-tool-read'); if(btnRead) btnRead.innerText = p.read;
        var btnStop = document.getElementById('lbl-tool-stop'); if(btnStop) btnStop.innerText = p.stop;
        var btnVmsg = document.getElementById('lbl-tool-vmsg'); if(btnVmsg) btnVmsg.innerText = p.vmsg;
        var btnTts = document.getElementById('lbl-tool-tts'); if(btnTts) btnTts.innerText = p.tts;
        
        var tInput = document.getElementById('editor-title'); if(tInput) tInput.placeholder = p.pTitle;
        var bInput = document.getElementById('editor-body'); if(bInput) bInput.placeholder = p.pBody;
        
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Idioma de la App: " + p.name);
        this.checkAndTranslateSelection(lang);
    },

    // ABRE EL PANEL Y CONSTRUIRE EL MENU DESLIZABLE EN TIEMPO REAL
    openCarousel: function(type) {
        var panel = document.getElementById('carousel-panel-languages');
        var track = document.getElementById('carousel-slider-track');
        if (!panel || !track) return;

        var isVisible = panel.style.display === 'block';
        // Si ya está abierto con el mismo tipo, lo cerramos; si es tipo diferente, lo actualizamos
        if (isVisible && panel.dataset.currentType === type) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';
        panel.dataset.currentType = type;
        this.renderCarouselTracks(type);
    },

    renderCarouselTracks: function(type) {
        var track = document.getElementById('carousel-slider-track');
        if (!track) return;
        track.innerHTML = '';

        var self = this;
        var activeLang = (type === 'text') ? this.currentLang : this.currentVoiceLang;
        var activeIndex = this.langsOrder.indexOf(activeLang);

        // Forzar contenedor ultra-deslizable y centrado sin recortes laterales
        track.style.display = 'flex';
        track.style.overflowX = 'auto';
        track.style.justifyContent = 'flex-start'; // Permite que todos los elementos se alineen bien en orden
        track.style.alignItems = 'center';
        track.style.width = '100%';
        track.style.padding = '5px 40px'; // Márgenes de seguridad a los lados
        track.style.boxSizing = 'border-box';

        this.langsOrder.forEach(function(langKey, idx) {
            var item = self.db[langKey];
            var langDiv = document.createElement('div');
            
            langDiv.style.flex = '0 0 auto';
            langDiv.style.scrollSnapAlign = 'center';
            langDiv.style.padding = '8px 16px';
            langDiv.style.margin = '0 8px'; // Espaciado balanceado entre idiomas
            langDiv.style.borderRadius = '20px';
            langDiv.style.fontSize = '0.75rem';
            langDiv.style.fontWeight = 'bold';
            langDiv.style.cursor = 'pointer';
            langDiv.style.transition = 'all 0.2s';

            if (idx === activeIndex) {
                langDiv.style.background = 'var(--text-main)';
                langDiv.style.color = 'var(--bg-main)';
                langDiv.style.transform = 'scale(1.1)';
            } else {
                langDiv.style.background = 'var(--btn-3d-bg)';
                langDiv.style.color = 'var(--text-muted)';
                langDiv.style.opacity = '0.7';
            }

            langDiv.innerText = item.name;

            langDiv.onclick = function() {
                if (type === 'text') {
                    self.setAppLang(langKey);
                } else {
                    self.currentVoiceLang = langKey;
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Acento de Lectura: " + item.name);
                }
                self.renderCarouselTracks(type);
                langDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            };

            track.appendChild(langDiv);
        });

        // Asegura que no se pegue ni se pierda el foco inicial en móviles
        setTimeout(function() {
            var activeElement = track.children[activeIndex];
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest', inline: 'center' });
            }
        }, 150);
    },

    checkAndTranslateSelection: function(targetLang) {
        var editor = document.getElementById('editor-body');
        if (!editor) return;
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        if (start === end) return; 

        var selectedText = editor.value.substring(start, end);
        if (!selectedText.trim()) return;

        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Traduciendo fragmento...");
        
        var sourceClean = this.currentLang.split('-')[0];
        var targetClean = targetLang.split('-')[0];
        if (sourceClean === targetClean) return;

        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(selectedText) + "&langpair=" + sourceClean + "|" + targetClean;

        fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.responseData && data.responseStatus === 200) {
                    var translatedText = data.responseData.translatedText;
                    if (!translatedText || translatedText.includes("INVALID SOURCE LANGUAGE")) {
                        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error: Respuesta inválida.");
                        return;
                    }

                    var fullText = editor.value;
                    editor.value = fullText.substring(0, start) + translatedText + fullText.substring(end);
                    editor.setSelectionRange(start, start + translatedText.length);
                    
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.triggerAutoSave();
                        RetoricaUI.notify("Interpretación aplicada ✓");
                    }
                } else {
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Servidor ocupado. Intenta de nuevo.");
                }
            }).catch(function() {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error de red. Texto protegido.");
            });
    }
};
