// --- RETÓRICA INTERNATIONALIZATION & TRANSLATION ENGINE (idiomas.js) ---
var RetoricaI18n = {
    currentLang: 'en-GB', 
    currentVoiceLang: 'en-GB', 
    
    // 13 Idiomas ordenados alfabéticamente de forma estricta (A-Z)
    langsOrder: ['ar-SA', 'de-DE', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'hi-IN', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'uk-UA', 'zh-CN'],
    
    db: {
        'ar-SA': { 
            name: 'Al-Arabiya', save: 'حفظ', new: 'جديد', mic: 'صوت', read: 'إقرأ', stop: 'إلغاء', vmsg: 'تسجيل', tts: 'صوت', copy: 'نسخ', pTitle: 'عنوان النص...', pBody: 'اكتب أو أملي نصوصك هنا...', menu: 'قائمة', install: 'تثبيت', theme: 'سمة', langTxt: 'لغة', langVoz: 'صوت',
            uLabel: 'المستخدم الرقمي (البريد الإلكتروني / المعرف)', pLabel: 'مفتاح التشفير', btnAuth: 'استمر', toggleAuth: 'ليس لديك حساب؟ سجل هنا', hardware: 'أو الدخول عبر الأجهزة', gBtn: 'ربط جهاز جوجل', fBtn: 'ربط جهاز فيسبوك', wBtn: 'ربط جهاز واتساب',
            btnRegister: 'تسجيل وإنشاء مفتاح', toggleHasAccount: 'هل لديك حساب بالفعل؟ ادخل هنا', alertSeed: 'تم إنشاء مفتاح تشفير تلقائي! احفظه.', errUid: 'لربط Device، اكتب بريدك الإلكتروني/المعرف أولاً.', okHardware: 'تم ربط الجهاز محلياً عبر ', syncHardware: 'مزامنة يدوية جارية... متصل!', errMissingUid: 'أدخل بريدًا إلكترونيًا أو رقم هاتف.', errBanned: 'هذا الوصول مقيد.', errNoReg: 'المستخدم غير مسجل محلياً. انتقل لوضع التسجيل.', errWrongPass: 'كلمة المرور غير صحيحة.', errAlreadyReg: 'هذا المعرف مسجل بالفعل.', errShortPass: 'يجب أن تتكون كلمة المرور من 4 أحرف على الأقل.', notifSync: 'تمت مزامنة الجلسة.'
        },
        'de-DE': { 
            name: 'Deutsch', save: 'SPE', new: 'NEU', mic: 'DIK', read: 'LIES', stop: 'HALT', vmsg: 'REC', tts: 'TON', copy: 'KOP', pTitle: 'Skripttitel...', pBody: 'Schreiben oder diktieren Sie hier...', menu: 'MENÜ', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'TON',
            uLabel: 'DIGITALER BENUTZER (EMAIL / ID)', pLabel: 'KRYPTOGRAFISCHER SCHLÜSSEL', btnAuth: 'WEITER', toggleAuth: 'Kein Konto? Registrieren', hardware: 'ODER ZUGRIFF ÜBER HARDWARE', gBtn: 'GOOGLE-GERÄT VERKNÜPFEN', fBtn: 'FACEBOOK-GERÄT VERKNÜPFEN', wBtn: 'WHATSAPP-GERÄT VERKNÜPFEN',
            btnRegister: 'REGISTRIEREN & SCHLÜSSEL ERSTELLEN', toggleHasAccount: 'Bereits ein Konto? Hier einloggen', alertSeed: 'Kryptografischer Schlüssel automatisch generiert! Bitte sichern.', errUid: 'Um Hardware zu verknüpfen, geben Sie bitte zuerst Ihre E-Mail/ID oben ein.', okHardware: 'Gerät lokal verknüpft über ', syncHardware: 'Manuelle Synchronisierung läuft... Verbunden!', errMissingUid: 'Geben Sie eine E-Mail oder Telefonnummer ein.', errBanned: 'Dieser Zugriff ist eingeschränkt.', errNoReg: 'Benutzer nicht lokal registriert. Wechseln Sie in den Registrierungsmodus.', errWrongPass: 'Falsches Passwort.', errAlreadyReg: 'Diese Kennung ist bereits registriert.', errShortPass: 'Das Passwort muss mindestens 4 Zeichen lang sein.', notifSync: 'Sitzung synchronisiert.'
        },
        'en-GB': { 
            name: 'English', save: 'SAV', new: 'NEW', mic: 'MIC', read: 'SAY', stop: 'STOP', vmsg: 'REC', tts: 'AUD', copy: 'CPY', pTitle: 'Script Title...', pBody: 'Write or dictate your rhetoric here...', menu: 'MENU', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'VOI',
            uLabel: 'DIGITAL USER (EMAIL / ID)', pLabel: 'CRYPTOGRAPHIC KEY', btnAuth: 'CONTINUE', toggleAuth: 'No account? Sign up here', hardware: 'OR ACCESS VIA HARDWARE', gBtn: 'LINK GOOGLE DEVICE', fBtn: 'LINK FACEBOOK DEVICE', wBtn: 'LINK WHATSAPP DEVICE',
            btnRegister: 'REGISTER & CREATE KEY', toggleHasAccount: 'Already have an account? Log in here', alertSeed: 'Cryptographic key auto-generated! Please secure it.', errUid: 'To link via hardware, type your Email/ID above first.', okHardware: 'Device linked locally via ', syncHardware: 'Manual synchronization in progress... Connected!', errMissingUid: 'Enter an email or phone number.', errBanned: 'This access is restricted.', errNoReg: 'User not registered locally. Switch to signup mode.', errWrongPass: 'Incorrect key.', errAlreadyReg: 'This identifier is already registered.', errShortPass: 'Password must be at least 4 characters long.', notifSync: 'Session synchronized.'
        },
        'es-ES': { 
            name: 'Español (ES)', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEE', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', pTitle: 'Titular de la Obra...', pBody: 'Escribe o dicta aquí tu obra...', menu: 'MENÚ', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ',
            uLabel: 'USUARIO DIGITAL (EMAIL / ID)', pLabel: 'CLAVE CRIPTOGRÁFICA', btnAuth: 'CONTINUAR', toggleAuth: '¿No tienes cuenta? Regístrate aquí', hardware: 'O ACCEDER VÍA HARDWARE', gBtn: 'VINCULAR DISPOSITIVO GOOGLE', fBtn: 'VINCULAR DISPOSITIVO FACEBOOK', wBtn: 'VINCULAR DISPOSITIVO WHATSAPP',
            btnRegister: 'REGISTRAR Y CREAR CLAVE', toggleHasAccount: '¿Ya tienes cuenta? Entra aquí', alertSeed: '¡Clave criptográfica autogenerada! Resguárdala.', errUid: 'Para vincular vía hardware, escribe primero tu Email/ID arriba.', okHardware: 'Dispositivo vinculado localmente vía ', syncHardware: 'Sincronización manual en progreso... ¡Conectado!', errMissingUid: 'Ingresa un correo o número telefónico.', errBanned: 'Este acceso se encuentra restringido.', errNoReg: 'Usuario no registrado localmente. Cambia al modo de registro.', errWrongPass: 'Clave incorrecta.', errAlreadyReg: 'Este identificador ya está registrado.', errShortPass: 'La contraseña debe tener al menos 4 caracteres.', notifSync: 'Sesión sincronizada.'
        },
        'es-MX': { 
            name: 'Español (MX)', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEE', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', pTitle: 'Título del Guion...', pBody: 'Escribe o dicta aquí tu retórica...', menu: 'MENÚ', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ',
            uLabel: 'USUARIO DIGITAL (EMAIL / ID)', pLabel: 'CLAVE CRIPTOGRÁFICA', btnAuth: 'CONTINUAR', toggleAuth: '¿No tienes cuenta? Regístrate aquí', hardware: 'O ACCEDER VÍA HARDWARE', gBtn: 'VINCULAR DISPOSITIVO GOOGLE', fBtn: 'VINCULAR DISPOSITIVO FACEBOOK', wBtn: 'VINCULAR DISPOSITIVO WHATSAPP',
            btnRegister: 'REGISTRAR Y CREAR CLAVE', toggleHasAccount: '¿Ya tienes cuenta? Entra aquí', alertSeed: '¡Clave criptográfica autogenerada! Resguárdala.', errUid: 'Para vincular vía hardware, escribe primero tu Email/ID arriba.', okHardware: 'Dispositivo vinculado localmente vía ', syncHardware: 'Sincronización manual en progreso... ¡Conectado!', errMissingUid: 'Ingresa un correo o número telefónico.', errBanned: 'Este acceso se encuentra restringido.', errNoReg: 'Usuario no registrado localmente. Cambia al modo de registro.', errWrongPass: 'Clave incorrecta.', errAlreadyReg: 'Este identificador ya está registrado.', errShortPass: 'La contraseña debe tener al menos 4 caracteres.', notifSync: 'Sesión sincronizada.'
        },
        'fr-FR': { 
            name: 'Français', save: 'SAV', new: 'NOU', mic: 'MIC', read: 'LIS', stop: 'FIN', vmsg: 'REC', tts: 'AUD', copy: 'COP', pTitle: 'Titre du Scénario...', pBody: 'Écrivez ou dictez votre rhétorique ici...', menu: 'MENU', install: 'APP', theme: 'THM', langTxt: 'TXT', langVoz: 'VOI',
            uLabel: 'UTILISATEUR NUMÉRIQUE (EMAIL / ID)', pLabel: 'CLÉ CRYPTOGRAPHIQUE', btnAuth: 'CONTINUER', toggleAuth: 'Pas de compte? S’inscrire ici', hardware: 'OU ACCÈS VIA HARDWARE', gBtn: 'ASSOCCIER APPAREIL GOOGLE', fBtn: 'ASSOCCIER APPAREIL FACEBOOK', wBtn: 'ASSOCCIER APPAREIL WHATSAPP',
            btnRegister: 'S’INSCRIRE & CRÉER UNE CLÉ', toggleHasAccount: 'Vous avez déjà un compte? Connectez-vous', alertSeed: 'Clé cryptographique générée automatiquement! Veuillez la sauvegarder.', errUid: 'Pour associer via un appareil, saisissez d’abord votre Email/ID ci-dessus.', okHardware: 'Appareil associé localement via ', syncHardware: 'Synchronisation manuelle en cours... Connecté!', errMissingUid: 'Entrez un e-mail ou un numéro de téléphone.', errBanned: 'Cet accès est restreint.', errNoReg: 'Utilisateur non enregistré localement. Passez en mode inscription.', errWrongPass: 'Clé incorrecte.', errAlreadyReg: 'Cet identifiant est déjà enregistré.', errShortPass: 'Le mot de passe doit contenir au moins 4 caractères.', notifSync: 'Session synchronisée.'
        },
        'hi-IN': { 
            name: 'Hindi', save: 'रखो', new: 'नया', mic: 'बोल', read: 'सुन', stop: 'रोक', vmsg: 'रिए', tts: 'ध्व', copy: 'प्रति', pTitle: 'शीर्षक...', pBody: 'अपनी पटकथा यहाँ लिखें...', menu: 'सूची', install: 'ऐप', theme: 'थीम', langTxt: 'पाठ', langVoz: 'आवाज़',
            uLabel: 'डिजिटल उपयोगकर्ता (ईमेल / आईडी)', pLabel: 'क्रिप्टोग्राफिक कुंजी', btnAuth: 'जारी रखें', toggleAuth: 'खाता नहीं है? यहाँ पंजीकरण करें', hardware: 'या हार्डवेयर के माध्यम से पहुंचें', gBtn: 'गूगल डिवाइस लिंक करें', fBtn: 'फेसबुक डिवाइस link करें', wBtn: 'व्हाट्सएप डिवाइस लिंक करें',
            btnRegister: 'पंजीकरण करें और कुंजी बनाएं', toggleHasAccount: 'पहले से ही खाता है? यहाँ लॉग इन करें', alertSeed: 'क्रिप्टोग्राफिक कुंजी स्वतः उत्पन्न! कृपया इसे सुरक्षित करें।', errUid: 'हार्डवेयर के माध्यम से लिंक करने के लिए, पहले ऊपर अपना ईमेल/आईडी दर्ज करें।', okHardware: 'डिवाइस स्थानीय रूप से इसके माध्यम से लिंक किया गया: ', syncHardware: 'मैन्युअल सिंक्रनाइज़ेशन प्रगति पर है... कनेक्टेड!', errMissingUid: 'एक ईमेल या फ़ोन नंबर दर्ज करें।', errBanned: 'यह पहुंच प्रतिबंधित है।', errNoReg: 'उपयोगकर्ता स्थानीय रूप से पंजीकृत नहीं है। साइनअप मोड पर जाएं。', errWrongPass: 'गलत पासवर्ड।', errAlreadyReg: 'यह पहचानकर्ता पहले से ही पंजीकृत है।', errShortPass: 'पासवर्ड कम से कम 4 वर्णों का होना चाहिए।', notifSync: 'सत्र सिंक्रनाइज़ हो गया।'
        },
        'it-IT': { 
            name: 'Italiano', save: 'SAL', new: 'NVO', mic: 'VOC', read: 'LEG', stop: 'ALT', vmsg: 'REC', tts: 'AUD', copy: 'COP', pTitle: 'Titolo dello Script...', pBody: 'Scrivi o detta qui la tua retorica...', menu: 'MENU', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOC',
            uLabel: 'UTENTE DIGITALE (EMAIL / ID)', pLabel: 'CHIAVE CRITTOGRAFICA', btnAuth: 'CONTINUA', toggleAuth: 'Non hai un account? Registrati qui', hardware: 'O ACCEDI VIA HARDWARE', gBtn: 'COLLEGA DISPOSITIVO GOOGLE', fBtn: 'COLLEGA DISPOSITIVO FACEBOOK', wBtn: 'COLLEGA DISPOSITIVO WHATSAPP',
            btnRegister: 'REGISTRATI & CREA CHIAVE', toggleHasAccount: 'Hai già un account? Accedi qui', alertSeed: 'Chiave crittografica autogenerata! Si prega di conservarla.', errUid: 'Per collegare l’hardware, inserisci prima il tuo Email/ID in alto.', okHardware: 'Dispositivo collegato localmente tramite ', syncHardware: 'Sincronizzazione manuale in corso... Connesso!', errMissingUid: 'Inserisci un’e-mail o un numero di telefono.', errBanned: 'Questo accesso è limitato.', errNoReg: 'Utente non registrato localmente. Passa alla modalità di registrazione.', errWrongPass: 'Chiave errata.', errAlreadyReg: 'Questo identificatore è già registrato.', errShortPass: 'La password deve contenere almeno 4 caratteri.', notifSync: 'Sessione sincronizzata.'
        },
        'ja-JP': { 
            name: 'Japanese', save: '保存', new: '新規', mic: '音声', read: '再生', stop: '停止', vmsg: '録音', tts: '音源', copy: '複写', pTitle: 'タイトル...', pBody: 'ここにレトリックを書きます...', menu: '献立', install: '追加', theme: '配色', langTxt: '文字', langVoz: '音声',
            uLabel: 'デジタルユーザー (メール / ID)', pLabel: '暗号化キー', btnAuth: '続行', toggleAuth: 'アカウントをお持ちでない方、登録', hardware: 'またはハードウェア経由でアクセス', gBtn: 'GOOGLE デバイスを連携', fBtn: 'FACEBOOK デバイスを連携', wBtn: 'WHATSAPP デバイスを連携',
            btnRegister: '登録してキーを生成', toggleHasAccount: '既にアカウントをお持ちの方はこちら', alertSeed: '暗号化キーが自動生成されました！大切に保管してください。', errUid: 'ハードウェアを連携するには、まず上に Email/ID を入力してください。', okHardware: 'デバイスがローカルに連携されました：', syncHardware: '手動同期中... 接続完了！', errMissingUid: 'メールアドレスまたは電話番号を入力してください。', errBanned: 'このアクセスは制限されています。', errNoReg: 'ユーザーはローカルに登録されていません。登録モードに切り替えてください。', errWrongPass: 'キーが正しくありません。', errAlreadyReg: '此の識別子は既に登録されています。', errShortPass: 'パスワードは4文字以上である必要があります。', notifSync: 'セッションが同期されました。'
        },
        'pt-PT': { 
            name: 'Português', save: 'GUA', new: 'NVO', mic: 'VOZ', read: 'LEI', stop: 'FIM', vmsg: 'REC', tts: 'AUD', copy: 'COP', pTitle: 'Título do Roteiro...', pBody: 'Escreva ou dite sua retórica aqui...', menu: 'MENU', install: 'APP', theme: 'TEMA', langTxt: 'TXT', langVoz: 'VOZ',
            uLabel: 'USUÁRIO DIGITAL (EMAIL / ID)', pLabel: 'CHAVE CRIPTOGRÁFICA', btnAuth: 'CONTINUAR', toggleAuth: 'Não tem conta? Registe-se aqui', hardware: 'OU ACEDER VIA HARDWARE', gBtn: 'VINCULAR DISPOSITIVO GOOGLE', fBtn: 'VINCULAR DISPOSITIVO FACEBOOK', wBtn: 'VINCULAR DISPOSITIVO WHATSAPP',
            btnRegister: 'REGISTAR & CRIAR CHAVE', toggleHasAccount: 'Já tem uma conta? Entrar aqui', alertSeed: 'Chave criptográfica autogerada! Guarde-a em segurança.', errUid: 'Para vincular via hardware, escreva primeiro o seu Email/ID acima.', okHardware: 'Dispositivo vinculado localmente via ', syncHardware: 'Sincronização manual em progresso... Ligado!', errMissingUid: 'Introduza um e-mail ou número de telefone.', errBanned: 'Este acesso está restrito.', errNoReg: 'Usuário não registado localmente. Altere para o modo de registo.', errWrongPass: 'Chave incorreta.', errAlreadyReg: 'Este identificador ya está registado.', errShortPass: 'A senha deve ter pelo menos 4 caracteres.', notifSync: 'Sessão sincronizada.'
        },
        'ru-RU': { 
            name: 'Русский', save: 'СОХ', new: 'НОВ', mic: 'ГОЛ', read: 'ЧИТ', stop: 'СТОП', vmsg: 'ЗАП', tts: 'ЗВУК', copy: 'КОП', pTitle: 'Название...', pBody: 'Пишите здесь...', menu: 'МЕНЮ', install: 'АПП', theme: 'ТЕМ', langTxt: 'ТКСТ', langVoz: 'ГОЛ',
            uLabel: 'ЦИФРОВОЙ ПОЛЬЗОВАТЕЛЬ (EMAIL / ID)', pLabel: 'КРИПТОГРАФИЧЕСКИЙ КЛЮЧ', btnAuth: 'ПРОДОЛЖИТЬ', toggleAuth: 'Нет аккаунта? Зарегистрироваться', hardware: 'ИЛИ ВХОД ЧЕРЕЗ АППАРАТНОЕ ОБЕСПЕЧЕНИЕ', gBtn: 'ПРИВЯЗАТЬ УСТРОЙСТВО GOOGLE', fBtn: 'ПРИВЯЗАТЬ УСТРОЙСТВО FACEBOOK', wBtn: 'ПРИВЯЗАТЬ УСТРОЙСТВО WHATSAPP',
            btnRegister: 'ЗАРЕГИСТРИРОВАТЬСЯ И СОЗДАТЬ КЛЮЧ', toggleHasAccount: 'Уже есть аккаунт? Войти', alertSeed: 'Криптографический ключ сгенерирован автоматически! Пожалуйста, сохраните его.', errUid: 'Для привязки устройства сначала введите ваш Email/ID выше.', okHardware: 'Устройство привязано локально через ', syncHardware: 'Ручная синхронизация... Подключено!', errMissingUid: 'Введите адрес электронной почты или номер телефона.', errBanned: 'Этот доступ ограничен.', errNoReg: 'Пользователь не зарегистрирован локально. Переключитесь в режим регистрации.', errWrongPass: 'Неверный ключ.', errAlreadyReg: 'Этот идентификатор уже зарегистрирован.', errShortPass: 'Пароль должен быть не менее 4 символов.', notifSync: 'Сессия синхронизирован.'
        },
        'uk-UA': { 
            name: 'Ukrainian', save: 'ЗБЕР', new: 'НОВ', mic: 'ГОЛ', read: 'ЧИТ', stop: 'СТОП', vmsg: 'ЗАП', tts: 'ЗВУК', copy: 'КОП', pTitle: 'Назва Сценарію...', pBody: 'Пишіть або диктуйте риторику тут...', menu: 'МЕНЮ', install: 'АПП', theme: 'ТЕМ', langTxt: 'ТЕКСТ', langVoz: 'ГОЛ',
            uLabel: 'ЦИФРОВИЙ КОРИСТУВАЧ (EMAIL / ID)', pLabel: 'КРИПТОГРАФІЧНИЙ КЛЮЧ', btnAuth: 'ПРОДОВЖИТИ', toggleAuth: 'Немає акаунту? Зареєструватися', hardware: 'АБО ВХІД ЧЕРЕЗ АПАРАТНЕ ЗАБЕЗПЕЧЕННЯ', gBtn: 'ПРИВ’ЯЗАТИ ПРИСТРІЙ GOOGLE', fBtn: 'ПРИВ’ЯЗАТИ ПРИСТРІЙ FACEBOOK', wBtn: 'ПРИВ’ЯЗАТИ ПРИСТРІЙ WHATSAPP',
            btnRegister: 'ЗАРЄЄСТРУВАТИСЯ ТА СТВОРИТИ КЛЮЧ', toggleHasAccount: 'Вже є акаунт? Увійти сюди', alertSeed: 'Криптографічний ключ згенеровано автоматически! Будь ласка, збережіть його.', errUid: 'Для прив’язки апаратного забезпечення спочатку введіть ваш Email/ID вище.', okHardware: 'Пристрій прив’язано локально через ', syncHardware: 'Ручна синхронізація... Підключено!', errMissingUid: 'Введіть електронну пошту або номер телефону.', errBanned: 'Цей доступ обмежено.', errNoReg: 'Користувач не зареєстрований локально. Перейдіть у режим реєстрації.', errWrongPass: 'Невірний ключ.', errAlreadyReg: 'Цей ідентифікатор вже зареєстрований.', errShortPass: 'Пароль повинен містити принаймні 4 символи.', notifSync: 'Сесію синхронізовано.'
        },
        'zh-CN': { 
            name: 'Chinese', save: '保存', new: '新建', mic: '语音', read: '朗读', stop: '停止', vmsg: '录音', tts: '音频', copy: '复制', pTitle: '剧本标题...', pBody: '在此处编写您的剧本...', menu: '菜单', install: '安装', theme: '主题', langTxt: '文字', langVoz: '语音',
            uLabel: '数字用户 (电子邮箱 / ID)', pLabel: '加密密钥', btnAuth: '继续', toggleAuth: '没有账户？注册', hardware: '或通过硬件访问', gBtn: '绑定谷歌设备', fBtn: '绑定脸书设备', wBtn: '绑定微信设备',
            btnRegister: '注册并创建密钥', toggleHasAccount: '已有账户？在此登录', alertSeed: '自动生成的加密密钥！请妥善保管。', errUid: '要通过硬件绑定，请先在上方输入您的Email/ID。', okHardware: '本地设备已通过此方式绑定：', syncHardware: '手动同步中... 已连接！', errMissingUid: '请输入电子邮件或电话号码。', errBanned: '此访问已被限制。', errNoReg: '用户未在本地注册。请切换到注册模式。', errWrongPass: '密码错误。', errAlreadyReg: '此标识符已被注册。', errShortPass: '密码长度至少为 4 个字符。', notifSync: '会话已同步。'
        }
    },

    init: function() { this.setAppLang(this.currentLang); },

    setAppLang: function(lang) {
        this.currentLang = lang;
        var p = this.db[lang] || this.db['en-GB']; 
        
        // Botones de la barra de herramientas
        var btnSave = document.getElementById('lbl-tool-save'); if(btnSave) btnSave.innerText = p.save;
        var btnNew = document.getElementById('lbl-tool-new'); if(btnNew) btnNew.innerText = p.new;
        var btnMic = document.getElementById('lbl-tool-mic'); if(btnMic) btnMic.innerText = p.mic;
        var btnRead = document.getElementById('lbl-tool-read'); if(btnRead) btnRead.innerText = p.read;
        var btnStop = document.getElementById('lbl-tool-stop'); if(btnStop) btnStop.innerText = p.stop;
        var btnVmsg = document.getElementById('lbl-tool-vmsg'); if(btnVmsg) btnVmsg.innerText = p.vmsg;
        var btnTts = document.getElementById('lbl-tool-tts'); if(btnTts) btnTts.innerText = p.tts;
        var btnCopy = document.getElementById('lbl-tool-copyall'); if(btnCopy) btnCopy.innerText = p.copy || 'COP';
        var btnImp = document.getElementById('lbl-tool-import'); if(btnImp) btnImp.innerText = p.import || 'IMP';
        var btnPdf = document.getElementById('lbl-tool-pdf'); if(btnPdf) btnPdf.innerText = p.pdf || 'PDF';
        var btnPdfE = document.getElementById('lbl-tool-pdfedit'); if(btnPdfE) btnPdfE.innerText = p.pdfedit || 'PDF EDIT';
        var btnDoc = document.getElementById('lbl-tool-doc'); if(btnDoc) btnDoc.innerText = p.doc || 'WORD';
        var btnZIn = document.getElementById('lbl-tool-zoomin'); if(btnZIn) btnZIn.innerText = p.zoomin || 'ZOOM +';
        var btnZOut = document.getElementById('lbl-tool-zoomout'); if(btnZOut) btnZOut.innerText = p.zoomout || 'ZOOM -';
        
        // Inputs
        var tInput = document.getElementById('editor-title'); if(tInput) tInput.placeholder = p.pTitle;
        var bInput = document.getElementById('editor-body'); if(bInput) bInput.placeholder = p.pBody;
        
        // Elementos de navegación superior
        var lblMenu = document.getElementById('lbl-nav-menu'); if(lblMenu) lblMenu.innerHTML = p.menu;
        var lblInstall = document.getElementById('lbl-nav-install'); if(lblInstall) lblInstall.innerHTML = p.install;
        var lblTheme = document.getElementById('lbl-nav-theme'); if(lblTheme) lblTheme.innerHTML = p.theme;
        var lblLangTxt = document.getElementById('lbl-nav-langtxt'); if(lblLangTxt) lblLangTxt.innerHTML = p.langTxt;
        
        // Capa Auth
        var lUser = document.getElementById('lbl-auth-user'); if(lUser) lUser.innerText = p.uLabel;
        var lPass = document.getElementById('lbl-auth-pass'); if(lPass) lPass.innerText = p.pLabel;
        var bAuth = document.getElementById('btn-submit-auth'); if(bAuth && (typeof RetoricaAuth === 'undefined' || RetoricaAuth.state.mode === 'login')) bAuth.innerText = p.btnAuth;
        var tAuth = document.getElementById('auth-toggle-mode'); if(tAuth && (typeof RetoricaAuth === 'undefined' || RetoricaAuth.state.mode === 'login')) tAuth.innerText = p.toggleAuth;
        var dLine = document.getElementById('auth-divider-line'); if(dLine) dLine.innerText = p.hardware;
        
        var oG = document.getElementById('btn-oauth-google'); if(oG) oG.innerText = p.gBtn;
        var oF = document.getElementById('btn-oauth-facebook'); if(oF) oF.innerText = p.fBtn;
        var oW = document.getElementById('btn-oauth-whatsapp'); if(oW) oW.innerText = p.wBtn;

        // Ajuste de Layout
        var toolContainer = document.querySelector('.toolbar-buttons-container') || document.querySelector('.main-nav-container') || (btnSave ? btnSave.parentElement : null);
        if (toolContainer) {
            toolContainer.style.overflowX = 'auto';
            toolContainer.style.whiteSpace = 'nowrap';
            toolContainer.style.display = 'flex';
            toolContainer.style.flexWrap = 'nowrap';
        }
        
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Idioma Activo: " + p.name);
        this.checkAndTranslateSelection(lang);
    },

    // Alternar apertura y cierre del acordeón
    toggleAccordion: function() {
        var panel = document.getElementById('accordion-languages');
        var arrow = document.getElementById('accordion-arrow');
        if (!panel) return;

        var isClosed = panel.classList.contains('accordion-closed');
        if (isClosed) {
            panel.classList.remove('accordion-closed');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
            this.renderAccordionLanguages();
        } else {
            panel.classList.add('accordion-closed');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    },

    // Renderizar botones dentro del panel acordeón con el estándar 3D visual de Retórica
    renderAccordionLanguages: function() {
        var track = document.getElementById('accordion-slider-track');
        if (!track) return;
        track.innerHTML = '';

        var self = this;
        this.langsOrder.forEach(function(langKey) {
            var item = self.db[langKey];
            
            // Envoltorio principal que respeta la inversión 3D (Label Arriba / Botón Abajo)
            var wrapper = document.createElement('div');
            wrapper.className = 'btn-wrapper-3d';
            wrapper.style.display = 'inline-flex';
            wrapper.style.flexDirection = 'column-reverse';
            wrapper.style.alignItems = 'center';
            wrapper.style.flexShrink = '0';
            wrapper.style.width = '60px';

            // Etiqueta superior
            var label = document.createElement('div');
            label.className = 'btn-label-3d';
            label.innerText = langKey.split('-')[0].toUpperCase();

            // Botón circular 3D
            var btn = document.createElement('button');
            btn.className = 'btn-round-3d' + (langKey === self.currentLang ? ' btn-fire-blue' : '');
            
            var iconSpan = document.createElement('span');
            iconSpan.className = 'icon-raw';
            // Obtener prefijo o dos primeras letras para mostrar como ícono dentro de la esfera
            iconSpan.innerText = langKey.substring(0, 2).toUpperCase();
            btn.appendChild(iconSpan);

            wrapper.appendChild(label);
            wrapper.appendChild(btn);

            wrapper.onclick = function(e) {
                if (e) e.stopPropagation();
                self.setAppLang(langKey);
                self.renderAccordionLanguages();
            };

            track.appendChild(wrapper);
        });
    },

checkAndTranslateSelection: function(targetLang) {
    var editor = document.getElementById('editor-body');
    if (!editor || !editor.value.trim()) return;

    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = (start !== end) ? editor.value.substring(start, end) : editor.value;

    var sourceClean = this.currentLang.split('-')[0];
    var targetClean = targetLang.split('-')[0];
    if (sourceClean === targetClean) return;

    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Traduciendo texto...");

    var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(selectedText) + "&langpair=" + sourceClean + "|" + targetClean;

    var self = this;
    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data && data.responseData && data.responseStatus === 200) {
                var translatedText = data.responseData.translatedText;
                if (!translatedText || translatedText.includes("INVALID SOURCE LANGUAGE")) {
                    if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error en idioma de origen.");
                    return;
                }

                if (start !== end) {
                    // Si había texto seleccionado, reemplaza solo la selección
                    var fullText = editor.value;
                    editor.value = fullText.substring(0, start) + translatedText + fullText.substring(end);
                } else {
                    // Si no había selección, traduce todo el cuerpo del texto
                    editor.value = translatedText;
                }
                
                if (typeof RetoricaUI !== 'undefined') {
                    RetoricaUI.updateCounters();
                    if (typeof RetoricaUI.triggerAutoSave === 'function') RetoricaUI.triggerAutoSave();
                    RetoricaUI.notify("Traducción completada ✓");
                }
            } else {
                if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Límite de API alcanzado o servidor ocupado.");
            }
        }).catch(function() {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Sin conexión para traducir.");
        });
}
};
