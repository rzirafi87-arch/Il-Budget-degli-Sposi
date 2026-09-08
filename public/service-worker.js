self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
// Authenticated application responses are intentionally never cached.
// Offline behavior is not promised for this release candidate.
self.addEventListener("fetch", () => {});
