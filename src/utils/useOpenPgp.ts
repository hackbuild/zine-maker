import type { ZineManifest } from '@/types';

export async function signManifest(manifest: ZineManifest, privateKeyArmored: string, passphrase?: string): Promise<{ armored: string }> {
  const openpgp = await import('openpgp');
  // Basic canonicalization; for production use JCS (RFC 8785)
  const payload = JSON.stringify(manifest);
  const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
  const decrypted = passphrase ? await openpgp.decryptKey({ privateKey, passphrase }) : privateKey;
  const signature = await openpgp.sign({ message: await openpgp.createMessage({ text: payload }), signingKeys: decrypted, detached: true });
  return { armored: signature as unknown as string };
}


