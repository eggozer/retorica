// --- RETÓRICA INTERNATIONALIZATION & ENGINE (COMPATIBLE CON ANDROID 5 Y COBERTURA TOTAL) ---
var RetoricaI18n = {
    currentLang: 'es-MX', 
    currentVoiceLang: 'es-MX', 
    
    langsOrder: ['ar-SA', 'de-DE', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'hi-IN', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'uk-UA', 'zh-CN'],
    
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

    // Traducciones en el idioma activo del usuario para identificar los demás idiomas
    translatedLangNames: {
        'es-MX': { 'ar-SA': 'Árabe', 'de-DE': 'Alemán', 'en-GB': 'Inglés', 'es-ES': 'Español (ES)', 'es-MX': 'Español (MX)', 'fr-FR': 'Francés', 'hi-IN': 'Hindi', 'it-IT': 'Italiano', 'ja-JP': 'Japonés', 'pt-PT': 'Portugués', 'ru-RU': 'Ruso', 'uk-UA': 'Ucraniano', 'zh-CN': 'Chino' },
        'en-GB': { 'ar-SA': 'Arabic', 'de-DE': 'German', 'en-GB': 'English', 'es-ES': 'Spanish (ES)', 'es-MX': 'Spanish (MX)', 'fr-FR': 'French', 'hi-IN': 'Hindi', 'it-IT': 'Italian', 'ja-JP': 'Japanese', 'pt-PT': 'Portuguese', 'ru-RU': 'Russian', 'uk-UA': 'Ukrainian', 'zh-CN': 'Chinese' }
    },

    db: {
        'ar-SA': { name: 'Al-Arabiya', save: 'حفظ', new: 'جديد', mic: 'صوت', read: 'إقرأ', stop: 'إلغاء', vmsg: 'تسجيل', tts: 'صوت', copy: 'نسخ', import: 'استيراد', pdf: 'PDF', pdfedit: 'تعديل PDF', doc: 'WORD', sync: 'تزامن', backup: 'نسخ', restore: 'استعادة', zoomin: 'تكبير', zoomout: 'تصغير', pTitle: 'عنوان النص...', pBody: 'اكتب أو أملي نصوصك هنا...', menu: 'قائمة', install: 'تثبيت', theme: 'سمة', langTxt: 'لغة', langVoz: 'صوت', del: 'حذف', copyCard: 'نسخ', share: 'مشاركة', history: 'السجل', close: 'إغلاق', clear: 'مسح', confirmDel: 'هل أنت تأكد من الحذف؟' },
        'de-DE': { name: 'Deutsch', save: 'SPEI', new: 'NEU', mic: 'DIKT', read: 'LIES', stop: 'HALT', vmsg: 'REC', tts: 'TON', copy: 'KOPI', import: 'IMPO', pdf: 'PDF', pdfedit: 'PDF EDT', doc: 'DOC', sync: 'SYNC', backup: 'SICH', restore: 'RÜCK', zoomin: 'ZOO +', zoomout: 'ZOO -', pTitle: 'Skripttitel...', pBody: 'Schreiben oder diktieren Sie hier...', menu: 'MENÜ', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'TON', del: 'LÖSCHEN', copyCard: 'KOPIEREN', share: 'TEILEN', history: 'VERLAUF', close: 'SCHLIESSEN', clear: 'LÖSCHEN', confirmDel: 'Wirklich löschen?' },
        'en-GB': { name: 'English', save: 'SAVE', new: 'NEW', mic: 'MIC', read: 'SAY', stop: 'STOP', vmsg: 'REC', tts: 'AUD', copy: 'COPY', import: 'IMP', pdf: 'PDF', pdfedit: 'PDF EDIT', doc: 'DOC', sync: 'SYNC', backup: 'BAK', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Script Title...', pBody: 'Write or dictate your rhetoric here...', menu: 'MENU', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'VOI', del: 'DELETE', copyCard: 'COPY', share: 'SHARE', history: 'HISTORY', close: 'CLOSE', clear: 'CLEAR', confirmDel: 'Are you sure you want to delete?' },
        'es-ES': { name: 'Español (ES)', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEE', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'EDIT PDF', doc: 'DOC', sync: 'SINC', backup: 'RESP', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Titular de la Obra...', pBody: 'Escribe o dicta aquí tu obra...', menu: 'MENÚ', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ', del: 'BORRAR', copyCard: 'COPIAR', share: 'COMPARTIR', history: 'HISTORIAL', close: 'CERRAR', clear: 'LIMPIAR', confirmDel: '¿Deseas eliminar este registro?' },
        'es-MX': { name: 'Español (MX)', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEE', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'EDIT PDF', doc: 'DOC', sync: 'SINC', backup: 'RESP', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí tu retórica...', menu: 'MENÚ', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ', del: 'BORRAR', copyCard: 'COPIAR', share: 'COMPARTIR', history: 'HISTORIAL', close: 'CERRAR', clear: 'LIMPIAR', confirmDel: '¿Deseas eliminar este registro?' },
        'fr-FR': { name: 'Français', save: 'ENR', new: 'NOU', mic: 'MIC', read: 'LIR', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'ÉDIT PDF', doc: 'DOC', sync: 'SYN', backup: 'SAUV', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Titre du Scénario...', pBody: 'Écrivez ou dictez votre rhétorique ici...', menu: 'MENU', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'VOI', del: 'SUPPRIMER', copyCard: 'COPIER', share: 'PARTAGER', history: 'HISTORIQUE', close: 'FERMER', clear: 'EFFACER', confirmDel: 'Voulez-vous supprimer?' },
        'hi-IN': { name: 'Hindi', save: 'रखो', new: 'नया', mic: 'बोल', read: 'सुन', stop: 'रोक', vmsg: 'रिए', tts: 'ध्व', copy: 'प्रति', import: 'आयात', pdf: 'PDF', pdfedit: 'PDF संपा', doc: 'DOC', sync: 'सिंक', backup: 'बैक', restore: 'पुनः', zoomin: 'ज़ूम +', zoomout: 'ज़ूम -', pTitle: 'शीर्षक...', pBody: 'अपनी पटकथा यहाँ लिखें...', menu: 'सूची', install: 'ऐप', theme: 'थीم', langTxt: 'पाठ', langVoz: 'आवाज़', del: 'हटाएं', copyCard: 'कॉपी', share: 'साझा', history: 'इतिहास', close: 'बंद करें', clear: 'साफ़ करें', confirmDel: 'क्या आप हटाना चाहते हैं?' },
        'it-IT': { name: 'Italiano', save: 'SALV', new: 'NVO', mic: 'VOC', read: 'LEGG', stop: 'ALT', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'MOD PDF', doc: 'DOC', sync: 'SINC', backup: 'BAC', restore: 'RIPR', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Titolo dello Script...', pBody: 'Scrivi o detta qui la tua retorica...', menu: 'MENU', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOC', del: 'ELIMINA', copyCard: 'COPIA', share: 'CONDIVIDI', history: 'CRONOLOGIA', close: 'CHIUDI', clear: 'PULISCI', confirmDel: 'Sei sicuro di voler eliminare?' },
        'ja-JP': { name: 'Japanese', save: '保存', new: '新規', mic: '音声', read: '再生', stop: '停止', vmsg: '録音', tts: '音源', copy: '複写', import: '取込', pdf: 'PDF', pdfedit: 'PDF編集', doc: 'DOC', sync: '同期', backup: '退避', restore: '復元', zoomin: '拡大', zoomout: '縮小', pTitle: 'タイトル...', pBody: 'ここにレトリックを書きます...', menu: '献立', install: '追加', theme: '配色', langTxt: '文字', langVoz: '音声', del: '削除', copyCard: '複製', share: '共有', history: '履歴', close: '閉じる', clear: '消去', confirmDel: '削除してもよろしいですか？' },
        'pt-PT': { name: 'Português', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEI', stop: 'FIM', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'EDIT PDF', doc: 'DOC', sync: 'SINC', backup: 'CÓP', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Título do Roteiro...', pBody: 'Escreva ou dite sua retórica aqui...', menu: 'MENU', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ', del: 'APAGAR', copyCard: 'COPIAR', share: 'PARTILHAR', history: 'HISTÓRICO', close: 'FECHAR', clear: 'LIMPAR', confirmDel: 'Deseja realmente apagar?' },
        'ru-RU': { name: 'Русский', save: 'СОХР', new: 'НОВ', mic: 'ГОЛ', read: 'ЧИТ', stop: 'СТОП', vmsg: 'ЗАП', tts: 'ЗВУК', copy: 'КОП', import: 'ИМП', pdf: 'PDF', pdfedit: 'РЕД PDF', doc: 'DOC', sync: 'СИНК', backup: 'РЕЗ', restore: 'ВОС', zoomin: 'МАС +', zoomout: 'МАС -', pTitle: 'Название...', pBody: 'Пишите здесь...', menu: 'МЕНЮ', install: 'АПП', theme: 'ТЕМ', langTxt: 'ТКСТ', langVoz: 'ГОЛ', del: 'УДАЛИТЬ', copyCard: 'КОПИРОВАТЬ', share: 'ПОДЕЛИТЬСЯ', history: 'ИСТОРИЯ', close: 'ЗАКРЫТЬ', clear: 'ОЧИСТИТЬ', confirmDel: 'Удалить эту запись?' },
        'uk-UA': { name: 'Ukrainian', save: 'ЗБЕР', new: 'НОВ', mic: 'ГОЛ', read: 'ЧИТ', stop: 'СТОП', vmsg: 'ЗАП', tts: 'ЗВУК', copy: 'КОП', import: 'ІМП', pdf: 'PDF', pdfedit: 'РЕД PDF', doc: 'DOC', sync: 'СИНХ', backup: 'КОП', restore: 'VOS', zoomin: 'ЗУМ +', zoomout: 'ЗУМ -', pTitle: 'Назва Сценарію...', pBody: 'Пишіть або диктуйте риторику тут...', menu: 'МЕНЮ', install: 'АПП', theme: 'ТЕМ', langTxt: 'ТЕКСТ', langVoz: 'ГОЛ', del: 'ВИДАЛИТИ', copyCard: 'КОПІЮВАТИ', share: 'ПОДІЛИТИСЯ', history: 'ІСТОРІЯ', close: 'ЗАКРИТИ', clear: 'ОЧИСТИТИ', confirmDel: 'Видалити цей запис?' },
        'zh-CN': { name: 'Chinese', save: '保存', new: '新建', mic: '语音', read: '朗读', stop: '停止', vmsg: '录音', tts: '音频', copy: '复制', import: '导入', pdf: 'PDF', pdfedit: '编辑PDF', doc: 'DOC', sync: '同步', backup: '备份', restore: '恢复', zoomin: '放大', zoomout: '缩小', pTitle: '剧本标题...', pBody: '在此处编写您的剧本...', menu: '菜单', install: '安装', theme: '主题', langTxt: '文字', langVoz: '语音', del: '删除', copyCard: '复制', share: '分享', history: '历史记录', close: '关闭', clear: '清除', confirmDel: '您确定要删除吗？' }
    },

    init: function() {
        var savedLang = localStorage.getItem('retorica_user_lang');
        if (savedLang) {
            this.setAppLang(savedLang, false);
            return;
        }

        var sysLang = (navigator.language || navigator.userLanguage || 'en-GB').toLowerCase();
        
        var match = this.langsOrder.find(function(l) { return l.toLowerCase() === sysLang; });
        if (!match) {
            var sysCode = sysLang.split('-')[0];
            match = this.langsOrder.find(function(l) { return l.toLowerCase().startsWith(sysCode); });
        }

        var finalLang = match || 'en-GB';
        this.setAppLang(finalLang, false);
    },

    setAppLang: function(lang, triggerTranslate) {
        if (typeof triggerTranslate === 'undefined') triggerTranslate = true;

        this.currentLang = lang;
        this.currentVoiceLang = lang;
        localStorage.setItem('retorica_user_lang', lang);

        var p = this.db[lang] || this.db['en-GB']; 

        function setText(id, text) {
            var el = document.getElementById(id);
            if (el) el.innerText = text || '';
        }

        // 1. Barra superior
        setText('lbl-tool-save', p.save);
        setText('lbl-tool-new', p.new);
        setText('lbl-tool-mic', p.mic);
        setText('lbl-tool-read', p.read);
        setText('lbl-tool-stop', p.stop);
        setText('lbl-tool-vmsg', p.vmsg);
        setText('lbl-tool-tts', p.tts);
        setText('lbl-tool-copyall', p.copy);
        setText('lbl-tool-import', p.import);
        setText('lbl-tool-pdf', p.pdf);
        setText('lbl-tool-pdfedit', p.pdfedit);
        setText('lbl-tool-doc', p.doc);
        setText('lbl-tool-sync', p.sync);
        setText('lbl-tool-backup', p.backup);
        setText('lbl-tool-restore', p.restore);
        setText('lbl-tool-zoomin', p.zoomin);
        setText('lbl-tool-zoomout', p.zoomout);

        // 2. Barra de navegación
        setText('lbl-nav-menu', p.menu);
        setText('lbl-nav-install', p.install);
        setText('lbl-nav-theme', p.theme);
        setText('lbl-nav-langtxt', p.langTxt);

        // 3. Placeholders de edición
        var tInput = document.getElementById('editor-title'); 
        if (tInput) tInput.placeholder = p.pTitle;

        // 4. Modales y menús secundarios
        setText('lbl-modal-history-title', p.history);
        setText('lbl-btn-close-modal', p.close);
        setText('lbl-btn-clear-history', p.clear);

        // 5. Botones dinámicos de tarjetas
        document.querySelectorAll('.card-btn-delete').forEach(function(el) { 
            el.setAttribute('title', p.del); 
            el.setAttribute('aria-label', p.del); 
        });
        document.querySelectorAll('.card-btn-copy').forEach(function(el) { 
            el.setAttribute('title', p.copyCard); 
            el.setAttribute('aria-label', p.copyCard); 
        });
        document.querySelectorAll('.card-btn-share').forEach(function(el) { 
            el.setAttribute('title', p.share); 
            el.setAttribute('aria-label', p.share); 
        });

        // 6. Actualizar acordeón
        this.renderAccordionLanguages();

        // 7. Traducción de texto opcional solo por selección explícita
        if (triggerTranslate) {
            this.translateWork();
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
            this.renderAccordionLanguages();
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
        var currentMap = this.translatedLangNames[this.currentLang] || this.translatedLangNames['es-MX'] || {};

        this.langsOrder.forEach(function(langKey) {
            var wrapper = document.createElement('div');
            wrapper.className = 'btn-wrapper-3d';
            wrapper.setAttribute('data-lang', langKey);

            var label = document.createElement('div');
            label.className = 'btn-label-3d scrollable-label';
            
            // Muestra el nombre traducido al idioma del usuario y entre paréntesis el término nativo
            var translatedName = currentMap[langKey] || langKey.split('-')[0];
            var nativeName = self.singleWordLangs[langKey] || langKey.split('-')[0];
            label.innerText = (translatedName === nativeName) ? nativeName : translatedName + " (" + nativeName + ")";

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
                self.setAppLang(langKey, true);
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

    translateWork: function() {
        var editor = document.getElementById('editor-body');
        if (!editor || !editor.innerText.trim()) return;

        var textToTranslate = editor.innerText.trim();
        var targetClean = this.currentLang.split('-')[0];

        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(textToTranslate) + "&langpair=autodetect|" + targetClean;

        fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data && data.responseData && data.responseStatus === 200) {
                var translatedText = data.responseData.translatedText;
                if (translatedText && !translatedText.includes("INVALID SOURCE")) {
                    editor.innerText = translatedText;
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
