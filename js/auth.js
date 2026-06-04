/**
 * Retórica - Módulo de Gestión de Sesiones y Registros de Usuarios
 */
class AuthManager {
    constructor() {
        this.usuariosKey = 'retorica_usuarios_db';
        this.sesionKey = 'retorica_usuario_activo';
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem(this.usuariosKey)) {
            localStorage.setItem(this.usuariosKey, JSON.stringify([]));
        }
    }

    // Registro de un usuario nuevo
    registrarUsuario(username) {
        const nameClean = username.trim();
        if (!nameClean) throw new Error("El nombre de usuario no puede estar vacío.");

        const usuarios = JSON.parse(localStorage.getItem(this.usuariosKey));
        
        // Validar si ya existe
        if (usuarios.includes(nameClean)) {
            // Si ya existe, asumimos el login directo por facilidad de uso local
            this.setSession(nameClean);
            return nameClean;
        }

        usuarios.push(nameClean);
        localStorage.setItem(this.usuariosKey, JSON.stringify(usuarios));
        this.setSession(nameClean);
        return nameClean;
    }

    setSession(username) {
        localStorage.setItem(this.sesionKey, username);
    }

    getUsuarioActivo() {
        return localStorage.getItem(this.sesionKey) || null;
    }

    cerrarSesion() {
        localStorage.removeItem(this.sesionKey);
    }

    obtenerTodosLosUsuarios() {
        return JSON.parse(localStorage.getItem(this.usuariosKey)) || [];
    }
}

// Instancia global accesible desde main.js
window.authSystem = new AuthManager();
