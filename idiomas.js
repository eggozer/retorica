var RetoricaI18n = {
    currentLang: 'es',
    langsOrder: ['es', 'en', 'fr', 'pt'],
    db: {
        'es': { name: 'Español', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Prod.\nAudio', tts: 'Texto\nA Voz' },
        'en': { name: 'English', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', stop: 'Abort', vmsg: 'Voice\nProd', tts: 'Text\nTo Voice' },
        'fr': { name: 'Français', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', stop: 'Avorter', vmsg: 'Prod\nAudio', tts: 'Texte\nA Voix' },
        'pt': { name: 'Português', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', stop: 'Abortar', vmsg: 'Prod\nÁudio', tts: 'Texto\nPara Voz' }
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
