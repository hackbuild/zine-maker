<template>
  <div class="markdown-editor-page">
    <!-- Export Modal -->
    <ExportModal 
      :visible="showExportModal"
      :image-src="uiStore.exportImageData"
      @close="closeExportModal"
    />
    
    <!-- Template/Project Selection Modal -->
    <MarkdownTemplateModal
      :visible="showTemplateModal"
      @close="showTemplateModal = false"
      @load-template="loadTemplate"
      @load-project="loadExistingProject"
      @load-json="loadJSONContent"
    />
    
    <header class="app-header">
      <div class="header-left">
        <AppLogo />
        <h1>Markdown to Zine Converter</h1>
      </div>
      <div class="header-right">
        <button @click="showTemplateModal = true" class="header-button">
          <FilePlus :size="16" />
          <span>New from Template</span>
        </button>
        <router-link to="/" class="header-button">
          <ArrowLeft :size="16" />
          <span>Back to Editor</span>
        </router-link>
        <button @click="saveAsProject" :disabled="!canSave" class="header-button header-button--green">
          <Save :size="16" />
          <span>Save as Project</span>
        </button>
        <button @click="exportZine" :disabled="!currentProject" class="header-button header-button--red">
          <Download :size="16" />
          <span>Export Zine</span>
        </button>
      </div>
    </header>

    <div class="editor-main">
      <div class="editor-panels">
        <!-- Markdown Editor -->
        <div class="editor-panel">
          <div class="panel-header">
            <div class="panel-header-top">
              <h3>Markdown Editor</h3>
              <div class="panel-actions">
                <button @click="clearMarkdown" class="small-button">Clear</button>
                <button @click="loadSample" class="small-button">Load Sample</button>
              </div>
            </div>
            <div class="panel-info">
              <small>💡 Markdown → JSON creates zine projects with text, images, and basic formatting. Use JSON for advanced layouts.</small>
            </div>
          </div>
          <textarea
            v-model="markdownText"
            @input="onMarkdownInput"
            class="markdown-textarea"
            placeholder="# My Zine Title

**Author:** Your Name
**Description:** A brief description
**Template:** quarter-fold-letter

---

## Page 1: Front Cover

Welcome to my zine! This is the front cover.

## Page 2: Content

This is the main content of my zine..."
          />
        </div>

        <!-- Markdown Preview -->
        <div class="editor-panel">
          <div class="panel-header">
            <div class="panel-header-top">
              <h3>Markdown Preview</h3>
              <div class="panel-actions">
                <button @click="refreshPreview" class="small-button">Refresh</button>
              </div>
            </div>
          </div>
          <div class="markdown-preview" v-html="markdownHtml"></div>
        </div>

        <!-- JSON Editor -->
        <div class="editor-panel">
          <div class="panel-header">
            <div class="panel-header-top">
              <h3>Project JSON</h3>
              <div class="panel-actions">
                <button @click="copyJSON" class="small-button">Copy</button>
                <button @click="downloadJSON" class="small-button">Download</button>
              </div>
            </div>
          </div>
          <textarea
            v-model="projectJSON"
            @input="onJSONInput"
            class="json-textarea"
            placeholder="Paste Zine Maker project JSON here..."
          />
        </div>
      </div>

              <!-- Zine Preview -->
        <div class="zine-preview-panel">
          <div class="panel-header">
            <h3>Zine Preview</h3>
            <div class="panel-actions">
              <button @click="fitZinePreview" class="small-button" :disabled="!currentProject">Fit</button>
            </div>
          </div>
          <div class="zine-preview-container">
            <div v-if="currentProject" class="zine-pages">
              <div class="project-info">
                <h4>{{ currentProject.name }}</h4>
                <p>{{ currentProject.template.name }}</p>
                <p>{{ currentProject.pages.length }} pages</p>
              </div>
              <div 
                v-for="(page, index) in currentProject.pages" 
                :key="page.id"
                class="zine-page-preview"
                @click="selectPage(index)"
                :class="{ active: selectedPageIndex === index }"
              >
                <div class="page-header">
                  <span class="page-number">{{ page.pageNumber }}</span>
                  <span class="page-title">{{ page.title }}</span>
                </div>
                <div class="page-content-summary">
                  {{ getPageSummary(page) }}
                </div>
                <div class="page-stats">
                  {{ page.content.length }} elements
                </div>
              </div>
            </div>
            <div v-else class="empty-preview">
              <p>No project loaded</p>
              <button @click="showTemplateModal = true" class="start-button">
                <FilePlus :size="16" />
                Start New Zine
              </button>
            </div>
          </div>
        </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-left">
        <span v-if="lastError" class="error-text">{{ lastError }}</span>
        <span v-else-if="currentProject" class="success-text">
          ✓ Valid project - {{ currentProject.pages.length }} pages
        </span>
        <span v-else class="info-text">Enter markdown or JSON to begin</span>
      </div>
      <div class="status-right">
        <span class="word-count">{{ wordCount }} words</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLogo from '@/components/AppLogo.vue';
