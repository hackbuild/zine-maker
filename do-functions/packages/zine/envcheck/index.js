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
      hasJWT: Boolean(process.env.PINATA_JWT || params.PINATA_JWT),
      hasKey: Boolean(process.env.PINATA_API_KEY || params.PINATA_API_KEY),
      hasSecret: Boolean(process.env.PINATA_API_SECRET || params.PINATA_API_SECRET),
      gateway: process.env.PINATA_GATEWAY_BASE || params.PINATA_GATEWAY_BASE,
      sample: {
        jwt: mask(process.env.PINATA_JWT || params.PINATA_JWT),
        key: mask(process.env.PINATA_API_KEY || params.PINATA_API_KEY),
        secret: mask(process.env.PINATA_API_SECRET || params.PINATA_API_SECRET)
      }
    }
  };
};


