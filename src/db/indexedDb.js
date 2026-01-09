import { openDB } from 'idb';

const DB_NAME = 'video-recorder-db';
const STORE_NAME = 'videos';

export async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('createdAt', 'createdAt');
            }
        },
    });
}

export async function saveVideo(blob) {
    const db = await initDB();
    const videoData = {
        id: crypto.randomUUID(),
        blob,
        createdAt: new Date().toISOString(),
        status: 'pending', // pending, uploaded, failed
    };
    await db.put(STORE_NAME, videoData);
    return videoData;
}

export async function getAllVideos() {
    const db = await initDB();
    const videos = await db.getAllFromIndex(STORE_NAME, 'createdAt');
    return videos.reverse(); // Newest first
}

export async function updateVideoStatus(id, status) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const video = await store.get(id);

    if (video) {
        video.status = status;
        await store.put(video);
    }
    await tx.done;
    return video;
}

export async function getVideo(id) {
    const db = await initDB();
    return db.get(STORE_NAME, id);
}
