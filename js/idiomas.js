// --- MÓDULO DE TRADUCCIÓN E IDIOMAS INTERNACIONALES EXPANSIÓN ---

export const LISTA_IDIOMAS = [
    { code: 'es', name: 'Español', voiceCode: 'es-MX', saveAs: 'Guardar como:', newDoc: '➕' },
    { code: 'en', name: 'English', voiceCode: 'en-US', saveAs: 'Save as:', newDoc: '➕ New' },
    { code: 'fr', name: 'Français', voiceCode: 'fr-FR', saveAs: 'Enregistrer:', newDoc: '➕ Nouveau' },
    { code: 'pt', name: 'Português', voiceCode: 'pt-BR', saveAs: 'Salvar como:', newDoc: '➕ Novo' },
    { code: 'de', name: 'Deutsch', voiceCode: 'de-DE', saveAs: 'Speichern als:', newDoc: '➕ Neu' },
    { code: 'ru', name: 'Русский', voiceCode: 'ru-RU', saveAs: 'Сохранить как:', newDoc: '➕ Новый' },
    { code: 'ja', name: '日本語', voiceCode: 'ja-JP', saveAs: '名前を付けて保存:', newDoc: '➕ 新規' },
    { code: 'zh', name: '中文', voiceCode: 'zh-CN', saveAs: '另存为:', newDoc: '➕ 新建' },
    { code: 'hi', name: 'हिन्दी', voiceCode: 'hi-IN', saveAs: 'इस रूप में सहेजें:', newDoc: '➕ नया' },
    { code: 'ar', name: 'العربية', voiceCode: 'ar-SA', saveAs: 'حفظ باسم:', newDoc: '➕ جديد' }
];

export function cargarSelectores(comboApp, comboVoz) {
    comboApp.innerHTML = '';
    comboVoz.innerHTML = '';

    LISTA_IDIOMAS.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        comboApp.appendChild(option);
    });

    const vocesDisponibles = [
        { code: 'es-MX', name: 'Español (MX)' },
        { code: 'es-ES', name: 'Español (ES)' },
        { code: 'en-US', name: 'English (US)' },
        { code: 'fr-FR', name: 'Français (FR)' },
        { code: 'pt-BR', name: 'Português (BR)' },
        { code: 'de-DE', name: 'Deutsch (DE)' },
        { code: 'ru-RU', name: 'Русский (RU)' },
        { code: 'ja-JP', name: '日本語 (JP)' },
        { code: 'zh-CN', name: '中文 (CN)' },
        { code: 'hi-IN', name: 'हिन्दी (IN)' },
        { code: 'ar-SA', name: 'العربية (SA)' }
    ];

    vocesDisponibles.forEach(voz => {
        const option = document.createElement('option');
        option.value = voz.code;
        option.textContent = voz.name;
        comboVoz.appendChild(option);
    });
}

export function aplicarTraduccionInterfaz(codigoIdioma, elementos) {
    const langConfig = LISTA_IDIOMAS.find(l => l.code === codigoIdioma) || LISTA_IDIOMAS[0];
    
    if (elementos.lblSaveAs) elementos.lblSaveAs.textContent = langConfig.saveAs;
    if (elementos.btnNuevo) elementos.btnNuevo.textContent = langConfig.newDoc;
    
    document.documentElement.lang = codigoIdioma;
    return langConfig;
}
