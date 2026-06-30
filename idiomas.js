// --- RETÓRICA INTERNATIONALIZATION MODULE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'es-MX',
    langsOrder: [
        'es-MX', 'es-ES', 'es-US', 'en-US', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 
        'pt-BR', 'pt-PT', 'ru-RU', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA', 'hi-IN', 
        'it-CH', 'nl-NL', 'pl-PL', 'tr-TR', 'vi-VN', 'sv-SE', 'no-NO', 'da-DK', 
        'fi-FI', 'el-GR', 'he-IL', 'id-ID', 'th-TH', 'ca-ES'
    ],
    db: {
        'es-MX': { name: 'Español (México)', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Prod.\nAudio', tts: 'Texto\na Voz' },
        'es-ES': { name: 'Español (España)', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Prod.\nAudio', tts: 'Texto\na Voz' },
        'es-US': { name: 'Español (Estados Unidos)', save: 'Guardar', new: 'Nuevo', mic: 'Dictado', read: 'Lectura', stop: 'Abortar', vmsg: 'Prod.\nAudio', tts: 'Texto\na Voz' },
        'en-US': { name: 'English (United States)', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', stop: 'Abort', vmsg: 'Voice\nnProd', tts: 'Text\nto Voice' },
        'en-GB': { name: 'English (United Kingdom)', save: 'Save', new: 'New', mic: 'Dictate', read: 'Read', stop: 'Abort', vmsg: 'Voice\nnProd', tts: 'Text\nto Voice' },
        'fr-FR': { name: 'Français (France)', save: 'Sauver', new: 'Nouveau', mic: 'Dictée', read: 'Lire', stop: 'Avorter', vmsg: 'Prod\nnAudio', tts: 'Texte\nà Voix' },
        'de-DE': { name: 'Deutsch (Deutschland)', save: 'Speichern', new: 'Neu', mic: 'Diktieren', read: 'Lesen', stop: 'Abbrechen', vmsg: 'Audio\nProd', tts: 'Text\nzu Sprache' },
        'it-IT': { name: 'Italiano (Italia)', save: 'Salva', new: 'Nuovo', mic: 'Dettato', read: 'Leggi', stop: 'Annulla', vmsg: 'Prod\nAudio', tts: 'Testo\nin Voce' },
        'pt-BR': { name: 'Português (Brasil)', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', stop: 'Abortar', vmsg: 'Prod\nÁudio', tts: 'Texto\nPara Voz' },
        'pt-PT': { name: 'Português (Portugal)', save: 'Salvar', new: 'Novo', mic: 'Ditado', read: 'Leitura', stop: 'Abortar', vmsg: 'Prod\nÁudio', tts: 'Texto\nPara Voz' },
        'ru-RU': { name: 'Русский (Россия)', save: 'Сохранить', new: 'Новый', mic: 'Диктовка', read: 'Читать', stop: 'Прервать', vmsg: 'Аудио\nПрод', tts: 'Текст\nв Речь' },
        'zh-CN': { name: '中文 (简体)', save: '保存', new: '新建', mic: '听写', read: '朗读', stop: '中止', vmsg: '音频\n制作', tts: '文字\n转语音' },
        'ja-JP': { name: '日本語 (日本)', save: '保存', new: '新規', mic: '口述', read: '読み上げ', stop: '中止', vmsg: '音声\n制作', tts: 'テキスト\n音声変換' },
        'ko-KR': { name: '한국어 (대한민국)', save: '저장', new: '새로 만들기', mic: '받아쓰기', read: '읽기', stop: '중단', vmsg: '오디오\n제작', tts: '텍스트\n음성 변환' },
        'ar-SA': { name: 'العربية (السعودية)', save: 'حفظ', new: 'جديد', mic: 'إملاء', read: 'قراءة', stop: 'إلغاء', vmsg: 'إنتاج\nالصوت', tts: 'تحويل\nالنص لصوت' },
        'hi-IN': { name: 'हिन्दी (भारत)', save: 'सुरक्षित करें', new: 'नया', mic: 'श्रुतलेख', read: 'पढ़ें', stop: 'रोकें', vmsg: 'ऑडियो\nउत्पादन', tts: 'पाठ से\nआवाज़' },
        'it-CH': { name: 'Italiano (Svizzera)', save: 'Salva', new: 'Nuovo', mic: 'Dettato', read: 'Leggi', stop: 'Annulla', vmsg: 'Prod\nAudio', tts: 'Testo\nin Voce' },
        'nl-NL': { name: 'Nederlands (Nederland)', save: 'Opslaan', new: 'Nieuw', mic: 'Dicteren', read: 'Lezen', stop: 'Afbreken', vmsg: 'Audio\nProd', tts: 'Tekst\nnaar Spraak' },
        'pl-PL': { name: 'Polski (Polska)', save: 'Zapisz', new: 'Nowy', mic: 'Dyktowanie', read: 'Czytaj', stop: 'Przerwij', vmsg: 'Prod\nAudio', tts: 'Tekst\nna Głos' },
        'tr-TR': { name: 'Türkçe (Türkiye)', save: 'Kaydet', new: 'Yeni', mic: 'Dikte', read: 'Oku', stop: 'İptal', vmsg: 'Ses\nÜretimi', tts: 'Metni\nSese Çevir' },
        'vi-VN': { name: 'Tiếng Việt (Việt Nam)', save: 'Lưu', new: 'Mới', mic: 'Chính tả', read: 'Đọc', stop: 'Hủy', vmsg: 'Sản xuất\nÂm thanh', tts: 'Văn bản\nthành Giọng' },
        'sv-SE': { name: 'Svenska (Sverige)', save: 'Spara', new: 'Ny', mic: 'Diktamen', read: 'Läs', stop: 'Avbryt', vmsg: 'Ljud\nProd', tts: 'Text\ntill Tal' },
        'no-NO': { name: 'Norsk bokmål (Norge)', save: 'Lagre', new: 'Ny', mic: 'Diktat', read: 'Les', stop: 'Avbryt', vmsg: 'Lyd\nProd', tts: 'Tekst\ntil Tale' },
        'da-DK': { name: 'Dansk (Danmark)', save: 'Gem', new: 'Ny', mic: 'Diktat', read: 'Læs', stop: 'Afbryd', vmsg: 'Lyd\nProd', tts: 'Tekst\ntil Tale' },
        'fi-FI': { name: 'Suomi (Suomi)', save: 'Tallenna', new: 'Uusi', mic: 'Sanelu', read: 'Lue', stop: 'Keskeytä', vmsg: 'Äänen\nTuotto', tts: 'Teksti\nPuheeksi' },
        'el-GR': { name: 'Ελληνικά (Ελλάδα)', save: 'Αποθήκευση', new: 'Νέο', mic: 'Υπαγόρευση', read: 'Ανάγνωση', stop: 'Ακύρωση', vmsg: 'Παραγ\nΉχου', tts: 'Κείμενο\nσε Φωνή' },
        'he-IL': { name: 'עברית (ישראל)', save: 'שמור', new: 'חדש', mic: 'הכתבה', read: 'קרא', stop: 'ביטול', vmsg: 'הפקת\nשמע', tts: 'טקסט\nלדיבור' },
        'id-ID': { name: 'Bahasa Indonesia (Indonesia)', save: 'Simpan', new: 'Baru', mic: 'Dikte', read: 'Baca', stop: 'Batal', vmsg: 'Prod\nAudio', tts: 'Teks\nke Suara' },
        'th-TH': { name: 'ไทย (ประเทศไทย)', save: 'บันทึก', new: 'ใหม่', mic: 'เขียนตามคำบอก', read: 'อ่าน', stop: 'ยกเลิก', vmsg: 'ผลิต\nเสียง', tts: 'แปลงข้อความ\nเป็นเสียง' },
        'ca-ES': { name: 'Català (Espanya)', save: 'Desa', new: 'Nou', mic: 'Dictat', read: 'Lectura', stop: 'Avorta', vmsg: 'Prod\nÀudio', tts: 'Text\na Veu' }
    },
    
    // Puedes mantener tu array "idiomasSoportados" aquí abajo si tu lógica web lo requiere,
    // pero con este mapeo en "langsOrder" y "db" la UI responderá dinámicamente al instante.
    idiomasSoportados: [
        { code: 'es-MX', name: 'Español (México)' },
        { code: 'es-ES', name: 'Español (España)' },
        { code: 'es-US', name: 'Español (Estados Unidos)' },
        { code: 'en-US', name: 'English (United States)' },
        { code: 'en-GB', name: 'English (United Kingdom)' },
        { code: 'fr-FR', name: 'Français (France)' },
        { code: 'de-DE', name: 'Deutsch (Deutschland)' },
        { code: 'it-IT', name: 'Italiano (Italia)' },
        { code: 'pt-BR', name: 'Português (Brasil)' },
        { code: 'pt-PT', name: 'Português (Portugal)' },
        { code: 'ru-RU', name: 'Русский (Россия)' },
        { code: 'zh-CN', name: '中文 (简体)' },
        { code: 'ja-JP', name: '日本語 (日本)' },
        { code: 'ko-KR', name: '한국어 (대한민국)' },
        { code: 'ar-SA', name: 'العربية (السعودية)' },
        { code: 'hi-IN', name: 'हिन्दी (भारत)' },
        { code: 'it-CH', name: 'Italiano (Svizzera)' },
        { code: 'nl-NL', name: 'Nederlands (Nederland)' },
        { code: 'pl-PL', name: 'Polski (Polska)' },
        { code: 'tr-TR', name: 'Türkçe (Türkiye)' },
        { code: 'vi-VN', name: 'Tiếng Việt (Việt Nam)' },
        { code: 'sv-SE', name: 'Svenska (Sverige)' },
        { code: 'no-NO', name: 'Norsk bokmål (Norge)' },
        { code: 'da-DK', name: 'Dansk (Danmark)' },
        { code: 'fi-FI', name: 'Suomi (Suomi)' },
        { code: 'el-GR', name: 'Ελληνικά (Ελλάδα)' },
        { code: 'he-IL', name: 'עברית (ישראל)' },
        { code: 'id-ID', name: 'Bahasa Indonesia (Indonesia)' },
        { code: 'th-TH', name: 'ไทย (ประเทศไทย)' },
        { code: 'ca-ES', name: 'Català (Espanya)' }
    ]
};

    init: function() {
        this.setAppLang(this.currentLang);
    },

    toggleAppLang: function() {
        var idx = this.langsOrder.indexOf(this.currentLang);
        var nextIdx = (idx + 1) % this.langsOrder.length;
        this.setAppLang(this.langsOrder[nextIdx]);
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

    translateText: function(lang) {
        var p = this.db[lang] || this.db['es'];
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Traducción activa a: " + p.name);
        }
    }
};
