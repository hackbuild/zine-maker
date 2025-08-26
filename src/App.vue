<template>
  <div id="app">
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

    <TemplateSelector v-if="uiStore.showTemplateSelector" />
    
    <div v-else class="zine-maker">
      <header class="app-header">
        <div class="header-left">
          <h1>Zine Maker</h1>
          <div v-if="projectStore.currentProject" class="project-info">
            <span class="project-name">{{ projectStore.currentProject.name }}</span>
            <span class="template-info">{{ projectStore.currentProject.template.name }}</span>
          </div>
        </div>
        
        <div class="header-right">
          <button @click="uiStore.showTemplateSelectorModal()" class="header-button">
            <FilePlus :size="16" />
            <span>New Project</span>
          </button>
          <button @click="uiStore.togglePageList()" class="header-button">
            <PanelLeft :size="16" />
            <span>{{ uiStore.showPageList ? 'Hide' : 'Show' }} Pages</span>
          </button>
          <button @click="uiStore.toggleProperties()" class="header-button">
            <PanelRight :size="16" />
            <span>{{ uiStore.showProperties ? 'Hide' : 'Show' }} Properties</span>
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
import { onMounted, onUnmounted } from 'vue';
import TemplateSelector from '@/components/TemplateSelector.vue';
import KonvaPageEditor from '@/components/KonvaPageEditor.vue';
import PropertiesPanel from '@/components/properties/PropertiesPanel.vue';
import PageList from '@/components/PageList.vue';
import ImageUploadModal from '@/components/ImageUploadModal.vue';
import ExportModal from '@/components/ExportModal.vue';
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import { useToolsStore } from '@/stores/tools';
import { FilePlus, PanelLeft, PanelRight } from 'lucide-vue-next';
import { useAssetStore } from '@/stores/assetStore';
import { getLastOpenProjectId, loadProject } from '@/utils/persistence';

const projectStore = useProjectStore();
const uiStore = useUIStore();
const toolsStore = useToolsStore();
const assetStore = useAssetStore();

onMounted(async () => {
  setupKeyboardShortcuts();
  await assetStore.initDB();
  
  // Attempt to load the last open project
  const lastProjectId = getLastOpenProjectId();
  if (lastProjectId) {
    const project = await loadProject(lastProjectId);
    if (project) {
      projectStore.loadProject(project);
      uiStore.hideTemplateSelector();
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
  background: white;
  border-bottom: 1px solid #e5e7eb;
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
  color: #333;
}

.template-info {
  font-size: 0.9rem;
  color: #666;
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
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  color: #374151;
}

.header-button:hover {
  background: #f0f0f0;
  border-color: #999;
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
  background: #f1f5f9;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.properties {
  width: 280px;
  flex-shrink: 0;
}
</style>