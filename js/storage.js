/**
 * Retórica - Módulo de Persistencia de Datos (Notas e Historial)
 */
class StorageManager {
    constructor() {
        this.notasKey = 'retorica_notas_db';
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem(this.notasKey)) {
            localStorage.setItem(this.notasKey, JSON.stringify([]));
        }
    }

    guardarNota(titulo, contenido, usuario) {
        const notas = this.obtenerTodasLasNotas();
        const notaId = Date.now().toString();

        const nuevaNota = {
            id: notaId,
            titulo: titulo.trim() || "Nota sin título",
            contenido: contenido,
            autor: usuario || "Anónimo",
            fecha: new Date().toLocaleString()
        };

        notas.push(nuevaNota);
        localStorage.setItem(this.notasKey, JSON.stringify(notas));
        return nuevaNota;
    }

    obtenerTodasLasNotas() {
        return JSON.parse(localStorage.getItem(this.notasKey)) || [];
    }

    obtenerNotasPorUsuario(usuario) {
        const notas = this.obtenerTodasLasNotas();
        if (!usuario) return notas.filter(n => n.autor === "Anónimo");
        return notas.filter(n => n.autor === usuario);
    }
}

window.storageSystem = new StorageManager();
