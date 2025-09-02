const GATEWAYS = [
  (path: string) => `https://ipfs.io/${path}`,
  (path: string) => `https://cloudflare-ipfs.com/${path}`,
  (path: string) => `https://dweb.link/${path}`
];

function toPath(cidOrName: string): string {
  if (cidOrName.startsWith('ipns/')) return cidOrName;
  if (cidOrName.startsWith('ipfs/')) return cidOrName;
  if (cidOrName.startsWith('ipns:')) return `ipns/${cidOrName.slice(5)}`;
  if (cidOrName.startsWith('ipfs:')) return `ipfs/${cidOrName.slice(5)}`;
  if (cidOrName.startsWith('k51') || cidOrName.startsWith('bafy')) return `ipns/${cidOrName}`;
  return `ipfs/${cidOrName}`;
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
  return GATEWAYS[0](path);
}


