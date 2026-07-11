// --- RETÓRICA SECURITY MODULE (auth.js) ---
var RetoricaAuth = {
    state: { mode: 'login' },

    initLifecycle: function() {
        var currentActive = localStorage.getItem('ret_session_active');
        if (currentActive) this.grantAccess(currentActive);
    },

    switchMode: function() {
        var isLogin = this.state.mode === 'login';
        this.state.mode = isLogin ? 'signup' : 'login';
        var btnSubmit = document.getElementById('btn-submit-auth');
        var toggleLbl = document.getElementById('auth-toggle-mode');
        var passInput = document.getElementById('auth-input-pass');
        
        if (btnSubmit) btnSubmit.innerText = isLogin ? 'REGISTRAR Y CREAR CLAVE' : 'CONTINUAR';
        if (toggleLbl) toggleLbl.innerText = isLogin ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate aquí';
        
        if (this.state.mode === 'signup' && passInput) {
            var secureSeed = "RET-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString().slice(-3);
            passInput.value = secureSeed;
            passInput.type = "text";
            alert("¡Clave autogenerada!\nPuedes usar tu correo o tu número de celular (WhatsApp) como usuario único en todos tus dispositivos.");
        } else if (passInput) {
            passInput.value = "";
            passInput.type = "password";
        }
    },

    quantumHash: function(str) {
        var hash = 0;
        if (str.length === 0) return hash.toString(16);
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash.toString(16);
    },

    // PUNTO 14: Inicio de Sesión / Sincronización lógica con Celular y/o Correo
    process: function() {
        var identifier = document.getElementById('auth-input-uid').value.trim();
        var password = document.getElementById('auth-input-pass').value;
        
        if (!identifier) {
            alert("Ingresa un Email o tu número de WhatsApp.");
            return;
        }

        var storedProfile = localStorage.getItem('ret_profile_' + identifier);
        
        if (this.state.mode === 'login') {
            if (!storedProfile) {
                alert("Usuario no registrado en este dispositivo. Cambia al modo de registro para enlazar este teléfono/email.");
                return;
            }
            var profileData = JSON.parse(storedProfile);
            if (profileData.pass === this.quantumHash(password)) {
                this.grantAccess(identifier);
            } else {
                alert("Clave criptográfica incorrecta.");
            }
        } else {
            if (storedProfile) {
                alert("Este identificador ya está registrado.");
                return;
            }
            if (password.length < 4) {
                alert("La contraseña debe tener al menos 4 caracteres.");
                return;
            }
            var newProfile = { id: identifier, pass: this.quantumHash(password), regDate: new Date().toLocaleDateString() };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(newProfile));
            this.grantAccess(identifier);
        }
    },

    grantAccess: function(uid) {
        window.retoricaActiveUser = uid;
        localStorage.setItem('ret_session_active', uid);
        var lockScreen = document.getElementById('auth-layer-screen');
        if (lockScreen) lockScreen.style.display = 'none';
        var displayUser = document.getElementById('display-user-name');
        if (displayUser) displayUser.innerText = uid;
        if (typeof RetoricaStorage !== 'undefined') RetoricaStorage.refreshLibrary();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Sesión Local Iniciada.");
    },

    logout: function() {
        if(!confirm("¿Deseas cerrar la sesión activa?")) return;
        localStorage.removeItem('ret_session_active');
        location.reload();
    }
};
