import{CONFIG}from"./config.js";import{Realtime}from"./realtime.js";

function icon(name,size=18){
 const paths={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  message:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a8 8 0 0 0 0-6l1.5-1.1-1.5-2.6-1.8.6a8 8 0 0 0-5.2-1.9L12 2h-3l-.4 2a8 8 0 0 0-2.4 1.4l-1.8-.6-1.5 2.6L4.4 9a8 8 0 0 0 0 6l-1.5 1.1 1.5 2.6 1.8-.6a8 8 0 0 0 5.2 1.9L12 22h3l.4-2a8 8 0 0 0 2.4-1.4l1.8.6 1.5-2.6z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  logout:'<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7.5 9.6a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.7 1.9z"/>',
  video:'<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  reply:'<path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  thumb:'<path d="M7 10v12H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3z"/><path d="M7 10 12 2a3 3 0 0 1 3 3l-1 5h5a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7z"/>',
  pin:'<path d="m16 3 5 5-4 1-4 4-1 4-2 2-2-6-6-2 2-2 4-1 4-4z"/><path d="m3 21 6-6"/>',
  forward:'<path d="m14 9 7 3-7 3v-2H3v-2h11z"/>',
  edit:'<path d="m16 4 4 4L8 20H4v-4z"/><path d="m14 6 4 4"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6"/><path d="M10 11v5m4-5v5"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  close:'<path d="m18 6-12 12M6 6l12 12"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  device:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
  camera:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
  screen:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="m8 21 4-4 4 4"/>'
 };
 return '<svg class="icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.device)+'</svg>';
}
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)],esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),initial=s=>String(s||"?").slice(0,2).toUpperCase(),clock=n=>n?new Date(Number(n)).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):"";
const S={ws:new Realtime(),user:null,token:null,page:"home",friends:[],requests:[],groups:[],conversations:[],notifications:[],active:null,replyTo:null,call:null,pendingIce:[],pendingRemoteIce:[],presence:"online"};
function toast(t,type=""){
 let n=document.createElement("div");n.className="toast "+type;
 let glyph=document.createElement("span");glyph.className="toast-icon";
 glyph.innerHTML=icon(type==="error"?"close":type==="success"?"check":"device",17);
 let message=document.createElement("span");message.className="toast-text";message.textContent=t;
 n.append(glyph,message);$("#toasts").append(n);setTimeout(()=>n.remove(),4000);
}
function avatar(u){return u?.avatar?'<div class="avatar"><img src="'+esc(u.avatar)+'"></div>':'<div class="avatar">'+esc(initial(u?.displayName||u?.username||u?.name))+'</div>'}
async function api(path,opts={}){let r=await fetch(CONFIG.HTTP+path,{...opts,headers:{"Content-Type":"application/json",Authorization:"Bearer "+S.token,...opts.headers}}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Falha ao acessar o servidor.");return d}
function saveAuth(user,token,remember){S.user=user;S.token=token;let a=remember?localStorage:sessionStorage,b=remember?sessionStorage:localStorage;a.setItem(CONFIG.TOKEN,token);a.setItem(CONFIG.USER,JSON.stringify(user));b.removeItem(CONFIG.TOKEN);b.removeItem(CONFIG.USER)}
function auth(mode="login",msg=""){let reg=mode==="register";$("#app").innerHTML=`<main class="auth"><section class="window"><div class="authgrid"><aside class="brand"><div class="lockup"><img src="./pages/login/icon.png"><div><div class="brandname">Node<span>.GG</span></div><div class="sub">Voz, Chat & Comunidades</div></div></div><div class="mascot"><img src="./pages/login/icon.png"><h2>Conecte-se com o seu squad</h2><p>Conversas, chamadas e comunidades em um só lugar. Feito para manter sua equipe por perto.</p></div></aside><section class="authform"><div class="tabs"><button data-mode="login" class="${!reg?"active":""}">Entrar</button><button data-mode="register" class="${reg?"active":""}">Criar conta</button></div>${msg?'<div class="feedback">'+esc(msg)+'</div>':""}<form id="authform"><h1>${reg?'Crie sua conta':'Entre no Node.GG'}</h1><div class="field ${reg?"":"hidden"}"><label for="username">Nome de usuário</label><input id="username" placeholder="seu_usuario" ${reg?"required":""}></div><div class="field ${reg?"":"hidden"}"><label for="email">E-mail</label><input id="email" type="email" placeholder="voce@exemplo.com" ${reg?"required":""}></div><div class="field"><label for="identifier">${reg?"Nome de exibição":"E-mail ou usuário"}</label><input id="identifier" placeholder="${reg?"Como você quer aparecer":"seuemail@exemplo.com ou usuário"}" ${reg?"":"required"}></div><div class="field"><label for="password">Senha</label><input id="password" type="password" minlength="6" required></div><div class="row formrow"><label class="check"><input type="checkbox" id="remember" checked> Lembrar de mim</label><span>Conexão protegida</span></div><button class="btn primary block" id="submit">${reg?"Criar minha conta":"Entrar no Node"}</button></form><div class="switch">${reg?'Já tem uma conta? <button data-mode="login">Entrar</button>':'Não tem uma conta? <button data-mode="register">Registre-se agora</button>'}</div></section></div></section></main>`;$$("[data-mode]").forEach(b=>b.onclick=()=>auth(b.dataset.mode));$("#authform").onsubmit=async e=>{e.preventDefault();let b=$("#submit");b.disabled=true;b.textContent="Conectando…";try{await S.ws.connect();let p=reg?{type:"register",username:$("#username").value.trim(),email:$("#email").value.trim(),password:$("#password").value,displayName:$("#identifier").value.trim()||$("#username").value.trim(),avatar:""}:{type:"login",identifier:$("#identifier").value.trim(),password:$("#password").value};let r=await S.ws.request(p,["auth_success","auth_error","maintenance_active"],16000);if(r.type!=="auth_success")throw Error(r.message||"Não foi possível entrar.");let t=r.sessionToken||r.token||r.user?.sessionToken;if(!t)throw Error("O servidor não retornou o token.");saveAuth(r.user,t,$("#remember").checked);await start()}catch(e){toast(e.message,"error");b.disabled=false;b.textContent=reg?"Criar minha conta":"Entrar no Node"}}}
function shell(){$("#app").innerHTML=`<div class="app"><nav class="rail"><img class="logo" src="./pages/login/icon.png"><button class="active" data-page="home" aria-label="Início" title="Início">${icon("home",20)}</button><button data-page="messages" aria-label="Mensagens" title="Mensagens">${icon("message",20)}</button><button data-page="friends" aria-label="Amigos" title="Amigos">${icon("users",20)}</button><button data-page="groups" aria-label="Grupos" title="Grupos">${icon("layers",20)}</button><button data-page="notifications" aria-label="Notificações" title="Notificações">${icon("bell",20)}</button><div class="spacer"></div><button data-page="settings" aria-label="Configurações" title="Configurações">${icon("settings",20)}</button></nav><aside class="sidebar"><div class="sidehead"><b>Node<span style="color:var(--green)">.GG</span></b><button class="btn" id="new" title="Criar novo" aria-label="Criar novo">${icon("plus",18)}</button></div><div class="sidebody"><div class="label">NAVEGAÇÃO</div><button class="nav active" data-page="home"><i>${icon("home",17)}</i>Visão geral</button><button class="nav" data-page="messages"><i>${icon("message",17)}</i>Mensagens</button><button class="nav" data-page="friends"><i>${icon("users",17)}</i>Amigos <span class="count" id="friend-count">0</span></button><button class="nav" data-page="groups"><i>${icon("layers",17)}</i>Grupos</button><button class="nav" data-page="notifications"><i>${icon("bell",17)}</i>Notificações <span class="count" id="notification-count">0</span></button><div class="label">CONTA</div><button class="nav" data-page="settings"><i>${icon("settings",17)}</i>Configurações</button></div><div class="usercard">${avatar(S.user)}<div class="person"><strong>${esc(S.user?.displayName||S.user?.username)}</strong><span>@${esc(S.user?.username)}</span></div><button class="btn quiet" id="logout" title="Sair" aria-label="Sair">${icon("logout",17)}</button></div></aside><main class="workspace"><header class="topbar"><div><h1 id="title">Visão geral</h1><p id="subtitle">Seu espaço, suas conversas.</p></div><div class="topactions"><i class="dot online" id="dot"></i><span id="connection" style="font-size:10px;color:var(--muted)">Conectado</span><button class="btn" id="presence">● ${esc(S.presence)}</button></div></header><section class="content" id="view"></section></main></div>`;$$("[data-page]").forEach(b=>b.onclick=()=>go(b.dataset.page));$("#logout").onclick=logout;$("#new").onclick=()=>{let m=showModal("Criar novo","Escolha uma ação.",'<button class="btn" id="newfriend">Adicionar amigo</button><button class="btn" id="newgroup">Criar grupo</button>');for(const [id,page,action] of [['newfriend','friends','add'],['newgroup','groups','create']])$('#'+id,m).onclick=()=>{m.remove();go(page);$('#'+action).click()}};$("#presence").onclick=presenceDialog}
const pages=['home','messages','groups','friends','notifications','settings'];
function setRoute(route){
 if(location.hash.slice(1)!==route)history.pushState(null,'','#'+route);
}
function go(p,record=true){if(!pages.includes(p))return;if(record)setRoute(p);S.active=null;S.replyTo=null;S.page=p;$("#view")?.classList.toggle("chat-content",p==="messages");$$("[data-page]").forEach(b=>{b.classList.toggle("active",b.dataset.page===p);if(b.dataset.page===p)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});let t={home:["Visão geral","Seu espaço, suas conversas."],messages:["Mensagens","Conversas privadas em tempo real."],friends:["Amigos","Sua rede no Node.GG."],groups:["Grupos","Converse e organize sua equipe."],notifications:["Notificações","Tudo o que aconteceu enquanto você estava fora."],settings:["Configurações","Sua conta e seus dispositivos."]}[p];$("#title").textContent=t[0];$("#subtitle").textContent=t[1];({home,messages,friends,groups,notifications,settings})[p]()}
function showModal(title,desc,body){
 const previous=document.activeElement,n=document.createElement("div");
 n.className="modalbg";
 n.innerHTML='<section class="modal" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p>'+body+'<div class="modalactions"><button class="btn" data-close>Fechar</button></div></section>';
 document.body.append(n);
 const close=()=>{n.remove();if(previous?.isConnected)previous.focus()};
 $("[data-close]",n).onclick=close;
 n.onclick=e=>{if(e.target===n)close()};
 n.onkeydown=e=>{
  if(e.key==="Escape"){e.preventDefault();close()}
  if(e.key!=="Tab")return;
  const fields=$$("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",n).filter(x=>x.getClientRects().length);
  const first=fields[0],last=fields.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
  if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
 };
 $("input,button,select,textarea",n)?.focus();
 return n;
}
function home() {
 const view=$("#view");
 const shortcuts=[
  ["friends","users","Amigos",S.friends.length],
  ["messages","message","Conversas",S.conversations.length],
  ["groups","layers","Grupos",S.groups.length]
 ];
 const recent=S.conversations.slice(0,6).map(c=>`
  <button class="inbox-row" data-open="${esc(c.username)}">
   ${avatar(c)}<span class="person"><strong>${esc(c.displayName||c.username)}</strong><span>${esc(c.lastMessage?.preview||"")}</span></span>
   <span class="inbox-meta">${clock(c.lastMessage?.timestamp)}${c.unreadCount?'<b>'+Number(c.unreadCount)+'</b>':''}</span>
  </button>`).join("");
 const rooms=S.groups.slice(0,6).map(g=>`
  <button class="inbox-row" data-open-group="${esc(g.id)}">
   ${groupAvatar(g)}<span class="person"><strong>${esc(g.name)}</strong><span>${Number(g.member_count)} membros</span></span>
  </button>`).join("");
 view.innerHTML=`<div class="welcome home-welcome"><div><h2>Bom te ver, ${esc(S.user?.displayName||S.user?.username)}.</h2>
  <p>${S.unread?Number(S.unread)+' mensagens não lidas.':'Sua caixa de entrada está em dia.'}</p></div>
  <button class="btn primary" data-new-chat>${icon("plus",16)} Nova conversa</button></div>
  <div class="stats">${shortcuts.map(([page,glyph,name,count])=>`<button class="stat shortcut" data-go="${page}"><i>${icon(glyph,20)}</i><strong>${count}</strong><span>${name}</span></button>`).join("")}</div>
  <div class="grid"><section class="panel"><div class="panelhead"><h3>Conversas recentes</h3><button class="btn quiet" data-go="messages">Ver todas →</button></div>
  ${recent||'<div class="start-here">'+icon("message",24)+'<strong>Sua primeira conversa</strong><button class="btn" data-add>Adicionar amigo</button></div>'}</section>
  <section class="panel"><div class="panelhead"><h3>Seus grupos</h3><button class="btn quiet" data-go="groups">Ver todos →</button></div>
  ${rooms||'<div class="start-here">'+icon("layers",24)+'<strong>Converse com seu grupo</strong><button class="btn" data-create>Criar grupo</button></div>'}</section></div>`;
 $("[data-new-chat]",view).onclick=chooseContact;
 $$("[data-go]",view).forEach(b=>b.onclick=()=>go(b.dataset.go));
 $$("[data-open]",view).forEach(b=>b.onclick=()=>openChat(b.dataset.open));
 $$("[data-open-group]",view).forEach(b=>b.onclick=()=>openGroup(b.dataset.openGroup));
 $("[data-add]",view)?.addEventListener("click",()=>{go("friends");$("#add").click()});
 $("[data-create]",view)?.addEventListener("click",()=>{go("groups");$("#create").click()});
}
async function loadFriends(){let[a,b]=await Promise.all([api("/api/friends/list"),api("/api/friends/requests")]);S.friends=a.friends||[];S.requests=b.requests||[];if($("#friend-count"))$("#friend-count").textContent=S.requests.length||S.friends.length}
function friends(){let v=$("#view");v.innerHTML='<div class="welcome"><div><h2>Amigos</h2><p>Encontre pessoas e mantenha contato.</p></div><button class="btn primary" id="add">＋ Adicionar amigo</button></div><input class="search" id="friendsearch" placeholder="Buscar na sua lista…"><section class="panel" style="margin-top:14px"><div class="panelhead"><h3>Pedidos recebidos</h3><span>'+S.requests.length+' pendentes</span></div><div id="requests"></div><div class="panelhead" style="margin-top:20px"><h3>Seus amigos</h3><span>'+S.friends.length+' pessoas</span></div><div id="friendlist"></div></section>';$("#requests").innerHTML=S.requests.map(r=>{let u=r.username||r.from||r.requester_username;return '<div class="listrow">'+avatar({username:u})+'<div class="person"><strong>'+esc(u)+'</strong><span>Pedido de amizade</span></div><button class="btn primary" data-accept="'+esc(u)+'">Aceitar</button><button class="btn" data-decline="'+esc(u)+'">Recusar</button></div>'}).join("")||'<div class="empty">Nenhum pedido pendente.</div>';drawFriendList();$("#friendsearch").oninput=drawFriendList;$("#add").onclick=()=>{let m=showModal("Adicionar amigo","Digite o nome de usuário exato.",'<div class="field"><label>Nome de usuário</label><input id="friendname"></div><button class="btn primary" id="sendfriend">Enviar pedido</button>');$("#sendfriend").onclick=async()=>{try{await api("/api/friends/send-request",{method:"POST",body:JSON.stringify({targetUsername:$("#friendname").value.trim()})});m.remove();toast("Pedido enviado.","success")}catch(e){toast(e.message,"error")}}};$$("[data-accept]").forEach(b=>b.onclick=async()=>{try{await api("/api/friends/accept-request",{method:"POST",body:JSON.stringify({requesterUsername:b.dataset.accept})});await loadFriends();friends();toast("Amizade adicionada.","success")}catch(e){toast(e.message,"error")}});$$("[data-decline]").forEach(b=>b.onclick=async()=>{try{await api("/api/friends/decline-request",{method:"POST",body:JSON.stringify({requesterUsername:b.dataset.decline})});await loadFriends();friends()}catch(e){toast(e.message,"error")}})}
function drawFriendList(){let q=($("#friendsearch")?.value||"").toLowerCase(),a=S.friends.filter(f=>(f.username||"").toLowerCase().includes(q));$("#friendlist").innerHTML=a.map(f=>'<div class="listrow">'+avatar(f)+'<div class="person"><strong>'+esc(f.displayName||f.username)+'</strong><span>@'+esc(f.username)+'</span></div><button class="btn" data-msg="'+esc(f.username)+'">Mensagem</button><button class="btn quiet danger" data-remove="'+esc(f.username)+'">Remover</button></div>').join("")||'<div class="empty">Nenhum amigo encontrado.</div>';$$("[data-msg]").forEach(b=>b.onclick=()=>openChat(b.dataset.msg));$$("[data-remove]").forEach(b=>b.onclick=async()=>{if(!confirm("Remover este amigo?"))return;try{await api("/api/friends/remove",{method:"POST",body:JSON.stringify({friendUsername:b.dataset.remove})});await loadFriends();friends()}catch(e){toast(e.message,"error")}})}
async function loadGroups(){let r=await S.ws.request({type:"group_list"},"group_list");S.groups=r.groups||[]}
function groupAvatar(group){
 return group?.avatar?avatar({avatar:group.avatar}):'<span class="avatar group-avatar">'+icon('layers',18)+'</span>';
}
function groups(){let v=$("#view");v.innerHTML='<div class="welcome"><div><h2>Grupos</h2><p>Espaços privados para conversar com várias pessoas.</p></div><button class="btn primary" id="create">＋ Criar grupo</button></div><section class="panel" id="grouplist"></section>';$("#grouplist").innerHTML=S.groups.map(g=>'<div class="listrow">'+groupAvatar(g)+'<div class="person"><strong>'+esc(g.name)+'</strong><span>'+Number(g.member_count||0)+' membros · '+esc(g.my_role||"member")+'</span></div><div class="row"><button class="btn" data-group="'+esc(g.id)+'">Abrir</button><button class="btn" data-manage="'+esc(g.id)+'">•••</button></div></div>').join("")||'<div class="empty"><strong>Seu primeiro grupo começa aqui</strong><span>Crie um grupo e convide seus amigos.</span></div>';$("#create").onclick=()=>{let m=showModal("Criar grupo","Escolha um nome.",'<div class="field"><label>Nome do grupo</label><input id="groupname" maxlength="60"></div><button class="btn primary" id="savegroup">Criar grupo</button>');$("#savegroup").onclick=async()=>{try{let r=await S.ws.request({type:"group_create",name:$("#groupname").value.trim()},["group_created","group_error"]);if(r.type==="group_error")throw Error(r.message);m.remove();await loadGroups();groups();toast("Grupo criado.","success")}catch(e){toast(e.message,"error")}}};$$("[data-group]").forEach(b=>b.onclick=()=>openGroup(b.dataset.group));$$("[data-manage]").forEach(b=>b.onclick=()=>manageGroup(b.dataset.manage))}
function manageGroup(id){const g=S.groups.find(x=>x.id===id);if(!g)return;const owner=g.my_role==="owner";let m=showModal("Gerenciar grupo",g.name,'<div class="field"><label>Adicionar membro</label><input id="membername" placeholder="nome_de_usuario"></div><button class="btn primary" id="addmember">Adicionar membro</button><div class="field" style="margin-top:14px"><label>Nome do grupo</label><input id="renamegroup" maxlength="60" value="'+esc(g.name)+'"></div><button class="btn" id="renamegroupbtn">Renomear grupo</button><div class="row" style="margin-top:14px"><button class="btn" id="leavegroupbtn">Sair do grupo</button>'+(owner?'<button class="btn danger" id="deletegroupbtn">Excluir grupo</button>':'')+'</div>');loadMemberControls(m,g).catch(e=>toast(e.message,"error"));$("#addmember").onclick=async()=>{try{let r=await S.ws.request({type:"group_add_member",groupId:id,username:$("#membername").value.trim()},["group_member_added","group_error"]);if(r.type==="group_error")throw Error(r.message);toast("Membro adicionado.","success");m.remove();await loadGroups();groups()}catch(e){toast(e.message,"error")}};$("#renamegroupbtn").onclick=async()=>{try{let r=await S.ws.request({type:"group_rename",groupId:id,name:$("#renamegroup").value.trim()},["group_updated","group_renamed","group_error"]);if(r.type==="group_error")throw Error(r.message);toast("Grupo atualizado.","success");m.remove();await loadGroups();groups()}catch(e){toast(e.message,"error")}};$("#leavegroupbtn").onclick=async()=>{try{let r=await S.ws.request({type:"group_leave",groupId:id},["group_left","group_error"]);if(r.type==="group_error")throw Error(r.message);m.remove();await loadGroups();groups()}catch(e){toast(e.message,"error")}};$("#deletegroupbtn")?.addEventListener("click",async()=>{if(!confirm("Excluir este grupo permanentemente?"))return;try{let r=await S.ws.request({type:"group_delete",groupId:id},["group_deleted","group_error"]);if(r.type==="group_error")throw Error(r.message);m.remove();await loadGroups();groups()}catch(e){toast(e.message,"error")}})}
function messages(){let v=$("#view");v.innerHTML='<div class="chatlayout"><aside class="chatlist"><div class="chatlisthead"><div class="panelhead"><h2>Mensagens</h2><button class="btn" id="compose" aria-label="Nova conversa">＋</button></div><input class="search" id="convsearch" placeholder="Buscar conversa…"></div><div class="chatitems" id="conversations"></div></aside><section class="chatmain" id="chatmain"><div class="empty"><strong>Suas conversas</strong><span>Selecione uma conversa para começar.</span></div></section></div>';drawConversations();$("#compose").onclick=chooseContact;$("#convsearch").oninput=drawConversations}
function chooseContact(){
 const dlg=showModal("Nova conversa","Escolha um contato.",'<input class="search" aria-label="Buscar contato" placeholder="Buscar nome ou usuário"><div class="lookup-results"></div>');
 const input=$("input",dlg),list=$(".lookup-results",dlg);
 function draw(){
  const query=input.value.trim().toLowerCase();
  const contacts=[...new Map([...S.friends,...(S.users||[])].filter(u=>u?.username&&u.username!==S.user.username).map(u=>[u.username,u])).values()];
  list.innerHTML=contacts.filter(u=>(u.username+" "+(u.displayName||"")).toLowerCase().includes(query)).slice(0,100).map(u=>'<button class="inbox-row" data-peer="'+esc(u.username)+'">'+avatar(u)+'<span class="person"><strong>'+esc(u.displayName||u.username)+'</strong><span>@'+esc(u.username)+'</span></span></button>').join("")||'<div class="empty">Nenhum contato encontrado.</div>';
  $$("[data-peer]",list).forEach(b=>b.onclick=()=>{dlg.remove();openChat(b.dataset.peer)});
 }
 input.oninput=draw;draw();input.focus();
}
function drawConversations(){
 const list=$("#conversations");if(!list)return;
 const query=($("#convsearch")?.value||"").trim().toLowerCase();
 const rows=S.conversations.filter(c=>[c.username,c.displayName].some(x=>String(x||"").toLowerCase().includes(query)));
 list.innerHTML=rows.map(c=>{
  const unread=S.unreadByUser?.[c.username]??c.unreadCount;
  return `<button class="chatitem ${S.active?.username===c.username?'active':''}" data-chat="${esc(c.username)}">${avatar(c)}<span class="person"><strong>${esc(c.displayName||c.username)}</strong><span>${esc(c.lastMessage?.preview||"Comece uma conversa")}</span></span><span class="inbox-meta">${clock(c.lastMessage?.timestamp)}${unread?'<b>'+Number(unread)+'</b>':''}</span></button>`;
 }).join("")||'<div class="empty">'+(query?'Nenhuma conversa encontrada.':'Nenhuma conversa ainda.')+'</div>';
 list.onclick=event=>{const item=event.target.closest("[data-chat]");if(item)openChat(item.dataset.chat)};
}
async function openChat(username){
 if(!$("#chatmain"))go("messages",false);
 setRoute("chat-"+username);
 const active=S.active={kind:"direct",username,items:[]};
 S.replyTo=null;
 $(".chatlayout").classList.add("reading");
 $$("[data-chat]").forEach(b=>b.classList.toggle("active",b.dataset.chat===username));
 let main=$("#chatmain");
 main.innerHTML='<header class="chathead"><button class="btn chat-back" id="back">‹ Lista</button><div class="row">'+avatar({username})+'<div class="person"><strong>'+esc(username)+'</strong><span>@'+esc(username)+'</span></div></div><div class="row"><button class="btn icon-btn" id="voice" title="Chamada de voz" aria-label="Chamada de voz">'+icon("phone")+'</button><button class="btn icon-btn" id="video" title="Chamada de vídeo" aria-label="Chamada de vídeo">'+icon("video")+'</button></div></header><div class="messages" id="messages"></div><form class="composer" id="composer"><div class="composerbox"><textarea id="text" maxlength="4000" placeholder="Mensagem para @'+esc(username)+'…"></textarea><button class="btn primary send-btn" title="Enviar mensagem" aria-label="Enviar mensagem">'+icon("send")+'</button></div><div class="hint">Enter para enviar · Shift + Enter para quebrar linha</div></form>';
 $("#back").onclick=()=>go("messages");
 setupChatTools(active);
 try{
  let r=await S.ws.request({type:"get_chat_history_page",withUser:username,limit:50},"chat_history_page");
  if(S.active!==active)return;
  active.before=r.hasMore?r.nextBefore:null;
  renderMessages(mergeMessages(r.messages,active.items));
  S.ws.send({type:"mark_as_read",withUser:username});
 }catch(e){toast(e.message,"error")}
 if(S.active!==active)return;
 $("#composer").onsubmit=e=>{
  e.preventDefault();
  let t=$("#text").value.trim();
  if(t){
   S.ws.send({type:"chat_message",to:username,msg_type:"text",text:t,reply_to:S.replyTo||undefined});
   S.replyTo=null;$("#text").value="";
  }
 };
 $("#text").onkeydown=e=>{
  if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("#composer").requestSubmit()}
 };
 $("#voice").onclick=()=>startCall(username,false);
 $("#video").onclick=()=>startCall(username,true);
}

function renderMessages(ms){
 let b=$("#messages");if(!b)return;
 S.active.items=ms;
 b.innerHTML=ms.map(m=>{
  let mine=(m.sender||m.from)===S.user?.username,id=esc(m.id||m.messageId||"");
  let tools=S.active?.kind==="direct"&&id&&!m.deleted_for_all?'<div class="msgtools"><button title="Responder" aria-label="Responder" data-act="reply" data-id="'+id+'">'+icon("reply",14)+'</button><button title="Ver respostas" aria-label="Ver respostas" data-act="thread" data-id="'+id+'">↳</button><button title="Reagir" aria-label="Reagir" data-act="react" data-id="'+id+'">'+icon("thumb",14)+'</button><button title="Fixar" aria-label="Fixar" data-act="pin" data-id="'+id+'">'+icon("pin",14)+'</button><button title="Encaminhar" aria-label="Encaminhar" data-act="forward" data-id="'+id+'">'+icon("forward",14)+'</button>'+(mine?'<button title="Editar" aria-label="Editar" data-act="edit" data-id="'+id+'">'+icon("edit",14)+'</button><button title="Excluir" aria-label="Excluir" data-act="delete" data-id="'+id+'">'+icon("trash",14)+'</button>':'')+'</div>':'';
  return '<article data-message-id="'+id+'" class="message '+(mine?"mine":"")+'"><div class="author">'+esc(mine?"Você":m.sender||m.from||"")+'</div><div class="bubble">'+messageBody(m)+'</div>'+tools+'<div class="msgtime">'+clock(m.timestamp||m.createdAt||m.created_at)+(m.edited?' · editada':'')+(mine&&m.read_at?' · lida':'')+'</div></article>';
 }).join("")||'<div class="empty"><strong>Essa conversa está começando</strong><span>Envie a primeira mensagem.</span></div>';
 b.scrollTop=b.scrollHeight;
 $$("[data-act]",b).forEach(btn=>btn.onclick=()=>messageAction(btn.dataset.act,btn.dataset.id));
}

async function messageAction(action,id){let messageId=Number(id);if(!messageId)return;if(action==="thread"){
 try{const r=await S.ws.request({type:"get_thread_messages",messageId}, "thread_messages");showModal("Respostas",r.parent?.content?.slice(0,100)||"Mensagem",r.messages.map(m=>'<div class="listrow"><strong>'+esc(m.sender)+'</strong><span>'+messageBody(m)+'</span></div>').join("")||'<p>Nenhuma resposta.</p>')}catch(e){toast(e.message,"error")}
 }if(action==="reply"){S.replyTo=messageId;$("#text").placeholder="Respondendo à mensagem #"+messageId+"…";$("#text").focus()}if(action==="react"){const m=S.active.items.find(x=>Number(x.id)===messageId);S.ws.send({type:m?.reactions?.some(r=>r.username===S.user.username)?"remove_reaction":"add_reaction",messageId,emoji:"👍"})};if(action==="pin")S.ws.send({type:"pin_message",messageId});if(action==="edit"){let text=prompt("Editar mensagem:");if(text&&text.trim())S.ws.send({type:"edit_message",messageId,text:text.trim()})}if(action==="delete"&&confirm("Excluir esta mensagem para todos?"))S.ws.send({type:"delete_message",messageId,forAll:true});if(action==="forward"){let to=prompt("Encaminhar para qual usuário?");if(to)S.ws.send({type:"forward_message",messageId,to:to.trim()})}}
async function openGroup(id){
 let g=S.groups.find(x=>x.id===id);
 go("messages",false);setRoute("group-"+id);
 const active=S.active={kind:"group",id,name:g?.name||"Grupo",items:[]};
 $("#title").textContent=S.active.name;
 $("#view").innerHTML='<section class="chatmain"><header class="chathead"><button class="btn" id="allgroups">‹ Grupos</button>'+groupAvatar(g)+'<strong>'+esc(S.active.name)+'</strong><button class="btn icon-btn" id="groupcall" title="Entrar na chamada" aria-label="Entrar na chamada">'+icon("phone",17)+'</button></header><div class="messages" id="messages"></div><form class="composer" id="composer"><div class="composerbox"><textarea id="text" maxlength="4000" placeholder="Escreva uma mensagem…"></textarea><button class="btn primary send-btn" title="Enviar mensagem" aria-label="Enviar mensagem">'+icon("send")+'</button></div></form></section>';
 $("#allgroups").onclick=()=>go("groups");
 try{let r=await S.ws.request({type:"group_get_messages",groupId:id,limit:100},"group_messages");if(S.active!==active)return;renderMessages(mergeMessages(r.messages,active.items))}
 catch(e){toast(e.message,"error")}
 if(S.active!==active)return;
 $("#composer").onsubmit=e=>{
  e.preventDefault();let t=$("#text").value.trim();
  if(t){S.ws.send({type:"group_message",groupId:id,content:t});$("#text").value=""}
 };
 $("#groupcall").onclick=()=>joinGroup(id);
 const status=document.createElement("button");status.className="btn";status.textContent="Participantes";$("#groupcall").before(status);status.onclick=()=>groupCallStatus(g);

}

async function loadNotifications(){let r=await S.ws.request({type:"get_notifications",limit:60},"notifications_list");S.notifications=r.notifications||[];if($("#notification-count"))$("#notification-count").textContent=S.notifications.filter(n=>!n.readAt&&!n.read_at).length}
function replyToNotice(id, title) {
 const dialog=showModal('Responder',title||'Mensagem recebida',
  '<form class="notice-reply"><label>Mensagem<textarea required maxlength="4000" rows="3"></textarea></label><button class="btn primary">Enviar resposta</button></form>');
 const form=$('form',dialog),input=$('textarea',form),button=$('button',form);
 input.focus();
 form.onsubmit=async event=>{
  event.preventDefault();
  const text=input.value.trim();if(!text||button.disabled)return;
  button.disabled=true;
  try{
   await S.ws.request({type:'notification_reply',notificationId:id,text},'notification_reply_sent');
   dialog.remove();toast('Resposta enviada.','success');
   S.ws.send({type:'notification_mark_read',notificationId:id});
  }catch(error){toast(error.message,'error');button.disabled=false}
 };
}

function notifications(){
 const view=$('#view');
 view.innerHTML='<div class="welcome"><div><h2>Notificações</h2></div><button class="btn" id="markall">Marcar todas como lidas</button></div><div class="inbox-tabs" role="group" aria-label="Filtrar notificações"><button data-filter="all">Todas</button><button data-filter="unread">Não lidas</button></div><section class="panel" id="notices"></section>';
 const list=$('#notices'),unread=n=>!(n.readAt||n.read_at);
 const filter=S.noticeFilter||'all';
 $('#markall').disabled=!S.notifications.some(unread);
 $('#markall').onclick=()=>S.ws.send({type:'notifications_mark_all_read'});
 for(const btn of $$('[data-filter]',view)){
  btn.setAttribute('aria-pressed',String(btn.dataset.filter===filter));
  btn.onclick=()=>{S.noticeFilter=btn.dataset.filter;notifications()};
 }
 list.innerHTML=S.notifications.filter(n=>filter==='all'||unread(n)).map(n=>{
  const reply=['message','group_message'].includes(n.type);
  return `<article class="notice-card ${unread(n)?'unread':''}"><i>${icon(reply?'message':'bell',19)}</i><div class="notice-copy"><h3>${esc(n.title||'Notificação')}</h3><p>${esc(n.body||'')}</p><small>${clock(n.created_at||n.createdAt)}</small></div><div class="notice-actions">
   ${reply?'<button class="btn" data-reply="'+esc(n.id)+'">Responder</button>':''}
   ${unread(n)?'<button class="btn quiet" data-read="'+esc(n.id)+'">Marcar lida</button>':''}</div></article>`;
 }).join('')||'<div class="empty">Nenhuma notificação '+(filter==='unread'?'não lida.':'por aqui.')+'</div>';
 list.onclick=event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.read)S.ws.send({type:'notification_mark_read',notificationId:b.dataset.read});
  if(b.dataset.reply)replyToNotice(b.dataset.reply,S.notifications.find(n=>String(n.id)===b.dataset.reply)?.title);
 };
 const board=document.createElement('section');list.after(board);
 S.ws.request({type:'get_announcements'},'announcements_list').then(r=>{
  if(!r.items?.length)return;
  board.className='panel';board.innerHTML='<h3>Avisos do servidor</h3>'+r.items.map(a=>'<p>'+esc(a.message)+'</p>').join('');
 }).catch(()=>board.remove());
}
function settings(){let v=$("#view");v.innerHTML='<div class="settingsgrid"><section class="panel"><button class="nav active" data-tab="profile"><i>'+icon("users",17)+'</i>Perfil</button><button class="nav" data-tab="presence"><i>'+icon("bell",17)+'</i>Presença</button><button class="nav" data-tab="sessions"><i>'+icon("device",17)+'</i>Dispositivos</button><button class="nav" data-tab="push"><i>'+icon("bell",17)+'</i>Notificações</button></section><section class="panel settingsbody" id="settingsbody"></section></div><button class="btn danger settings-logout" id="logoutsettings">Sair da conta</button>';$("#logoutsettings").onclick=logout;settingTab("profile");$$("[data-tab]").forEach(b=>b.onclick=()=>{ $$("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));settingTab(b.dataset.tab)})}

async function openAvatarEditor(file,onApply){
 if(!file)return;
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)){
  toast("Escolha uma imagem PNG, JPG ou WebP.","error");return;
 }
 if(file.size>20*1024*1024){
  toast("A imagem original precisa ter menos de 20 MB.","error");return;
 }
 const objectUrl=URL.createObjectURL(file);
 const overlay=document.createElement("div");
 overlay.className="avatar-editor-backdrop";
 overlay.innerHTML='<section class="avatar-editor" role="dialog" aria-modal="true" aria-labelledby="avatarEditorTitle"><header class="avatar-editor-head"><div><strong id="avatarEditorTitle">Ajustar foto de perfil</strong><span>Arraste a imagem para posicionar e ajuste o zoom</span></div><button type="button" class="btn avatar-editor-close" id="avatarEditorClose" aria-label="Fechar">×</button></header><div class="avatar-editor-main"><div class="avatar-crop-stage" id="avatarCropStage"><img id="avatarCropImage" alt="Prévia do recorte" draggable="false"></div><p class="avatar-crop-hint">Prévia do recorte quadrado · arraste para mover</p><div class="avatar-editor-sliders"><label><span>Zoom <output id="avatarZoomValue">100%</output></span><input id="avatarZoom" type="range" min="100" max="300" value="100" step="1"></label><label><span>Horizontal</span><input id="avatarPositionX" type="range" min="-100" max="100" value="0" step="1"></label><label><span>Vertical</span><input id="avatarPositionY" type="range" min="-100" max="100" value="0" step="1"></label></div></div><footer class="avatar-editor-actions"><button type="button" class="btn" id="avatarReset">Centralizar</button><div><button type="button" class="btn" id="avatarCancel">Cancelar</button><button type="button" class="btn primary" id="avatarApply">'+icon("check",16)+' Usar imagem</button></div></footer></section>';
 document.body.append(overlay);
 const image=$("#avatarCropImage",overlay),stage=$("#avatarCropStage",overlay);
 const zoomInput=$("#avatarZoom",overlay),xInput=$("#avatarPositionX",overlay),yInput=$("#avatarPositionY",overlay);
 const zoomValue=$("#avatarZoomValue",overlay),applyButton=$("#avatarApply",overlay);
 let zoom=1,offsetX=0,offsetY=0,drag=null,closed=false,stageSize=stage.clientWidth||280;
 const close=()=>{
  if(closed)return;closed=true;URL.revokeObjectURL(objectUrl);overlay.remove();
  document.removeEventListener("keydown",onKey);
 };
 const onKey=e=>{if(e.key==="Escape")close()};
 document.addEventListener("keydown",onKey);
 $("#avatarEditorClose",overlay).onclick=close;
 $("#avatarCancel",overlay).onclick=close;
 overlay.addEventListener("click",e=>{if(e.target===overlay)close()});

 const metrics=()=>{
  stageSize=stage.clientWidth||280;
  const fit=Math.max(stageSize/image.naturalWidth,stageSize/image.naturalHeight);
  const width=image.naturalWidth*fit*zoom;
  const height=image.naturalHeight*fit*zoom;
  return {width,height,maxX:Math.max(0,(width-stageSize)/2),maxY:Math.max(0,(height-stageSize)/2)};
 };
 const sync=()=>{
  const m=metrics();
  offsetX=Math.max(-m.maxX,Math.min(m.maxX,offsetX));
  offsetY=Math.max(-m.maxY,Math.min(m.maxY,offsetY));
  image.style.width=m.width+"px";
  image.style.height=m.height+"px";
  image.style.transform="translate(-50%,-50%) translate("+offsetX+"px,"+offsetY+"px)";
  zoomValue.textContent=Math.round(zoom*100)+"%";
  xInput.value=m.maxX?String(Math.round(offsetX/m.maxX*100)):"0";
  yInput.value=m.maxY?String(Math.round(offsetY/m.maxY*100)):"0";
 };
 try{
  image.src=objectUrl;
  await image.decode();
  if(image.naturalWidth*image.naturalHeight>30000000){
   close();toast("A imagem tem resolução muito alta. Escolha uma imagem menor.","error");return;
  }
  sync();
 }catch(error){
  close();toast("Não foi possível abrir essa imagem.","error");return;
 }

 zoomInput.addEventListener("input",()=>{
  const old=metrics(),rx=old.maxX?offsetX/old.maxX:0,ry=old.maxY?offsetY/old.maxY:0;
  zoom=Number(zoomInput.value)/100;
  const next=metrics();offsetX=rx*next.maxX;offsetY=ry*next.maxY;sync();
 });
 xInput.addEventListener("input",()=>{const m=metrics();offsetX=m.maxX*Number(xInput.value)/100;sync()});
 yInput.addEventListener("input",()=>{const m=metrics();offsetY=m.maxY*Number(yInput.value)/100;sync()});
 $("#avatarReset",overlay).onclick=()=>{zoom=1;offsetX=0;offsetY=0;zoomInput.value="100";sync()};
 stage.addEventListener("pointerdown",e=>{
  if(e.button!==0)return;
  drag={x:e.clientX,y:e.clientY,id:e.pointerId};
  stage.classList.add("dragging");
  stage.setPointerCapture(e.pointerId);
 });
 stage.addEventListener("pointermove",e=>{
  if(!drag||drag.id!==e.pointerId)return;
  offsetX+=e.clientX-drag.x;offsetY+=e.clientY-drag.y;
  drag.x=e.clientX;drag.y=e.clientY;sync();
 });
 const stopDrag=e=>{
  if(!drag||drag.id!==e.pointerId)return;
  drag=null;stage.classList.remove("dragging");
 };
 stage.addEventListener("pointerup",stopDrag);
 stage.addEventListener("pointercancel",stopDrag);

 applyButton.onclick=async()=>{
  applyButton.disabled=true;
  applyButton.textContent="Preparando imagem…";
  try{
   const size=stage.clientWidth||280,m=metrics();
   const sx=(size-m.width)/2+offsetX,sy=(size-m.height)/2+offsetY;
   let result=null;
   for(const outputSize of [512,448,384,320,256]){
    const canvas=document.createElement("canvas");canvas.width=outputSize;canvas.height=outputSize;
    const ctx=canvas.getContext("2d",{alpha:false});
    if(!ctx)throw new Error("Não foi possível processar a imagem.");
    ctx.fillStyle="#101414";ctx.fillRect(0,0,outputSize,outputSize);
    const factor=outputSize/size;
    ctx.drawImage(image,sx*factor,sy*factor,m.width*factor,m.height*factor);
    for(const quality of [.84,.76,.68,.60,.52]){
     let blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/webp",quality));
     if(!blob)throw new Error("O navegador não conseguiu comprimir a imagem.");
     if(blob.type!=="image/webp"){
      blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",quality));
      if(!blob)throw new Error("Falha ao converter a imagem.");
     }
     const dataUrl=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error("Falha ao ler a imagem processada."));
      reader.readAsDataURL(blob);
     });
     if(typeof dataUrl==="string"&&dataUrl.length<=280*1024){result=dataUrl;break}
    }
    if(result)break;
   }
   if(!result)throw new Error("Não foi possível reduzir a imagem o suficiente. Tente uma foto diferente.");
   onApply(result);close();
   toast("Imagem ajustada. Salve as alterações do perfil.","success");
  }catch(error){
   applyButton.disabled=false;applyButton.innerHTML=icon("check",16)+" Tentar novamente";
   toast(error.message||"Falha ao preparar a imagem.","error");
  }
 };
}

