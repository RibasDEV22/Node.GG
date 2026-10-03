// pages/dashboard/dashboard.js
(function () {
  const API_BASE = window.API_BASE || '/api';
  
  const state = {
    currentUser: null,
    friends: [],
    friendRequests: [],
    onlineUsers: [],
    filter: 'all',
    search: '',
    pingMs: 0
  };

  const els = {
    userDisplayName: document.getElementById('user-display-name'),
    userUsername: document.getElementById('user-username'),
    userAvatarText: document.getElementById('user-avatar-text'),
    onlineCount: document.getElementById('online-count'),
    friendsCount: document.getElementById('friends-count'),
    pingValue: document.getElementById('ping-value'),
    usersContainer: document.getElementById('users-container'),
    modal: document.getElementById('app-modal'),
    modalIframe: document.getElementById('modal-iframe'),
    modalTitle: document.querySelector('.modal-title'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    searchInput: document.getElementById('search-input')
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
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getAvatarText(user) {
    return initialsFromName(user.displayName || user.username || 'User');
  }

  async function fetchJson(url, options = {}) {
    const token = localStorage.getItem('sessionToken') || '';
    
    if (!token) {
      window.location.href = '../login/index.html';
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const startTime = performance.now();
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
    
    state.pingMs = Math.round(performance.now() - startTime);
    updateStatsUI();

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('sessionToken');
      window.location.href = '../login/index.html';
      return;
    }

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

  function updateStatsUI() {
    if (els.onlineCount) els.onlineCount.textContent = state.onlineUsers.length;
    if (els.friendsCount) els.friendsCount.textContent = state.friends.length;
    if (els.pingValue) els.pingValue.textContent = `${state.pingMs} ms`;
  }

  function buildUserCard(user) {
    const statusClass = user.status === 'online' ? 'online' : (user.status === 'idle' ? 'idle' : 'dnd');
    const badge = user.badge || (user.isFriend ? 'Amigo' : 'Utilizador');
    const statusText = user.bio || (user.status === 'online' ? 'Online agora' : 'Offline');

    let actionButtons = '';

    if (user.isRequest) {
      actionButtons = `
        <button class="btn-action primary" data-action="accept-request" data-id="${user.requestId}">Aceitar</button>
        <button class="btn-action secondary" data-action="decline-request" data-id="${user.requestId}">Recusar</button>
      `;
    } else {
      actionButtons = `
        <button class="btn-action primary" data-action="chat" data-username="${escapeHtml(user.username)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Conversar
        </button>
        ${!user.isFriend ? `
          <button class="btn-action secondary" data-action="add-friend" data-username="${escapeHtml(user.username)}">
            Adicionar
          </button>
        ` : ''}
      `;
    }

    return `
      <div class="user-card" data-username="${escapeHtml(user.username || '')}">
        <div class="user-main-info">
          <div class="avatar-wrapper">
            <div class="avatar-placeholder alt1">
              ${escapeHtml(getAvatarText(user))}
            </div>
            <span class="status-indicator ${statusClass}"></span>
          </div>

          <div class="user-details">
            <div class="user-title-row">
              <span class="user-title">${escapeHtml(user.displayName || user.username || 'Utilizador')}</span>
              <span class="activity-badge badge-dev">${escapeHtml(badge)}</span>
            </div>
            <div class="user-status-text">${escapeHtml(statusText)}</div>
          </div>
        </div>

        <div class="user-card-actions">
          ${actionButtons}
        </div>
      </div>
    `;
  }

  function getFilteredUsers() {
    const map = new Map();

    // Adiciona Amigos
    state.friends.forEach(f => {
      const uname = f.username || f.user2 || f.user1;
      if (uname && uname !== state.currentUser?.username) {
        map.set(uname, { ...f, username: uname, isFriend: true, status: f.status || 'online' });
      }
    });

    // Adiciona Utilizadores Online
    state.onlineUsers.forEach(u => {
      if (u.username && u.username !== state.currentUser?.username) {
        const existing = map.get(u.username);
        map.set(u.username, { ...existing, ...u, status: 'online' });
      }
    });

    // Adiciona Pedidos Pendentes
    if (state.filter === 'requests') {
      return state.friendRequests.map(r => ({
        requestId: r.id,
        username: r.sender,
        displayName: r.sender,
        isRequest: true,
        status: 'online',
        bio: 'Enviou-lhe um pedido de amizade'
      }));
    }

    let list = Array.from(map.values());

    if (state.filter === 'online') {
      list = list.filter(u => u.status === 'online' || u.status === 'idle');
    }

    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter(u =>
        (u.displayName || u.username || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  function renderUsers() {
    const list = getFilteredUsers();

    if (!list.length) {
      els.usersContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title" style="color: var(--text-muted); padding: 20px 0; text-align: center;">
            Nenhum utilizador encontrado.
          </div>
        </div>
      `;
      return;
    }

    els.usersContainer.innerHTML = list.map(buildUserCard).join('');
  }

  function bindUserActions() {
    els.usersContainer.addEventListener('click', async (event) => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.dataset.action;
      const username = actionEl.dataset.username;
      const requestId = actionEl.dataset.id;

      try {
        if (action === 'chat') {
          openModal('chat');
        } else if (action === 'add-friend') {
          await fetchJson(`${API_BASE}/friends/send-request`, {
            method: 'POST',
            body: JSON.stringify({ targetUsername: username })
          });
          alert('Pedido de amizade enviado!');
          await refreshAllData();
        } else if (action === 'accept-request') {
          await fetchJson(`${API_BASE}/friends/accept-request`, {
            method: 'POST',
            body: JSON.stringify({ requestId })
          });
          await refreshAllData();
        } else if (action === 'decline-request') {
          await fetchJson(`${API_BASE}/friends/decline-request`, {
            method: 'POST',
            body: JSON.stringify({ requestId })
          });
          await refreshAllData();
        }
      } catch (err) {
        alert(err.message || 'Erro ao processar ação');
      }
    });
  }

  async function loadCurrentUser() {
    try {
      const res = await fetchJson(`${API_BASE}/auth/me`);
      if (res && res.user) {
        state.currentUser = res.user;
        els.userDisplayName.textContent = res.user.displayName || res.user.username;
        els.userUsername.textContent = `@${res.user.username}`;
        els.userAvatarText.textContent = getAvatarText(res.user);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  async function refreshAllData() {
    try {
      const [friendsRes, requestsRes, onlineRes] = await Promise.allSettled([
        fetchJson(`${API_BASE}/friends/list`),
        fetchJson(`${API_BASE}/friends/requests`),
        fetchJson(`${API_BASE}/friends/online`)
      ]);

      if (friendsRes.status === 'fulfilled' && friendsRes.value) {
        state.friends = friendsRes.value.friends || [];
      }
      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        state.friendRequests = requestsRes.value.requests || [];
      }
      if (onlineRes.status === 'fulfilled' && onlineRes.value) {
        state.onlineUsers = onlineRes.value.onlineUsers || [];
      }

      updateStatsUI();
      renderUsers();
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  }

  function openModal(type) {
    els.modal.style.display = 'flex';
    if (type === 'chat') {
      els.modalTitle.textContent = 'Node.GG - Chat';
      els.modalIframe.src = '../chat/index.html';
    } else if (type === 'settings') {
      els.modalTitle.textContent = 'Node.GG - Configurações';
      els.modalIframe.src = '../settings/index.html';
    }
  }

  function closeModal() {
    els.modal.style.display = 'none';
    els.modalIframe.src = '';
  }

  function bindUI() {
    if (els.closeModalBtn) {
      els.closeModalBtn.addEventListener('click', closeModal);
    }

    window.openModal = openModal;

    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(btn => btn.classList.remove('active'));
        tab.classList.add('active');

        const label = tab.textContent.trim().toLowerCase();
        if (label === 'pedidos') state.filter = 'requests';
        else if (label === 'online') state.filter = 'online';
        else state.filter = 'all';

        renderUsers();
      });
    });

    if (els.searchInput) {
      els.searchInput.addEventListener('input', (e) => {
        state.search = e.target.value.trim().toLowerCase();
        renderUsers();
      });
    }
  }

  async function init() {
    bindUI();
    bindUserActions();
    await loadCurrentUser();
    await refreshAllData();

    // Atualização periódica a cada 10 segundos
    setInterval(refreshAllData, 10000);
  }

  init();
})();
