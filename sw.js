/* NNA Asset Tags service worker: keeps a copy of the app on the phone so it opens and scans offline.
   Built by build_asset_tags_app.py. VERSION changes whenever any site file changes. */
const VERSION = 'f69137a597';
const CACHE = 'nna-assets-' + VERSION;
const PRECACHE = ["./", "fonts/Archivo.woff2", "fonts/IBMPlexMono-400.woff2", "fonts/IBMPlexMono-500.woff2", "fonts/Newsreader.woff2", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "img/07f2b69ca114.webp", "img/082328c93194.webp", "img/10a01e2bd00a.webp", "img/11473d8c7cb4.webp", "img/1b9b4fedc521.webp", "img/1d8da0a61be8.webp", "img/200320c3d52d.webp", "img/295164d70cef.webp", "img/29597430390b.webp", "img/29e96a85d9f1.webp", "img/2d34baf0ebb2.webp", "img/2f4d8ecf8e86.webp", "img/349d430a12d6.webp", "img/3a6b616efbc5.webp", "img/3b16d2ace91a.webp", "img/3c38cad6ac3a.webp", "img/3cfd6a2ce00b.webp", "img/3e3aeff599a4.webp", "img/4e247695b7cb.webp", "img/549ca75b3b36.webp", "img/5d99855d6470.webp", "img/5e15716e23ae.webp", "img/6edc8e2c48a3.webp", "img/73b917205ece.webp", "img/786d264efcc1.webp", "img/7f015dc3d45b.webp", "img/8ccbcf2d6b8d.webp", "img/921d46d3a485.webp", "img/9c0930475898.webp", "img/a015f3f9ef1c.webp", "img/a645e1317364.webp", "img/a68b6c0ebe16.webp", "img/aa52a28a6b8b.webp", "img/ac6e75651148.webp", "img/ad2d081fc54c.webp", "img/bbed3a610bbb.webp", "img/bebf0ec05542.webp", "img/c05b003a397a.webp", "img/c2a02f0fd905.webp", "img/c2c47c8c401d.webp", "img/c5ac106adb3b.webp", "img/c9b0bea06439.webp", "img/d4d3464dba22.webp", "img/dd1f85bcac0b.webp", "img/dd6c5d976397.webp", "img/e81e960ee284.webp", "img/ea2c59a79494.webp", "img/efec55142e54.webp", "img/fed41448031b.webp", "img/logo.webp", "manifest.webmanifest", "vendor/qr-scanner-worker.min.js", "vendor/qr-scanner.umd.min.js"];
const SCOPE = new URL('./', self.location).pathname;  // e.g. /nna-assets/ now, / on a custom domain

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async u => {
      const r = await fetch(new Request(u, { cache: 'reload' }));  // skip the browser cache (Pages caches files for 10 min)
      if (!r.ok) throw new Error(u + ' ' + r.status);
      if (u === './' && !(await r.clone().text()).includes(VERSION)) throw new Error('index.html is older than sw.js; try again later');
      await cache.put(u, r);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('nna-assets-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  if (req.mode === 'navigate') {
    const m = url.pathname.match(/\/(NNA-\d{3,4})\/?$/i);  // a tag link like .../NNA-0041
    if (m) { e.respondWith(Response.redirect(SCOPE + '?tag=' + m[1].toUpperCase(), 302)); return; }
    if (url.pathname === SCOPE || url.pathname === SCOPE + 'index.html') {
      e.respondWith(caches.open(CACHE).then(c => c.match('./')).then(r => r || fetch(req)));
    }
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true })).then(r => r || fetch(req)));
});
