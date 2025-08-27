# FAQ

## Why are exported images blank?
- Ensure you have content on pages and try again; export builds hidden Konva stages per side
- Check console for asset load errors (cross‑origin), especially with remote images

## Why does my quarter‑fold have a long cut line?
- The slit cut only spans from width/4 to 3*width/4 across the center line, not edge‑to‑edge

## How do I preserve image transforms?
- Moves and transform handles persist position, size, and rotation; ensure you drop (dragend/transformend) to save

## Can I manage multiple projects?
- Yes; use the Projects modal to open, rename, delete. Everything is stored in IndexedDB
