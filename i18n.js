// Motor Multilingüe e Internacionalización para Retórica (Compatibilidad ES5 / Android 5+)

var I18nEngine = {
    currentLang: 'es',
    originalTextBuffer: '', // Búfer para restaurar el texto original sin alterar sintaxis
    
    // Lista de idiomas soportados (13 idiomas requeridos)
    supportedLangs: ['ar', 'ru', 'de', 'zh-canton', 'zh', 'ja', 'es', 'it', 'uk', 'hi', 'pt', 'fr', 'en'],

    // Diccionario de leyendas de interfaz
    translations: {
        'es': { 'app': 'Instalar', 'save': 'Guardar', 'new': 'Nuevo', 'mic': 'Dictar', 'read': 'Lectura', 'aud': 'A Audio', 'stop': 'Detener', 'rec': 'Grabar', 'copy': 'Copiar', 'doc': 'Word/PDF', 'sync': 'Sincro', 'theme': 'Tema', 'lang': 'Idiomas' },
        'en': { 'app': 'Install', 'save': 'Save', 'new': 'New', 'mic': 'Dictate', 'read': 'Read', 'aud': 'To Audio', 'stop': 'Stop', 'rec': 'Record', 'copy': 'Copy', 'doc': 'Word/PDF', 'sync': 'Sync', 'theme': 'Theme', 'lang': 'Languages' },
        'fr': { 'app': 'Installer', 'save': 'Garder', 'new': 'Nouveau', 'mic': 'Dicter', 'read': 'Lire', 'aud': 'En Audio', 'stop': 'Arrêter', 'rec': 'Enregistrer', 'copy': 'Copier', 'doc': 'Word/PDF', 'sync': 'Synchro', 'theme': 'Thème', 'lang': 'Langues' },
        'pt': { 'app': 'Instalar', 'save': 'Salvar', 'new': 'Novo', 'mic': 'Ditar', 'read': 'Ler', 'aud': 'Para Áudio', 'stop': 'Parar', 'rec': 'Gravar', 'copy': 'Copiar', 'doc': 'Word/PDF', 'sync': 'Sincro', 'theme': 'Tema', 'lang': 'Idiomas' },
        'de': { 'app': 'Installieren', 'save': 'Speichern', 'new': 'Neu', 'mic': 'Diktieren', 'read': 'Lesen', 'aud': 'Zu Audio', 'stop': 'Stoppen', 'rec': 'Aufnehmen', 'copy': 'Kopieren', 'doc': 'Word/PDF', 'sync': 'Synchr', 'theme': 'Thema', 'lang': 'Sprachen' },
        'it': { 'app': 'Installa', 'save': 'Salva', 'new': 'Nuovo', 'mic': 'Dettare', 'read': 'Leggere', 'aud': 'In Audio', 'stop': 'Fermare', 'rec': 'Registra', 'copy': 'Copia', 'doc': 'Word/PDF', 'sync': 'Sincro', 'theme': 'Tema', 'lang': 'Lingue' },
        'ru': { 'app': 'Скачать', 'save': 'Сохранить', 'new': 'Новый', 'mic': 'Диктовать', 'read': 'Читать', 'aud': 'В Аудио', 'stop': 'Стоп', 'rec': 'Запись', 'copy': 'Копировать', 'doc': 'Word/PDF', 'sync': 'Синхро', 'theme': 'Тема', 'lang': 'Языки' },
        'ar': { 'app': 'تثبيت', 'save': 'حفظ', 'new': 'جديد', 'mic': 'إملائي', 'read': 'قراءة', 'aud': 'إلى صوت', 'stop': 'إيقاف', 'rec': 'تسجيل', 'copy': 'نسخ', 'doc': 'Word/PDF', 'sync': 'مزامنة', 'theme': 'المظهر', 'lang': 'اللغات' },
        'ja': { 'app': 'インスール', 'save': '保存', 'new': '新規', 'mic': '音声入力', 'read': '読み上げ', 'aud': '音声変換', 'stop': '停止', 'rec': '録音', 'copy': 'コピー', 'doc': 'Word/PDF', 'sync': '同期', 'theme': 'テーマ', 'lang': '言語' },
        'zh': { 'app': '安装', 'save': '保存', 'new': '新建', 'mic': '听写', 'read': '朗读', 'aud': '转音频', 'stop': '停止', 'rec': '录音', 'copy': '复制', 'doc': 'Word/PDF', 'sync': '同步', 'theme': '主题', 'lang': '语言' },
        'hi': { 'app': 'इंस्टॉल', 'save': 'सहेजें', 'new': 'नया', 'mic': 'बोलें', 'read': 'पढ़ें', 'aud': 'ऑडियो', 'stop': 'रोकें', 'rec': 'रिकॉर्ड', 'copy': 'कॉपी', 'doc': 'Word/PDF', 'sync': 'सिंक', 'theme': 'थीम', 'lang': 'भाषाएं' },
        'uk': { 'app': 'Встановити', 'save': 'Зберегти', 'new': 'Новий', 'mic': 'Диктувати', 'read': 'Читати', 'aud': 'В Аудіо', 'stop': 'Стоп', 'rec': 'Запис', 'copy': 'Копіювати', 'doc': 'Word/PDF', 'sync': 'Синхро', 'theme': 'Тема', 'lang': 'Мови' },
        'zh-canton': { 'app': '安裝', 'save': '儲存', 'new': '新建', 'mic': '聽寫', 'read': '朗讀', 'aud': '轉音訊', 'stop': '停止', 'rec': '錄音', 'copy': '複製', 'doc': 'Word/PDF', 'sync': '同步', 'theme': '主題', 'lang': '語言' }
    },

    // 1. Detección automática del idioma del dispositivo
    initLanguage: function() {
        var userLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        var code = userLang.split('-')[0];

        if (this.translations[code]) {
            this.currentLang = code;
        } else {
            this.currentLang = 'en'; // Fallback a Inglés
        }
        
        this.applyLanguageUI(this.currentLang);
    },

    // 2. Aplicar cambio de idioma a las leyendas de los botones
    applyLanguageUI: function(langCode) {
        if (!this.translations[langCode]) return;
        this.currentLang = langCode;

        var dict = this.translations[langCode];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                var btnLabelElem = document.getElementById('label-btn-' + key);
                if (btnLabelElem) {
                    btnLabelElem.innerText = dict[key];
                    
                    // Reevaluar animación de marquesina según la longitud de la palabra
                    if (dict[key].length > 9 || dict[key].indexOf(' ') !== -1) {
                        btnLabelElem.classList.add('marquee');
                    } else {
                        btnLabelElem.classList.remove('marquee');
                    }
                }
            }
        }
    },

    // 3. Guardar estado del borrador original antes de modificar
    setOriginalText: function(text) {
        this.originalTextBuffer = text;
    },

    // 4. Restaurar el documento original intacto
    restoreOriginalText: function(editorElement) {
        if (editorElement && this.originalTextBuffer !== '') {
            editorElement.innerHTML = this.originalTextBuffer;
        }
    }
};
