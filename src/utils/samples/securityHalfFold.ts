import type { ZineProject, ZinePage } from '@/types';
import { useTemplatesStore } from '@/stores/templates';
import { text, textC, image } from './common';

const ICON_ENCRYPTED_LOCK = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="22" y="42" width="56" height="40" rx="8" stroke="#111" fill="none" stroke-width="3" stroke-linejoin="round"/><path d="M35 42v-9a15 15 0 0 1 30 0v9" stroke="#111" fill="none" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="62" r="6" fill="#111"/><path d="M50 68v8" stroke="#111" fill="none" stroke-width="3" stroke-linecap="round"/></svg>`);

export function buildSecurityHalfFold(): ZineProject {
  const templates = useTemplatesStore();
  const tpl = templates.getTemplate('half-fold-letter')!;
  const pages: ZinePage[] = [];
  const W = 396, H = 612;

  pages.push({ id: 'page-1', pageNumber: 1, title: 'Front Cover', backgroundColor: '#ffffff', content: [
    textC('t1', 24, 36, W-48, 90, 'Lock It Down: Digital Security for Activists', 44, 'bold', '#111111'),
    textC('s1', 24, 128, W-48, 40, 'Practical steps to reduce risk and protect communities', 18, 'normal', '#0EA5E9'),
    image('i1', (W-200)/2, 186, 200, 120, ICON_ENCRYPTED_LOCK, 'Encrypted lock'),
    text('f1', W-280, H-60, 260, 30, 'made by activists for activists', 14)
  ]});

  pages.push({ id: 'page-2', pageNumber: 2, title: 'Page 2', backgroundColor: '#ffffff', content: [
    textC('h2', 24, 28, W-48, 36, 'Why Digital Security Matters', 28, 'bold', '#0EA5E9'),
    text('c2', 24, 76, W-48, H-126, 'Authoritarian environments amplify surveillance and data exploitation. Basic hygiene reduces exposure: understand who might target you, what data matters most, and where it lives. Secure your phone and accounts first; then build habits as a group so everyone benefits. Small, consistent steps compound into real protection for you and your people.', 16),
    text('q2', 24, H-82, W-48, 60, '“If you don’t control your data, someone else will.”', 16, 'bold')
  ]});

  pages.push({ id: 'page-3', pageNumber: 3, title: 'Page 3', backgroundColor: '#ffffff', content: [
    textC('h3', 24, 28, W-48, 36, 'Core Practices & Tools', 28, 'bold', '#0EA5E9'),
    text('b31', 24, 76, W-48, 230, '• Passwords & 2FA: Use a password manager (e.g., Bitwarden) and app‑based or hardware 2FA (Aegis, YubiKey).\n\n• Updates: Keep your OS and apps current. Turn off auto‑installers from untrusted sources.\n\n• Browsing: Use modern browsers with strict tracking protection; Tor Browser for sensitive lookups.\n\n• Messaging: Prefer end‑to‑end encrypted apps (Signal; consider Session for pseudonymous use).', 15),
    text('b32', 24, 316, W-48, 240, '• Devices: Consider de‑Googled phones (GrapheneOS on Pixel); separate identities/devices for roles.\n\n• Connectivity: Use eSIMs (e.g., Airalo) to avoid risky kiosk SIMs; rotate identifiers when crossing borders.\n\n• VPN: Prefer audited, independently owned providers (e.g., Mullvad, IVPN, ProtonVPN). Avoid providers consolidated under controversial conglomerates (e.g., Kape‑owned brands like ExpressVPN, CyberGhost, PIA) if you prefer clear ownership.\n\n• Backups: Maintain offline or encrypted backups; practice device reset and restore.', 15)
  ]});

  pages.push({ id: 'page-4', pageNumber: 4, title: 'Back Cover', backgroundColor: '#ffffff', content: [
    textC('h4', 24, 40, W-48, 30, 'Keep Learning, Practice Together', 22, 'bold', '#0EA5E9'),
    text('c4', 24, 76, W-48, 120, 'Security is a shared practice. Document your setup, teach others, and schedule periodic check‑ups. Replace compromised credentials quickly and retire old devices when they can’t be updated.'),
    text('res4', 24, 206, W-48, 240, 'Resources:\n• EFF — Surveillance Self‑Defense\n• Tactical Tech — Data Detox Kit\n• PrivacyGuides.org\n• Consumer Reports — Security Planner'),
    text('f4', 24, H-60, W-48, 40, 'This zine is open source. Copy it, share it, remix it.', 14)
  ]});

  return {
    id: `sample-security-${Date.now()}`,
    name: 'Lock It Down',
    template: tpl,
    pages,
    createdAt: new Date(),
    modifiedAt: new Date(),
    metadata: { author: 'Sample', description: 'Security & privacy primer', tags: ['sample','security'] }
  };
}


