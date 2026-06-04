/**
 * Retórica - Orquestador de la Aplicación (Main Engine)
 */
class RetoricaApp {
    constructor() {
        this.inicializarComponentes();
        this.vincularEventos();
        this.verificarSesionUsuario();
        this.actualizarHistorialUI();
    }

    inicializarComponentes() {
        // Elementos UI
        this.btnConfig = document.getElementById('btn-config');
        this.btnCerrarConfig = document.getElementById('btn-cerrar-config');
        this.panelConfig = document.getElementById('panel-configuracion');
        this.btnTema = document.getElementById('btn-cambiar-tema');
        
        this.editor = document.getElementById('txt-editor');
        this.inputTitulo = document.getElementById('input-titulo');
        this.txtContador = document.getElementById('txt-contador-caracteres');
        
        // Autenticación elementos
        this.authAnonimo = document.getElementById('auth-anonimo');
        this.authActivo = document.getElementById('auth-activo');
        this.regUsername = document.getElementById('reg-username');
        this.btnRegistrar = document.getElementById('btn-registrar');
        this.btnLogout = document.getElementById('btn-logout');
        this.lblUsuarioActual = document.getElementById('lbl-usuario-actual');
        this.listaHistorial = document.getElementById('lista-notas-historial');

        // Botones de acción
        this.btnGuardar = document.getElementById('btn-guardar');
        this.btnNuevaNota = document.getElementById('btn-nueva-nota');
    }

    vincularEventos() {
        // Control de Paneles laterales
        this.btnConfig.addEventListener('click', () => this.panelConfig.classList.add('active'));
        this.btnCerrarConfig.addEventListener('click', () => this.panelConfig.classList.remove('active'));

        // Gestión de Temas
        this.btnTema.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('retorica_pref_theme', isLight ? 'light' : 'dark');
        });

        // Recuperar tema al iniciar
        if (localStorage.getItem('retorica_pref_theme') === 'light') {
            document.body.classList.add('light-theme');
        }

        // Contador de caracteres dinámico
        this.editor.addEventListener('input', () => {
            this.txtContador.innerText = `Caracteres: ${this.editor.value.length}`;
        });

        // Registro de usuario
        this.btnRegistrar.addEventListener('click', () => {
            const user = this.regUsername.value;
            if (user.trim()) {
                window.authSystem.registrarUsuario(user);
                this.verificarSesionUsuario();
                this.regUsername.value = "";
            }
        });

        // Cierre de sesión
        this.btnLogout.addEventListener('click', () => {
            window.authSystem.cerrarSesion();
            this.verificarSesionUsuario();
        });

        // Guardado estructurado de la nota
        this.btnGuardar.addEventListener('click', () => {
            const usuario = window.authSystem.getUsuarioActivo();
            window.storageSystem.guardarNota(
                this.inputTitulo.value,
                this.editor.value,
                usuario
            );
            this.actualizarHistorialUI();
            alert("¡Nota guardada con éxito en el almacenamiento local!");
        });

        // Limpieza para nueva nota
        this.btnNuevaNota.addEventListener('click', () => {
            this.inputTitulo.value = "Nota Nueva en RAM";
            this.editor.value = "";
            this.txtContador.innerText = "Caracteres: 0";
        });
    }

    verificarSesionUsuario() {
        const usuarioActivo = window.authSystem.getUsuarioActivo();
        if (usuarioActivo) {
            this.authAnonimo.style.display = 'none';
            this.authActivo.style.display = 'block';
            this.lblUsuarioActual.innerText = usuarioActivo;
        } else {
            this.authAnonimo.style.display = 'block';
            this.authActivo.style.display = 'none';
            this.lblUsuarioActual.innerText = "";
        }
        this.actualizarHistorialUI();
    }

    actualizarHistorialUI() {
        const usuario = window.authSystem.getUsuarioActivo();
        const notasUser = window.storageSystem.getNotasPorUsuario(usuario);

        if (notasUser.length === 0) {
            this.listaHistorial.innerHTML = `<p style="font-style: italic; padding: 5px;">No hay registros para este usuario.</p>`;
            return;
        }

        this.listaHistorial.innerHTML = notasUser.map(nota => `
            <div style="background: rgba(255,255,255,0.05); padding: 8px; margin-bottom:6px; border-left: 2px solid var(--neon-verde); border-radius:4px;">
                <div style="font-weight:bold; color: var(--texto-principal);">${nota.titulo}</div>
                <div style="font-size:11px; color: var(--texto-mutado);">${nota.fecha}</div>
            </div>
        `).join('');
    }
}

// Inicialización de la App cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.AppEngine = new RetoricaApp();
});
