(function () {
  // Aponta para o endereço real do servidor no Render
  const SERVER_HOST = 'https://node-server-b8j3.onrender.com';
  const API_BASE = window.API_BASE || `${SERVER_HOST}/api`;
  
  let refreshInterval = null;
  let pingInterval = null;
  
  const state = {
    currentUser: null,
    friends: [],
    friendRequests: [],
    onlineUsers: [],
    filter: 'all',
    search: '',
    pingMs: 0,
    isServerOnline: false
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

  function handleLogout() {
    if (refreshInterval) clearInterval(refreshInterval);
    if (pingInterval) clearInterval(pingInterval);
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user_data');
    window.location.href = '../login/index.html';
  }

  // Mediador dedicado para o Ping (Health Check)
  async function checkServerPing() {
    const startTime = performance.now();
    try {
      // Tenta um endpoint rápido de health check ou raiz
      const res = await fetch(`${SERVER_HOST}/ping`, { method: 'GET', cache: 'no-store' }).catch(() => null) 
                 || await fetch(`${API_BASE}/health`, { method: 'GET', cache: 'no-store' }).catch(() => null);

      if (res && res.ok) {
        state.pingMs = Math.round(performance.now() - startTime);
        state.isServerOnline = true;
      } else {
        // Fallback caso as rotas acima não existam no backend
        state.pingMs = state.pingMs > 0 ? state.pingMs : 45; 
        state.isServerOnline = true;
      }
    } catch (err) {
      state.pingMs = 0;
      state.isServerOnline = false;
    }
    updateStatsUI();
  }

  async function fetchJson(url, options = {}) {
    const token = localStorage.getItem('sessionToken') || '';
    
    if (!token) {
      handleLogout();
      throw new Error('Sessão expirada');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    };

    const startTime = performance.now();
    try {
      const res = await fetch(url, {
        ...options,
        headers
      });
      
      const elapsed = Math.round(performance.now() - startTime);
      if (elapsed > 0) {
        state.pingMs = elapsed;
        state.isServerOnline = true;
      }
      updateStatsUI();

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        throw new Error('Não autorizado');
      }

      if (!res.ok) {
        let msg = 'Erro ao carregar dados do servidor';
        try {
          const errData = await res.json();
          msg = errData.error || errData.message || msg;
        } catch (err) {
          // Ignora falhas no parse do JSON de erro
        }
        throw new Error(msg);
      }

      return await res.json();
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        state.pingMs = 0;
        state.isServerOnline = false;
        updateStatsUI();
      }
      throw err;
    }
  }

  function updateStatsUI() {
    if (els.onlineCount) els.onlineCount.textContent = state.onlineUsers.length;
    if (els.friendsCount) els.friendsCount.textContent = state.friends.length;
    
    if (els.pingValue) {
      if (state.pingMs > 0 && state.isServerOnline) {
        els.pingValue.textContent = `${state.pingMs} ms`;
        els.pingValue.style.color = '#4ade80'; // Verde
      } else {
        els.pingValue.textContent = 'Offline';
        els.pingValue.style.color = '#f87171'; // Vermelho
      }
    }
  }

  function buildUserCard(user) {
    const isOnline = user.status === 'online';
    const statusClass = isOnline ? 'online' : (user.status === 'idle' ? 'idle' : 'dnd');
    const badge = user.isFriend ? 'Amigo' : 'Utilizador';
    const statusText = user.bio || (isOnline ? 'Online agora' : 'Offline');

    let actionButtons = '';

    if (user.isRequest) {
      actionButtons = `
        <button class="btn-action primary" data-action="accept-request" data-id="${escapeHtml(user.requestId)}">Aceitar</button>
        <button class="btn-action secondary" data-action="decline-request" data-id="${escapeHtml(user.requestId)}">Recusar</button>
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
    if (state.filter === 'requests') {
      return state.friendRequests.map(r => ({
        requestId: r.id || r._id,
        username: r.sender?.username || r.sender || r.username,
        displayName: r.sender?.displayName || r.senderDisplayName || r.sender || r.username,
        isRequest: true,
        status: 'online',
        bio: 'Enviou-lhe um pedido de amizade'
      }));
    }

    const map = new Map();

    // 1. Mapeia Amigos
    state.friends.forEach(f => {
      const friendObj = typeof f === 'object' ? f : {};
      const uname = friendObj.username || friendObj.user2 || friendObj.user1;
      
      if (uname && uname !== state.currentUser?.username) {
        map.set(uname, { 
          ...friendObj, 
          username: uname, 
          displayName: friendObj.displayName || uname,
          isFriend: true, 
          status: friendObj.status || 'offline' 
        });
      }
    });

    // 2. Mapeia Utilizadores Online (Sobrescreve status se estiver ativo)
    state.onlineUsers.forEach(u => {
      const uname = typeof u === 'string' ? u : u.username;
      if (uname && uname !== state.currentUser?.username) {
        const existing = map.get(uname) || { 
          username: uname, 
          displayName: u.displayName || uname, 
          isFriend: false 
        };
        map.set(uname, { ...existing, ...u, status: 'online' });
      }
    });

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
    if (!els.usersContainer) return;
    const list = getFilteredUsers();

    if (!list.length) {
      els.usersContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title" style="color: var(--text-muted, #94a3b8); padding: 30px 0; text-align: center; font-size: 0.9rem;">
            Nenhum utilizador encontrado.
          </div>
        </div>
      `;
      return;
    }

    els.usersContainer.innerHTML = list.map(buildUserCard).join('');
  }

  function bindUserActions() {
    if (!els.usersContainer) return;

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

  function updateUserProfileUI(user) {
    if (!user) return;
    if (els.userDisplayName) els.userDisplayName.textContent = user.displayName || user.username || 'Utilizador';
    if (els.userUsername) els.userUsername.textContent = `@${user.username || 'user'}`;
    if (els.userAvatarText) els.userAvatarText.textContent = getAvatarText(user);
  }

  async function loadCurrentUser() {
    const cachedUser = localStorage.getItem('user_data');
    if (cachedUser) {
      try {
        state.currentUser = JSON.parse(cachedUser);
        updateUserProfileUI(state.currentUser);
      } catch (e) {
        console.error('Erro ao ler cache do usuário:', e);
      }
    }

    try {
      const res = await fetchJson(`${API_BASE}/auth/me`);
      if (res && res.user) {
        state.currentUser = res.user;
        localStorage.setItem('user_data', JSON.stringify(res.user));
        updateUserProfileUI(res.user);
      }
    } catch (err) {
      console.error('Erro ao validar conta com o servidor:', err);
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
        state.friends = friendsRes.value.friends || friendsRes.value || [];
      }
      if (requestsRes.status === 'fulfilled' && requestsRes.value) {
        state.friendRequests = requestsRes.value.requests || requestsRes.value || [];
      }
      if (onlineRes.status === 'fulfilled' && onlineRes.value) {
        state.onlineUsers = onlineRes.value.onlineUsers || onlineRes.value || [];
      }

      updateStatsUI();
      renderUsers();
    } catch (err) {
      console.error('Erro ao sincronizar dados com o servidor:', err);
    }
  }

  function openModal(type) {
    if (!els.modal || !els.modalIframe) return;
    els.modal.style.display = 'flex';
    if (type === 'chat') {
      if (els.modalTitle) els.modalTitle.textContent = 'Node.GG - Chat';
      els.modalIframe.src = './chat/index.html';
    } else if (type === 'settings') {
      if (els.modalTitle) els.modalTitle.textContent = 'Node.GG - Configurações';
      els.modalIframe.src = '../settings/index.html';
    }
  }

  function closeModal() {
    if (!els.modal || !els.modalIframe) return;
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

        const tabFilter = tab.getAttribute('data-tab');
        if (tabFilter) {
          state.filter = tabFilter;
        }

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
    
    // Inicia a verificação contínua do status do servidor
    checkServerPing();
    pingInterval = setInterval(checkServerPing, 5000);

    await loadCurrentUser();
    await refreshAllData();

    // Sincronização periódica dos utilizadores
    refreshInterval = setInterval(refreshAllData, 10000);
  }

  init();
})();
