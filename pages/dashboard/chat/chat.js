// pages/chat/chat.js
(function () {
  const API_BASE = window.API_BASE || '/api';
  const storageKey = 'nodegg.chat.state';

  const state = {
    currentUser: null,
    activeConversation: null,
    conversations: [],
    messages: []
  };

  const els = {
    searchInput: document.getElementById('search-input'),
    conversationsList: document.getElementById('conversations-list'),
    chatArea: document.getElementById('chat-area'),
    messagesContainer: document.getElementById('messages-container'),
    chatHeader: document.getElementById('chat-header'),
    chatAvatar: document.getElementById('chat-avatar'),
    chatUsername: document.getElementById('chat-username'),
    chatStatus: document.getElementById('chat-status'),
    chatInputArea: document.getElementById('chat-input-area'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn')
  };

  function initials(name = '') {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2) || 'U';
  }

  function formatTime(ts) {
    const date = new Date(ts || Date.now());
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function safeText(value = '') {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function fetchJson(url, options = {}) {
    const token = localStorage.getItem('sessionToken') || '';

    if (!token) {
      redirectToLogin();
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('sessionToken');
      redirectToLogin();
      return;
    }

    if (!res.ok) {
      let msg = 'Erro na requisição';
      try {
        const errData = await res.json();
        msg = errData.error || errData.message || msg;
      } catch (err) {
        // noop
      }
      throw new Error(msg);
    }

    return res.json();
  }

  function redirectToLogin() {
    if (window.top !== window.self) {
      window.top.location.href = '../login/index.html';
    } else {
      window.location.href = '../login/index.html';
    }
  }

  function scrollToBottom() {
    if (els.messagesContainer) {
      els.messagesContainer.scrollTop = els.messagesContainer.scrollHeight;
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify({
      activeConversation: state.activeConversation
    }));
  }

  function buildConversationItem(user) {
    const isActive = state.activeConversation === user.username;
    return `
      <button class="conversation-item ${isActive ? 'active' : ''}" data-user="${safeText(user.username)}">
        <div class="avatar-small">${escapeHtml(initials(user.displayName || user.username))}</div>
        <div class="conversation-info">
          <div class="conversation-name">${safeText(user.displayName || user.username)}</div>
          <div class="conversation-preview">${safeText(user.lastMessage || 'Sem mensagens recentes')}</div>
        </div>
        <div class="conversation-meta">
          <span class="conversation-time">${safeText(user.time || '')}</span>
        </div>
      </button>
    `;
  }

  function escapeHtml(str) {
    return safeText(str);
  }

  function renderConversations() {
    const search = (els.searchInput?.value || '').toLowerCase();
    const list = (state.conversations || [])
      .filter(conv => {
        const name = (conv.displayName || conv.username || '').toLowerCase();
        return name.includes(search) || (conv.username || '').toLowerCase().includes(search);
      })
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    if (!list.length) {
      els.conversationsList.innerHTML = `
        <div class="no-results" style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">
          Nenhuma conversa encontrada.
        </div>
      `;
      return;
    }

    els.conversationsList.innerHTML = list.map(buildConversationItem).join('');
  }

  function renderMessages(messages = []) {
    if (!messages.length) {
      els.messagesContainer.innerHTML = `
        <div class="empty-chat">
          <div class="empty-chat-title">Nenhuma mensagem ainda</div>
          <div class="empty-chat-subtitle">Envie uma mensagem para iniciar esta conversa!</div>
        </div>
      `;
      return;
    }

    els.messagesContainer.innerHTML = messages
      .map(msg => {
        const isMine = state.currentUser && (msg.sender === state.currentUser.username);
        const bubbleClass = isMine ? 'outgoing' : 'incoming';
        return `
          <div class="message-row ${bubbleClass}">
            <div class="message-bubble">
              ${safeText(msg.content || '')}
              <div class="message-meta">
                <span>${safeText(formatTime(msg.timestamp || Date.now()))}</span>
                ${isMine ? '<span class="read-check">✓</span>' : ''}
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    scrollToBottom();
  }

  function setActiveConversation(username, displayName = '') {
    if (!username) return;

    state.activeConversation = username;
    
    if (els.chatArea) els.chatArea.style.display = 'none';
    if (els.chatHeader) els.chatHeader.style.display = 'flex';
    if (els.chatInputArea) els.chatInputArea.style.display = 'flex';

    els.chatUsername.textContent = displayName || username;
    els.chatAvatar.textContent = initials(displayName || username);
    els.chatStatus.textContent = 'online';

    const conv = state.conversations.find(c => c.username === username);
    if (conv) {
      conv.unread = 0;
    }

    renderConversations();
    saveState();
    loadHistory(username);
  }

  function bindConversationList() {
    els.conversationsList.addEventListener('click', (event) => {
      const target = event.target.closest('[data-user]');
      if (!target) return;
      const username = target.dataset.user;
      const user = state.conversations.find(c => c.username === username);
      setActiveConversation(username, user?.displayName || username);
    });
  }

  async function loadHistory(username) {
    try {
      const res = await fetchJson(`${API_BASE}/messages/history?with=${encodeURIComponent(username)}`);
      state.messages = res.messages || [];
      renderMessages(state.messages);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      state.messages = [];
      renderMessages([]);
    }
  }

  async function loadConversations() {
    try {
      const res = await fetchJson(`${API_BASE}/messages/conversations`);
      state.conversations = res.conversations || [];
      renderConversations();
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
      state.conversations = [];
      renderConversations();
    }
  }

  async function sendMessage() {
    const text = els.messageInput.value.trim();
    if (!text || !state.activeConversation) return;

    const payload = {
      receiver: state.activeConversation,
      content: text
    };

    els.messageInput.value = '';

    try {
      const res = await fetchJson(`${API_BASE}/messages/send`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const msg = {
        id: res.messageId || Date.now(),
        sender: state.currentUser.username,
        receiver: state.activeConversation,
        content: text,
        timestamp: Date.now()
      };

      state.messages.push(msg);
      renderMessages(state.messages);

      const conv = state.conversations.find(c => c.username === state.activeConversation);
      if (conv) {
        conv.lastMessage = text;
        conv.lastMessageAt = Date.now();
        conv.time = formatTime(Date.now());
      } else {
        state.conversations.unshift({
          username: state.activeConversation,
          displayName: state.activeConversation,
          lastMessage: text,
          lastMessageAt: Date.now(),
          time: formatTime(Date.now())
        });
      }

      renderConversations();
    } catch (err) {
      alert(err.message || 'Erro ao enviar mensagem');
    }
  }

  async function loadCurrentUser() {
    try {
      const res = await fetchJson(`${API_BASE}/auth/me`);
      if (res && res.user) {
        state.currentUser = res.user;
      }
    } catch (err) {
      console.error('Erro ao carregar utilizador atual:', err);
    }
  }

  function bindChatControls() {
    if (els.sendBtn) {
      els.sendBtn.addEventListener('click', sendMessage);
    }

    if (els.messageInput) {
      els.messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      });
    }

    if (els.searchInput) {
      els.searchInput.addEventListener('input', () => {
        renderConversations();
      });
    }
  }

  async function init() {
    await loadCurrentUser();
    await loadConversations();

    bindConversationList();
    bindChatControls();

    // Recupera conversa ativa guardada se existir
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeConversation) {
          const exists = state.conversations.find(c => c.username === parsed.activeConversation);
          if (exists) {
            setActiveConversation(exists.username, exists.displayName || exists.username);
          }
        }
      } catch (e) {
        // noop
      }
    }

    // Intervalo de Polling (a cada 3s atualiza conversas e mensagens).
    setInterval(async () => {
      await loadConversations();
      if (state.activeConversation) {
        await loadHistory(state.activeConversation);
      }
    }, 3000);
  }

  init();
})();
