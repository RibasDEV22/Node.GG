const CACHE = "nodegg-shell-v3";
const FILES = ["./", "./index.html", "./styles/app.css?v=workspace-v3", "./src/app.js", "./src/config.js", "./src/realtime.js", "./src/twemoji.js", "./pages/login/icon.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith("nodegg-shell-") && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && FILES.some(file => new URL(file, self.registration.scope).href === request.url)) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return await cache.match(request) || (request.mode === "navigate" && await cache.match("./index.html")) || Response.error();
    }
  })());
});
self.addEventListener("push",e=>{let d={title:"Node.GG",body:"Você tem uma nova atualização.",data:{url:"./"}};try{d={...d,...e.data.json()}}catch{}e.waitUntil(self.registration.showNotification(d.title||"Node.GG",{body:d.body||"",icon:d.icon||"./pages/login/icon.png",badge:d.badge||"./pages/login/icon.png",tag:d.tag||"nodegg",data:d.data||{url:"./"},requireInteraction:!!d.requireInteraction,actions:d.actions||[]}))});self.addEventListener("notificationclick",e=>{e.notification.close();const url=e.notification.data?.url||"./";e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(a=>{const c=a.find(x=>new URL(x.url).origin===location.origin);return c?c.focus().then(()=>c.navigate(url)):clients.openWindow(url)}))});