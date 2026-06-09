
// --- RETÓRICA INTERNATIONALIZATION MODULE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es',
    db: {
        'es': { name: 'Español', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', vmsg: 'Msj Voz', render: 'Render', zoom: 'Zoom', theme: 'Tema', langApp: 'Idioma App', langText: 'Traducir', sync: 'Sincronizar', logout: 'Salir', export: 'Exportar' },
        'en': { name: 'English', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', vmsg: 'Voice Msg', render: 'Render', zoom: 'Zoom', theme: 'Theme', langApp: 'App Lang', langText: 'Translate', sync: 'Sync', logout: 'Logout', export: 'Export' },
        'fr': { name: 'Français', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', vmsg: 'Msg Voc', render: 'Rendre', zoom: 'Zoom', theme: 'Thème', langApp: 'Langue App', langText: 'Traduire', sync: 'Sincroniser', logout: 'Quitter', export: 'Exporter' },
        'pt': { name: 'Português', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', vmsg: 'Msg Voz', render: 'Render', zoom: 'Zoom', theme: 'Tema', langApp: 'Idioma App', langText: 'Traduzir', sync: 'Sincronizar', logout: 'Sair', export: 'Exportar' },
        'it': { name: 'Italiano', save: 'Salva', new: 'Nuovo', mic: 'Dettato', read: 'Lettura', vmsg: 'Msg Voc', render: 'Render', zoom: 'Zoom', theme: 'Tema', langApp: 'Lingua App', langText: 'Traduci', sync: 'Sincronizza', logout: 'Esci', export: 'Esportazione' },
        'de': { name: 'Deutsch', save: 'Speichern', new: 'Neu', mic: 'Diktat', read: 'Lesen', vmsg: 'Sprachnachr.', render: 'Render', zoom: 'Zoom', theme: 'Meldung', langApp: 'App-Sprache', langText: 'Übersetzen', sync: 'Synchron.', logout: 'Abmelden', export: 'Exportieren' },
        'ja': { name: '日本語', save: '保存', new: '新規', mic: '文字起こし', read: '朗读', vmsg: '音声メモ', render: '変換', zoom: '拡大', theme: 'テーマ', langApp: 'アプリ言語', langText: '翻訳する', sync: '同期する', logout: 'ログアウト', export: 'エクスポート' },
        'ru': { name: 'Русский', save: 'Сохранить', new: 'Новый', mic: 'Диктовка', read: 'Чтение', vmsg: 'Голос.сооб', render: 'Рендер', zoom: 'Масштаб', theme: 'Тема', langApp: 'Язык прил.', langText: 'Перевести', sync: 'Синхрониз.', logout: 'Выйти', export: 'Экспорт' },
        'zh': { name: '中文', save: '保存', new: '新建', mic: '听写', read: '朗读', vmsg: '语音消息', render: '渲染', zoom: '缩放', theme: '主题', langApp: '应用语言', langText: '翻译文本', sync: '同步设备', logout: '退出登录', export: '专业导出' },
        'ar': { name: 'العربية', save: 'حفظ', new: 'جديد', mic: 'إملاء', read: 'قراءة', vmsg: 'رسالة صوتية', render: 'تصدير صوتي', zoom: 'تكبير', theme: 'مظهر', langApp: 'لغة التطبيق', langText: 'ترجمة', sync: 'مزامنة', logout: 'إغلاق', export: 'تصدير' },
        'hi': { name: 'हिन्दी', save: 'सुरक्षित करें', new: 'नया', mic: 'श्रुतलेख', read: 'पढ़ें', vmsg: 'वॉयस मैसेज', render: 'रेंडर', zoom: 'ज़ूम', theme: 'थीम', langApp: 'ऐप भाषा', langText: 'अनुवाद', sync: 'सिंक करें', logout: 'लॉगआउट', export: 'निर्यात' },
        'bn': { name: 'বাংলা', save: 'সংরক্ষণ', new: 'নতুন', mic: 'ডিক্টেশন', read: 'পড়া', vmsg: 'ভয়েস মেসেজ', render: 'রেন্ডার', zoom: 'জুম', theme: 'থিম', langApp: 'অ্যাপ ভাষা', langText: 'অনুবাদ', sync: 'সিঙ্ক', logout: 'লগআউট', export: 'রপ্তানি' },
        'ms': { name: 'Melayu', save: 'Simpan', new: 'Baru', mic: 'Dikte', read: 'Baca', vmsg: 'Mesej Suara', render: 'Render', zoom: 'Zum', theme: 'Tema', langApp: 'Bahasa App', langText: 'Terjemah', sync: 'Senkronisasi', logout: 'Log keluar', export: 'Eksport' },
        'jv': { name: 'Jawa', save: 'Simpen', new: 'Anyar', mic: 'Dikte', read: 'Moco', vmsg: 'Pesen Swara', render: 'Render', zoom: 'Zoom', theme: 'Tema', langApp: 'Basa App', langText: 'Terjemah', sync: 'Sinkron', logout: 'Metu', export: 'Ekspor' },
        'ko': { name: '한국어', save: '저장', new: '새로 만들기', mic: '음성 인식', read: '읽기', vmsg: '음성 메시지', render: '렌더링', zoom: '확대', theme: '테마', langApp: '앱 언어', langText: '번역', sync: '동기화', logout: '로그아웃', export: '내보내기' },
        'pa': { name: 'ਪੰਜਾਬੀ', save: 'ਸੰਭਾਲੋ', new: 'ਨਵਾਂ', mic: 'ਡਿਕਟੇਸ਼ਨ', read: 'ਪੜ੍ਹੋ', vmsg: 'ਵੌਇਸ ਮੈਸੇਜ', render: 'ਰੈਂਡਰ', zoom: 'ਜ਼ੂਮ', theme: 'ਥੀਮ', langApp: 'ਐਪ ਭਾਸ਼ਾ', langText: 'ਅਨੁਵਾਦ', sync: 'ਸਿੰਕ', logout: 'ਲੌਗਆਉਟ', export: 'ਨਿਰਯਾਤ' },
        'te': { name: 'తెలుగు', save: 'భద్రపరచు', new: 'కొత్తది', mic: 'డిక్టేషన్', read: 'చదవండి', vmsg: 'వాయిస్ మెసేజ్', render: 'రెండర్', zoom: 'జూమ్', theme: 'థీమ్', langApp: 'యాప్ భాష', langText: 'అనువాదం', sync: 'సింక్', logout: 'లాగౌట్', export: 'ఎగుమతి' },
        'mr': { name: 'मराठी', save: 'जतन करा', new: 'नवीन', mic: 'डिक्टेशन', read: 'वाचा', vmsg: 'व्हॉइस मेसेज', render: 'रेंडर', zoom: 'झूम', theme: 'थीम', langApp: 'अॅप भाषा', langText: 'भाषांतर', sync: 'सिंक', logout: 'लॉगआउट', export: 'निर्यात' },
        'ta': { name: 'தமிழ்', save: 'சேமி', new: 'புதிய', mic: 'அளவீடு', read: 'படி', vmsg: 'குரல் செய்தி', render: 'ரெண்டர்', zoom: 'பெரிதாக்கு', theme: 'தீம்', langApp: 'பயன்பாட்டு மொழி', langText: 'மொழிபெயர்', sync: 'ஒத்திசை', logout: 'வெளியேறு', export: 'ஏற்றுமதி' },
        'ur': { name: 'اردو', save: 'محفوظ کریں', new: 'نیا', mic: 'املا', read: 'پڑھیں', vmsg: 'وائس میسج', render: 'رینڈر', zoom: 'زوم', theme: 'تھیم', langApp: 'ایپ زبان', langText: 'ترجمہ', sync: 'सिंक', logout: 'لاگ آؤٹ', export: 'برآمد' },
        'tr': { name: 'Türkçe', save: 'Kaydet', new: 'Yeni', mic: 'Dikte', read: 'Oku', vmsg: 'Sesli Mesaj', render: 'Oluştur', zoom: 'Yakınlaştır', theme: 'Tema', langApp: 'Uygulama Dili', langText: 'Çevir', sync: 'Senkronize Et', logout: 'Çıkış Yap', export: 'Dışa Aktar' },
        'vi': { name: 'Tiếng Việt', save: 'Lưu', new: 'Mới', mic: 'Đọc ghi', read: 'Đọc', vmsg: 'Tin nhắn thoại', render: 'Xuất âm thanh', zoom: 'Thu phóng', theme: 'Giao diện', langApp: 'Ngôn ngữ ứng dụng', langText: 'Dịch văn bản', sync: 'Đồng bộ', logout: 'Đăng xuất', export: 'Xuất file' },
        'th': { name: 'ไทย', save: 'บันทึก', new: 'สร้างใหม่', mic: 'พิมพ์ด้วยเสียง', read: 'อ่าน', vmsg: 'ข้อความเสียง', render: 'เรนเดอร์', zoom: 'ซูม', theme: 'ธีม', langApp: 'ภาษาแอป', langText: 'แปลข้อความ', sync: 'ซิงค์', logout: 'ออกจากระบบ', export: 'ส่งออก' },
        'gu': { name: 'ગુજરાતી', save: 'સાચવો', new: 'નવું', mic: 'ડિક્ટેશન', read: 'વાંચો', vmsg: 'વોઇસ મેસેજ', render: 'રેન્ડર', zoom: 'ઝૂમ', theme: 'થીમ', langApp: 'એપ ભાષા', langText: 'અનુવાદ', sync: 'સિંક', logout: 'લોગઆઉટ', export: 'નિકાસ' },
        'pl': { name: 'Polski', save: 'Zapisz', new: 'Nowy', mic: 'Dyktowanie', read: 'Czytaj', vmsg: 'Wiad. głosowa', render: 'Renderuj', zoom: 'Zoom', theme: 'Motyw', langApp: 'Język aplikacji', langText: 'Tłumacz', sync: 'Synchronizuj', logout: 'Wyloguj', export: 'Eksportuj' },
        'uk': { name: 'Українська', save: 'Зберегти', new: 'Новий', mic: 'Диктовка', read: 'Читати', vmsg: 'Голос.пов.', render: 'Рендер', zoom: 'Масштаб', theme: 'Тема', langApp: 'Мова дод.', langText: 'Перекласти', sync: 'Синхронізація', logout: 'Вийти', export: 'Експорт' },
        'kn': { name: 'ಕನ್ನಡ', save: 'ಉಳಿಸು', new: 'ಹೊಸದು', mic: 'ಡಿಕ್ಟೇಶನ್', read: 'ಓದು', vmsg: 'ಧ್ವನಿ ಸಂದೇಶ', render: 'ರೆಂಡರ್', zoom: 'ಜೂಮ್', theme: 'ಥೀಮ್', langApp: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ', langText: 'ಅನುವಾದ', sync: 'ಸಿಂಕ್', logout: 'ಲಾಗೌಟ್', export: 'ರಫ್ತು' },
        'or': { name: 'ଓଡ଼ିଆ', save: 'ସଂରକ୍ଷଣ', new: 'ନୂତନ', mic: 'ଡିକ୍ଟେସନ୍', read: 'ପଢନ୍ତୁ', vmsg: 'ଭଏସ୍ ମେସେଜ୍', render: 'ରେଣ୍ଡର୍', zoom: 'ଜୁମ୍', theme: 'ଥିମ୍', langApp: 'ଆପ୍ ଭାଷା', langText: 'ଅନୁବାଦ', sync: 'ସିଙ୍କ', logout: 'ଲଗଆଉଟ', export: 'ରପ୍ତାନି' },
        'ml': { name: 'മലയാളം', save: 'സംരക്ഷിക്കുക', new: 'പുതിയത്', mic: 'ഡിക്റ്റേഷൻ', read: 'വായിക്കുക', vmsg: 'വോയ്‌സ് സന്ദേശം', render: 'റെൻഡർ', zoom: 'സൂം', theme: 'തീം', langApp: 'ആപ്പ് ഭാഷ', langText: 'വിവർത്തനം', sync: 'സിങ്ക്', logout: 'ലോഗൗട്ട്', export: 'കയറ്റുമതി' },
        'fil': { name: 'Filipino', save: 'I-save', new: 'Bago', mic: 'Diktasyon', read: 'Basahin', vmsg: 'Voice Msg', render: 'I-render', zoom: 'Zoom', theme: 'Tema', langApp: 'Wika ng App', langText: 'Isalin', sync: 'I-sync', logout: 'Mag-logout', export: 'I-export' }
    },

    init: function() {
        var selApp = document.getElementById('lang-selector-app');
        var selText = document.getElementById('lang-selector-text');
        if (!selApp || !selText) return;

        selApp.innerHTML = "";
        selText.innerHTML = "";

        for (var key in this.db) {
            if (this.db.hasOwnProperty(key)) {
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
        
        // Inyección controlada de textos en el DOM
        document.getElementById('lbl-tool-save').innerText = p.save;
        document.getElementById('lbl-tool-new').innerText = p.new;
        document.getElementById('lbl-tool-mic').innerText = p.mic;
        document.getElementById('lbl-tool-read').innerText = p.read;
        document.getElementById('lbl-tool-vmsg').innerText = p.vmsg;
        document.getElementById('lbl-tool-render').innerText = p.render;
        document.getElementById('lbl-tool-zoom').innerText = p.zoom;
        document.getElementById('lbl-tool-langapp').innerText = p.langApp;
        document.getElementById('lbl-tool-langtext').innerText = p.langText;
        document.getElementById('lbl-side-sync').innerText = p.sync;
        document.getElementById('lbl-side-logout').innerText = p.logout;
        document.getElementById('lbl-side-export').innerText = p.export;
        
        RetoricaUI.notify("Idioma cambiado: " + p.name);
    },

    translateText: function(lang) {
        var p = this.db[lang] || this.db['es'];
        RetoricaUI.notify("Traduciendo contenido del lienzo al " + p.name + "...");
    }
};
