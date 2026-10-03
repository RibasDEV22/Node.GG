// pages/dashboard/chat/chat.js

(function () {
    'use strict';

    /* =====================================================
       CONFIG
    ===================================================== */

    const CHAT_SCRIPT = document.currentScript;

    const LOGIN_PATH = CHAT_SCRIPT
        ? new URL('../../login/index.html', CHAT_SCRIPT.src).href
        : '../../login/index.html';

    const CONFIG = {
        SERVER_URL:
            'https://node-server-b8j3.onrender.com',

        REQUEST_TIMEOUT:
            15000,

        POLLING_INTERVAL:
            3000,

        STORAGE_KEY:
            'nodegg.chat.state',

        LOGIN_PATH
    };

    CONFIG.API_BASE =
        `${CONFIG.SERVER_URL}/api`;


    /* =====================================================
       MODE
    ===================================================== */

    const embeddedMode =
        !!document.getElementById(
            'dashboard-chat-panel'
        );


    /* =====================================================
       STATE
    ===================================================== */

    const state = {
        currentUser: null,

        activeConversation: null,

        conversations: [],

        messages: [],

        initialized: false,

        destroyed: false,

        loadingConversations: false,

        loadingHistory: false,

        sendingMessage: false,

        pollingTimer: null,

        historyRequestId: 0,

        pendingDashboardConversation: null
    };


    /* =====================================================
       DOM
    ===================================================== */

    const els = {
        searchInput:
            document.getElementById(
                'chat-search-input'
            ),

        conversationsList:
            document.getElementById(
                'conversations-list'
            ),

        chatArea:
            document.getElementById(
                'chat-area'
            ),

        messagesContainer:
            document.getElementById(
                'messages-container'
            ),

        chatHeader:
            document.getElementById(
                'chat-header'
            ),

        chatAvatar:
            document.getElementById(
                'chat-avatar'
            ),

        chatUsername:
            document.getElementById(
                'chat-username'
            ),

        chatStatus:
            document.getElementById(
                'chat-status'
            ),

        chatInputArea:
            document.getElementById(
                'chat-input-area'
            ),

        messageInput:
            document.getElementById(
                'message-input'
            ),

        sendBtn:
            document.getElementById(
                'send-btn'
            )
    };


    /* =====================================================
       STORAGE / SESSION
    ===================================================== */

    function getSessionToken() {
        /*
         * O dashboard e o chat usam exatamente
         * a mesma chave.
         *
         * sessionStorage fica como fallback para
         * instalações antigas do Node.GG.
         */

        return (
            localStorage.getItem(
                'sessionToken'
            ) ||
            sessionStorage.getItem(
                'sessionToken'
            ) ||
            ''
        );
    }


    function getStoredUser() {
        const sources = [
            localStorage,
            sessionStorage
        ];

        for (const storage of sources) {
            try {
                const raw =
                    storage.getItem(
                        'user_data'
                    );

                if (!raw) {
                    continue;
                }

                const user =
                    JSON.parse(raw);

                if (
                    user &&
                    typeof user === 'object' &&
                    user.username
                ) {
                    return user;
                }

            } catch {
                // Tenta o próximo storage.
            }
        }

        return null;
    }


    function saveState() {
        try {
            localStorage.setItem(
                CONFIG.STORAGE_KEY,
                JSON.stringify({
                    activeConversation:
                        state.activeConversation
                })
            );
        } catch {
            // Storage indisponível.
        }
    }


    function loadSavedState() {
        try {
            const raw =
                localStorage.getItem(
                    CONFIG.STORAGE_KEY
                );

            if (!raw) {
                return null;
            }

            return JSON.parse(raw) || null;

        } catch {
            return null;
        }
    }


    /* =====================================================
       AUTH
    ===================================================== */

    function loadCurrentUser() {
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

        state.currentUser =
            user;

        return true;
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

        sessionStorage.removeItem(
            'sessionToken'
        );

        sessionStorage.removeItem(
            'user_data'
        );
    }


    function redirectToLogin() {
        if (state.destroyed) {
            return;
        }

        state.destroyed =
            true;

        stopPolling();

        clearSession();

        if (
            window.top &&
            window.top !== window.self
        ) {
            window.top.location.href =
                CONFIG.LOGIN_PATH;
        } else {
            window.location.href =
                CONFIG.LOGIN_PATH;
        }
    }


    /*
     * Quando o dashboard atualizar o token,
     * o chat pode sincronizar sem precisar
     * recarregar a página.
     */
    window.addEventListener(
        'storage',
        event => {
            if (
                event.key ===
                'sessionToken'
            ) {
                if (
                    event.newValue &&
                    !state.destroyed
                ) {
                    loadCurrentUser();
                }
            }

            if (
                event.key ===
                'user_data'
            ) {
                loadCurrentUser();
            }
        }
    );


    window.addEventListener(
        'nodegg:session-updated',
        () => {
            if (!state.destroyed) {
                loadCurrentUser();
            }
        }
    );


    /* =====================================================
       API
    ===================================================== */

    async function apiRequest(
        endpoint,
        options = {}
    ) {
        let token =
            getSessionToken();

        /*
         * Última tentativa de sincronização
         * antes de considerar a sessão inválida.
         */
        if (!token) {
            loadCurrentUser();

            token =
                getSessionToken();
        }

        if (!token) {
            throw new Error(
                'Sessão não encontrada. Faça login novamente.'
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
                /*
                 * O token pode ter sido renovado pelo
                 * dashboard. Tenta buscar novamente.
                 */
                const refreshedToken =
                    getSessionToken();

                if (
                    refreshedToken &&
                    refreshedToken !== token
                ) {
                    headers.Authorization =
                        `Bearer ${refreshedToken}`;

                    const retryResponse =
                        await fetch(
                            `${CONFIG.API_BASE}${endpoint}`,
                            {
                                ...options,
                                headers,
                                signal:
                                    controller.signal
                            }
                        );

                    let retryData = {};

                    try {
                        retryData =
                            await retryResponse.json();
                    } catch {
                        retryData = {};
                    }

                    if (retryResponse.ok) {
                        return retryData;
                    }
                }

                redirectToLogin();

                throw new Error(
                    'Sua sessão expirou.'
                );
            }

            let data = {};

            try {
                data =
                    await response.json();
            } catch {
                data = {};
            }

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
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function safeText(value) {
        return String(
            value == null
                ? ''
                : value
        );
    }


    function escapeHtml(value) {
        return safeText(value)
            .replace(
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


    function initials(name = '') {
        const parts =
            safeText(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (!parts.length) {
            return 'U';
        }

        return parts
            .slice(0, 2)
            .map(
                part =>
                    part
                        .charAt(0)
                        .toUpperCase()
            )
            .join('')
            .slice(0, 2);
    }


    function formatTime(timestamp) {
        if (!timestamp) {
            return '';
        }

        const date =
            new Date(timestamp);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return '';
        }

        return date.toLocaleTimeString(
            [],
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );
    }


    function getConversationUsername(
        conversation
    ) {
        return safeText(
            conversation &&
            conversation.username
        );
    }


    function isCurrentUser(username) {
        if (
            !state.currentUser ||
            !state.currentUser.username
        ) {
            return false;
        }

        return (
            safeText(username)
                .toLowerCase() ===
            safeText(
                state.currentUser.username
            ).toLowerCase()
        );
    }


    /* =====================================================
       UI
    ===================================================== */

    function showChatInterface() {
        if (els.chatArea) {
            els.chatArea.style.display =
                'none';
        }

        /*
         * O header pertence ao painel do dashboard
         * quando estamos em modo embedded.
         */
        if (
            els.chatHeader &&
            !embeddedMode
        ) {
            els.chatHeader.style.display =
                'flex';
        }

        if (els.chatInputArea) {
            els.chatInputArea.style.display =
                'flex';
        }
    }


    function showNoConversationSelected() {
        if (els.chatArea) {
            els.chatArea.style.display =
                'flex';
        }

        if (
            els.chatHeader &&
            !embeddedMode
        ) {
            els.chatHeader.style.display =
                'none';
        }

        if (els.chatInputArea) {
            els.chatInputArea.style.display =
                'none';
        }

        state.messages = [];

        if (els.messagesContainer) {
            els.messagesContainer.innerHTML =
                '';
        }
    }


    function scrollToBottom() {
        if (!els.messagesContainer) {
            return;
        }

        els.messagesContainer.scrollTop =
            els.messagesContainer.scrollHeight;
    }


    /* =====================================================
       CONVERSATIONS
    ===================================================== */

    function buildConversationItem(
        conversation
    ) {
        const username =
            getConversationUsername(
                conversation
            );

        if (!username) {
            return '';
        }

        const displayName =
            safeText(
                conversation.displayName ||
                username
            );

        const isActive =
            state.activeConversation ===
            username;

        const lastMessage =
            safeText(
                conversation.lastMessage ||
                'Sem mensagens recentes'
            );

        const time =
            safeText(
                conversation.time ||
                (
                    conversation.lastMessageAt
                        ? formatTime(
                            conversation.lastMessageAt
                        )
                        : ''
                )
            );

        const unread =
            Number(
                conversation.unread || 0
            );

        return `
            <button
                type="button"
                class="conversation-item ${isActive ? 'active' : ''}"
                data-user="${escapeHtml(username)}"
            >
                <div class="avatar-small">
                    ${escapeHtml(
                        initials(displayName)
                    )}
                </div>

                <div class="conversation-info">
                    <div class="conversation-name">
                        ${escapeHtml(displayName)}
                    </div>

                    <div class="conversation-preview">
                        ${escapeHtml(lastMessage)}
                    </div>
                </div>

                <div class="conversation-meta">
                    ${
                        time
                            ? `
                                <span class="conversation-time">
                                    ${escapeHtml(time)}
                                </span>
                            `
                            : ''
                    }

                    ${
                        unread > 0
                            ? `
                                <span class="conversation-unread">
                                    ${escapeHtml(unread)}
                                </span>
                            `
                            : ''
                    }
                </div>
            </button>
        `;
    }


    function renderConversations() {
        if (!els.conversationsList) {
            return;
        }

        const search =
            safeText(
                els.searchInput
                    ? els.searchInput.value
                    : ''
            )
                .toLowerCase()
                .trim();

        const conversations =
            Array.isArray(
                state.conversations
            )
                ? state.conversations
                : [];

        const filtered =
            conversations
                .filter(
                    conversation => {
                        const username =
                            safeText(
                                conversation.username
                            ).toLowerCase();

                        const displayName =
                            safeText(
                                conversation.displayName
                            ).toLowerCase();

                        return (
                            !search ||
                            username.includes(search) ||
                            displayName.includes(search)
                        );
                    }
                )
                .sort(
                    (a, b) =>
                        Number(
                            b.lastMessageAt || 0
                        ) -
                        Number(
                            a.lastMessageAt || 0
                        )
                );

        if (!filtered.length) {
            els.conversationsList.innerHTML = `
                <div class="no-results">
                    Nenhuma conversa encontrada.
                </div>
            `;

            return;
        }

        els.conversationsList.innerHTML =
            filtered
                .map(
                    buildConversationItem
                )
                .join('');
    }


    function findConversation(username) {
        return state.conversations.find(
            conversation =>
                safeText(
                    conversation.username
                ).toLowerCase() ===
                safeText(username)
                    .toLowerCase()
        );
    }


    /* =====================================================
       MESSAGES
    ===================================================== */

    function renderMessages(
        messages = [],
        keepScroll = false
    ) {
        if (!els.messagesContainer) {
            return;
        }

        const wasNearBottom =
            (
                els.messagesContainer.scrollHeight -
                els.messagesContainer.scrollTop -
                els.messagesContainer.clientHeight
            ) < 100;

        if (!messages.length) {
            els.messagesContainer.innerHTML = `
                <div class="empty-chat">
                    <div class="empty-chat-title">
                        Nenhuma mensagem ainda
                    </div>

                    <div class="empty-chat-subtitle">
                        Envie uma mensagem para iniciar esta conversa!
                    </div>
                </div>
            `;

            return;
        }

        els.messagesContainer.innerHTML =
            messages
                .map(
                    message => {
                        const sender =
                            safeText(
                                message.sender ||
                                message.senderUsername
                            );

                        const isMine =
                            isCurrentUser(
                                sender
                            );

                        const bubbleClass =
                            isMine
                                ? 'outgoing'
                                : 'incoming';

                        const content =
                            safeText(
                                message.content
                            );

                        const timestamp =
                            message.timestamp ||
                            message.createdAt ||
                            message.created_at ||
                            0;

                        return `
                            <div
                                class="message-row ${bubbleClass}"
                            >
                                <div
                                    class="message-bubble"
                                >
                                    <div class="message-content">
                                        ${escapeHtml(content)}
                                    </div>

                                    <div class="message-meta">
                                        <span>
                                            ${escapeHtml(
                                                formatTime(
                                                    timestamp
                                                )
                                            )}
                                        </span>

                                        ${
                                            isMine
                                                ? `
                                                    <span class="read-check">
                                                        ✓
                                                    </span>
                                                `
                                                : ''
                                        }
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                )
                .join('');

        if (
            !keepScroll ||
            wasNearBottom
        ) {
            requestAnimationFrame(
                scrollToBottom
            );
        }
    }


    /* =====================================================
       LOAD DATA
    ===================================================== */

    async function loadConversations() {
        if (
            state.destroyed ||
            state.loadingConversations
        ) {
            return;
        }

        state.loadingConversations =
            true;

        try {
            const response =
                await apiRequest(
                    '/messages/conversations'
                );

            state.conversations =
                Array.isArray(
                    response.conversations
                )
                    ? response.conversations
                    : [];

            renderConversations();

        } catch (error) {
            console.error(
                '[Node.GG Chat] Erro ao carregar conversas:',
                error
            );

        } finally {
            state.loadingConversations =
                false;
        }
    }


    async function loadHistory(
        username
    ) {
        if (
            state.destroyed ||
            !username
        ) {
            return;
        }

        const requestId =
            ++state.historyRequestId;

        state.loadingHistory =
            true;

        try {
            const response =
                await apiRequest(
                    `/messages/history?with=${encodeURIComponent(
                        username
                    )}`
                );

            if (
                requestId !==
                state.historyRequestId
            ) {
                return;
            }

            if (
                state.activeConversation !==
                username
            ) {
                return;
            }

            state.messages =
                Array.isArray(
                    response.messages
                )
                    ? response.messages
                    : [];

            renderMessages(
                state.messages,
                true
            );

        } catch (error) {
            console.error(
                '[Node.GG Chat] Erro ao carregar histórico:',
                error
            );

        } finally {
            if (
                requestId ===
                state.historyRequestId
            ) {
                state.loadingHistory =
                    false;
            }
        }
    }


    /* =====================================================
       ACTIVE CONVERSATION
    ===================================================== */

    async function setActiveConversation(
        username,
        displayName = ''
    ) {
        username =
            safeText(username).trim();

        if (!username) {
            return;
        }

        if (
            state.activeConversation !==
            username
        ) {
            state.messages = [];

            if (
                els.messagesContainer
            ) {
                els.messagesContainer.innerHTML =
                    '';
            }
        }

        state.activeConversation =
            username;

        saveState();

        const conversation =
            findConversation(
                username
            );

        const finalDisplayName =
            displayName ||
            conversation?.displayName ||
            username;

        showChatInterface();

        if (els.chatUsername) {
            els.chatUsername.textContent =
                finalDisplayName;
        }

        if (els.chatAvatar) {
            els.chatAvatar.textContent =
                initials(
                    finalDisplayName
                );
        }

        if (els.chatStatus) {
            els.chatStatus.textContent =
                conversation?.online ||
                conversation?.status === 'online'
                    ? 'online'
                    : 'offline';
        }

        if (conversation) {
            conversation.unread = 0;
        }

        renderConversations();

        await loadHistory(
            username
        );

        if (
            els.messageInput &&
            !state.destroyed
        ) {
            requestAnimationFrame(
                () => {
                    els.messageInput.focus();
                }
            );
        }
    }


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    async function sendMessage() {
        if (
            state.sendingMessage ||
            !state.activeConversation ||
            !els.messageInput
        ) {
            return;
        }

        const content =
            els.messageInput.value.trim();

        if (!content) {
            return;
        }

        /*
         * Pega o token novamente no momento exato
         * do envio. Isso evita usar um valor antigo.
         */
        const token =
            getSessionToken();

        if (!token) {
            loadCurrentUser();

            if (!getSessionToken()) {
                alert(
                    'Sua sessão não foi encontrada. Recarregue o dashboard e tente novamente.'
                );

                return;
            }
        }

        const receiver =
            state.activeConversation;

        state.sendingMessage =
            true;

        if (els.sendBtn) {
            els.sendBtn.disabled =
                true;
        }

        els.messageInput.value =
            '';

        try {
            const response =
                await apiRequest(
                    '/messages/send',
                    {
                        method: 'POST',

                        body:
                            JSON.stringify({
                                receiver,
                                content
                            })
                    }
                );

            const timestamp =
                Date.now();

            const message =
                response.message || {
                    id:
                        response.messageId ||
                        timestamp,

                    sender:
                        state.currentUser.username,

                    receiver,

                    content,

                    timestamp
                };

            if (
                !message.timestamp &&
                !message.createdAt
            ) {
                message.timestamp =
                    timestamp;
            }

            state.messages.push(
                message
            );

            renderMessages(
                state.messages
            );

            updateConversationAfterSend(
                receiver,
                content,
                timestamp
            );

            renderConversations();

        } catch (error) {
            els.messageInput.value =
                content;

            console.error(
                '[Node.GG Chat] Erro ao enviar mensagem:',
                error
            );

            alert(
                error.message ||
                'Erro ao enviar mensagem.'
            );

        } finally {
            state.sendingMessage =
                false;

            if (els.sendBtn) {
                els.sendBtn.disabled =
                    false;
            }

            if (
                els.messageInput &&
                !state.destroyed
            ) {
                els.messageInput.focus();
            }
        }
    }


    function updateConversationAfterSend(
        username,
        content,
        timestamp
    ) {
        let conversation =
            findConversation(
                username
            );

        if (!conversation) {
            conversation = {
                username,
                displayName:
                    username,

                lastMessage:
                    content,

                lastMessageAt:
                    timestamp,

                time:
                    formatTime(
                        timestamp
                    ),

                unread: 0
            };

            state.conversations.unshift(
                conversation
            );

            return;
        }

        conversation.lastMessage =
            content;

        conversation.lastMessageAt =
            timestamp;

        conversation.time =
            formatTime(
                timestamp
            );

        conversation.unread =
            0;
    }


    /* =====================================================
       POLLING
    ===================================================== */

    async function refreshChat() {
        if (state.destroyed) {
            return;
        }

        await loadConversations();

        if (
            state.activeConversation
        ) {
            await loadHistory(
                state.activeConversation
            );
        }
    }


    function startPolling() {
        stopPolling();

        state.pollingTimer =
            setInterval(
                () => {
                    refreshChat();
                },
                CONFIG.POLLING_INTERVAL
            );
    }


    function stopPolling() {
        if (
            state.pollingTimer
        ) {
            clearInterval(
                state.pollingTimer
            );

            state.pollingTimer =
                null;
        }
    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function bindConversationList() {
        if (
            !els.conversationsList
        ) {
            return;
        }

        els.conversationsList
            .addEventListener(
                'click',
                event => {
                    const target =
                        event.target.closest(
                            '[data-user]'
                        );

                    if (!target) {
                        return;
                    }

                    const username =
                        target.dataset.user;

                    if (!username) {
                        return;
                    }

                    const conversation =
                        findConversation(
                            username
                        );

                    setActiveConversation(
                        username,
                        conversation?.displayName ||
                        username
                    );
                }
            );
    }


    function bindChatControls() {
        if (els.sendBtn) {
            els.sendBtn.addEventListener(
                'click',
                sendMessage
            );
        }

        if (els.messageInput) {
            els.messageInput.addEventListener(
                'keydown',
                event => {
                    if (
                        event.key === 'Enter' &&
                        !event.shiftKey
                    ) {
                        event.preventDefault();

                        sendMessage();
                    }
                }
            );
        }

        if (els.searchInput) {
            els.searchInput.addEventListener(
                'input',
                renderConversations
            );
        }
    }


    /* =====================================================
       DASHBOARD INTEGRATION
    ===================================================== */

    window.addEventListener(
        'nodegg:open-chat',
        event => {
            const detail =
                event.detail || {};

            const username =
                String(
                    detail.username || ''
                ).trim();

            const displayName =
                String(
                    detail.displayName ||
                    username
                ).trim();

            if (!username) {
                return;
            }

            if (!state.initialized) {
                state.pendingDashboardConversation = {
                    username,
                    displayName
                };

                return;
            }

            setActiveConversation(
                username,
                displayName
            );
        }
    );


    window.addEventListener(
        'nodegg:close-chat',
        () => {
            state.activeConversation =
                null;

            state.messages =
                [];

            state.historyRequestId++;

            saveState();

            showNoConversationSelected();
        }
    );


    /* =====================================================
       RESTORE ACTIVE CHAT
    ===================================================== */

    async function restoreActiveConversation() {
        const saved =
            loadSavedState();

        if (
            !saved ||
            !saved.activeConversation
        ) {
            showNoConversationSelected();

            return;
        }

        const username =
            safeText(
                saved.activeConversation
            );

        const conversation =
            findConversation(
                username
            );

        if (!conversation) {
            showNoConversationSelected();

            return;
        }

        await setActiveConversation(
            username,
            conversation.displayName ||
            username
        );
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    async function init() {
        if (state.initialized) {
            return;
        }

        state.initialized =
            true;

        const validSession =
            loadCurrentUser();

        if (!validSession) {
            /*
             * Em embedded mode o dashboard pode ainda
             * estar terminando de restaurar a sessão.
             * Não expulsamos o usuário imediatamente.
             */
            if (!embeddedMode) {
                redirectToLogin();
            }

            return;
        }

        bindConversationList();

        bindChatControls();

        showNoConversationSelected();

        await loadConversations();

        if (state.destroyed) {
            return;
        }

        if (
            state.pendingDashboardConversation
        ) {
            const pending =
                state.pendingDashboardConversation;

            state.pendingDashboardConversation =
                null;

            await setActiveConversation(
                pending.username,
                pending.displayName
            );

        } else if (!embeddedMode) {
            await restoreActiveConversation();

        } else {
            showNoConversationSelected();
        }

        if (state.destroyed) {
            return;
        }

        startPolling();
    }


    /* =====================================================
       PAGE LIFECYCLE
    ===================================================== */

    window.addEventListener(
        'beforeunload',
        () => {
            state.destroyed =
                true;

            stopPolling();
        }
    );


    document.addEventListener(
        'visibilitychange',
        () => {
            if (state.destroyed) {
                return;
            }

            if (
                document.visibilityState ===
                'visible'
            ) {
                refreshChat();
            }
        }
    );


    /* =====================================================
       START
    ===================================================== */

    init();

})();
