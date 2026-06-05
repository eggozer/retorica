/**
 * Retórica - Módulo de Persistencia y Base de Datos Atómica (IndexedDB)
 * Asegura el guardado silencioso sin alertas de descarga física de archivos[cite: 16].
 */
const DB_NAME = 'RetoricaDB_V2026';
const DB_VERSION = 2;
const STORE_NAME = 'documentos_guiones';

export function initDB() {[cite: 16]
    return new Promise((resolve, reject) => {[cite: 16]
        const request = indexedDB.open(DB_NAME, DB_VERSION);[cite: 16]
        request.onupgradeneeded = (e) => {[cite: 16]
            const db = e.target.result;[cite: 16]
            if (!db.objectStoreNames.contains(STORE_NAME)) {[cite: 16]
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });[cite: 16]
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);[cite: 16]
        request.onerror = (e) => reject(e.target.error);[cite: 16]
    });
}

/**
 * Guarda un documento nativo HTML de forma interna y silenciosa.
 * Blindado para recibir firmas de metadatos completas sin romper el almacenamiento[cite: 16].
 */
export async function guardarDocumento(id, titulo, contenido, usuarioPropietario) {
    const db = await initDB();[cite: 16]
    return new Promise((resolve, reject) => {[cite: 16]
        const transaction = db.transaction([STORE_NAME], 'readwrite');[cite: 16]
        const store = transaction.objectStore(STORE_NAME);[cite: 16]
        
        const registro = { 
            id: Number(id), 
            titulo: titulo.trim() || "Sin Título", 
            contenido: contenido, 
            usuario: usuarioPropietario,
            fechaModificacion: Date.now() 
        };
        
        const request = store.put(registro);[cite: 16]
        request.onsuccess = () => resolve(true);[cite: 16]
        request.onerror = (e) => reject(e.target.error);[cite: 16]
    });
}

/**
 * Filtra y obtiene los documentos pertenecientes exclusivamente al usuario en sesión[cite: 16].
 */
export async function obtenerDocumentosPorUsuario(usuarioPropietario) {
    const db = await initDB();[cite: 16]
    return new Promise((resolve, reject) => {[cite: 16]
        const transaction = db.transaction([STORE_NAME], 'readonly');[cite: 16]
        const store = transaction.objectStore(STORE_NAME);[cite: 16]
        const request = store.getAll();[cite: 16]
        
        request.onsuccess = () => {
            const todos = request.result || [];[cite: 16]
            const filtrados = todos.filter(doc => doc.usuario === usuarioPropietario);
            resolve(filtrados);
        };
        request.onerror = (e) => reject(e.target.error);[cite: 16]
    });
}

export async function eliminarDocumento(id) {[cite: 16]
    const db = await initDB();[cite: 16]
    return new Promise((resolve, reject) => {[cite: 16]
        const transaction = db.transaction([STORE_NAME], 'readwrite');[cite: 16]
        const store = transaction.objectStore(STORE_NAME);[cite: 16]
        const request = store.delete(Number(id));[cite: 16]
        request.onsuccess = () => resolve(true);[cite: 16]
        request.onerror = (e) => reject(e.target.error);[cite: 16]
    });
}
