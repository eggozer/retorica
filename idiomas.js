// --- RETÓRICA INTERNATIONALIZATION & TRANSLATION ENGINE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es-MX',
    langsOrder: ['es-MX', 'es-ES', 'en-GB', 'de-DE', 'ru-RU', 'fr-FR', 'zh-CN', 'ja-JP', 'ar-SA', 'hi-IN'],
    db: {
        'es-MX': { name: 'Español (MX)', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Mensaje\nVoz', tts: 'Texto\nA Voz', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí tu retórica...' },
        'es-ES': { name: 'Español (ES)', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Mensaje\nVoz', tts: 'Texto\nA Voz', pTitle: 'Titular de la Obra...', pBody: 'Escribe o dicta aquí tu obra...' },
        'en-GB': { name: 'English', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', stop: 'Abort', vmsg: 'Voice\nMsg', tts: 'Text\nVoice', pTitle: 'Script Title...', pBody: 'Write or dictate your rhetoric here...' },
        'de-DE': { name: 'Deutsch', save: 'Speichern', new: 'Neu', mic: 'Diktieren', read: 'Lesen', stop: 'Abbrechen', vmsg: 'Sprach\nNachr', tts: 'Text\nStimme', pTitle: 'Skripttitel...', pBody: 'Schreiben oder diktieren Sie hier...' },
        'ru-RU': { name: 'Русский', save: 'Сохранить', new: 'Новый', mic: 'Диктовка', read: 'Читать', stop: 'Отмена', vmsg: 'Голос', tts: 'Текст\nГолос', pTitle: 'Название...', pBody: 'Пишите здесь...' },
        'fr-FR': { name: 'Français', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', stop: 'Avorter', vmsg: 'Message\nVocal', tts: 'Texte\nVoix', pTitle: 'Titre du Scénario...', pBody: 'Écrivez ou dictez votre rhétorique ici...' },
        'zh-CN': { name: '中文', save: '保存', new: '新的', mic: '听写', read: '读', stop: '中止', vmsg: '语音', tts: '文字\n声音', pTitle: '剧本标题...', pBody: '在此处编写您的剧本...' },
        'ja-JP': { name: '日本語', save: '保存', new: '新', mic: '口述', read: '読む', stop: '中止', vmsg: '音声', tts: '文字\n音声', pTitle: 'タイトル...', pBody: 'ここにレトリックを書きます...' },
        'ar-SA': { name: 'العربية', save: 'حفظ', new: 'جديد', mic: 'إملاء', read: 'قراءة', stop: 'إحباط', vmsg: 'رسالة', tts: 'نص\nصوت', pTitle: 'عنوان النص...', pBody: 'اكتب أو أملي نصوصك هنا...' },
        'hi-IN': { name: 'हिन्दी', save: 'बचाना', new: 'नया', mic: 'श्रुतलेख', read: 'पढ़ना', stop: 'रद्द', vmsg: 'आवाज़', tts: 'पाठ\nआवाज़', pTitle: 'शीर्षक...', pBody: 'अपनी पटकथा यहाँ लिखें...' }
    },

    init: function() { this.setAppLang(this.currentLang); },

    toggleAppLang: function() {
        var idx = this.langsOrder.indexOf(this.currentLang);
        var nextIdx = (idx + 1) % this.langsOrder.length;
        this.setAppLang(this.langsOrder[nextIdx]);
    },

    setAppLang: function(lang) {
        this.currentLang = lang;
        var p = this.db[lang] || this.db['es-MX'];
        
        // PUNTO 9: Asignación dinámica completa sin omitir caracteres
        var btnSave = document.getElementById('lbl-tool-save'); if(btnSave) btnSave.innerText = p.save;
        var btnNew = document.getElementById('lbl-tool-new'); if(btnNew) btnNew.innerText = p.new;
        var btnMic = document.getElementById('lbl-tool-mic'); if(btnMic) btnMic.innerText = p.mic;
        var btnRead = document.getElementById('lbl-tool-read'); if(btnRead) btnRead.innerText = p.read;
        var btnStop = document.getElementById('lbl-tool-stop'); if(btnStop) btnStop.innerText = p.stop;
        var btnVmsg = document.getElementById('lbl-tool-vmsg'); if(btnVmsg) btnVmsg.innerText = p.vmsg;
        var btnTts = document.getElementById('lbl-tool-tts'); if(btnTts) btnTts.innerText = p.tts;
        
        var tInput = document.getElementById('editor-title'); if(tInput) tInput.placeholder = p.pTitle;
        var bInput = document.getElementById('editor-body'); if(bInput) bInput.placeholder = p.pBody;
        
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Idioma Activo: " + p.name);
        this.checkAndTranslateSelection(lang);
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
        var cleanLang = targetLang.split('-')[0];
        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(selectedText) + "&langpair=auto|" + cleanLang;

        fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.responseData) {
                    var translatedText = data.responseData.translatedText;
                    var fullText = editor.value;
                    editor.value = fullText.substring(0, start) + translatedText + fullText.substring(end);
                    editor.setSelectionRange(start, start + translatedText.length);
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.triggerAutoSave();
                        RetoricaUI.notify("Interpretación aplicada ✓");
                    }
                }
            }).catch(function() {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error de red en la interpretación.");
            });
    }
};
