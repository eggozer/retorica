// --- RETÓRICA AUTHENTICATION & DEFENSE ENGINE (auth.js - V2026) ---
var RetoricaAuth = {
    state: { mode: 'email' },

    initLifecycle: function() {
        var currentActive = localStorage.getItem('ret_session_active');
        if (currentActive) {
            this.grantAccess(currentActive);
        }
    },

    getTxt: function(key, fallback) {
        if (typeof RetoricaI18n !== 'undefined' && RetoricaI18n.db && RetoricaI18n.db[RetoricaI18n.currentLang]) {
            return RetoricaI18n.db[RetoricaI18n.currentLang][key] || fallback;
        }
        return fallback;
    },

    switchAccessMode: function(mode) {
        this.state.mode = mode;
        var containerEmail = document.getElementById('group-input-email');
        var containerPhone = document.getElementById('group-input-phone');
        
        var btnGoogle = document.getElementById('btn-mode-google');
        var btnPhone = document.getElementById('btn-mode-phone');
        var btnDual = document.getElementById('btn-mode-dual');

        if (btnGoogle) btnGoogle.style.opacity = (mode === 'email') ? '1' : '0.5';
        if (btnPhone) btnPhone.style.opacity = (mode === 'phone') ? '1' : '0.5';
        if (btnDual) btnDual.style.opacity = (mode === 'dual') ? '1' : '0.5';

        if (mode === 'email') {
            if (containerEmail) containerEmail.style.display = 'block';
            if (containerPhone) containerPhone.style.display = 'none';
        } else if (mode === 'phone') {
            if (containerEmail) containerEmail.style.display = 'none';
            if (containerPhone) containerPhone.style.display = 'block';
        } else if (mode === 'dual') {
            if (containerEmail) containerEmail.style.display = 'block';
            if (containerPhone) containerPhone.style.display = 'block';
        }
    },

    process: function() {
        var emailVal = document.getElementById('auth-input-email') ? document.getElementById('auth-input-email').value.trim() : '';
        var phoneVal = document.getElementById('auth-input-phone') ? document.getElementById('auth-input-phone').value.trim() : '';
        
        var finalUid = '';

        if (this.state.mode === 'email') {
            if (!emailVal || emailVal.indexOf('@') === -1) {
                alert(this.getTxt('errInvalidEmail', "Ingresa un correo electrónico válido."));
                return;
            }
            finalUid = emailVal;
        } else if (this.state.mode === 'phone') {
            // Limpieza y validación de dígitos telefónicos universales
            var cleanPhone = phoneVal.replace(/\D/g, '');
            if (cleanPhone.length < 7) {
                alert(this.getTxt('errInvalidPhone', "Ingresa un número celular válido."));
                return;
            }
            finalUid = "+" + cleanPhone;
        } else if (this.state.mode === 'dual') {
            var cleanPhoneDual = phoneVal.replace(/\D/g, '');
            if (!emailVal || emailVal.indexOf('@') === -1 || cleanPhoneDual.length < 7) {
                alert(this.getTxt('errInvalidDual', "Ingresa un email válido y un número de celular."));
                return;
            }
            finalUid = emailVal + " | +" + cleanPhoneDual;
        }

        // --- SISTEMA DE DEFENSA Y BAN LIST ---
        var banList = JSON.parse(localStorage.getItem('ret_ban_list') || '[]');
        if (banList.indexOf(finalUid) > -1 || banList.indexOf(emailVal) > -1) {
            alert(this.getTxt('errBanned', "Este acceso se encuentra restringido por seguridad."));
            return;
        }

        // Guardado local de perfil
        var profile = {
            id: finalUid,
            loginType: this.state.mode,
            lastAccess: new Date().toISOString()
        };
        localStorage.setItem('ret_profile_' + finalUid, JSON.stringify(profile));

        this.grantAccess(finalUid);
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
            RetoricaUI.notify("Sesión activada ✓");
        }
    },

    logout: function() {
        localStorage.removeItem('ret_session_active');
        location.reload();
    }
};
