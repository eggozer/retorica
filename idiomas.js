// --- RETÓRICA INTERNATIONALIZATION & ENGINE (IDIOMAS, AUTO-DETECCIÓN Y RESTAURACIÓN SINTÁCTICA) ---
var RetoricaI18n = {
    currentLang: 'en-GB', 
    currentVoiceLang: 'en-GB', 
    originalText: null,      // Texto original en que fue escrito antes de traducir
    originalTitle: null,     // Título original en que fue escrito
    originalLang: null,      // Idioma original registrado

    // 13 IDIOMAS EN ORDEN EXACTO SOLICITADO
    langsOrder: [
        'ar-SA', // Árabe
        'ru-RU', // Ruso
        'de-DE', // Alemán
        'zh-HK', // Cantones
        'zh-CN', // Chino
        'ja-JP', // Japonés
        'es-MX', // Español de Latinoamérica
        'it-IT', // Italiano
        'uk-UA', // Ucrania
        'hi-IN', // India (Hindi)
        'pt-PT', // Portugués
        'fr-FR', // Francés
        'en-GB'  // Inglés de Inglaterra
    ],
    
    // Nombres de idiomas en una sola palabra para el acordeón de selección
    singleWordLangs: {
        'ar-SA': 'العربية',
        'ru-RU': 'Русский',
        'de-DE': 'Deutsch',
        'zh-HK': '粵語',
        'zh-CN': '中文',
        'ja-JP': '日本語',
        'es-MX': 'Español',
        'it-IT': 'Italiano',
        'uk-UA': 'Українська',
        'hi-IN': 'हिन्दी',
        'pt-PT': 'Português',
        'fr-FR': 'Français',
        'en-GB': 'English'
    },

    // Diccionario de los 24 botones y elementos con soporte de 1 palabra o scroll automático
    db: {
        'ar-SA': { 
            name: 'العربية', install: 'تثبيت', save: 'حفظ', new: 'جديد', mic: 'إملأ', read: 'قراءة', 
            vmsg: 'صوت', tts: 'صوتيات', stop: 'إيقاف', copy: 'نسخ', doc: 'مستند', pdf: 'PDF', 
            pdfedit: 'تعديل PDF', fontminus: 'خط -', fontplus: 'خط +', color: 'لون', table: 'جدول', 
            import: 'استكشاف', sync: 'مزامنة', restore: 'استيراد', backup: 'تصدير', zoomin: 'تكبير', 
            zoomout: 'تصغير', theme: 'مظهر', langTxt: 'لغة', menu: 'قائمة', pTitle: 'عنوان...', pBody: 'اكتب هنا...' 
        },
        'ru-RU': { 
            name: 'Русский', install: 'Установить', save: 'Сохранить', new: 'Новый', mic: 'Диктовать', read: 'Чтение', 
            vmsg: 'Голосовое Сообщение', tts: 'Текст Аудио', stop: 'Стоп', copy: 'Копировать', doc: 'Документ', pdf: 'PDF', 
            pdfedit: 'Редактируемый PDF', fontminus: 'Шрифт -', fontplus: 'Шрифт +', color: 'Цвет', table: 'Таблица', 
            import: 'Обзор', sync: 'Синхронизация', restore: 'Импорт', backup: 'Экспорт', zoomin: 'Приблизить', 
            zoomout: 'Отдалить', theme: 'Тема', langTxt: 'Язык', menu: 'Меню', pTitle: 'Заголовок...', pBody: 'Пишите здесь...' 
        },
        'de-DE': { 
            name: 'Deutsch', install: 'Installieren', save: 'Speichern', new: 'Neu', mic: 'Diktieren', read: 'Lesen', 
            vmsg: 'Sprachnachricht', tts: 'Text Audio', stop: 'Stopp', copy: 'Kopieren', doc: 'Dokument', pdf: 'PDF', 
            pdfedit: 'PDF Editierbar', fontminus: 'Schrift -', fontplus: 'Schrift +', color: 'Farbe', table: 'Tabelle', 
            import: 'Durchsuchen', sync: 'Synchronisieren', restore: 'Importieren', backup: 'Exportieren', zoomin: 'Vergrößern', 
            zoomout: 'Verkleinern', theme: 'Design', langTxt: 'Sprache', menu: 'Menü', pTitle: 'Titel...', pBody: 'Schreiben Sie hier...' 
        },
        'zh-HK': { 
            name: '粵語', install: '安裝', save: '儲存', new: '新建', mic: '聽寫', read: '朗讀', 
            vmsg: '語音訊息', tts: '文字音訊', stop: '停止', copy: '複製', doc: '文件', pdf: 'PDF', 
            pdfedit: '可編輯PDF', fontminus: '字型 -', fontplus: '字型 +', color: '顏色', table: '表格', 
            import: '瀏覽', sync: '同步', restore: '匯入', backup: '匯出', zoomin: '放大', 
            zoomout: '縮小', theme: '主題', langTxt: '語言', menu: '選單', pTitle: '標題...', pBody: '在此處撰寫...' 
        },
        'zh-CN': { 
            name: '中文', install: '安装', save: '保存', new: '新建', mic: '听写', read: '朗读', 
            vmsg: '语音消息', tts: '文本音频', stop: '停止', copy: '复制', doc: '文档', pdf: 'PDF', 
            pdfedit: '可编辑PDF', fontminus: '字体 -', fontplus: '字体 +', color: '颜色', table: '表格', 
            import: '浏览', sync: '同步', restore: '导入', backup: '导出', zoomin: '放大', 
            zoomout: '缩小', theme: '主题', langTxt: '语言', menu: '菜单', pTitle: '标题...', pBody: '在此处编写...' 
        },
        'ja-JP': { 
            name: '日本語', install: '追加', save: '保存', new: '新規', mic: '口述', read: '再生', 
            vmsg: '音声メッセージ', tts: '文字音声', stop: '停止', copy: '複製', doc: '文書', pdf: 'PDF', 
            pdfedit: '編集可能PDF', fontminus: '文字 -', fontplus: '文字 +', color: '配色', table: '表', 
            import: '参照', sync: '同期', restore: '取込', backup: '導出', zoomin: '拡大', 
            zoomout: '縮小', theme: '基調', langTxt: '言語', menu: '献立', pTitle: '題名...', pBody: 'ここに書く...' 
        },
        'es-MX': { 
            name: 'Español (LATAM)', install: 'Instalar', save: 'Guardar', new: 'Nuevo', mic: 'Dictar', read: 'Lectura', 
            vmsg: 'Mensaje Voz', tts: 'Texto Audio', stop: 'Detener', copy: 'Copiar', doc: 'Documento', pdf: 'PDF', 
            pdfedit: 'PDF editable', fontminus: 'Fuente -', fontplus: 'Fuente +', color: 'Color', table: 'Tabla', 
            import: 'Explorar', sync: 'Sincronizar', restore: 'Importar', backup: 'Exportar', zoomin: 'Acercar', 
            zoomout: 'Alejar', theme: 'Tema', langTxt: 'Idioma', menu: 'Menú', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí...' 
        },
        'it-IT': { 
            name: 'Italiano', install: 'Installa', save: 'Salva', new: 'Nuovo', mic: 'Detta', read: 'Lettura', 
            vmsg: 'Messaggio Vocale', tts: 'Testo Audio', stop: 'Arresta', copy: 'Copia', doc: 'Documento', pdf: 'PDF', 
            pdfedit: 'PDF Modificabile', fontminus: 'Font -', fontplus: 'Font +', color: 'Colore', table: 'Tabella', 
            import: 'Esplora', sync: 'Sincronizza', restore: 'Importa', backup: 'Esporta', zoomin: 'Ingrandisci', 
            zoomout: 'Riduci', theme: 'Tema', langTxt: 'Lingua', menu: 'Menu', pTitle: 'Titolo...', pBody: 'Scrivi qui...' 
        },
        'uk-UA': { 
            name: 'Українська', install: 'Встановити', save: 'Зберегти', new: 'Новий', mic: 'Диктувати', read: 'Читати', 
            vmsg: 'Голосове Повідомлення', tts: 'Текст Аудіо', stop: 'Стоп', copy: 'Копіювати', doc: 'Документ', pdf: 'PDF', 
            pdfedit: 'Редагований PDF', fontminus: 'Шрифт -', fontplus: 'Шрифт +', color: 'Колір', table: 'Таблиця', 
            import: 'Огляд', sync: 'Синхронізація', restore: 'Імпорт', backup: 'Експорт', zoomin: 'Наблизити', 
            zoomout: 'Віддалити', theme: 'Тема', langTxt: 'Мова', menu: 'Меню', pTitle: 'Заголовок...', pBody: 'Пишіть тут...' 
        },
        'hi-IN': { 
            name: 'हिन्दी', install: 'स्थापित', save: 'सहेजें', new: 'नया', mic: 'बोलें', read: 'पढ़ें', 
            vmsg: 'वॉयस मैसेज', tts: 'पाठ ऑडियो', stop: 'रोकें', copy: 'कॉपी', doc: 'दस्तावेज़', pdf: 'PDF', 
            pdfedit: 'संपादन योग्य PDF', fontminus: 'फ़ॉन्ट -', fontplus: 'फ़ॉन्ट +', color: 'रंग', table: 'तालिका', 
            import: 'ब्राउज़', sync: 'सिंक', restore: 'आयात', backup: 'निर्यात', zoomin: 'ज़ूम +', 
            zoomout: 'ज़ूम -', theme: 'थीम', langTxt: 'भाषा', menu: 'सूची', pTitle: 'शीर्षक...', pBody: 'यहाँ लिखें...' 
        },
        'pt-PT': { 
            name: 'Português', install: 'Instalar', save: 'Guardar', new: 'Novo', mic: 'Ditar', read: 'Leitura', 
            vmsg: 'Mensagem Voz', tts: 'Texto Áudio', stop: 'Parar', copy: 'Copiar', doc: 'Documento', pdf: 'PDF', 
            pdfedit: 'PDF Editável', fontminus: 'Fonte -', fontplus: 'Fonte +', color: 'Cor', table: 'Tabela', 
            import: 'Explorar', sync: 'Sincronizar', restore: 'Importar', backup: 'Exportar', zoomin: 'Aproximar', 
            zoomout: 'Afastar', theme: 'Tema', langTxt: 'Idioma', menu: 'Menu', pTitle: 'Título...', pBody: 'Escreva aqui...' 
        },
        'fr-FR': { 
            name: 'Français', install: 'Installer', save: 'Enregistrer', new: 'Nouveau', mic: 'Dicter', read: 'Lecture', 
            vmsg: 'Message Vocal', tts: 'Texte Audio', stop: 'Arrêter', copy: 'Copier', doc: 'Document', pdf: 'PDF', 
            pdfedit: 'PDF Éditable', fontminus: 'Police -', fontplus: 'Police +', color: 'Couleur', table: 'Tableau', 
            import: 'Explorer', sync: 'Synchroniser', restore: 'Importer', backup: 'Exporter', zoomin: 'Zoom +', 
            zoomout: 'Zoom -', theme: 'Thème', langTxt: 'Langue', menu: 'Menu', pTitle: 'Titre...', pBody: 'Écrivez ici...' 
        },
        'en-GB': { 
            name: 'English (UK)', install: 'Install', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', 
            vmsg: 'Voice Note', tts: 'Text Audio', stop: 'Stop', copy: 'Copy', doc: 'Document', pdf: 'PDF', 
            pdfedit: 'Editable PDF', fontminus: 'Font -', fontplus: 'Font +', color: 'Colour', table: 'Table', 
            import: 'Explore', sync: 'Synchronise', restore: 'Import', backup: 'Export', zoomin: 'Zoom In', 
            zoomout: 'Zoom Out', theme: 'Theme', langTxt: 'Language', menu: 'Menu', pTitle: 'Script Title...', pBody: 'Write or dictate here...' 
        }
    },

    // 1. AUTO-DETECCIÓN AL INICIAR (SI NO ESTÁ EN LISTA, INICIA EN INGLÉS)
    init: function() {
        var rawSysLang = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en-GB').toLowerCase();
        
        // Mapeo exhaustivo de prefijos e idiomas
        var match = this.langsOrder.find(function(l) { return l.toLowerCase() === rawSysLang; });
        if (!match) {
            var sysCode = rawSysLang.split('-')[0];
            if (sysCode === 'es') match = 'es-MX';
            else if (sysCode === 'zh') match = (rawSysLang.includes('hk') || rawSysLang.includes('tw') || rawSysLang.includes('yue')) ? 'zh-HK' : 'zh-CN';
            else if (sysCode === 'pt') match = 'pt-PT';
            else if (sysCode === 'en') match = 'en-GB';
            else {
                match = this.langsOrder.find(function(l) { return l.toLowerCase().startsWith(sysCode); });
            }
        }

        // Si no detecta ninguno de los 13 idiomas, predetermina en Inglés
        var finalLang = match || 'en-GB';
        
        // Registrar idioma original del sistema si aún no se ha definido
        if (!this.originalLang) {
            this.originalLang = finalLang;
        }

        this.setAppLang(finalLang, false);
    },

    // 2. REACCIÓN INTEGRAL AL CAMBIO DE IDIOMA EN TODAS LAS LEYENDAS Y BOTONES
    setAppLang: function(lang, shouldTranslateText) {
        if (shouldTranslateText === undefined) shouldTranslateText = true;
        
        this.currentLang = lang;
        this.currentVoiceLang = lang;
        var p = this.db[lang] || this.db['en-GB']; 

        // Función que aplica la regla: 1 palabra fija, o scroll lateral si son más palabras
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

        // 24 Botones en Orden Exacto
        setText('lbl-nav-install', p.install);   // 1. Instalar
        setText('lbl-tool-save', p.save);         // 2. Guardar
        setText('lbl-tool-new', p.new);           // 3. Nuevo
        setText('lbl-tool-mic', p.mic);           // 4. Dictar
        setText('lbl-tool-read', p.read);         // 5. Lectura
        setText('lbl-tool-vmsg', p.vmsg);         // 6. Mensaje Voz
        setText('lbl-tool-tts', p.tts);           // 7. Texto Audio
        setText('lbl-tool-stop', p.stop);         // 8. Detener
        setText('lbl-tool-copyall', p.copy);      // 9. Copiar
        setText('lbl-tool-doc', p.doc);           // 10. Documento
        setText('lbl-tool-pdf', p.pdf);           // 11. PDF
        setText('lbl-tool-pdfedit', p.pdfedit);   // 12. PDF editable
        setText('lbl-tool-fontminus', p.fontminus);// 13. Fuente -
        setText('lbl-tool-fontplus', p.fontplus); // 14. Fuente +
        setText('lbl-tool-color', p.color);       // 15. Color
        setText('lbl-tool-table', p.table);       // 16. Tabla
        setText('lbl-tool-import', p.import);     // 17. Explorar
        setText('lbl-tool-sync', p.sync);         // 18. Sincronizar
        setText('lbl-tool-restore', p.restore);   // 19. Importar
        setText('lbl-tool-backup', p.backup);     // 20. Exportar
        setText('lbl-tool-zoomin', p.zoomin);     // 21. Acercar
        setText('lbl-tool-zoomout', p.zoomout);   // 22. Alejar
        setText('lbl-nav-theme', p.theme);        // 23. Tema
        setText('lbl-nav-langtxt', p.langTxt);    // 24. Idioma

        // Menú Lateral y Placeholders
        setText('lbl-nav-menu', p.menu);
        var tInput = document.getElementById('editor-title'); 
        if (tInput) tInput.placeholder = p.pTitle;

        this.updateAccordionStyles();

        // 3 y 4. TRADUCCIÓN Y RESTAURACIÓN INTEGRAL
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

    renderAccordionLanguages: function() {
        var track = document.getElementById('accordion-slider-track');
        if (!track) return;
        track.innerHTML = '';

        var self = this;
        var fragment = document.createDocumentFragment();

        this.langsOrder.forEach(function(langKey) {
            var wrapper = document.createElement('div');
            wrapper.className = 'btn-wrapper-3d';
            wrapper.setAttribute('data-lang', langKey);

            var label = document.createElement('div');
            label.className = 'btn-label-3d';
            var nameWord = self.singleWordLangs[langKey] || langKey.split('-')[0];
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
            iconSpan.innerText = langKey.substring(0, 2).toUpperCase();
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

    // 3 Y 4. MODIFICACIÓN DE TEXTO SELECCIONADO Y RESTAURACIÓN EXACTA SIN CAMBIOS DE SINTAXIS
    handleTextTranslation: function() {
        var editor = document.getElementById('editor-body');
        var titleInput = document.getElementById('editor-title');
        if (!editor) return;

        var currentBodyText = editor.innerText || editor.textContent || "";
        var currentTitleText = titleInput ? titleInput.value : "";

        // Si el usuario vuelve al idioma original, restaurar el documento intacto
        if (this.currentLang === this.originalLang && this.originalText !== null) {
            editor.innerText = this.originalText;
            if (titleInput && this.originalTitle !== null) titleInput.value = this.originalTitle;
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
            return;
        }

        // Guardar original si es la primera modificación
        if (this.originalText === null && currentBodyText.trim() !== '') {
            this.originalText = currentBodyText;
            this.originalTitle = currentTitleText;
        }

        var sel = window.getSelection();
        var selectedText = sel ? sel.toString().trim() : "";
        var targetClean = this.currentLang.split('-')[0];

        // 3. Modificación del texto seleccionado si existe
        if (selectedText.length > 0) {
            this.translateSegment(selectedText, targetClean, function(translated) {
                var range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(translated));
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.updateCounters();
            });
        } 
        // Si no hay texto seleccionado, traducir todo el documento
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