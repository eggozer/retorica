// --- RETÓRICA AUTHENTICATION & SYNC MANAGEMENT (auth.js) ---
var RetoricaAuth = {
    currentUser: null,
    syncEnabled: false,

    initLifecycle: function() {
        var savedUser = localStorage.getItem('retorica_user_session');
        var savedSync = localStorage.getItem('retorica_sync_active');
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.syncEnabled = (savedSync === 'true');
        }
        
        this.renderAuthUI();
        this.requestPersistentStorage();
    },

    requestPersistentStorage: function() {
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then(function(persistent) {
                if (persistent && typeof RetoricaUI !== 'undefined') {
                    console.log("Almacenamiento persistente activado ✓");
                }
            });
        }
    },

    loginWithEmailOrPhone: function(identifier, pass) {
        if (!identifier || identifier.trim() === '') {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Ingresa un email o teléfono válido");
            return;
        }

        var userObj = {
            id: 'usr_' + Date.now(),
            identifier: identifier.trim(),
            loginTime: new Date().toISOString()
        };

        this.currentUser = userObj;
        this.syncEnabled = true;

        localStorage.setItem('retorica_user_session', JSON.stringify(userObj));
        localStorage.setItem('retorica_sync_active', 'true');

        if (typeof RetoricaUI !== 'undefined') {
            RetoricaUI.notify("Sesión iniciada: Sincronización activa ✓");
        }

        this.renderAuthUI();
        if (typeof RetoricaStorage !== 'undefined') {
            RetoricaStorage.syncWithCloud();
        }
    },

    toggleCloudSync: function() {
        if (!this.currentUser) {
            alert("Debes iniciar sesión con tu email o teléfono para activar la nube.");
            return;
        }

        this.syncEnabled = !this.syncEnabled;
        localStorage.setItem('retorica_sync_active', this.syncEnabled ? 'true' : 'false');

        if (this.syncEnabled) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Nube ACTIVADA ✓ - Datos sincronizados");
            if (typeof RetoricaStorage !== 'undefined') RetoricaStorage.syncWithCloud();
        } else {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Nube CANCELADA - Modos solo local activo");
        }

        this.renderAuthUI();
    },

    logout: function() {
        if (!confirm("¿Cerrar sesión en este dispositivo? Los datos locales se conservarán.")) return;
        
        this.currentUser = null;
        this.syncEnabled = false;
        
        localStorage.removeItem('retorica_user_session');
        localStorage.removeItem('retorica_sync_active');

        this.renderAuthUI();
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Sesión cerrada.");
    },

    renderAuthUI: function() {
        var userContainer = document.getElementById('user-session-bar');
        if (!userContainer) return;

        if (this.currentUser) {
            var syncStatusText = this.syncEnabled ? '<span style="color:#00e676;">[Nube Activa]</span>' : '<span style="color:#ff9100;">[Nube Cancelada - Solo Local]</span>';
            userContainer.innerHTML = 
                '<div style="font-size: 0.75rem; color: var(--text-main); display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.15); border-radius: 8px;">' +
                    '<div><b>Usuario:</b> ' + this.currentUser.identifier + ' ' + syncStatusText + '</div>' +
                    '<div style="display:flex; gap:8px;">' +
                        '<button class="btn-action-tmpl" onclick="RetoricaAuth.toggleCloudSync()">' + (this.syncEnabled ? 'Desactivar Nube' : 'Activar Nube') + '</button>' +
                        '<button class="btn-action-tmpl" style="color:var(--danger);" onclick="RetoricaAuth.logout()">Salir</button>' +
                    '</div>' +
                '</div>';
        } else {
            userContainer.innerHTML = 
                '<div style="padding: 10px; display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.1); border-radius: 8px;">' +
                    '<div style="font-size: 0.72rem; color: var(--text-muted);">Sincronizar entre dispositivos (Privado):</div>' +
                    '<div style="display: flex; gap: 6px;">' +
                        '<input type="text" id="auth-input-id" placeholder="Email o Número de Teléfono" style="flex:1; padding:6px; font-size:0.75rem; border-radius:4px; border:1px solid #555; background:var(--bg-main); color:var(--text-main);">' +
                        '<button class="btn-action-tmpl" onclick="RetoricaAuth.loginWithEmailOrPhone(document.getElementById(\'auth-input-id\').value)">Iniciar / Crear</button>' +
                    '</div>' +
                '</div>';
        }
    }
};
