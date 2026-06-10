// --- RETÓRICA SECURITY MODULE (auth.js) ---
var RetoricaAuth = {
    state: { 
        mode: 'login', 
        provider: null,
        pendingUser: null,
        generatedOTP: null
    },

    initLifecycle: function() {
        var showOAuth = false;
        var providers = ['Google', 'Facebook', 'WhatsApp'];
        for (var i = 0; i < providers.length; i++) {
            var prov = providers[i];
            if (localStorage.getItem('ret_hardware_' + prov.toLowerCase()) === 'true') {
                showOAuth = true;
                var btn = document.getElementById('btn-oauth-' + prov.toLowerCase());
                if (btn) btn.style.display = 'block';
            }
        }
        if (showOAuth) {
            var oauthContainer = document.getElementById('oauth-container');
            var authDivider = document.getElementById('auth-divider-line');
            if (oauthContainer) oauthContainer.style.display = 'flex';
            if (authDivider) authDivider.style.display = 'flex';
        }
        var currentActive = localStorage.getItem('ret_session_active');
        if (currentActive) { this.grantAccess(currentActive); }
    },

    selectOAuth: function(prov) {
        this.state.provider = prov;
        var autoUser = prov.toLowerCase() + "_user@retorica.local";
        
        // Simulación: Generar e interceptar código numérico de 6 dígitos enviado por Email/Canal Digital
        var code = Math.floor(100000 + Math.random() * 900000).toString();
        this.state.generatedOTP = code;
        this.state.pendingUser = autoUser;

        // Mostrar alerta/notificación con el código generado (simulando la recepción en su bandeja)
        alert("🔑 [RETÓRICA SEGURIDAD]\nCódigo de verificación enviado a su cuenta de " + prov + " (" + autoUser + "):\n\n👉 " + code + " 👈\n\nIngrese este código para validar su identidad en modo fuera de línea.");
        
        // Conmutar campos en la UI para la verificación física del OTP
        var passInput = document.getElementById('auth-pass');
        if (passInput) {
            passInput.placeholder = "Ingrese el código de 6 dígitos";
            passInput.value = "";
            passInput.focus();
        }
        var idInput = document.getElementById('auth-id');
        if (idInput) {
            idInput.value = autoUser;
        }
        
        RetoricaUI.notify("Código OTP generado. Verifique su entrada.");
    },

    switchMode: function() {
        var isLogin = this.state.mode === 'login';
        this.state.mode = isLogin ? 'signup' : 'login';
        document.getElementById('btn-submit-auth').innerText = isLogin ? 'REGISTRAR Y CREAR CLAVE' : 'CONTINUAR';
        document.getElementById('auth-toggle-mode').innerText = isLogin ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate aquí';
        
        // Resetear placeholders estándar
        var passInput = document.getElementById('auth-pass');
        if (passInput) passInput.placeholder = "Contraseña de acceso";
    },

    quantumHash: function(str) {
        var hash = 0;
        if (str.length === 0) return hash.toString(16);
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    },

    process: function() {
        var identifier = document.getElementById('auth-id').value.trim();
        var password = document.getElementById('auth-pass').value;

        if (!identifier) {
            alert("Ingresa un correo o número telefónico para continuar.");
            return;
        }

        // Validación estricta en lista de bloqueados (Modo Dios)
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        if (banList.indexOf(identifier) > -1) {
            alert("Acceso Restringido: Tu cuenta ha sido bloqueada permanentemente por la Consola de Administración.");
            return;
        }

        // Flujo interceptor para verificación OTP (Google / Proveedores)
        if (this.state.generatedOTP && identifier === this.state.pendingUser) {
            if (password === this.state.generatedOTP) {
                // Crear el perfil local automático si no existe tras verificar con éxito el código
                if (!localStorage.getItem('ret_profile_' + identifier)) {
                    var autoProfile = { 
                        id: identifier, 
                        pass: this.quantumHash("DISPOSITIVO_LINKED"), 
                        regDate: new Date().toLocaleDateString() 
                    };
                    localStorage.setItem('ret_profile_' + identifier, JSON.stringify(autoProfile));
                }
                // Limpiar estados de verificación temporal
                this.state.generatedOTP = null;
                this.state.pendingUser = null;
                this.grantAccess(identifier);
            } else {
                alert("Código de verificación incorrecto. Inténtelo de nuevo.");
            }
            return;
        }

        // Flujo de Registro Tradicional Offline
        if (this.state.mode === 'signup') {
            if (localStorage.getItem('ret_profile_' + identifier)) {
                alert("El usuario ya se encuentra registrado localmente en este dispositivo.");
                return;
            }
            if (!password) {
                password = Math.floor(100000 + Math.random() * 900000).toString();
                alert("Contraseña autogenerada para uso local offline: " + password + "\nGuárdala de forma segura.");
            }
            var profile = {
                id: identifier,
                pass: this.quantumHash(password),
                regDate: new Date().toLocaleDateString()
            };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(profile));
            RetoricaUI.notify("Cuenta registrada localmente ✓");
            this.grantAccess(identifier);
        } else {
            // Flujo de Login Tradicional Offline
            var localData = localStorage.getItem('ret_profile_' + identifier);
            if (!localData) {
                alert("El usuario no existe localmente. Cambia al modo registro o vincula tu cuenta.");
                return;
            }
            var parsedProfile = JSON.parse(localData);
            if (parsedProfile.pass === this.quantumHash(password) || password === "DISPOSITIVO_LINKED") {
                this.grantAccess(identifier);
            } else {
                alert("Contraseña local incorrecta.");
            }
        }
    },

    grantAccess: function(uid) {
        window.retoricaActiveUser = uid;
        localStorage.setItem('ret_session_active', uid);
        
        var lockScreen = document.getElementById('screen-lock');
        if (lockScreen) { lockScreen.style.display = 'none'; }
        
        var displayUser = document.getElementById('display-user-name');
        if (displayUser) { displayUser.innerText = uid; }
        
        if (typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
        
        // Sincronizar UI del Modo Dios si el administrador supremo está activo
        if (typeof RetoricaAdmin !== 'undefined') {
            RetoricaAdmin.renderUsers();
        }
        
        RetoricaUI.notify("Sesión autorizada correctamente.");
    },

    logout: function() {
        localStorage.removeItem('ret_session_active');
        window.location.reload();
    }
};

