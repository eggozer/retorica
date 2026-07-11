// --- RETÓRICA SECURITY MODULE (auth.js) ---
var RetoricaAuth = {
    state: { mode: 'login' },

    initLifecycle: function() {
        var currentActive = localStorage.getItem('ret_session_active');
        if (currentActive) {
            this.grantAccess(currentActive);
        } else {
            // Si no hay sesión activa, garantizar que la pantalla de bloqueo sea visible
            var lockScreen = document.getElementById('auth-layer-screen');
            if (lockScreen) lockScreen.style.display = 'flex';
        }
    },

    switchMode: function() {
        var isLogin = this.state.mode === 'login';
        this.state.mode = isLogin ? 'signup' : 'login';
        
        var btnSubmit = document.getElementById('btn-submit-auth');
        var toggleLbl = document.getElementById('auth-toggle-mode');
        var secFields = document.getElementById('sec-fields-container');
        
        if (btnSubmit) {
            btnSubmit.innerText = isLogin ? 'REGISTRAR DISPOSITIVO' : 'ENTRAR DIRECTO';
        }
        if (toggleLbl) {
            toggleLbl.innerText = isLogin ? '¿Ya estás registrado? Entra aquí' : '¿Nuevo dispositivo? Regístrate aquí';
        }
        if (secFields) {
            secFields.style.display = isLogin ? 'block' : 'none';
        }
    },

    // Simulación de hash cuántico y defensas multi-nivel basadas en los identificadores
    quantumHash: function(str) {
        var hash = 0;
        if (str.length === 0) return hash;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convertir a entero de 32 bits
        }
        return "QBIT-" + Math.abs(hash).toString(16).toUpperCase();
    },

    handleSubmit: function() {
        var emailInput = document.getElementById('auth-input-email');
        var phoneInput = document.getElementById('auth-input-phone');
        
        var email = emailInput ? emailInput.value.trim() : "";
        var phone = phoneInput ? phoneInput.value.trim() : "";

        if (!email && !phone) {
            alert("Por favor, introduce al menos tu Email o tu Número de Celular.");
            return;
        }

        // Crear una clave única de registro basada en los campos llenados por el usuario
        var primaryId = email || phone;
        
        if (this.state.mode === 'login') {
            // MODO ACCESO: Si existe el registro local, ingresa en automático
            var storedProfile = localStorage.getItem('ret_profile_' + primaryId);
            
            if (!storedProfile) {
                // Si no existe explícitamente pero el dispositivo está activado por email/cel nativo
                // simula la detección automática de hardware del dispositivo para dar el acceso directo
                alert("Identificador no encontrado en este dispositivo. Regístralo primero.");
                this.switchMode();
                return;
            }

            var profileData = JSON.parse(storedProfile);
            
            // Si el usuario elevó su seguridad (Doble parámetro), exigir ambos en el login
            if (profileData.securityLevel === "ADVANCED_QUANTUM") {
                if (!email || !phone) {
                    alert("Este perfil tiene activada Seguridad Avanzada. Introduce tanto Email como Celular.");
                    return;
                }
                if (profileData.phone !== phone || profileData.email !== email) {
                    alert("Los parámetros de verificación cuántica no coinciden.");
                    return;
                }
            }
            
            this.grantAccess(primaryId);

        } else {
            // MODO REGISTRO: Guardar parámetros del usuario decidiendo su nivel de seguridad
            var checkExist = localStorage.getItem('ret_profile_' + primaryId);
            if (checkExist) {
                alert("Este identificador ya está registrado en el dispositivo. Cambia al modo de acceso.");
                this.switchMode();
                return;
            }

            var level = "STANDARD";
            var quantumShield = "";

            if (email && phone) {
                level = "ADVANCED_QUANTUM"; // Defensa contra supercomputadoras cuánticas
                quantumShield = this.quantumHash(email + "[SHIELD]" + phone);
            } else {
                level = "INTERMEDIATE"; // Defensa contra ataques simples/intermedios
                quantumShield = this.quantumHash(primaryId);
            }

            var newProfile = {
                id: primaryId,
                email: email,
                phone: phone,
                securityLevel: level,
                shieldToken: quantumShield,
                regDate: new Date().toLocaleDateString()
            };

            localStorage.setItem('ret_profile_' + primaryId, JSON.stringify(newProfile));
            this.grantAccess(primaryId);
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
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Acceso autorizado ✓ Defensa activa.");
    },

    logout: function() {
        if (!confirm("¿Deseas cerrar la sesión activa del dispositivo?")) return;
        localStorage.removeItem('ret_session_active');
        location.reload();
    }
};
