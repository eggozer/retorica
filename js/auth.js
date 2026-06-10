// --- RETÓRICA SECURITY MODULE (auth.js) ---
var RetoricaAuth = {
    state: { mode: 'login', provider: null },

    initLifecycle: function() {
        // Asegurar que los contenedores de redes sociales y la línea divisoria se muestren siempre al iniciar
        var oauthContainer = document.getElementById('oauth-container');
        var authDivider = document.getElementById('auth-divider-line');
        
        if (oauthContainer) oauthContainer.style.display = 'flex';
        if (authDivider) authDivider.style.display = 'flex';

        // Mostrar físicamente todos los botones de proveedores individuales por defecto
        var providers = ['google', 'facebook', 'whatsapp'];
        for (var i = 0; i < providers.length; i++) {
            var btn = document.getElementById('btn-oauth-' + providers[i]);
            if (btn) {
                btn.style.display = 'block';
            }
        }

        // Si ya existe una sesión guardada previamente, dar acceso automático directo
        var currentActive = localStorage.getItem('ret_session_active');
        if (currentActive) { 
            this.grantAccess(currentActive); 
        }
    },

    selectOAuth: function(prov) {
        this.state.provider = prov;
        var autoUser = prov + "_DigitalUser";
        
        // Si el perfil digital no existe en esta instalación, se genera la hoja de registro en el almacenamiento automáticamente
        if (!localStorage.getItem('ret_profile_' + autoUser)) {
            var autoProfile = { 
                id: autoUser, 
                pass: this.quantumHash("DISPOSITIVO_LINKED"), 
                regDate: new Date().toLocaleDateString() 
            };
            localStorage.setItem('ret_profile_' + autoUser, JSON.stringify(autoProfile));
        }
        
        // Conceder acceso inmediato al Lienzo principal
        this.grantAccess(autoUser);
    },

    switchMode: function() {
        var isLogin = this.state.mode === 'login';
        this.state.mode = isLogin ? 'signup' : 'login';
        
        var btnSubmit = document.getElementById('btn-submit-auth');
        var toggleLbl = document.getElementById('auth-toggle-mode');
        
        if (btnSubmit) btnSubmit.innerText = isLogin ? 'REGISTRAR Y CREAR CLAVE' : 'CONTINUAR';
        if (toggleLbl) toggleLbl.innerText = isLogin ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate aquí';
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
        var identifier = document.getElementById('auth-id').value.trim();
        var password = document.getElementById('auth-pass').value;

        if (!identifier) {
            alert("Ingresa un correo o número telefónico para continuar.");
            return;
        }

        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        if (banList.indexOf(identifier) > -1) {
            alert("Este acceso se encuentra restringido por la consola de administración.");
            return;
        }

        var storedProfile = localStorage.getItem('ret_profile_' + identifier);

        if (this.state.mode === 'login') {
            if (!storedProfile) {
                alert("El usuario de acceso no está registrado. Cambia al modo de registro.");
                return;
            }
            var profileData = JSON.parse(storedProfile);
            if (profileData.pass === this.quantumHash(password)) {
                this.grantAccess(identifier);
            } else {
                alert("Contraseña de seguridad incorrecta.");
            }
        } else {
            // Flujo de Registro manual si deciden rellenar la hoja de registro directamente
            if (storedProfile) {
                alert("Este identificador ya está registrado.");
                return;
            }
            if (password.length < 4) {
                alert("La contraseña de la hoja de registro debe tener al menos 4 caracteres.");
                return;
            }
            var newProfile = { 
                id: identifier, 
                pass: this.quantumHash(password), 
                regDate: new Date().toLocaleDateString() 
            };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(newProfile));
            alert("¡Registro completado con éxito! Iniciando sesión...");
            this.grantAccess(identifier);
        }
    },

    grantAccess: function(uid) {
        window.retoricaActiveUser = uid;
        localStorage.setItem('ret_session_active', uid);
        
        var lockScreen = document.getElementById('screen-lock');
        if (lockScreen) lockScreen.style.display = 'none';
        
        var displayUser = document.getElementById('display-user-name');
        if (displayUser) displayUser.innerText = uid;
        
        if (typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Sesión sincronizada de forma segura.");
        }
    },

    logout: function() {
        localStorage.removeItem('ret_session_active');
        location.reload();
    }
};

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
                row.innerHTML = "<span style='font-weight:bold; color:" + (isBanned ? "#ff3b30" : "#fff") + "'>" + uid + " " + (isBanned ? "[B]" : "[A]") + "</span>";
                
                var btn = document.createElement('button'); 
                btn.className = "btn-3d btn-rect";
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
        } else { 
            banList.push(uid); 
            if (window.retoricaActiveUser === uid) { 
                RetoricaAuth.logout(); 
            }
        }
        localStorage.setItem('ret_ban_list', JSON.stringify(banList));
        this.renderUsers();
    }
};