function settingTab(t){let e=$("#settingsbody"),u=S.user||{};if(t==="profile"){
 let selectedAvatar=/^data:image\//i.test(u.avatar||"")?u.avatar:null;
 const avatarUrlValue=selectedAvatar?"":(u.avatar||"");
 e.innerHTML='<h2>Seu perfil</h2><p>As informações que outras pessoas veem no Node.GG.</p><form id="profile"><div class="avatar-upload-row"><div class="avatar-profile-preview" id="avatarPreview">'+avatar(u)+'</div><div class="avatar-upload-info"><strong>Sua foto de perfil</strong><span>Escolha uma imagem do PC e ajuste o enquadramento na hora.</span><div class="avatar-upload-actions"><button type="button" class="btn" id="chooseAvatar">'+icon("image",16)+' Escolher imagem</button><button type="button" class="btn quiet" id="removeAvatar">'+icon("trash",15)+' Remover</button></div><input id="avatarFile" type="file" accept="image/png,image/jpeg,image/webp" hidden><small>PNG, JPG ou WebP · até 20 MB. A imagem será otimizada automaticamente.</small></div></div><div class="field"><label>Nome de exibição</label><input id="display" maxlength="30" value="'+esc(u.displayName||"")+'" required></div><div class="field"><label>Biografia</label><textarea id="bio" maxlength="200" rows="3">'+esc(u.bio||"")+'</textarea></div><div class="field"><label>Ou use uma URL de imagem</label><input id="avatarurl" value="'+esc(avatarUrlValue)+'" placeholder="https://…"></div><button class="btn primary">'+icon("check",16)+' Salvar alterações</button></form>';
 $("#chooseAvatar").onclick=()=>$("#avatarFile").click();
 $("#avatarFile").onchange=async ev=>{
  const selectedFile=ev.target.files?.[0];ev.target.value="";
  if(!selectedFile)return;
  await openAvatarEditor(selectedFile,dataUrl=>{
   selectedAvatar=dataUrl;
   $("#avatarurl").value="";
   $("#avatarPreview").innerHTML=avatar({avatar:dataUrl});
  });
 };
 $("#removeAvatar").onclick=()=>{
  selectedAvatar=null;$("#avatarurl").value="";$("#avatarPreview").innerHTML=avatar({});
 };
 $("#profile").onsubmit=x=>{
  x.preventDefault();
  const remoteUrl=$("#avatarurl").value.trim();
  S.ws.send({type:"update_profile",displayName:$("#display").value.trim(),bio:$("#bio").value.trim(),avatar:remoteUrl||selectedAvatar||""});
 };
}if(t==="presence"){e.innerHTML='<h2>Presença</h2><p>Escolha como seu status aparece para seus amigos.</p><div class="field"><label>Status</label><select id="status"><option value="online">Online</option><option value="idle">Ausente</option><option value="dnd">Não perturbe</option><option value="invisible">Invisível</option></select></div><div class="field"><label>Status personalizado</label><input id="custom" maxlength="80"></div><div class="field"><label>Emoji</label><input id="emoji" maxlength="16" placeholder="🛠️"></div><div class="field"><label>Duração</label><select id="duration"><option value="3600000">1 hora</option><option value="14400000">4 horas</option><option value="43200000">12 horas</option><option value="86400000">24 horas</option><option value="604800000">7 dias</option><option value="0">Sem expiração</option></select></div><button class="btn primary" id="savepresence">Atualizar presença</button>';$("#status").value=S.presence;$("#custom").value=S.ownPresence?.customStatus||"";$("#emoji").value=S.ownPresence?.customStatusEmoji||"";$("#savepresence").onclick=()=>S.ws.send({type:"presence_update",status:$("#status").value,customStatus:$("#custom").value,customStatusEmoji:$("#emoji").value,customStatusDurationMs:+$("#duration").value})}if(t==="sessions"){e.innerHTML='<h2>Dispositivos conectados</h2><p>Gerencie os dispositivos que têm acesso à sua conta.</p><div id="sessionlist"></div><button class="btn danger" id="revokeothers">Encerrar outras sessões</button>';S.ws.send({type:"session_list"});$("#revokeothers").onclick=()=>S.ws.send({type:"session_revoke_others"})}if(t==="push"){e.innerHTML='<h2>Notificações do navegador</h2><p>Receba avisos quando chegar uma mensagem ou chamada.</p><button class="btn primary" id="enablepush">Ativar notificações</button><button class="btn" id="disablepush">Desativar neste navegador</button>';$("#disablepush").onclick=disablePush;$("#enablepush").onclick=enablePush}}
function presenceDialog(){let m=showModal("Sua presença","Escolha como deseja aparecer.",'<div class="field"><select id="quick"><option value="online">Online</option><option value="idle">Ausente</option><option value="dnd">Não perturbe</option><option value="invisible">Invisível</option></select></div><button class="btn primary" id="setquick">Salvar status</button>');$("#quick").value=S.presence;$("#setquick").onclick=()=>{S.ws.send({type:"presence_update",status:$("#quick").value});m.remove()}}
async function enablePush(){try{if(!("serviceWorker"in navigator)||!("PushManager"in window))throw Error("Notificações push não são suportadas.");let k=await api(CONFIG.PUSH_KEY);if(!k.enabled)throw Error("O servidor ainda não configurou notificações push.");let reg=await navigator.serviceWorker.register("./sw.js"),p=await Notification.requestPermission();if(p!=="granted")throw Error("Permissão não concedida.");let sub=await reg.pushManager.getSubscription();if(!sub){let raw=atob(k.publicKey.replace(/-/g,"+").replace(/_/g,"/"));sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(raw,c=>c.charCodeAt(0))})}await S.ws.request({type:"save_push_subscription",subscription:sub.toJSON()},"push_subscribed_success");toast("Notificações ativadas.","success")}catch(e){toast(e.message,"error")}}
function sessionsList(a){let e=$("#sessionlist");if(!e)return;e.innerHTML=a.map(s=>'<div class="listrow"><div class="avatar">'+icon("device",17)+'</div><div class="person"><strong>'+esc(s.deviceName||s.browser||"Dispositivo")+(s.isCurrent?" · Este dispositivo":"")+'</strong><span>'+esc(s.state)+' · '+(s.lastSeen?new Date(s.lastSeen).toLocaleString("pt-BR"):"—")+'</span></div>'+(s.isCurrent?"":'<button class="btn danger" data-revoke="'+esc(s.sessionId)+'">Encerrar</button>')+'</div>').join("")||'<div class="empty">Nenhuma sessão.</div>';$$("[data-revoke]").forEach(b=>b.onclick=()=>S.ws.send({type:"session_revoke",sessionId:b.dataset.revoke}))}
async function startCall(peer,video){try{if(!S.ws.connected)throw Error("Reconectando ao servidor. Tente novamente em instantes.");if(S.call||S.groupRoom)throw Error("Você já está em uma chamada.");S.pendingIce=[];S.pendingRemoteIce=[];let stream=await navigator.mediaDevices.getUserMedia({audio:true,video:!!video}),pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun.cloudflare.com:3478"}]});S.call={peer,video:!!video,stream,pc,callId:null};stream.getTracks().forEach(t=>pc.addTrack(t,stream));pc.onicecandidate=e=>{if(!e.candidate)return;if(S.call?.callId)S.ws.send({type:"call_ice_candidate",to:peer,callId:S.call.callId,candidate:e.candidate});else S.pendingIce.push(e.candidate)};pc.ontrack=e=>remoteVideo(e.streams[0]);let offer=await pc.createOffer();await pc.setLocalDescription(offer);S.ws.send({type:"call_initiate",to:peer,isVideo:!!video,offer:pc.localDescription,mediaSettings:{resolution:"720p",fps:30,audioEnabled:true,videoEnabled:!!video}});callUI("Chamando "+peer,stream)}catch(e){toast("Não foi possível iniciar a chamada: "+e.message,"error");if(S.call&&!S.call.callId){S.call.pc?.close();S.call.stream?.getTracks().forEach(t=>t.stop());S.call=null;$("#calloverlay")?.remove()}}}
function callUI(title,stream){
 let n=document.createElement("div");n.className="calloverlay";n.id="calloverlay";
 n.innerHTML='<div class="calltop"><strong>'+esc(title)+'</strong><button class="btn danger" id="endcall">'+icon("phone",16)+' Encerrar</button></div><div class="callstage"><div class="videogrid"><div class="videotile"><video id="local" autoplay muted playsinline></video><span>Você</span></div><div class="videotile" id="remote"><span>Aguardando participante…</span></div></div></div><div class="callcontrols"><button class="btn" id="mic">'+icon("mic",16)+' Microfone</button><button class="btn" id="cam">'+icon("camera",16)+' Câmera</button><button class="btn" id="screen">'+icon("screen",16)+' Compartilhar tela</button></div>';
 document.body.append(n);$("#local").srcObject=stream;$("#endcall").onclick=endCall;
 $("#mic").onclick=()=>{let t=S.call?.stream.getAudioTracks()[0];if(t){t.enabled=!t.enabled;updateMedia()}};
 $("#cam").onclick=()=>{let t=S.call?.stream.getVideoTracks()[0];if(t){t.enabled=!t.enabled;updateMedia()}};
 $("#screen").onclick=shareScreen;
}

function remoteVideo(s){let b=$("#remote");if(b){b.innerHTML='<video autoplay playsinline></video><span>'+esc(S.call?.peer||"Participante")+'</span>';b.querySelector("video").srcObject=s}}
function mediaState(call){
 return {audioEnabled:!!call.stream.getAudioTracks()[0]?.enabled,videoEnabled:!!(call.screen||call.stream.getVideoTracks()[0]?.enabled)};
}
function updateMedia(){
 const call=S.call;if(call?.callId&&S.ws.connected)S.ws.send({type:'call_media_update',to:call.peer,callId:call.callId,mediaSettings:mediaState(call)});
}
async function shareScreen(){
 const call=S.call;if(!call?.callId)return;
 try{
  if(call.screen){call.screen.stop();await call.screen.onended();return}
  const stream=await navigator.mediaDevices.getDisplayMedia({video:true}),track=stream.getVideoTracks()[0];
  if(S.call!==call){track.stop();return}
  call.screen=track;
  const camera=call.stream.getVideoTracks()[0];
  const sender=call.screenSender||call.pc.getSenders().find(s=>s.track?.kind==='video');
  if(sender)await sender.replaceTrack(track);
  else{
   call.screenSender=call.pc.addTrack(track,stream);
   await call.pc.setLocalDescription(await call.pc.createOffer());
   S.ws.send({type:'call_renegotiate',to:call.peer,callId:call.callId,description:call.pc.localDescription});
  }
  track.onended=async()=>{if(S.call!==call)return;call.screen=null;await (sender||call.screenSender).replaceTrack(camera||null);updateMedia()};
  updateMedia();
 }catch(e){call.screen?.stop();call.screen=null;toast(e.message,'error')}
}
function endCall(event){if(event!==false&&S.ws.connected&&S.call?.callId)S.ws.send({type:S.call.waiting?"call_cancel_waiting":"call_end",callId:S.call.callId});S.call?.screen?.stop();S.call?.pc.close();S.call?.stream.getTracks().forEach(t=>t.stop());S.call=null;$("#calloverlay")?.remove()}
async function incoming(d){S.pendingRemoteIce=[];if(!confirm((d.callerDisplayName||d.caller||"Alguém")+" está ligando. Atender?")){S.ws.send({type:"call_reject",caller:d.caller,callId:d.callId});return}try{let stream=await navigator.mediaDevices.getUserMedia({audio:true,video:!!d.isVideo}),pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun.cloudflare.com:3478"}]});S.call={peer:d.caller,video:!!d.isVideo,stream,pc,callId:d.callId};stream.getTracks().forEach(t=>pc.addTrack(t,stream));pc.onicecandidate=e=>{if(e.candidate)S.ws.send({type:"call_ice_candidate",to:d.caller,callId:d.callId,candidate:e.candidate})};pc.ontrack=e=>remoteVideo(e.streams[0]);await pc.setRemoteDescription(d.offer);await flushRemoteIce();let answer=await pc.createAnswer();await pc.setLocalDescription(answer);S.ws.send({type:"call_answer",caller:d.caller,callId:d.callId,accepted:true,answer:pc.localDescription});callUI("Em chamada com "+d.caller,stream)}catch(e){toast("Não foi possível atender: "+e.message,"error");endCall()}}
async function joinGroup(id,reconnect=false){if(S.call||S.groupRoom)return toast("Você já está em uma chamada.");let room,joined=false;try{let r=await S.ws.request({type:reconnect?"group_call_reconnect":"group_call_join",groupId:id},["group_call_joined","group_call_unavailable","group_call_full"],12000);if(r.type!=="group_call_joined")throw Error(r.message||"Chamada indisponível.");joined=true;let{Room,RoomEvent}=await import("https://cdn.jsdelivr.net/npm/livekit-client@2.9.6/dist/livekit-client.esm.mjs");room=new Room();await room.connect(r.serverUrl,r.token);await room.localParticipant.setMicrophoneEnabled(true).catch(()=>toast("Você entrou com o microfone desligado."));S.groupRoom={room,id};S.ws.send({type:"group_call_connected",groupId:id});let n=document.createElement("div");n.className="calloverlay";n.id="calloverlay";n.innerHTML='<div class="calltop"><strong>Chamada em grupo</strong><button class="btn danger" id="leavegroup">Sair da chamada</button></div><div class="callstage"><div class="videogrid" id="groupvideos"></div></div><div class="callcontrols"><button class="btn" id="gm">'+icon("mic",16)+' Microfone</button><button class="btn" id="gc">'+icon("camera",16)+' Câmera</button><button class="btn" id="gs">'+icon("screen",16)+' Compartilhar tela</button></div>';document.body.append(n);let attach=(p,t)=>{let tile=document.createElement("div");tile.className="videotile";tile.append(t.attach());let l=document.createElement("span");l.textContent=p.identity;tile.append(l);$("#groupvideos").append(tile)};room.remoteParticipants.forEach(p=>p.trackPublications.forEach(x=>x.track&&attach(p,x.track)));room.on(RoomEvent.TrackSubscribed,(t,publication,participant)=>attach(participant,t));room.on(RoomEvent.TrackUnsubscribed,t=>t.detach().forEach(el=>el.parentElement?.remove()));$("#gm").onclick=()=>room.localParticipant.setMicrophoneEnabled(!room.localParticipant.isMicrophoneEnabled);$("#gc").onclick=()=>room.localParticipant.setCameraEnabled(!room.localParticipant.isCameraEnabled);$("#gs").onclick=()=>room.localParticipant.setScreenShareEnabled(!room.localParticipant.isScreenShareEnabled);$("#leavegroup").onclick=async()=>{await room.disconnect();S.ws.send({type:"group_call_leave",groupId:id});S.groupRoom=null;$("#calloverlay")?.remove()}}catch(e){await room?.disconnect();if(joined&&S.ws.connected)S.ws.send({type:"group_call_leave",groupId:id});S.groupRoom=null;toast(e.message||"Chamada em grupo indisponível.","error")}}

function mergeMessages(older=[], newer=[]) {
 const byId=new Map([...older,...newer].map(m=>[String(m.id??m.messageId),m]));
 return [...byId.values()].sort((a,b)=>Number(a.id)-Number(b.id));
}
function appendDirectMessage(d){
 const chat=S.active;
 if(chat?.kind!=="direct" || ![d.from,d.sender,d.to,d.receiver].includes(chat.username))return;
 renderMessages(mergeMessages(chat.items,[d]));
 if((d.from||d.sender)===chat.username)S.ws.send({type:"mark_as_read",withUser:chat.username});
}
function appendGroupMessage(d){
 const m=d.message||d;
 if(S.active?.kind==="group" && String(m.group_id??m.groupId??d.groupId)===String(S.active.id))
  renderMessages(mergeMessages(S.active.items,[m]));
}
async function flushRemoteIce(){
 const call=S.call;if(!call?.pc||!call.pc.remoteDescription||!call.callId)return;
 const queued=S.pendingRemoteIce.splice(0);
 for(const item of queued){if(item.callId&&item.callId!==call.callId){S.pendingRemoteIce.push(item);continue}try{await call.pc.addIceCandidate(item.candidate)}catch(error){console.warn("[CALL] ICE:",error)}}
}

async function disablePush(){
 try{
  const reg=await navigator.serviceWorker?.getRegistration();
  const sub=await reg?.pushManager.getSubscription();
  if(sub){await S.ws.request({type:'unsubscribe_push',endpoint:sub.endpoint},'push_unsubscribed_success');await sub.unsubscribe()}
  toast('Notificações desativadas neste navegador.','success')
 }catch(e){toast(e.message,'error')}
}
document.addEventListener('visibilitychange',()=>{
 if(S.user&&S.ws.connected)S.ws.send({type:'app_visibility',focused:!document.hidden});
});
function bind(){S.ws.addEventListener("open",()=>{$("#dot")?.classList.add("online");if($("#connection"))$("#connection").textContent="Conectado"});S.ws.addEventListener("close",()=>{$("#dot")?.classList.remove("online");if($("#connection"))$("#connection").textContent="Reconectando…"});S.ws.addEventListener("message",e=>{let d=e.detail;handleWorkspaceEvent(d);switch(d.type){case"friend_request_received":loadFriends().then(()=>{if(S.page==="friends")friends()});toast("Novo pedido de amizade.");break;case"friend_request_accepted":loadFriends();toast("Pedido de amizade aceito.");break;case"contacts_list":S.users=d.users||[];break;case"group_member_role_updated":case"group_ownership_transferred":case"group_deleted":case"group_member_removed":case"group_member_left":case"group_updated":loadGroups().then(()=>{if(S.page==="groups")groups()});break;case"group_call_invitation":if(confirm((d.inviterDisplayName||d.inviter)+" convidou você para a chamada em "+d.groupName+". Entrar?"))joinGroup(d.groupId);break;case"unread_counts":S.unread=d.total||0;S.unreadByUser=d.counts||{};if($('#conversations'))drawConversations();if(S.page==="home"&&$("#view"))home();break;case"chat_message":appendDirectMessage(d);loadConversations().then(()=>{if(S.page==="messages")drawConversations()}).catch(()=>{});break;case"group_message":appendGroupMessage(d);break;case"chat_error":case"group_error":toast(d.message||"Falha ao enviar mensagem.","error");break;case"notification_new":S.notifications.unshift(d.notification);if($("#notification-count"))$("#notification-count").textContent=+$("#notification-count").textContent+1;toast(d.notification?.title||"Nova notificação");break;case"presence_state":S.ownPresence=d;S.presence=d.status||"online";break;case"profile_updated":S.user={...S.user,...d.user};(localStorage.getItem(CONFIG.TOKEN)?localStorage:sessionStorage).setItem(CONFIG.USER,JSON.stringify(S.user));toast("Perfil atualizado.","success");break;case"sessions_list":sessionsList(d.sessions||[]);break;case"sessions_revoked_others":toast("Outras sessões encerradas.","success");S.ws.send({type:"session_list"});break;case"session_logged_out":logout();break;case"call_incoming":incoming(d);break;case"call_ringing":if(S.call){S.call.waiting=false;S.call.callId=d.callId;for(const candidate of S.pendingIce.splice(0))S.ws.send({type:"call_ice_candidate",to:S.call.peer,callId:d.callId,candidate});flushRemoteIce().catch(()=>{})}break;case"call_answered":if(S.call?.pc&&d.answer){S.call.callId=d.callId||S.call.callId;S.call.pc.setRemoteDescription(d.answer).then(flushRemoteIce).catch(e=>{toast("Falha na negociação WebRTC: "+e.message,"error");endCall()})}break;case"call_answer_ack":if(S.call)S.call.callId=d.callId;break;case"call_ice_candidate":if(d.candidate){if(S.call?.pc&&S.call.callId&&(!d.callId||d.callId===S.call.callId)&&S.call.pc.remoteDescription)S.call.pc.addIceCandidate(d.candidate).catch(e=>console.warn("[CALL] ICE:",e));else S.pendingRemoteIce.push({candidate:d.candidate,callId:d.callId||null})}break;case"call_offline":case"call_busy":case"call_error":case"call_rejected":case"call_ended":case"call_timeout":case"call_wait_cancelled":toast(d.message||({call_offline:"Este usuário está offline.",call_busy:"Este usuário está ocupado.",call_timeout:"A chamada não foi atendida."}[d.type]||"A chamada foi encerrada."),"error");if(!d.callId||S.call?.callId===d.callId||!S.call?.callId)endCall(false);break;case"call_peer_disconnected":toast("A outra pessoa perdeu a conexão. Aguardando reconexão…");break;case"call_peer_reconnected":toast("A outra pessoa voltou à chamada.","success");break;case"call_resumed":if(d.active===false)endCall();else if(d.active===true)toast("Sessão da chamada restaurada. Verificando mídia…");break;case"group_call_ended":if(S.groupRoom?.id!==d.groupId)break;S.groupRoom?.room.disconnect();S.groupRoom=null;$("#calloverlay")?.remove();break;case"group_call_error":case"group_call_unavailable":toast(d.message||"Chamada em grupo indisponível.","error");break;case"auth_error":toast(d.message||"Sessão inválida.","error");break;case"session_error":toast(d.message,"error");break}})}
async function loadConversations(){let r=await S.ws.request({type:"get_conversations",limit:100},"conversations_list");S.conversations=r.conversations||[]}
async function logout(){clearInterval(S.heartbeat);S.active=null;S.token=null;S.groupRoom?.room.disconnect();S.groupRoom=null;S.call?.pc?.close();$("#calloverlay")?.remove();try{if(S.ws.connected)S.ws.send({type:"session_logout"})}catch{}S.ws.close();[localStorage,sessionStorage].forEach(x=>{x.removeItem(CONFIG.TOKEN);x.removeItem(CONFIG.USER)});S.call?.stream.getTracks().forEach(t=>t.stop());S.call=null;Object.assign(S,{users:[],friends:[],requests:[],groups:[],conversations:[],notifications:[],user:null,unread:0,ownPresence:null,unreadByUser:{},noticeFilter:"all",presence:"online"});auth()}
function followLink(){
 const hash=location.hash.slice(1);
 if(hash.startsWith('call-'))go('notifications',false);
 if(/^reply-[a-z0-9-]{1,64}$/i.test(hash)){
  const id=hash.slice(6);history.replaceState(null,'','#notifications');go('notifications');replyToNotice(id);
 }
 if(pages.includes(hash))go(hash,false);
 if(!hash)go('home',false);
 if(hash.startsWith('chat-')&&/^[a-z0-9_.-]+$/i.test(hash.slice(5)))openChat(hash.slice(5));
 if(hash.startsWith('group-')&&S.groups.some(g=>g.id===hash.slice(6)))openGroup(hash.slice(6));
}
navigator.serviceWorker?.addEventListener('message',event=>{
 if(event.data?.type!=='open_notification'||typeof event.data.hash!=='string')return;
 const hash=event.data.hash;
 if(!/^#(?:notifications|(?:chat|group|call|reply)-[a-z0-9_.-]+)$/i.test(hash))return;
 if(location.hash!==hash)location.hash=hash;else if(S.user&&$('#view'))followLink();
});
window.addEventListener('hashchange' ,()=>{if(S.user&&$('#view'))followLink()});
async function start(){if(!S.ws.connected)await S.ws.connect();shell();S.ws.send({type:"get_contacts"});S.ws.send({type:"presence_get"});await Promise.allSettled([loadFriends(),loadGroups(),loadConversations(),loadNotifications()]);go("home",false);followLink();S.ws.send({type:"get_maintenance_status"});if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});S.ws.send({type:"get_unread_counts"});clearInterval(S.heartbeat);S.heartbeat=setInterval(()=>{if(S.ws.connected){if(!document.hidden)S.ws.send({type:"presence_activity"});if(S.page==="messages")loadConversations().catch(()=>{})}},60000)}
async function boot(){bind();for(const storage of [localStorage,sessionStorage]){
 const old=storage.getItem("sessionToken");if(old&&!storage.getItem(CONFIG.TOKEN))storage.setItem(CONFIG.TOKEN,old);
 if(old){storage.removeItem("sessionToken");storage.removeItem("user_data")}
}let t=localStorage.getItem(CONFIG.TOKEN)||sessionStorage.getItem(CONFIG.TOKEN);if(!t){auth();return}S.token=t;try{await S.ws.connect();let r=await S.ws.request({type:"reconnect_session",sessionToken:t},["auth_success","auth_error","maintenance_active"],12000);if(r.type==="auth_error"){localStorage.removeItem(CONFIG.TOKEN);sessionStorage.removeItem(CONFIG.TOKEN);S.token=null}if(r.type!=="auth_success")throw Error(r.message||"Sessão expirada.");S.user=r.user||{};await start()}catch(e){auth("login",e.message||"Falha ao restaurar a sessão.")}}
boot();
function messageBody(m) {
 if(m.deleted_for_all)return '<i>Mensagem excluída</i>';
 const quote=m.reply_preview?'<blockquote>'+esc(m.reply_preview.sender)+' · '+esc(m.reply_preview.content)+'</blockquote>':'';
 const forwarded=m.forwarded_from_sender?'<small>Encaminhada de @'+esc(m.forwarded_from_sender)+'</small><br>':'';
 let body=esc(m.content??m.text??'');
 if(m.msg_type && m.msg_type!=='text'){
  const data=String(m.media||m.content||'').replace(/^data:[^,]*;base64,/i,'');
  const name=esc(m.media_meta?.name||m.msg_type);
  body=/^[a-z\d+/]+=*$/i.test(data)?'<a download="'+name+'" href="data:application/octet-stream;base64,'+data+'">↓ '+name+'</a>':name;
 }
 const reactions=(m.reactions||[]).map(r=>esc(r.emoji)).join(' ');
 return forwarded+quote+body+(reactions?'<small class="reaction">'+reactions+'</small>':'');
}

function setupChatTools(chat){
 const username=chat.username, header=$('.chathead');
 header.insertAdjacentHTML('afterend','<div class="chat-tools"><button class="btn quiet" id="history">Anteriores</button><button class="btn quiet" id="lookup">Pesquisar</button><button class="btn quiet" id="pins">Fixadas</button><span id="typing" aria-live="polite"></span></div>');
 $('.chat-tools').insertAdjacentHTML('beforeend','<button class="btn quiet" id="clearChat">Limpar conversa</button>');
 $('#clearChat').onclick=async()=>{
  if(!confirm('Apagar esta conversa da sua caixa de mensagens?'))return;
  try{await S.ws.request({type:'delete_conversation',withUser:username,forAll:false},'conversation_deleted');await loadConversations();if(S.active===chat)go('messages')}catch(e){toast(e.message,'error')}
 };
 $('#history').onclick=async e=>{
  if(!chat.before)return toast('Você chegou ao início da conversa.');
  const b=e.currentTarget, box=$('#messages'),height=box.scrollHeight,scroll=box.scrollTop;b.disabled=true;
  try{
   const page=await S.ws.request({type:'get_chat_history_page',withUser:username,before:chat.before},'chat_history_page');
   if(S.active!==chat)return;
   chat.before=page.hasMore?page.nextBefore:null;
   renderMessages(mergeMessages(page.messages,chat.items));box.scrollTop=scroll+box.scrollHeight-height;
  }catch(err){toast(err.message,'error')}finally{b.disabled=false}
 };
 async function lookup(pins){
  const dialog=showModal(pins?'Mensagens fixadas':'Pesquisar conversa','@'+username,
   (pins?'':'<form class="row"><input class="search" aria-label="Pesquisar mensagens" minlength="2" maxlength="100" required><button class="btn primary">Buscar</button></form>')+'<div class="lookup-results" aria-live="polite"></div>');
  const list=$('.lookup-results',dialog);
  async function run(){
   const query=$('input',dialog)?.value.trim();
   try{
    const r=await S.ws.request({type:pins?'get_pinned_messages':'chat_search',withUser:username,query},pins?'pinned_messages':'chat_search_results');
    list.innerHTML=(r.pins||r.results||[]).map(m=>'<div class="listrow"><div class="person"><strong>'+esc(m.sender)+'</strong><span>'+esc(m.content||m.msg_type)+'</span></div>'+(pins?'<button class="btn" data-unpin="'+Number(m.messageId)+'">Desafixar</button>':'')+'</div>').join('')||'<div class="empty">Nenhuma mensagem encontrada.</div>';
    $$('[data-unpin]',list).forEach(b=>b.onclick=async()=>{try{await S.ws.request({type:'unpin_message',messageId:Number(b.dataset.unpin)},'message_unpinned');await run()}catch(e){toast(e.message,'error')}});
   }catch(err){list.textContent=err.message}
  }
  if(pins)await run();else{$('input',dialog).focus();$('form',dialog).onsubmit=e=>{e.preventDefault();run()}}
 }
 $('#lookup').onclick=()=>lookup(false);$('#pins').onclick=()=>lookup(true);
 const input=$('#text');let last=0,timer;
 input.oninput=()=>{
  if(!S.ws.connected)return;
  if(Date.now()-last>2000){S.ws.send({type:'typing_start',to:username});last=Date.now()}
  clearTimeout(timer);timer=setTimeout(()=>{if(S.ws.connected&&S.active===chat)S.ws.send({type:'typing_stop',to:username});last=0},1500);
 };
 const attach=document.createElement('label');attach.className='btn attachment';attach.textContent='＋';
 attach.title='Anexar arquivo';attach.innerHTML+=' <input type="file" aria-label="Anexar arquivo">';
 $('.composerbox').prepend(attach);
 $('input',attach).onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  if(f.size>2*1024*1024)return toast('Escolha um arquivo de até 2 MB.','error');
  try{
   const data=await new Promise((ok,fail)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=()=>fail(Error('Falha ao ler o arquivo.'));reader.readAsDataURL(f)});
   if(S.active!==chat)return;
   const kind=f.type.split('/')[0];
   S.ws.send({type:'chat_message',to:username,msg_type:['image','audio','video'].includes(kind)?kind:'file',media:data.split(',')[1],fileName:f.name,mime:f.type});
  }catch(err){toast(err.message,'error')}
 };
}

async function loadMemberControls(dialog,g){
 const owner=g.my_role==='owner',admin=owner||g.my_role==='admin';
 for(const id of ['membername','renamegroup','addmember','renamegroupbtn']){
  const el=$('#'+id,dialog);(el.closest('.field')||el).hidden=!admin;
 }
 if(admin){
  const form=document.createElement('form');form.className='group-photo';
  form.innerHTML='<label>Foto do grupo<input aria-label="Endereço da foto" placeholder="https://…" value="'+esc(g.avatar||'')+'"></label><button class="btn">Salvar foto</button>';
  $('.modalactions',dialog).before(form);
  form.onsubmit=async event=>{
   event.preventDefault();const button=$('button',form);button.disabled=true;
   try{
    const response=await S.ws.request({type:'group_update_avatar',groupId:g.id,avatar:$('input',form).value.trim()},'group_avatar_updated');
    Object.assign(g,response.group);if(S.page==='groups')groups();toast('Foto do grupo atualizada.','success');
   }catch(error){toast(error.message,'error')}finally{button.disabled=false}
  };
 }
 const r=await S.ws.request({type:'group_get_members' ,groupId:g.id},'group_members');
 const section=document.createElement('section');section.className='member-controls';
 $('.modalactions',dialog).before(section);
 section.innerHTML='<h3>Membros</h3>'+r.members.map(m=>{
  const other=m.username!==S.user.username && m.role!=='owner';
  const actions=other&&owner?'<option value="role">'+(m.role==='admin'?'Tornar membro':'Tornar administrador')+'</option><option value="owner">Transferir propriedade</option>':'';
  const remove=other&&admin&&(owner||m.role==='member')?'<option value="remove">Remover do grupo</option>':'';
  return '<div class="listrow">'+avatar(m)+'<div class="person"><strong>'+esc(m.displayName||m.username)+'</strong><span>@'+esc(m.username)+' · '+esc(m.role)+'</span></div>'+(other?'<button class="btn" data-invite="'+esc(m.username)+'">Convidar à chamada</button>':'')+(actions||remove?'<select aria-label="Gerenciar membro" data-user="'+esc(m.username)+'" data-role="'+esc(m.role)+'"><option value="">Ações</option>'+actions+remove+'</select>':'')+'</div>';
 }).join('');
 for(const btn of $$('[data-invite]',section))btn.onclick=async()=>{
  try{await S.ws.request({type:'group_call_invite',groupId:g.id,username:btn.dataset.invite},'group_call_invite_sent');toast('Convite enviado.','success')}catch(e){toast(e.message,'error')}
 };
 if(admin){
  const rights=document.createElement('fieldset');rights.innerHTML='<legend>Permissões de chamada dos membros</legend>'+Object.entries({audio:'Microfone',video:'Câmera',screenShare:'Compartilhar tela'}).map(([key,label])=>'<label><input type="checkbox" name="'+key+'" '+(r.permissions?.[key]?'checked':'')+'> '+label+'</label>').join(' ')+' <button class="btn">Salvar permissões</button>';
  section.after(rights);
  $('button',rights).onclick=async()=>{try{await S.ws.request({type:'group_call_set_role_permissions',groupId:g.id,role:'member',permissions:Object.fromEntries($$('input',rights).map(el=>[el.name,el.checked]))},'group_call_permissions_saved');toast('Permissões salvas.','success')}catch(e){toast(e.message,'error')}};
 }
 section.onchange=async e=>{
  const el=e.target,username=el.dataset.user,action=el.value;el.value='';
  if(!action||!confirm('Confirmar alteração para @'+username+'?'))return;
  const [type,response]={owner:['group_transfer_ownership','group_ownership_transferred'],role:['group_set_member_role','group_member_role_updated'],remove:['group_remove_member','group_member_removed']}[action];
  try{await S.ws.request({type,username,groupId:g.id,role:el.dataset.role==='admin'?'member':'admin'},response);await loadGroups();dialog.remove();if(S.page==='groups'){groups();manageGroup(g.id)}}catch(err){toast(err.message,'error')}
 };
}

function handleWorkspaceEvent(d){
 if(d.type==='auth_success'&&S.user&&!d.requestId){
  S.user=d.user||S.user;
  const chat=S.active,page=S.page;
  Promise.allSettled([loadFriends(),loadGroups(),loadConversations(),loadNotifications()]).then(()=>{
   if(!$('#view')||S.page!==page||S.active!==chat)return;
   if(chat?.kind==='direct')openChat(chat.username);else if(chat?.kind==='group')openGroup(chat.id);else go(page);
  });
 }
 if(d.type==='maintenance_status' &&d.active)toast(d.message||'Servidor em manutenção.');
 if(d.type==='announcement_new')toast(d.message||'Novo aviso do servidor.');
 if(d.type==='call_renegotiate' &&d.callId===S.call?.callId){
  const call=S.call;(async()=>{await call.pc.setRemoteDescription(d.description);if(d.description.type==='offer'){await call.pc.setLocalDescription(await call.pc.createAnswer());S.ws.send({type:'call_renegotiate',callId:call.callId,to:call.peer,description:call.pc.localDescription})}})().catch(e=>toast(e.message,'error'));
 }
 if(d.type==='call_media_update'&&S.call?.callId===d.callId&&$('#remote span'))$('#remote span').textContent=S.call.peer+(d.mediaSettings?.audioEnabled?'':' · microfone desligado');
 if(['group_call_kicked','group_call_reconnect_required'].includes(d.type)&&S.groupRoom?.id===d.groupId){
  const room=S.groupRoom.room;S.groupRoom=null;$('#calloverlay')?.remove();room.disconnect().then(()=>{if(d.type==='group_call_reconnect_required')joinGroup(d.groupId,true)});
 }
 if(d.type==='session_revoked' &&$('#sessionlist'))S.ws.send({type:'session_list'});
 if(d.type==='call_waiting'&&S.call){S.call.callId=d.callId;S.call.waiting=true}
 if(['call_waiting','call_waiting_position'].includes(d.type)&&S.call?.callId===d.callId&&$('.calltop strong'))$('.calltop strong').textContent='Na fila de chamada · posição '+d.position;
 if(d.type==='call_waiting_cancelled'&&S.call?.callId===d.callId)endCall(false);
 if(d.type==='notification_read'||d.type==='notifications_all_read'){
  for(const n of S.notifications)if(!d.notificationId||String(n.id)===String(d.notificationId))n.readAt=Date.now();
  if($('#notification-count'))$('#notification-count').textContent=S.notifications.filter(n=>!(n.readAt||n.read_at)).length;
  if(S.page==='notifications')notifications();
 }
 if(d.type==='notification_new'&&S.page==='notifications')queueMicrotask(notifications);
 if(d.type==='presence_state'&&$('#presence'))$('#presence').textContent='● '+(d.status||'online');
 if(d.type==='chat_typing'&&S.active?.username===d.from&&$('#typing'))$('#typing').textContent=d.isTyping?'Digitando…':'';
 const chat=S.active;
 if(chat?.kind!=='direct')return;
 if(d.type==='messages_read'&&d.reader===chat.username){
  const ids=new Set(d.ids);for(const m of chat.items)if(ids.has(Number(m.id)))m.read_at=d.readAt;
  renderMessages(chat.items);return;
 }
 const m=chat.items.find(m=>Number(m.id)===Number(d.messageId));if(!m)return;
 switch(d.type){
  case 'message_edited':Object.assign(m,{content:d.text,text:d.text,edited:true});break;
  case 'message_deleted':if(d.forAll)m.deleted_for_all=true;else chat.items=chat.items.filter(x=>x!==m);break;
  case 'reaction_updated':case 'reaction_removed':
   m.reactions=(m.reactions||[]).filter(r=>r.username!==d.username);
   if(d.type==='reaction_updated')m.reactions.push({username:d.username,emoji:d.emoji});break;
  default:return;
 }
 renderMessages(chat.items);
}

async function groupCallStatus(g){
 try{
  const status=await S.ws.request({type:'group_call_status',groupId:g.id},'group_call_status');
  const moderate=['admin','owner'].includes(g.my_role);
  const participants=status.participants.map(p=>'<div class="listrow"><div class="person"><strong>'+esc(p.displayName||p.username)+'</strong><span>@'+esc(p.username)+'</span></div>'+(moderate&&p.username!==S.user.username?'<button class="btn" data-kick="'+esc(p.username)+'">Remover da chamada</button>':'')+'</div>').join('');
  const dlg=showModal('Chamada de '+g.name,status.active?'Participantes na sala':'Nenhuma chamada em andamento.',participants+(moderate&&status.active?'<button class="btn danger" id="finishroom">Encerrar para todos</button>':''));
  for(const btn of $$('[data-kick]',dlg))btn.onclick=async()=>{
   if(!confirm('Remover @'+btn.dataset.kick+' da chamada?'))return;
   try{await S.ws.request({type:'group_call_kick',groupId:g.id,username:btn.dataset.kick},'group_call_participant_kicked');dlg.remove();await groupCallStatus(g)}catch(e){toast(e.message,'error')}
  };
  $('#finishroom',dlg)?.addEventListener('click',async()=>{
   if(!confirm('Encerrar a chamada para todos?'))return;
   try{await S.ws.request({type:'group_call_end',groupId:g.id},'group_call_ended_ack');dlg.remove()}catch(e){toast(e.message,'error')}
  });
 }catch(e){toast(e.message,'error')}
}
