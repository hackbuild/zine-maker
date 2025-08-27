# API Reference

This project exposes state and helpers primarily through Pinia stores and composables.

## Stores

### useProjectStore (src/stores/project.ts)
- `currentProject`, `currentPage`, `currentPageIndex`, `selectedContentIds`
- `createNewProject(name, template)`
- `loadProject(project)`
- `setCurrentPage(index)`
- `addContentToCurrentPage(content)`
- `updateContent(id, updates)`
- `deleteContent(id)`
- `groupSelected()` / `ungroupSelected()`
- `selectContent(id, add?)` / `clearSelection()`
- `undo()` / `redo()`

### useUIStore (src/stores/ui.ts)
- Booleans: panels/modals, export toggles
- Fit/zoom helpers

### useTemplatesStore (src/stores/templates.ts)
- `templates`, `getTemplate(id)`, filters

### useToolsStore (src/stores/tools.ts)
- `activeTool`, draw settings

## Composables

### exportZineForTemplate (src/composables/useZineExport.ts)
- Inputs: `project`, `getAsset`, `{ showPageNumbers, showFoldMarks, showCutMarks, pixelRatio }`
- Returns: `{ images: string[], pdfData: string, width, height }`

## Utilities

### persistence (src/utils/persistence.ts)
- `saveProject(project)`
- `loadProject(id)`
- `getAllProjects()`
- `deleteProject(id)`
- `renameProject(id, newName)`
- `saveLastOpenProjectId(id)` / `getLastOpenProjectId()`
