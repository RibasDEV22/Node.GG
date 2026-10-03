/**
 * NODE.GG DASHBOARD - PRODUCTION JAVASCRIPT
 * Integração Real com Backend via REST API & WebSockets.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // CONFIGURAÇÃO & ESTADO DA APLICAÇÃO
    // ==========================================================================
    const CONFIG = {
        API_BASE: '/api',
        WS_URL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
        PING_INTERVAL: 10000
    };

    const STATE = {
        currentUser: localStorage.getItem('node_gg_username') || null,
        userStatus: 'online',
        activeTab: 'online', // 'online', 'all', 'requests', 'add'
        searchQuery: '',
        friends: [],      // Lista real de amigos retornada da API
        requests: [],     // Pedidos pendentes retornados da API
        ws: null,
        pingLatency: 0,
        pingTimer: null
    };

    // ==========================================================================
    // ELEMENTOS DO DOM
    // ==========================================================================
    const DOM = {
        // Usuário & Sidebar
        userDisplayName: document.getElementById('user-display-name'),
        userAvatar: document.getElementById('user-avatar'),
        userStatusDot: document.getElementById('user-status-dot'),
        userStatusSelect: document.getElementById('user-status-select'),
        changeUsernameBtn: document.getElementById('change-username-btn'),
        sidebar: document.getElementById('sidebar'),
        mobileOverlay: document.getElementById('mobile-overlay'),
        openSidebarBtn: document.getElementById('open-sidebar-btn'),
        closeSidebarBtn: document.getElementById('close-sidebar-btn'),

        // Telemetria & Busca
        connectionStatus: document.getElementById('connection-status'),
        connectionText: document.getElementById('connection-text'),
        pingValue: document.getElementById('ping-value'),
        pageTitle: document.getElementById('page-title'),
        searchInput: document.getElementById('search-input'),
        clearSearchBtn: document.getElementById('clear-search-btn'),
        quickAddBtn: document.getElementById('quick-add-btn'),

        // Badges & Containers
        badgeOnline: document.getElementById('badge-online'),
        badgeAll: document.getElementById('badge-all'),
        badgeRequests: document.getElementById('badge-requests'),
        friendsContainer: document.getElementById('friends-list-container'),
        addFriendSection: document.getElementById('add-friend-section'),
        addFriendForm: document.getElementById('add-friend-form'),
        targetUsernameInput: document.getElementById('target-username-input'),

        // Modal & Toast
        modal: document.getElementById('add-friend-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        cancelModalBtn: document.getElementById('cancel-modal-btn'),
        modalAddFriendForm: document.getElementById('modal-add-friend-form'),
        modalUsernameInput: document.getElementById('modal-username-input'),
        toastContainer: document.getElementById('toast-container'),
        navItems: document.querySelectorAll('.nav-item')
    };

    // ==========================================================================
    // CLIENTE REST API
    // ==========================================================================
    const ApiClient = {
        async request(endpoint, options = {}) {
            const headers = {
                'Content-Type': 'application/json',
                'x-username': STATE.currentUser || '',
                ...(options.headers || {})
            };

            try {
                const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, { ...options, headers });
                
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || `Erro HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`[API Error] ${endpoint}:`, error.message);
                throw error;
            }
        },

        getFriendsList() {
            return this.request('/friends/list');
        },

        getPendingRequests() {
            return this.request('/friends/requests');
        },

        sendFriendRequest(targetUsername) {
            return this.request('/friends/add', {
                method: 'POST',
                body: JSON.stringify({ targetUsername })
            });
        },

        acceptFriendRequest(requesterUsername) {
            return this.request('/friends/accept', {
                method: 'POST',
                body: JSON.stringify({ requesterUsername })
            });
        },

        rejectFriendRequest(requesterUsername) {
            return this.request('/friends/reject', {
                method: 'POST',
                body: JSON.stringify({ requesterUsername })
            });
        },

        removeFriend(friendUsername) {
            return this.request('/friends/remove', {
                method: 'POST',
                body: JSON.stringify({ friendUsername })
            });
        },

        updateStatus(status) {
            return this.request('/friends/status', {
                method: 'POST',
                body: JSON.stringify({ status })
            });
        }
    };

    // ==========================================================================
    // GERENCIADOR WEBSOCKET (REAL-TIME SYNC & TELEMETRIA)
    // ==========================================================================
    function initWebSocket() {
        if (!STATE.currentUser) return;

        try {
            STATE.ws = new WebSocket(`${CONFIG.WS_URL}?username=${encodeURIComponent(STATE.currentUser)}`);

            STATE.ws.onopen = () => {
                updateConnectionState(true);
                startPingMonitor();
            };

            STATE.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (e) {
                    console.error('[WS Parse Error]:', e);
                }
            };

            STATE.ws.onclose = () => {
                updateConnectionState(false);
                stopPingMonitor();
                // Tenta reconexão automática após 5s
                setTimeout(initWebSocket, 5000);
            };

            STATE.ws.onerror = (err) => {
                console.error('[WS Error]:', err);
                updateConnectionState(false);
            };
        } catch (e) {
            console.error('[WS Exception]:', e);
            updateConnectionState(false);
        }
    }

    function handleWebSocketMessage(data) {
        switch (data.type) {
            case 'PONG':
                const latency = Date.now() - data.timestamp;
                STATE.pingLatency = latency;
                DOM.pingValue.textContent = `${latency} ms`;
                break;

            case 'FRIEND_STATUS_CHANGE':
                // Atualiza o status em tempo real na lista local
                const friend = STATE.friends.find(f => f.username === data.username);
                if (friend) {
                    friend.status = data.status;
                    renderData();
                }
                break;

            case 'FRIEND_REQUEST_RECEIVED':
                showToast(`Nova solicitação de amizade de ${data.from}`, 'info');
                loadDataFromApi();
                break;

            case 'FRIEND_REQUEST_ACCEPTED':
                showToast(`${data.by} aceitou seu pedido de amizade!`, 'info');
                loadDataFromApi();
                break;

            default:
                break;
        }
    }

    function startPingMonitor() {
        stopPingMonitor();
        STATE.pingTimer = setInterval(() => {
            if (STATE.ws && STATE.ws.readyState === WebSocket.OPEN) {
                STATE.ws.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
            }
        }, CONFIG.PING_INTERVAL);
    }

    function stopPingMonitor() {
        if (STATE.pingTimer) clearInterval(STATE.pingTimer);
        DOM.pingValue.textContent = '-- ms';
    }

    function updateConnectionState(isConnected) {
        if (isConnected) {
            DOM.connectionStatus.className = 'telemetry-item connected';
            DOM.connectionText.textContent = 'Conectado';
        } else {
            DOM.connectionStatus.className = 'telemetry-item disconnected';
            DOM.connectionText.textContent = 'Desconectado';
        }
    }

    // ==========================================================================
    // DADOS & RENDERIZAÇÃO DE UI
    // ==========================================================================
    async function loadDataFromApi() {
        if (!STATE.currentUser) return;

        try {
            // Busca simultânea de Amigos e Solicitações Pendentes
            const [friendsData, requestsData] = await Promise.all([
                ApiClient.getFriendsList().catch(() => []),
                ApiClient.getPendingRequests().catch(() => [])
            ]);

            STATE.friends = Array.isArray(friendsData) ? friendsData : [];
            STATE.requests = Array.isArray(requestsData) ? requestsData : [];

            updateBadges();
            renderData();
        } catch (error) {
            showToast('Erro ao sincronizar dados com o servidor', 'error');
        }
    }

    function updateBadges() {
        const onlineCount = STATE.friends.filter(f => f.status && f.status !== 'offline').length;
        DOM.badgeOnline.textContent = onlineCount;
        DOM.badgeAll.textContent = STATE.friends.length;
        DOM.badgeRequests.textContent = STATE.requests.length;
    }

    function renderData() {
        // Se a aba ativa for 'add', oculta a lista de amigos e exibe o formulário
        if (STATE.activeTab === 'add') {
            DOM.friendsContainer.classList.add('hidden');
            DOM.addFriendSection.classList.remove('hidden');
            return;
        } else {
            DOM.friendsContainer.classList.remove('hidden');
            DOM.addFriendSection.classList.add('hidden');
        }

        DOM.friendsContainer.innerHTML = '';

        if (STATE.activeTab === 'requests') {
            renderRequestsList();
            return;
        }

        // Filtragem por Aba (Online vs Todos) e Campo de Busca
        let filtered = STATE.friends.filter(friend => {
            const matchesTab = STATE.activeTab === 'online' ? (friend.status && friend.status !== 'offline') : true;
            const matchesSearch = friend.username.toLowerCase().includes(STATE.searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });

        if (filtered.length === 0) {
            renderEmptyState('Nenhum amigo encontrado', 'fa-users-slash');
            return;
        }

        filtered.forEach(friend => {
            const card = document.createElement('div');
            card.className = 'friend-card';
            
            const initial = friend.username.charAt(0).toUpperCase();
            const statusClass = friend.status || 'offline';

            card.innerHTML = `
                <div class="friend-info-group">
                    <div class="avatar-container">
                        <div class="user-avatar">${initial}</div>
                        <span class="status-dot ${statusClass}"></span>
                    </div>
                    <div>
                        <div class="user-name">${escapeHtml(friend.username)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;">${statusClass}</div>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="icon-btn remove-btn" data-username="${friend.username}" title="Remover Amigo">
                        <i class="fa-solid fa-user-xmark"></i>
                    </button>
                </div>
            `;

            card.querySelector('.remove-btn').addEventListener('click', () => handleRemoveFriend(friend.username));
            DOM.friendsContainer.appendChild(card);
        });
    }

    function renderRequestsList() {
        let filteredRequests = STATE.requests.filter(req => 
            req.username.toLowerCase().includes(STATE.searchQuery.toLowerCase())
        );

        if (filteredRequests.length === 0) {
            renderEmptyState('Nenhuma solicitação pendente', 'fa-inbox');
            return;
        }

        filteredRequests.forEach(req => {
            const card = document.createElement('div');
            card.className = 'friend-card';
            const initial = req.username.charAt(0).toUpperCase();

            card.innerHTML = `
                <div class="friend-info-group">
                    <div class="user-avatar">${initial}</div>
                    <div>
                        <div class="user-name">${escapeHtml(req.username)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Solicitação de amizade</div>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="icon-btn accept" data-username="${req.username}" title="Aceitar">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="icon-btn reject" data-username="${req.username}" title="Recusar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;

            card.querySelector('.accept').addEventListener('click', () => handleAcceptRequest(req.username));
            card.querySelector('.reject').addEventListener('click', () => handleRejectRequest(req.username));
            DOM.friendsContainer.appendChild(card);
        });
    }

    function renderEmptyState(message, iconClass) {
        DOM.friendsContainer.innerHTML = `
            <div class="state-container">
                <i class="fa-solid ${iconClass}"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // ==========================================================================
    // ACOES DE USUARIO & EVENT HANDLERS
    // ==========================================================================
    async function handleAddFriend(username) {
        if (!username.trim()) return;
        try {
            await ApiClient.sendFriendRequest(username.trim());
            showToast(`Solicitação enviada para ${username}!`, 'info');
            closeModal();
            DOM.targetUsernameInput.value = '';
            loadDataFromApi();
        } catch (error) {
            showToast(error.message || 'Erro ao enviar solicitação', 'error');
        }
    }

    async function handleAcceptRequest(username) {
        try {
            await ApiClient.acceptFriendRequest(username);
            showToast(`Você agora é amigo de ${username}!`, 'info');
            loadDataFromApi();
        } catch (error) {
            showToast('Erro ao aceitar solicitação', 'error');
        }
    }

    async function handleRejectRequest(username) {
        try {
            await ApiClient.rejectFriendRequest(username);
            showToast(`Solicitação de ${username} recusada.`, 'info');
            loadDataFromApi();
        } catch (error) {
            showToast('Erro ao recusar solicitação', 'error');
        }
    }

    async function handleRemoveFriend(username) {
        if (!confirm(`Deseja realmente remover ${username} da sua lista de amigos?`)) return;
        try {
            await ApiClient.removeFriend(username);
            showToast(`${username} foi removido.`, 'info');
            loadDataFromApi();
        } catch (error) {
            showToast('Erro ao remover amigo', 'error');
        }
    }

    function ensureUserIdentity() {
        if (!STATE.currentUser) {
            const username = prompt('Digite seu nome de usuário no Node.GG:');
            if (username && username.trim()) {
                STATE.currentUser = username.trim();
                localStorage.setItem('node_gg_username', STATE.currentUser);
            } else {
                STATE.currentUser = 'Guest_' + Math.floor(Math.random() * 1000);
            }
        }

        DOM.userDisplayName.textContent = STATE.currentUser;
        DOM.userAvatar.textContent = STATE.currentUser.charAt(0).toUpperCase();
    }

    // ==========================================================================
    // EVENT LISTENERS DE INTERFACE
    // ==========================================================================
    function setupEventListeners() {
        // Navegação por Abas
        DOM.navItems.forEach(item => {
            item.addEventListener('click', () => {
                DOM.navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                STATE.activeTab = item.dataset.tab;
                
                const titles = {
                    online: 'Amigos Online',
                    all: 'Todos os Amigos',
                    requests: 'Solicitações de Amizade',
                    add: 'Adicionar Amigo'
                };
                DOM.pageTitle.textContent = titles[STATE.activeTab] || 'Dashboard';
                
                renderData();
                closeSidebarMobile();
            });
        });

        // Alteração de Status
        DOM.userStatusSelect.addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            STATE.userStatus = newStatus;
            DOM.userStatusDot.className = `status-dot ${newStatus}`;
            
            try {
                await ApiClient.updateStatus(newStatus);
            } catch (err) {
                console.error('Falha ao atualizar status:', err);
            }
        });

        // Troca de Nome de Usuário
        DOM.changeUsernameBtn.addEventListener('click', () => {
            const newName = prompt('Novo nome de usuário:', STATE.currentUser);
            if (newName && newName.trim() && newName !== STATE.currentUser) {
                STATE.currentUser = newName.trim();
                localStorage.setItem('node_gg_username', STATE.currentUser);
                ensureUserIdentity();
                if (STATE.ws) STATE.ws.close();
                initWebSocket();
                loadDataFromApi();
            }
        });

        // Busca
        DOM.searchInput.addEventListener('input', (e) => {
            STATE.searchQuery = e.target.value;
            DOM.clearSearchBtn.classList.toggle('hidden', !STATE.searchQuery);
            renderData();
        });

        DOM.clearSearchBtn.addEventListener('click', () => {
            DOM.searchInput.value = '';
            STATE.searchQuery = '';
            DOM.clearSearchBtn.classList.add('hidden');
            renderData();
        });

        // Formulários de Adicionar Amigo
        DOM.addFriendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddFriend(DOM.targetUsernameInput.value);
        });

        DOM.modalAddFriendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddFriend(DOM.modalUsernameInput.value);
        });

        // Modal Handlers
        DOM.quickAddBtn.addEventListener('click', openModal);
        DOM.closeModalBtn.addEventListener('click', closeModal);
        DOM.cancelModalBtn.addEventListener('click', closeModal);
        DOM.modal.addEventListener('click', (e) => { if (e.target === DOM.modal) closeModal(); });

        // Mobile Drawer
        DOM.openSidebarBtn.addEventListener('click', () => {
            DOM.sidebar.classList.add('open');
            DOM.mobileOverlay.classList.add('active');
        });

        DOM.closeSidebarBtn.addEventListener('click', closeSidebarMobile);
        DOM.mobileOverlay.addEventListener('click', closeSidebarMobile);
    }

    function openModal() {
        DOM.modal.classList.remove('hidden');
        DOM.modalUsernameInput.value = '';
        DOM.modalUsernameInput.focus();
    }

    function closeModal() {
        DOM.modal.classList.add('hidden');
    }

    function closeSidebarMobile() {
        DOM.sidebar.classList.remove('open');
        DOM.mobileOverlay.classList.remove('active');
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        DOM.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        })[m]);
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================
    function init() {
        ensureUserIdentity();
        setupEventListeners();
        loadDataFromApi();
        initWebSocket();
    }

    init();
});
