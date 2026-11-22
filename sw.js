const CACHE = "nodegg-shell-v4";
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
self.addEventListener("push", event => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch {}
  const icon = new URL("./pages/login/icon.png", self.registration.scope).href;
  event.waitUntil(self.registration.showNotification(payload.title || "Node.GG", {
    body: payload.body || "", icon: payload.icon || icon, badge: icon, image: payload.image,
    tag: payload.tag || "nodegg", data: payload.data || {}, requireInteraction: !!payload.requireInteraction,
    actions: (payload.actions || []).filter(action => action.action === "reply")
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = new URL("./", self.registration.scope);
  try { target.hash = new URL(data.url || "#notifications", target).hash || "#notifications"; } catch {}
  if (event.action === "reply" && /^[a-z0-9-]{1,64}$/i.test(data.notificationId || "")) {
    target.hash = "reply-" + data.notificationId;
  }
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find(client => client.url.startsWith(self.registration.scope));
    if (!existing) return clients.openWindow(target.href);
    await existing.focus();
    existing.postMessage({ type: "open_notification", hash: target.hash });
  })());
});