import ExportModal from '@/components/ExportModal.vue';
import MarkdownTemplateModal from '@/components/MarkdownTemplateModal.vue';
import { ArrowLeft, Save, Download, FilePlus } from 'lucide-vue-next';
import { markdownToProject, projectToMarkdown, isValidJSON, isValidZineProject } from '@/utils/markdownConverter';
import { getMarkdownTemplate, getTemplateMarkdownExamples } from '@/utils/markdownTemplates';
import { saveProject } from '@/utils/persistence';
import { exportZineForTemplate } from '@/composables/useZineExport';
import { useAssetStore } from '@/stores/assetStore';
import { useUIStore } from '@/stores/ui';
import type { ZineProject } from '@/types';


const assetStore = useAssetStore();
const uiStore = useUIStore();

const markdownText = ref('');
const projectJSON = ref('');
// Prevent feedback loops during auto-sync
const syncSource = ref<'md' | 'json' | null>(null);
const currentProject = ref<ZineProject | null>(null);
const selectedPageIndex = ref(0);
const lastError = ref('');
// Manual conversion only; no circular watchers, so we don't need update flags
const showExportModal = ref(false);
const showTemplateModal = ref(false);

// Computed properties
const markdownHtml = computed(() => {
  // Enhanced markdown to HTML conversion with image support
  let html = markdownText.value
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle images with proper rendering
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 0.5rem 0;" />')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.*)/, '<p>$1')
    .replace(/(.*$)/, '$1</p>')
    .replace(/<p><\/p>/g, '');
    
  return html;
});

const canSave = computed(() => {
  return currentProject.value !== null && !lastError.value;
});

const wordCount = computed(() => {
  return markdownText.value.split(/\s+/).filter(word => word.length > 0).length;
});

// Note: we rely on explicit @input handlers for bi-directional sync to avoid watcher recursion

function onMarkdownChange() {
  lastError.value = '';
  
  if (!markdownText.value.trim()) {
    currentProject.value = null;
    projectJSON.value = '';
    return;
  }

  try {
    const project = markdownToProject(markdownText.value);
    if (project) {
      currentProject.value = project;
      projectJSON.value = JSON.stringify({ project, assets: [] }, null, 2);
    } else {
      lastError.value = 'Failed to parse markdown';
    }
  } catch (error) {
    lastError.value = `Markdown error: ${error}`;
  }
}

function onJSONChange() {
  lastError.value = '';
  
  if (!projectJSON.value.trim()) {
    currentProject.value = null;
    markdownText.value = '';
    return;
  }

  try {
    if (!isValidJSON(projectJSON.value)) {
      lastError.value = 'Invalid JSON format';
      return;
    }

    const data = JSON.parse(projectJSON.value);
    if (!isValidZineProject(data)) {
      lastError.value = 'Not a valid Zine Maker project';
      return;
    }

    // Handle both wrapped and unwrapped project formats
    const project = data.project || data;
    currentProject.value = project;
    
    markdownText.value = projectToMarkdown(project);
  } catch (error) {
    lastError.value = `JSON error: ${error}`;
  }
}

function clearMarkdown() {
  markdownText.value = '';
  projectJSON.value = '';
  currentProject.value = null;
  lastError.value = '';
}

function convertMarkdownToJSON() {
  // Only convert if it's actually markdown, not JSON
  if (markdownText.value.trim().startsWith('{')) {
    lastError.value = 'This appears to be JSON, not markdown. Use the JSON panel instead.';
    return;
  }
  onMarkdownChange();
}

