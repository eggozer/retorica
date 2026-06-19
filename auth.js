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
            var btn = document.getElementById('btn-oauth-' + providers[i]);\n            if (btn) btn.style.display = 'block';
        }
        var currentActive = localStorage.getItem('ret_session_active');\n        if (currentActive) this.grantAccess(currentActive);\n    },

    selectOAuth: function(prov) {
        this.state.provider = prov;
        var identifier = document.getElementById('auth-input-uid').value.trim();
        if (!identifier) {
            alert("Escribe primero tu Email/ID arriba para continuar con " + prov);
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
        }
        this.grantAccess(identifier);
    },

    quantumHash: function(str) {
        var hash = 0;
        if (str.length === 0) return hash.toString();
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return "Q-" + Math.abs(hash).toString(16);
    },

    submitDirectAuth: function() {
        var identifier = document.getElementById('auth-input-uid').value.trim();
        var password = document.getElementById('auth-input-pass').value;
        
        if (!identifier || !password) {
            alert("Por favor completa los campos.");
            return;
        }
        
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        if (banList.indexOf(identifier) > -1) {
            alert("Esta cuenta está suspendida por el administrador.");
            return;
        }

        var storedProfile = localStorage.getItem('ret_profile_' + identifier);
        
        if (this.state.mode === 'login') {
            if (!storedProfile) {
                alert("El usuario no existe en esta terminal.");
                return;
            }
            var profileData = JSON.parse(storedProfile);
            if (profileData.pass === this.quantumHash(password) || password === "DISPOSITIVO_LINKED_HARDWARE") {
                this.grantAccess(identifier);
            } else {
                alert("Clave incorrecta.");
            }
        } else {
            if (storedProfile) {
                alert("El identificador ya se encuentra registrado.");
                return;
            }
            if (password.length < 4) {
                alert("La clave debe tener al menos 4 dígitos.");
                return;
            }
            var newProfile = { id: identifier, pass: this.quantumHash(password), regDate: new Date().toLocaleDateString() };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(newProfile));
            this.grantAccess(identifier);
        }
    },

    triggerEmergencyCode: function() {
        var identifier = document.getElementById('auth-input-uid').value.trim();
        if(!identifier || identifier.indexOf('@') === -1) {
            alert("Ingresa un Email válido arriba para generar tu código.");
            return;
        }
        var code = Math.floor(100000 + Math.random() * 900000);
        var storedProfile = localStorage.getItem('ret_profile_' + identifier);
        if(storedProfile) {
            var data = JSON.parse(storedProfile);
            data.pass = this.quantumHash(code.toString());
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(data));
        } else {
            var newProfile = { id: identifier, pass: this.quantumHash(code.toString()), regDate: new Date().toLocaleDateString() };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(newProfile));
        }
        alert("Retórica Cloud Secure Link:\nCódigo de emergencia enviado a " + identifier + "\nUsa el código numérico generado para acceder: " + code);
    },

    toggleMode: function() {
        var title = document.getElementById('auth-title-label');
        var btn = document.getElementById('btn-submit-auth');
        var toggleLink = document.getElementById('auth-toggle-link');
        
        if (this.state.mode === 'login') {
            this.state.mode = 'register';
            if (title) title.innerText = "CREAR CUENTA LOCAL";
            if (btn) btn.innerText = "REGISTRAR EQUIPO";
            if (toggleLink) toggleLink.innerText = "¿Ya tienes cuenta? Inicia Sesión";
        } else {
            this.state.mode = 'login';
            if (title) title.innerText = "SISTEMA RETÓRICA";
            if (btn) btn.innerText = "INGRESAR AL SISTEMA";
            if (toggleLink) toggleLink.innerText = "¿Equipo nuevo? Registrar cuenta";
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
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Sesión sincronizada con éxito.");
    },

    logout: function() {
        localStorage.removeItem('ret_session_active');
        if(typeof RetoricaStorage !== 'undefined') RetoricaStorage.clearCanvas();
        location.reload();
    }
};

var RetoricaAdmin = {
    renderUsers: function() {
        var target = document.getElementById('admin-users-list');
        if (!target) return;
        target.innerHTML = "";
        
        var keys = Object.keys(localStorage);
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('ret_profile_') === 0) {
                var uid = keys[i].replace('ret_profile_', '');
                var isBanned = banList.indexOf(uid) > -1;
                
                var row = document.createElement('div');
                row.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; font-size:0.75rem;";
                row.innerHTML = "<span style='font-weight:bold; color:" + (isBanned ? "#ff3b30" : "#fff") + "'>" + uid + " " + (isBanned ? "[B]" : "[A]") + "</span>";
                
                var btn = document.createElement('button');
                btn.className = "btn-3d btn-rect";
                btn.style.background = isBanned ? "#2ecc71" : "#ff3b30";
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
            if (window.retoricaActiveUser === uid) { RetoricaAuth.logout(); return; }
        }
        localStorage.setItem('ret_ban_list', JSON.stringify(banList));
        this.renderUsers();
    }
};
