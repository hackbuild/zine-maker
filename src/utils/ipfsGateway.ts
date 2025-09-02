const GATEWAYS = [
  (path: string) => `https://ipfs.io/${path}`,
  (path: string) => `https://cloudflare-ipfs.com/${path}`,
  (path: string) => `https://dweb.link/${path}`
];

function toPath(cidOrName: string): string {
  const v = (cidOrName || '').trim();
  if (!v) return 'ipfs/';
  if (v.startsWith('ipns/')) return v;
  if (v.startsWith('ipfs/')) return v;
  if (v.startsWith('ipns:')) return `ipns/${v.slice(5)}`;
  if (v.startsWith('ipfs:')) return `ipfs/${v.slice(5)}`;
  if (v.startsWith('k51')) return `ipns/${v}`; // IPNS key
  return `ipfs/${v}`; // default to IPFS CID
}

export async function fetchIpfsJson<T = any>(cidOrPath: string): Promise<T> {
  const path = toPath(cidOrPath);
  let lastErr: any;
  for (const g of GATEWAYS) {
    try {
      const url = g(path);
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json() as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Failed to fetch from IPFS gateways');
}

export function gatewayUrl(cidOrPath: string): string {
  const path = toPath(cidOrPath);
  if (path === 'ipfs/') return GATEWAYS[0]('ipfs');
  return GATEWAYS[0](path);
}


