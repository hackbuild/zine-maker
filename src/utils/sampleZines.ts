import type { ZineProject, ZinePage, ZineContent, TextProperties, ImageProperties } from '@/types';
import { useTemplatesStore } from '@/stores/templates';
import { saveProject } from '@/utils/persistence';

function text(id: string, x: number, y: number, w: number, h: number, text: string, size = 20, weight: 'normal'|'bold' = 'normal'): ZineContent {
  const props: TextProperties = {
    text,
    fontSize: size,
    fontFamily: 'Arial',
    fontWeight: weight,
    fontStyle: 'normal',
    color: '#111111',
    textAlign: 'left',
    lineHeight: 1.2,
    textDecoration: 'none',
    padding: 0
  };
  return { id, type: 'text', x, y, width: w, height: h, rotation: 0, zIndex: Date.now(), properties: props } as ZineContent;
}

function textC(id: string, x: number, y: number, w: number, h: number, text: string, size = 20, weight: 'normal'|'bold' = 'normal', color = '#111111'): ZineContent {
  const props: TextProperties = {
    text,
    fontSize: size,
    fontFamily: 'Arial',
    fontWeight: weight,
    fontStyle: 'normal',
    color,
    textAlign: 'left',
    lineHeight: 1.25,
    textDecoration: 'none',
    padding: 0
  };
  return { id, type: 'text', x, y, width: w, height: h, rotation: 0, zIndex: Date.now(), properties: props } as ZineContent;
}

function image(id: string, x: number, y: number, w: number, h: number, src: string, alt = ''): ZineContent {
  const props: ImageProperties = { src, alt, opacity: 1 };
  return { id, type: 'image', x, y, width: w, height: h, rotation: 0, zIndex: Date.now(), properties: props } as ZineContent;
}

// Inline SVG assets (small, no network) for sample imagery & thumbnails
// old PADLOCK_PHONE retained for reference was unused; replaced by ICON_ENCRYPTED_LOCK
// Additional icon variants extracted from src/icons components
const ICON_ENCRYPTED_LOCK = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="22" y="42" width="56" height="40" rx="8" stroke="#111" fill="none" stroke-width="3" stroke-linejoin="round"/><path d="M35 42v-9a15 15 0 0 1 30 0v9" stroke="#111" fill="none" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="62" r="6" fill="#111"/><path d="M50 68v8" stroke="#111" fill="none" stroke-width="3" stroke-linecap="round"/></svg>`);

// old HANDS_FLOPPY retained for reference was unused; replaced by ICON_PRINT_BLOCKS
const ICON_PRINT_BLOCKS = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="110" height="100" viewBox="0 0 110 100"><rect x="18" y="18" width="28" height="28" fill="#111"/><rect x="64" y="18" width="28" height="28" fill="#111"/><rect x="18" y="54" width="28" height="28" fill="#111"/><rect x="64" y="54" width="28" height="28" fill="#5CFF6A"/><path d="M18 18h74v64H18z" stroke="#111" fill="none" stroke-width="3"/></svg>`);

const THUMB_SECURITY = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"150\" viewBox=\"0 0 240 150\"><rect width=\"240\" height=\"150\" fill=\"#fff\"/><text x=\"18\" y=\"40\" font-family=\"Arial\" font-weight=\"bold\" font-size=\"22\" fill=\"#111\">Lock It Down</text><rect x=\"18\" y=\"54\" width=\"76\" height=\"48\" rx=\"8\" fill=\"none\" stroke=\"#111\" stroke-width=\"3\"/><rect x=\"150\" y=\"40\" width=\"46\" height=\"84\" rx=\"8\" fill=\"none\" stroke=\"#111\" stroke-width=\"3\"/><path d=\"M18 120h204\" stroke=\"#0ea5e9\" stroke-width=\"2\" opacity=\"0.6\"/></svg>`);

const THUMB_OSS = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"240\" height=\"150\" viewBox=\"0 0 240 150\"><rect width=\"240\" height=\"150\" fill=\"#fff\"/><text x=\"18\" y=\"40\" font-family=\"Arial\" font-weight=\"bold\" font-size=\"16\" fill=\"#111\">Zines: Voices from the Underground</text><path d=\"M40 110c18-4 26-10 34-18 10 6 18 10 30 10 12 0 20-4 30-10 8 8 16 14 34 18\" stroke=\"#111\" fill=\"none\" stroke-width=\"3\"/><circle cx=\"200\" cy=\"100\" r=\"10\" fill=\"#10b981\" opacity=\"0.8\"/></svg>`);

export const SAMPLE_LIST = [
  { id: 'security-half-fold', name: 'Lock It Down', description: 'Digital security & privacy primer (half-fold)', thumbnail: THUMB_SECURITY },
  { id: 'oss-mini', name: 'Zines: Voices from the Underground', description: '8-page one-sheet mini zine about zine culture', thumbnail: THUMB_OSS },
];

