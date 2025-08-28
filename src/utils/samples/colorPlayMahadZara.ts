import type { ZineProject, ZinePage } from '@/types';
import { useTemplatesStore } from '@/stores/templates';
import { text, textC } from './common';

// "Color-Play" by Mahad Zara — formatted for an 8-page quarter-fold
// Source: Columbia Journal (2014) – archived copy
// We take care to keep line length comfortable and use generous margins

export function buildColorPlayMahadZara(): ZineProject {
  const templates = useTemplatesStore();
  // Use accordion-16 (portrait tiles) to provide more text area across more pages
  const tpl = templates.getTemplate('accordion-16-letter')!;
  const W = 153, H = 198; // page canvas for accordion-16 template
  const M = 10; // margin
  const BODY = 13; // carefully chosen to avoid overflow on mini pages
  const pages: ZinePage[] = [];

  // Page 1 — Title
  pages.push({ id: 'cp-p1', pageNumber: 1, title: 'Front Cover', backgroundColor: '#ffffff', content: [
    textC('cp-title', M, 28, W - M * 2, 60, 'Color‑Play', 26, 'bold', '#111111'),
    text('cp-by', M, 76, W - M * 2, 24, 'by Mahad Zara', 16),
    text('cp-src', M, 102, W - M * 2, 22, 'First published by Columbia Journal (2014).', 11)
  ]});

  // Page 2 — Opening + white (part 1)
  pages.push({ id: 'cp-p2', pageNumber: 2, title: 'Color‑Play (1)', backgroundColor: '#ffffff', content: [
    text('cp-p2', M, M, W - M * 2, H - M * 2,
      "I’ve decided it to be tentatively agreeable giving to colors possibly‑stories.\n\n" +
      "Reason withdrawn, my mother’s white strikes a tender incognito. It’s the white of a towel she—" +
      "a crisp and confused bride—would daily scrub clean. Then warm. And a newborn I—equally crisp, more confused—" +
      "chewed with frustrated vigor when, regularly, in the country my father’s sins were born, the lights went out.",
      BODY)
  ]});

  // Page 3 — white (part 2)
  pages.push({ id: 'cp-p3', pageNumber: 3, title: 'Color‑Play (2)', backgroundColor: '#ffffff', content: [
    text('cp-p3', M, M, W - M * 2, H - M * 2,
      "The same white of the lace picked to be stitched to a dress. That God’s wife will wear to her wedding. And has worn before.\n\n" +
      "An untightly bottled, finely aged white. A white whose five children no longer go by their given name. A white whose own fists have been beaten black.",
      BODY)
  ]});

  // Page 4 — the freeway white
  pages.push({ id: 'cp-p4', pageNumber: 4, title: 'Color‑Play (3)', backgroundColor: '#ffffff', content: [
    text('cp-p4', M, M, W - M * 2, H - M * 2,
      "The white of a hypnotic procession of vertical, lane‑dividing lines, zipper‑dotting the I‑10 freeway; dividing arid Arizona and creamy California; dividing desert‑sand from that of beach: \n\n" +
      "One eye staring out and adumbrating their accumulation, the other, steering survival. White, divided—by windshield—between my skull and the hundreds of miles of solid hot asphalt stretched out and decaying in both directions. And the white of wondering what happens if I were to fly through. Crash into.",
      BODY)
  ]});

  // Page 5 — blue
  pages.push({ id: 'cp-p5', pageNumber: 5, title: 'Color‑Play (4)', backgroundColor: '#ffffff', content: [
    text('cp-p5', M, M, W - M * 2, H - M * 2,
      "To sip blue, I go to the first too‑heavy water: the first genuinely drowning fear. And savoring the unseemly delicacy its taming of which immediately follows.",
      BODY)
  ]});

  // Page 6 — red
  // Split "red" across two pages to avoid overflow on small canvas
  pages.push({ id: 'cp-p6', pageNumber: 6, title: 'Color‑Play (5a)', backgroundColor: '#ffffff', content: [
    text('cp-p6a', M, M, W - M * 2, H - M * 2,
      "Which is entirely unlike red, who’s always rushing toward hopeful, ultimately, hopeless resolutions. The perfect shade of lipstick. The realest fake blood. The red in which a lover’s lips always appear, and the cayenne peppers most preferred for spicing the meal to feed the mouth between.",
      BODY)
  ]});

  pages.push({ id: 'cp-p6b', pageNumber: 7, title: 'Color‑Play (5b)', backgroundColor: '#ffffff', content: [
    text('cp-p6b', M, M, W - M * 2, H - M * 2,
      "Arrogant, able red. As read in the eyes of a betrayer; felt in the act of betrayal. And swallowed following an episode of reliving either.\n\n" +
      "Red, invisible. Unimaginable. Always palpable. And the red of the highly combustible notion that perhaps it is not.",
      BODY)
  ]});

  // Page 7 — yellow
  pages.push({ id: 'cp-p7', pageNumber: 8, title: 'Color‑Play (6)', backgroundColor: '#ffffff', content: [
    text('cp-p7', M, M, W - M * 2, H - M * 2,
      "Calling next to mind the debouching luminosity of yellow. Of the first corn, and of a large‑mouth yellow fish, its face peeling off by blade of a stubborn, hungry fisherman. And the yellow of its amber reflection, in the eyes of his spectating, hungrier children.\n\n" +
      "In the flame of sixth birthday candles: time, protracted, so as to witness the initial charring formication of each one round its wick. Yellow of the gentle, warm fire, fueling most kindled memories of childhood. And of the whistling, steamy air fogging all since.",
      BODY)
  ]});

  // Page 9 — black + closing
  pages.push({ id: 'cp-p8', pageNumber: 9, title: 'Color‑Play (7)', backgroundColor: '#ffffff', content: [
    text('cp-p8a', M, M, W - M * 2, 160,
      "Reason somewhat restored, we arrive last to black. To the facing my lap, burn‑shield under surface of another square foil sheet. Torched unrecognizably black to inhale another latest fix. And the misty hint of black blended within the white smoke after another climax, then exhaled.\n\n" +
      "To the black shading a shadow’s tone—my father’s. And the black of both his fading footsteps of instruction, and his wild wing strokes of hatred.",
      BODY),
    text('cp-p8b', M, 176, W - M * 2, 92,
      "In what, the moment before the palpebral black of an involuntary glance, invariably catches the eye—in re‑casing my Uncle’s stern, somewhat disarming profile, to another black: his beard. Growing. Then fading. Next always into the worst black of the stun‑inducing through suffocating mise‑en‑scène in recollecting that mortifying morning. When I’m told he’s gone.",
      BODY),
    textC('cp-end', M, H - 36, W - M * 2, 22, '(This is no longer agreeable).', 11, 'normal', '#555')
  ]});

  // Fill remaining tiles (10–16) with colophon/blank to maintain sequence and leave space for dedications
  pages.push({ id: 'cp-blank10', pageNumber: 10, title: '—', backgroundColor: '#ffffff', content: [ text('cp-colophon1', M, M, W - M * 2, H - M * 2, 'Presented with love and care in memory of Mahad Zara.', 12) ]});
  pages.push({ id: 'cp-blank11', pageNumber: 11, title: '—', backgroundColor: '#ffffff', content: [] });
  pages.push({ id: 'cp-blank12', pageNumber: 12, title: '—', backgroundColor: '#ffffff', content: [] });
  pages.push({ id: 'cp-blank13', pageNumber: 13, title: '—', backgroundColor: '#ffffff', content: [] });
  pages.push({ id: 'cp-blank14', pageNumber: 14, title: '—', backgroundColor: '#ffffff', content: [] });
  pages.push({ id: 'cp-blank15', pageNumber: 15, title: '—', backgroundColor: '#ffffff', content: [] });
  pages.push({ id: 'cp-blank16', pageNumber: 16, title: '—', backgroundColor: '#ffffff', content: [] });

  return {
    id: `sample-color-play-${Date.now()}`,
    name: 'Color‑Play',
    template: tpl,
    pages,
    createdAt: new Date(),
    modifiedAt: new Date(),
    metadata: {
      author: 'Mahad Zara',
      description: 'Color‑Play — a poem presented in an 8‑page zine format',
      tags: ['sample','poetry']
    }
  };
}


