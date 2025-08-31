import type { ZineTemplate } from '@/types';

export interface MarkdownTemplate {
  id: string;
  name: string;
  template: ZineTemplate;
  markdown: string;
}

export function getMarkdownTemplate(template: ZineTemplate): string {
  const pageHeaders = Array.from({ length: template.pageCount }, (_, i) => {
    const pageNum = i + 1;
    let title = `Page ${pageNum}`;
    
    // Special names for common pages
    if (pageNum === 1) title = 'Front Cover';
    else if (pageNum === template.pageCount) title = 'Back Cover';
    else if (template.format === 'half-fold' && pageNum === 2) title = 'Inside Left';
    else if (template.format === 'half-fold' && pageNum === 3) title = 'Inside Right';
    
    return `## ${title}

Add your content here...

`;
  }).join('');

  return `# My ${template.name}

**Author:** Your Name
**Description:** A brief description of your zine
**Template:** ${template.id}

---

${pageHeaders}`;
}

export function getTemplateMarkdownExamples(): Record<string, string> {
  return {
    'quarter-fold-letter': `# OPSEC Field Guide

**Author:** Sample Author
**Description:** Pocket-size digital safety guide for activists & organizers
**Template:** quarter-fold-letter

---

## Front Cover

**OPSEC Field Guide**

Pocket zine for activists & organizers

Version 1.0 · Copy, remix, share

## Threat Model

**Threat Model Quickstart**

Ask:
• Who could realistically target me/us?
• What do they want? (data, access, identities)
• What happens if they succeed? (harm level)
• How likely is it?
• What controls reduce risk now?

Write answers. Revisit monthly or after incidents.

## Phone & Device Hygiene

• Keep OS/apps updated; uninstall unused apps.
• Use strong screen lock (PIN/phrase). Disable biometrics where compelled unlock is a risk.
• Separate roles: personal vs organizing devices/accounts.
• Backups: encrypted, tested restores.
• Consider hardened Android (e.g., GrapheneOS on Pixel) if feasible.

## Passwords & 2FA

• Use a password manager (Bitwarden, 1Password).
• Unique passphrase per site.
• Prefer app/hardware 2FA (Aegis, YubiKey). Avoid SMS 2FA when possible.
• Store recovery codes offline. Rotate credentials after incidents.

## Private Messaging & Metadata

• Prefer end-to-end encrypted apps (Signal). Consider Session for pseudonymous use.
• Auto-delete sensitive threads.
• Turn off cloud backups for encrypted chats.
• Assume metadata exists (who/when). Reduce it: smaller groups, minimal admin lists.

## On the Move (Actions & Travel)

• Airplane mode + disable biometrics before risky checkpoints.
• Use eSIMs or vetted SIMs; avoid ad-hoc kiosk SIMs.
• Minimize device contents when crossing borders.
• Share location only when necessary, time-bound, to trusted contacts.

## Incident Response

If device is seized or account compromised:
1) Record what happened (time, place, who, what).
2) Rotate passwords and revoke sessions.
3) Notify your group with clear next steps.
4) Assume data accessed; adjust plans.
5) Debrief, update threat model, practice recovery.

## Back Cover

**Keep Practicing**

Resources:
• EFF — Surveillance Self-Defense
• Tactical Tech — Data Detox Kit
• PrivacyGuides.org
• Consumer Reports — Security Planner

This zine is open source. Copy it, share it, remix it.

Made by organizers, for organizers.`,

    'half-fold-letter': `# My Half-Fold Zine

**Author:** Your Name
**Description:** A simple 4-page zine made from a single sheet
**Template:** half-fold-letter

---

## Front Cover

# Welcome to My Zine

*A creative publication*

## Inside Left

## Main Content

This is where your main content goes. You have plenty of space to share your thoughts, stories, art, or information.

Add paragraphs, lists, quotes, or any text content you'd like.

## Inside Right

### More Content

Continue your story or add different sections here.

You can use:
• **Bold text** for emphasis
• *Italic text* for style
• Regular text for body content

## Back Cover

### Thank You

Thanks for reading my zine!

Find more at: [your website]
Contact: [your email]

*Made with love and creativity*`,

    // Map to the new half-letter 20-page booklet template id
    'booklet-half-letter-20': `# My Booklet (Half Letter, 20 pages)

**Author:** Your Name
**Description:** A multi-page booklet with front and back printing
**Template:** booklet-half-letter-20

---

## Front Cover

# My Booklet Title

*Subtitle or tagline*

By Your Name

## Page 2

### Chapter 1: Introduction

Welcome to this booklet! This format gives you more space to develop your ideas across multiple pages.

## Page 3

### Chapter 2: Main Content

Continue your content here. Booklets are great for:
• Longer stories
• Detailed guides
• Multi-part articles
• Photo essays

## Page 4

### Chapter 3: Development

Add more sections as needed. The booklet format allows for proper pacing and organization of content.

## Page 5

### Chapter 4: Conclusion

Wrap up your ideas and provide next steps or calls to action.

## Back Cover

### About the Author

Brief bio or contact information.

### Resources

• Link 1
• Link 2
• Link 3

*Published [Date]*`,

    // Keep legacy key for compatibility; also provide the canonical id users will copy
    'accordion-letter': `# My Accordion Zine

**Author:** Your Name
**Description:** A 16-page accordion-style zine that unfolds horizontally
**Template:** accordion-16-letter

---

## Panel 1

# Start Here

*Unfold to explore*

## Panel 2

### Section 1

Begin your journey...

## Panel 3

### Section 2

Continue the story...

## Panel 4

### Section 3

Build momentum...

## Panel 5

### Section 4

Develop ideas...

## Panel 6

### Section 5

Add complexity...

## Panel 7

### Section 6

Reach the climax...

## Panel 8

### Section 7

Start resolution...

## Panel 9

### Section 8

Continue resolution...

## Panel 10

### Section 9

Near the end...

## Panel 11

### Section 10

Building to close...

## Panel 12

### Section 11

Almost finished...

## Panel 13

### Section 12

Final thoughts...

## Panel 14

### Section 13

Wrap up...

## Panel 15

### Section 14

Conclusion...

## Panel 16

### The End

*Thanks for unfolding*

Find more at: [your info]`
  };
}
