'use strict';

const TEXT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
  'Access-Control-Allow-Headers': 'content-type'
};

exports.main = async function (params) {
  if ((params.__ow_method || '').toUpperCase() === 'OPTIONS') {
    return { statusCode: 204, headers: TEXT_HEADERS, body: '' };
  }
  const mask = (v) => (v ? (v.length <= 6 ? '***' : `${v.slice(0,3)}***${v.slice(-3)}`) : undefined);
  return {
    statusCode: 200,
    headers: TEXT_HEADERS,
    body: {
      droplet: {
        host: process.env.IPFS_DROPLET_HOST || params.IPFS_DROPLET_HOST,
        adminUser: process.env.IPFS_DROPLET_ADMIN_USER || params.IPFS_DROPLET_ADMIN_USER,
        hasAdminPass: Boolean(process.env.IPFS_DROPLET_ADMIN_PASS || params.IPFS_DROPLET_ADMIN_PASS),
        hasApiSecret: Boolean(process.env.IPFS_API_SECRET || params.IPFS_API_SECRET),
        mfsPath: process.env.IPFS_MFS_MANIFEST_PATH || params.IPFS_MFS_MANIFEST_PATH,
        ipnsKey: process.env.IPFS_IPNS_KEY || params.IPFS_IPNS_KEY,
        registryCid: process.env.REGISTRY_CID || params.REGISTRY_CID
      }
    }
  };
};


