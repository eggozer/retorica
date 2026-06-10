// --- RETÓRICA SECURITY MODULE (auth.js) ---
var RetoricaAuth = {
    state: { mode: 'login', provider: null },
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
        var autoUser = prov + "_DigitalUser";
        if (!localStorage.getItem('ret_profile_' + autoUser)) {
            var autoProfile = { id: autoUser, pass: this.quantumHash("DISPOSITIVO_LINKED"), regDate: new Date().toLocaleDateString() };
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
    quantumHash: function(str) {
        var hash = 0; if (str.length === 0) return hash.toString(16);
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr; hash |= 0;
        }
        return Math.abs(hash).toString(16);
    },
    process: function() {
        var identifier = document.getElementById('auth-id').value.trim();
        var password = document.getElementById('auth-pass').value;
        if (!identifier) { alert("Ingresa un correo o número telefónico para continuar."); return; }
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        if (banList.indexOf(identifier) > -1) { alert("Acceso Restringido: Esta cuenta se encuentra bloqueada."); return; }
        if (this.state.mode === 'signup') {
            if (localStorage.getItem('ret_profile_' + identifier)) { alert("La cuenta ya existe. Intenta iniciar sesión."); return; }
            var finalPass = password ? password : Math.random().toString(36).substring(2, 10).toUpperCase();
            var newProfile = { id: identifier, pass: this.quantumHash(finalPass), regDate: new Date().toLocaleDateString() };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(newProfile));
            alert("Registro Exitoso.\nUsuario: " + identifier + "\nClave de Resguardo: " + finalPass);
            document.getElementById('auth-pass').value = finalPass;
            this.switchMode();
        } else {
            var dataStr = localStorage.getItem('ret_profile_' + identifier);
            if (!dataStr) { alert("Usuario no registrado en la base local."); return; }
            var profile = JSON.parse(dataStr);
            if (profile.pass !== this.quantumHash(password)) { alert("Contraseña incorrecta."); return; }
            this.grantAccess(identifier);
        }
    },
    grantAccess: function(uid) {
        window.retoricaActiveUser = uid;
        localStorage.setItem('ret_session_active', uid);
        var authScreen = document.getElementById('screen-auth');
        if (authScreen) authScreen.style.display = 'none';
        var userDisplay = document.getElementById('display-user-name');
        if (userDisplay) userDisplay.innerText = uid;
        if (uid === 'admin' || uid === 'root') {
            var adminPanel = document.getElementById('admin-panel'); if (adminPanel) adminPanel.style.display = 'block';
            RetoricaAdmin.refreshUsers();
        }
        if (typeof RetoricaStorage !== 'undefined') { RetoricaStorage.refreshLibrary(); }
        RetoricaUI.notify("Ingreso Autorizado.");
    },
    logout: function() {
        window.retoricaActiveUser = null;
        localStorage.removeItem('ret_session_active');
        var titleField = document.getElementById('editor-title');
        var bodyField = document.getElementById('editor-body');
        if (titleField) titleField.value = "";
        if (bodyField) bodyField.value = "";
        if (typeof RetoricaStorage !== 'undefined') { RetoricaStorage.activeDocId = null; }
        RetoricaUI.updateCounters();
        var adminPanel = document.getElementById('admin-panel'); if (adminPanel) adminPanel.style.display = 'none';
        var docsContainer = document.getElementById('docs-list-render'); if (docsContainer) docsContainer.innerHTML = "";
        document.getElementById('auth-id').value = "";
        document.getElementById('auth-pass').value = "";
        var authScreen = document.getElementById('screen-auth');
        if (authScreen) authScreen.style.display = 'flex';
        RetoricaUI.notify("Sesión cerrada y caché purgado.");
    }
};
var RetoricaAdmin = {
    refreshUsers: function() {
        var target = document.getElementById('admin-user-list'); if (!target) return;
        target.innerHTML = ""; var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        var keys = Object.keys(localStorage);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('ret_profile_') === 0) {
                var uid = keys[i].replace('ret_profile_', ''); var isBanned = banList.indexOf(uid) > -1;
                var row = document.createElement('div'); row.className = "user-row";
                row.innerHTML = "<span style='font-weight:bold; color:" + (isBanned ? "#ff3b30" : "#fff") + "'>" + uid + " " + (isBanned ? "[B]" : "[A]") + "</span>";
                var btn = document.createElement('button'); btn.className = "btn-3d btn-rect";
                btn.style.background = isBanned ? "var(--royal-green)" : "var(--danger)";
                btn.innerText = isBanned ? "ALTA" : "BAN";
                (function(userId) { btn.onclick = function() { RetoricaAdmin.toggleBan(userId); }; })(uid);
                row.appendChild(btn); target.appendChild(row);
            }
        }
    },
    toggleBan: function(uid) {
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]'); var idx = banList.indexOf(uid);
        if (idx > -1) { banList.splice(idx, 1); } else { banList.push(uid); }
        localStorage.setItem('ret_ban_list', JSON.stringify(banList)); this.refreshUsers();
        if (window.retoricaActiveUser === uid) { RetoricaAuth.logout(); }
    }
};
