document.addEventListener('DOMContentLoaded', () => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const CONFIG = {
        SERVER_URL: 'https://node-server-b8j3.onrender.com',

        PING_INTERVAL: 10000,

        RECONNECT_DELAY: 5000,

        REQUEST_TIMEOUT: 15000
    };

    CONFIG.API_BASE =
        `${CONFIG.SERVER_URL}/api`;

    CONFIG.WS_URL =
        CONFIG.SERVER_URL.replace(
            /^https:\/\//,
            'wss://'
        ).replace(
            /^http:\/\//,
            'ws://'
        );


    /* =====================================================
       STATE
    ===================================================== */

    const STATE = {
        currentUser: null,
        userData: null,

        userStatus: 'online',

        activeTab: 'online',

        searchQuery: '',

        friends: [],

        requests: [],

        ws: null,

        wsAuthenticated: false,

        pingLatency: 0,

        pingTimer: null,

        reconnectTimer: null,

        destroyed: false
    };


    /* =====================================================
       DOM
    ===================================================== */

    const DOM = {
        userDisplayName:
            document.getElementById(
                'user-display-name'
            ),

        userAvatar:
            document.getElementById(
                'user-avatar'
            ),

        userStatusDot:
            document.getElementById(
                'user-status-dot'
            ),

        userStatusSelect:
            document.getElementById(
                'user-status-select'
            ),

        changeUsernameBtn:
            document.getElementById(
                'change-username-btn'
            ),

        sidebar:
            document.getElementById(
                'sidebar'
            ),

        mobileOverlay:
            document.getElementById(
                'mobile-overlay'
            ),

        openSidebarBtn:
            document.getElementById(
                'open-sidebar-btn'
            ),

        closeSidebarBtn:
            document.getElementById(
                'close-sidebar-btn'
            ),

        connectionStatus:
            document.getElementById(
                'connection-status'
            ),

        connectionText:
            document.getElementById(
                'connection-text'
            ),

        pingValue:
            document.getElementById(
                'ping-value'
            ),

        pageTitle:
            document.getElementById(
                'page-title'
            ),

        searchInput:
            document.getElementById(
                'search-input'
            ),

        clearSearchBtn:
            document.getElementById(
                'clear-search-btn'
            ),

        quickAddBtn:
            document.getElementById(
                'quick-add-btn'
            ),

        badgeOnline:
            document.getElementById(
                'badge-online'
            ),

        badgeAll:
            document.getElementById(
                'badge-all'
            ),

        badgeRequests:
            document.getElementById(
                'badge-requests'
            ),

        friendsContainer:
            document.getElementById(
                'friends-list-container'
            ),

        addFriendSection:
            document.getElementById(
                'add-friend-section'
            ),

        addFriendForm:
            document.getElementById(
                'add-friend-form'
            ),

        targetUsernameInput:
            document.getElementById(
                'target-username-input'
            ),

        modal:
            document.getElementById(
                'add-friend-modal'
            ),

        closeModalBtn:
            document.getElementById(
                'close-modal-btn'
            ),

        cancelModalBtn:
            document.getElementById(
                'cancel-modal-btn'
            ),

        modalAddFriendForm:
            document.getElementById(
                'modal-add-friend-form'
            ),

        modalUsernameInput:
            document.getElementById(
                'modal-username-input'
            ),

        toastContainer:
            document.getElementById(
                'toast-container'
            ),

        navItems:
            document.querySelectorAll(
                '.nav-item'
            ),

        /*
         * CHAT
         */
        chatPanel:
            document.getElementById(
                'dashboard-chat-panel'
            ),

        closeChatBtn:
            document.getElementById(
                'close-chat-btn'
            )
    };


    /* =====================================================
       STORAGE
    ===================================================== */

    function getSessionToken() {
        return localStorage.getItem(
            'sessionToken'
        );
    }


    function getStoredUser() {
        const raw =
            localStorage.getItem(
                'user_data'
            );

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);

        } catch {
            localStorage.removeItem(
                'user_data'
            );

            return null;
        }
    }


    function clearSession() {
        localStorage.removeItem(
            'sessionToken'
        );

        localStorage.removeItem(
            'user_data'
        );

        localStorage.removeItem(
            'node_gg_username'
        );
    }


    /* =====================================================
       AUTH
    ===================================================== */

    function loadStoredSession() {
        const token =
            getSessionToken();

        const user =
            getStoredUser();

        if (
            !token ||
            !user ||
            !user.username
        ) {
            return false;
        }

        STATE.currentUser =
            user.username;

        STATE.userData =
            user;

        return true;
    }


    function redirectToLogin() {
        if (STATE.destroyed) {
            return;
        }

        STATE.destroyed = true;

        if (STATE.ws) {
            try {
                STATE.ws.close();
            } catch {}
        }

        clearSession();

        window.location.href =
            '../../login/index.html';
    }


    /* =====================================================
       API CLIENT
    ===================================================== */

    const ApiClient = {

        async request(
            endpoint,
            options = {}
        ) {
            const token =
                getSessionToken();

            if (!token) {
                redirectToLogin();

                throw new Error(
                    'Sessão não encontrada.'
                );
            }

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () => controller.abort(),
                    CONFIG.REQUEST_TIMEOUT
                );

            const headers = {
                'Content-Type':
                    'application/json',

                'Authorization':
                    `Bearer ${token}`,

                ...(options.headers || {})
            };

            try {
                const response =
                    await fetch(
                        `${CONFIG.API_BASE}${endpoint}`,
                        {
                            ...options,

                            headers,

                            signal:
                                controller.signal
                        }
                    );

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    redirectToLogin();

                    throw new Error(
                        'Sessão expirada.'
                    );
                }

                const data =
                    await response
                        .json()
                        .catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        data.message ||
                        `Erro HTTP ${response.status}`
                    );
                }

                return data;

            } catch (error) {

                if (
                    error.name ===
                    'AbortError'
                ) {
                    throw new Error(
                        'O servidor demorou para responder.'
                    );
                }

                throw error;

            } finally {
                clearTimeout(timeout);
            }
        },


        getFriendsList() {
            return this.request(
                '/friends/list'
            );
        },


        getPendingRequests() {
            return this.request(
                '/friends/requests'
            );
        },


        sendFriendRequest(
            targetUsername
        ) {
            return this.request(
                '/friends/send-request',
                {
                    method: 'POST',

                    body:
                        JSON.stringify({
                            targetUsername
                        })
                }
            );
        },


        acceptFriendRequest(
            requesterUsername
        ) {
            return this.request(
                '/friends/accept-request',
                {
                    method: 'POST',

                    body:
                        JSON.stringify({
                            requesterUsername
                        })
                }
            );
        },


        rejectFriendRequest(
            requesterUsername
        ) {
            return this.request(
                '/friends/decline-request',
                {
                    method: 'POST',

                    body:
                        JSON.stringify({
                            requesterUsername
                        })
                }
            );
        },


        removeFriend(
            friendUsername
        ) {
            return this.request(
                '/friends/remove',
                {
                    method: 'POST',

                    body:
                        JSON.stringify({
                            friendUsername
                        })
                }
            );
        },


        getOnlineUsers() {
            return this.request(
                '/friends/online'
            );
        }
    };


    /* =====================================================
       USER UI
    ===================================================== */

    function updateUserInterface() {
        if (!STATE.userData) {
            return;
        }

        const displayName =
            STATE.userData.displayName ||
            STATE.userData.username ||
            'Usuário';

        const username =
            STATE.userData.username ||
            '';

        if (DOM.userDisplayName) {
            DOM.userDisplayName.textContent =
                displayName;
        }

        if (DOM.userAvatar) {
            const avatar =
                STATE.userData.avatar;

            if (avatar) {
                DOM.userAvatar.textContent =
                    '';

                DOM.userAvatar.style.backgroundImage =
                    `url("${avatar}")`;

                DOM.userAvatar.style.backgroundSize =
                    'cover';

                DOM.userAvatar.style.backgroundPosition =
                    'center';

            } else {
                DOM.userAvatar.textContent =
                    (
                        displayName ||
                        username ||
                        '?'
                    )
                        .charAt(0)
                        .toUpperCase();

                DOM.userAvatar.style.backgroundImage =
                    '';
            }
        }
    }


    /* =====================================================
       CHAT
    ===================================================== */

    function openChatWithFriend(
        username,
        displayName = ''
    ) {
        const cleanUsername =
            String(
                username || ''
            ).trim();

        if (!cleanUsername) {
            return;
        }

        /*
         * Abre visualmente o painel.
         */
        if (DOM.chatPanel) {
            DOM.chatPanel.classList.add(
                'open'
            );
        }

        /*
         * O chat.js escuta este evento e
         * abre a conversa correspondente.
         */
        window.dispatchEvent(
            new CustomEvent(
                'nodegg:open-chat',
                {
                    detail: {
                        username:
                            cleanUsername,

                        displayName:
                            String(
                                displayName ||
                                cleanUsername
                            )
                    }
                }
            )
        );
    }


    function closeDashboardChat() {
        if (DOM.chatPanel) {
            DOM.chatPanel.classList.remove(
                'open'
            );
        }

        /*
         * Informa ao chat.js que a conversa
         * deve ser encerrada.
         */
        window.dispatchEvent(
            new CustomEvent(
                'nodegg:close-chat'
            )
        );
    }


    /* =====================================================
       WEBSOCKET
    ===================================================== */

    function closeWebSocket() {
        if (STATE.ws) {
            try {
                STATE.ws.onclose = null;
                STATE.ws.close();
            } catch {}

            STATE.ws = null;
        }

        STATE.wsAuthenticated =
            false;

        stopPingMonitor();
    }


    function scheduleWebSocketReconnect() {
        if (
            STATE.destroyed ||
            STATE.reconnectTimer
        ) {
            return;
        }

        STATE.reconnectTimer =
            setTimeout(
                () => {

                    STATE.reconnectTimer =
                        null;

                    initWebSocket();

                },
                CONFIG.RECONNECT_DELAY
            );
    }


    function initWebSocket() {
        if (
            STATE.destroyed ||
            !STATE.currentUser ||
            !getSessionToken()
        ) {
            return;
        }

        if (
            STATE.ws &&
            (
                STATE.ws.readyState ===
                WebSocket.OPEN ||

                STATE.ws.readyState ===
                WebSocket.CONNECTING
            )
        ) {
            return;
        }

        closeWebSocket();

        updateConnectionState(
            false,
            'Conectando...'
        );

        try {
            const ws =
                new WebSocket(
                    CONFIG.WS_URL
                );

            STATE.ws = ws;

            ws.onopen = () => {

                if (
                    STATE.ws !== ws
                ) {
                    return;
                }

                const token =
                    getSessionToken();

                if (!token) {
                    redirectToLogin();
                    return;
                }

                ws.send(
                    JSON.stringify({
                        type:
                            'reconnect_session',

                        sessionToken:
                            token
                    })
                );
            };


            ws.onmessage = event => {

                if (
                    STATE.ws !== ws
                ) {
                    return;
                }

                handleWebSocketMessage(
                    event.data
                );
            };


            ws.onerror = () => {

                if (
                    STATE.ws === ws
                ) {
                    updateConnectionState(
                        false,
                        'Erro de conexão'
                    );
                }
            };


            ws.onclose = () => {

                if (
                    STATE.ws === ws
                ) {
                    STATE.ws =
                        null;

                    STATE.wsAuthenticated =
                        false;

                    stopPingMonitor();

                    updateConnectionState(
                        false,
                        'Desconectado'
                    );

                    scheduleWebSocketReconnect();
                }
            };

        } catch (error) {

            console.error(
                '[WS] Erro:',
                error
            );

            updateConnectionState(
                false,
                'Desconectado'
            );

            scheduleWebSocketReconnect();
        }
    }


    /* =====================================================
       WEBSOCKET EVENTS
    ===================================================== */

    function handleWebSocketMessage(
        rawData
    ) {
        let data;

        try {
            data =
                JSON.parse(rawData);

        } catch {
            return;
        }

        const type =
            String(
                data.type || ''
            ).toLowerCase();

        switch (type) {

            case 'auth_success':

                handleSocketAuthSuccess(
                    data
                );

                break;


            case 'auth_error':

                handleSocketAuthError(
                    data
                );

                break;


            case 'maintenance_active':

                showToast(
                    data.message ||
                    'Servidor em manutenção.',
                    'error'
                );

                break;


            case 'pong':

                handlePong(data);

                break;


            case 'friend_status_change':

                handleFriendStatusChange(
                    data
                );

                break;


            case 'friend_request_received':

                showToast(
                    `Nova solicitação de amizade de ${escapeHtml(data.from || 'usuário')}.`,
                    'info'
                );

                loadDataFromApi();

                break;


            case 'friend_request_accepted':

                showToast(
                    `${escapeHtml(data.from || 'Usuário')} aceitou seu pedido de amizade!`,
                    'info'
                );

                loadDataFromApi();

                break;


            default:
                break;
        }
    }


    function handleSocketAuthSuccess(
        data
    ) {
        STATE.wsAuthenticated =
            true;

        if (data.user) {

            STATE.userData =
                data.user;

            STATE.currentUser =
                data.user.username;

            localStorage.setItem(
                'user_data',

                JSON.stringify(
                    data.user
                )
            );
        }

        if (data.sessionToken) {
            localStorage.setItem(
                'sessionToken',
                data.sessionToken
            );
        }

        updateUserInterface();

        updateConnectionState(
            true,
            'Conectado'
        );

        startPingMonitor();

        loadDataFromApi();
    }


    function handleSocketAuthError(
        data
    ) {
        STATE.wsAuthenticated =
            false;

        stopPingMonitor();

        const message =
            data.message ||
            'Sessão inválida.';

        console.warn(
            '[WS AUTH]',
            message
        );

        if (
            message
                .toLowerCase()
                .includes('token') ||

            message
                .toLowerCase()
                .includes('sessão')
        ) {
            redirectToLogin();

            return;
        }

        showToast(
            message,
            'error'
        );
    }


    function handlePong(data) {
        if (
            !data ||
            !data.timestamp
        ) {
            return;
        }

        const latency =
            Math.max(
                0,

                Date.now() -
                Number(
                    data.timestamp
                )
            );

        STATE.pingLatency =
            latency;

        if (DOM.pingValue) {
            DOM.pingValue.textContent =
                `${latency} ms`;
        }
    }


    function handleFriendStatusChange(
        data
    ) {
        if (!data.username) {
            return;
        }

        const friend =
            STATE.friends.find(
                item =>
                    item.username ===
                    data.username
            );

        if (!friend) {
            return;
        }

        friend.status =
            data.status ||
            'offline';

        updateBadges();

        renderData();
    }


    /* =====================================================
       PING
    ===================================================== */

    function startPingMonitor() {
        stopPingMonitor();

        if (DOM.pingValue) {
            DOM.pingValue.textContent =
                '-- ms';
        }

        STATE.pingTimer =
            setInterval(
                () => {

                    if (
                        STATE.ws &&

                        STATE.ws.readyState ===
                        WebSocket.OPEN &&

                        STATE.wsAuthenticated
                    ) {
                        STATE.ws.send(
                            JSON.stringify({
                                type: 'ping',

                                timestamp:
                                    Date.now()
                            })
                        );
                    }

                },
                CONFIG.PING_INTERVAL
            );
    }


    function stopPingMonitor() {
        if (STATE.pingTimer) {

            clearInterval(
                STATE.pingTimer
            );

            STATE.pingTimer =
                null;
        }

        if (DOM.pingValue) {
            DOM.pingValue.textContent =
                '-- ms';
        }
    }


    /* =====================================================
       CONNECTION UI
    ===================================================== */

    function updateConnectionState(
        connected,
        customText = null
    ) {
        if (!DOM.connectionStatus) {
            return;
        }

        DOM.connectionStatus.className =
            connected
                ? 'telemetry-item connected'
                : 'telemetry-item disconnected';

        if (DOM.connectionText) {
            DOM.connectionText.textContent =
                customText ||
                (
                    connected
                        ? 'Conectado'
                        : 'Desconectado'
                );
        }
    }


    /* =====================================================
       API DATA
    ===================================================== */

    async function loadDataFromApi() {
        if (
            !STATE.currentUser
        ) {
            return;
        }

        try {

            const [
                friendsData,
                requestsData
            ] = await Promise.all([
                ApiClient
                    .getFriendsList(),

                ApiClient
                    .getPendingRequests()
            ]);

            STATE.friends =
                Array.isArray(
                    friendsData.friends
                )
                    ? friendsData.friends
                    : [];

            STATE.requests =
                Array.isArray(
                    requestsData.requests
                )
                    ? requestsData.requests
                    : [];

            updateBadges();

            renderData();

        } catch (error) {

            console.error(
                '[DATA]',
                error
            );

            if (
                !error.message
                    .toLowerCase()
                    .includes('sessão')
            ) {
                showToast(
                    error.message ||
                    'Erro ao sincronizar dados.',
                    'error'
                );
            }
        }
    }


    /* =====================================================
       BADGES
    ===================================================== */

    function updateBadges() {

        const onlineCount =
            STATE.friends.filter(
                friend =>
                    friend.status &&
                    friend.status !==
                    'offline'
            ).length;

        if (DOM.badgeOnline) {
            DOM.badgeOnline.textContent =
                onlineCount;
        }

        if (DOM.badgeAll) {
            DOM.badgeAll.textContent =
                STATE.friends.length;
        }

        if (DOM.badgeRequests) {
            DOM.badgeRequests.textContent =
                STATE.requests.length;
        }
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderData() {

        if (
            !DOM.friendsContainer
        ) {
            return;
        }

        if (
            STATE.activeTab ===
            'add'
        ) {

            DOM.friendsContainer.classList
                .add('hidden');

            if (DOM.addFriendSection) {
                DOM.addFriendSection.classList
                    .remove('hidden');
            }

            return;
        }

        DOM.friendsContainer.classList
            .remove('hidden');

        if (DOM.addFriendSection) {
            DOM.addFriendSection.classList
                .add('hidden');
        }

        DOM.friendsContainer.innerHTML =
            '';

        if (
            STATE.activeTab ===
            'requests'
        ) {
            renderRequestsList();

            return;
        }

        const query =
            STATE.searchQuery
                .toLowerCase()
                .trim();

        const filtered =
            STATE.friends.filter(
                friend => {

                    const status =
                        friend.status ||
                        'offline';

                    const matchesTab =
                        STATE.activeTab ===
                        'online'
                            ? status !==
                                'offline'
                            : true;

                    const username =
                        String(
                            friend.username ||
                            ''
                        );

                    const matchesSearch =
                        username
                            .toLowerCase()
                            .includes(
                                query
                            );

                    return (
                        matchesTab &&
                        matchesSearch
                    );
                }
            );

        if (
            filtered.length === 0
        ) {

            renderEmptyState(
                STATE.activeTab ===
                    'online'

                    ? 'Nenhum amigo online'

                    : 'Nenhum amigo encontrado',

                'fa-users-slash'
            );

            return;
        }

        filtered.forEach(
            friend =>
                renderFriendCard(
                    friend
                )
        );
    }


    function renderFriendCard(
        friend
    ) {
        const username =
            String(
                friend.username ||
                ''
            );

        const status =
            friend.status ||
            'offline';

        const initial =
            username
                .charAt(0)
                .toUpperCase();

        const card =
            document.createElement(
                'div'
            );

        card.className =
            'friend-card';

        card.innerHTML = `
            <div class="friend-info-group">

                <div class="avatar-container">

                    <div class="user-avatar">
                        ${escapeHtml(initial)}
                    </div>

                    <span
                        class="status-dot ${escapeHtml(status)}"
                    ></span>

                </div>

                <div>

                    <div class="user-name">
                        ${escapeHtml(username)}
                    </div>

                    <div style="
                        font-size: 0.75rem;
                        color: var(--text-muted);
                        text-transform: capitalize;
                    ">
                        ${escapeHtml(status)}
                    </div>

                </div>

            </div>

            <div class="friend-actions">

                <button
                    class="icon-btn remove-btn"
                    type="button"
                    title="Remover Amigo"
                >
                    <i class="fa-solid fa-user-xmark"></i>
                </button>

            </div>
        `;


        /* =================================================
           REMOVE FRIEND BUTTON
           ================================================= */

        const removeBtn =
            card.querySelector(
                '.remove-btn'
            );

        if (removeBtn) {

            removeBtn.addEventListener(
                'click',
                event => {

                    /*
                     * Impede que o clique no X também
                     * abra a conversa.
                     */
                    event.stopPropagation();

                    handleRemoveFriend(
                        username
                    );
                }
            );
        }


        /* =================================================
           OPEN CHAT
           ================================================= */

        /*
         * O card inteiro funciona como botão de chat,
         * mas os controles internos continuam tendo
         * comportamento próprio.
         */
        card.setAttribute(
            'role',
            'button'
        );

        card.setAttribute(
            'tabindex',
            '0'
        );


        card.addEventListener(
            'click',
            event => {

                /*
                 * Não abre o chat quando o usuário clicou
                 * em algum controle do card.
                 */
                if (
                    event.target.closest(
                        'button, a, input, select, textarea'
                    )
                ) {
                    return;
                }

                openChatWithFriend(
                    username,
                    username
                );
            }
        );


        /*
         * Permite abrir com Enter ou espaço quando
         * o card estiver focado por teclado.
         */
        card.addEventListener(
            'keydown',
            event => {

                if (
                    event.key !== 'Enter' &&
                    event.key !== ' '
                ) {
                    return;
                }

                event.preventDefault();

                openChatWithFriend(
                    username,
                    username
                );
            }
        );


        DOM.friendsContainer
            .appendChild(card);
    }


    function renderRequestsList() {

        const query =
            STATE.searchQuery
                .toLowerCase()
                .trim();

        const filtered =
            STATE.requests.filter(
                request =>
                    String(
                        request.username ||
                        ''
                    )
                        .toLowerCase()
                        .includes(query)
            );

        if (
            filtered.length === 0
        ) {

            renderEmptyState(
                'Nenhuma solicitação pendente',
                'fa-inbox'
            );

            return;
        }

        filtered.forEach(
            request => {

                const username =
                    String(
                        request.username ||
                        ''
                    );

                const initial =
                    username
                        .charAt(0)
                        .toUpperCase();

                const card =
                    document.createElement(
                        'div'
                    );

                card.className =
                    'friend-card';

                card.innerHTML = `
                    <div class="friend-info-group">

                        <div class="user-avatar">
                            ${escapeHtml(initial)}
                        </div>

                        <div>

                            <div class="user-name">
                                ${escapeHtml(username)}
                            </div>

                            <div style="
                                font-size: 0.75rem;
                                color: var(--text-muted);
                            ">
                                Solicitação de amizade
                            </div>

                        </div>

                    </div>

                    <div class="friend-actions">

                        <button
                            class="icon-btn accept"
                            type="button"
                            title="Aceitar"
                        >
                            <i class="fa-solid fa-check"></i>
                        </button>

                        <button
                            class="icon-btn reject"
                            type="button"
                            title="Recusar"
                        >
                            <i class="fa-solid fa-xmark"></i>
                        </button>

                    </div>
                `;

                const acceptBtn =
                    card.querySelector(
                        '.accept'
                    );

                const rejectBtn =
                    card.querySelector(
                        '.reject'
                    );

                if (acceptBtn) {
                    acceptBtn.addEventListener(
                        'click',
                        event => {

                            event.stopPropagation();

                            handleAcceptRequest(
                                username
                            );
                        }
                    );
                }

                if (rejectBtn) {
                    rejectBtn.addEventListener(
                        'click',
                        event => {

                            event.stopPropagation();

                            handleRejectRequest(
                                username
                            );
                        }
                    );
                }

                DOM.friendsContainer
                    .appendChild(card);
            }
        );
    }


    function renderEmptyState(
        message,
        iconClass
    ) {
        DOM.friendsContainer.innerHTML = `
            <div class="state-container">

                <i
                    class="fa-solid ${escapeHtml(iconClass)}"
                ></i>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>
        `;
    }


    /* =====================================================
       FRIEND ACTIONS
    ===================================================== */

    async function handleAddFriend(
        username
    ) {
        const cleanUsername =
            String(
                username || ''
            )
                .trim()
                .toLowerCase();

        if (!cleanUsername) {
            showToast(
                'Digite um nome de usuário.',
                'error'
            );

            return;
        }

        if (
            cleanUsername ===
            String(
                STATE.currentUser
            ).toLowerCase()
        ) {
            showToast(
                'Você não pode adicionar a si mesmo.',
                'error'
            );

            return;
        }

        try {

            await ApiClient
                .sendFriendRequest(
                    cleanUsername
                );

            showToast(
                `Solicitação enviada para ${cleanUsername}!`,
                'info'
            );

            closeModal();

            if (
                DOM.targetUsernameInput
            ) {
                DOM.targetUsernameInput.value =
                    '';
            }

            if (
                DOM.modalUsernameInput
            ) {
                DOM.modalUsernameInput.value =
                    '';
            }

            loadDataFromApi();

        } catch (error) {

            showToast(
                error.message ||
                'Erro ao enviar solicitação.',
                'error'
            );
        }
    }


    async function handleAcceptRequest(
        username
    ) {
        try {

            await ApiClient
                .acceptFriendRequest(
                    username
                );

            showToast(
                `Você agora é amigo de ${username}!`,
                'info'
            );

            await loadDataFromApi();

        } catch (error) {

            showToast(
                error.message ||
                'Erro ao aceitar solicitação.',
                'error'
            );
        }
    }


    async function handleRejectRequest(
        username
    ) {
        try {

            await ApiClient
                .rejectFriendRequest(
                    username
                );

            showToast(
                `Solicitação de ${username} recusada.`,
                'info'
            );

            await loadDataFromApi();

        } catch (error) {

            showToast(
                error.message ||
                'Erro ao recusar solicitação.',
                'error'
            );
        }
    }


    async function handleRemoveFriend(
        username
    ) {
        if (
            !confirm(
                `Deseja realmente remover ${username} da sua lista de amigos?`
            )
        ) {
            return;
        }

        try {

            await ApiClient
                .removeFriend(
                    username
                );

            showToast(
                `${username} foi removido.`,
                'info'
            );

            await loadDataFromApi();

        } catch (error) {

            showToast(
                error.message ||
                'Erro ao remover amigo.',
                'error'
            );
        }
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function updatePageTitle() {

        if (!DOM.pageTitle) {
            return;
        }

        const titles = {
            online:
                'Amigos Online',

            all:
                'Todos os Amigos',

            requests:
                'Solicitações de Amizade',

            add:
                'Adicionar Amigo'
        };

        DOM.pageTitle.textContent =
            titles[
                STATE.activeTab
            ] || 'Dashboard';
    }


    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    function setupEventListeners() {

        /* ================================================
           NAVIGATION
           ================================================ */

        DOM.navItems.forEach(
            item => {

                item.addEventListener(
                    'click',
                    () => {

                        DOM.navItems.forEach(
                            nav =>
                                nav.classList
                                    .remove(
                                        'active'
                                    )
                        );

                        item.classList
                            .add(
                                'active'
                            );

                        STATE.activeTab =
                            item.dataset.tab ||
                            'online';

                        updatePageTitle();

                        renderData();

                        closeSidebarMobile();
                    }
                );
            }
        );


        /* ================================================
           USER STATUS
           ================================================ */

        if (
            DOM.userStatusSelect
        ) {
            DOM.userStatusSelect
                .addEventListener(
                    'change',
                    e => {

                        const newStatus =
                            e.target.value ||
                            'online';

                        STATE.userStatus =
                            newStatus;

                        if (
                            DOM.userStatusDot
                        ) {
                            DOM.userStatusDot
                                .className =
                                `status-dot ${newStatus}`;
                        }

                        /*
                         * O servidor atual não possui
                         * endpoint REST de status.
                         *
                         * Portanto não fazemos chamada
                         * inexistente.
                         */
                    }
                );
        }


        /* ================================================
           USERNAME
           ================================================ */

        if (
            DOM.changeUsernameBtn
        ) {
            DOM.changeUsernameBtn
                .addEventListener(
                    'click',
                    () => {

                        showToast(
                            'O nome de usuário é definido pela conta. Use as configurações de perfil para alterá-lo.',
                            'info'
                        );
                    }
                );
        }


        /* ================================================
           SEARCH
           ================================================ */

        if (
            DOM.searchInput
        ) {
            DOM.searchInput
                .addEventListener(
                    'input',
                    e => {

                        STATE.searchQuery =
                            e.target.value;

                        if (
                            DOM.clearSearchBtn
                        ) {
                            DOM.clearSearchBtn
                                .classList
                                .toggle(
                                    'hidden',
                                    !STATE.searchQuery
                                );
                        }

                        renderData();
                    }
                );
        }


        if (
            DOM.clearSearchBtn
        ) {
            DOM.clearSearchBtn
                .addEventListener(
                    'click',
                    () => {

                        if (
                            DOM.searchInput
                        ) {
                            DOM.searchInput.value =
                                '';
                        }

                        STATE.searchQuery =
                            '';

                        DOM.clearSearchBtn
                            .classList
                            .add(
                                'hidden'
                            );

                        renderData();
                    }
                );
        }


        /* ================================================
           ADD FRIEND
           ================================================ */

        if (
            DOM.addFriendForm
        ) {
            DOM.addFriendForm
                .addEventListener(
                    'submit',
                    e => {

                        e.preventDefault();

                        handleAddFriend(
                            DOM.targetUsernameInput
                                ? DOM.targetUsernameInput.value
                                : ''
                        );
                    }
                );
        }


        if (
            DOM.modalAddFriendForm
        ) {
            DOM.modalAddFriendForm
                .addEventListener(
                    'submit',
                    e => {

                        e.preventDefault();

                        handleAddFriend(
                            DOM.modalUsernameInput
                                ? DOM.modalUsernameInput.value
                                : ''
                        );
                    }
                );
        }


        /* ================================================
           QUICK ADD
           ================================================ */

        if (
            DOM.quickAddBtn
        ) {
            DOM.quickAddBtn
                .addEventListener(
                    'click',
                    openModal
                );
        }


        /* ================================================
           MODAL
           ================================================ */

        if (
            DOM.closeModalBtn
        ) {
            DOM.closeModalBtn
                .addEventListener(
                    'click',
                    closeModal
                );
        }


        if (
            DOM.cancelModalBtn
        ) {
            DOM.cancelModalBtn
                .addEventListener(
                    'click',
                    closeModal
                );
        }


        if (
            DOM.modal
        ) {
            DOM.modal.addEventListener(
                'click',
                e => {

                    if (
                        e.target ===
                        DOM.modal
                    ) {
                        closeModal();
                    }
                }
            );
        }


        /* ================================================
           CHAT
           ================================================ */

        if (
            DOM.closeChatBtn
        ) {
            DOM.closeChatBtn
                .addEventListener(
                    'click',
                    closeDashboardChat
                );
        }


        /* ================================================
           MOBILE SIDEBAR
           ================================================ */

        if (
            DOM.openSidebarBtn
        ) {
            DOM.openSidebarBtn
                .addEventListener(
                    'click',
                    () => {

                        if (
                            DOM.sidebar
                        ) {
                            DOM.sidebar.classList
                                .add(
                                    'open'
                                );
                        }

                        if (
                            DOM.mobileOverlay
                        ) {
                            DOM.mobileOverlay.classList
                                .add(
                                    'active'
                                );
                        }
                    }
                );
        }


        if (
            DOM.closeSidebarBtn
        ) {
            DOM.closeSidebarBtn
                .addEventListener(
                    'click',
                    closeSidebarMobile
                );
        }


        if (
            DOM.mobileOverlay
        ) {
            DOM.mobileOverlay
                .addEventListener(
                    'click',
                    closeSidebarMobile
                );
        }
    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openModal() {

        if (!DOM.modal) {
            return;
        }

        DOM.modal.classList
            .remove('hidden');

        if (
            DOM.modalUsernameInput
        ) {
            DOM.modalUsernameInput.value =
                '';

            DOM.modalUsernameInput
                .focus();
        }
    }


    function closeModal() {

        if (!DOM.modal) {
            return;
        }

        DOM.modal.classList
            .add('hidden');
    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function closeSidebarMobile() {

        if (
            DOM.sidebar
        ) {
            DOM.sidebar.classList
                .remove('open');
        }

        if (
            DOM.mobileOverlay
        ) {
            DOM.mobileOverlay.classList
                .remove('active');
        }
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        type = 'info'
    ) {
        if (
            !DOM.toastContainer
        ) {
            return;
        }

        const toast =
            document.createElement(
                'div'
            );

        toast.className =
            `toast ${type}`;

        toast.textContent =
            message;

        DOM.toastContainer
            .appendChild(
                toast
            );

        setTimeout(
            () => {

                toast.style.opacity =
                    '0';

                setTimeout(
                    () => {
                        toast.remove();
                    },
                    300
                );

            },
            4000
        );
    }


    /* =====================================================
       SECURITY
    ===================================================== */

    function escapeHtml(value) {
        return String(
            value || ''
        ).replace(
            /[&<>"']/g,
            character => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            })[character]
        );
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {

        const validSession =
            loadStoredSession();

        if (!validSession) {
            redirectToLogin();

            return;
        }

        updateUserInterface();

        updatePageTitle();

        setupEventListeners();

        loadDataFromApi();

        initWebSocket();
    }


    /* =====================================================
       PAGE LIFECYCLE
    ===================================================== */

    window.addEventListener(
        'beforeunload',
        () => {

            STATE.destroyed =
                true;

            if (
                STATE.reconnectTimer
            ) {
                clearTimeout(
                    STATE.reconnectTimer
                );
            }

            stopPingMonitor();

            if (STATE.ws) {
                try {
                    STATE.ws.close();
                } catch {}
            }
        }
    );


    init();
});
