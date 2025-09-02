import type { PublishOptions } from './useIpfs';

type PinProvider = PublishOptions['pin'];

export async function uploadDirectory(files: { path: string; content: Blob }[], pin?: PinProvider): Promise<Record<string, string>> {
  if (pin?.provider === 'web3') {
    const { Web3Storage } = await import('web3.storage');
    const client = new Web3Storage({ token: pin.token });
    const cids: Record<string, string> = {};
    for (const f of files) {
      const cid = await client.put([new File([f.content], f.path)], { wrapWithDirectory: false });
      cids[f.path] = cid;
    }
    return cids;
  }
  if (pin?.provider === 'pinata') {
    const cids: Record<string, string> = {};
    for (const f of files) {
      const form = new FormData();
      form.append('file', f.content, f.path);
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pin.token}` },
        body: form
      });
      if (!res.ok) throw new Error('Pinata upload failed');
      const data = await res.json();
      cids[f.path] = data.IpfsHash;
    }
    return cids;
  }
  // Fallback: use public gateway upload APIs are not reliable; as a placeholder, return empty
  const map: Record<string, string> = {};
  for (const f of files) {
    // No pinning provider -> cannot upload; in real flow, integrate Helia + relay pinning
    map[f.path] = '';
  }
  return map;
}

export async function uploadBytes(content: Blob, name: string, pin?: PinProvider): Promise<string> {
  const res = await uploadDirectory([{ path: name, content }], pin);
  return res[name];
}