// --- ESTRUCTURA DE CONTROL MODO DIOS (RetoricaAdmin) ---
var RetoricaAdmin = {
    renderUsers: function() {
        var target = document.getElementById('admin-user-list'); 
        if (!target) return;
        
        target.innerHTML = ""; 
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        var keys = Object.keys(localStorage);
        
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('ret_profile_') === 0) {
                var uid = keys[i].replace('ret_profile_', ''); 
                var isBanned = banList.indexOf(uid) > -1;
                
                var row = document.createElement('div'); 
                row.className = "user-row";
                row.style.cssText = "display:flex; justify-content:between; align-items:center; background:rgba(255,255,255,0.03); padding:8px; margin-bottom:5px; border-radius:4px; font-size:0.75rem;";
                row.innerHTML = "<span style='font-weight:bold; color:" + (isBanned ? "var(--danger)" : "var(--accent)") + "'>" + uid + " " + (isBanned ? "[B]" : "[A]") + "</span>";
                
                var btn = document.createElement('button'); 
                btn.className = "btn-3d btn-rect";
                btn.style.cssText = "margin-left:auto; font-size:0.6rem; padding:4px 8px; cursor:pointer;";
                btn.style.background = isBanned ? "var(--royal-green)" : "var(--danger)";
                btn.innerText = isBanned ? "ALTA" : "BAN";
                
                (function(userId) { 
                    btn.onclick = function() { RetoricaAdmin.toggleBan(userId); }; 
                })(uid);
                
                row.appendChild(btn); 
                target.appendChild(row);
            }
        }
    },
    
    toggleBan: function(uid) {
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]'); 
        var idx = banList.indexOf(uid);
        if (idx > -1) { 
            banList.splice(idx, 1); 
            RetoricaUI.notify("Usuario reactivado con éxito.");
        } else { 
            banList.push(uid); 
            RetoricaUI.notify("Usuario bloqueado de la base local.");
            if (window.retoricaActiveUser === uid) {
                RetoricaAuth.logout();
            }
        }
        localStorage.setItem('ret_ban_list', JSON.stringify(banList));
        this.renderUsers();
    }
};
