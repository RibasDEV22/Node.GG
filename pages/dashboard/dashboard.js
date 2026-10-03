// pages/dashboard/dashboard.js
(function () {
  const API_BASE = window.API_BASE || '/api';
  const sessionToken = localStorage.getItem('sessionToken') || '';
  const state = {
    currentUser: null,
    friends: [],
    friendRequests: [],
    onlineUsers: [],
    filter: 'all',
    search: ''
  };

  const els = {
    userDisplayName: document.getElementById('user-display-name'),
    userUsername: document.getElementById('user-username'),
    userAvatarText: document.getElementById('user-avatar-text'),
    onlineCount: document.getElementById('online-count'),
    usersContainer: document.getElementById('users-container'),
    modal: document.getElementById('app-modal'),
    modalIframe: document.getElementById('modal-iframe'),
    modalTitle: document.querySelector('.modal-title'),
    closeModalBtn: document.getElementById('close-modal-btn')
  };

  function initialsFromName(name = '') {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2) || 'U';
  }

  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getAvatarText(user) {
    if (user.avatar) return initialsFromName(user.displayName || user.username || 'User');
    return initialsFromName(user.displayName || user.username || 'User');
  }

  function formatStatusLabel(lastSeen) {
    const diff = Date.now() - Number(lastSeen || 0);
    if (!diff || diff > 180000) return 'offline';
    if (diff > 60000) return 'idle';
    return 'online';
  }

  function buildUserCard(user) {
    const statusClass =
      user.status === 'online'
        ? 'online'
        : user.status === 'idle'
          ? 'idle'
          : user.status === 'dnd'
            ? 'dnd'
            : 'online';

    const badge = user.badge || 'Membro';
    const statusText = user.bio || 'Disponível para conversar';

    return `
      <div class="user-card" data-username="${escapeHtml(user.username || '')}">
        <div class="user-main-info">
          <div class="avatar-wrapper">
            <div class="avatar-placeholder ${user.avatarClass || 'alt1'}">
              ${escapeHtml(getAvatarText(user))}
            </div>
            <span class="status-indicator ${statusClass}"></span>
          </div>

          <div class="user-details">
            <div class="user-title-row">
              <span class="user-title">${escapeHtml(user.displayName || user.username || 'Usuário')}</span>
              <span class="activity-badge ${user.badgeClass || 'badge-dev'}">${escapeHtml(badge)}</span>
            </div>
            <div class="user-status-text">${escapeHtml(statusText)}</div>
          </div>
        </div>

        <div class="user-card-actions">
          <button class="btn-action primary" data-action="chat" data-username="${escapeHtml(user.username || '')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Conversar
          </button>

          <button class="btn-action secondary" data-action="friend" data-username="${escapeHtml(user.username || '')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 12a4 4 0 0 1 8 0v1"></path>
              <path d="M5 5a4 4 0 0 1 4 0v1"></path>
            </svg>
            ${user.isFriend ? 'Amigo' : 'Adicionar'}
          </button>
        </div>
      </div>
    `;
  }

  function renderUsers(list) {
    if (!list.length) {
      els.usersContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Nenhum usuário encontrado</div>
          <div class="empty-state-subtitle">Tente outra busca ou envie um pedido de amizade.</div>
        </div>
      `;
      return;
    }

    els.usersContainer.innerHTML = list
      .filter(user => user.username !== state.currentUser?.username)
      .map(buildUserCard)
      .join('');
  }

  function bindUserActions() {
    els.usersContainer.addEventListener('click', async (event) => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;

      const username = actionEl.dataset.username;
      const action = actionEl.dataset.action;

      if (!username) return;

      if (action === 'chat') {
        openChatWithUser(username);
        return;
      }

      if (action === 'friend') {
        await sendFriendRequest(username);
      }
    });
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

  async function loadCurrentUser() {
    try {
      const res = await fetchJson(`${API_BASE}/auth/me`, {
        method: 'GET'
      });

      state.currentUser = res.user || {
        username: 'usuario',
        displayName: 'Usuário',
        avatar: '',
        role: 'Membro'
      };

      els.userDisplayName.textContent = state.currentUser.displayName || state.currentUser.username;
      els.userUsername.textContent = `@${state.currentUser.username}`;
      els.userAvatarText.textContent = getAvatarText(state.currentUser);
    } catch (err) {
      console.error(err);
      state.currentUser = {
        username: 'usuario',
        displayName: 'Usuário',
        avatar: '',
        role: 'Membro'
      };
      els.userDisplayName.textContent = state.currentUser.displayName;
      els.userUsername.textContent = `@${state.currentUser.username}`;
      els.userAvatarText.textContent = getAvatarText(state.currentUser);
    }
  }

  async function loadFriends() {
    try {
      const res = await fetchJson(`${API_BASE}/friends/list`);
      state.friends = res.friends || [];
    } catch (err) {
      state.friends = [];
      console.error('Erro ao buscar amigos:', err);
    }
  }

  async function loadFriendRequests() {
    try {
      const res = await fetchJson(`${API_BASE}/friends/requests`);
      state.friendRequests = res.requests || [];
    } catch (err) {
      state.friendRequests = [];
      console.error('Erro ao buscar pedidos:', err);
    }
  }

  async function loadOnlineUsers() {
    try {
      const res = await fetchJson(`${API_BASE}/friends/online`);
      state.onlineUsers = res.onlineUsers || [];
    } catch (err) {
      state.onlineUsers = [];
      console.error('Erro ao buscar usuários online:', err);
    }
  }

  function getFilteredUsers() {
    const baseUsers = [...state.onlineUsers, ...state.friends];

    const unique = [];
    const map = new Map();

    for (const user of baseUsers) {
      if (!user.username) continue;
      if (!map.has(user.username)) {
        map.set(user.username, { ...user, isFriend: true });
      }
    }

    // adicionar usuários comuns do sistema
    // se o backend tiver /users/list, usa isso
    const fallback = [
      { username: 'jaguaringa_99', displayName: 'Jaguaringa_99', bio: 'Criando engine 3D em WebGL e shaders 🚀', status: 'online', badge: 'WebGL / 3D', badgeClass: 'badge-dev' },
      { username: 'ribasdev', displayName: 'RibasDEV', bio: 'Otimizando emulador no Android (Box64/DXVK)', status: 'idle', badge: 'Emulação', badgeClass: 'badge-sys' },
      { username: 'squadleader', displayName: 'SquadLeader', bio: 'Não perturbe — Subindo na Arena 22 ⚔️', status: 'dnd', badge: 'Clash Royale', badgeClass: 'badge-game' }
    ];

    for (const user of fallback) {
      if (!map.has(user.username)) {
        map.set(user.username, { ...user, isFriend: false });
      }
    }

    const list = Array.from(map.values());

    if (state.filter === 'online') {
      return list.filter(u => u.status === 'online' || u.status === 'idle');
    }
    if (state.filter === 'ingame') {
      return list.filter(u => u.status === 'dnd');
    }

    if (state.search) {
      const q = state.search.toLowerCase();
      return list.filter(u =>
        (u.displayName || u.username || '').toLowerCase().includes(q)
        || (u.username || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  async function sendFriendRequest(username) {
    try {
      const payload = { targetUsername: username };
      await fetchJson(`${API_BASE}/friends/send-request`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      alert('Pedido de amizade enviado!');
    } catch (err) {
      alert(err.message || 'Erro ao enviar pedido');
    }
  }

  function openModal(type) {
    if (type === 'chat') {
      els.modal.style.display = 'block';
      els.modalTitle.textContent = 'Node.GG - Chat';
      els.modalIframe.src = '../chat/index.html';
      return;
    }

    if (type === 'settings') {
      els.modal.style.display = 'block';
      els.modalTitle.textContent = 'Node.GG - Configurações';
      els.modalIframe.src = '../settings/index.html';
      return;
    }

    els.modal.style.display = 'block';
    els.modalTitle.textContent = 'Node.GG - Janela';
    els.modalIframe.src = '';
  }

  function closeModal() {
    els.modal.style.display = 'none';
    els.modalIframe.src = '';
  }

  function bindModal() {
    if (els.closeModalBtn) {
      els.closeModalBtn.addEventListener('click', closeModal);
    }
  }

  function bindFilter() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.filter = tab.textContent.trim().toLowerCase().replace(/\s+/g, '');
        if (state.filter === 'todos') state.filter = 'all';
        if (state.filter === 'emjogo') state.filter = 'ingame';
        if (state.filter === 'online') state.filter = 'online';
        tabs.forEach(btn => btn.classList.remove('active'));
        tab.classList.add('active');
      });

      const searchInput = document.querySelector('.header-right input');
      searchInput.addEventListener('input', (event) => {
        state.search = event.target.value.trim().toLowerCase();
        renderUsers(getFilteredUsers());
      });
    });
  }

  async function init() {
    bindModal();
    bindFilter();
    bindUserActions();
    await loadCurrentUser();
    await loadFriends();
    await loadFriendRequests();
    await loadOnlineUsers();
    renderUsers(getFilteredUsers());
  }

  init();
})();
