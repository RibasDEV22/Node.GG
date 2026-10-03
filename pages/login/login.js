const SERVER_URL = 'https://node-server-b8j3.onrender.com';

let socket = null;
let currentAction = null;

const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const feedbackBox = document.getElementById('auth-feedback');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

tabLogin.addEventListener('change', clearFeedback);
tabRegister.addEventListener('change', clearFeedback);

// ==========================================
// CONEXÃO WEBSOCKET
// ==========================================

function getWebSocketURL() {
    // Converte HTTPS para WSS automaticamente
    const protocol = SERVER_URL.startsWith('https://') ? 'wss://' : 'ws://';
    const url = SERVER_URL.replace(/^https?:\/\//, '');
    return protocol + url;
}

function connectSocket() {
    return new Promise((resolve, reject) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            resolve(socket);
            return;
        }

        try {
            const wsURL = getWebSocketURL();
            console.log('[WS] Conectando a:', wsURL);
            
            socket = new WebSocket(wsURL);
            socket.onopen = () => {
                console.log('[WS] ✅ Conectado com sucesso!');
                resolve(socket);
            };

            socket.onerror = (err) => {
                console.error('[WS] ❌ Erro de conexão:', err);
                reject(new Error('Falha ao conectar com o servidor. Verifique se está online.'));
            };

            socket.onmessage = handleSocketMessage;

            socket.onclose = () => {
                console.log('[WS] Conexão encerrada');
                socket = null;
            };

            // Timeout de 10 segundos
            setTimeout(() => {
                if (socket && socket.readyState !== WebSocket.OPEN) {
                    reject(new Error('Timeout: Servidor não respondeu.'));
                }
            }, 10000);

        } catch (err) {
            console.error('[WS] Erro ao criar socket:', err);
            reject(err);
        }
    });
}

// ==========================================
// TRATAMENTO DAS RESPOSTAS DO SERVIDOR
// ==========================================

function handleSocketMessage(event) {
    try {
        const data = JSON.parse(event.data);
        console.log('[WS] 📨 Mensagem:', data.type);

        if (data.type === 'auth_success') {
            handleAuthSuccess(data);
            return;
        }

        if (data.type === 'auth_error') {
            handleAuthError(data);
            return;
        }

        if (data.type === 'maintenance_active') {
            handleMaintenance(data);
            return;
        }
    } catch (err) {
        console.error('[WS] Erro ao processar mensagem:', err);
    }
}

function handleAuthSuccess(data) {
    const btn = currentAction === 'login'
        ? document.getElementById('btn-login-submit')
        : document.getElementById('btn-register-submit');

    const user = data.user || {};
    
    // Salva token de sessão
    if (user.sessionToken) {
        localStorage.setItem('sessionToken', user.sessionToken);
        console.log('[AUTH] 💾 Token salvo:', user.sessionToken.substring(0, 8) + '...');
    }

    // Salva dados do usuário
    if (user) {
        localStorage.setItem('user_data', JSON.stringify(user));
        console.log('[AUTH] ✅ Usuário:', user.username);
    }

    const msg = currentAction === 'register'
        ? 'Conta criada com sucesso! ✅ Redirecionando...'
        : 'Login realizado com sucesso! ✅ Redirecionando...';

    showFeedback(msg, 'success');
    
    if (btn) {
        setLoading(btn, false, currentAction === 'login' ? 'Entrar no Node' : 'Criar Minha Conta');
    }

    // Redireciona para o Dashboard após a autenticação
    setTimeout(() => {
        window.location.href = '../dashboard/';
    }, 1200);
}

function handleAuthError(data) {
    const btn = currentAction === 'login'
        ? document.getElementById('btn-login-submit')
        : document.getElementById('btn-register-submit');

    const message = data.message || 'Erro ao autenticar.';
    console.error('[AUTH] ❌', message);
    showFeedback(message, 'error');
    
    if (btn) {
        setLoading(btn, false, currentAction === 'login' ? 'Entrar no Node' : 'Criar Minha Conta');
    }
}

function handleMaintenance(data) {
    const btn = currentAction === 'login'
        ? document.getElementById('btn-login-submit')
        : document.getElementById('btn-register-submit');

    console.warn('[MAINT] ⚠️ Servidor em manutenção');
    showFeedback(data.message || 'Servidor em manutenção. Tente novamente mais tarde.', 'error');
    
    if (btn) {
        setLoading(btn, false, currentAction === 'login' ? 'Entrar no Node' : 'Criar Minha Conta');
    }
}

// ==========================================
// LOGIN
// ==========================================

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFeedback();

    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login-submit');

    if (!identifier || !password) {
        showFeedback('❌ Preencha usuário/e-mail e senha.', 'error');
        return;
    }

    currentAction = 'login';
    setLoading(btn, true, 'Entrando...');

    try {
        console.log('[LOGIN] 🔐 Iniciando login para:', identifier);
        await connectSocket();

        socket.send(JSON.stringify({
            type: 'login',
            identifier,
            password
        }));

        console.log('[LOGIN] 📤 Credenciais enviadas ao servidor');

    } catch (err) {
        const message = err.message || 'Erro ao conectar ao servidor.';
        console.error('[LOGIN] ❌', message);
        showFeedback('❌ ' + message, 'error');
        setLoading(btn, false, 'Entrar no Node');
    }
});

// ==========================================
// REGISTRO
// ==========================================

formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFeedback();

    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const terms = document.getElementById('reg-terms');
    const btn = document.getElementById('btn-register-submit');

    // Validações
    if (!username || !email || !password) {
        showFeedback('❌ Preencha todos os campos.', 'error');
        return;
    }

    if (password.length < 6) {
        showFeedback('❌ A senha deve ter no mínimo 6 caracteres.', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFeedback('❌ E-mail inválido.', 'error');
        return;
    }

    if (!terms.checked) {
        showFeedback('❌ Você deve aceitar os termos.', 'error');
        return;
    }

    currentAction = 'register';
    setLoading(btn, true, 'Criando conta...');

    try {
        console.log('[REGISTER] 📝 Criando conta:', username);
        await connectSocket();

        socket.send(JSON.stringify({
            type: 'register',
            username,
            email,
            password,
            displayName: username,
            avatar: ''
        }));

        console.log('[REGISTER] 📤 Dados de registro enviados');

    } catch (err) {
        const message = err.message || 'Erro ao conectar ao servidor.';
        console.error('[REGISTER] ❌', message);
        showFeedback('❌ ' + message, 'error');
        setLoading(btn, false, 'Criar Minha Conta');
    }
});

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function showFeedback(msg, type = 'error') {
    feedbackBox.textContent = msg;
    feedbackBox.style.display = 'block';

    if (type === 'error') {
        feedbackBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
        feedbackBox.style.color = '#f87171';
        feedbackBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    } else {
        feedbackBox.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
        feedbackBox.style.color = '#4ade80';
        feedbackBox.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    }
}

function clearFeedback() {
    feedbackBox.textContent = '';
    feedbackBox.style.display = 'none';
}

function setLoading(button, isLoading, text) {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = text;
}

// ==========================================
// RECONEXÃO COM TOKEN SALVO
// ==========================================

window.addEventListener('load', async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    const userData = localStorage.getItem('user_data');

    if (!sessionToken || !userData) return;

    console.log('[LOAD] 🔄 Tentando reconectar com token salvo...');

    try {
        currentAction = 'reconnect';
        await connectSocket();

        socket.send(JSON.stringify({
            type: 'reconnect_session',
            sessionToken
        }));
    } catch (err) {
        console.warn('[LOAD] Reconexão falhou, necessário novo login:', err.message);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user_data');
    }
});
