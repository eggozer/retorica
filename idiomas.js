// --- RETÓRICA INTERNATIONALIZATION MODULE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es',
    langsOrder: ['es', 'en', 'fr', 'pt'],
    db: {
        db: {
        'es': { name: 'Español', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Prod.\nAudio', tts: 'Texto\nA Voz' },
        'en': { name: 'English', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', stop: 'Abort', vmsg: 'Voice\nProd', tts: 'Text\nTo Voice' },
        'fr': { name: 'Français', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', stop: 'Avorter', vmsg: 'Prod\nAudio', tts: 'Texte\nA Voix' },
        'pt': { name: 'Português', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', stop: 'Abortar', vmsg: 'Prod\nÁudio', tts: 'Texto\nPara Voz' },
        
        idiomasSoportados: [
            { code: 'es-MX', name: 'Español (México)' },
            { code: 'es-ES', name: 'Español (España)' },
            { code: 'es-US', name: 'Español (Estados Unidos)' },
            { code: 'en-US', name: 'English (United States)' },
            { code: 'en-GB', name: 'English (United Kingdom)' },
            { code: 'fr-FR', name: 'Français (France)' },
            { code: 'de-DE', name: 'Deutsch (Deutschland)' },
            { code: 'it-IT', name: 'Italiano (Italia)' },
            { code: 'pt-BR', name: 'Português (Brasil)' },
            { code: 'pt-PT', name: 'Português (Portugal)' },
            { code: 'ru-RU', name: 'Русский (Россия)' },
            { code: 'zh-CN', name: '中文 (简体)' },
            { code: 'ja-JP', name: '日本語 (日本)' },
            { code: 'ko-KR', name: '한국어 (대한민국)' },
            { code: 'ar-SA', name: 'العربية (السعودية)' },
            { code: 'hi-IN', name: 'हिन्दी (भारत)' },
            { code: 'it-CH', name: 'Italiano (Svizzera)' },
            { code: 'nl-NL', name: 'Nederlands (Nederland)' },
            { code: 'pl-PL', name: 'Polski (Polska)' },
            { code: 'tr-TR', name: 'Türkçe (Türkiye)' },
            { code: 'vi-VN', name: 'Tiếng Việt (Việt Nam)' },
            { code: 'sv-SE', name: 'Svenska (Sverige)' },
            { code: 'no-NO', name: 'Norsk bokmål (Norge)' },
            { code: 'da-DK', name: 'Dansk (Danmark)' },
            { code: 'fi-FI', name: 'Suomi (Suomi)' },
            { code: 'el-GR', name: 'Ελληνικά (Ελλάδα)' },
            { code: 'he-IL', name: 'עбриרת (ישראל)' },
            { code: 'id-ID', name: 'Bahasa Indonesia (Indonesia)' },
            { code: 'th-TH', name: 'ไทย (ประเทศไทย)' },
            { code: 'ca-ES', name: 'Català (Espanya)' }
    ]
};
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
        var p = this.db[lang] || this.db['es'];
        
        if (document.getElementById('lbl-tool-save')) document.getElementById('lbl-tool-save').innerText = p.save;
        if (document.getElementById('lbl-tool-new')) document.getElementById('lbl-tool-new').innerText = p.new;
        if (document.getElementById('lbl-tool-mic')) document.getElementById('lbl-tool-mic').innerText = p.mic;
        if (document.getElementById('lbl-tool-read')) document.getElementById('lbl-tool-read').innerText = p.read;
        if (document.getElementById('lbl-tool-stop')) document.getElementById('lbl-tool-stop').innerText = p.stop;
        if (document.getElementById('lbl-tool-vmsg')) document.getElementById('lbl-tool-vmsg').innerText = p.vmsg;
        if (document.getElementById('lbl-tool-tts')) document.getElementById('lbl-tool-tts').innerText = p.tts;
        
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Idioma: " + p.name);
        }
    },

    translateText: function(lang) {
        var p = this.db[lang] || this.db['es'];
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Traducción activa a: " + p.name);
        }
    }
};
