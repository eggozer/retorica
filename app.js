// Script Principal de Control (Compatibilidad ES5)

document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicializar Editor e Idioma
    DocEditor.init('editor');
    I18nEngine.initLanguage();

    // 2. Definición de Botones Principales
    var toolbar = document.getElementById('main-toolbar');
    var editorElem = document.getElementById('editor');

    var buttonsConfig = [
        { id: 'app', label: 'Instalar', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', action: function() { triggerPwaInstall(); } },
        { id: 'save', label: 'Guardar', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>', action: function() { saveCurrentDoc(); } },
        { id: 'new', label: 'Nuevo', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>', action: function() { editorElem.innerHTML = ''; } },
        { id: 'mic', label: 'Dictar', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>', action: function() { toggleDictation(this); } },
        { id: 'read', label: 'Lectura', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>', action: function() { AudioEngine.speakText(editorElem.innerText, document.getElementById('btn-round-read')); } },
        { id: 'aud', label: 'A Audio', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', action: function() { AudioEngine.generateWavAudio(editorElem.innerText); } },
        { id: 'stop', label: 'Detener', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"/></svg>', action: function() { AudioEngine.stopSpeaking(document.getElementById('btn-round-read')); } },
        { id: 'doc', label: 'Word/PDF', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', action: function() { DocEditor.exportToWord('Documento_Retorica'); } }
    ];

    // 3. Renderizar Botonera Redonda
    for (var i = 0; i < buttonsConfig.length; i++) {
        var item = buttonsConfig[i];
        var btnNode = createRoundButton('btn-round-' + item.id, item.icon, item.label, item.action);
        
        // Asignar ID interno a la etiqueta para soporte de traducción i18n
        var labelElem = btnNode.querySelector('.btn-label');
        if (labelElem) labelElem.id = 'label-btn-' + item.id;

        toolbar.appendChild(btnNode);
    }

    renderLibrary();
});

// Función Auxiliar para Dictado por Voz
function toggleDictation(btn) {
    var editorElem = document.getElementById('editor');
    AudioEngine.toggleRecording(
        document.getElementById('btn-round-mic'),
        function(transcript) {
            editorElem.innerText = transcript;
        },
        function(err) {
            alert(err);
        }
    );
}

// Guardar Documento en Storage Local
function saveCurrentDoc() {
    var editorElem = document.getElementById('editor');
    var text = editorElem.innerHTML;
    if (!text.trim()) return;

    var docs = JSON.parse(localStorage.getItem('retorica_docs') || '[]');
    docs.unshift({
        id: new Date().getTime(),
        content: text,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem('retorica_docs', JSON.stringify(docs));
    renderLibrary();
}

// Renderizar Tarjetas de Biblioteca
function renderLibrary() {
    var grid = document.getElementById('library-grid');
    grid.innerHTML = '';
    var docs = JSON.parse(localStorage.getItem('retorica_docs') || '[]');

    for (var i = 0; i < docs.length; i++) {
        (function(doc) {
            var card = document.createElement('div');
            card.className = 'card-template';
            card.innerHTML = '<div class="card-preview">' + doc.content + '</div>' +
                             '<small style="color:#888;">' + doc.date + '</small>' +
                             '<button class="btn-del-card" style="position:absolute; top:5px; right:5px; background:none; border:none; color:#ff3366; cursor:pointer;">✕</button>';

            card.querySelector('.btn-del-card').onclick = function(e) {
                e.stopPropagation();
                deleteDocumentWithUndo(doc.id, renderLibrary);
            };

            card.onclick = function() {
                document.getElementById('editor').innerHTML = doc.content;
            };

            grid.appendChild(card);
        })(docs[i]);
    }
}

// Registro de Service Worker (Soporte Offline PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function(err) {
        console.log('Error registro SW:', err);
    });
}

var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
});

function triggerPwaInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function() {
            deferredPrompt = null;
        });
    } else {
        alert("La aplicación ya está instalada o el navegador no soporta instalación directa.");
    }
}
