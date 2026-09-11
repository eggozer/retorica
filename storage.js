var tempDeletedDoc = null;
var undoTimer = null;

// Guardar Plantilla Temporalmente para Deshacer
function deleteDocumentWithUndo(docId, renderCallback) {
    var docs = JSON.parse(localStorage.getItem('retorica_docs') || '[]');
    var index = -1;

    for (var i = 0; i < docs.length; i++) {
        if (docs[i].id === docId) {
            index = i;
            break;
        }
    }

    if (index !== -1) {
        tempDeletedDoc = { data: docs[index], index: index };
        docs.splice(index, 1);
        localStorage.setItem('retorica_docs', JSON.stringify(docs));
        
        renderCallback();
        showUndoToast(renderCallback);
    }
}

// Mostrar Notificación Flotante "Deshacer"
function showUndoToast(renderCallback) {
    var existingToast = document.getElementById('toast-undo');
    if (existingToast) existingToast.parentNode.removeChild(existingToast);

    var toast = document.createElement('div');
    toast.id = 'toast-undo';
    toast.innerHTML = '<span>Plantilla eliminada</span>' +
                      '<button id="btn-undo" style="color:#00FF66; background:none; border:none; font-weight:bold; cursor:pointer;">DESHACER</button>';

    document.body.appendChild(toast);

    document.getElementById('btn-undo').onclick = function() {
        if (tempDeletedDoc) {
            var docs = JSON.parse(localStorage.getItem('retorica_docs') || '[]');
            docs.splice(tempDeletedDoc.index, 0, tempDeletedDoc.data);
            localStorage.setItem('retorica_docs', JSON.stringify(docs));
            tempDeletedDoc = null;
            clearTimeout(undoTimer);
            toast.parentNode.removeChild(toast);
            renderCallback();
        }
    };

    // Desaparece después de 10 segundos
    undoTimer = setTimeout(function() {
        tempDeletedDoc = null;
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 10000);
}
