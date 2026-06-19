// --- RETÓRICA INTERNATIONALIZATION MODULE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es',
    db: {
        'es': { name: 'Español', save: '✓', new: '+', mic: 'Dictado', read: 'Lectura', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'en': { name: 'English', save: '✓', new: '+', mic: 'Dictate', read: 'Read', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'fr': { name: 'Français', save: '✓', new: '+', mic: 'Dictée', read: 'Lire', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'pt': { name: 'Português', save: '✓', new: '+', mic: 'Ditado', read: 'Leitura', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'de': { name: 'Deutsch', save: '✓', new: '+', mic: 'Diktat', read: 'Hören', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'it': { name: 'Italiano', save: '✓', new: '+', mic: 'Dettato', read: 'Leggi', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'zh': { name: '中文', save: '✓', new: '+', mic: '听写', read: '朗读', stop: '■', vmsg: '🔴 录音', tts: '📝🔊' },
        'ja': { name: '日本語', save: '✓', new: '+', mic: '口述', read: '朗読', stop: '■', vmsg: '🔴 録音', tts: '📝🔊' },
        'ko': { name: '한국어', save: '✓', new: '+', mic: '구술', read: '낭독', stop: '■', vmsg: '🔴 녹음', tts: '📝🔊' },
        'ar': { name: 'العربية', save: '✓', new: '+', mic: 'إملاء', read: 'قراءة', stop: '■', vmsg: '🔴 تسجيل', tts: '📝🔊' },
        'ru': { name: 'Русский', save: '✓', new: '+', mic: 'Диктант', read: 'Чтение', stop: '■', vmsg: '🔴 Запись', tts: '📝🔊' },
        'hi': { name: 'हिन्दी', save: '✓', new: '+', mic: 'श्रुतलेख', read: 'पठन', stop: '■', vmsg: '🔴 रिकॉर्ड', tts: '📝🔊' },
        'bn': { name: 'বাংলা', save: '✓', new: '+', mic: 'ডিক্টেশন', read: 'পড়া', stop: '■', vmsg: '🔴 রেকর্ড', tts: '📝🔊' },
        'tr': { name: 'Türkçe', save: '✓', new: '+', mic: 'Dikte', read: 'Okuma', stop: '■', vmsg: '🔴 Kayıt', tts: '📝🔊' },
        'nl': { name: 'Nederlands', save: '✓', new: '+', mic: 'Dictee', read: 'Lezen', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'pl': { name: 'Polski', save: '✓', new: '+', mic: 'Dyktando', read: 'Czytaj', stop: '■', vmsg: '🔴 Nagr.', tts: '📝🔊' },
        'sv': { name: 'Svenska', save: '✓', new: '+', mic: 'Diktamen', read: 'Läs', stop: '■', vmsg: '🔴 Insp.', tts: '📝🔊' },
        'vi': { name: 'Tiếng Việt', save: '✓', new: '+', mic: 'Chính tả', read: 'Đọc', stop: '■', vmsg: '🔴 Ghi âm', tts: '📝🔊' },
        'tl': { name: 'Tagalog', save: '✓', new: '+', mic: 'Dikte', read: 'Basahin', stop: '■', vmsg: '🔴 Rec', tts: '📝🔊' },
        'id': { name: 'Bahasa Indonesia', save: '✓', new: '+', mic: 'Dikte', read: 'Baca', stop: '■', vmsg: '🔴 Rekam', tts: '📝🔊' },
        'th': { name: 'ไทย', save: '✓', new: '+', mic: 'เขียนตามคำบอก', read: 'อ่าน', stop: '■', vmsg: '🔴 บันทึก', tts: '📝🔊' },
        'ms': { name: 'Bahasa Melayu', save: '✓', new: '+', mic: 'Dikte', read: 'Baca', stop: '■', vmsg: '🔴 Rakam', tts: '📝🔊' },
        'el': { name: 'Ελληνικά', save: '✓', new: '+', mic: 'Υπαγόρευση', read: 'Ανάγνωση', stop: '■', vmsg: '🔴 Εγγρ.', tts: '📝🔊' },
        'cs': { name: 'Čeština', save: '✓', new: '+', mic: 'Diktát', read: 'Čtení', stop: '■', vmsg: '🔴 Náhr.', tts: '📝🔊' },
        'ro': { name: 'Română', save: '✓', new: '+', mic: 'Dictare', read: 'Citire', stop: '■', vmsg: '🔴 Înreg.', tts: '📝🔊' },
        'hu': { name: 'Magyar', save: '✓', new: '+', mic: 'Diktálás', read: 'Olvasás', stop: '■', vmsg: '🔴 Felv.', tts: '📝🔊' },
        'uk': { name: 'Українська', save: '✓', new: '+', mic: 'Диктант', read: 'Читання', stop: '■', vmsg: '🔴 Запис', tts: '📝🔊' },
        'he': { name: 'עברית', save: '✓', new: '+', mic: 'הכתבה', read: 'קריאה', stop: '■', vmsg: '🔴 הקלטה', tts: '📝🔊' },
        'fa': { name: 'فارسی', save: '✓', new: '+', mic: 'امלא', read: 'خواندن', stop: '■', vmsg: '🔴 ضبط', tts: '📝🔊' },
        'fi': { name: 'Suomi', save: '✓', new: '+', mic: 'Sanelu', read: 'Luku', stop: '■', vmsg: '🔴 Tall.', tts: '📝🔊' }
    },

    init: function() {
        this.setAppLang(this.currentLang);
        this.renderLangModal();
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

    renderLangModal: function() {
        var modal = document.createElement('div');
        modal.id = 'lang-modal-screen';
        modal.style.cssText = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; align-items:center; justify-content:center; box-sizing:border-box; padding:20px;";
        
        var box = document.createElement('div');
        box.style.cssText = "background:var(--bg-sidebar); border:2px solid var(--border); border-radius:12px; width:100%; max-width:400px; max-height:80vh; overflow-y:auto; padding:20px; box-sizing:border-box;";
        box.innerHTML = "<h3 style='margin-top:0; color:var(--text-main); text-align:center;'>Seleccionar Idioma Global</h3>";
        
        var grid = document.createElement('div');
        grid.style.cssText = "display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;";
        
        var keys = Object.keys(this.db);
        for(var i = 0; i < keys.length; i++) {
            var code = keys[i];
            var btn = document.createElement('button');
            btn.className = 'btn-3d';
            btn.style.cssText = "padding:10px; font-size:0.85rem; width:100%; text-align:center; color:var(--text-main);";
            btn.innerText = this.db[code].name;
            (function(c) {
                btn.onclick = function() {
                    RetoricaI18n.setAppLang(c);
                    document.getElementById('lang-modal-screen').style.display = 'none';
                };
            })(code);
            grid.appendChild(btn);
        }
        
        var closeBtn = document.createElement('button');
        closeBtn.className = 'btn-3d';
        closeBtn.style.cssText = "width:100%; padding:10px; background:var(--border); color:var(--text-main); font-weight:bold;";
        closeBtn.innerText = "CERRAR";
        closeBtn.onclick = function() { modal.style.display = 'none'; };
        
        box.appendChild(grid);
        box.appendChild(closeBtn);
        modal.appendChild(box);
        document.body.appendChild(modal);
    },

    openSelector: function() {
        var m = document.getElementById('lang-modal-screen');
        if(m) m.style.display = 'flex';
    }
};
