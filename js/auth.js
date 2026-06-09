// --- RETÓRICA SECURITY MODULE (auth.js) ---
var RetoricaAuth = {
    state: {
        mode: 'login', // 'login' o 'signup'
        provider: null
    },

    selectOAuth: function(prov) {
        this.state.provider = prov;
        
        var autoUser = prov + "_DigitalUser";
        
        if (!localStorage.getItem('ret_profile_' + autoUser)) {
            var autoProfile = { id: autoUser, pass: "DISPOSITIVO_LINKED", regDate: new Date().toLocaleDateString() };
            localStorage.setItem('ret_profile_' + autoUser, JSON.stringify(autoProfile));
        }
        
        this.grantAccess(autoUser);
    },

    switchMode: function() {
        var isLogin = this.state.mode === 'login';
        this.state.mode = isLogin ? 'signup' : 'login';
        document.getElementById('btn-submit-auth').innerText = isLogin ? 'REGISTRAR Y CREAR CLAVE' : 'CONTINUAR';
        document.getElementById('auth-toggle-mode').innerText = isLogin ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate aquí';
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
            alert("Acceso Restringido: Tu cuenta ha sido bloqueada permanentemente por el Administrador Supremo.");
            return;
        }

        if (this.state.mode === 'signup') {
            if (!password) {
                password = String(Math.floor(1000 + Math.random() * 9000));
                alert("¡SISTEMA BLINDADO!\n\nNo ingresaste contraseña. Se ha autogenerado una clave de resguardo física para este dispositivo:\n\n🔑 " + password + "\n\nAnótala para futuros accesos.");
            } else if (password.length < 4) {
                alert("La contraseña debe tener al menos 4 caracteres.");
                return;
            }
            
            var userProfile = { id: identifier, pass: password, regDate: new Date().toLocaleDateString() };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(userProfile));
            this.state.mode = 'login';
            this.grantAccess(identifier);
        } else {
            // Acceso directo si el dispositivo ya está validado o no requiere clave
            if (!password) {
                this.grantAccess(identifier);
                return;
            }

            var storedUser = localStorage.getItem('ret_profile_' + identifier);
            if (!storedUser) {
                alert("El usuario no existe de forma local. Cambia a la pestaña de registro abajo.");
                return;
            }

            var parsedUser = JSON.parse(storedUser);
            if (parsedUser.pass !== password) {
                alert("Contraseña incorrecta de resguardo.");
                return;
            }

            this.grantAccess(identifier);
        }
    },

    grantAccess: function(uid) {
        window.retoricaActiveUser = uid;
        var gate = document.getElementById('screen-auth');
        if (gate) {
            gate.style.display = 'none';
        }
        var nameDisplay = document.getElementById('display-user-name');
        if (nameDisplay) {
            nameDisplay.innerText = uid;
        }
        if (typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.refreshLibrary();
        }
    },

    sync: function() {
        if (!window.retoricaActiveUser) return;
        alert("Sincronizando nubes de datos para: " + window.retoricaActiveUser);
    }
};

var RetoricaAdmin = {
    trigger: function() {
        var masterKey = prompt("Introduce la Clave Maestra del Administrador Supremo para desatar el Modo Dios:");
        if (masterKey === "0000") {
            document.getElementById('god-mode-panel').style.display = 'block';
            this.renderUsers();
        } else {
            alert("Acceso denegado: No posees credenciales de deidad.");
        }
    },

    close: function() {
        document.getElementById('god-mode-panel').style.display = 'none';
    },

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
                row.innerHTML = "<span style='font-weight:bold; color:" + (isBanned ? "#ff3b30" : "#fff") + "'>" + uid + " " + (isBanned ? "[BANEADO]" : "[ACTIVO]") + "</span>";
                
                var btn = document.createElement('button');
                btn.className = "btn-3d";
                btn.style.background = isBanned ? "#2ecc71" : "var(--danger)";
                btn.innerText = isBanned ? "DESBANEAR" : "BANEAR";
                
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
        }
        localStorage.setItem('ret_ban_list', JSON.stringify(banList));
        this.renderUsers();
    }
};
