import type { ZineProject } from '@/types';
import { saveProject } from '@/utils/persistence';
// keep for possible future sample thumbnails and exports
import { buildOpsecMini } from './samples/opsecMini';
import { buildIceKyrMini } from './samples/iceKyrMini';
import { buildColorPlayMahadZara } from './samples/colorPlayMahadZara';
import { buildSecurityHalfFold } from './samples/securityHalfFold';
import { buildOpenSourceMini } from './samples/openSourceMini';

// Thumbnails retained for listing

const THUMB_SECURITY = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"150\" viewBox=\"0 0 240 150\"><rect width=\"240\" height=\"150\" fill=\"#fff\"/><text x=\"18\" y=\"40\" font-family=\"Arial\" font-weight=\"bold\" font-size=\"22\" fill=\"#111\">Lock It Down</text><rect x=\"18\" y=\"54\" width=\"76\" height=\"48\" rx=\"8\" fill=\"none\" stroke=\"#111\" stroke-width=\"3\"/><rect x=\"150\" y=\"40\" width=\"46\" height=\"84\" rx=\"8\" fill=\"none\" stroke=\"#111\" stroke-width=\"3\"/><path d=\"M18 120h204\" stroke=\"#0ea5e9\" stroke-width=\"2\" opacity=\"0.6\"/></svg>`);

const THUMB_OSS = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"150\" viewBox=\"0 0 240 150\"><rect width=\"240\" height=\"150\" fill=\"#fff\"/><text x=\"18\" y=\"40\" font-family=\"Arial\" font-weight=\"bold\" font-size=\"16\" fill=\"#111\">Zines: Voices from the Underground</text><path d=\"M40 110c18-4 26-10 34-18 10 6 18 10 30 10 12 0 20-4 30-10 8 8 16 14 34 18\" stroke=\"#111\" fill=\"none\" stroke-width=\"3\"/><circle cx=\"200\" cy=\"100\" r=\"10\" fill=\"#10b981\" opacity=\"0.8\"/></svg>`);

export const SAMPLE_LIST = [
  { id: 'security-half-fold', name: 'Lock It Down', description: 'Digital security & privacy primer (half-fold)', thumbnail: THUMB_SECURITY },
  { id: 'oss-mini', name: 'Zines: Voices from the Underground', description: '8-page one-sheet mini zine about zine culture', thumbnail: THUMB_OSS },
  { id: 'opsec-mini', name: 'OPSEC Field Guide', description: '8-page pocket zine: digital safety for organizers', thumbnail: '' },
  { id: 'ice-kyr-mini', name: 'ICE: Know Your Rights', description: '8-page pocket zine on rights, safer interactions, and reporting', thumbnail: '' },
  { id: 'color-play', name: 'Color‑Play', description: 'Poem by Mahad Zara, formatted as an 8‑page mini zine', thumbnail: '' },
];

// moved builders for security and OSS samples into ./samples

export async function installSamples(): Promise<void> {
  const samples = [buildSecurityHalfFold(), buildOpenSourceMini(), buildOpsecMini(), buildIceKyrMini(), buildColorPlayMahadZara()];
  for (const p of samples) await saveProject(p);
}

export function getSamples() {
  return SAMPLE_LIST;
}

export function createSample(id: string): ZineProject | null {
  if (id === 'security-half-fold') return buildSecurityHalfFold();
  if (id === 'oss-mini') return buildOpenSourceMini();
  if (id === 'opsec-mini') return buildOpsecMini();
  if (id === 'ice-kyr-mini') return buildIceKyrMini();
  if (id === 'color-play') return buildColorPlayMahadZara();
  return null;
}


