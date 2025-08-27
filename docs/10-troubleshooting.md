# Troubleshooting

## Selection feels jumpy or items move on click
- Dragging starts after moving ~4px; click once to select, then drag
- If items move immediately, ensure the Select tool is active

## Marquee doesn’t select drawings
- Drawings are Lines with hitStrokeWidth; ensure you start marquee on empty space or hold Shift

## Booklet export is empty
- Confirm page count and content; sheets are generated outer‑to‑inner. Check console for errors

## PDF size is wrong
- Print at 100% (Actual Size). The PDF is created at template sheet size using jsPDF

## Assets not found
- Uploaded assets live in IndexedDB; ensure you didn’t clear site data