export function buildSecurityHalfFold(): ZineProject {
  const templates = useTemplatesStore();
  const tpl = templates.getTemplate('half-fold-letter')!;
  const pages: ZinePage[] = [];
  // Page size
  const W = 396, H = 612;

  // Page 1 – Front Cover
  pages.push({
    id: 'page-1', pageNumber: 1, title: 'Front Cover', backgroundColor: '#ffffff', content: [
      textC('t1', 24, 36, W-48, 90, 'Lock It Down: Digital Security for Activists', 44, 'bold', '#111111'),
      textC('s1', 24, 128, W-48, 40, 'Practical steps to reduce risk and protect communities', 18, 'normal', '#0EA5E9'),
      image('i1', (W-200)/2, 186, 200, 120, ICON_ENCRYPTED_LOCK, 'Encrypted lock'),
      text('f1', W-280, H-60, 260, 30, 'made by activists for activists', 14)
    ]
  });
  // Page 2 – Inside Left
  pages.push({
    id: 'page-2', pageNumber: 2, title: 'Page 2', backgroundColor: '#ffffff', content: [
      textC('h2', 24, 28, W-48, 36, 'Why Digital Security Matters', 28, 'bold', '#0EA5E9'),
      text('c2', 24, 76, W-48, H-126, 'Authoritarian environments amplify surveillance and data exploitation. Basic hygiene reduces exposure: understand who might target you, what data matters most, and where it lives. Secure your phone and accounts first; then build habits as a group so everyone benefits. Small, consistent steps compound into real protection for you and your people.', 16),
      text('q2', 24, H-82, W-48, 60, '“If you don’t control your data, someone else will.”', 16, 'bold')
    ]
  });
  // Page 3 – Inside Right
  pages.push({
    id: 'page-3', pageNumber: 3, title: 'Page 3', backgroundColor: '#ffffff', content: [
      textC('h3', 24, 28, W-48, 36, 'Core Practices & Tools', 28, 'bold', '#0EA5E9'),
      text('b31', 24, 76, W-48, 230, '• Passwords & 2FA: Use a password manager (e.g., Bitwarden) and app‑based or hardware 2FA (Aegis, YubiKey).\n\n• Updates: Keep your OS and apps current. Turn off auto‑installers from untrusted sources.\n\n• Browsing: Use modern browsers with strict tracking protection; Tor Browser for sensitive lookups.\n\n• Messaging: Prefer end‑to‑end encrypted apps (Signal; consider Session for pseudonymous use).', 15),
      text('b32', 24, 316, W-48, 240, '• Devices: Consider de‑Googled phones (GrapheneOS on Pixel); separate identities/devices for roles.\n\n• Connectivity: Use eSIMs (e.g., Airalo) to avoid risky kiosk SIMs; rotate identifiers when crossing borders.\n\n• VPN: Prefer audited, independently owned providers (e.g., Mullvad, IVPN, ProtonVPN). Avoid providers consolidated under controversial conglomerates (e.g., Kape‑owned brands like ExpressVPN, CyberGhost, PIA) if you prefer clear ownership.\n\n• Backups: Maintain offline or encrypted backups; practice device reset and restore.', 15)
    ]
  });
  // Page 4 – Back Cover
  pages.push({
    id: 'page-4', pageNumber: 4, title: 'Back Cover', backgroundColor: '#ffffff', content: [
      textC('h4', 24, 40, W-48, 30, 'Keep Learning, Practice Together', 22, 'bold', '#0EA5E9'),
      text(
        'c4',
        24,
        76,
        W-48,
        120,
        'Security is a shared practice. Document your setup, teach others, and schedule periodic check‑ups. Replace compromised credentials quickly and retire old devices when they can’t be updated.'
      ),
      text(
        'res4',
        24,
        206,
        W-48,
        240,
        'Resources:\n• EFF — Surveillance Self‑Defense\n• Tactical Tech — Data Detox Kit\n• PrivacyGuides.org\n• Consumer Reports — Security Planner'
      ),
      text('f4', 24, H-60, W-48, 40, 'This zine is open source. Copy it, share it, remix it.', 14)
    ]
  });

  const project: ZineProject = {
    id: `sample-security-${Date.now()}`,
    name: 'Lock It Down',
    template: tpl,
    pages,
    createdAt: new Date(),
    modifiedAt: new Date(),
    metadata: { author: 'Sample', description: 'Security & privacy primer', tags: ['sample','security'] }
  };
  return project;
}

