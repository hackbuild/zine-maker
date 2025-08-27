# Persistence & Projects

## Storage
- IndexedDB via idb:
  - `assets` store for uploaded images
  - `projects` store for ZineProject documents
- Auto‑save with debounce; last open project id held in localStorage

## Projects Modal
- Open from the header
- Lists recent projects (sorted by modified date)
- Actions: Open, Rename, Delete
- ESC or red X closes the modal

## Data Model (simplified)
```ts
interface ZineProject { id: string; name: string; template: ZineTemplate; pages: ZinePage[]; createdAt: Date; modifiedAt: Date }
interface ZinePage { id: string; pageNumber: number; title: string; content: ZineContent[]; backgroundColor: string }
interface ZineContent { id: string; type: 'text'|'image'|'shape'|'drawing'; x: number; y: number; width: number; height: number; rotation: number; zIndex: number; groupId?: string; properties: any }
```
