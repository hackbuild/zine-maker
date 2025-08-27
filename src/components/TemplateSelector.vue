<template>
  <div class="template-selector-overlay" @keydown.esc.prevent="uiStore.hideTemplateSelector()" tabindex="-1">
    <div class="template-selector" role="dialog" aria-labelledby="templateSelectorTitle">
      <button class="close-button close-button--red" @click="uiStore.hideTemplateSelector()" aria-label="Close">×</button>
      <div class="template-header">
        <h2 id="templateSelectorTitle">Choose a Zine Template</h2>
        <p>Select a template and name your project.</p>
      </div>

      <div class="main-content">
        <div class="recent-projects" v-if="recentProjects.length > 0">
          <h4>Recent Projects</h4>
          <ul>
            <li v-for="project in recentProjects" :key="project.id" @click="openProject(project)">
              <span class="project-name">{{ project.name }}</span>
              <span class="project-date">{{ formatDate(project.modifiedAt) }}</span>
            </li>
          </ul>
        </div>

        <div class="templates-column">
          <label for="projectName" class="field-label">Project name</label>
          <input id="projectName" class="project-name-input" v-model="projectName" placeholder="e.g. My Zine" />

          <div class="template-grid">
            <div 
              v-for="template in templatesStore.templates" 
              :key="template.id"
              class="template-card"
              :class="{ selected: selectedTemplate?.id === template.id }"
              @click="selectTemplate(template)"
            >
              <div class="template-preview">
                <div class="template-format">{{ template.format.replace('-', ' ').toUpperCase() }}</div>
                <div class="template-pages">{{ template.pageCount }} pages</div>
              </div>
              <div class="template-info">
                <h3>{{ template.name }}</h3>
                <p>{{ template.description }}</p>
                <div class="template-details">
                  <span class="detail">{{ template.pageSize.toUpperCase() }}</span>
                  <span class="detail">{{ template.orientation }}</span>
                </div>
              </div>
              <button v-if="selectedTemplate?.id === template.id" :disabled="!projectName.trim()" class="create-inline" @click.stop="createProject">Create</button>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useTemplatesStore } from '@/stores/templates';
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import type { ZineTemplate, ZineProject } from '@/types';
import { getAllProjects } from '@/utils/persistence';

const templatesStore = useTemplatesStore();
const projectStore = useProjectStore();
const uiStore = useUIStore();

const selectedTemplate = ref<ZineTemplate | null>(null);
const projectName = ref('My Zine');
const recentProjects = ref<ZineProject[]>([]);

onMounted(async () => {
  recentProjects.value = await getAllProjects();
  // Sort by most recently modified
  recentProjects.value.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') uiStore.hideTemplateSelector(); };
  window.addEventListener('keydown', onKey);
  // cleanup
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
});

function selectTemplate(template: ZineTemplate): void {
  selectedTemplate.value = template;
  templatesStore.selectTemplate(template);
}

function createProject(): void {
  if (selectedTemplate.value && projectName.value.trim()) {
    projectStore.createNewProject(projectName.value.trim(), selectedTemplate.value);
    uiStore.hideTemplateSelector();
  }
}

function openProject(project: ZineProject) {
  projectStore.loadProject(project);
  uiStore.hideTemplateSelector();
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
</script>

<style scoped>
.template-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.template-selector {
  background: var(--panel);
  border-radius: 8px;
  padding: 2rem;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
}
.close-button { position: absolute; right: 16px; top: 16px; background: transparent; border: none; font-size: 24px; cursor: pointer; color: var(--ui-ink); }
.close-button--red { background: var(--accent-red); color: #fff; width: 28px; height: 28px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid var(--border); box-shadow: 2px 2px 0 #000; }

.template-header {
  text-align: center;
  margin-bottom: 2rem;
}

.template-header h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.template-header p {
  margin: 0;
  color: #666;
}

.main-content {
  display: flex;
  gap: 2rem;
}

.recent-projects {
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-soft);
  padding-right: 2rem;
}

.recent-projects h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #374151;
}

.recent-projects ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-projects li {
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  justify-content: space-between;
}

.recent-projects li:hover {
  background: #f3f4f6;
}

.recent-projects .project-name {
  font-weight: 500;
}

.recent-projects .project-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.template-card {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: transform .06s, box-shadow .06s;
  background: var(--panel);
  box-shadow: 2px 2px 0 #000;
  position: relative;
}

.template-card:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }
.template-card.selected { outline: 3px solid #00ff7b; }
.create-inline { position: absolute; right: 10px; bottom: 10px; padding: 6px 10px; background: var(--accent-green); color: #000; border: 1.5px solid var(--border); border-radius: 6px; box-shadow: 2px 2px 0 #000; cursor: pointer; }

.template-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: var(--surface);
  border-radius: 4px;
}

.template-format {
  font-weight: bold;
  font-size: 0.9rem;
  color: #007bff;
}

.template-pages {
  font-size: 0.9rem;
  color: #666;
}

.template-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.template-info p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.template-details {
  display: flex;
  gap: 1rem;
}

.detail {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #495057;
}

.template-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.project-name-input {
  padding: 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: 4px;
  font-size: 1rem;
  flex: 1;
  max-width: 300px;
}

.project-name-input.top { max-width: none; width: 100%; margin-bottom: 1rem; }

.create-button {
  padding: 0.75rem 2rem;
  background: var(--accent-green);
  color: #000;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform .04s, box-shadow .04s;
  box-shadow: 2px 2px 0 #000;
}

.create-button:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }

.create-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.templates-column { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.field-label { font-size: 0.85rem; color: var(--ui-ink); }
</style>
