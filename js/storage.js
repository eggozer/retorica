// --- MÓDULO DE PERSISTENCIA INDEXEDDB EXPANDIDO ---

let db = null;

export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("RetoricaDB", 3);

        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains("documentos")) {
                db.createObjectStore("documentos", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("usuarios")) {
                db.createObjectStore("usuarios", { keyPath: "email" });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };

        request.onerror = (e) => reject(e.target.error);
    });
}

export function guardarDocumento(id, titulo, contenido, audios = [], tipo = "nota", tamaño = "letter", creado = null) {
    return new Promise((resolve) => {
        const tx = db.transaction("documentos", "readwrite");
        const store = tx.objectStore("documentos");
        const ahora = Date.now();

        const item = {
            id: id,
            titulo: titulo,
            contenido: contenido,
            audios: audios,
            tipo: tipo,
            tamaño: tamaño,
            creado: creado || ahora,
            modificado: ahora
        };

        store.put(item);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
    });
}

export function obtenerDocumentos() {
    return new Promise((resolve) => {
        const tx = db.transaction("documentos", "readonly");
        const store = tx.objectStore("documentos");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
    });
}

export function eliminarDocumento(id) {
    return new Promise((resolve) => {
        const tx = db.transaction("documentos", "readwrite");
        const store = tx.objectStore("documentos");
        store.delete(id);
        tx.oncomplete = () => resolve(true);
    });
}
