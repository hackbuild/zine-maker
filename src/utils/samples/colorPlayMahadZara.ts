import type { ZineProject, ZinePage } from '@/types';
import { useTemplatesStore } from '@/stores/templates';
import { text, textC } from './common';

// "Color-Play" by Mahad Zara — formatted as a 4-page half-fold booklet
// Source: Columbia Journal (2014) – archived copy
// We take care to keep line length comfortable and use generous margins

export function buildColorPlayMahadZara(): ZineProject {
  const templates = useTemplatesStore();
  const tpl = templates.getTemplate('half-fold-letter')!; // 4 pages
  const W = 396, H = 612;
  const M = 36; // generous margins
  const BODY = 16; // comfortable reading size
  const pages: ZinePage[] = [];

  // Page 1 — Front Cover
  pages.push({ id: 'cp-p1', pageNumber: 1, title: 'Front Cover', backgroundColor: '#ffffff', content: [
    textC('cp-title', M, 28, W - M * 2, 60, 'Color‑Play', 26, 'bold', '#111111'),
    text('cp-by', M, 76, W - M * 2, 24, 'by Mahad Zara', 16),
    text('cp-src', M, 102, W - M * 2, 22, 'First published by Columbia Journal (2014).', 11)
  ]});

  // Page 2 — Opening + white
  pages.push({ id: 'cp-p2', pageNumber: 2, title: 'Inside Left', backgroundColor: '#ffffff', content: [
    text('cp-p2', M, M, W - M * 2, H - M * 2,
      "I’ve decided it to be tentatively agreeable giving to colors possibly‑stories.\n\n" +
      "Reason withdrawn, my mother’s white strikes a tender incognito. It’s the white of a towel she—" +
      "a crisp and confused bride—would daily scrub clean. Then warm. And a newborn I—equally crisp, more confused—" +
      "chewed with frustrated vigor when, regularly, in the country my father’s sins were born, the lights went out.\n\n" +
      "The same white of the lace picked to be stitched to a dress. That God’s wife will wear to her wedding. And has worn before.\n\n" +
      "An untightly bottled, finely aged white. A white whose five children no longer go by their given name. A white whose own fists have been beaten black." +
      "The white of a hypnotic procession of vertical, lane‑dividing lines, zipper‑dotting the I‑10 freeway; dividing arid Arizona and creamy California; dividing desert‑sand from that of beach:\n\n" +
      "One eye staring out and adumbrating their accumulation, the other, steering survival. White, divided—by windshield—between my skull and the hundreds of miles of solid hot asphalt stretched out and decaying in both directions. And the white of wondering what happens if I were to fly through. Crash into.\n\n",
      BODY)
  ]});

  // Page 3 — freeway white, blue, red (part)
  pages.push({ id: 'cp-p3', pageNumber: 3, title: 'Inside Right', backgroundColor: '#ffffff', content: [
    text('cp-p3', M, M, W - M * 2, H - M * 2,
      "To sip blue, I go to the first too‑heavy water: the first genuinely drowning fear. And savoring the unseemly delicacy its taming of which immediately follows.\n\n" +
      "Which is entirely unlike red, who’s always rushing toward hopeful, ultimately, hopeless resolutions. The perfect shade of lipstick. The realest fake blood. The red in which a lover’s lips always appear, and the cayenne peppers most preferred for spicing the meal to feed the mouth between.\n\n" +
      "Arrogant, able red. As read in the eyes of a betrayer; felt in the act of betrayal. And swallowed following an episode of reliving either.\n\n" +
      "Red, invisible. Unimaginable. Always palpable. And the red of the highly combustible notion that perhaps it is not.\n\n" +
      "Calling next to mind the debouching luminosity of yellow. Of the first corn, and of a large‑mouth yellow fish, its face peeling off by blade of a stubborn, hungry fisherman. And the yellow of its amber reflection, in the eyes of his spectating, hungrier children.",
      BODY)
  ]});

  // Page 4 — red (cont.), yellow, black, closing
  pages.push({ id: 'cp-p4', pageNumber: 4, title: 'Back Cover', backgroundColor: '#ffffff', content: [
    text('cp-p4', M, M, W - M * 2, H - M * 2,
      "In the flame of sixth birthday candles: time, protracted, so as to witness the initial charring formication of each one round its wick. Yellow of the gentle, warm fire, fueling most kindled memories of childhood. And of the whistling, steamy air fogging all since.\n\n" +
      "Reason somewhat restored, we arrive last to black. To the facing my lap, burn‑shield under surface of another square foil sheet. Torched unrecognizably black to inhale another latest fix. And the misty hint of black blended within the white smoke after another climax, then exhaled.\n\n" +
      "To the black shading a shadow’s tone—my father’s. And the black of both his fading footsteps of instruction, and his wild wing strokes of hatred.\n\n" +
      "In what, the moment before the palpebral black of an involuntary glance, invariably catches the eye—in re‑casing my Uncle’s stern, somewhat disarming profile, to another black: his beard. Growing. Then fading. Next always into the worst black of the stun‑inducing through suffocating mise‑en‑scène in recollecting that mortifying morning. When I’m told he’s gone.\n\n" +
      "(This is no longer agreeable).",
      BODY)
  ]});

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


