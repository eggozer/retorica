// --- RETÓRICA INTERNATIONALIZATION & ENGINE (COMPATIBLE CON ANDROID 5 Y COBERTURA TOTAL) ---
var RetoricaI18n = {
    currentLang: 'en-GB', 
    currentVoiceLang: 'en-GB', 
    originalDocState: null, // Respaldo del documento original en su idioma nativo

    langsOrder: ['ar-SA', 'de-DE', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'hi-IN', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'uk-UA', 'zh-CN'],

    // Nombres de idiomas en una sola palabra para los botones del acordeón
    singleWordLangs: {
        'ar-SA': 'العربية',
        'de-DE': 'Deutsch',
        'en-GB': 'English',
        'es-ES': 'Español',
        'es-MX': 'Español',
        'fr-FR': 'Français',
        'hi-IN': 'हिन्दी',
        'it-IT': 'Italiano',
        'ja-JP': '日本語',
        'pt-PT': 'Português',
        'ru-RU': 'Русский',
        'uk-UA': 'Українська',
        'zh-CN': '中文'
    },

    // Mapeo completo de las 24 leyendas en una sola palabra por idioma
    db: {
        'ar-SA': { name: 'Al-Arabiya', install: 'تثبيت', save: 'حفظ', new: 'جديد', mic: 'إملاء', read: 'قراءة', vmsg: 'صوتي', tts: 'توليد', stop: 'إيقاف', copy: 'نسخ', doc: 'مستند', pdf: 'PDF', pdfedit: 'تعديل', fontminus: 'تصغير', fontplus: 'تكبير', color: 'لون', table: 'جدول', import: 'استكشاف', sync: 'مزامنة', restore: 'استيراد', backup: 'تصدير', zoomin: 'اقتراب', zoomout: 'ابتعاد', theme: 'مظهر', langTxt: 'لغة', pTitle: 'عنوان...', pBody: 'اكتب هنا...', menu: 'قائمة', del: 'حذف', copyCard: 'نسخ', share: 'مشاركة', history: 'السجل', close: 'إغلاق', clear: 'مسح', confirmDel: 'هل أنت تأكد؟' },
        'de-DE': { name: 'Deutsch', install: 'Installieren', save: 'Speichern', new: 'Neu', mic: 'Diktieren', read: 'Lesen', vmsg: 'Sprachnachricht', tts: 'Audio-Text', stop: 'Stoppen', copy: 'Kopieren', doc: 'Dokument', pdf: 'PDF', pdfedit: 'Bearbeitbar', fontminus: 'Schrift-', fontplus: 'Schrift+', color: 'Farbe', table: 'Tabelle', import: 'Erkunden', sync: 'Synchronisieren', restore: 'Importieren', backup: 'Exportieren', zoomin: 'Vergrößern', zoomout: 'Verkleinern', theme: 'Thema', langTxt: 'Sprache', pTitle: 'Titel...', pBody: 'Hier schreiben...', menu: 'Menü', del: 'Löschen', copyCard: 'Kopieren', share: 'Teilen', history: 'Verlauf', close: 'Schließen', clear: 'Löschen', confirmDel: 'Wirklich löschen?' },
        'en-GB': { name: 'English', install: 'Install', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', vmsg: 'VoiceNote', tts: 'AudioText', stop: 'Stop', copy: 'Copy', doc: 'Document', pdf: 'PDF', pdfedit: 'EditablePDF', fontminus: 'Font-', fontplus: 'Font+', color: 'Color', table: 'Table', import: 'Explore', sync: 'Sync', restore: 'Import', backup: 'Export', zoomin: 'ZoomIn', zoomout: 'ZoomOut', theme: 'Theme', langTxt: 'Language', pTitle: 'Script Title...', pBody: 'Write or dictate here...', menu: 'Menu', del: 'Delete', copyCard: 'Copy', share: 'Share', history: 'History', close: 'Close', clear: 'Clear', confirmDel: 'Are you sure?' },
        'es-ES': { name: 'Español (ES)', install: 'Instalar', save: 'Guardar', new: 'Nuevo', mic: 'Dictar', read: 'Lectura', vmsg: 'MensajeVoz', tts: 'TextoAudio', stop: 'Detener', copy: 'Copiar', doc: 'Documento', pdf: 'PDF', pdfedit: 'PDFeditable', fontminus: 'Fuente-', fontplus: 'Fuente+', color: 'Color', table: 'Tabla', import: 'Explorar', sync: 'Sincronizar', restore: 'Importar', backup: 'Exportar', zoomin: 'Acercar', zoomout: 'Alejar', theme: 'Tema', langTxt: 'Idioma', pTitle: 'Titular de la Obra...', pBody: 'Escribe o dicta aquí tu obra...', menu: 'Menú', del: 'Borrar', copyCard: 'Copiar', share: 'Compartir', history: 'Historial', close: 'Cerrar', clear: 'Limpiar', confirmDel: '¿Deseas eliminar este registro?' },
        'es-MX': { name: 'Español (MX)', install: 'Instalar', save: 'Guardar', new: 'Nuevo', mic: 'Dictar', read: 'Lectura', vmsg: 'MensajeVoz', tts: 'TextoAudio', stop: 'Detener', copy: 'Copiar', doc: 'Documento', pdf: 'PDF', pdfedit: 'PDFeditable', fontminus: 'Fuente-', fontplus: 'Fuente+', color: 'Color', table: 'Tabla', import: 'Explorar', sync: 'Sincronizar', restore: 'Importar', backup: 'Exportar', zoomin: 'Acercar', zoomout: 'Alejar', theme: 'Tema', langTxt: 'Idioma', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí tu retórica...', menu: 'Menú', del: 'Borrar', copyCard: 'Copiar', share: 'Compartir', history: 'Historial', close: 'Cerrar', clear: 'Limpiar', confirmDel: '¿Deseas eliminar este registro?' },
        'fr-FR': { name: 'Français', install: 'Installer', save: 'Enregistrer', new: 'Nouveau', mic: 'Dicter', read: 'Lecture', vmsg: 'Vocal', tts: 'TexteAudio', stop: 'Arrêter', copy: 'Copier', doc: 'Document', pdf: 'PDF', pdfedit: 'Modifiable', fontminus: 'Police-', fontplus: 'Police+', color: 'Couleur', table: 'Tableau', import: 'Explorer', sync: 'Synchroniser', restore: 'Importer', backup: 'Exporter', zoomin: 'Zoomer', zoomout: 'Dézoomer', theme: 'Thème', langTxt: 'Langue', pTitle: 'Titre du Scénario...', pBody: 'Écrivez ou dictez ici...', menu: 'Menu', del: 'Supprimer', copyCard: 'Copier', share: 'Partager', history: 'Historique', close: 'Fermer', clear: 'Effacer', confirmDel: 'Voulez-vous supprimer?' },
        'hi-IN': { name: 'Hindi', install: 'स्थापना', save: 'सहेजें', new: 'नया', mic: 'बोलें', read: 'पढ़ें', vmsg: 'वॉयस', tts: 'ऑडियो', stop: 'रोकें', copy: 'कॉपी', doc: 'दस्तावेज़', pdf: 'PDF', pdfedit: 'संपादन', fontminus: 'फ़ॉन्ट-', fontplus: 'फ़ॉन्ट+', color: 'रंग', table: 'तालिका', import: 'खोजें', sync: 'सिंक', restore: 'आयात', backup: 'निर्यात', zoomin: 'बड़ा', zoomout: 'छोटा', theme: 'थीम', langTxt: 'भाषा', pTitle: 'शीर्षक...', pBody: 'यहाँ लिखें...', menu: 'सूची', del: 'हटाएं', copyCard: 'कॉपी', share: 'साझा', history: 'इतिहास', close: 'बंद', clear: 'साफ़', confirmDel: 'क्या आप हटाना चाहते हैं?' },
        'it-IT': { name: 'Italiano', install: 'Installa', save: 'Salva', new: 'Nuovo', mic: 'Detta', read: 'Lettura', vmsg: 'Vocale', tts: 'TestoAudio', stop: 'Ferma', copy: 'Copia', doc: 'Documento', pdf: 'PDF', pdfedit: 'Modificabile', fontminus: 'Font-', fontplus: 'Font+', color: 'Colore', table: 'Tabella', import: 'Esplora', sync: 'Sincronizza', restore: 'Importa', backup: 'Esporta', zoomin: 'Ingrandisci', zoomout: 'Riduci', theme: 'Tema', langTxt: 'Lingua', pTitle: 'Titolo...', pBody: 'Scrivi qui...', menu: 'Menu', del: 'Elimina', copyCard: 'Copia', share: 'Condividi', history: 'Cronologia', close: 'Chiudi', clear: 'Pulisci', confirmDel: 'Sei sicuro di voler eliminare?' },
        'ja-JP': { name: 'Japanese', install: 'インストール', save: '保存', new: '新規', mic: '口述', read: '朗読', vmsg: '音声', tts: '音源', copy: 'コピー', doc: '文書', pdf: 'PDF', pdfedit: '編集可能', fontminus: '文字-', fontplus: '文字+', color: '色', table: '表', import: '探索', sync: '同期', restore: '取込', backup: '導出', zoomin: '拡大', zoomout: '縮小', theme: '配色', langTxt: '言語', pTitle: 'タイトル...', pBody: 'ここに書く...', menu: '献立', del: '削除', copyCard: '複製', share: '共有', history: '履歴', close: '閉じる', clear: '消去', confirmDel: '削除してもよろしいですか？' },
        'pt-PT': { name: 'Português', install: 'Instalar', save: 'Guardar', new: 'Novo', mic: 'Ditar', read: 'Leitura', vmsg: 'Voz', tts: 'TextoÁudio', stop: 'Parar', copy: 'Copiar', doc: 'Documento', pdf: 'PDF', pdfedit: 'Editável', fontminus: 'Fonte-', fontplus: 'Fonte+', color: 'Cor', table: 'Tabela', import: 'Explorar', sync: 'Sincronizar', restore: 'Importar', backup: 'Exportar', zoomin: 'Aproximar', zoomout: 'Afastar', theme: 'Tema', langTxt: 'Idioma', pTitle: 'Título...', pBody: 'Escreva aqui...', menu: 'Menu', del: 'Apagar', copyCard: 'Copiar', share: 'Partilhar', history: 'Histórico', close: 'Fechar', clear: 'Limpar', confirmDel: 'Deseja realmente apagar?' },
        'ru-RU': { name: 'Русский', install: 'Установить', save: 'Сохранить', new: 'Новый', mic: 'Диктовать', read: 'Чтение', vmsg: 'Голос', tts: 'Аудиотекст', stop: 'Стоп', copy: 'Копировать', doc: 'Документ', pdf: 'PDF', pdfedit: 'Править', fontminus: 'Шрифт-', fontplus: 'Шрифт+', color: 'Цвет', table: 'Таблица', import: 'Обзор', sync: 'Синхронизация', restore: 'Импорт', backup: 'Экспорт', zoomin: 'Увеличить', zoomout: 'Уменьшить', theme: 'Тема', langTxt: 'Язык', pTitle: 'Название...', pBody: 'Пишите здесь...', menu: 'Меню', del: 'Удалить', copyCard: 'Копировать', share: 'Поделиться', history: 'История', close: 'Закрыть', clear: 'Очистить', confirmDel: 'Удалить эту запись?' },
        'uk-UA': { name: 'Ukrainian', install: 'Встановити', save: 'Зберегти', new: 'Новий', mic: 'Диктувати', read: 'Читати', vmsg: 'Голос', tts: 'Аудіотекст', stop: 'Стоп', copy: 'Копіювати', doc: 'Документ', pdf: 'PDF', pdfedit: 'Редагувати', fontminus: 'Шрифт-', fontplus: 'Шрифт+', color: 'Колір', table: 'Таблиця', import: 'Огляд', sync: 'Синхронізація', restore: 'Імпорт', backup: 'Експорт', zoomin: 'Наблизити', zoomout: 'Віддалити', theme: 'Тема', langTxt: 'Мова', pTitle: 'Назва...', pBody: 'Пишіть тут...', menu: 'Меню', del: 'Видалити', copyCard: 'Копіювати', share: 'Поділитися', history: 'Історія', close: 'Закрити', clear: 'Очистити', confirmDel: 'Видалити цей запис?' },
        'zh-CN': { name: 'Chinese', install: '安装', save: '保存', new: '新建', mic: '听写', read: '朗读', vmsg: '语音', tts: '文本音频', stop: '停止', copy: '复制', doc: '文档', pdf: 'PDF', pdfedit: '可编辑', fontminus: '字号-', fontplus: '字号+', color: '颜色', table: '表格', import: '探索', sync: '同步', restore: '导入', backup: '导出', zoomin: '放大', zoomout: '缩小', theme: '主题', langTxt: '语言', pTitle: '标题...', pBody: '在此处编写...', menu: '菜单', del: '删除', copyCard: '复制', share: '分享', history: '历史记录', close: '关闭', clear: '清除', confirmDel: '您确定要删除吗？' }
    },

    // 1. Detección automática del idioma del dispositivo al iniciar
    init: function() {
        var sysLang = (navigator.language || navigator.userLanguage || 'en-GB').toLowerCase();
        
        var match = this.langsOrder.find(function(l) { return l.toLowerCase() === sysLang; });
        if (!match) {
            var sysCode = sysLang.split('-')[0];
            match = this.langsOrder.find(function(l) { return l.toLowerCase().startsWith(sysCode); });
        }

        var finalLang = match || 'en-GB';
        this.setAppLang(finalLang);
    },

    // 2. Reacción completa en la interfaz y actualización de las leyendas de los 24 botones
    setAppLang: function(lang) {
        var previousLang = this.currentLang;
        this.currentLang = lang;
        this.currentVoiceLang = lang;
        var p = this.db[lang] || this.db['en-GB']; 

        function setText(id, text) {
            var el = document.getElementById(id);
            if (el && text !== undefined && text !== null && text !== '') {
                // Si requiere más de una palabra por restricción extrema del idioma, habilita el desplazamiento lateral
                if (text.includes(' ')) {
                    el.innerHTML = '<span class="scroll-txt">' + text + '</span>';
                } else {
                    el.innerText = text;
                }
            }
        }

        // Actualización sincrónica de las leyendas de la botonera principal (24 botones)
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

        // Barra de navegación y modales
        setText('lbl-nav-menu', p.menu);
        var tInput = document.getElementById('editor-title'); 
        if (tInput) tInput.placeholder = p.pTitle;

        setText('lbl-modal-history-title', p.history);
        setText('lbl-btn-close-modal', p.close);
        setText('lbl-btn-clear-history', p.clear);

        // Actualizar acordeón de idiomas
        this.updateAccordionStyles();

        // 3 y 4. Modificación de texto/selección y gestión de reverso al idioma original
        if (previousLang !== lang) {
            this.translateWork(previousLang);
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
            label.className = 'btn-label-3d scrollable-label';
            label.innerText = self.singleWordLangs[langKey] || langKey.split('-')[0];

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-round-3d';
            
            var iconSpan = document.createElement('span');
            iconSpan.className = 'icon-raw';
            iconSpan.innerText = langKey.substring(0, 2).toUpperCase();
            btn.appendChild(iconSpan);

            wrapper.appendChild(label);
            wrapper.appendChild(btn);

            wrapper.onclick = function(e) {
                if (e) e.stopPropagation();
                self.setAppLang(langKey);
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
                if (btn) {
                    btn.className = 'btn-round-3d active';
                    btn.style.backgroundColor = '#00e676';
                    btn.style.color = '#000000';
                    btn.style.borderColor = '#ffffff';
                    btn.style.boxShadow = '0 0 10px #00e676';
                }
            } else {
                wrapper.className = 'btn-wrapper-3d';
                if (btn) {
                    btn.className = 'btn-round-3d';
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.boxShadow = '';
                }
            }
        });
    },

    // 3 y 4. Traducción de selección/documento completo con almacenamiento para reversión de sintaxis exacta
    translateWork: function(previousLang) {
        var editor = document.getElementById('editor-body');
        if (!editor) return;

        // Si no existe respaldo del documento original o cambió el lienzo, guardar el estado nativo original
        if (!this.originalDocState) {
            this.originalDocState = {
                lang: previousLang || this.currentLang,
                html: editor.innerHTML,
                text: editor.innerText.trim()
            };
        }

        // Si el usuario regresa al idioma original del escrito, devolver el documento intacto sin alteración sintáctica
        if (this.currentLang === this.originalDocState.lang) {
            editor.innerHTML = this.originalDocState.html;
            if (typeof RetoricaUI !== 'undefined') {
                RetoricaUI.updateCounters();
                if (typeof RetoricaUI.triggerAutoSave === 'function') RetoricaUI.triggerAutoSave();
            }
            return;
        }

        var sel = window.getSelection();
        var selectedText = sel ? sel.toString().trim() : '';
        var textToTranslate = selectedText.length > 0 ? selectedText : editor.innerText.trim();

        if (!textToTranslate) return;

        var targetClean = this.currentLang.split('-')[0];
        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(textToTranslate) + "&langpair=autodetect|" + targetClean;

        fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data && data.responseData && data.responseStatus === 200) {
                var translatedText = data.responseData.translatedText;
                if (translatedText && !translatedText.includes("INVALID SOURCE")) {
                    if (selectedText.length > 0 && sel.rangeCount) {
                        // Reemplazar solo el texto seleccionado manteniendo la estructura del resto del documento
                        var range = sel.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(translatedText));
                    } else {
                        // Traducción total del lienzo
                        editor.innerText = translatedText;
                    }

                    if (typeof RetoricaUI !== 'undefined') {
                        RetoricaUI.updateCounters();
                        if (typeof RetoricaUI.triggerAutoSave === 'function') RetoricaUI.triggerAutoSave();
                    }
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
