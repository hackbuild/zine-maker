<template>
  <div id="app" :data-theme="theme">
    <ImageUploadModal 
      :visible="uiStore.showImageUploadModal" 
      @close="uiStore.showImageUploadModal = false"
      @image-added="addImageToCanvas"
    />
    <ExportModal 
      :visible="uiStore.showExportModal"
      :image-src="uiStore.exportImageData"
      @close="uiStore.showExportModal = false"
    />

    <ProjectsModal 
      v-if="uiStore.showProjectsModal"
      @close="uiStore.closeProjectsModal()"
    />

    <TemplateSelector v-if="uiStore.showTemplateSelector" />
    <div v-if="uiStore.showStorageNotice" class="notice-overlay" @click.self="uiStore.closeStorageNotice()">
      <div class="notice">
        <h3>About Your Projects</h3>
        <p>Your projects are saved in your browser (IndexedDB/localStorage). They are not stored in the cloud.</p>
        <p>A browser reset or clearing site data will remove local projects. Consider exporting regularly.</p>
        <button class="header-button header-button--red" @click="uiStore.closeStorageNotice()">Got it</button>
      </div>
    </div>
    
    <div v-else class="zine-maker">
      <header class="app-header">
        <div class="header-left">
          <AppLogo />
          <div v-if="projectStore.currentProject" class="project-info">
            <span class="project-name">{{ projectStore.currentProject.name }}</span>
            <span class="template-info">{{ projectStore.currentProject.template.name }}</span>
          </div>
        </div>
        
        <div class="header-right">
          <button @click="toggleTheme" class="header-button icon-only" :title="`Switch to ${theme==='dark'?'Light':'Dark'} Theme`">
            <Sun v-if="theme==='dark'" :size="16" />
            <Moon v-else :size="16" />
          </button>
          <a href="https://github.com/virgilvox/zine-maker" target="_blank" rel="noopener noreferrer" class="header-button icon-only" title="GitHub Repository">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.162 19.492c.5.092.684-.216.684-.48 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.34-3.369-1.34-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.004.07 1.532 1.03 1.532 1.03.892 1.528 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.338-2.222-.253-4.556-1.111-4.556-4.944 0-1.091.39-1.984 1.029-2.682-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.57 9.57 0 0 1 2.5.336c1.909-1.294 2.748-1.025 2.748-1.025.545 1.378.202 2.397.1 2.65.64.698 1.028 1.591 1.028 2.682 0 3.842-2.337 4.688-4.566 4.937.359.309.679.92.679 1.854 0 1.338-.012 2.418-.012 2.747 0 .266.182.576.688.477A10 10 0 0 0 12 2z"/></svg>
          </a>
          <button @click="manualSave" class="header-button" :disabled="saving" title="Save project">
            <span v-if="saving">Saving…</span>
            <span v-else>Save</span>
          </button>
          <button @click="uiStore.showTemplateSelectorModal()" class="header-button header-button--red" title="New Project">
            <FilePlus :size="16" />
            <span>New Project</span>
          </button>
          <button @click="uiStore.openProjectsModal()" class="header-button" title="Projects">
            <FolderOpen :size="16" />
            <span>Projects</span>
          </button>
        </div>
      </header>

      <div class="app-main">
        <PageList v-if="uiStore.showPageList" class="sidebar" />
        <KonvaPageEditor class="editor" />
        <PropertiesPanel v-if="uiStore.showProperties" class="properties" @close="uiStore.toggleProperties()" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import TemplateSelector from '@/components/TemplateSelector.vue';
import AppLogo from '@/components/AppLogo.vue';
import KonvaPageEditor from '@/components/KonvaPageEditor.vue';
import PropertiesPanel from '@/components/properties/PropertiesPanel.vue';
import PageList from '@/components/PageList.vue';
import ImageUploadModal from '@/components/ImageUploadModal.vue';
import ExportModal from '@/components/ExportModal.vue';
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import { useToolsStore } from '@/stores/tools';
import { FilePlus, Sun, Moon, FolderOpen } from 'lucide-vue-next';
// @ts-ignore - Vue SFC type shim might be missing in this project setup
import ProjectsModal from '@/components/ProjectsModal.vue';
import { useAssetStore } from '@/stores/assetStore';
import { getLastOpenProjectId, loadProject } from '@/utils/persistence';

const projectStore = useProjectStore();
const uiStore = useUIStore();
const toolsStore = useToolsStore();
const assetStore = useAssetStore();

const theme = ref<'light'|'dark'>( (localStorage.getItem('theme') as any) || 'light');
function applyTheme() { document.documentElement.setAttribute('data-theme', theme.value); }
function toggleTheme(){ theme.value = theme.value==='dark' ? 'light' : 'dark'; localStorage.setItem('theme', theme.value); applyTheme(); }

