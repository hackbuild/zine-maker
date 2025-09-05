'use strict';
try { if (typeof fetch === 'undefined') { const { fetch: f } = require('undici'); if (f) global.fetch = f; } } catch {}

// Web-exported function to fetch or update a global zine registry manifest stored on IPFS.
// Uses your internal IPFS node (droplet) if configured; otherwise falls back to public gateways for reads.

const TEXT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
  'Access-Control-Allow-Headers': 'content-type,authorization'
};

function gatewayUrl(base, cid) {
  const b = (base || '').replace(/\/$/, '');
  const path = cid.startsWith('ipfs/') || cid.startsWith('ipns/') ? cid : `ipfs/${cid}`;
  return b ? `${b}/${path}` : `https://ipfs.io/${path}`;
}

async function fetchRegistryJsonWithFallback(cid, preferredBase) {
  const bases = Array.from(new Set([
    (preferredBase || '').replace(/\/$/, ''),
    'https://ipfs.io',
    'https://cloudflare-ipfs.com',
    'https://dweb.link'
  ].filter(Boolean)));
  let lastErr;
  for (const base of bases) {
    try {
      const url = gatewayUrl(base, cid);
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
      return await res.json();
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Failed to fetch registry');
}

async function pinataUploadJson(token, content, key, secret) {
  const headers = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : (key && secret ? { 'pinata_api_key': key, 'pinata_secret_api_key': secret, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' });
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers,
    body: JSON.stringify({ pinataContent: content })
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Pinata JSON upload failed (${res.status}): ${t}`);
  }
  const data = await res.json();
  return data.IpfsHash || data.cid;
}

exports.main = async function (params) {
  if ((params.__ow_method || '').toUpperCase() === 'OPTIONS') {
    return { statusCode: 204, headers: TEXT_HEADERS, body: '' };
  }

  try {
    const method = (params.__ow_method || 'GET').toUpperCase();
    // Droplet config
    const host = process.env.IPFS_DROPLET_HOST || params.IPFS_DROPLET_HOST;
    const pass = process.env.IPFS_DROPLET_ADMIN_PASS || params.IPFS_DROPLET_ADMIN_PASS;
    const user = process.env.IPFS_DROPLET_ADMIN_USER || params.IPFS_DROPLET_ADMIN_USER || 'ipfsadmin';
    const API = host ? `http://${host}:5002/api/v0` : undefined;
    const auth = (host && pass) ? 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') : undefined;
    const apiSecret = process.env.IPFS_API_SECRET || params.IPFS_API_SECRET;
    const headers = auth ? (apiSecret ? { Authorization: auth, 'X-API-SECRET': apiSecret } : { Authorization: auth }) : undefined;
    let registryCid = process.env.REGISTRY_CID || params.REGISTRY_CID || params.cid;
    const gatewayBase = host ? `http://${host}:8080` : 'https://ipfs.io';

    if (method === 'GET') {
      // Optional droplet lookup by IPNS key name when no CID specified
      const byKeyName = params.key || params.name;
      if (!registryCid && API && headers && byKeyName) {
        try {
          const list = await fetch(`${API}/key/list`, { method: 'POST', headers });
          if (list.ok) {
            const j = await list.json();
            const id = (j?.Keys || []).find(k => k?.Name === byKeyName)?.Id;
            if (id) registryCid = `ipns/${id}`;
          }
        } catch {}
      }
      if (!registryCid) {
        return { statusCode: 404, headers: TEXT_HEADERS, body: { error: 'No registry CID configured' } };
      }
      try {
        const json = await fetchRegistryJsonWithFallback(registryCid, gatewayBase);
        return { statusCode: 200, headers: TEXT_HEADERS, body: json };
      } catch (e) {
        return { statusCode: 502, headers: TEXT_HEADERS, body: { error: e?.message || 'Fetch failed' } };
      }
    }

    if (method === 'POST') {
      if (!token) {
        return { statusCode: 400, headers: TEXT_HEADERS, body: { error: 'Missing PINATA_JWT' } };
      }
      const body = typeof params.__ow_body === 'string'
        ? JSON.parse(Buffer.from(params.__ow_body, 'base64').toString('utf8'))
        : (params.payload || params);

      // Expect either full replacement manifest or a merge of entries
      // Shape: { mode: 'replace'|'merge', manifest?: object, add?: object[], remove?: string[] }
      const mode = (body.mode || 'merge').toLowerCase();

      let current = { schema: 'v1', entries: [] };
      if (mode === 'merge' && registryCid) {
        try {
          current = await fetchRegistryJsonWithFallback(registryCid, gatewayBase);
        } catch {}
      }

      if (mode === 'replace' && body.manifest) {
        current = body.manifest;
      } else if (mode === 'merge') {
        // Merge additions and removals against current.entries (array of { title, manifestCid, tags, createdAt } or similar)
        const add = Array.isArray(body.add) ? body.add : [];
        const remove = Array.isArray(body.remove) ? new Set(body.remove) : new Set();
        const byKey = new Map();
        for (const e of Array.isArray(current.entries) ? current.entries : []) {
          const key = e.manifestCid || e.id || e.title;
          if (!remove.has(key)) byKey.set(key, e);
        }
        for (const e of add) {
          const key = e.manifestCid || e.id || e.title;
          byKey.set(key, { ...e });
        }
        current.entries = Array.from(byKey.values());
      }

      const newJson = current;
      if (!token && !(apiKey && apiSecret)) {
        return { statusCode: 400, headers: TEXT_HEADERS, body: { error: 'Missing Pinata credentials' } };
      }
      const newCid = await pinataUploadJson(token, newJson, apiKey, apiSecret);

      return { statusCode: 200, headers: TEXT_HEADERS, body: { registryCid: newCid, entries: current.entries?.length || 0 } };
    }

    return { statusCode: 405, headers: TEXT_HEADERS, body: { error: 'Method not allowed' } };
  } catch (e) {
    return { statusCode: 500, headers: TEXT_HEADERS, body: { error: e && e.message ? e.message : 'Server error' } };
  }
};


