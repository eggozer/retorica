// --- RETÓRICA INTERNATIONALIZATION & TRANSLATION ENGINE (idiomas.js CORREGIDO) ---
var RetoricaI18n = {
    currentLang: 'en-GB', 
    currentVoiceLang: 'en-GB', 
    
    langsOrder: ['ar-SA', 'de-DE', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'hi-IN', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'uk-UA', 'zh-CN'],
    
    db: {
        'ar-SA': { name: 'Al-Arabiya', save: 'حفظ', new: 'جديد', mic: 'صوت', read: 'إقرأ', stop: 'إلغاء', vmsg: 'تسجيل', tts: 'صوت', copy: 'نسخ', import: 'استيراد', pdf: 'PDF', pdfedit: 'تعديل PDF', doc: 'WORD', sync: 'تزامن', backup: 'نسخ', restore: 'استعادة', zoomin: 'تكبير', zoomout: 'تصغير', pTitle: 'عنوان النص...', pBody: 'اكتب أو أملي نصوصك هنا...', menu: 'قائمة', install: 'تثبيت', theme: 'سمة', langTxt: 'لغة', langVoz: 'صوت', del: 'حذف', copyCard: 'نسخ', share: 'مشاركة' },
        'de-DE': { name: 'Deutsch', save: 'SPE', new: 'NEU', mic: 'DIK', read: 'LIES', stop: 'HALT', vmsg: 'REC', tts: 'TON', copy: 'KOP', import: 'IMP', pdf: 'PDF', pdfedit: 'PDF EDT', doc: 'DOC', sync: 'SYN', backup: 'SIC', restore: 'RÜC', zoomin: 'ZOO +', zoomout: 'ZOO -', pTitle: 'Skripttitel...', pBody: 'Schreiben oder diktieren Sie hier...', menu: 'MENÜ', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'TON', del: 'LÖSCHEN', copyCard: 'KOPIEREN', share: 'TEILEN' },
        'en-GB': { name: 'English', save: 'SAV', new: 'NEW', mic: 'MIC', read: 'SAY', stop: 'STOP', vmsg: 'REC', tts: 'AUD', copy: 'CPY', import: 'IMP', pdf: 'PDF', pdfedit: 'PDF EDIT', doc: 'DOC', sync: 'SYNC', backup: 'BAK', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Script Title...', pBody: 'Write or dictate your rhetoric here...', menu: 'MENU', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'VOI', del: 'DELETE', copyCard: 'COPY', share: 'SHARE' },
        'es-ES': { name: 'Español (ES)', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEE', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'EDIT PDF', doc: 'DOC', sync: 'SINC', backup: 'RESP', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Titular de la Obra...', pBody: 'Escribe o dicta aquí tu obra...', menu: 'MENÚ', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ', del: 'BORRAR', copyCard: 'COPIAR', share: 'COMPARTIR' },
        'es-MX': { name: 'Español (MX)', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEE', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'EDIT PDF', doc: 'DOC', sync: 'SINC', backup: 'RESP', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí tu retórica...', menu: 'MENÚ', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ', del: 'BORRAR', copyCard: 'COPIAR', share: 'COMPARTIR' },
        'fr-FR': { name: 'Français', save: 'SAV', new: 'NOU', mic: 'MIC', read: 'LIS', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'ÉDIT PDF', doc: 'DOC', sync: 'SYN', backup: 'SAUV', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Titre du Scénario...', pBody: 'Écrivez ou dictez votre rhétorique ici...', menu: 'MENU', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'VOI', del: 'SUPPRIMER', copyCard: 'COPIER', share: 'PARTAGER' },
        'hi-IN': { name: 'Hindi', save: 'रखो', new: 'नया', mic: 'बोल', read: 'सुन', stop: 'रोक', vmsg: 'रिए', tts: 'ध्व', copy: 'प्रति', import: 'आयात', pdf: 'PDF', pdfedit: 'PDF संपा', doc: 'DOC', sync: 'सिंक', backup: 'बैक', restore: 'पुनः', zoomin: 'ज़ूम +', zoomout: 'ज़ूम -', pTitle: 'शीर्षक...', pBody: 'अपनी पटकथा यहाँ लिखें...', menu: 'सूची', install: 'ऐप', theme: 'थीम', langTxt: 'पाठ', langVoz: 'आवाज़', del: 'हटाएं', copyCard: 'कॉपी', share: 'साझा' },
        'it-IT': { name: 'Italiano', save: 'SAL', new: 'NVO', mic: 'VOC', read: 'LEG', stop: 'ALT', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'MOD PDF', doc: 'DOC', sync: 'SINC', backup: 'BAC', restore: 'RIP', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Titolo dello Script...', pBody: 'Scrivi o detta qui la tua retorica...', menu: 'MENU', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOC', del: 'ELIMINA', copyCard: 'COPIA', share: 'CONDIVIDI' },
        'ja-JP': { name: 'Japanese', save: '保存', new: '新規', mic: '音声', read: '再生', stop: '停止', vmsg: '録音', tts: '音源', copy: '複写', import: '取込', pdf: 'PDF', pdfedit: 'PDF編集', doc: 'DOC', sync: '同期', backup: '退避', restore: '復元', zoomin: '拡大', zoomout: '縮小', pTitle: 'タイトル...', pBody: 'ここにレトリックを書きます...', menu: '献立', install: '追加', theme: '配色', langTxt: '文字', langVoz: '音声', del: '削除', copyCard: '複製', share: '共有' },
        'pt-PT': { name: 'Português', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEI', stop: 'FIM', vmsg: 'REC', tts: 'AUD', copy: 'COP', import: 'IMP', pdf: 'PDF', pdfedit: 'EDIT PDF', doc: 'DOC', sync: 'SINC', backup: 'CÓP', restore: 'REST', zoomin: 'ZOOM +', zoomout: 'ZOOM -', pTitle: 'Título do Roteiro...', pBody: 'Escreva ou dite sua retórica aqui...', menu: 'MENU', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ', del: 'APAGAR', copyCard: 'COPIAR', share: 'PARTILHAR' },
        'ru-RU': { name: 'Русский', save: 'СОХ', new: 'НОВ', mic: 'ГОЛ', read: 'ЧИТ', stop: 'СТОП', vmsg: 'ЗАП', tts: 'ЗВУК', copy: 'КОП', import: 'ИМП', pdf: 'PDF', pdfedit: 'РЕД PDF', doc: 'DOC', sync: 'СИНК', backup: 'РЕЗ', restore: 'ВОС', zoomin: 'МАС +', zoomout: 'МАС -', pTitle: 'Название...', pBody: 'Пишите здесь...', menu: 'МЕНЮ', install: 'АПП', theme: 'ТЕМ', langTxt: 'ТКСТ', langVoz: 'ГОЛ', del: 'УДАЛИТЬ', copyCard: 'КОПИРОВАТЬ', share: 'ПОДЕЛИТЬСЯ' },
        'uk-UA': { name: 'Ukrainian', save: 'ЗБЕР', new: 'НОВ', mic: 'ГОЛ', read: 'ЧИТ', stop: 'СТОП', vmsg: 'ЗАП', tts: 'ЗВУК', copy: 'КОП', import: 'ІМП', pdf: 'PDF', pdfedit: 'РЕД PDF', doc: 'DOC', sync: 'СИНХ', backup: 'КОП', restore: 'VOS', zoomin: 'ЗУМ +', zoomout: 'ЗУМ -', pTitle: 'Назва Сценарію...', pBody: 'Пишіть або диктуйте риторику тут...', menu: 'МЕНЮ', install: 'АПП', theme: 'ТЕМ', langTxt: 'ТЕКСТ', langVoz: 'ГОЛ', del: 'ВИДАЛИТИ', copyCard: 'КОПІЮВАТИ', share: 'ПОДІЛИТИСЯ' },
        'zh-CN': { name: 'Chinese', save: '保存', new: '新建', mic: '语音', read: '朗读', stop: '停止', vmsg: '录音', tts: '音频', copy: '复制', import: '导入', pdf: 'PDF', pdfedit: '编辑PDF', doc: 'DOC', sync: '同步', backup: '备份', restore: '恢复', zoomin: '放大', zoomout: '缩小', pTitle: '剧本标题...', pBody: '在此处编写您的剧本...', menu: '菜单', install: '安装', theme: '主题', langTxt: '文字', langVoz: '语音', del: '删除', copyCard: '复制', share: '分享' }
    },

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

    setAppLang: function(lang) {
        this.currentLang = lang;
        this.currentVoiceLang = lang;
        var p = this.db[lang] || this.db['en-GB']; 
        
        function updateLabelWithMarquee(elementId, text) {
            var el = document.getElementById(elementId);
            if (!el) return;
            if (text && text.length > 8) {
                el.innerHTML = '<span class="scroll-text">' + text + '</span>';
            } else {
                el.innerText = text || '';
            }
        }

        // Mapeo de botones de la barra superior
        updateLabelWithMarquee('lbl-tool-save', p.save || 'GUARDAR');
        updateLabelWithMarquee('lbl-tool-new', p.new || 'NUEVO');
        updateLabelWithMarquee('lbl-tool-mic', p.mic || 'VOZ');
        updateLabelWithMarquee('lbl-tool-read', p.read || 'LEER');
        updateLabelWithMarquee('lbl-tool-stop', p.stop || 'FIN');
        updateLabelWithMarquee('lbl-tool-vmsg', p.vmsg || 'GRABAR');
        updateLabelWithMarquee('lbl-tool-tts', p.tts || 'AUDIO');
        updateLabelWithMarquee('lbl-tool-copyall', p.copy || 'COPIAR');
        updateLabelWithMarquee('lbl-tool-import', p.import || 'IMPORTAR');
        updateLabelWithMarquee('lbl-tool-pdf', p.pdf || 'PDF');
        updateLabelWithMarquee('lbl-tool-pdfedit', p.pdfedit || 'EDIT PDF');
        updateLabelWithMarquee('lbl-tool-doc', p.doc || 'DOC');
        updateLabelWithMarquee('lbl-tool-sync', p.sync || 'SINCRONIZAR');
        updateLabelWithMarquee('lbl-tool-backup', p.backup || 'RESPALDO');
        updateLabelWithMarquee('lbl-tool-restore', p.restore || 'RESTAURAR');
        updateLabelWithMarquee('lbl-tool-zoomin', p.zoomin || 'AMPLIAR');
        updateLabelWithMarquee('lbl-tool-zoomout', p.zoomout || 'REDUCIR');
        
        // Placeholders de los editores
        var tInput = document.getElementById('editor-title'); 
        if(tInput) tInput.placeholder = p.pTitle;
        var bInput = document.getElementById('editor-body'); 
        if(bInput && !bInput.innerText.trim()) {
            // No sobreescribir contenido existente del usuario
        }
        
        // Controles de Navegación
        updateLabelWithMarquee('lbl-nav-menu', p.menu || 'MENÚ');
        updateLabelWithMarquee('lbl-nav-install', p.install || 'INSTALAR');
        updateLabelWithMarquee('lbl-nav-theme', p.theme || 'TEMA');
        updateLabelWithMarquee('lbl-nav-langtxt', p.langTxt || 'TEXTO');
        
        // Actualizar etiquetas de la biblioteca de tarjetas
        document.querySelectorAll('.card-btn-delete').forEach(function(el) { 
            el.setAttribute('title', p.del || 'BORRAR'); 
            el.setAttribute('aria-label', p.del || 'BORRAR'); 
        });
        document.querySelectorAll('.card-btn-copy').forEach(function(el) { 
            el.setAttribute('title', p.copyCard || 'COPIAR'); 
            el.setAttribute('aria-label', p.copyCard || 'COPIAR'); 
        });
        document.querySelectorAll('.card-btn-share').forEach(function(el) { 
            el.setAttribute('title', p.share || 'COMPARTIR'); 
            el.setAttribute('aria-label', p.share || 'COMPARTIR'); 
        });

        // Disparar traducción si hay texto seleccionado en el editor
        this.translateWork();

        if (typeof RetoricaUI !== 'undefined' && RetoricaUI.notify) {
            RetoricaUI.notify("Idioma Activo: " + p.name);
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
        this.langsOrder.forEach(function(langKey) {
            var wrapper = document.createElement('div');
            var isActive = (langKey === self.currentLang);
            
            wrapper.className = 'btn-wrapper-3d' + (isActive ? ' active-wrapper' : '');

            var label = document.createElement('div');
            label.className = 'btn-label-3d';
            label.innerText = langKey.split('-')[0].toUpperCase();

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-round-3d' + (isActive ? ' active' : '');
            
            var iconSpan = document.createElement('span');
            iconSpan.className = 'icon-raw';
            iconSpan.innerText = langKey.substring(0, 2).toUpperCase();
            btn.appendChild(iconSpan);

            wrapper.appendChild(label);
            wrapper.appendChild(btn);

            wrapper.onclick = function(e) {
                if (e) e.stopPropagation();
                self.setAppLang(langKey);
                self.renderAccordionLanguages();
            };

            track.appendChild(wrapper);
        });
    },

    translateWork: function() {
        this.checkAndTranslateSelection(this.currentLang, this.currentLang);
    },

    checkAndTranslateSelection: function(sourceLang, targetLang) {
        var editor = document.getElementById('editor-body');
        if (!editor || !editor.innerText.trim()) return;

        var selection = window.getSelection();
        var selectedText = selection.toString().trim();
        
        // Si no hay texto seleccionado, traducir todo el texto del editor
        var isFullText = false;
        if (!selectedText) {
            selectedText = editor.innerText.trim();
            isFullText = true;
        }

        var targetClean = (targetLang || this.currentLang).split('-')[0];

        var sourceClean = "autodetect";
        var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(selectedText) + "&langpair=" + sourceClean + "|" + targetClean;

        fetch(url)
        .then(function(res) { 
            if (!res.ok) throw new Error("Error HTTP " + res.status);
            return res.json(); 
        })
        .then(function(data) {
            if (data && data.responseData && data.responseStatus === 200) {
                var translatedText = data.responseData.translatedText;
                
                if (!translatedText || translatedText.includes("INVALID SOURCE LANGUAGE") || translatedText.includes("PLEASE SELECT TWO DISTINCT LANGUAGES")) {
                    return;
                }

                if (!isFullText && selection.rangeCount > 0) {
                    var range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(translatedText));
                } else {
                    editor.innerText = translatedText;
                }
                
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.updateCounters();
                    if (typeof RetoricaUI.triggerAutoSave === 'function') RetoricaUI.triggerAutoSave();
                    RetoricaUI.notify("Traducción completada ✓");
                }
            }
        }).catch(function(err) {
            console.warn("Traducción no disponible en este momento:", err);
        });
    }
};

var handleLayoutResize = function() {
    setTimeout(function() {
        if (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.renderAccordionLanguages) {
            var panel = document.getElementById('accordion-languages');
            if (panel && !panel.classList.contains('accordion-closed')) {
                RetoricaI18n.renderAccordionLanguages();
            }
        }
    }, 200);
};

window.addEventListener("orientationchange", handleLayoutResize);
window.addEventListener("resize", handleLayoutResize);