const saving = ref(false);
async function manualSave() {
  saving.value = true;
  try {
    await projectStore.manualSave();
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  setupKeyboardShortcuts();
  await assetStore.initDB();
  applyTheme();
  
  // Attempt to load the last open project
  const lastProjectId = getLastOpenProjectId();
  if (lastProjectId) {
    const project = await loadProject(lastProjectId);
    if (project) {
      projectStore.loadProject(project);
      uiStore.hideTemplateSelector();
      // First-time storage notice
      if (!localStorage.getItem('zineMaker.storageNoticeShown')) {
        uiStore.openStorageNotice();
        localStorage.setItem('zineMaker.storageNoticeShown', '1');
      }
    }
  }
});

onUnmounted(() => {
  cleanupKeyboardShortcuts();
});

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', handleKeyDown);
}

function cleanupKeyboardShortcuts(): void {
  document.removeEventListener('keydown', handleKeyDown);
}

function handleKeyDown(event: KeyboardEvent): void {
  // Ignore if typing in input fields
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  // Tool shortcuts
  switch (event.key.toLowerCase()) {
    case 'v':
      toolsStore.setActiveTool('select');
      event.preventDefault();
      break;
    case 't':
      toolsStore.setActiveTool('text');
      event.preventDefault();
      break;
    case 'i':
      toolsStore.setActiveTool('image');
      event.preventDefault();
      break;
    case 's':
      toolsStore.setActiveTool('shape');
      event.preventDefault();
      break;
    case 'd':
      toolsStore.setActiveTool('draw');
      event.preventDefault();
      break;
    case 'h':
      toolsStore.setActiveTool('pan');
      event.preventDefault();
      break;
    case 'z':
      toolsStore.setActiveTool('zoom');
      event.preventDefault();
      break;
    case 'delete':
    case 'backspace':
      if (projectStore.selectedContentIds.length > 0) {
        projectStore.selectedContentIds.forEach(id => {
          projectStore.deleteContent(id);
        });
        event.preventDefault();
      }
      break;
  }

  // Undo/Redo shortcuts
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
    projectStore.undo();
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && (event.shiftKey && event.key.toLowerCase() === 'z')) {
    projectStore.redo();
    event.preventDefault();
    return;
  }

  // Page navigation
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'ArrowLeft':
        if (projectStore.currentPageIndex > 0) {
          projectStore.setCurrentPage(projectStore.currentPageIndex - 1);
        }
        event.preventDefault();
        break;
      case 'ArrowRight':
        if (projectStore.currentPageIndex < projectStore.pageCount - 1) {
          projectStore.setCurrentPage(projectStore.currentPageIndex + 1);
        }
        event.preventDefault();
        break;
    }
  }
}

async function addImageToCanvas(assetId: number) {
  const file = await assetStore.getAsset(assetId);
  if (!file) return;

  const src = URL.createObjectURL(file);
  const imageContent = {
    type: 'image' as const,
    x: 50,
    y: 50,
    width: 200,
    height: 150,
    rotation: 0,
    zIndex: Date.now(),
    properties: {
      src,
      alt: file.name,
      opacity: 1,
      assetId: assetId
    }
  };
  projectStore.addContentToCurrentPage(imageContent);
  toolsStore.setActiveTool('select');
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #1f2937;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.zine-maker {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: var(--panel);
  border-bottom: 1px solid var(--border-soft);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: 64px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-left h1 {
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-name {
  font-weight: 500;
  color: var(--ui-ink);
}

.template-info {
  font-size: 0.9rem;
  color: var(--ui-ink);
}

.header-right {
  display: flex;
  gap: 1rem;
}

.header-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-soft);
  background: var(--surface);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  color: var(--ui-ink);
}
.header-button.icon-only { padding: 0.5rem; }
.header-button--red { 
  background: var(--accent-red); 
  color: #fff; 
  border: 1.5px solid var(--border); 
  box-shadow: 2px 2px 0 #000;
  transform: translate(0,0);
}
.header-button--red:hover { 
  transform: translate(-1px,-1px); 
  box-shadow: 3px 3px 0 #000; 
}

.header-button--green {
  background: var(--accent-green);
  color: #000;
  border: 1.5px solid var(--border);
  box-shadow: 2px 2px 0 #000;
  transform: translate(0,0);
}
.header-button--green:hover {
  transform: translate(-1px,-1px);
  box-shadow: 3px 3px 0 #000;
}

.header-button:hover {
  background: var(--panel);
  border-color: var(--border);
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 64px);
}

.editor {
  flex: 1;
  min-width: 0; /* Allow flex item to shrink below content size */
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--surface);
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.properties {
  width: 280px;
  flex-shrink: 0;
}

.notice-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1200; }
.notice { background: var(--panel); border: 1.5px solid var(--border); border-radius: 12px; padding: 1.25rem; width: min(520px, 90vw); box-shadow: 4px 4px 0 #000; }
.notice h3 { margin: 0 0 .5rem 0; }
.notice p { margin: .25rem 0; color: var(--ui-ink); }
.notice button { margin-top: .75rem; }
</style>