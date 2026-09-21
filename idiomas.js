// --- RETÓRICA INTERNATIONALIZATION & ENGINE (IDIOMAS, AUTO-DETECCIÓN Y RESTAURACIÓN SINTÁCTICA) ---
var RetoricaI18n = {
    currentLang: 'en-GB', 
    currentVoiceLang: 'en-GB', 
    originalText: null,      // Texto original en que fue escrito antes de traducir
    originalTitle: null,     // Título original en que fue escrito
    originalLang: null,      // Idioma original registrado

    // 13 IDIOMAS EN ORDEN EXACTO
    langsOrder: [
        'ar-SA', // Árabe
        'ru-RU', // Ruso
        'de-DE', // Alemán
        'zh-HK', // Cantonés
        'zh-CN', // Chino Mandarín
        'ja-JP', // Japonés
        'es-MX', // Español
        'it-IT', // Italiano
        'uk-UA', // Ucraniano
        'hi-IN', // Hindi
        'pt-PT', // Portugués
        'fr-FR', // Francés
        'en-GB'  // Inglés
    ],

    // DICCIONARIO COMPLETO PARA LOS 13 IDIOMAS Y SUS BOTONES/SELECTOR
    db: {
        'ar-SA': { 
            name: 'العربية', install: 'تثبيت', save: 'حفظ', new: 'جديد', mic: 'إملأ', read: 'قراءة', 
            vmsg: 'صوت', tts: 'صوتيات', stop: 'إيقاف', copy: 'نسخ', doc: 'مستند', pdf: 'PDF', 
            pdfedit: 'تعديل PDF', fontminus: 'خط -', fontplus: 'خط +', color: 'لون', table: 'جدول', 
            import: 'استكشاف', sync: 'مزامنة', restore: 'استيراد', backup: 'تصدير', zoomin: 'تكبير', 
            zoomout: 'تصغير', theme: 'مظهر', langTxt: 'لغة', menu: 'قائمة', pTitle: 'عنوان...', pBody: 'اكتب هنا...',
            lang_ar: 'العربية', lang_ru: 'الروسية', lang_de: 'الألمانية', lang_zh_hk: 'الكانتونية', lang_zh_cn: 'الصينية',
            lang_ja: 'اليابانية', lang_es: 'الإسبانية', lang_it: 'الإيطالية', lang_uk: 'الأوكرانية', lang_hi: 'الهندية',
            lang_pt: 'البرتغالية', lang_fr: 'الفرنسية', lang_en: ' الإنجليزية'
        },
        'ru-RU': { 
            name: 'Русский', install: 'Установить', save: 'Сохранить', new: 'Новый', mic: 'Диктовать', read: 'Чтение', 
            vmsg: 'Голосовое Сообщение', tts: 'Текст Аудио', stop: 'Стоп', copy: 'Копировать', doc: 'Документ', pdf: 'PDF', 
            pdfedit: 'Редактируемый PDF', fontminus: 'Шрифт -', fontplus: 'Шрифт +', color: 'Цвет', table: 'Таблица', 
            import: 'Обзор', sync: 'Синхронизация', restore: 'Импорт', backup: 'Экспорт', zoomin: 'Приблизить', 
            zoomout: 'Отдалить', theme: 'Тема', langTxt: 'Язык', menu: 'Меню', pTitle: 'Заголовок...', pBody: 'Пишите здесь...',
            lang_ar: 'АРАБСКИЙ', lang_ru: 'РУССКИЙ', lang_de: 'НЕМЕЦКИЙ', lang_zh_hk: 'КАНТОНСКИЙ', lang_zh_cn: 'КИТАЙСКИЙ',
            lang_ja: 'ЯПОНСКИЙ', lang_es: 'ИСПАНСКИЙ', lang_it: 'ИТАЛЬЯНСКИЙ', lang_uk: 'УКРАИНСКИЙ', lang_hi: 'ХИНДИ',
            lang_pt: 'ПОРТУГАЛЬСКИЙ', lang_fr: 'ФРАНЦУЗСКИЙ', lang_en: 'АНГЛИЙСКИЙ'
        },
        'de-DE': { 
            name: 'Deutsch', install: 'Installieren', save: 'Speichern', new: 'Neu', mic: 'Diktieren', read: 'Lesen', 
            vmsg: 'Sprachnachricht', tts: 'Text Audio', stop: 'Stopp', copy: 'Kopieren', doc: 'Dokument', pdf: 'PDF', 
            pdfedit: 'PDF Editierbar', fontminus: 'Schrift -', fontplus: 'Schrift +', color: 'Farbe', table: 'Tabelle', 
            import: 'Durchsuchen', sync: 'Synchronisieren', restore: 'Importieren', backup: 'Exportieren', zoomin: 'Vergrößern', 
            zoomout: 'Verkleinern', theme: 'Design', langTxt: 'Sprache', menu: 'Menü', pTitle: 'Titel...', pBody: 'Schreiben Sie hier...',
            lang_ar: 'ARABISCH', lang_ru: 'RUSSISCH', lang_de: 'DEUTSCH', lang_zh_hk: 'KANTONESISCH', lang_zh_cn: 'CHINESISCH',
            lang_ja: 'JAPANISCH', lang_es: 'SPANISCH', lang_it: 'ITALIENISCH', lang_uk: 'UKRAINISCH', lang_hi: 'HINDI',
            lang_pt: 'PORTUGIESISCH', lang_fr: 'FRANZÖSISCH', lang_en: 'ENGLISCH'
        },
        'zh-HK': { 
            name: '粵語', install: '安裝', save: '儲存', new: '新建', mic: '聽寫', read: '朗讀', 
            vmsg: '語音訊息', tts: '文字音訊', stop: '停止', copy: '複製', doc: '文件', pdf: 'PDF', 
            pdfedit: '可編輯PDF', fontminus: '字型 -', fontplus: '字型 +', color: '顏色', table: '表格', 
            import: '瀏覽', sync: '同步', restore: '匯入', backup: '匯出', zoomin: '放大', 
            zoomout: '縮小', theme: '主題', langTxt: '語言', menu: '選單', pTitle: '標題...', pBody: '在此處撰寫...',
            lang_ar: '阿拉伯語', lang_ru: '俄語', lang_de: '德語', lang_zh_hk: '粵語', lang_zh_cn: '中文',
            lang_ja: '日語', lang_es: '西班牙語', lang_it: '義大利語', lang_uk: '烏克蘭語', lang_hi: '印地語',
            lang_pt: '葡萄牙語', lang_fr: '法語', lang_en: '英語'
        },
        'zh-CN': { 
            name: '中文', install: '安装', save: '保存', new: '新建', mic: '听写', read: '朗读', 
            vmsg: '语音消息', tts: '文本音频', stop: '停止', copy: '复制', doc: '文档', pdf: 'PDF', 
            pdfedit: '可编辑PDF', fontminus: '字体 -', fontplus: '字体 +', color: '颜色', table: '表格', 
            import: '浏览', sync: '同步', restore: '导入', backup: '导出', zoomin: '放大', 
            zoomout: '缩小', theme: '主题', langTxt: '语言', menu: '菜单', pTitle: '标题...', pBody: '在此处编写...',
            lang_ar: '阿拉伯语', lang_ru: '俄语', lang_de: '德语', lang_zh_hk: '粤语', lang_zh_cn: '中文',
            lang_ja: '日语', lang_es: '西班牙语', lang_it: '意大利语', lang_uk: '乌克兰语', lang_hi: '印地语',
            lang_pt: '葡萄牙语', lang_fr: '法语', lang_en: '英语'
        },
        'ja-JP': { 
            name: '日本語', install: '追加', save: '保存', new: '新規', mic: '口述', read: '再生', 
            vmsg: '音声メッセージ', tts: '文字音声', stop: '停止', copy: '複製', doc: '文書', pdf: 'PDF', 
            pdfedit: '編集可能PDF', fontminus: '文字 -', fontplus: '文字 +', color: '配色', table: '表', 
            import: '参照', sync: '同期', restore: '取込', backup: '導出', zoomin: '拡大', 
            zoomout: '縮小', theme: '基調', langTxt: '言語', menu: '献立', pTitle: '題名...', pBody: 'ここに書く...',
            lang_ar: 'アラビア語', lang_ru: 'ロシア語', lang_de: 'ドイツ語', lang_zh_hk: '広東語', lang_zh_cn: '中国語',
            lang_ja: '日本語', lang_es: 'スペイン語', lang_it: 'イタリア語', lang_uk: 'ウクライナ語', lang_hi: 'ヒンディー語',
            lang_pt: 'ポルトガル語', lang_fr: 'フランス語', lang_en: '英語'
        },
        'es-MX': { 
            name: 'Español (LATAM)', install: 'Instalar', save: 'Guardar', new: 'Nuevo', mic: 'Dictar', read: 'Lectura', 
            vmsg: 'Mensaje Voz', tts: 'Texto Audio', stop: 'Detener', copy: 'Copiar', doc: 'Documento', pdf: 'PDF', 
            pdfedit: 'PDF editable', fontminus: 'Fuente -', fontplus: 'Fuente +', color: 'Color', table: 'Tabla', 
            import: 'Explorar', sync: 'Sincronizar', restore: 'Importar', backup: 'Exportar', zoomin: 'Acercar', 
            zoomout: 'Alejar', theme: 'Tema', langTxt: 'Idioma', menu: 'Menú', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí...',
            lang_ar: 'ÁRABE', lang_ru: 'RUSO', lang_de: 'ALEMÁN', lang_zh_hk: 'CANTONÉS', lang_zh_cn: 'CHINO',
            lang_ja: 'JAPONÉS', lang_es: 'ESPAÑOL', lang_it: 'ITALIANO', lang_uk: 'UCRANIANO', lang_hi: 'HINDI',
            lang_pt: 'PORTUGUÉS', lang_fr: 'FRANCÉS', lang_en: 'INGLÉS'
        },
        'it-IT': { 
            name: 'Italiano', install: 'Installa', save: 'Salva', new: 'Nuovo', mic: 'Detta', read: 'Lettura', 
            vmsg: 'Messaggio Vocale', tts: 'Testo Audio', stop: 'Arresta', copy: 'Copia', doc: 'Documento', pdf: 'PDF', 
            pdfedit: 'PDF Modificabile', fontminus: 'Font -', fontplus: 'Font +', color: 'Colore', table: 'Tabella', 
            import: 'Esplora', sync: 'Sincronizza', restore: 'Importa', backup: 'Esporta', zoomin: 'Ingrandisci', 
            zoomout: 'Riduci', theme: 'Tema', langTxt: 'Lingua', menu: 'Menu', pTitle: 'Titolo...', pBody: 'Scrivi qui...',
            lang_ar: 'ARABO', lang_ru: 'RUSSO', lang_de: 'TEDESCO', lang_zh_hk: 'CANTONESE', lang_zh_cn: 'CINESE',
            lang_ja: 'GIAPPONESE', lang_es: 'SPAGNOLO', lang_it: 'ITALIANO', lang_uk: 'UCRAINO', lang_hi: 'HINDI',
            lang_pt: 'PORTOGHESE', lang_fr: 'FRANCESE', lang_en: 'INGLESE'
        },
        'uk-UA': { 
            name: 'Українська', install: 'Встановити', save: 'Зберегти', new: 'Новий', mic: 'Диктувати', read: 'Читати', 
            vmsg: 'Голосове Повідомлення', tts: 'Текст Аудіо', stop: 'Стоп', copy: 'Копіювати', doc: 'Документ', pdf: 'PDF', 
            pdfedit: 'Редагований PDF', fontminus: 'Шрифт -', fontplus: 'Шрифт +', color: 'Колір', table: 'Таблиця', 
            import: 'Огляд', sync: 'Синхронізація', restore: 'Імпорт', backup: 'Експорт', zoomin: 'Наблизити', 
            zoomout: 'Віддалити', theme: 'Тема', langTxt: 'Мова', menu: 'Меню', pTitle: 'Заголовок...', pBody: 'Пишіть тут...',
            lang_ar: 'АРАБСЬКА', lang_ru: 'РОСІЙСЬКА', lang_de: 'НІМЕЦЬКА', lang_zh_hk: 'КАНТОНСЬКА', lang_zh_cn: 'КИТАЙСЬКА',
            lang_ja: 'ЯПОНСЬКА', lang_es: 'ІСПАНСЬКА', lang_it: 'ІТАЛІЙСЬКА', lang_uk: 'УКРАЇНСЬКА', lang_hi: 'ХІНДІ',
            lang_pt: 'ПОРТУГАЛЬСЬКА', lang_fr: 'ФРАНЦУЗЬКА', lang_en: 'АНГЛІЙСЬКА'
        },
        'hi-IN': { 
            name: 'हिन्दी', install: 'स्थापित', save: 'सहेजें', new: 'नया', mic: 'बोलें', read: 'पढ़ें', 
            vmsg: 'वॉयस मैसेज', tts: 'पाठ ऑडियो', stop: 'रोकें', copy: 'कॉपी', doc: 'दस्तावेज़', pdf: 'PDF', 
            pdfedit: 'संपादन योग्य PDF', fontminus: 'फ़ॉन्ट -', fontplus: 'फ़ॉन्ट +', color: 'रंग', table: 'तालिका', 
            import: 'ब्राउज़', sync: 'सिंक', restore: 'आयात', backup: 'निर्यात', zoomin: 'ज़ूम +', 
            zoomout: 'ज़ूम -', theme: 'थीम', langTxt: 'भाषा', menu: 'सूची', pTitle: 'शीर्षक...', pBody: 'यहाँ लिखें...',
            lang_ar: 'अरबी', lang_ru: 'रूसी', lang_de: 'जर्मन', lang_zh_hk: 'कैंटोनीज़', lang_zh_cn: 'चीनी',
            lang_ja: 'जापानी', lang_es: 'स्पैनिश', lang_it: 'इतालवी', lang_uk: 'यूक्रेनी', lang_hi: 'हिंदी',
            lang_pt: 'पुर्तगाली', lang_fr: 'फ्रेंच', lang_en: 'अंग्रेज़ी'
        },
        'pt-PT': { 
            name: 'Português', install: 'Instalar', save: 'Guardar', new: 'Novo', mic: 'Ditar', read: 'Leitura', 
            vmsg: 'Mensagem Voz', tts: 'Texto Áudio', stop: 'Parar', copy: 'Copiar', doc: 'Documento', pdf: 'PDF', 
            pdfedit: 'PDF Editável', fontminus: 'Fonte -', fontplus: 'Fonte +', color: 'Cor', table: 'Tabela', 
            import: 'Explorar', sync: 'Sincronizar', restore: 'Importar', backup: 'Exportar', zoomin: 'Aproximar', 
            zoomout: 'Afastar', theme: 'Tema', langTxt: 'Idioma', menu: 'Menu', pTitle: 'Título...', pBody: 'Escreva aqui...',
            lang_ar: 'ÁRABE', lang_ru: 'RUSSO', lang_de: 'ALEMÃO', lang_zh_hk: 'CANTONÊS', lang_zh_cn: 'CHINÊS',
            lang_ja: 'JAPONÊS', lang_es: 'ESPANHOL', lang_it: 'ITALIANO', lang_uk: 'UCRANIANO', lang_hi: 'HINDI',
            lang_pt: 'PORTUGUÊS', lang_fr: 'FRANCÊS', lang_en: 'INGLÊS'
        },
        'fr-FR': { 
            name: 'Français', install: 'Installer', save: 'Enregistrer', new: 'Nouveau', mic: 'Dicter', read: 'Lecture', 
            vmsg: 'Message Vocal', tts: 'Texte Audio', stop: 'Arrêter', copy: 'Copier', doc: 'Document', pdf: 'PDF', 
            pdfedit: 'PDF Éditable', fontminus: 'Police -', fontplus: 'Police +', color: 'Couleur', table: 'Tableau', 
            import: 'Explorer', sync: 'Synchroniser', restore: 'Importer', backup: 'Exporter', zoomin: 'Zoom +', 
            zoomout: 'Zoom -', theme: 'Thème', langTxt: 'Langue', menu: 'Menu', pTitle: 'Titre...', pBody: 'Écrivez ici...',
            lang_ar: 'ARABE', lang_ru: 'RUSSE', lang_de: 'ALLEMAND', lang_zh_hk: 'CANTONAIS', lang_zh_cn: 'CHINOIS',
            lang_ja: 'JAPONAIS', lang_es: 'ESPAGNOL', lang_it: 'ITALIEN', lang_uk: 'UKRAINIEN', lang_hi: 'HINDI',
            lang_pt: 'PORTUGAIS', lang_fr: 'FRANÇAIS', lang_en: 'ANGLAIS'
        },
        'en-GB': { 
            name: 'English (UK)', install: 'Install', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', 
            vmsg: 'Voice Note', tts: 'Text Audio', stop: 'Stop', copy: 'Copy', doc: 'Document', pdf: 'PDF', 
            pdfedit: 'Editable PDF', fontminus: 'Font -', fontplus: 'Font +', color: 'Colour', table: 'Table', 
            import: 'Explore', sync: 'Synchronise', restore: 'Import', backup: 'Export', zoomin: 'Zoom In', 
            zoomout: 'Zoom Out', theme: 'Theme', langTxt: 'Language', menu: 'Menu', pTitle: 'Script Title...', pBody: 'Write or dictate here...',
            lang_ar: 'ARABIC', lang_ru: 'RUSSIAN', lang_de: 'GERMAN', lang_zh_hk: 'CANTONESE', lang_zh_cn: 'CHINESE',
            lang_ja: 'JAPANESE', lang_es: 'SPANISH', lang_it: 'ITALIAN', lang_uk: 'UKRAINIAN', lang_hi: 'HINDI',
            lang_pt: 'PORTUGUESE', lang_fr: 'FRENCH', lang_en: 'ENGLISH'
        }
    },

    // 1. INICIALIZACIÓN Y AUTO-DETECCIÓN
    init: function() {
        var rawSysLang = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en-GB').toLowerCase();
        
        var match = this.langsOrder.find(function(l) { return l.toLowerCase() === rawSysLang; });
        if (!match) {
            var sysCode = rawSysLang.split('-')[0];
            if (sysCode === 'pt') match = 'pt-PT';
            else if (sysCode === 'es') match = 'es-MX';
            else if (sysCode === 'zh') match = (rawSysLang.includes('hk') || rawSysLang.includes('tw') || rawSysLang.includes('yue')) ? 'zh-HK' : 'zh-CN';
            else if (sysCode === 'en') match = 'en-GB';
            else {
                match = this.langsOrder.find(function(l) { return l.toLowerCase().startsWith(sysCode); });
            }
        }

        var finalLang = match || 'en-GB';
        
        if (!this.originalLang) {
            this.originalLang = finalLang;
        }

        this.setAppLang(finalLang, false);
    },

    // 2. CAMBIO DE IDIOMA EN INTERFAZ Y RE-RENDERIZADO DE SELECCIÓN
    setAppLang: function(lang, shouldTranslateText) {
        if (shouldTranslateText === undefined) shouldTranslateText = true;
        
        this.currentLang = lang;
        this.currentVoiceLang = lang;
        var p = this.db[lang] || this.db['en-GB']; 

        function setText(id, text) {
            var el = document.getElementById(id);
            if (el && text !== undefined && text !== null && text !== '') {
                var words = text.trim().split(/\s+/);
                if (words.length > 1) {
                    el.innerHTML = '<span class="scroll-txt">' + text + '</span>';
                } else {
                    el.innerText = text;
                }
            }
        }

        // 24 Botones en Orden
        setText('lbl-nav-install', p.install);   
        setText('lbl-tool-save', p.save);         
        setText('lbl-tool-new', p.new);           
        setText('lbl-tool-mic', p.mic);           
        setText('lbl-tool-read', p.read);         
        setText('lbl-tool-vmsg', p.vmsg);         
        setText('lbl-tool-tts', p.tts);           
        setText('lbl-tool-stop', p.stop);         
        setText('lbl-tool-copyall', p.copy);      
        setText('lbl-tool-doc', p.doc);           
        setText('lbl-tool-pdf', p.pdf);           
        setText('lbl-tool-pdfedit', p.pdfedit);   
        setText('lbl-tool-fontminus', p.fontminus);
        setText('lbl-tool-fontplus', p.fontplus); 
        setText('lbl-tool-color', p.color);       
        setText('lbl-tool-table', p.table);       
        setText('lbl-tool-import', p.import);     
        setText('lbl-tool-sync', p.sync);         
        setText('lbl-tool-restore', p.restore);   
        setText('lbl-tool-backup', p.backup);     
        setText('lbl-tool-zoomin', p.zoomin);     
        setText('lbl-tool-zoomout', p.zoomout);   
        setText('lbl-nav-theme', p.theme);        
        setText('lbl-nav-langtxt', p.langTxt);    

        setText('lbl-nav-menu', p.menu);
        var tInput = document.getElementById('editor-title'); 
        if (tInput) tInput.placeholder = p.pTitle;

        // Re-renderizar el acordeón para actualizar las leyendas del selector al nuevo idioma
        var track = document.getElementById('accordion-slider-track');
        if (track && track.children.length > 0) {
            this.renderAccordionLanguages();
        }

        if (shouldTranslateText) {
            this.handleTextTranslation();
        }

        if (typeof RetoricaUI !== 'undefined' && RetoricaUI.notify) {
            RetoricaUI.notify("Idioma: " + p.name);
        }
    },

    toggleAccordion: function() {
        var panel = document.getElementById('accordion-languages');
        var arrow = document.getElementById('accordion-arrow');
        if (!panel) return;

        var isClosed = panel.classList.contains('accordion-closed');
        if (isClosed) {
            panel.classList.remove('accordion-closed');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
            
            var track = document.getElementById('accordion-slider-track');
            if (track && track.children.length === 0) {
                this.renderAccordionLanguages();
            }
        } else {
            panel.classList.add('accordion-closed');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    },

    // RENDERIZADO DINÁMICO DE LOS BOTONES DE IDIOMA CON SUS NOMBRES TRADUCIDOS AL IDIOMA ACTIVO
    renderAccordionLanguages: function() {
        var track = document.getElementById('accordion-slider-track');
        if (!track) return;
        track.innerHTML = '';

        var self = this;
        var fragment = document.createDocumentFragment();
        var p = this.db[this.currentLang] || this.db['en-GB'];

        var langKeyMap = {
            'ar-SA': p.lang_ar,
            'ru-RU': p.lang_ru,
            'de-DE': p.lang_de,
            'zh-HK': p.lang_zh_hk,
            'zh-CN': p.lang_zh_cn,
            'ja-JP': p.lang_ja,
            'es-MX': p.lang_es,
            'it-IT': p.lang_it,
            'uk-UA': p.lang_uk,
            'hi-IN': p.lang_hi,
            'pt-PT': p.lang_pt,
            'fr-FR': p.lang_fr,
            'en-GB': p.lang_en
        };

        this.langsOrder.forEach(function(langKey) {
            var wrapper = document.createElement('div');
            wrapper.className = 'btn-wrapper-3d';
            wrapper.setAttribute('data-lang', langKey);

            var label = document.createElement('div');
            label.className = 'btn-label-3d';
            
            var nameWord = langKeyMap[langKey] || langKey;
            
            if (nameWord.trim().split(/\s+/).length > 1) {
                label.innerHTML = '<span class="scroll-txt">' + nameWord + '</span>';
            } else {
                label.innerText = nameWord;
            }

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-round-3d';
            
            var iconSpan = document.createElement('span');
            iconSpan.className = 'icon-raw';
            
            if (langKey === 'zh-HK') iconSpan.innerText = 'ZH';
            else if (langKey === 'zh-CN') iconSpan.innerText = 'ZH';
            else iconSpan.innerText = langKey.substring(0, 2).toUpperCase();
            
            btn.appendChild(iconSpan);

            wrapper.appendChild(btn);
            wrapper.appendChild(label);

            wrapper.onclick = function(e) {
                if (e) e.stopPropagation();
                self.setAppLang(langKey, true);
                self.toggleAccordion();
            };

            fragment.appendChild(wrapper);
        });

        track.appendChild(fragment);
        this.updateAccordionStyles();
    },

    updateAccordionStyles: function() {
        var self = this;
        var wrappers = document.querySelectorAll('#accordion-slider-track .btn-wrapper-3d');
        
        wrappers.forEach(function(wrapper) {
            var langKey = wrapper.getAttribute('data-lang');
            var btn = wrapper.querySelector('.btn-round-3d');
            var isActive = (langKey === self.currentLang);

            if (isActive) {
                wrapper.className = 'btn-wrapper-3d active-wrapper';
                if (btn) btn.classList.add('active');
            } else {
                wrapper.className = 'btn-wrapper-3d';
                if (btn) btn.classList.remove('active');
            }
        });
    },

    // TRADUCCIÓN Y RESTAURACIÓN INTEGRAL
    handleTextTranslation: function() {
        var editor = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');
        if (!editor) return;

        var currentBodyText = editor.innerText || editor.textContent || "";
        var currentTitleText = titleInput ? titleInput.value : "";

        if (this.currentLang === this.originalLang && this.originalText !== null) {
            editor.innerText = this.originalText;
            if (titleInput && this.originalTitle !== null) titleInput.value = this.originalTitle;
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
            return;
        }

        if (this.originalText === null && currentBodyText.trim() !== '') {
            this.originalText = currentBodyText;
            this.originalTitle = currentTitleText;
        }

        var sel = window.getSelection();
        var selectedText = sel ? sel.toString().trim() : "";
        var targetClean = this.currentLang.split('-')[0];

        if (selectedText.length > 0) {
            this.translateSegment(selectedText, targetClean, function(translated) {
                var range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(translated));
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
            });
        } 
        else if (currentBodyText.trim().length > 0) {
            this.translateSegment(currentBodyText, targetClean, function(translated) {
                editor.innerText = translated;
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
            });
        }
    },

    translateSegment: function(text, targetLang, callback) {
        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=autodetect|" + targetLang;

        fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data && data.responseData && data.responseStatus === 200) {
                var translatedText = data.responseData.translatedText;
                if (translatedText && !translatedText.includes("INVALID SOURCE")) {
                    callback(translatedText);
                }
            }
        }).catch(function(err) {
            console.warn("Traducción omitida:", err);
        });
    }
};

window.addEventListener('DOMContentLoaded', function() {
    RetoricaI18n.init();
});
