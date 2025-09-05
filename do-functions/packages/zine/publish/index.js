'use strict';
// Ensure Blob exists in Node runtime (DO Functions) by polyfilling from buffer
try { if (typeof Blob === 'undefined') { global.Blob = require('buffer').Blob; } } catch {}
// Ensure fetch exists in Node runtime (prefer undici)
try {
  if (typeof fetch === 'undefined') {
    const { fetch: undiciFetch } = require('undici');
    if (undiciFetch) global.fetch = undiciFetch;
  }
} catch {}

// DigitalOcean Functions (OpenWhisk) action entry
// Web-exported; expects JSON body. Publishes a project/manifest to IPFS via Pinata.

const TEXT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'content-type,authorization'
};

function pinataAuthHeaders(token, key, secret) {
  return token
    ? { Authorization: `Bearer ${token}` }
    : (key && secret ? { 'pinata_api_key': key, 'pinata_secret_api_key': secret } : {});
}

async function pinJsonToIpfs(content, token, key, secret, metadataName) {
  const headers = { ...pinataAuthHeaders(token, key, secret), 'Content-Type': 'application/json' };
  const body = { pinataContent: content };
  if (metadataName) {
    body.pinataMetadata = { name: metadataName };
  }
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Pinata JSON upload failed (${res.status}): ${t}`);
  }
  const data = await res.json();
  const cid = data.IpfsHash || data.cid;
  if (!cid) throw new Error('Missing CID in Pinata response');
  return cid;
}

function toPath(cidOrName) {
  const v = (cidOrName || '').trim();
  if (!v) return 'ipfs/';
  if (v.startsWith('ipns/')) return v;
  if (v.startsWith('ipfs/')) return v;
  if (v.startsWith('ipns:')) return `ipns/${v.slice(5)}`;
  if (v.startsWith('ipfs:')) return `ipfs/${v.slice(5)}`;
  if (v.startsWith('k51')) return `ipns/${v}`;
  return `ipfs/${v}`;
}

// --- Internal IPFS (Droplet) helpers ---
function dropletConfig(params) {
  const host = process.env.IPFS_DROPLET_HOST || params.IPFS_DROPLET_HOST;
  const pass = process.env.IPFS_DROPLET_ADMIN_PASS || params.IPFS_DROPLET_ADMIN_PASS;
  const user = process.env.IPFS_DROPLET_ADMIN_USER || params.IPFS_DROPLET_ADMIN_USER || 'ipfsadmin';
  const ipnsKey = process.env.IPFS_IPNS_KEY || params.IPFS_IPNS_KEY || 'manifest-key';
  const mfsPath = process.env.IPFS_MFS_MANIFEST_PATH || params.IPFS_MFS_MANIFEST_PATH || '/manifests/latest.json';
  if (!host || !pass) return null;
  const API = `http://${host}:5002/api/v0`;
  const GW = `http://${host}:8080`;
  const auth = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
  return { API, GW, auth, ipnsKey, mfsPath };
}

async function dropletAddJson(dc, name, obj) {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  const fd = new FormData();
  fd.set('file', blob, name);
  const res = await fetch(`${dc.API}/add?pin=true&cid-version=1`, { method: 'POST', headers: { Authorization: dc.auth }, body: fd });
  if (!res.ok) throw new Error(`Droplet add failed ${res.status}`);
  const j = await res.json();
  return j.Hash;
}

async function dropletFilesRead(dc, path) {
  const res = await fetch(`${dc.API}/files/read?arg=${encodeURIComponent(path)}`, { method: 'POST', headers: { Authorization: dc.auth } });
  if (!res.ok) return null;
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return null; }
}

async function dropletFilesWrite(dc, path, bytes) {
  const fd = new FormData();
  fd.set('data', new Blob([bytes], { type: 'application/json' }), 'data.json');
  const res = await fetch(`${dc.API}/files/write?arg=${encodeURIComponent(path)}&create=true&truncate=true`, { method: 'POST', headers: { Authorization: dc.auth }, body: fd });
  if (!res.ok) throw new Error(`Droplet write failed ${res.status}`);
}

