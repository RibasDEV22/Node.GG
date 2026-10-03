// pages/dashboard/chat/chat.js
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
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCurrentUser() {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      return {
        username: 'usuario',
        displayName: 'Usuário',
        avatar: ''
      };
    }

    try {
      const raw = localStorage.getItem('nodegg.user');
      if (!raw) return { username: 'usuario', displayName: 'Usuário', avatar: '' };
      return JSON.parse(raw);
    } catch (err) {
      return { username: 'usuario', displayName: 'Usuário', avatar: '' };
    }
  }

  async function fetchJson(url, options = {}) {
    const token = localStorage.getItem('sessionToken') || '';
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (!res.ok) {
      let msg = 'Erro ao carregar dados';
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

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify({
      activeConversation: state.activeConversation,
      conversations: state.conversations
    }));
  }

  function buildConversationItem(user) {
    return `
      <button class="conversation-item ${state.activeConversation === user.username ? 'active' : ''}" data-user="${user.username}">
        <div class="avatar-small">${initials(user.displayName || user.username)}</div>
        <div class="conversation-info">
          <div class="conversation-name">${safeText(user.displayName || user.username)}</div>
          <div class="conversation-preview">${safeText(user.lastMessage || 'Começar conversa')}</div>
        </div>
        <div class="conversation-meta">
          <span class="conversation-time">${safeText(user.time || '')}</span>
        </div>
      </button>
    `;
  }

  function renderConversations() {
    const search = (els.searchInput?.value || '').toLowerCase();
    const list = (state.conversations || [])
      .filter(conv => {
        const name = (conv.displayName || conv.username || '').toLowerCase();
        return name.includes(search) || (conv.username || '').toLowerCase().includes(search);
      })
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    els.conversationsList.innerHTML = list.length
      ? list.map(buildConversationItem).join('')
      : `
        <div class="no-results">
          Nenhuma conversa encontrada
        </div>
      `;
  }

  function renderMessages(messages = []) {
    if (!messages.length) {
      els.messagesContainer.innerHTML = `
        <div class="empty-chat">
          <div class="empty-chat-title">Nenhuma mensagem ainda</div>
          <div class="empty-chat-subtitle">Envie uma mensagem para começar a conversa.</div>
        </div>
      `;
      return;
    }

    els.messagesContainer.innerHTML = messages
      .map(msg => {
        const isMine = msg.sender === state.currentUser.username;
        const bubbleClass = isMine ? 'outgoing' : 'incoming';
        return `
          <div class="message-row ${bubbleClass}">
            <div class="message-bubble">
              ${safeText(msg.content || '')}
              <div class="message-meta">
                <span>${safeText(formatTime(msg.timestamp || Date.now()))}</span>
                ${isMine ? '<span>✓</span>' : ''}
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function setActiveConversation(username, displayName = '') {
    state.activeConversation = username;
    state.messages = [];
    els.chatHeader.style.display = 'flex';
    els.chatArea.style.display = 'none';
    els.chatUsername.textContent = displayName || username;
    els.chatAvatar.textContent = initials(displayName || username);
    els.chatStatus.textContent = 'online';

    const conv = state.conversations.find(c => c.username === username);
    if (conv) {
      conv.unread = 0;
    }

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

      if (!state.conversations.length) {
        state.conversations.push({
          username: 'jaguaringa_99',
          displayName: 'Jaguaringa_99',
          lastMessage: 'Olá! Como vai?',
          lastMessageAt: Date.now(),
          time: formatTime(Date.now())
        });
      }
      renderConversations();
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
      state.conversations = [{
        username: 'jaguaringa_99',
        displayName: 'Jaguaringa_99',
        lastMessage: 'Olá! Como vai?',
        lastMessageAt: Date.now(),
        time: formatTime(Date.now())
      }];
      renderConversations();
    }
  }

  async function sendMessage() {
    const text = els.messageInput.value.trim();
    if (!text || !state.activeConversation) return;

    try {
      const payload = {
        receiver: state.activeConversation,
        content: text
      };

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
      els.messageInput.value = '';
    } catch (err) {
      alert(err.message || 'Erro ao enviar mensagem');
    }
  }

  function bindChatControls() {
    els.sendBtn.addEventListener('click', sendMessage);
    els.messageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        event.target.value = '';
        sendMessage();
      }
    });

    if (els.searchInput) {
      els.searchInput.addEventListener('input', () => {
        renderConversations();
      });
    }
  }

  async function init() {
    state.currentUser = getCurrentUser();
    if (!state.conversations.length) {
      await loadConversations();
    }
    bindConversationList();
    bindChatControls();
    renderConversations();

    if (state.conversations.length) {
      const first = state.conversations[0];
      setActiveConversation(first.username, first.displayName || first.username);
    }
  }

  init();
})();
