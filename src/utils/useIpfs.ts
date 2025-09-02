import type { ZineProject, ZineManifest } from '@/types';
import { exportProjectById } from '@/utils/portableBackup';

type PinProvider = { provider: 'web3' | 'pinata'; token: string };

export interface PublishOptions {
  project: ZineProject;
  description?: string;
  tags?: string; // comma-separated from UI
  author?: {
    name?: string;
    url?: string;
    contact?: string;
    pgp?: { fingerprint?: string; publicKeyArmored?: string };
  };
  sign?: { privateKeyArmored: string; passphrase?: string };
  pin?: PinProvider;
  includeBackup?: boolean;
}

export async function publishToIpfs(opts: PublishOptions): Promise<{ manifestCid: string; projectCid?: string; backupCid?: string }> {
  const { project } = opts;
  // Serialize project to canonical JSON (basic stable stringify; for JCS use RFC 8785 impl later)
  const projectJson = JSON.stringify(project, (_k, v) => v instanceof Date ? v.toISOString() : v);

  const files: { path: string; content: Blob }[] = [];
  files.push({ path: 'project.json', content: new Blob([projectJson], { type: 'application/json' }) });

  let backupCid: string | undefined;
  if (opts.includeBackup) {
    try {
      const backup = await exportProjectById(project.id);
      const backupJson = JSON.stringify(backup);
      files.push({ path: 'backup.json', content: new Blob([backupJson], { type: 'application/json' }) });
    } catch {}
  }

  // Pin files and capture CIDs
  const { uploadDirectory } = await import('./useIpfsPin');
  const uploaded = await uploadDirectory(files, opts.pin);
  const projectCid = uploaded['project.json'];
  backupCid = uploaded['backup.json'];

  // Build manifest
  const manifest: ZineManifest = {
    schema: 'v1',
    title: project.name,
    description: opts.description || project.metadata.description || undefined,
    tags: (opts.tags || '').split(',').map(s => s.trim()).filter(Boolean),
    language: 'en',
    createdAt: new Date().toISOString(),
    project: { cid: projectCid },
    backup: backupCid ? { cid: backupCid, optional: true } : undefined,
    author: opts.author ? {
      name: opts.author.name,
      url: opts.author.url,
      contact: opts.author.contact,
      pgp: opts.author.pgp?.fingerprint || opts.author.pgp?.publicKeyArmored ? {
        fingerprint: opts.author.pgp?.fingerprint,
        // public key will be separately uploaded below if present
        publicKeyArmoredCid: undefined
      } : undefined
    } : undefined,
    pinnedVia: opts.pin ? [opts.pin.provider] : undefined,
    app: { name: 'Zine Maker', version: '0.0.0' }
  };

  // Optionally upload public key and set CID
  if (opts.author?.pgp?.publicKeyArmored) {
    const { uploadBytes } = await import('./useIpfsPin');
    const pubCid = await uploadBytes(new Blob([opts.author.pgp.publicKeyArmored], { type: 'text/plain' }), 'pubkey.asc', opts.pin);
    if (manifest.author && manifest.author.pgp) {
      manifest.author.pgp.publicKeyArmoredCid = pubCid;
    }
  }

  // Optionally sign manifest (detached)
  if (opts.sign?.privateKeyArmored) {
    try {
      const { signManifest } = await import('./useOpenPgp');
      const { armored } = await signManifest(manifest, opts.sign.privateKeyArmored, opts.sign.passphrase);
      manifest.signature = {
        algo: 'openpgp',
        createdAt: new Date().toISOString(),
        canonicalization: 'JCS',
        armored
      };
    } catch {}
  }

  const manifestJson = JSON.stringify(manifest);
  const { uploadBytes } = await import('./useIpfsPin');
  const manifestCid = await uploadBytes(new Blob([manifestJson], { type: 'application/json' }), 'manifest.json', opts.pin);

  return { manifestCid, projectCid, backupCid };
}

export async function fetchManifest(cid: string): Promise<ZineManifest> {
  const mod = await import('./ipfsGateway');
  return mod.fetchIpfsJson<ZineManifest>(cid);
}

export async function verifyManifestSignature(manifest: ZineManifest): Promise<{ verified: boolean; reason?: string }> {
  try {
    if (!manifest.signature?.armored) return { verified: false, reason: 'No signature' };
    const openpgp = await import('openpgp');
    const message = await openpgp.createMessage({ text: JSON.stringify({ ...manifest, signature: undefined }) });
    const signature = await openpgp.readSignature({ armoredSignature: manifest.signature.armored });
    // Attempt to fetch embedded public key if available
    let publicKeys: any[] = [];
    if (manifest.author?.pgp?.publicKeyArmoredCid) {
      try {
        const gmod = await import('./ipfsGateway');
        const res = await fetch(gmod.gatewayUrl(manifest.author.pgp.publicKeyArmoredCid));
        const armored = await res.text();
        const pub = await openpgp.readKey({ armoredKey: armored });
        publicKeys = [pub];
      } catch {}
    }
    if (!publicKeys.length) return { verified: false, reason: 'Missing public key' };
    const verification = await openpgp.verify({ message, signature, verificationKeys: publicKeys });
    const sigs = await verification.signatures[0].verified;
    await sigs; // throws if bad
    return { verified: true };
  } catch (e: any) {
    return { verified: false, reason: e?.message || 'Verification failed' };
  }
}


