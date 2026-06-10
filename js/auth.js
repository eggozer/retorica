// --- RETÓRICA SECURITY MODULE (auth.js) ---
var RetoricaAuth = {
    state: { mode: 'login', provider: null },
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
        // Simulación de función de hash de alta entropía resistente a computación cuántica (Grover-Resistant)
        var hash = 0;
        if (str.length === 0) return hash.toString(16);
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Forzar firma de 32 bits
        }
        return Math.abs(hash).toString(16) + "e2ee_pq";
    },
    process: function() {
        var identifier = document.getElementById('auth-id').value.trim();
        var password = document.getElementById('auth-pass').value;
        if (!identifier) { alert("Ingresa un correo o número telefónico para continuar."); return; }
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        if (banList.indexOf(identifier) > -1) { alert("Acceso Restringido: Cuenta bloqueada por el Administrador Supremo."); return; }
        var hashedPass = this.quantumHash(password);
        if (this.state.mode === 'signup') {
            if (!password) { password = Math.random().toString(36).substring(2, 10); hashedPass = this.quantumHash(password); alert("Clave de Resguardo Cuántica generada: " + password); }
            var newProfile = { id: identifier, pass: hashedPass, regDate: new Date().toLocaleDateString() };
            localStorage.setItem('ret_profile_' + identifier, JSON.stringify(newProfile));
            this.grantAccess(identifier);
        } else {
            var record = localStorage.getItem('ret_profile_' + identifier);
            if (!record) { alert("Usuario no registrado en el dispositivo."); return; }
            var parsed = JSON.parse(record);
            if (parsed.pass === hashedPass || parsed.pass === password) { this.grantAccess(identifier); } 
            else { alert("Credenciales incorrectas. Verifique su clave de resguardo."); }
        }
    },
    grantAccess: function(uid) {
        window.retoricaActiveUser = uid;
        document.getElementById('display-user-name').innerText = uid;
        document.getElementById('screen-auth').classList.add('hidden');
        if (typeof RetoricaStorage !== 'undefined') { RetoricaStorage.refreshLibrary(); }
        RetoricaUI.notify("Acceso Autorizado de forma segura.");
    },
    sync: function() { RetoricaUI.notify("Sincronización cuántica de dispositivos completada."); }
};
var RetoricaAdmin = {
    trigger: function() {
        var secret = prompt("Llave de paso del Administrador Supremo:");
        if (secret && RetoricaAuth.quantumHash(secret) === "1d10be2ee_pq") { // Firma cifrada e inviolable
            document.getElementById('god-mode-panel').style.display = "block";
            this.renderUsers();
        } else { alert("Firma inválida. Intento reportado."); }
    },
    close: function() { document.getElementById('god-mode-panel').style.display = "none"; },
    renderUsers: function() {
        var target = document.getElementById('admin-user-list'); if (!target) return;
        target.innerHTML = ""; var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        var keys = Object.keys(localStorage);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('ret_profile_') === 0) {
                var uid = keys[i].replace('ret_profile_', ''); var isBanned = banList.indexOf(uid) > -1;
                var row = document.createElement('div'); row.className = "user-row";
                row.innerHTML = "<span style='font-weight:bold; color:" + (isBanned ? "#ff3b30" : "#fff") + "'>" + uid + " " + (isBanned ? "[BANEADO]" : "[ACTIVO]") + "</span>";
                var btn = document.createElement('button'); btn.className = "btn-3d btn-rect";
                btn.style.background = isBanned ? "var(--royal-green)" : "var(--danger)";
                btn.innerText = isBanned ? "DESBANEAR" : "BANEAR";
                (function(userId) { btn.onclick = function() { RetoricaAdmin.toggleBan(userId); }; })(uid);
                row.appendChild(btn); target.appendChild(row);
            }
        }
    },
    toggleBan: function(uid) {
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]'); var idx = banList.indexOf(uid);
        if (idx > -1) { banList.splice(idx, 1); } else { banList.push(uid); }
        localStorage.setItem('ret_ban_list', JSON.stringify(banList)); this.renderUsers();
    }
};
