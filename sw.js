/* =========================================================
   SERVICE WORKER — Lim's Music Player

   Solo cachea el "shell" de la app (HTML/CSS/JS/manifest)
   para que abra rápido y funcione sin conexión.

   NO cachea catalog.json, music/, covers/, ni ninguna API
   externa (YouTube, Backblaze, etc.) — eso siempre va
   directo a la red. Cachear audio con un service worker
   básico rompe el streaming/seek, y cachear catalog.json
   mostraría canciones desactualizadas.
========================================================= */

const CACHE_NAME =
    "lims-music-shell-v1";

const SHELL_PATHS = [
    "index.html",
    "style.css",
    "player.js",
    "manifest.json"
];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches.open(
                CACHE_NAME
            ).then(
                cache =>
                    cache.addAll(
                        SHELL_PATHS
                    )
            ).catch(
                () => {}
            )
        );


        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            caches.keys().then(
                keys =>
                    Promise.all(
                        keys
                            .filter(
                                key =>
                                    key !== CACHE_NAME
                            )
                            .map(
                                key =>
                                    caches.delete(
                                        key
                                    )
                            )
                    )
            )
        );


        self.clients.claim();

    }
);


function isShellRequest(
    url
) {

    if (
        url.origin !==
        self.location.origin
    ) {

        return false;

    }


    return SHELL_PATHS.some(
        path =>
            url.pathname.endsWith(
                "/" + path
            )
    ) ||
    url.pathname ===
        self.registration.scope
            .replace(
                self.location.origin,
                ""
            );

}


self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        const url =
            new URL(
                event.request.url
            );


        if (
            !isShellRequest(
                url
            )
        ) {

            /*
             * Todo lo que no sea el shell (catalog.json,
             * music/, covers/, YouTube, Backblaze, etc.)
             * pasa directo a la red, sin intervención.
             */

            return;

        }


        event.respondWith(
            caches.match(
                event.request
            ).then(
                cached => {

                    const networkFetch =
                        fetch(
                            event.request
                        ).then(
                            response => {

                                if (
                                    response.ok
                                ) {

                                    const clone =
                                        response.clone();


                                    caches.open(
                                        CACHE_NAME
                                    ).then(
                                        cache =>
                                            cache.put(
                                                event.request,
                                                clone
                                            )
                                    );

                                }


                                return response;

                            }
                        ).catch(
                            () =>
                                cached
                        );


                    return (
                        cached ||
                        networkFetch
                    );

                }
            )
        );

    }
);