async function dropletFilesStat(dc, path) {
  const res = await fetch(`${dc.API}/files/stat?arg=${encodeURIComponent(path)}`, { method: 'POST', headers: { Authorization: dc.auth } });
  if (!res.ok) throw new Error(`Droplet stat failed ${res.status}`);
  const j = await res.json();
  return j.Hash;
}

async function dropletPublishIpns(dc, cid) {
  const res = await fetch(`${dc.API}/name/publish?key=${encodeURIComponent(dc.ipnsKey)}&allow-offline=true&arg=${cid}`, { method: 'POST', headers: { Authorization: dc.auth } });
  if (!res.ok) throw new Error(`Droplet IPNS publish failed ${res.status}`);
  return res.json();
}

exports.main = async function (params) {
  // CORS preflight
  if ((params.__ow_method || '').toUpperCase() === 'OPTIONS') {
    return { statusCode: 204, headers: TEXT_HEADERS, body: '' };
  }

  try {
    const dc = dropletConfig(params);
    const token = process.env.PINATA_JWT || params.PINATA_JWT;
    const apiKey = process.env.PINATA_API_KEY || params.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET || params.PINATA_API_SECRET;
    if (!dc && !token && !(apiKey && apiSecret)) {
      return { statusCode: 400, headers: TEXT_HEADERS, body: { error: 'Missing IPFS credentials' } };
    }

    // Accept either direct body from web action or params.payload
    const payload = typeof params.__ow_body === 'string'
      ? JSON.parse(Buffer.from(params.__ow_body, 'base64').toString('utf8'))
      : (params.payload || params);

    const project = payload.project;
    if (!project || !project.name) {
      return { statusCode: 400, headers: TEXT_HEADERS, body: { error: 'Missing project' } };
    }

    // Serialize project
    const projectJson = JSON.stringify(project, (_k, v) => (v && v.toISOString ? v.toISOString() : v));

    // Upload project as JSON (prefer droplet)
    const projectCid = dc
      ? await dropletAddJson(dc, 'project.json', JSON.parse(projectJson))
      : await pinJsonToIpfs(JSON.parse(projectJson), token, apiKey, apiSecret);

    let backupCid;
    if (payload.backup) {
      backupCid = dc
        ? await dropletAddJson(dc, 'backup.json', payload.backup)
        : await pinJsonToIpfs(payload.backup, token, apiKey, apiSecret);
    }

    // Build manifest aligned with src/types ZineManifest
    const manifest = {
      schema: 'v1',
      title: project.name,
      description: payload.description || project?.metadata?.description,
      tags: (payload.tags || []).map(s => String(s)).filter(Boolean),
      language: 'en',
      createdAt: new Date().toISOString(),
      project: { cid: projectCid },
      backup: backupCid ? { cid: backupCid, optional: true } : undefined,
      author: payload.author || undefined,
      pinnedVia: [dc ? 'droplet' : 'pinata'],
      app: { name: 'Zine Maker', version: '0.0.0' }
    };

    // Note: Skipping upload of embedded public key to avoid FormData; optional feature can be re-added with a multipart client if needed

    // Optionally sign manifest: caller can send precomputed signature
    if (payload.signature && payload.signature.armored) {
      manifest.signature = payload.signature;
    }

    // Upload manifest as JSON
    const manifestCid = dc
      ? await dropletAddJson(dc, 'manifest.json', manifest)
      : await pinJsonToIpfs(manifest, token, apiKey, apiSecret);

    // Optionally update global registry (merge append)
    let newRegistryCid;
    const registryCid = process.env.REGISTRY_CID || params.REGISTRY_CID;
    const gatewayBase = (process.env.PINATA_GATEWAY_BASE || params.PINATA_GATEWAY_BASE || 'https://gateway.pinata.cloud').replace(/\/$/, '');
    if (!dc && registryCid) {
      try {
        const url = `${gatewayBase}/${toPath(registryCid)}`;
        const res = await fetch(url, { redirect: 'follow' });
        let current = { schema: 'v1', entries: [] };
        if (res.ok) {
          try { current = await res.json(); } catch {}
        }
        const add = {
          title: manifest.title,
          manifestCid,
          description: manifest.description,
          tags: manifest.tags || [],
          createdAt: new Date().toISOString()
        };
        const byKey = new Map();
        for (const e of Array.isArray(current.entries) ? current.entries : []) {
          const key = e.manifestCid || e.cid || e.id || e.title;
          if (key && key !== manifestCid) byKey.set(key, e);
        }
        byKey.set(manifestCid, add);
        current.entries = Array.from(byKey.values());
        const registryName = process.env.REGISTRY_NAME || params.REGISTRY_NAME || 'zeenster-manifest.json';
        newRegistryCid = await pinJsonToIpfs(current, token, apiKey, apiSecret, registryName);

        // Best-effort: unpin older registry files with the same metadata name to avoid pin bloat
        try {
          const headers = pinataAuthHeaders(token, apiKey, apiSecret);
          const listUrl = `https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=${encodeURIComponent(registryName)}&pageLimit=1000`;
          const lres = await fetch(listUrl, { headers });
          if (lres.ok) {
            const ljson = await lres.json();
            const rows = Array.isArray(ljson?.rows) ? ljson.rows : [];
            for (const row of rows) {
              const hash = row?.ipfs_pin_hash;
              if (hash && hash !== newRegistryCid) {
                try {
                  await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, { method: 'DELETE', headers });
                } catch {}
              }
            }
          }
        } catch {}
      } catch {}
    }

    // Droplet-backed registry and IPNS publish
    if (dc) {
      try {
        let current = await dropletFilesRead(dc, dc.mfsPath);
        if (!current || typeof current !== 'object') current = { schema: 'v1', entries: [] };
        const add = {
          title: manifest.title,
          manifestCid,
          description: manifest.description,
          tags: manifest.tags || [],
          createdAt: new Date().toISOString()
        };
        const byKey = new Map();
        for (const e of Array.isArray(current.entries) ? current.entries : []) {
          const key = e.manifestCid || e.cid || e.id || e.title;
          if (key && key !== manifestCid) byKey.set(key, e);
        }
        byKey.set(manifestCid, add);
        current.entries = Array.from(byKey.values());
        await dropletFilesWrite(dc, dc.mfsPath, JSON.stringify(current));
        const mCid = await dropletFilesStat(dc, dc.mfsPath);
        await dropletPublishIpns(dc, mCid);
        newRegistryCid = mCid;
      } catch {}
    }

    const pinataBase = (process.env.PINATA_GATEWAY_BASE || params.PINATA_GATEWAY_BASE || 'https://gateway.pinata.cloud').replace(/\/$/, '');
    const toIpfs = (cid) => cid ? (dc ? `${dc.GW}/ipfs/${cid}` : `https://ipfs.io/ipfs/${cid}`) : undefined;
    const toPinata = (cid) => cid ? `${pinataBase}/ipfs/${cid}` : undefined;
    const links = {
      manifest: { ipfs: toIpfs(manifestCid), pinata: toPinata(manifestCid) },
      project: { ipfs: toIpfs(projectCid), pinata: toPinata(projectCid) },
      backup: { ipfs: toIpfs(backupCid), pinata: toPinata(backupCid) }
    };

    return {
      statusCode: 200,
      headers: TEXT_HEADERS,
      body: { manifestCid, projectCid, backupCid, links, registryCid: newRegistryCid || registryCid }
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: TEXT_HEADERS,
      body: { error: e && e.message ? e.message : 'Server error' }
    };
  }
};