function convertJSONToMarkdown() {
  onJSONChange();
}

function loadSample() {
  markdownText.value = `# OPSEC Field Guide

**Author:** Sample Author
**Description:** Pocket-size digital safety guide for activists & organizers
**Template:** quarter-fold-letter

---

## Front Cover

OPSEC Field Guide

Pocket zine for activists & organizers

Version 1.0 · Copy, remix, share

## Threat Model

**Threat Model Quickstart**

Ask:
• Who could realistically target me/us?
• What do they want? (data, access, identities)
• What happens if they succeed? (harm level)
• How likely is it?
• What controls reduce risk now?

Write answers. Revisit monthly or after incidents.

## Phone & Device Hygiene

• Keep OS/apps updated; uninstall unused apps.
• Use strong screen lock (PIN/phrase). Disable biometrics where compelled unlock is a risk.
• Separate roles: personal vs organizing devices/accounts.
• Backups: encrypted, tested restores.
• Consider hardened Android (e.g., GrapheneOS on Pixel) if feasible.`;
}

async function saveAsProject() {
  if (!currentProject.value) return;
  
  try {
    await saveProject(currentProject.value);
    alert('Project saved successfully!');
  } catch (error) {
    alert(`Failed to save project: ${error}`);
  }
}

async function exportZine() {
  if (!currentProject.value) return;
  
  try {
    const { images, pdfData, width, height } = await exportZineForTemplate(
      currentProject.value,
      (id) => assetStore.getAsset(id),
      {
        showPageNumbers: true,
        showFoldMarks: true,
        showCutMarks: true,
        pixelRatio: 2,
      }
    );
    
    // Set export data in UI store and show modal
    uiStore.exportImages = images;
    uiStore.exportImageData = images[0];
    uiStore.exportPdfData = pdfData;
    uiStore.exportImageWidth = width;
    uiStore.exportImageHeight = height;
    showExportModal.value = true;
  } catch (error) {
    alert(`Export failed: ${error}`);
  }
}

function refreshPreview() {
  // Force refresh of markdown preview
  const current = markdownText.value;
  markdownText.value = '';
  setTimeout(() => {
    markdownText.value = current;
  }, 0);
}

function selectPage(index: number) {
  selectedPageIndex.value = index;
}

function getPageSummary(page: any): string {
  const textContent = page.content
    .filter((c: any) => c.type === 'text')
    .map((c: any) => c.properties.text)
    .join(' ');
  return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
}

// Explicit input handlers to guarantee paste/typing triggers conversion immediately
function onMarkdownInput() {
  // v-model already set markdownText; trigger our watcher-like conversion deterministically
  if (syncSource.value === 'json') return;
  syncSource.value = 'md';
  try {
    if (!markdownText.value.trim()) {
      currentProject.value = null;
      projectJSON.value = '';
      return;
    }
    const project = markdownToProject(markdownText.value);
    if (project) {
      currentProject.value = project;
      projectJSON.value = JSON.stringify({ project, assets: [] }, null, 2);
      lastError.value = '';
    }
  } finally {
    syncSource.value = null;
  }
}

function onJSONInput() {
  if (syncSource.value === 'md') return;
  syncSource.value = 'json';
  try {
    if (!projectJSON.value.trim()) {
      currentProject.value = null;
      markdownText.value = '';
      return;
    }
    if (!isValidJSON(projectJSON.value)) return;
    const data = JSON.parse(projectJSON.value);
    if (!isValidZineProject(data)) return;
    const project = data.project || data;
    currentProject.value = project;
    markdownText.value = projectToMarkdown(project);
    lastError.value = '';
  } finally {
    syncSource.value = null;
  }
}
function copyJSON() {
  navigator.clipboard.writeText(projectJSON.value);
  alert('JSON copied to clipboard!');
}

