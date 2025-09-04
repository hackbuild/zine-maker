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

// Web-exported function to fetch or update a global zine registry manifest stored on IPFS.
// Uses Pinata JWT for uploads. Reads existing manifest from IPFS gateways.

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
    const token = process.env.PINATA_JWT || params.PINATA_JWT;
    const apiKey = process.env.PINATA_API_KEY || params.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET || params.PINATA_API_SECRET;
    let registryCid = process.env.REGISTRY_CID || params.REGISTRY_CID || params.cid;
    const gatewayBase = process.env.PINATA_GATEWAY_BASE || params.PINATA_GATEWAY_BASE || 'https://gateway.pinata.cloud';

    if (method === 'GET') {
      // Optional lookup by Pinata file name (latest pinned)
      const byName = params.name || params.filename;
      if (byName && (token || (apiKey && apiSecret))) {
        try {
          const searchUrl = `https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=${encodeURIComponent(byName)}&pageLimit=1&sort=created_at&direction=desc`;
          const headers = token
            ? { Authorization: `Bearer ${token}` }
            : { 'pinata_api_key': apiKey, 'pinata_secret_api_key': apiSecret };
          const sres = await fetch(searchUrl, { headers });
          if (sres.ok) {
            const sjson = await sres.json();
            const row = (sjson?.rows || [])[0];
            if (row?.ipfs_pin_hash) registryCid = row.ipfs_pin_hash;
          }
        } catch {}
      }
      if (!registryCid) {
        return { statusCode: 404, headers: TEXT_HEADERS, body: { error: 'No registry CID configured' } };
      }
      const url = gatewayUrl(gatewayBase, registryCid);
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        return { statusCode: res.status, headers: TEXT_HEADERS, body: { error: `Fetch failed ${res.status}` } };
      }
      const json = await res.json();
      return { statusCode: 200, headers: TEXT_HEADERS, body: json };
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
          const url = gatewayUrl(gatewayBase, registryCid);
          const res = await fetch(url);
          if (res.ok) current = await res.json();
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


