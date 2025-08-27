# Templates & Export

## Templates
- Quarter‑fold (Letter): 8 pages on a single sheet; one‑sided export; slit cut across center from 1/4 to 3/4 width
- Half‑fold (Letter): 4 pages; double‑sided export (front/back)
- Booklet (Letter): 16 pages; multiple sheets; each sheet has front/back spreads (outer to inner)

## Imposition
- Quarter‑fold: top row upside‑down; bottom row right‑side; fold marks optional; single side
- Half‑fold: front [4|1], back [2|3]
- Booklet (sheet i, 0‑based):
  - Front: [N‑2i | 1+2i]
  - Back:  [2+2i | N‑1−2i]

## Export Pipeline
- Render sides to hidden Konva stages at template sheet size
- Add page groups with clipping, rotation/flip as required
- Apply optional page numbers, fold/cut marks
- Output PNGs with pixelRatio; assemble PDF with jsPDF

## Print Guidance
- Print at 100% (Actual Size); no scaling
- Flip on long edge for half‑fold/booklet
- For quarter‑fold slit zine: cut along center slit (not edge‑to‑edge); fold accordingly
