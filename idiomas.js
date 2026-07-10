// --- RETÓRICA INTERNATIONALIZATION & TRANSLATION ENGINE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es-MX',
    langsOrder: ['es-MX', 'es-ES', 'en-GB', 'de-DE', 'ru-RU', 'fr-FR', 'zh-CN', 'ja-JP', 'zh-HK', 'ar-SA', 'hi-IN'],
    db: {
        'es-MX': { name: 'Español (Latam)', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'Título del Guion...', placeholderBody: 'Escribe o dicta aquí tu retórica...' },
        'es-ES': { name: 'Español (España)', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'Titular del Guion...', placeholderBody: 'Escribe o dicta aquí tu obra...' },
        'en-GB': { name: 'English (UK)', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'Script Title...', placeholderBody: 'Write or dictate your rhetoric here...' },
        'de-DE': { name: 'Deutsch', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'Skripttitel...', placeholderBody: 'Schreiben oder diktieren Sie hier...' },
        'ru-RU': { name: 'Русский', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'Название сценария...', placeholderBody: 'Пишите или диктуйте свою риторику здесь...' },
        'fr-FR': { name: 'Français', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'Titre du Scénario...', placeholderBody: 'Écrivez ou dictez votre rhétorique ici...' },
        'zh-CN': { name: '中文 (简体)', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: '剧本标题...', placeholderBody: '在此处编写或听写您的剧本...' },
        'ja-JP': { name: '日本語', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: '台本のタイトル...', placeholderBody: 'ここにレトリックを書き留めるか口述します...' },
        'zh-HK': { name: '廣東話 (Cantonés)', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: '劇本標題...', placeholderBody: '在此處編寫或聽寫您的劇本...' },
        'ar-SA': { name: 'العربية', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'عنوان النص...', placeholderBody: 'اكتب أو أملي نصوصك هنا...' },
        'hi-IN': { name: 'हिन्दी', save: '✓', new: '+', mic: '🎙️', read: '👁', stop: '🛑', vmsg: '▶', tts: '🔊', placeholderTitle: 'पटकथा का शीर्षक...', placeholderBody: 'अपनी पटकथा यहाँ लिखें या बोलकर टाइप करें...' }
    },

    init: function() {
        this.setAppLang(this.currentLang);
    },

    toggleAppLang: function() {
        var idx = this.langsOrder.indexOf(this.currentLang);
        var nextIdx = (idx + 1) % this.langsOrder.length;
        this.setAppLang(this.langsOrder[nextIdx]);
    },

    setAppLang: function(lang) {
        this.currentLang = lang;
        var p = this.db[lang] || this.db['es-MX'];
        
        // Actualizar interfaz dinámica de botones superiores
        if (document.getElementById('lbl-tool-save')) document.getElementById('lbl-tool-save').innerText = (lang.startsWith('es') ? 'Guardar' : 'Save');
        if (document.getElementById('lbl-tool-new')) document.getElementById('lbl-tool-new').innerText = (lang.startsWith('es') ? 'Nuevo' : 'New');
        if (document.getElementById('lbl-tool-mic')) document.getElementById('lbl-tool-mic').innerText = (lang.startsWith('es') ? 'Dictado' : 'Dictate');
        if (document.getElementById('lbl-tool-read')) document.getElementById('lbl-tool-read').innerText = (lang.startsWith('es') ? 'Lectura' : 'Read');
        if (document.getElementById('lbl-tool-stop')) document.getElementById('lbl-tool-stop').innerText = (lang.startsWith('es') ? 'Abortar' : 'Abort');
        
        // Cambiar Placeholders del área de trabajo integrada
        var titleInput = document.getElementById('editor-title');
        var bodyInput = document.getElementById('editor-body');
        if (titleInput) titleInput.placeholder = p.placeholderTitle;
        if (bodyInput) bodyInput.placeholder = p.placeholderBody;
        
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Idioma Activo: " + p.name);
        }

        // FUNCIÓN CLAVE: Si el usuario seleccionó texto, procesar la traducción al cambiar de idioma
        this.checkAndTranslateSelection(lang);
    },

    checkAndTranslateSelection: function(targetLang) {
        var editor = document.getElementById('editor-body');
        if (!editor) return;

        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        if (start === end) return; // No hay texto seleccionado, no hace nada (aplica para escribir/dictar directo)

        var selectedText = editor.value.substring(start, end);
        if (!selectedText.trim()) return;

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Traduciendo selección a " + this.db[targetLang].name + "...");
        }

        // Consumo del motor de traducción libre e inteligente MyMemory API
        var self = this;
        var cleanLang = targetLang.split('-')[0]; // Extrae 'en', 'es', 'fr', etc.
        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(selectedText) + "&langpair=auto|" + cleanLang;

        fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.responseData) {
                    var translatedText = data.responseData.translatedText;
                    var fullText = editor.value;
                    // Reemplaza exactamente el fragmento seleccionado con la interpretación correcta
                    editor.value = fullText.substring(0, start) + translatedText + fullText.substring(end);
                    editor.setSelectionRange(start, start + translatedText.length);
                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        RetoricaUI.notify("Texto interpretado con éxito ✓");
                    }
                }
            })
            .catch(function() {
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.notify("Error de red en la interpretación.");
                }
            });
    }
};
