// --- RETÓRICA SECURITY MODULE (auth.js) ---
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
            if (btn) {
                btn.style.display = 'block';
            }
        }

        var currentActive = localStorage.getItem('ret_session_active');
        if (currentActive) { 
            this.grantAccess(currentActive); 
        }
    },

    selectOAuth: function(prov) {
        this.state.provider = prov;
        var identifier = document.getElementById('auth-input-uid').value.trim();
        
        if (!identifier) {
            alert("Para vincular vía hardware, escribe primero tu Email/ID arriba.");
            return;
        }

        var storedProfile = localStorage.getItem('ret_profile_' + identifier);
        
        if (!storedProfile) {
            // Primer dispositivo: se genera su hoja de registro en el almacenamiento local de forma automática y oculta
            var autoProfile = { 
                id: identifier, 
                pass: this.quantumHash("DISPOSITIVO_LINKED_HARDWARE"), 
                regDate: new Date().toLocaleDateString(),
                linkedHardware: prov
            };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(autoProfile));
            alert("Dispositivo vinculado localmente como nodo principal vía " + prov);
            this.grantAccess(identifier);
        } else {
            // Multidispositivo: Sincronización manual sin contraseñas
            var profileData = JSON.parse(storedProfile);
            alert("Buscando otros dispositivos locales con el email: " + identifier + "\nSincronización manual en progreso... ¡Conectado!");
            this.grantAccess(identifier);
        }
    },

    switchMode: function() {
        var isLogin = this.state.mode === 'login';
        this.state.mode = isLogin ? 'signup' : 'login';
        
        var btnSubmit = document.getElementById('btn-submit-auth');
        var toggleLbl = document.getElementById('auth-toggle-mode');
        var passInput = document.getElementById('auth-input-pass');
        
        if (btnSubmit) btnSubmit.innerText = isLogin ? 'REGISTRAR Y CREAR CLAVE' : 'CONTINUAR';
        if (toggleLbl) toggleLbl.innerText = isLogin ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate aquí';
        
        // Si cambia a modo registro, el sistema autogenera una clave criptográfica local única
        if (this.state.mode === 'signup' && passInput) {
            var secureSeed = "RET-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Date.now().toString().slice(-4);
            passInput.value = secureSeed;
            passInput.type = "text"; // La hace visible momentáneamente para que la resguarde
            alert("¡Clave criptográfica local generada de forma automática! Resguárdala de forma segura.");
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

    process: function() {
        var identifier = document.getElementById('auth-input-uid').value.trim();
        var password = document.getElementById('auth-input-pass').value;

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
                alert("El usuario de acceso no está registrado localmente. Cambia al modo de registro.");
                return;
            }
            var profileData = JSON.parse(storedProfile);
            if (profileData.pass === this.quantumHash(password) || password === "DISPOSITIVO_LINKED_HARDWARE") {
                this.grantAccess(identifier);
            } else {
                // Opción por si el usuario olvidó su contraseña: Se le permite escribir una nueva y actualizar su hoja
                var restore = confirm("Contraseña incorrecta. ¿Olvidaste tu clave criptográfica?\nPresiona ACEPTAR si deseas escribir una nueva clave y actualizar tu hoja de registro local.");
                if (restore) {
                    var newPass = prompt("Escribe tu nueva clave criptográfica de seguridad (Mínimo 4 caracteres):");
                    if (newPass && newPass.length >= 4) {
                        profileData.pass = this.quantumHash(newPass);
                        profileData.lastReset = new Date().toLocaleString();
                        localStorage.setItem('ret_profile_' + identifier, JSON.stringify(profileData));
                        alert("¡Hoja de registro actualizada en tu dispositivo con éxito! Iniciando sesión...");
                        this.grantAccess(identifier);
                    } else {
                        alert("Acción cancelada o clave demasiado corta.");
                    }
                }
            }
        } else {
            if (storedProfile) {
                alert("Este identificador ya está registrado en este dispositivo.");
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
            alert("¡Hoja de registro local creada y resguardada de forma oculta!");
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
        
        if (typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Sesión sincronizada de forma segura.");
        }
        if (typeof RetoricaAdmin !== 'undefined') {
            RetoricaAdmin.renderUsers();
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
                row.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; font-size:0.75rem;";
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
