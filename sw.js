/* Ortu Lupiae — service worker.
   Serve a due cose: aprire l'app senza rete (quindi anche a PC spento) e tenerla
   installata sulla schermata Home. Non tocca i dati: le voci vivono in localStorage,
   non nella cache.

   Quando aggiorni index.html, cambia VERSIONE_CACHE: è così che il telefono
   si accorge che c'è una versione nuova. */

const VERSIONE_CACHE = "ortulupiae-v1";
const FILE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",
  "./icona-192.png",
  "./icona-512.png",
];

/* Scarica un file nella cache senza far fallire l'installazione se uno solo manca:
   con addAll() un singolo 404 lascerebbe la cache vuota e l'app muta. */
async function preparaCache() {
  const cache = await caches.open(VERSIONE_CACHE);
  await Promise.all(
    FILE.map((indirizzo) => cache.add(indirizzo).catch(() => {}))
  );
}

self.addEventListener("install", (evento) => {
  evento.waitUntil(preparaCache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chiavi) =>
        Promise.all(chiavi.filter((k) => k !== VERSIONE_CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== "GET") return;

  const url = new URL(richiesta.url);
  if (url.origin !== location.origin) return;   // non intercetta richieste esterne

  // Apertura dell'app: prima la rete (per recepire gli aggiornamenti), poi la cache.
  // Se la rete non c'è — PC spento, aereo, Wi-Fi assente — parte la copia locale.
  if (richiesta.mode === "navigate") {
    evento.respondWith(
      fetch(richiesta)
        .then((risposta) => {
          const copia = risposta.clone();
          caches.open(VERSIONE_CACHE).then((cache) => cache.put(richiesta, copia)).catch(() => {});
          return risposta;
        })
        .catch(async () => {
          const cache = await caches.open(VERSIONE_CACHE);
          return (
            (await cache.match(richiesta)) ||
            (await cache.match("./index.html")) ||
            (await cache.match("./")) ||
            new Response("Ortu Lupiae: copia locale non disponibile.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        })
    );
    return;
  }

  // Risorse: prima la cache, poi la rete.
  evento.respondWith(
    caches.match(richiesta).then((trovata) => {
      if (trovata) return trovata;
      return fetch(richiesta)
        .then((risposta) => {
          const copia = risposta.clone();
          caches.open(VERSIONE_CACHE).then((cache) => cache.put(richiesta, copia)).catch(() => {});
          return risposta;
        })
        .catch(() => new Response("", { status: 504 }));
    })
  );
});
