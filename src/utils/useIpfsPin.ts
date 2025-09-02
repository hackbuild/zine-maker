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
  // No provider -> disallow upload to avoid empty CIDs
  throw new Error('No pinning provider configured');
}

export async function uploadBytes(content: Blob, name: string, pin?: PinProvider): Promise<string> {
  const res = await uploadDirectory([{ path: name, content }], pin);
  return res[name];
}


