/**
 * Retórica - Módulo de Traducción Internacional Expandido (30 Idiomas Principales)[cite: 14].
 */
export const DICCIONARIO_30_IDIOMAS = [
    { code: 'es', name: 'Español', voiceCode: 'es-MX', saveLabel: 'Guardar', msgNuevo: 'Nueva' },
    { code: 'en', name: 'English', voiceCode: 'en-US', saveLabel: 'Save', msgNuevo: 'New' },
    { code: 'fr', name: 'Français', voiceCode: 'fr-FR', saveLabel: 'Enregistrer', msgNuevo: 'Nouveau' },
    { code: 'de', name: 'Deutsch', voiceCode: 'de-DE', saveLabel: 'Speichern', msgNuevo: 'Neu' },
    { code: 'it', name: 'Italiano', voiceCode: 'it-IT', saveLabel: 'Salva', msgNuevo: 'Nuovo' },
    { code: 'pt', name: 'Português', voiceCode: 'pt-BR', saveLabel: 'Salvar', msgNuevo: 'Novo' },
    { code: 'ru', name: 'Русский', voiceCode: 'ru-RU', saveLabel: 'Сохранить', msgNuevo: 'Новый' },
    { code: 'zh', name: '中文', voiceCode: 'zh-CN', saveLabel: '保存', msgNuevo: '新建' },
    { code: 'ja', name: '日本語', voiceCode: 'ja-JP', saveLabel: '保存', msgNuevo: '新規' },
    { code: 'ko', name: '한국어', voiceCode: 'ko-KR', saveLabel: '저장', msgNuevo: '새 문서' },
    { code: 'ar', name: 'العربية', voiceCode: 'ar-SA', saveLabel: 'حفظ', msgNuevo: 'جديد' },
    { code: 'hi', name: 'हिन्दी', voiceCode: 'hi-IN', saveLabel: 'सुरक्षित करें', msgNuevo: 'नया' },
    { code: 'bn', name: 'বাংলা', voiceCode: 'bn-BD', saveLabel: 'সংরক্ষণ', msgNuevo: 'নতুন' },
    { code: 'tr', name: 'Türkçe', voiceCode: 'tr-TR', saveLabel: 'Kaydet', msgNuevo: 'Yeni' },
    { code: 'vi', name: 'Tiếng Việt', voiceCode: 'vi-VN', saveLabel: 'Lưu', msgNuevo: 'Mới' },
    { code: 'pl', name: 'Polski', voiceCode: 'pl-PL', saveLabel: 'Zapisz', msgNuevo: 'Nowy' },
    { code: 'nl', name: 'Nederlands', voiceCode: 'nl-NL', saveLabel: 'Opslaan', msgNuevo: 'Nieuw' },
    { code: 'uk', name: 'Українська', voiceCode: 'uk-UA', saveLabel: 'Зберегти', msgNuevo: 'Новий' },
    { code: 'he', name: 'עברית', voiceCode: 'he-IL', saveLabel: 'שמור', msgNuevo: 'חדש' },
    { code: 'id', name: 'Bahasa Indonesia', voiceCode: 'id-ID', saveLabel: 'Simpan', msgNuevo: 'Baru' },
    { code: 'ms', name: 'Bahasa Melayu', voiceCode: 'ms-MY', saveLabel: 'Simpan', msgNuevo: 'Baru' },
    { code: 'th', name: 'ไทย', voiceCode: 'th-TH', saveLabel: 'บันทึก', msgNuevo: 'ใหม่' },
    { code: 'fa', name: 'فارسی', voiceCode: 'fa-IR', saveLabel: 'ذخیره', msgNuevo: 'جدید' },
    { code: 'el', name: 'Ελληνικά', voiceCode: 'el-GR', saveLabel: 'Αποθήκευση', msgNuevo: 'Νέο' },
    { code: 'sv', name: 'Svenska', voiceCode: 'sv-SE', saveLabel: 'Spara', msgNuevo: 'Ny' },
    { code: 'no', name: 'Norsk', voiceCode: 'no-NO', saveLabel: 'Lagre', msgNuevo: 'Ny' },
    { code: 'fi', name: 'Suomi', voiceCode: 'fi-FI', saveLabel: 'Tallenna', msgNuevo: 'Uusi' },
    { code: 'da', name: 'Dansk', voiceCode: 'da-DK', saveLabel: 'Gem', msgNuevo: 'Ny' },
    { code: 'cs', name: 'Čeština', voiceCode: 'cs-CZ', saveLabel: 'Uložit', msgNuevo: 'Nový' },
    { code: 'hu', name: 'Magyar', voiceCode: 'hu-HU', saveLabel: 'Mentés', msgNuevo: 'Új' }
];

export function cargarSelectores(comboApp, comboVoz) {[cite: 14]
    comboApp.innerHTML = '';[cite: 14]
    comboVoz.innerHTML = '';[cite: 14]

    DICCIONARIO_30_IDIOMAS.forEach(lang => {[cite: 14]
        const option = document.createElement('option');[cite: 14]
        option.value = lang.code;[cite: 14]
        option.textContent = lang.name;[cite: 14]
        comboApp.appendChild(option);[cite: 14]
    });

    DICCIONARIO_30_IDIOMAS.forEach(lang => {
        const option = document.createElement('option');[cite: 14]
        option.value = lang.voiceCode;[cite: 14]
        option.textContent = `${lang.name} (${lang.voiceCode.split('-')[1]})`;[cite: 14]
        comboVoz.appendChild(option);[cite: 14]
    });
}

export function aplicarTraduccionInterfaz(codigoIdioma, elementos) {[cite: 14]
    const configuracion = DICCIONARIO_30_IDIOMAS.find(l => l.code === codigoIdioma) || DICCIONARIO_30_IDIOMAS[0];[cite: 14]
    
    if (elementos.btnGuardar) elementos.btnGuardar.setAttribute('title', configuracion.saveLabel);
    if (elementos.btnNuevo) elementos.btnNuevo.setAttribute('title', configuracion.msgNuevo);
    
    document.documentElement.lang = codigoIdioma;[cite: 14]
    return configuracion;[cite: 14]
}
