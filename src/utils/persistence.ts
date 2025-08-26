import { openDB, type IDBPDatabase } from 'idb';
import type { ZineProject } from '@/types';

const DB_NAME = 'ZineMakerDB';
const PROJECTS_STORE_NAME = 'projects';
const LAST_PROJECT_ID_KEY = 'lastOpenProjectId';

let db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (db) return db;

  db = await openDB(DB_NAME, 2, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        if (!database.objectStoreNames.contains('assets')) {
          database.createObjectStore('assets', { keyPath: 'id', autoIncrement: true });
        }
      }
      if (oldVersion < 2) {
        if (!database.objectStoreNames.contains(PROJECTS_STORE_NAME)) {
          database.createObjectStore(PROJECTS_STORE_NAME, { keyPath: 'id' });
        }
      }
    },
  });
  return db;
}

export async function saveProject(project: ZineProject): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(PROJECTS_STORE_NAME, 'readwrite');

  // Serialize to plain JSON to avoid DataCloneError from proxies or complex instances
  const plain = JSON.parse(JSON.stringify(project, (key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  }));

  await tx.store.put(plain);
  await tx.done;
  await saveLastOpenProjectId(project.id);
}

export async function loadProject(id: string): Promise<ZineProject | undefined> {
  const db = await getDb();
  const raw: any = await db.get(PROJECTS_STORE_NAME, id);
  if (!raw) return undefined;

  // Revive dates
  raw.createdAt = new Date(raw.createdAt);
  raw.modifiedAt = new Date(raw.modifiedAt);
  return raw as ZineProject;
}

export async function getAllProjects(): Promise<ZineProject[]> {
  const db = await getDb();
  return db.getAll(PROJECTS_STORE_NAME);
}

export async function saveLastOpenProjectId(id: string): Promise<void> {
  localStorage.setItem(LAST_PROJECT_ID_KEY, id);
}

export function getLastOpenProjectId(): string | null {
  return localStorage.getItem(LAST_PROJECT_ID_KEY);
}
