/* =========================================================
   LIM'S MUSIC PLAYER
   COMPLETE MUSIC MANAGER
========================================================= */


/* =========================================================
   ORIGINAL CATALOG
   NO SE BORRA NI SE MODIFICA
========================================================= */

const ORIGINAL_SONGS = [];


/* =========================================================
   PATHS
========================================================= */

const MUSIC_PATH = "music/";
const COVER_PATH = "covers/";


/* =========================================================
   CATALOG FILE
   catalog.json vive junto a index.html.
   Es la ÚNICA fuente de verdad del catálogo:
   cualquier navegador que abra el proyecto lee
   el mismo archivo, así que una canción agregada
   en un navegador aparece igual en todos los demás.
========================================================= */

const CATALOG_FILE =
    "catalog.json";


/*
 * Combina el catálogo original con lo que venga
 * de catalog.json, exactamente con las mismas
 * reglas de siempre:
 *
 * - Los originales SIEMPRE permanecen.
 * - Las canciones nuevas se agregan después,
 *   conservando su orden.
 */

function mergeCatalog(parsed) {

    if (
        !Array.isArray(parsed)
    ) {

        return ORIGINAL_SONGS.map(
            song => ({
                ...song
            })
        );

    }


    const result = [];


    ORIGINAL_SONGS.forEach(
        original => {

            const savedOriginal =
                parsed.find(
                    song =>
                        song.id ===
                        original.id
                );


            result.push(
                savedOriginal
                    ? {
                        ...original,
                        ...savedOriginal
                    }
                    : {
                        ...original
                    }
            );

        }
    );


    parsed.forEach(
        song => {

            if (
                !result.some(
                    existing =>
                        existing.id ===
                        song.id
                )
            ) {

                result.push(song);

            }

        }
    );


    return result;

}


/* =========================================================
   LOAD CATALOG (desde catalog.json)
   Es asíncrono porque usa fetch().
   Funciona igual en Edge, Brave, Chrome, etc.,
   siempre que el proyecto se sirva por http(s)
   (localhost o el hosting final).
========================================================= */

async function loadCatalogFromDisk() {

    try {

        const response =
            await fetch(
                CATALOG_FILE +
                "?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "catalog.json no encontrado (" +
                response.status +
                ")"
            );

        }


        const parsed =
            await response.json();


        return mergeCatalog(
            parsed
        );

    }

    catch (error) {

        /*
         * Si no existe catalog.json todavía,
         * o el navegador no puede leerlo
         * (por ejemplo, abierto con file://),
         * usamos el catálogo original.
         *
         * Esto NUNCA borra canciones: solo
         * significa que no se pudo leer el
         * archivo compartido.
         */

        console.warn(
            "No se pudo leer catalog.json, usando el catálogo original:",
            error.message
        );


        return ORIGINAL_SONGS.map(
            song => ({
                ...song
            })
        );

    }

}


let songs =
    ORIGINAL_SONGS.map(
        song => ({
            ...song
        })
    );


/* =========================================================
   PERSIST CATALOG
   Escribe catalog.json REAL en la carpeta del
   proyecto usando File System Access API.
   Solo funciona si el usuario autorizó esa carpeta
   (Chrome / Edge, con la carpeta local del proyecto).
   Devuelve true si se guardó en disco, false si no.
========================================================= */

async function persistCatalog() {

    if (!projectDirectoryHandle) {

        return false;

    }


    try {

        const permission =
            await verifyPermission(
                projectDirectoryHandle,
                true
            );


        if (!permission) {

            return false;

        }


        const fileHandle =
            await projectDirectoryHandle.getFileHandle(
                CATALOG_FILE,
                {
                    create: true
                }
            );


        const writable =
            await fileHandle.createWritable();


        await writable.write(
            JSON.stringify(
                songs,
                null,
                4
            )
        );


        await writable.close();


        return true;

    }

    catch (error) {

        console.error(
            "No se pudo escribir catalog.json:",
            error
        );


        return false;

    }

}


/* =========================================================
   DESCARGA MANUAL DEL CATÁLOGO
   Respaldo para navegadores sin permiso de escritura,
   y para preparar los archivos que se suben al hosting
   final (Google Sites, etc.).
========================================================= */

