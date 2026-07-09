// --- RETÓRICA INTERNATIONALIZATION MODULE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es',
    langsOrder: ['es', 'en', 'fr', 'pt'],
    db: {
        'es': { name: 'Español', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Detener', vmsg: 'Msj Voz', tts: 'Texto Voz', lib: 'Biblioteca', title: 'BIBLIOTECA DE GUIONES', import: 'Abrir', exit: 'Salir', write: 'Escribe o dicta tu guion aquí. Puedes arrastrar imágenes o insertar tablas dinámicas...', header: 'Herramientas Avanzadas de Formato y Maquetación' },
        'en': { name: 'English', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', stop: 'Stop', vmsg: 'Voice Msg', tts: 'Text Voice', lib: 'Library', title: 'SCRIPTS LIBRARY', import: 'Open', exit: 'Exit', write: 'Write or dictate your script here. You can drag images or insert dynamic tables...', header: 'Advanced Formatting & Layout Tools' },
        'fr': { name: 'Français', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', stop: 'Arrêter', vmsg: 'Msg Vocal', tts: 'Texte Voix', lib: 'Bibliothèque', title: 'BIBLIOTHÈQUE DE SCRIPTS', import: 'Ouvrir', exit: 'Quitter', write: 'Écrivez ou dictez votre script ici. Vous pouvez glisser des images ou insérer des tableaux...', header: 'Outils de Formatage et de Mise en Page Avancés' },
        'pt': { name: 'Português', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', stop: 'Parar', vmsg: 'Msg Voz', tts: 'Texto Voz', lib: 'Biblioteca', title: 'BIBLIOTECA DE SCRIPTS', import: 'Abrir', exit: 'Sair', write: 'Escreva ou dite seu roteiro aqui. Você pode arrastar imagens ou inserir tabelas...', header: 'Ferramentas Avançadas de Formatação e Layout' }
    },

    init: function() {
        this.setAppLang(this.currentLang);
    },

    toggleAppLang: function() {
        var idx = this.langsOrder.indexOf(this.currentLang);
        var nextIdx = (idx + 1) % this.langsOrder.length;
        this.setAppLang(this.langsOrder[nextIdx]);
    },

    // CORRECCIÓN PUNTO 9: Traduce absolutamente toda la interfaz unificada al cambiar de idioma sin límites
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
        if (document.getElementById('lbl-tool-lib')) document.getElementById('lbl-tool-lib').innerText = p.lib;
        
        if (document.getElementById('lbl-side-title')) document.getElementById('lbl-side-title').innerText = p.title;
        if (document.getElementById('lbl-side-import')) document.getElementById('lbl-side-import').innerText = p.import;
        if (document.getElementById('lbl-side-exit')) document.getElementById('lbl-side-exit').innerText = p.exit;
        if (document.getElementById('lbl-panel-header')) document.getElementById('lbl-panel-header').innerText = p.header;
        
        var editor = document.getElementById('editor-body');
        if (editor) {
            editor.setAttribute('placeholder', p.write);
        }
        
        RetoricaUI.notify("Idioma: " + p.name);
    }
};
