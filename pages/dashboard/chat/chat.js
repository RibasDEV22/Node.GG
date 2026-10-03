// pages/dashboard/chat/chat.js

(function () {
    'use strict';

    /* =====================================================
       CONFIG
    ===================================================== */

    const CONFIG = {
        SERVER_URL: 'https://node-server-b8j3.onrender.com',

        REQUEST_TIMEOUT: 15000,

        POLLING_INTERVAL: 3000,

        STORAGE_KEY: 'nodegg.chat.state',

        LOGIN_PATH: '../../login/index.html'
    };

    CONFIG.API_BASE =
        `${CONFIG.SERVER_URL}/api`;


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

        historyRequestId: 0
    };


    /* =====================================================
       DOM
    ===================================================== */

    const els = {
        searchInput:
            document.getElementById('search-input'),

        conversationsList:
            document.getElementById('conversations-list'),

        chatArea:
            document.getElementById('chat-area'),

        messagesContainer:
            document.getElementById('messages-container'),

        chatHeader:
            document.getElementById('chat-header'),

        chatAvatar:
            document.getElementById('chat-avatar'),

        chatUsername:
            document.getElementById('chat-username'),

        chatStatus:
            document.getElementById('chat-status'),

        chatInputArea:
            document.getElementById('chat-input-area'),

        messageInput:
            document.getElementById('message-input'),

        sendBtn:
            document.getElementById('send-btn')
    };


    /* =====================================================
       STORAGE
    ===================================================== */

    function getSessionToken() {
        return localStorage.getItem('sessionToken') || '';
    }


    function getStoredUser() {
        const raw =
            localStorage.getItem('user_data');

        if (!raw) {
            return null;
        }

        try {
            const user =
                JSON.parse(raw);

            if (
                !user ||
                typeof user !== 'object' ||
                !user.username
            ) {
                return null;
            }

            return user;

        } catch {
            return null;
        }
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
            // Storage indisponível. Não impede o chat.
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

            const parsed =
                JSON.parse(raw);

            return parsed || null;

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
    }


    function redirectToLogin() {
        if (state.destroyed) {
            return;
        }

        state.destroyed = true;

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


    /* =====================================================
       API
    ===================================================== */

    async function apiRequest(
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
            value == null ? '' : value
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
            safeText(username).toLowerCase() ===
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

        if (els.chatHeader) {
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

        if (els.chatHeader) {
            els.chatHeader.style.display =
                'none';
        }

        if (els.chatInputArea) {
            els.chatInputArea.style.display =
                'none';
        }

        state.messages = [];

        if (els.messagesContainer) {
            els.messagesContainer.innerHTML = '';
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
                            username.includes(
                                search
                            ) ||
                            displayName.includes(
                                search
                            )
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
                <div
                    class="no-results"
                    style="
                        padding: 16px;
                        text-align: center;
                        color: var(--text-dim);
                        font-size: 0.8rem;
                    "
                >
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
                getConversationUsername(
                    conversation
                ) === username
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
                                message.sender
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
                                    ${escapeHtml(content)}

                                    <div
                                        class="message-meta"
                                    >
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
            scrollToBottom();
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

        state.loadingConversations = true;

        try {
            const response =
                await apiRequest(
                    '/messages/conversations'
                );

            const conversations =
                Array.isArray(
                    response.conversations
                )
                    ? response.conversations
                    : [];

            state.conversations =
                conversations;

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

        state.loadingHistory = true;

        try {
            const response =
                await apiRequest(
                    `/messages/history?with=${encodeURIComponent(
                        username
                    )}`
                );

            /*
             * Se o usuário mudou de conversa
             * enquanto essa requisição estava
             * rodando, ignoramos o resultado antigo.
             */
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
            /*
             * Não limpamos a tela em caso de erro.
             * Isso evita o chat "piscar" ou parecer
             * vazio quando o servidor está lento.
             */
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
        if (!username) {
            return;
        }

        if (
            state.activeConversation !==
            username
        ) {
            state.messages = [];
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
                conversation?.online
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

        if (els.messageInput) {
            els.messageInput.focus();
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

        const receiver =
            state.activeConversation;

        state.sendingMessage = true;

        if (els.sendBtn) {
            els.sendBtn.disabled = true;
        }

        /*
         * Limpamos somente depois de capturar
         * o conteúdo. Se o envio falhar, o texto
         * volta para o campo.
         */
        els.messageInput.value = '';

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

            /*
             * Alguns backends podem devolver
             * timestamp como createdAt.
             */
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
            /*
             * Não perde a mensagem do usuário
             * se o servidor rejeitar o envio.
             */
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
                displayName: username,
                lastMessage: content,
                lastMessageAt: timestamp,
                time: formatTime(timestamp),
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
            formatTime(timestamp);

        conversation.unread = 0;
    }


    /* =====================================================
       POLLING
    ===================================================== */

    async function refreshChat() {
        if (
            state.destroyed
        ) {
            return;
        }

        /*
         * Primeiro atualizamos a lista.
         * Depois o histórico da conversa ativa.
         */
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
                () => {
                    renderConversations();
                }
            );
        }
    }


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

        state.initialized = true;

        const validSession =
            loadCurrentUser();

        if (!validSession) {
            redirectToLogin();

            return;
        }

        bindConversationList();

        bindChatControls();

        showNoConversationSelected();

        await loadConversations();

        if (state.destroyed) {
            return;
        }

        await restoreActiveConversation();

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
            state.destroyed = true;

            stopPolling();
        }
    );


    document.addEventListener(
        'visibilitychange',
        () => {
            if (state.destroyed) {
                return;
            }

            /*
             * Quando a aba volta a ficar visível,
             * fazemos uma atualização imediata.
             */
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
