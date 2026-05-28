// --- MÓDULO DE TRADUCCIÓN E IDIOMAS INTERNACIONALES ---

export const LISTA_IDIOMAS = [
    { code: 'es', name: 'Español', voiceCode: 'es-MX', saveAs: 'Guardar como:', newDoc: '➕' },
    { code: 'en', name: 'English', voiceCode: 'en-US', saveAs: 'Save as:', newDoc: '➕ New' },
    { code: 'fr', name: 'Français', voiceCode: 'fr-FR', saveAs: 'Enregistrer:', newDoc: '➕ Nouveau' },
    { code: 'pt', name: 'Português', voiceCode: 'pt-BR', saveAs: 'Salvar como:', newDoc: '➕ Novo' }
];

export function cargarSelectores(comboApp, comboVoz) {
    // Limpiar selectores
    comboApp.innerHTML = '';
    comboVoz.innerHTML = '';

    // Llenar selector de idioma de la aplicación
    LISTA_IDIOMAS.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        comboApp.appendChild(option);
    });

    // Llenar selector de idioma de dictado (Soporte inicial extendido)
    const vocesDisponibles = [
        { code: 'es-MX', name: 'Español (MX)' },
        { code: 'es-ES', name: 'Español (ES)' },
        { code: 'en-US', name: 'English (US)' },
        { code: 'fr-FR', name: 'Français (FR)' },
        { code: 'pt-BR', name: 'Português (BR)' }
    ];

    vocesDisponibles.forEach(voz => {
        const option = document.createElement('option');
        option.value = voz.code;
        option.textContent = voz.name;
        comboVoz.appendChild(option);
    });
}

export function aplicarTraduccionInterfaz(codigoIdioma, elementos) {
    const langConfig = LISTA_IDIOMS.find(l => l.code === codigoIdioma) || LISTA_IDIOMAS[0];
    
    // Corregido para usar .saveAs tal como se declaró arriba
    if (elementos.lblSaveAs) elementos.lblSaveAs.textContent = langConfig.saveAs;
    if (elementos.btnNuevo) elementos.btnNuevo.textContent = langConfig.newDoc;
    
    document.documentElement.lang = codigoIdioma;
    return langConfig;
}
