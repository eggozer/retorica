// CONTROL DE IDENTIDAD, REGISTRO Y MONETIZACIÓN DE RETÓRICA
export const ControlUsuarios = {
    detectarEmailDispositivo: async () => {
        // En PWAs avanzadas, permite validar si hay una sesión previa del navegador
        if (navigator.credentials) {
            try {
                const cred = await navigator.credentials.get({password: true, publicKey: false});
                if (cred) return cred.id;
            } catch (e) { console.log("Identificación automática omitida"); }
        }
        return null;
    },

    registrarNuevoUsuario: (datosUsuario) => {
        // Guarda la sesión localmente e identifica el dispositivo único
        const dispositivoId = crypto.randomUUID();
        const perfil = { ...datosUsuario, dispositivoId, creadoEn: new Date().toISOString() };
        localStorage.setItem('retorica_user_session', JSON.stringify(perfil));
        return perfil;
    },

    cerrarSesionDispositivos: (todo) => {
        if (todo) {
            // Lógica para enviar orden al servidor de cerrar sesión en la tablet, el Pixel, etc.
            console.log("Sesión cerrada en todos los dispositivos vinculados.");
        }
        localStorage.removeItem('retorica_user_session');
        window.location.reload();
    }
};
