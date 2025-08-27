<template>
  <div class="page-list" :class="{ collapsed: uiStore.pageListCollapsed }">
    <div class="page-list-header">
      <h3>Pages</h3>
      <span class="page-count">{{ projectStore.pageCount }} pages</span>
      <button class="collapse-button" @click="uiStore.togglePageListCollapsed()">{{ uiStore.pageListCollapsed ? '▸' : '▾' }}</button>
    </div>

    <div class="pages-grid">
      <div 
        v-for="(page, index) in projectStore.currentProject?.pages" 
        :key="page.id"
        class="page-item"
        :class="{ active: index === projectStore.currentPageIndex }"
        @click="projectStore.setCurrentPage(index)"
      >
        <div class="page-preview">
          <div class="page-number">{{ page.pageNumber }}</div>
          <div class="page-content-preview">
            <!-- Simple preview: draw a mini white page and shallow content bars -->
            <div class="mini-page">
              <div class="mini-content" v-for="(_, i) in page.content.slice(0,6)" :key="i" :style="{ width: (20 + (i%3)*20) + '%'}"></div>
            </div>
          </div>
        </div>
        <div class="page-info">
          <div class="page-title">{{ pageTitle(page) }}</div>
          <div class="page-stats">{{ page.content.length }} items</div>
        </div>
      </div>
    </div>

    <div class="page-actions">
      <div class="export-options">
        <label><input type="checkbox" v-model="uiStore.showPageNumbers" /> Page numbers</label>
        <label><input type="checkbox" v-model="uiStore.showFoldMarks" /> Fold marks</label>
        <label><input type="checkbox" v-model="uiStore.showCutMarks" /> Cut marks</label>
      </div>
      <button @click="exportZine" class="export-button export-button--green">Export Zine for Printing</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import { useAssetStore } from '@/stores/assetStore';
import { exportZineForTemplate } from '@/composables/useZineExport';

const projectStore = useProjectStore();
const uiStore = useUIStore();
const assetStore = useAssetStore();

function pageTitle(page: any): string {
  const tpl = projectStore.currentProject?.template;
  if (!tpl) return page.title;
  if (page.pageNumber === 1) return 'Front Cover';
  if (page.pageNumber === tpl.pageCount) return 'Back Cover';
  return page.title;
}

async function exportZine(): Promise<void> {
  if (!projectStore.currentProject) {
    console.error('No current project to export.');
    return;
  }
  try {
    const { images, pdfData, width, height } = await exportZineForTemplate(
      projectStore.currentProject,
      (id) => assetStore.getAsset(id),
      {
        showPageNumbers: uiStore.showPageNumbers,
        showFoldMarks: uiStore.showFoldMarks,
        showCutMarks: uiStore.showCutMarks,
        pixelRatio: 2,
      }
    );
    uiStore.exportImageWidth = width;
    uiStore.exportImageHeight = height;
    uiStore.exportImages = images;
    uiStore.exportImageData = images[0];
    uiStore.exportPdfData = pdfData;
    uiStore.showExportModal = true;

  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please check the console for details.');
  }
}

// generatePDF moved to composable
</script>

<style scoped>
.page-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.75rem;
  background: var(--panel);
  border-right: 1px solid var(--border-soft);
}
.page-list.collapsed { width: 40px; }
.page-list.collapsed .pages-grid, .page-list.collapsed .page-actions, .page-list.collapsed .page-count { display: none; }
.page-list.collapsed .page-list-header h3 { display: none; }

.page-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-soft);
}

.page-list-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ui-ink);
}

.page-count {
  color: var(--ui-ink);
  font-size: 0.8rem;
}
.collapse-button { border: none; background: transparent; color: var(--ui-ink); cursor: pointer; }

.pages-grid {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-right: -0.5rem;
  padding-right: 0.5rem;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.page-item.active {
  border-color: #000;
  box-shadow: 2px 2px 0 #000;
  background: #e7ffe7;
}

.page-preview {
  position: relative;
  width: 64px;
  height: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.page-content-preview {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
}
.mini-page { background: #fff; border: 1px solid var(--border-soft); width: 100%; height: 100%; position: relative; }
.mini-content { height: 3px; background: var(--border); margin: 2px; }

.page-info {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-stats {
  font-size: 0.75rem;
  color: #6b7280;
}

.page-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.export-options { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem; color: var(--ui-ink); }
.export-options label { display: inline-flex; gap: 0.35rem; align-items: center; font-size: 0.85rem; }

.export-button {
  width: 100%;
  padding: 0.6rem;
  background: var(--accent-green);
  color: #000;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
  transform: translate(0,0);
  transition: transform .04s, box-shadow .04s;
}

.export-button:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }
</style>
