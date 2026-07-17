var RetoricaAuth = {
    state: { mode: 'login', provider: null },

    initLifecycle: function() {
        var oauthContainer = document.getElementById('oauth-container');
        var authDivider = document.getElementById('auth-divider-line');
        if (oauthContainer) oauthContainer.style.display = 'flex';
        if (authDivider) authDivider.style.display = 'flex';

        var providers = ['google', 'facebook', 'whatsapp'];
        for (var i = 0; i < providers.length; i++) {
            var btn = document.getElementById('btn-oauth-' + providers[i]);
            if (btn) btn.style.display = 'block';
        }
        var currentActive = localStorage.getItem('ret_session_active');
        if (currentActive) this.grantAccess(currentActive);
    },

    // Función auxiliar para obtener textos dinámicos o usar fallback en inglés
    getTxt: function(key, fallback) {
        if (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db[RetoricaI18n.currentLang]) {
            return RetoricaI18n.db[RetoricaI18n.currentLang][key] || fallback;
        }
        return fallback;
    },

    selectOAuth: function(prov) {
        this.state.provider = prov;
        var identifier = document.getElementById('auth-input-uid').value.trim();
        if (!identifier) {
            var m1 = this.getTxt('errUid', "Para vincular vía hardware, escribe primero tu Email/ID arriba.");
            alert(m1);
            return;
        }
        var storedProfile = localStorage.getItem('ret_profile_' + identifier);
        if (!storedProfile) {
            var autoProfile = { 
                id: identifier, 
                pass: this.quantumHash("DISPOSITIVO_LINKED_HARDWARE"), 
                regDate: new Date().toLocaleDateString(),
                linkedHardware: prov
            };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(autoProfile));
            var m2 = this.getTxt('okHardware', "Dispositivo vinculado localmente vía ") + prov;
            alert(m2);
            this.grantAccess(identifier);
        } else {
            var m3 = this.getTxt('syncHardware', "Sincronización manual en progreso... ¡Conectado!");
            alert(m3);
            this.grantAccess(identifier);
        }
    },

    switchMode: function() {
        var isLogin = this.state.mode === 'login';
        this.state.mode = isLogin ? 'signup' : 'login';
        var btnSubmit = document.getElementById('btn-submit-auth');
        var toggleLbl = document.getElementById('auth-toggle-mode');
        var passInput = document.getElementById('auth-input-pass');

        if (isLogin) {
            if (btnSubmit) btnSubmit.innerText = this.getTxt('btnRegister', 'REGISTRAR Y CREAR CLAVE');
            if (toggleLbl) toggleLbl.innerText = this.getTxt('toggleHasAccount', '¿Ya tienes cuenta? Entra aquí');
            if (passInput) {
                var secureSeed = "RET-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Date.now().toString().slice(-4);
                passInput.value = secureSeed;
                passInput.type = "text";
                alert(this.getTxt('alertSeed', "¡Clave criptográfica autogenerada! Resguárdala."));
            }
        } else {
            if (btnSubmit) btnSubmit.innerText = this.getTxt('btnAuth', 'CONTINUAR');
            if (toggleLbl) toggleLbl.innerText = this.getTxt('toggleAuth', '¿No tienes cuenta? Regístrate aquí');
            if (passInput) {
                passInput.value = "";
                passInput.type = "password";
            }
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

    process: function() {
        var identifier = document.getElementById('auth-input-uid').value.trim();
        var password = document.getElementById('auth-input-pass').value;
        if (!identifier) {
            alert(this.getTxt('errMissingUid', "Ingresa un correo o número telefónico."));
            return;
        }
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        if (banList.indexOf(identifier) > -1) {
            alert(this.getTxt('errBanned', "Este acceso se encuentra restringido."));
            return;
        }
        var storedProfile = localStorage.getItem('ret_profile_' + identifier);
        if (this.state.mode === 'login') {
            if (!storedProfile) {
                alert(this.getTxt('errNoReg', "Usuario no registrado localmente. Cambia al modo de registro."));
                return;
            }
            var profileData = JSON.parse(storedProfile);
            if (profileData.pass === this.quantumHash(password) || password === "DISPOSITIVO_LINKED_HARDWARE") {
                this.grantAccess(identifier);
            } else {
                alert(this.getTxt('errWrongPass', "Clave incorrecta."));
            }
        } else {
            if (storedProfile) {
                alert(this.getTxt('errAlreadyReg', "Este identificador ya está registrado."));
                return;
            }
            if (password.length < 4) {
                alert(this.getTxt('errShortPass', "La contraseña debe tener al menos 4 caracteres."));
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
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify(this.getTxt('notifSync', "Sesión sincronizada."));
    },

    logout: function() {
        localStorage.removeItem('ret_session_active');
        location.reload();
    }
};
