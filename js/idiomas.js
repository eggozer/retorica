// --- RETÓRICA INTERNATIONALIZATION MODULE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es',
    db: {
        'es': { name: 'Español', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', vmsg: 'Msj Voz', render: 'Render', zoom: 'Zoom', theme: 'Tema', langApp: 'Idioma App', langText: 'Traducir', sync: 'Sincronizar', logout: 'Salir', export: 'Exportar' },
        'en': { name: 'English', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', vmsg: 'Voice Msg', render: 'Render', zoom: 'Zoom', theme: 'Theme', langApp: 'App Lang', langText: 'Translate', sync: 'Sync', logout: 'Logout', export: 'Export' },
        'fr': { name: 'Français', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', vmsg: 'Msg Voc', render: 'Rendre', zoom: 'Zoom', theme: 'Thème', langApp: 'Langue App', langText: 'Traduire', sync: 'Sincroniser', logout: 'Quitter', export: 'Exporter' },
        'pt': { name: 'Português', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', vmsg: 'Msg Voz', render: 'Render', zoom: 'Zoom', theme: 'Tema', langApp: 'Idioma App', langText: 'Traduzir', sync: 'Sincronizar', logout: 'Sair', export: 'Exportar' }
    },

    init: function() {
        var selApp = document.getElementById('lang-selector-app');
        var selText = document.getElementById('lang-selector-text');
        
        if (selApp && selText) {
            selApp.innerHTML = "";
            selText.innerHTML = "";
            for (var key in this.db) {
                if (!this.db.hasOwnProperty(key)) continue;
                var opt = document.createElement('option');
                opt.value = key;
                opt.innerText = this.db[key].name;
                selApp.appendChild(opt.cloneNode(true));
                selText.appendChild(opt);
            }
        }
    },

    setAppLang: function(lang) {
        this.currentLang = lang;
        var p = this.db[lang] || this.db['es'];
        
        // Bloque de inyección con validación de existencia física del nodo
        if (document.getElementById('lbl-tool-save')) document.getElementById('lbl-tool-save').innerText = p.save;
        if (document.getElementById('lbl-tool-new')) document.getElementById('lbl-tool-new').innerText = p.new;
        if (document.getElementById('lbl-tool-mic')) document.getElementById('lbl-tool-mic').innerText = p.mic;
        if (document.getElementById('lbl-tool-read')) document.getElementById('lbl-tool-read').innerText = p.read;
        if (document.getElementById('lbl-tool-vmsg')) document.getElementById('lbl-tool-vmsg').innerText = p.vmsg;
        if (document.getElementById('lbl-tool-render')) document.getElementById('lbl-tool-render').innerText = p.render;
        if (document.getElementById('lbl-tool-zoom')) document.getElementById('lbl-tool-zoom').innerText = p.zoom;
        if (document.getElementById('lbl-tool-theme')) document.getElementById('lbl-tool-theme').innerText = p.theme;
        if (document.getElementById('lbl-tool-langapp')) document.getElementById('lbl-tool-langapp').innerText = p.langApp;
        if (document.getElementById('lbl-tool-langtext')) document.getElementById('lbl-tool-langtext').innerText = p.langText;
        if (document.getElementById('lbl-side-sync')) document.getElementById('lbl-side-sync').innerText = p.sync;
        if (document.getElementById('lbl-side-logout')) document.getElementById('lbl-side-logout').innerText = p.logout;
        if (document.getElementById('lbl-side-export')) document.getElementById('lbl-side-export').innerText = p.export;
        
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Idioma cambiado: " + p.name);
        }
    },

    translateText: function(lang) {
        var p = this.db[lang] || this.db['es'];
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Preparando traducción de lienzo a: " + p.name);
        }
    }
};