export function buildOpenSourceMini(): ZineProject {
  const templates = useTemplatesStore();
  const tpl = templates.getTemplate('quarter-fold-letter')!;
  const W = 198, H = 306;
  const pages: ZinePage[] = [];

  // Page 1 – Front Cover
  pages.push({ id: 'page-1', pageNumber: 1, title: 'Front Cover', backgroundColor: '#ffffff', content: [
    textC('h1', 10, 10, W-20, 30, 'Zines: Voices from the Underground', 18, 'bold', '#10B981'),
    text('t1', 10, 38, W-20, 22, 'Unfiltered. Uncensored. Unstoppable.', 13),
    image('i1', (W-110)/2, 62, 110, 80, ICON_PRINT_BLOCKS, 'Print blocks')
  ]});
  // Page 2 – What Are Zines?
  pages.push({ id: 'page-2', pageNumber: 2, title: 'What Are Zines?', backgroundColor: '#ffffff', content: [
    textC('h2', 10, 10, W-20, 24, 'What Are Zines?', 16, 'bold', '#10B981'),
    text('b2', 10, 36, W-20, H-46, 'Zines are self‑published, non‑commercial publications central to DIY culture. They share practical knowledge, art, and lived experience—often from communities ignored by mainstream media. Production is intentionally accessible: paper, glue sticks, photocopiers.', 13)
  ]});
  // Page 3 – A Brief History
  pages.push({ id: 'page-3', pageNumber: 3, title: 'A Brief History', backgroundColor: '#ffffff', content: [
    textC('h3', 10, 10, W-20, 24, 'A Brief History', 16, 'bold', '#10B981'),
    text('b3', 10, 36, W-20, H-46, '1930s sci‑fi fanzines built collaborative worlds; later, punk/DIY scenes and riot grrrl used zines for organizing and mutual aid. Contemporary zines continue that tradition: skill‑sharing, survival guides, and community archiving.', 13)
  ]});
  // Page 4 – Why Zines Matter
  pages.push({ id: 'page-4', pageNumber: 4, title: 'Why Zines Matter', backgroundColor: '#ffffff', content: [
    textC('h4', 10, 10, W-20, 24, 'Why Zines Matter', 16, 'bold', '#10B981'),
    text('b4', 10, 36, W-20, H-46, 'They lower the barrier to speak, teach, and organize. Zines move person‑to‑person, build trust, and preserve context. They can be anonymized, duplicated, and adapted across regions without platform lock‑in.', 13)
  ]});
  // Page 5 – How to Create Your Own Zine
  pages.push({ id: 'page-5', pageNumber: 5, title: 'How to Create Your Own Zine', backgroundColor: '#ffffff', content: [
    textC('h5', 10, 10, W-20, 24, 'How to Create Your Own Zine', 16, 'bold', '#10B981'),
    text('b5', 10, 36, W-20, H-46, '• Pick a focus (know‑your‑rights, digital safety, mutual aid).\n• Draft short sections and visuals.\n• Choose a format (one‑sheet mini, half‑fold, booklet).\n• Test prints; leave margins for folds/cuts.\n• Share physically; mirror the PDF online as needed.', 13)
  ]});
  // Page 6 – Join the Zine Community
  pages.push({ id: 'page-6', pageNumber: 6, title: 'Join the Zine Community', backgroundColor: '#ffffff', content: [
    textC('h6', 10, 10, W-20, 24, 'Join the Zine Community', 16, 'bold', '#10B981'),
    text('b6', 10, 36, W-20, H-46, 'Look for local zine libraries, workshops, and fests. Explore QZAP and ZineWiki to learn from past movements. Swap, remix, and translate—with attribution where possible.', 13)
  ]});
  // Page 7 – Collage / Caption
  pages.push({ id: 'page-7', pageNumber: 7, title: 'What You’ll Find', backgroundColor: '#ffffff', content: [
    text('h7', 10, 10, W-20, 24, 'What You’ll Find', 16, 'bold'),
    text('c7', 10, 36, W-20, H-46, 'Perzines (personal stories), artzines (visual work), fanzines (culture/critique), and practical guides (mutual aid, safety, DIY). Remix and translate freely where licensing allows.', 13)
  ]});
  // Page 8 – Back Cover
  pages.push({ id: 'page-8', pageNumber: 8, title: 'Back Cover', backgroundColor: '#ffffff', content: [
    textC('h8', 10, 10, W-20, 24, 'Join the Movement', 16, 'bold', '#10B981'),
    text('b8', 10, 36, W-20, 60, 'Embrace the DIY spirit—share your stories, art, and ideas. Zine culture thrives on collaboration, curiosity, and care.', 13),
    text('links8', 10, 100, W-20, 70, 'Explore more: QZAP (Queer Zine Archive Project), ZineWiki, local zine libraries & fests.', 12),
    text('f8', 10, H-30, W-20, 20, 'This zine is open source. Copy it, share it, remix it.', 12)
  ]});

  const project: ZineProject = {
    id: `sample-oss-${Date.now()}`,
    name: 'Zines: Voices from the Underground',
    template: tpl,
    pages,
    createdAt: new Date(),
    modifiedAt: new Date(),
    metadata: { author: 'Sample', description: 'A concise guide to zine culture', tags: ['sample','zines'] }
  };
  return project;
}

export async function installSamples(): Promise<void> {
  const samples = [buildSecurityHalfFold(), buildOpenSourceMini()];
  for (const p of samples) await saveProject(p);
}

export function getSamples() {
  return SAMPLE_LIST;
}

export function createSample(id: string): ZineProject | null {
  if (id === 'security-half-fold') return buildSecurityHalfFold();
  if (id === 'oss-mini') return buildOpenSourceMini();
  return null;
}


