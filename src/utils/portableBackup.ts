import { openDB } from 'idb';

const DB_NAME = 'ZineMakerDB';
const ASSETS = 'assets';
const PROJECTS = 'projects';

export async function exportAll(): Promise<any> {
  const db = await openDB(DB_NAME, 2);
  const projects = await db.getAll(PROJECTS);
  const assets = await db.getAll(ASSETS);
  // Convert File objects in assets to base64 for portability
  const serializedAssets = await Promise.all(
    assets.map(async (a: any) => {
      const file: File | undefined = a?.file;
      if (!file) return a;
      const b64 = await fileToBase64(file);
      return { ...a, file: { name: file.name, type: file.type, dataUrl: b64 } };
    })
  );
  return { projects, assets: serializedAssets };
}

export async function importAll(payload: any): Promise<void> {
  const db = await openDB(DB_NAME, 2);
  const txP = db.transaction(PROJECTS, 'readwrite');
  const txA = db.transaction(ASSETS, 'readwrite');
  // Clear existing stores? We will append to avoid destructive overwrite
  const projects = Array.isArray(payload?.projects) ? payload.projects : [];
  const assets = Array.isArray(payload?.assets) ? payload.assets : [];
  for (const p of projects) {
    await (txP.store as any).put(p);
  }
  for (const a of assets) {
    const f = a?.file;
    if (f && f.dataUrl) {
      const file = dataUrlToFile(f.dataUrl, f.name || 'asset');
      await (txA.store as any).put({ id: a.id, file });
    } else {
      await (txA.store as any).put(a);
    }
  }
  await txP.done; await txA.done;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}


