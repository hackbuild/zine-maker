# DigitalOcean Functions for Zine Maker (ipfs-share)

This directory contains DigitalOcean Functions for publishing zines to IPFS (Pinata) and maintaining a public registry manifest.

Structure:
- `project.yml` — Functions project descriptor
- `packages/zine/publish` — Web action to publish a project and manifest to IPFS
- `packages/zine/registry` — Web action to fetch/update the global registry manifest

Deploy (via CLI):
- Ensure you have `doctl` configured.
- Deploy using remote build:
```
doctl serverless deploy do-functions --remote-build
```

App Platform:
- An App Platform spec is provided in `.do/app.yaml` to create a separate app that watches the `ipfs-share` branch and exposes routes under `/api/`.

Environment Variables:
- `PINATA_JWT` (secret): Pinata JWT token
- `PINATA_GATEWAY_BASE` (optional): Base gateway, e.g. `https://gateway.pinata.cloud`
- `REGISTRY_CID` (optional): Existing registry CID to read/merge

HTTP usage:
- Publish: `POST /api/zine/publish` with JSON body `{ project, description?, tags?, author?, backup? }`
- Registry: 
  - `GET /api/zine/registry` → returns JSON manifest
  - `POST /api/zine/registry` with `{ mode: 'merge'|'replace', manifest? | add?:[], remove?:[] }`

Notes:
- Web actions return JSON and include permissive CORS for ease of use.
- Manifest JSON aligns with `src/types/index.ts` `ZineManifest`.
