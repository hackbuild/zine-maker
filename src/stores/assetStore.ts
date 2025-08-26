import { defineStore } from 'pinia';
import { ref } from 'vue';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'ZineMakerDB';
const STORE_NAME = 'assets';

export const useAssetStore = defineStore('assets', () => {
  const db = ref<IDBPDatabase | null>(null);

  async function initDB() {
    if (db.value) return;

    db.value = await openDB(DB_NAME, 2, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          }
        }
        if (oldVersion < 2) {
          if (!database.objectStoreNames.contains('projects')) {
            database.createObjectStore('projects', { keyPath: 'id' });
          }
        }
      },
    });
  }

  async function addAsset(file: File): Promise<number | undefined> {
    if (!db.value) await initDB();
    if (!db.value) return;

    const tx = db.value.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const id = await store.add({ file });
    await tx.done;
    return id as number;
  }

  async function getAsset(id: number): Promise<File | undefined> {
    if (!db.value) await initDB();
    if (!db.value) return;

    const tx = db.value.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const asset = await store.get(id);
    await tx.done;
    return asset?.file;
  }

  return {
    initDB,
    addAsset,
    getAsset,
  };
});
