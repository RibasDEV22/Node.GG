const API_URL = 'https://node-server-b8j3.onrender.com';

// Elementos do DOM
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

const feedbackBox = document.getElementById('auth-feedback');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

// Limpa mensagens de erro/sucesso ao alternar entre abas
tabLogin.addEventListener('change', clearFeedback);
tabRegister.addEventListener('change', clearFeedback);

// ==========================================
// 1. PROCESSAR LOGIN
// ==========================================
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFeedback();

    const btnSubmit = document.getElementById('btn-login-submit');
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;

    setLoading(btnSubmit, true, 'Entrando...');

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Falha ao realizar login.');
        }

        // Salva credenciais localmente
        if (data.token) {
            localStorage.setItem('user_token', data.token);
        }
        if (data.user) {
            localStorage.setItem('user_data', JSON.stringify(data.user));
        }

        showFeedback('Login realizado com sucesso! Redirecionando...', 'success');

        // Redireciona para o chat
        setTimeout(() => {
            window.location.href = '../chat/';
        }, 1000);

    } catch (err) {
        showFeedback(err.message, 'error');
    } finally {
        setLoading(btnSubmit, false, 'Entrar no Node');
    }
});

// ==========================================
// 2. PROCESSAR REGISTRO
// ==========================================
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFeedback();

    const btnSubmit = document.getElementById('btn-register-submit');
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    // displayName por padrão é o próprio username se não informado
    const displayName = username;

    setLoading(btnSubmit, true, 'Criando conta...');

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, displayName })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Falha ao registrar conta.');
        }

        showFeedback('Conta criada com sucesso! Redirecionando para o chat...', 'success');

        if (data.token) {
            localStorage.setItem('user_token', data.token);
        }
        if (data.user) {
            localStorage.setItem('user_data', JSON.stringify(data.user));
        }

        setTimeout(() => {
            window.location.href = '../chat/';
        }, 1200);

    } catch (err) {
        showFeedback(err.message, 'error');
    } finally {
        setLoading(btnSubmit, false, 'Criar Minha Conta');
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
    button.disabled = isLoading;
    button.textContent = text;
}
