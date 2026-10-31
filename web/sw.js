// Funciona sin conexión: guarda la app y las tipografías en caché.
const CACHE = "sello-a-sello-v1";
const BASE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // La página: primero red (para recibir actualizaciones de plazos), si no hay, caché
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // Tipografías y recursos propios: caché primero
  if (url.origin === location.origin || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => {
      const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r;
    })));
  }
});
