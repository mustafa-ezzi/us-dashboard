/* Us Dashboard service worker — caching shell + push notifications */

const CACHE = "us-dashboard-v2";
const SHELL = ["/", "/dates", "/mood", "/contract", "/settings"];
const NOTIFICATION_ICON = "/icons/notification-icon.png";
const NOTIFICATION_BADGE = "/icons/notification-badge.png";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache
        .addAll([
          ...SHELL,
          NOTIFICATION_ICON,
          NOTIFICATION_BADGE,
        ])
        .catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && url.pathname.match(/^\/(dates|mood|contract|settings)?$/)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match("/")))
  );
});

self.addEventListener("push", (event) => {
  let payload = { title: "Us Dashboard", body: "You have a new update.", url: "/" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    /* use defaults */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: new URL(NOTIFICATION_ICON, self.location.origin).href,
      badge: new URL(NOTIFICATION_BADGE, self.location.origin).href,
      tag: payload.tag || "us-dashboard",
      data: { url: payload.url || "/" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
