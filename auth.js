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
            
            // --- NUEVO: SISTEMA DE AUTO-RECUPERACIÓN ---
            setTimeout(function() {
                RetoricaStorage.getAllDocs(function(docs) {
                    if (docs.length === 0) {
                        console.log("Base de datos local vacía. Intentando recuperar desde la nube...");
                        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Recuperando archivos...");
                        RetoricaStorage.manualSync();
                    }
                });
            }, 800); // Pequeño retraso para asegurar que la DB está inicializada
            // -------------------------------------------
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
// --- RETÓRICA E2EE CRYPTO ENGINE (Web Crypto API) ---
var RetoricaCrypto = {
    // Genera una clave AES-GCM derivada del UID del usuario
    getKey: async function(rawUid) {
        var enc = new TextEncoder();
        var keyMaterial = await window.crypto.subtle.importKey(
            "raw", 
            enc.encode(rawUid + "_RETORICA_SALT_2026"), 
            { name: "PBKDF2" }, 
            false, 
            ["deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("RETORICA_SECURE_SALT"),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    },

    // Cifra texto plano y devuelve un texto codificado en Base64 con su Vector de Inicialización (IV)
    encryptData: async function(plainText, rawUid) {
        try {
            var key = await this.getKey(rawUid);
            var iv = window.crypto.getRandomValues(new Uint8Array(12));
            var enc = new TextEncoder();
            var encrypted = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                enc.encode(plainText)
            );
            
            var cipherArray = new Uint8Array(encrypted);
            var combined = new Uint8Array(iv.length + cipherArray.length);
            combined.set(iv, 0);
            combined.set(cipherArray, iv.length);
            
            return btoa(String.fromCharCode.apply(null, combined));
        } catch(e) {
            console.error("Error al cifrar:", e);
            return plainText; // Fallback
        }
    },

    // Descifra el texto Base64 usando la clave del usuario
    decryptData: async function(cipherBase64, rawUid) {
        try {
            var key = await this.getKey(rawUid);
            var combined = new Uint8Array(atob(cipherBase64).split("").map(c => c.charCodeAt(0)));
            var iv = combined.slice(0, 12);
            var cipherData = combined.slice(12);
            
            var decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                cipherData
            );
            
            var dec = new TextDecoder();
            return dec.decode(decrypted);
        } catch(e) {
            console.error("Error al descifrar:", e);
            return cipherBase64; // Retorna tal cual si ya estaba descifrado o falla
        }
    }
};
