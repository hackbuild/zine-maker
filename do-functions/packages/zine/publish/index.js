'use strict';
// Ensure Blob exists in Node runtime (DO Functions) by polyfilling from buffer
try { if (typeof Blob === 'undefined') { global.Blob = require('buffer').Blob; } } catch {}

// DigitalOcean Functions (OpenWhisk) action entry
// Web-exported; expects JSON body. Publishes a project/manifest to IPFS via Pinata.

const TEXT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'content-type,authorization'
};

async function pinataUpload(url, token, formData, key, secret) {
  const res = await fetch(url, {
    method: 'POST',
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : (key && secret ? { 'pinata_api_key': key, 'pinata_secret_api_key': secret } : {}),
    body: formData
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Pinata upload failed (${res.status}): ${t}`);
  }
  return res.json();
}

async function uploadBytes(name, contentBlob, token, key, secret) {
  const form = new FormData();
  form.append('file', contentBlob, name);
  const data = await pinataUpload('https://api.pinata.cloud/pinning/pinFileToIPFS', token, form, key, secret);
  const cid = data.IpfsHash || data.cid;
  if (!cid) throw new Error('Missing CID in Pinata response');
  return cid;
}

exports.main = async function (params) {
  // CORS preflight
  if ((params.__ow_method || '').toUpperCase() === 'OPTIONS') {
    return { statusCode: 204, headers: TEXT_HEADERS, body: '' };
  }

  try {
    const token = process.env.PINATA_JWT || params.PINATA_JWT;
    const apiKey = process.env.PINATA_API_KEY || params.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET || params.PINATA_API_SECRET;
    if (!token && !(apiKey && apiSecret)) {
      return { statusCode: 400, headers: TEXT_HEADERS, body: { error: 'Missing Pinata credentials' } };
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

    // Upload project.json (and optional backup.json if provided by caller)
    const projectCid = await uploadBytes('project.json', new Blob([projectJson], { type: 'application/json' }), token, apiKey, apiSecret);

    let backupCid;
    if (payload.backup) {
      const backupJson = JSON.stringify(payload.backup);
      backupCid = await uploadBytes('backup.json', new Blob([backupJson], { type: 'application/json' }), token, apiKey, apiSecret);
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
      pinnedVia: ['pinata'],
      app: { name: 'Zine Maker', version: '0.0.0' }
    };

    // Optionally upload embedded public key
    if (manifest.author?.pgp?.publicKeyArmored) {
      const pubCid = await uploadBytes('pubkey.asc', new Blob([manifest.author.pgp.publicKeyArmored], { type: 'text/plain' }), token, apiKey, apiSecret);
      manifest.author.pgp.publicKeyArmoredCid = pubCid;
      delete manifest.author.pgp.publicKeyArmored;
    }

    // Optionally sign manifest: caller can send precomputed signature
    if (payload.signature && payload.signature.armored) {
      manifest.signature = payload.signature;
    }

    // Upload manifest
    const manifestCid = await uploadBytes('manifest.json', new Blob([JSON.stringify(manifest)], { type: 'application/json' }), token, apiKey, apiSecret);

    return {
      statusCode: 200,
      headers: TEXT_HEADERS,
      body: { manifestCid, projectCid, backupCid }
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: TEXT_HEADERS,
      body: { error: e && e.message ? e.message : 'Server error' }
    };
  }
};