function downloadJSON() {
  if (!projectJSON.value) return;
  
  const blob = new Blob([projectJSON.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentProject.value?.name || 'project'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function closeExportModal() {
  showExportModal.value = false;
}

function loadTemplate(template: any) {
  const examples = getTemplateMarkdownExamples();
  // Fallbacks: support legacy ids mapped to current ones
  const legacyKey = template.id === 'booklet-half-letter-20' ? 'booklet-half-letter-20' : template.id;
  const markdown = examples[legacyKey] || getMarkdownTemplate(template);
  markdownText.value = markdown;
  convertMarkdownToJSON();
}

function loadExistingProject(project: ZineProject) {
  currentProject.value = project;
  projectJSON.value = JSON.stringify({ project, assets: [] }, null, 2);
  convertJSONToMarkdown();
}

function loadJSONContent(jsonContent: string) {
  projectJSON.value = jsonContent;
  convertJSONToMarkdown();
}

function fitZinePreview() {
  // Placeholder for fit functionality
  console.log('Fit zine preview');
}

onMounted(async () => {
  await assetStore.initDB();
});
</script>

<style scoped>
.markdown-editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface);
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
  gap: 12px;
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

.header-right {
  display: flex;
  gap: 1rem;
  align-items: center;
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
  text-decoration: none;
}

.header-button--red { 
  background: var(--accent-red); 
  color: #fff; 
  border: 1.5px solid var(--border); 
  box-shadow: 2px 2px 0 #000;
}

.header-button--green {
  background: var(--accent-green);
  color: #000;
  border: 1.5px solid var(--border);
  box-shadow: 2px 2px 0 #000;
}

.header-button:hover {
  background: var(--panel);
  border-color: var(--border);
}

.header-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-panels {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: var(--border-soft);
}

.editor-panel {
  background: var(--panel);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border-soft);
}

.panel-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ui-ink);
}

.panel-actions {
  display: flex;
  gap: 0.5rem;
}

.small-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-soft);
  background: var(--panel);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--ui-ink);
}

.small-button:hover {
  background: var(--surface);
}

.panel-info {
  padding: 0.5rem 1rem;
  background: #dbeafe;
  border-top: 1px solid #3b82f6;
  color: #1e40af;
  font-size: 0.75rem;
  line-height: 1.3;
}

.markdown-textarea,
.json-textarea {
  flex: 1;
  padding: 1rem;
  border: none;
  background: var(--panel);
  color: var(--ui-ink);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.markdown-preview {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: var(--panel);
  color: var(--ui-ink);
  line-height: 1.6;
}

.markdown-preview h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--ui-ink);
}

.markdown-preview h2 {
  font-size: 1.25rem;
  margin: 1.5rem 0 0.75rem 0;
  color: var(--ui-ink);
}

.markdown-preview h3 {
  font-size: 1.1rem;
  margin: 1rem 0 0.5rem 0;
  color: var(--ui-ink);
}

.markdown-preview p {
  margin-bottom: 1rem;
}

.markdown-preview strong {
  font-weight: 600;
}

.zine-preview-panel {
  width: 300px;
  background: var(--panel);
  border-left: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
}

.zine-preview-container {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.zine-pages {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.zine-page-preview {
  padding: 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zine-page-preview:hover {
  border-color: var(--border);
  background: var(--surface);
}

.zine-page-preview.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.page-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.page-title {
  font-weight: 500;
  color: var(--ui-ink);
  margin-bottom: 0.5rem;
}

.project-info {
  padding: 1rem;
  border-bottom: 1px solid var(--border-soft);
  margin-bottom: 0.5rem;
}

.project-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--ui-ink);
  font-size: 1rem;
}

.project-info p {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.page-content-summary {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.page-stats {
  font-size: 0.7rem;
  color: #9ca3af;
}

.empty-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #6b7280;
  font-style: italic;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-green);
  color: #000;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 2px 2px 0 #000;
  transition: all 0.2s ease;
}

.start-button:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #000;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--surface);
  border-top: 1px solid var(--border-soft);
  font-size: 0.8rem;
}

.error-text {
  color: #dc2626;
}

.success-text {
  color: #059669;
}

.info-text {
  color: #6b7280;
}

.word-count {
  color: #6b7280;
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .editor-panels {
    grid-template-columns: 1fr 1fr;
  }
  
  .zine-preview-panel {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .editor-panels {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  
  .zine-preview-panel {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border-soft);
  }
  
  .app-header {
    padding: 0.5rem;
    flex-wrap: wrap;
    height: auto;
  }
  
  .header-left h1 {
    font-size: 1rem;
  }
  
  .header-right {
    gap: 0.5rem;
  }
  
  .header-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .header-right {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .header-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}
</style>
