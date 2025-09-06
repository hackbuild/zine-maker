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

// Pinata removed for registry writes; registry is maintained via droplet MFS in publish flow.

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
    const mfsPath = process.env.IPFS_MFS_MANIFEST_PATH || params.IPFS_MFS_MANIFEST_PATH || '/manifests/latest.json';

    if (method === 'GET') {
      // Direct project fetch by CID via public gateways (prefer ipfs.io)
      if (params.projectCid) {
        const cid = String(params.projectCid || '').trim();
        if (!cid) return { statusCode: 400, headers: TEXT_HEADERS, body: { error: 'Missing projectCid' } };
        try {
          const json = await fetchRegistryJsonWithFallback(`ipfs/${cid}`, 'https://ipfs.io');
          return { statusCode: 200, headers: TEXT_HEADERS, body: json };
        } catch (e) {
          return { statusCode: 502, headers: TEXT_HEADERS, body: { error: e?.message || 'Fetch failed' } };
        }
      }
      // If we have the droplet API, prefer reading directly from MFS (fast, no IPNS/gateway)
      if (API && headers && !registryCid) {
        try {
          const res = await fetch(`${API}/files/read?arg=${encodeURIComponent(mfsPath)}`, { method: 'POST', headers });
          if (res.ok) {
            const txt = await res.text();
            try { const json = JSON.parse(txt); return { statusCode: 200, headers: TEXT_HEADERS, body: json }; } catch {}
          }
        } catch {}
      }
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
      return { statusCode: 405, headers: TEXT_HEADERS, body: { error: 'Writes disabled here; publish handles registry updates' } };
    }

    return { statusCode: 405, headers: TEXT_HEADERS, body: { error: 'Method not allowed' } };
  } catch (e) {
    return { statusCode: 500, headers: TEXT_HEADERS, body: { error: e && e.message ? e.message : 'Server error' } };
  }
};