function downloadCatalogFile() {

    const blob =
        new Blob(
            [
                JSON.stringify(
                    songs,
                    null,
                    4
                )
            ],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        CATALOG_FILE;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   ELEMENTS
========================================================= */

const player =
    document.getElementById("player");

/*
 * Placeholder neutro (gris oscuro, sin depender de
 * ningún archivo) para cuando un cover no carga —
 * evita el ícono de imagen rota del navegador.
 */

const FALLBACK_COVER_DATA_URI =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23222226'/%3E%3C/svg%3E";

const cover =
    document.getElementById("cover");

cover.onerror =
    () => {

        cover.onerror =
            null;

        cover.src =
            FALLBACK_COVER_DATA_URI;

    };

const coverWrapper =
    document.querySelector(".cover-wrapper");

const playCover =
    document.getElementById("playCover");

const backgroundCover =
    document.getElementById("backgroundCover");

const ambient =
    document.getElementById("ambient");

const audio =
    document.getElementById("audioPlayer");

const playButton =
    document.getElementById("playButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const shuffleButton =
    document.getElementById("shuffleButton");

const repeatButton =
    document.getElementById("repeatButton");

const progress =
    document.getElementById("progress");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const volume =
    document.getElementById("volume");

const volumeValue =
    document.getElementById("volumeValue");

const songTitle =
    document.getElementById("songTitle");

const songArtist =
    document.getElementById("songArtist");

const songAlbum =
    document.getElementById("songAlbum");

const playlist =
    document.getElementById("playlist");

const playlistButton =
    document.getElementById("playlistButton");

const closePlaylist =
    document.getElementById("closePlaylist");

const playlistOverlay =
    document.getElementById("playlistOverlay");

const search =
    document.getElementById("search");

const songList =
    document.getElementById("songList");

const songCount =
    document.getElementById("songCount");

const visualizer =
    document.getElementById("audioVisualizer");


/* =========================================================
   MANAGER ELEMENTS
========================================================= */

const optionsButton =
    document.getElementById("optionsButton");

const manager =
    document.getElementById("manager");

const closeManager =
    document.getElementById("closeManager");

const managerOverlay =
    document.getElementById("managerOverlay");

const managerLogin =
    document.getElementById("managerLogin");

const managerContent =
    document.getElementById("managerContent");

const managerLoginForm =
    document.getElementById("managerLoginForm");

const managerUsername =
    document.getElementById("managerUsername");

const managerPassword =
    document.getElementById("managerPassword");

const managerLoginError =
    document.getElementById("managerLoginError");

const managerLogout =
    document.getElementById("managerLogout");

const selectProjectFolder =
    document.getElementById("selectProjectFolder");

const projectFolderStatus =
    document.getElementById("projectFolderStatus");

const downloadCatalogButton =
    document.getElementById("downloadCatalogButton");

const addSongForm =
    document.getElementById("addSongForm");

const newTitle =
    document.getElementById("newTitle");

const newArtist =
    document.getElementById("newArtist");

const newAlbum =
    document.getElementById("newAlbum");

const newAudioFile =
    document.getElementById("newAudioFile");

const newCoverFile =
    document.getElementById("newCoverFile");

const editSongList =
    document.getElementById("editSongList");


/* =========================================================
   STATE
========================================================= */

let currentIndex = 0;

let shuffleEnabled = false;

/*
 * "off"  → no repite, se detiene al llegar
 *          al final de la playlist
 * "all"  → al terminar la última canción,
 *          vuelve a la primera (comportamiento
 *          de siempre)
 * "one"  → repite la canción actual en loop
 */

let repeatMode = "off";

let rotation = 0;

let rotationFrame = null;

let lastRotationTime = 0;

/*
 * PALETA DE COLORES DEL COVER ACTUAL.
 *
 * Se recalcula cada vez que cambia la canción
 * (dentro de extractCoverColors). Mientras el
 * disco gira, el color ambiental interpola de
 * forma continua a través de esta paleta —
 * ver rotate() en startRotation().
 */

const FALLBACK_PALETTE = [
    { r: 120, g: 120, b: 120 },
    { r: 80, g: 80, b: 80 },
    { r: 160, g: 160, b: 160 }
];

let coverPalette =
    FALLBACK_PALETTE;


let visualizerFrame = null;

let visualizerBars = [];

let projectDirectoryHandle = null;

let musicDirectoryHandle = null;

let coverDirectoryHandle = null;


/* =========================================================
   URL
========================================================= */

function getMusicURL(file) {

    return (
        MUSIC_PATH +
        encodeURIComponent(file)
    );

}


function getCoverURL(file) {

    return (
        COVER_PATH +
        encodeURIComponent(file)
    );

}


/* =========================================================
   FILE SYSTEM SUPPORT
========================================================= */

function fileSystemSupported() {

    return (
        "showDirectoryPicker" in window
    );

}


/* =========================================================
   INDEXED DB
   Guarda las carpetas seleccionadas
========================================================= */

const DB_NAME =
    "lims-music-player-db";

const DB_VERSION =
    1;

const STORE_NAME =
    "handles";


function openHandleDB() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                () => {

                    const db =
                        request.result;


                    if (
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        db.createObjectStore(
                            STORE_NAME
                        );

                    }

                };


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


async function saveDirectoryHandle(
    key,
    handle
) {

    const db =
        await openHandleDB();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            transaction.objectStore(
                STORE_NAME
            ).put(
                handle,
                key
            );


            transaction.oncomplete =
                () => {

                    resolve();

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


async function getDirectoryHandle(
    key
) {

    const db =
        await openHandleDB();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const request =
                transaction.objectStore(
                    STORE_NAME
                ).get(
                    key
                );


            request.onsuccess =
                () => {

                    resolve(
                        request.result || null
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   PERMISSION
========================================================= */

async function verifyPermission(
    handle,
    write = false
) {

    if (!handle) {

        return false;

    }


    const options =
        write
            ? {
                mode: "readwrite"
            }
            : {};


    if (
        (
            await handle.queryPermission(
                options
            )
        ) === "granted"
    ) {

        return true;

    }


    if (
        (
            await handle.requestPermission(
                options
            )
        ) === "granted"
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   USE PROJECT FOLDER
   Recibe la carpeta raíz del proyecto (la que contiene
   index.html, music/ y covers/) y deriva las subcarpetas
   MUSIC y COVERS.

   IMPORTANTE:
   getDirectoryHandle(name, { create:false }) NUNCA crea
   una carpeta. Si music/ o covers/ no existen dentro de
   lo seleccionado, lanza un error claro en vez de crearlas.
========================================================= */

async function useProjectFolder(
    handle,
    options = {}
) {

    const {
        requireFreshPermission = true
    } = options;


    const music =
        await handle.getDirectoryHandle(
            "music",
            {
                create: false
            }
        );


    const covers =
        await handle.getDirectoryHandle(
            "covers",
            {
                create: false
            }
        );


    projectDirectoryHandle =
        handle;

    musicDirectoryHandle =
        music;

    coverDirectoryHandle =
        covers;


    /*
     * Si NO exigimos permiso fresco (caso de
     * restauración automática al abrir la página),
     * solo intentamos leer catalog.json si el
     * navegador YA concedió permiso de lectura en
     * silencio. requestPermission() no puede mostrarse
     * automáticamente sin un clic del usuario, así que
     * no lo forzamos aquí.
     */

    if (!requireFreshPermission) {

        const state =
            await handle.queryPermission(
                {
                    mode: "read"
                }
            );


        if (state !== "granted") {

            projectFolderStatus.textContent =
                `Carpeta "${handle.name}" recordada. ` +
                `Haz clic para autorizarla y cargar tus canciones.`;

            return;

        }

    }


    projectFolderStatus.textContent =
        `✓ ${handle.name} (music/ y covers/ detectadas)`;


    /*
     * LEER catalog.json DIRECTO DESDE DISCO.
     *
     * Esto es lo que permite que el catálogo cargue
     * incluso si el proyecto se abrió con doble clic
     * (file://), donde fetch() NO puede leer archivos
     * locales. File System Access sí puede, porque el
     * usuario ya autorizó esta carpeta explícitamente.
     *
     * Si el archivo todavía no existe (proyecto nuevo,
     * sin canciones agregadas todavía), no hacemos nada:
     * seguimos con lo que ya estaba cargado.
     */

    try {

        const catalogHandle =
            await handle.getFileHandle(
                CATALOG_FILE,
                {
                    create: false
                }
            );


        const file =
            await catalogHandle.getFile();

        const text =
            await file.text();

        const parsed =
            JSON.parse(text);


        const previousSongId =
            songs[currentIndex]
                ? songs[currentIndex].id
                : null;


        songs =
            mergeCatalog(
                parsed
            );


        renderPlaylist(
            search.value
        );


        const restoredIndex =
            previousSongId
                ? songs.findIndex(
                    song =>
                        song.id ===
                        previousSongId
                )
                : -1;


        loadSong(
            restoredIndex >= 0
                ? restoredIndex
                : 0,
            false
        );

    }

    catch (error) {

        if (
            error.name !==
            "NotFoundError"
        ) {

            console.warn(
                "No se pudo leer catalog.json desde la carpeta del proyecto:",
                error
            );

        }

    }

}


/* =========================================================
   RESTORE PROJECT FOLDER
========================================================= */

async function restoreProjectFolder() {

    if (
        !fileSystemSupported()
    ) {

        projectFolderStatus.textContent =
            "Tu navegador no soporta esto. Usa Chrome o Edge.";

        return;

    }


    try {

        const handle =
            await getDirectoryHandle(
                "project"
            );


        if (!handle) {

            return;

        }


        await useProjectFolder(
            handle,
            {
                requireFreshPermission: false
            }
        );

    }

    catch (error) {

        console.warn(
            "No se pudo restaurar la carpeta del proyecto:",
            error
        );

    }

}


/* =========================================================
   SELECT PROJECT FOLDER
   IMPORTANTE:
   NO CREA NINGUNA CARPETA NUEVA.
   El usuario debe seleccionar la carpeta que YA
   contiene index.html, music/ y covers/.
========================================================= */

async function chooseProjectFolder() {

    if (
        !fileSystemSupported()
    ) {

        alert(
            "Tu navegador no soporta esta función. Usa Google Chrome o Microsoft Edge."
        );

        return;

    }


    try {

        const handle =
            await window.showDirectoryPicker({
                mode: "readwrite"
            });


        await useProjectFolder(
            handle
        );


        await saveDirectoryHandle(
            "project",
            handle
        );

    }

    catch (error) {

        if (
            error.name ===
            "NotFoundError"
        ) {

            alert(
                "Esa carpeta no tiene music/ y covers/ dentro. " +
                "Selecciona la carpeta raíz del proyecto (donde está index.html), " +
                "no una subcarpeta."
            );

        }

        else if (
            error.name !==
            "AbortError"
        ) {

            console.error(
                "Error seleccionando la carpeta del proyecto:",
                error
            );

            alert(
                "No se pudo seleccionar la carpeta del proyecto."
            );

        }

    }

}


selectProjectFolder.addEventListener(
    "click",
    chooseProjectFolder
);


downloadCatalogButton.addEventListener(
    "click",
    downloadCatalogFile
);


/* =========================================================
   SAFE FILE EXISTENCE CHECK
========================================================= */

async function fileExists(
    directoryHandle,
    filename
) {

    try {

        await directoryHandle.getFileHandle(
            filename,
            {
                create: false
            }
        );


        return true;

    }

    catch (error) {

        if (
            error.name ===
            "NotFoundError"
        ) {

            return false;

        }


        throw error;

    }

}


/* =========================================================
   COPY FILE INTO EXISTING FOLDER
========================================================= */

async function copyFileToFolder(
    file,
    directoryHandle
) {

    const exists =
        await fileExists(
            directoryHandle,
            file.name
        );


    if (exists) {

        throw new Error(
            `Ya existe un archivo llamado "${file.name}". No se sobrescribirá.`
        );

    }


    /*
     * create:true aquí SOLO crea el ARCHIVO.
     *
     * Nunca crea una carpeta.
     */

    const destination =
        await directoryHandle.getFileHandle(
            file.name,
            {
                create: true
            }
        );


    const writable =
        await destination.createWritable();


    try {

        await writable.write(
            file
        );

        await writable.close();

    }

    catch (error) {

        try {

            await writable.abort();

        }

        catch (_) {}

        throw error;

    }

}


/* =========================================================
   ADD SONG
========================================================= */

addSongForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (
            !projectDirectoryHandle
        ) {

            alert(
                "Primero debes seleccionar la carpeta del proyecto."
            );

            return;

        }


        const hasPermission =
            await verifyPermission(
                projectDirectoryHandle,
                true
            );


        if (!hasPermission) {

            alert(
                "No hay permiso para escribir en la carpeta del proyecto."
            );

            return;

        }


        const audioFile =
            newAudioFile.files[0];

        const coverFile =
            newCoverFile.files[0];


        if (
            !audioFile ||
            !coverFile
        ) {

            alert(
                "Selecciona tanto el MP3 como el cover."
            );

            return;

        }


        if (
            !audioFile.name
                .toLowerCase()
                .endsWith(".mp3")
        ) {

            alert(
                "El archivo de música debe ser MP3."
            );

            return;

        }


        if (
            !coverFile.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "El cover debe ser una imagen."
            );

            return;

        }


        const title =
            newTitle.value.trim();

        const artist =
            newArtist.value.trim();

        const album =
            newAlbum.value.trim();


        if (
            !title ||
            !artist ||
            !album
        ) {

            alert(
                "Completa título, artista y álbum."
            );

            return;

        }


        /*
         * Evitar sobrescribir música.
         */

        if (
            await fileExists(
                musicDirectoryHandle,
                audioFile.name
            )
        ) {

            alert(
                `La canción "${audioFile.name}" ya existe en MUSIC. No se modificó.`
            );

            return;

        }


        /*
         * El cover SÍ puede repetirse a propósito —
         * varias canciones del mismo álbum comparten
         * portada. Si el archivo ya existe en covers/,
         * simplemente lo reutilizamos en vez de
         * bloquear el guardado.
         */

        const coverAlreadyExists =
            await fileExists(
                coverDirectoryHandle,
                coverFile.name
            );


        /*
         * Primero copiamos la música.
         */

        try {

            await copyFileToFolder(
                audioFile,
                musicDirectoryHandle
            );

        }

        catch (error) {

            console.error(
                error
            );

            alert(
                error.message ||
                "No se pudo copiar la canción."
            );

            return;

        }


        /*
         * Después copiamos el cover — a menos que ya
         * exista, en cuyo caso lo reutilizamos tal cual
         * (misma portada para varias canciones del
         * mismo álbum).
         */

        if (!coverAlreadyExists) {

            try {

                await copyFileToFolder(
                    coverFile,
                    coverDirectoryHandle
                );

            }

            catch (error) {

                console.error(
                    error
                );


                /*
                 * IMPORTANTE:
                 *
                 * No borramos la canción que acabamos
                 * de copiar.
                 *
                 * Así nunca tocamos archivos existentes.
                 */

                alert(
                    "La canción se copió correctamente, pero no se pudo copiar el cover.\n\n" +
                    error.message
                );

                return;

            }

        }


        /*
         * Crear entrada del catálogo.
         */

        const newSong = {

            id:
                "song-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2),

            title:
                title,

            artist:
                artist,

            album:
                album,

            file:
                audioFile.name,

            cover:
                coverFile.name

        };


        /*
         * Se agrega AL FINAL.
         *
         * Por lo tanto, el orden original permanece.
         */

        songs.push(
            newSong
        );


        const savedToDisk =
            await persistCatalog();


        /*
         * Limpiar formulario.
         */

        addSongForm.reset();


        renderPlaylist(
            search.value
        );


        renderEditSongs();


        if (savedToDisk) {

            alert(
                `✓ "${title}" fue agregada correctamente.\n\n` +
                `Música → ${musicDirectoryHandle.name}\n` +
                `Cover → ${coverDirectoryHandle.name}` +
                (
                    coverAlreadyExists
                        ? " (reutilizando el cover existente)"
                        : ""
                ) +
                `\ncatalog.json actualizado — esta canción ya se verá en cualquier navegador.`
            );

        }

        else {

            alert(
                `"${title}" se copió a music/ y covers/, pero no se pudo actualizar catalog.json automáticamente.\n\n` +
                `Usa el botón "Descargar catalog.json" y reemplaza el archivo manualmente en la carpeta del proyecto, ` +
                `o la canción solo se verá en este navegador.`
            );

        }

    }
);


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(
    index,
    autoplay = false
) {

    if (
        index < 0 ||
        index >= songs.length
    ) {

        return;

    }


    currentIndex =
        index;


    const song =
        songs[currentIndex];


    stopRotation();


    audio.pause();


    audio.currentTime =
        0;


    const musicURL =
        getMusicURL(
            song.file
        );


    const coverURL =
        getCoverURL(
            song.cover
        );


    audio.src =
        musicURL;


    audio.load();


    cover.src =
        coverURL;


    playCover.style.backgroundImage =
        `url("${coverURL}")`;


    backgroundCover.style.backgroundImage =
        `url("${coverURL}")`;


    songTitle.textContent =
        song.title;


    songArtist.textContent =
        song.artist;


    if (songAlbum) {

        songAlbum.textContent =
            song.album || "";


        songAlbum.classList.toggle(
            "visible",
            Boolean(song.album)
        );

    }


    updateMediaSessionMetadata(
        song,
        coverURL
    );


    /*
     * TRANSICIÓN CINEMATOGRÁFICA
     * AL CAMBIAR DE CANCIÓN.
     *
     * Reiniciamos las animaciones de fade
     * quitando y volviendo a poner la clase,
     * forzando un reflow entre medio para que
     * el navegador la vuelva a reproducir.
     *
     * Es puramente visual (opacity / translateY),
     * nunca toca `transform` en .cover — esa
     * propiedad la controla exclusivamente la
     * rotación por JS, para no pelearse con ella.
     */

    const fadeTargets = [
        songTitle,
        songArtist,
        coverWrapper
    ].filter(
        Boolean
    );


    if (
        songAlbum &&
        song.album
    ) {

        fadeTargets.push(
            songAlbum
        );

    }


    fadeTargets.forEach(
        element => {

            element.classList.remove(
                "fade-in"
            );

        }
    );


    void player.offsetWidth;


    fadeTargets.forEach(
        element => {

            element.classList.add(
                "fade-in"
            );

        }
    );


    rotation =
        0;


    cover.style.transform =
        "rotate(0deg)";


    progress.value =
        0;


    updateProgress();


    extractCoverColors(
        coverURL
    );


    renderPlaylist(
        search.value
    );


    if (autoplay) {

        playSong();

    }

}


/* =========================================================
   PLAY
========================================================= */

async function playSong() {

    if (
        songs.length === 0
    ) {

        return;

    }


    try {

        await audio.play();


        player.classList.add(
            "is-playing"
        );


        playButton.setAttribute(
            "aria-label",
            "Pausar"
        );


        playButton.setAttribute(
            "title",
            "Pausar"
        );


        startRotation();


        startVisualizer();


        updateMediaSessionPlaybackState(
            "playing"
        );

    }

    catch (error) {

        console.error(
            "No se pudo reproducir:",
            error
        );


        console.error(
            "Archivo:",
            audio.src
        );


        player.classList.add(
            "audio-error"
        );


        setTimeout(
            () => {

                player.classList.remove(
                    "audio-error"
                );

            },
            1200
        );

    }

}


/* =========================================================
   MEDIA SESSION
   Controles desde la pantalla de bloqueo, el centro
   de medios del sistema, y teclas multimedia del
   teclado. No toca la lógica de reproducción — solo
   la refleja hacia afuera.
========================================================= */

function updateMediaSessionMetadata(
    song,
    coverURL
) {

    if (
        !("mediaSession" in navigator)
    ) {

        return;

    }


    try {

        navigator.mediaSession.metadata =
            new MediaMetadata(
                {
                    title:
                        song.title,

                    artist:
                        song.artist,

                    album:
                        song.album || "",

                    artwork: [
                        {
                            src: coverURL,
                            sizes: "512x512"
                        }
                    ]
                }
            );

    }

    catch (error) {

        console.warn(
            "No se pudo actualizar Media Session:",
            error
        );

    }

}


function updateMediaSessionPlaybackState(
    state
) {

    if (
        !("mediaSession" in navigator)
    ) {

        return;

    }


    navigator.mediaSession.playbackState =
        state;

}


function setupMediaSessionActionHandlers() {

    if (
        !("mediaSession" in navigator)
    ) {

        return;

    }


    const handlers = {

        play: () => {

            playSong();

        },

        pause: () => {

            pauseSong();

        },

        previoustrack: () => {

            previousSong();

        },

        nexttrack: () => {

            nextSong(true);

        },

        seekto: event => {

            if (
                event.seekTime !== undefined &&
                Number.isFinite(
                    audio.duration
                )
            ) {

                audio.currentTime =
                    event.seekTime;

            }

        }

    };


    Object.keys(
        handlers
    ).forEach(
        action => {

            try {

                navigator.mediaSession.setActionHandler(
                    action,
                    handlers[action]
                );

            }

            catch (error) {

                /*
                 * Algunos navegadores no soportan
                 * todas las acciones (ej. seekto
                 * en Firefox) — se ignora sin
                 * romper el resto.
                 */

            }

        }
    );

}


/* =========================================================
   PAUSE
========================================================= */

function pauseSong() {

    audio.pause();

    player.classList.remove(
        "is-playing"
    );


    playButton.setAttribute(
        "aria-label",
        "Reproducir"
    );


    playButton.setAttribute(
        "title",
        "Reproducir"
    );


    stopRotation();


    updateMediaSessionPlaybackState(
        "paused"
    );

}


/* =========================================================
   TOGGLE
========================================================= */

function togglePlay() {

    if (
        audio.paused
    ) {

        playSong();

    }

    else {

        pauseSong();

    }

}


/* =========================================================
   AUDIO EVENTS
========================================================= */

audio.addEventListener(
    "play",
    () => {

        player.classList.add(
            "is-playing"
        );


        playButton.setAttribute(
            "aria-label",
            "Pausar"
        );


        playButton.setAttribute(
            "title",
            "Pausar"
        );


        startRotation();

        startVisualizer();

    }
);


audio.addEventListener(
    "pause",
    () => {

        player.classList.remove(
            "is-playing"
        );


        playButton.setAttribute(
            "aria-label",
            "Reproducir"
        );


        playButton.setAttribute(
            "title",
            "Reproducir"
        );


        stopRotation();

    }
);


audio.addEventListener(
    "error",
    () => {

        console.error(
            "ERROR DE AUDIO:",
            audio.error
        );


        console.error(
            "Archivo:",
            audio.src
        );


        player.classList.add(
            "audio-error"
        );


        setTimeout(
            () => {

                player.classList.remove(
                    "audio-error"
                );

            },
            1200
        );

    }
);


/* =========================================================
   ROTATION
========================================================= */

function startRotation() {

    if (
        rotationFrame
    ) {

        return;

    }


    lastRotationTime =
        performance.now();


    function rotate(
        timestamp
    ) {

        if (
            audio.paused
        ) {

            stopRotation();

            return;

        }


        /*
         * IMPORTANTE:
         *
         * Pedimos el SIGUIENTE cuadro primero,
         * antes de hacer cualquier otro cálculo.
         *
         * Así, si algo de lo que sigue lanza un
         * error puntual (un color raro, una lectura
         * del DOM en mal momento, etc.), el loop
         * NUNCA se queda trabado esperando pausa/
         * despausa — el siguiente cuadro ya está
         * programado pase lo que pase.
         */

        rotationFrame =
            requestAnimationFrame(
                rotate
            );


        try {

            const delta =
                timestamp -
                lastRotationTime;


            lastRotationTime =
                timestamp;


            rotation +=
                delta *
                0.018;


            if (
                rotation >= 360
            ) {

                rotation %=
                    360;

            }


            cover.style.transform =
                `rotate(${rotation}deg)`;


            /*
             * El color ambiental avanza EXACTAMENTE
             * junto con la rotación del disco.
             *
             * Como esto solo se ejecuta dentro de
             * este mismo loop, se congela solo por
             * el hecho de pausar (stopRotation
             * cancela este requestAnimationFrame).
             */

            applyColors(
                getAmbientColorForRotation(
                    rotation
                )
            );

        }

        catch (error) {

            /*
             * Un cuadro fallido no debe matar el
             * loop completo — se ignora y seguimos
             * en el siguiente cuadro, ya programado
             * arriba.
             */

            console.error(
                "Rotación: se ignoró un cuadro por un error:",
                error
            );

        }

    }


    rotationFrame =
        requestAnimationFrame(
            rotate
        );

}


function stopRotation() {

    if (
        rotationFrame !== null
    ) {

        cancelAnimationFrame(
            rotationFrame
        );


        rotationFrame =
            null;

    }


    lastRotationTime =
        0;

}


/* =========================================================
   NEXT
   RECORRE TODO EL CATÁLOGO
========================================================= */

function nextSong(
    autoplay = true
) {

    let nextIndex;


    if (
        shuffleEnabled
    ) {

        if (
            songs.length <= 1
        ) {

            nextIndex =
                currentIndex;

        }

        else {

            do {

                nextIndex =
                    Math.floor(
                        Math.random() *
                        songs.length
                    );

            }
            while (
                nextIndex ===
                currentIndex
            );

        }

    }

    else {

        nextIndex =
            currentIndex + 1;


        if (
            nextIndex >=
            songs.length
        ) {

            nextIndex =
                0;

        }

    }


    loadSong(
        nextIndex,
        autoplay
    );

}


/* =========================================================
   PREVIOUS
========================================================= */

function previousSong() {

    if (
        audio.currentTime > 3
    ) {

        audio.currentTime =
            0;

        return;

    }


    let previousIndex =
        currentIndex - 1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            songs.length - 1;

    }


    loadSong(
        previousIndex,
        true
    );

}


/* =========================================================
   CONTROLS
========================================================= */

nextButton.addEventListener(
    "click",
    () => {

        nextSong(true);

    }
);


previousButton.addEventListener(
    "click",
    previousSong
);


playButton.addEventListener(
    "click",
    togglePlay
);


/* =========================================================
   SHUFFLE
========================================================= */

shuffleButton.addEventListener(
    "click",
    () => {

        shuffleEnabled =
            !shuffleEnabled;


        shuffleButton.classList.toggle(
            "active",
            shuffleEnabled
        );


        shuffleButton.setAttribute(
            "aria-pressed",
            String(
                shuffleEnabled
            )
        );


        shuffleButton.title =
            shuffleEnabled
                ? "Aleatorio activado"
                : "Aleatorio";

    }
);


/* =========================================================
   REPEAT
========================================================= */

repeatButton.addEventListener(
    "click",
    () => {

        const nextMode = {
            off: "all",
            all: "one",
            one: "off"
        };


        repeatMode =
            nextMode[repeatMode];


        repeatButton.classList.toggle(
            "active",
            repeatMode !== "off"
        );


        repeatButton.classList.toggle(
            "repeat-one",
            repeatMode === "one"
        );


        repeatButton.setAttribute(
            "aria-pressed",
            String(
                repeatMode !== "off"
            )
        );


        const labels = {
            off: "Repetir",
            all: "Repetir playlist activado",
            one: "Repetir una canción activado"
        };


        repeatButton.title =
            labels[repeatMode];


        repeatButton.setAttribute(
            "aria-label",
            labels[repeatMode]
        );

    }
);


/* =========================================================
   SONG END
========================================================= */

audio.addEventListener(
    "ended",
    () => {

        if (
            repeatMode === "one"
        ) {

            audio.currentTime =
                0;

            playSong();

            return;

        }


        const isLastSong =
            currentIndex ===
            songs.length - 1;


        if (
            repeatMode === "off" &&
            isLastSong &&
            !shuffleEnabled
        ) {

            /*
             * Llegamos al final de la playlist
             * sin repeat activado — nos quedamos
             * quietos en la última canción en
             * vez de volver a la primera.
             */

            pauseSong();

            return;

        }


        nextSong(true);

    }
);


/* =========================================================
   PROGRESS
========================================================= */

audio.addEventListener(
    "timeupdate",
    updateProgress
);


audio.addEventListener(
    "loadedmetadata",
    updateProgress
);


function updateProgress() {

    const current =
        Number(
            audio.currentTime
        ) || 0;


    const total =
        Number(
            audio.duration
        ) || 0;


    if (
        total > 0
    ) {

        progress.value =
            (
                current /
                total
            ) *
            100;

    }

    else {

        progress.value =
            0;

    }


    currentTime.textContent =
        formatTime(
            current
        );


    duration.textContent =
        formatTime(
            total
        );


    updateProgressBackground();


    if (
        "mediaSession" in navigator &&
        "setPositionState" in navigator.mediaSession &&
        Number.isFinite(total) &&
        total > 0
    ) {

        try {

            navigator.mediaSession.setPositionState(
                {
                    duration: total,
                    playbackRate: audio.playbackRate || 1,
                    position: Math.min(current, total)
                }
            );

        }

        catch (error) {

            /*
             * setPositionState puede fallar si se
             * llama justo cuando cambia de canción
             * (duración todavía inconsistente) —
             * se ignora, no es crítico.
             */

        }

    }

}


progress.addEventListener(
    "input",
    () => {

        const total =
            audio.duration;


        if (
            !Number.isFinite(
                total
            ) ||
            total <= 0
        ) {

            return;

        }


        audio.currentTime =
            (
                Number(
                    progress.value
                ) / 100
            ) *
            total;


        updateProgressBackground();

    }
);


function updateProgressBackground() {

    const value =
        Number(
            progress.value
        ) || 0;


    progress.style.background =
        `linear-gradient(
            to right,
            var(--accent) 0%,
            var(--accent) ${value}%,
            var(--track) ${value}%,
            var(--track) 100%
        )`;

}


/* =========================================================
   VOLUME
========================================================= */

const VOLUME_STORAGE_KEY =
    "lims_volume";


function setVolumeValue(
    newValue
) {

    const clamped =
        Math.min(
            100,
            Math.max(
                0,
                newValue
            )
        );


    volume.value =
        clamped;


    audio.volume =
        clamped / 100;


    updateVolume();


    try {

        localStorage.setItem(
            VOLUME_STORAGE_KEY,
            String(
                clamped
            )
        );

    }

    catch (error) {}

}


volume.addEventListener(
    "input",
    () => {

        setVolumeValue(
            Number(
                volume.value
            )
        );

    }
);


function updateVolume() {

    const value =
        Number(
            volume.value
        );


    volumeValue.textContent =
        value;


    volume.style.background =
        `linear-gradient(
            to right,
            var(--accent) 0%,
            var(--accent) ${value}%,
            var(--track) ${value}%,
            var(--track) 100%
        )`;

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    seconds
) {

    if (
        !Number.isFinite(
            seconds
        ) ||
        seconds < 0
    ) {

        return "00:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        Math.floor(
            seconds % 60
        );


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":" +
        String(secs)
            .padStart(2, "0")
    );

}


/* =========================================================
   PLAYLIST DATA GROUPING
========================================================= */

/*
 * IMPORTANTE:
 *
 * NO ordenamos alfabéticamente las canciones.
 *
 * Se conserva el orden del array.
 *
 * Los artistas aparecen en el orden en que
 * aparecen por primera vez.
 *
 * Dentro de cada artista, los álbumes aparecen
 * en el orden en que aparecen por primera vez.
 */

function buildArtistGroups(
    sourceSongs
) {

    const groups = [];


    sourceSongs.forEach(
        song => {

            let artistGroup =
                groups.find(
                    group =>
                        group.artist ===
                        song.artist
                );


            if (
                !artistGroup
            ) {

                artistGroup = {

                    artist:
                        song.artist,

                    albums: []

                };


                groups.push(
                    artistGroup
                );

            }


            let albumGroup =
                artistGroup.albums.find(
                    album =>
                        album.album ===
                        song.album
                );


            if (
                !albumGroup
            ) {

                albumGroup = {

                    album:
                        song.album,

                    songs: []

                };


                artistGroup.albums.push(
                    albumGroup
                );

            }


            albumGroup.songs.push(
                song
            );

        }
    );


    /*
     * Orden alfabético por artista — ÚNICAMENTE
     * visual. El array `songs` (orden real de
     * reproducción con siguiente/anterior) nunca
     * se reordena, solo esta lista de grupos que
     * usa renderPlaylist() para pintar la UI.
     */

    groups.sort(
        (a, b) =>
            a.artist.localeCompare(
                b.artist,
                undefined,
                {
                    sensitivity: "base"
                }
            )
    );


    return groups;

}


/* =========================================================
   PLAYLIST
========================================================= */

function renderPlaylist(
    filter = ""
) {

    songList.innerHTML =
        "";


    const normalized =
        filter
            .toLowerCase()
            .trim();


    const filtered =
        songs.filter(
            song => {

                const text =
                    (
                        song.title +
                        " " +
                        song.artist +
                        " " +
                        song.album
                    )
                    .toLowerCase();


                return text.includes(
                    normalized
                );

            }
        );


    songCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "song"
                : "songs"
        }`;


    if (
        filtered.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-message";


        const emptyTitle =
            document.createElement(
                "div"
            );


        emptyTitle.className =
            "empty-message-title";


        const emptySubtitle =
            document.createElement(
                "div"
            );


        emptySubtitle.className =
            "empty-message-subtitle";


        if (
            songs.length === 0
        ) {

            emptyTitle.textContent =
                "Your library is empty";

            emptySubtitle.textContent =
                "Add your first song to start listening.";

        }

        else {

            emptyTitle.textContent =
                "No results";

            emptySubtitle.textContent =
                `Nothing matches "${search.value}".`;

        }


        empty.appendChild(
            emptyTitle
        );


        empty.appendChild(
            emptySubtitle
        );


        songList.appendChild(
            empty
        );


        return;

    }


    const groups =
        buildArtistGroups(
            filtered
        );


    groups.forEach(
        artistGroup => {

            /*
             * ARTIST DROPDOWN
             */

            const artistDetails =
                document.createElement(
                    "details"
                );


            artistDetails.className =
                "artist-dropdown";


            /*
             * El primer artista se deja
             * abierto solamente cuando
             * hay búsqueda.
             */

            if (
                normalized
            ) {

                artistDetails.open =
                    true;

            }


            const artistSummary =
                document.createElement(
                    "summary"
                );


            artistSummary.className =
                "artist-summary";


            const artistName =
                document.createElement(
                    "span"
                );


            artistName.textContent =
                artistGroup.artist;


            artistSummary.appendChild(
                artistName
            );


            artistDetails.appendChild(
                artistSummary
            );


            /*
             * ALBUMS
             */

            artistGroup.albums.forEach(
                albumGroup => {

                    const albumDetails =
                        document.createElement(
                            "details"
                        );


                    albumDetails.className =
                        "album-dropdown";


                    if (
                        normalized
                    ) {

                        albumDetails.open =
                            true;

                    }


                    const albumSummary =
                        document.createElement(
                            "summary"
                        );


                    albumSummary.className =
                        "album-summary";


                    albumSummary.textContent =
                        albumGroup.album;


                    albumDetails.appendChild(
                        albumSummary
                    );


                    /*
                     * SONGS
                     */

                    albumGroup.songs.forEach(
                        song => {

                            const index =
                                songs.indexOf(
                                    song
                                );


                            const button =
                                document.createElement(
                                    "button"
                                );


                            button.className =
                                "song-item";


                            if (
                                index ===
                                currentIndex
                            ) {

                                button.classList.add(
                                    "active"
                                );

                            }


                            const image =
                                document.createElement(
                                    "img"
                                );


                            image.className =
                                "song-item-cover";


                            image.src =
                                getCoverURL(
                                    song.cover
                                );


                            image.alt =
                                song.title;


                            image.onerror =
                                () => {

                                    image.onerror =
                                        null;

                                    image.src =
                                        FALLBACK_COVER_DATA_URI;

                                };


                            const info =
                                document.createElement(
                                    "div"
                                );


                            info.className =
                                "song-item-info";


                            const title =
                                document.createElement(
                                    "div"
                                );


                            title.className =
                                "song-item-title";


                            title.textContent =
                                song.title;


                            const artist =
                                document.createElement(
                                    "div"
                                );


                            artist.className =
                                "song-item-artist";


                            artist.textContent =
                                song.file;


                            info.appendChild(
                                title
                            );


                            info.appendChild(
                                artist
                            );


                            button.appendChild(
                                image
                            );


                            button.appendChild(
                                info
                            );


                            button.addEventListener(
                                "click",
                                () => {

                                    loadSong(
                                        index,
                                        true
                                    );


                                    closePlaylistPanel();

                                }
                            );


                            albumDetails.appendChild(
                                button
                            );

                        }
                    );


                    artistDetails.appendChild(
                        albumDetails
                    );

                }
            );


            songList.appendChild(
                artistDetails
            );

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

search.addEventListener(
    "input",
    () => {

        renderPlaylist(
            search.value
        );

    }
);


/* =========================================================
   PLAYLIST OPEN
========================================================= */

function openPlaylist() {

    closeManagerPanel();


    playlist.classList.add(
        "open"
    );


    playlistOverlay.classList.add(
        "open"
    );


    playlist.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   PLAYLIST CLOSE
========================================================= */

function closePlaylistPanel() {

    playlist.classList.remove(
        "open"
    );


    playlistOverlay.classList.remove(
        "open"
    );


    playlist.setAttribute(
        "aria-hidden",
        "true"
    );

}


playlistButton.addEventListener(
    "click",
    openPlaylist
);


closePlaylist.addEventListener(
    "click",
    closePlaylistPanel
);


playlistOverlay.addEventListener(
    "click",
    closePlaylistPanel
);


/* =========================================================
   MANAGER
========================================================= */

/* =========================================================
   MANAGER LOGIN

   IMPORTANTE — esto es un candado simple, NO seguridad
   real. Este proyecto es una página estática: cualquiera
   que abra las herramientas de desarrollador puede leer
   este usuario/contraseña directo en player.js. Sirve
   únicamente para que un visitante casual no se ponga a
   tocar "Agregar canción" por curiosidad — no para
   proteger datos sensibles.
========================================================= */

const MANAGER_USERNAME =
    "L";

const MANAGER_PASSWORD =
    "limn";

const MANAGER_SESSION_KEY =
    "lims_manager_unlocked";


function isManagerUnlocked() {

    try {

        return (
            sessionStorage.getItem(
                MANAGER_SESSION_KEY
            ) === "true"
        );

    }

    catch (error) {

        return false;

    }

}


function showManagerContent() {

    managerLogin.hidden =
        true;

    managerContent.hidden =
        false;

}


function showManagerLogin() {

    managerContent.hidden =
        true;

    managerLogin.hidden =
        false;


    managerPassword.value =
        "";


    managerLoginError.textContent =
        "";


    managerLoginError.classList.remove(
        "visible"
    );

}


function unlockManager() {

    try {

        sessionStorage.setItem(
            MANAGER_SESSION_KEY,
            "true"
        );

    }

    catch (error) {

        /*
         * Si sessionStorage no está disponible,
         * el desbloqueo solo dura mientras la
         * pestaña siga abierta en memoria.
         */

    }


    showManagerContent();

}


function lockManager() {

    try {

        sessionStorage.removeItem(
            MANAGER_SESSION_KEY
        );

    }

    catch (error) {}


    showManagerLogin();

}


managerLoginForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const enteredUsername =
            managerUsername.value.trim();

        const enteredPassword =
            managerPassword.value;


        if (
            enteredUsername === MANAGER_USERNAME &&
            enteredPassword === MANAGER_PASSWORD
        ) {

            managerLoginForm.reset();


            unlockManager();


            renderEditSongs();

        }

        else {

            managerLoginError.textContent =
                "Usuario o contraseña incorrectos.";


            managerLoginError.classList.add(
                "visible"
            );


            managerPassword.value =
                "";


            managerPassword.focus();

        }

    }
);


managerLogout.addEventListener(
    "click",
    lockManager
);


function openManager() {

    closePlaylistPanel();


    manager.classList.add(
        "open"
    );


    managerOverlay.classList.add(
        "open"
    );


    manager.setAttribute(
        "aria-hidden",
        "false"
    );


    if (
        isManagerUnlocked()
    ) {

        showManagerContent();


        renderEditSongs();

    }

    else {

        showManagerLogin();

    }

}


function closeManagerPanel() {

    manager.classList.remove(
        "open"
    );


    managerOverlay.classList.remove(
        "open"
    );


    manager.setAttribute(
        "aria-hidden",
        "true"
    );

}


optionsButton.addEventListener(
    "click",
    openManager
);


closeManager.addEventListener(
    "click",
    closeManagerPanel
);


managerOverlay.addEventListener(
    "click",
    closeManagerPanel
);


/* =========================================================
   EDIT SONGS
========================================================= */

function renderEditSongs() {

    editSongList.innerHTML =
        "";


    songs.forEach(
        (song, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "song-item";


            wrapper.style.display =
                "block";


            wrapper.style.cursor =
                "default";


            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "song-item-title";


            heading.textContent =
                `${index + 1}. ${song.title}`;


            wrapper.appendChild(
                heading
            );


            /*
             * TITLE
             */

            const titleInput =
                document.createElement(
                    "input"
                );


            titleInput.type =
                "text";


            titleInput.value =
                song.title;


            titleInput.placeholder =
                "Título";


            styleEditInput(
                titleInput
            );


            /*
             * ARTIST
             */

            const artistInput =
                document.createElement(
                    "input"
                );


            artistInput.type =
                "text";


            artistInput.value =
                song.artist;


            artistInput.placeholder =
                "Artista";


            styleEditInput(
                artistInput
            );


            /*
             * ALBUM
             */

            const albumInput =
                document.createElement(
                    "input"
                );


            albumInput.type =
                "text";


            albumInput.value =
                song.album;


            albumInput.placeholder =
                "Álbum";


            styleEditInput(
                albumInput
            );


            /*
             * SAVE BUTTON
             */

            const saveButton =
                document.createElement(
                    "button"
                );


            saveButton.type =
                "button";


            saveButton.className =
                "song-item";


            saveButton.style.marginTop =
                "8px";


            saveButton.style.justifyContent =
                "center";


            saveButton.innerHTML =
                `<div class="song-item-title">
                    Guardar cambios
                </div>`;


            saveButton.addEventListener(
                "click",
                async () => {

                    const updatedTitle =
                        titleInput.value.trim();

                    const updatedArtist =
                        artistInput.value.trim();

                    const updatedAlbum =
                        albumInput.value.trim();


                    if (
                        !updatedTitle ||
                        !updatedArtist ||
                        !updatedAlbum
                    ) {

                        alert(
                            "Título, artista y álbum son obligatorios."
                        );

                        return;

                    }


                    song.title =
                        updatedTitle;


                    song.artist =
                        updatedArtist;


                    song.album =
                        updatedAlbum;


                    const savedToDisk =
                        await persistCatalog();


                    /*
                     * Si estamos editando
                     * la canción actual,
                     * actualizamos inmediatamente
                     * el reproductor.
                     */

                    if (
                        index ===
                        currentIndex
                    ) {

                        songTitle.textContent =
                            song.title;

                        songArtist.textContent =
                            song.artist;

                    }


                    renderPlaylist(
                        search.value
                    );


                    renderEditSongs();


                    alert(
                        savedToDisk
                            ? "✓ Canción actualizada. catalog.json se guardó — el cambio se verá en cualquier navegador."
                            : "Canción actualizada en este navegador, pero no se pudo escribir catalog.json. " +
                              "Usa \"Descargar catalog.json\" para guardar el cambio manualmente."
                    );

                }
            );


            wrapper.appendChild(
                titleInput
            );


            wrapper.appendChild(
                artistInput
            );


            wrapper.appendChild(
                albumInput
            );


            wrapper.appendChild(
                saveButton
            );


            /*
             * DELETE BUTTON
             */

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "song-item";


            deleteButton.style.marginTop =
                "8px";


            deleteButton.style.justifyContent =
                "center";


            deleteButton.style.borderColor =
                "rgba(255,90,90,.35)";


            deleteButton.innerHTML =
                `<div class="song-item-title" style="color:#ff8a80;">
                    Eliminar del catálogo
                </div>`;


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteSong(
                        song
                    );

                }
            );


            wrapper.appendChild(
                deleteButton
            );


            editSongList.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   DELETE SONG

   IMPORTANTE: esto SOLO saca la canción del
   catálogo (catalog.json). NO borra el archivo
   mp3 ni el cover de music/covers — sobre todo
   porque un mismo cover puede estar compartido
   por varias canciones del mismo álbum, y borrar
   el archivo podría romper las demás.

   Si de verdad quieres borrar el archivo físico
   también, hazlo manualmente desde tu carpeta
   music/ o covers/.
========================================================= */

async function deleteSong(
    song
) {

    const index =
        songs.indexOf(
            song
        );


    if (
        index === -1
    ) {

        return;

    }


    const confirmed =
        confirm(
            `¿Eliminar "${song.title}" del catálogo?\n\n` +
            `Esto NO borra el archivo mp3 ni el cover ` +
            `de tus carpetas — solo lo saca de la lista.`
        );


    if (!confirmed) {

        return;

    }


    const isCurrentSong =
        index === currentIndex;


    songs.splice(
        index,
        1
    );


    if (
        index < currentIndex
    ) {

        currentIndex -= 1;

    }

    else if (
        isCurrentSong
    ) {

        stopRotation();


        audio.pause();


        audio.removeAttribute(
            "src"
        );


        if (
            songs.length === 0
        ) {

            currentIndex =
                0;


            songTitle.textContent =
                "Sin canciones";


            songArtist.textContent =
                "Agrega música desde el Manager";


            if (songAlbum) {

                songAlbum.textContent =
                    "";


                songAlbum.classList.remove(
                    "visible"
                );

            }


            cover.src =
                FALLBACK_COVER_DATA_URI;

        }

        else {

            const newIndex =
                Math.min(
                    index,
                    songs.length - 1
                );


            loadSong(
                newIndex,
                false
            );

        }

    }


    const savedToDisk =
        await persistCatalog();


    renderPlaylist(
        search.value
    );


    renderEditSongs();


    alert(
        savedToDisk
            ? "✓ Canción eliminada. catalog.json actualizado — el cambio se verá en cualquier navegador."
            : "Eliminada en este navegador, pero no se pudo escribir catalog.json. " +
              "Usa \"Descargar catalog.json\" para guardar el cambio manualmente."
    );

}


function styleEditInput(
    input
) {

    input.style.width =
        "100%";


    input.style.marginTop =
        "8px";


    input.style.padding =
        "10px";


    input.style.borderRadius =
        "10px";


    input.style.border =
        "1px solid rgba(255,255,255,.08)";


    input.style.background =
        "rgba(255,255,255,.05)";


    input.style.color =
        "white";


    input.style.outline =
        "none";

}


/* =========================================================
   DYNAMIC COLORS
========================================================= */

function extractCoverColors(
    imageURL
) {

    const image =
        new Image();


    /*
     * Solo activamos crossOrigin cuando el cover
     * realmente viene de OTRO origen (ej. jsDelivr
     * detrás de un <base href> distinto al del sitio
     * que aloja el reproductor, como en el launcher
     * de Google Sites).
     *
     * Si lo dejáramos fijo siempre, rompía la carga
     * de la imagen al probar local (file://) o en
     * GitHub Pages, donde el cover SÍ es del mismo
     * origen y no hace falta — y ahí sí puede fallar
     * el modo CORS sin necesidad.
     */

    try {

        const resolvedURL =
            new URL(
                imageURL,
                document.baseURI
            );


        if (
            resolvedURL.origin !==
            window.location.origin
        ) {

            image.crossOrigin =
                "anonymous";

        }

    }

    catch (error) {

        /*
         * Si no se pudo resolver la URL por algún
         * motivo, dejamos crossOrigin sin definir —
         * es el comportamiento seguro de siempre.
         */

    }


    image.onload =
        () => {

            try {

                const canvas =
                    document.createElement(
                        "canvas"
                    );


                const context =
                    canvas.getContext(
                        "2d",
                        {
                            willReadFrequently:
                                true
                        }
                    );


                canvas.width =
                    60;


                canvas.height =
                    60;


                context.drawImage(
                    image,
                    0,
                    0,
                    60,
                    60
                );


                const data =
                    context.getImageData(
                        0,
                        0,
                        60,
                        60
                    ).data;


                /*
                 * BUCKETS DE COLOR.
                 *
                 * Agrupamos cada píxel muestreado en
                 * una celda de 32 pasos por canal, y
                 * promediamos cada celda. Esto agrupa
                 * colores parecidos automáticamente sin
                 * necesitar una librería externa.
                 */

                const buckets =
                    new Map();


                for (
                    let i = 0;
                    i < data.length;
                    i += 16
                ) {

                    const r =
                        data[i];

                    const g =
                        data[i + 1];

                    const b =
                        data[i + 2];


                    const brightness =
                        (r + g + b) / 3;


                    /*
                     * Filtramos negros y blancos
                     * absolutos, pero SIN eliminar
                     * blancos/claros por completo —
                     * pueden ser parte importante
                     * de la paleta del cover.
                     */

                    if (
                        brightness <= 8 ||
                        brightness >= 250
                    ) {

                        continue;

                    }


                    const key =
                        (r >> 5) + "," +
                        (g >> 5) + "," +
                        (b >> 5);


                    const bucket =
                        buckets.get(key);


                    if (bucket) {

                        bucket.r += r;
                        bucket.g += g;
                        bucket.b += b;
                        bucket.count += 1;

                    }

                    else {

                        buckets.set(
                            key,
                            {
                                r,
                                g,
                                b,
                                count: 1
                            }
                        );

                    }

                }


                const candidates =
                    Array.from(
                        buckets.values()
                    )
                    .map(
                        bucket => ({
                            r: Math.round(bucket.r / bucket.count),
                            g: Math.round(bucket.g / bucket.count),
                            b: Math.round(bucket.b / bucket.count),
                            count: bucket.count
                        })
                    )
                    .sort(
                        (a, b) =>
                            b.count - a.count
                    );


                if (
                    candidates.length === 0
                ) {

                    coverPalette =
                        FALLBACK_PALETTE;


                    applyColors(
                        coverPalette[0]
                    );


                    return;

                }


                /*
                 * Elegimos hasta 6 colores,
                 * evitando quedarnos con
                 * variaciones casi idénticas
                 * del mismo tono.
                 */

                const palette = [];


                const MIN_DISTANCE =
                    46;


                candidates.forEach(
                    candidate => {

                        if (
                            palette.length >= 6
                        ) {

                            return;

                        }


                        const tooClose =
                            palette.some(
                                picked =>
                                    colorDistance(
                                        picked,
                                        candidate
                                    ) < MIN_DISTANCE
                            );


                        if (!tooClose) {

                            palette.push(
                                boostColor(
                                    candidate
                                )
                            );

                        }

                    }
                );


                if (
                    palette.length < 3
                ) {

                    candidates
                        .slice(
                            0,
                            4
                        )
                        .forEach(
                            candidate => {

                                const boosted =
                                    boostColor(
                                        candidate
                                    );


                                if (
                                    !palette.some(
                                        picked =>
                                            colorDistance(
                                                picked,
                                                boosted
                                            ) < 8
                                    )
                                ) {

                                    palette.push(
                                        boosted
                                    );

                                }

                            }
                        );

                }


                coverPalette =
                    palette.length > 0
                        ? palette
                        : FALLBACK_PALETTE;


                applyColors(
                    coverPalette[0]
                );

            }

            catch (error) {

                coverPalette =
                    FALLBACK_PALETTE;


                applyColors(
                    coverPalette[0]
                );

            }

        };


    image.onerror =
        () => {

            coverPalette =
                FALLBACK_PALETTE;


            applyColors(
                coverPalette[0]
            );

        };


    image.src =
        imageURL;

}


/* =========================================================
   COLOR HELPERS
========================================================= */

function rgbToHsl(
    r,
    g,
    b
) {

    r /= 255;
    g /= 255;
    b /= 255;


    const max =
        Math.max(r, g, b);

    const min =
        Math.min(r, g, b);


    let h = 0;
    let s = 0;

    const l =
        (max + min) / 2;


    const delta =
        max - min;


    if (delta !== 0) {

        s =
            l > .5
                ? delta / (2 - max - min)
                : delta / (max + min);


        switch (max) {

            case r:
                h =
                    (g - b) / delta +
                    (g < b ? 6 : 0);
                break;

            case g:
                h =
                    (b - r) / delta + 2;
                break;

            default:
                h =
                    (r - g) / delta + 4;

        }


        h /= 6;

    }


    return {
        h,
        s,
        l
    };

}


function hslToRgb(
    h,
    s,
    l
) {

    if (s === 0) {

        const v =
            Math.round(l * 255);


        return {
            r: v,
            g: v,
            b: v
        };

    }


    const hue2rgb =
        (p, q, t) => {

            if (t < 0) t += 1;
            if (t > 1) t -= 1;

            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

            return p;

        };


    const q =
        l < .5
            ? l * (1 + s)
            : l + s - l * s;

    const p =
        2 * l - q;


    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    };

}


/*
 * boostColor() ya NO solo multiplica el brillo —
 * fuerza cada color de la paleta a un mínimo de
 * saturación y a un rango de luminosidad legible,
 * para que el "respirar" de colores se sienta
 * como iluminación ambiental viva, no como un
 * tono apagado casi idéntico al anterior.
 */

function boostColor(
    color
) {

    const hsl =
        rgbToHsl(
            color.r,
            color.g,
            color.b
        );


    const boostedSaturation =
        Math.min(
            1,
            Math.max(
                hsl.s * 1.6,
                .62
            )
        );


    const clampedLightness =
        Math.min(
            .66,
            Math.max(
                .38,
                hsl.l
            )
        );


    return hslToRgb(
        hsl.h,
        boostedSaturation,
        clampedLightness
    );

}


function colorDistance(
    a,
    b
) {

    return Math.sqrt(
        (a.r - b.r) ** 2 +
        (a.g - b.g) ** 2 +
        (a.b - b.b) ** 2
    );

}


function lerpColor(
    a,
    b,
    t
) {

    return {
        r: Math.round(a.r + (b.r - a.r) * t),
        g: Math.round(a.g + (b.g - a.g) * t),
        b: Math.round(a.b + (b.b - a.b) * t)
    };

}


/*
 * Color ambiental interpolado según el progreso
 * de rotación del disco (0 - 360°).
 *
 * Una vuelta completa del disco = un recorrido
 * completo por toda la paleta. Como el disco
 * tarda 20s en dar una vuelta, esto da una
 * transición lenta y continua — y como esto se
 * calcula únicamente dentro del loop de rotación,
 * se congela automáticamente en cuanto se pausa.
 */

function getAmbientColorForRotation(
    degrees
) {

    const palette =
        coverPalette.length > 0
            ? coverPalette
            : FALLBACK_PALETTE;


    const progress =
        (degrees % 360) / 360;


    const segment =
        progress * palette.length;


    const index0 =
        Math.floor(segment) %
        palette.length;


    const index1 =
        (index0 + 1) %
        palette.length;


    const localT =
        segment - Math.floor(segment);


    return lerpColor(
        palette[index0],
        palette[index1],
        localT
    );

}


function applyColors(
    color
) {

    const { r, g, b } = color;


    document.documentElement.style.setProperty(
        "--r",
        r
    );


    document.documentElement.style.setProperty(
        "--g",
        g
    );


    document.documentElement.style.setProperty(
        "--b",
        b
    );


    /*
     * --accent-tint se calcula acá mismo (mezclado
     * con blanco) en vez de usar color-mix() en CSS.
     * Así garantizamos que se vea igual y se actualice
     * igual en cualquier navegador, sin depender de
     * soporte de color-mix().
     */

    const tintR =
        Math.round(r + (255 - r) * .32);

    const tintG =
        Math.round(g + (255 - g) * .32);

    const tintB =
        Math.round(b + (255 - b) * .32);


    document.documentElement.style.setProperty(
        "--accent-tint",
        `rgb(${tintR}, ${tintG}, ${tintB})`
    );


    ambient.style.background =
        `radial-gradient(
            circle at 50% 25%,
            rgba(${r}, ${g}, ${b}, .82),
            transparent 70%
        )`;


    /*
     * Refrescamos la barra de progreso con el color
     * literal en cada cuadro (no solo cuando cambia
     * el tiempo de reproducción), para que siga el
     * mismo ritmo que el fondo, sin depender de que
     * el navegador vuelva a calcular var(--accent)
     * dentro de un gradiente puesto por JS.
     */

    if (
        typeof progress !== "undefined" &&
        progress
    ) {

        const value =
            Number(
                progress.value
            ) || 0;


        progress.style.background =
            `linear-gradient(
                to right,
                rgb(${r}, ${g}, ${b}) 0%,
                rgb(${r}, ${g}, ${b}) ${value}%,
                var(--track) ${value}%,
                var(--track) 100%
            )`;

    }

}


/* =========================================================
   VISUALIZER
========================================================= */

function setupVisualizer() {

    if (
        !visualizer
    ) {

        return;

    }


    const context =
        visualizer.getContext(
            "2d"
        );


    function resize() {

        const ratio =
            window.devicePixelRatio ||
            1;


        const width =
            visualizer.clientWidth;


        const height =
            visualizer.clientHeight;


        visualizer.width =
            width * ratio;


        visualizer.height =
            height * ratio;


        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );

    }


    resize();


    window.addEventListener(
        "resize",
        resize
    );


    visualizerBars =
        new Array(52)
            .fill(0)
            .map(
                () => ({
                    value: 0,
                    velocity: 0
                })
            );


    function render() {

        visualizerFrame =
            requestAnimationFrame(
                render
            );


        const width =
            visualizer.clientWidth;


        const height =
            visualizer.clientHeight;


        context.clearRect(
            0,
            0,
            width,
            height
        );


        const styles =
            getComputedStyle(
                document.documentElement
            );


        const r =
            styles.getPropertyValue(
                "--r"
            ).trim() || 120;


        const g =
            styles.getPropertyValue(
                "--g"
            ).trim() || 120;


        const b =
            styles.getPropertyValue(
                "--b"
            ).trim() || 120;


        const playing =
            !audio.paused &&
            !audio.ended;


        const bars =
            visualizerBars.length;


        const gap =
            4;


        const barWidth =
            (
                width -
                gap *
                (bars - 1)
            ) /
            bars;


        for (
            let i = 0;
            i < bars;
            i++
        ) {

            const bar =
                visualizerBars[i];


            const time =
                performance.now() *
                0.002;


            const position =
                i / bars;


            const wave1 =
                Math.sin(
                    time * 2.4 +
                    i * .42
                );


            const wave2 =
                Math.sin(
                    time * 1.4 -
                    i * .18
                );


            const center =
                1 -
                Math.abs(
                    position -
                    .5
                ) *
                1.55;


            const target =
                playing
                    ? (
                        .16 +
                        (
                            (
                                wave1 +
                                wave2 +
                                2
                            ) / 4
                        ) *
                        .75 *
                        Math.max(
                            .25,
                            center
                        )
                    )
                    : .025;


            bar.value +=
                (
                    target -
                    bar.value
                ) *
                .12;


            const barHeight =
                Math.max(
                    2,
                    bar.value *
                    height *
                    .82
                );


            const x =
                i *
                (
                    barWidth +
                    gap
                );


            const y =
                height -
                barHeight;


            const opacity =
                playing
                    ? .12 +
                      bar.value * .65
                    : .025;


            context.fillStyle =
                `rgba(
                    ${r},
                    ${g},
                    ${b},
                    ${opacity}
                )`;


            context.beginPath();


            if (
                context.roundRect
            ) {

                context.roundRect(
                    x,
                    y,
                    barWidth,
                    barHeight,
                    5
                );

            }

            else {

                context.rect(
                    x,
                    y,
                    barWidth,
                    barHeight
                );

            }


            context.fill();

        }

    }


    render();

}


function startVisualizer() {

    if (
        !visualizerFrame
    ) {

        setupVisualizer();

    }

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName ===
                "INPUT" ||
            event.target.tagName ===
                "TEXTAREA" ||
            event.target.tagName ===
                "BUTTON" ||
            event.target.tagName ===
                "SUMMARY" ||
            event.target.isContentEditable
        ) {

            /*
             * Si el foco está en un botón, un
             * <summary> (dropdown de artista/álbum),
             * o un campo de texto, dejamos que la
             * tecla haga su comportamiento nativo
             * normal (activar ese elemento) en vez
             * de interceptarla para el reproductor.
             *
             * Si no, Tab + Espacio en cualquier botón
             * terminaría pausando la canción en vez
             * de activar ese botón.
             */

            return;

        }


        switch (
            event.code
        ) {

            case "Space":

                event.preventDefault();

                togglePlay();

                break;


            case "ArrowRight":

                nextSong(true);

                break;


            case "ArrowLeft":

                previousSong();

                break;


            case "ArrowUp":

                event.preventDefault();


                setVolumeValue(
                    Number(
                        volume.value
                    ) + 5
                );

                break;


            case "ArrowDown":

                event.preventDefault();


                setVolumeValue(
                    Number(
                        volume.value
                    ) - 5
                );


                break;

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

async function initPlayer() {

    let savedVolume =
        100;


    try {

        const stored =
            localStorage.getItem(
                VOLUME_STORAGE_KEY
            );


        if (stored !== null) {

            savedVolume =
                Number(
                    stored
                );

        }

    }

    catch (error) {}


    setVolumeValue(
        savedVolume
    );


    audio.muted =
        false;


    audio.autoplay =
        false;


    setupMediaSessionActionHandlers();


    /*
     * SERVICE WORKER (PWA)
     *
     * Se registra solo si el navegador lo soporta Y
     * estamos en un contexto seguro real (https o
     * localhost) — en file:// o dentro del launcher
     * de Google Sites (about:blank) esto no aplica,
     * y no debe romper nada si falla.
     */

    if (
        "serviceWorker" in navigator &&
        window.isSecureContext
    ) {

        navigator.serviceWorker
            .register("sw.js")
            .catch(
                error => {

                    console.warn(
                        "No se pudo registrar el service worker:",
                        error
                    );

                }
            );

    }


    /*
     * Cargar el catálogo compartido (catalog.json)
     * ANTES de pintar la playlist, para que todos
     * los navegadores arranquen viendo las mismas
     * canciones.
     */

    songs =
        await loadCatalogFromDisk();


    renderPlaylist();


    loadSong(
        0,
        false
    );


    await restoreProjectFolder();


    console.log(
        "Lim's Music Player iniciado."
    );


    console.log(
        "Canciones:",
        songs.length
    );


    console.log(
        "Catálogo:",
        songs
    );

}


initPlayer();