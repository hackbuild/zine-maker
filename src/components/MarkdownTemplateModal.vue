<template>
  <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">×</button>
      
      <div class="modal-header">
        <h3>Start Your Zine</h3>
        <p>Choose a template, load an existing project, or upload JSON</p>
      </div>

      <div class="modal-tabs">
        <button 
          @click="activeTab = 'templates'" 
          :class="{ active: activeTab === 'templates' }"
          class="tab-button"
        >
          Templates
        </button>
        <button 
          @click="activeTab = 'projects'" 
          :class="{ active: activeTab === 'projects' }"
          class="tab-button"
        >
          Existing Projects
        </button>
        <button 
          @click="activeTab = 'upload'" 
          :class="{ active: activeTab === 'upload' }"
          class="tab-button"
        >
          Upload JSON
        </button>
      </div>

      <div class="modal-body">
        <!-- Templates Tab -->
        <div v-if="activeTab === 'templates'" class="templates-section">
          <div class="template-grid">
            <div 
              v-for="template in templates" 
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
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
              </div>
              <button 
                v-if="selectedTemplate?.id === template.id" 
                @click.stop="createFromTemplate"
                class="create-button"
              >
                Create Markdown
              </button>
            </div>
          </div>
        </div>

        <!-- Existing Projects Tab -->
        <div v-if="activeTab === 'projects'" class="projects-section">
          <div v-if="projects.length === 0" class="empty-state">
            <p>No projects found. Create your first project in the main editor!</p>
          </div>
          <div v-else class="projects-list">
            <div 
              v-for="project in projects" 
              :key="project.id"
              class="project-item"
              @click="loadProject(project)"
            >
              <div class="project-info">
                <h4>{{ project.name }}</h4>
                <p>{{ project.template.name }}</p>
                <span class="project-date">{{ formatDate(project.modifiedAt) }}</span>
              </div>
              <div class="project-stats">
                <span>{{ project.pages.length }} pages</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload JSON Tab -->
        <div v-if="activeTab === 'upload'" class="upload-section">
          <div class="upload-area">
            <div class="upload-option">
              <h4>Upload JSON File</h4>
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileUpload" 
                accept=".json"
                class="hidden-input"
              />
              <button @click="fileInput?.click()" class="upload-button">
                <Upload :size="16" />
                Choose JSON File
              </button>
            </div>
            
            <div class="upload-divider">or</div>
            
            <div class="upload-option">
              <h4>Paste JSON</h4>
              <textarea
                v-model="pastedJSON"
                class="json-paste-area"
                placeholder="Paste your Zine Maker project JSON here..."
              />
              <button 
                @click="loadFromPastedJSON" 
                :disabled="!pastedJSON.trim()"
                class="upload-button"
              >
                Load from JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Upload } from 'lucide-vue-next';
import { useTemplatesStore } from '@/stores/templates';
import { getAllProjects } from '@/utils/persistence';
import { isValidJSON, isValidZineProject } from '@/utils/markdownConverter';
import type { ZineTemplate, ZineProject } from '@/types';

interface Props {
  visible: boolean;
}

interface Emits {
  close: [];
  'load-template': [template: ZineTemplate];
  'load-project': [project: ZineProject];
  'load-json': [json: string];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const templatesStore = useTemplatesStore();
const activeTab = ref<'templates' | 'projects' | 'upload'>('templates');
const selectedTemplate = ref<ZineTemplate | null>(null);
const projects = ref<ZineProject[]>([]);
const pastedJSON = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const templates = templatesStore.templates;

onMounted(async () => {
  await loadProjects();
});

async function loadProjects() {
  try {
    projects.value = await getAllProjects();
    projects.value.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

function selectTemplate(template: ZineTemplate) {
  selectedTemplate.value = template;
}

function createFromTemplate() {
  if (!selectedTemplate.value) return;
  emit('load-template', selectedTemplate.value);
  emit('close');
}

function loadProject(project: ZineProject) {
  emit('load-project', project);
  emit('close');
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        loadJSONContent(content);
      }
    };
    reader.readAsText(file);
  }
}

function loadFromPastedJSON() {
  if (!pastedJSON.value.trim()) return;
  loadJSONContent(pastedJSON.value);
}

function loadJSONContent(jsonContent: string) {
  try {
    if (!isValidJSON(jsonContent)) {
      alert('Invalid JSON format');
      return;
    }

    const data = JSON.parse(jsonContent);
    if (!isValidZineProject(data)) {
      alert('Not a valid Zine Maker project');
      return;
    }

    emit('load-json', jsonContent);
    emit('close');
  } catch (error) {
    alert(`Failed to load JSON: ${error}`);
  }
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.modal-content {
  background: var(--panel);
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1.5px solid var(--border);
  box-shadow: 4px 4px 0 #000;
}

.close-button {
  position: absolute;
  top: 1rem; right: 1rem;
  background: var(--accent-red);
  color: #fff;
  border: 1.5px solid var(--border);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--ui-ink);
}

.modal-header p {
  margin: 0;
  color: #6b7280;
}

.modal-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-soft);
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--ui-ink);
}

.tab-button.active {
  color: var(--ui-ink);
  border-bottom-color: #3b82f6;
  font-weight: 500;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.template-card {
  border: 1.5px solid var(--border-soft);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--surface);
  position: relative;
}

.template-card:hover {
  border-color: var(--border);
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.template-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: var(--panel);
  border-radius: 4px;
}

.template-format {
  font-weight: bold;
  font-size: 0.8rem;
  color: #3b82f6;
}

.template-pages {
  font-size: 0.8rem;
  color: #6b7280;
}

.template-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--ui-ink);
}

.template-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.4;
}

.create-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: var(--accent-green);
  color: #000;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 2px 2px 0 #000;
}

.create-button:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #000;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--surface);
}

.project-item:hover {
  border-color: var(--border);
  background: var(--panel);
}

.project-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--ui-ink);
}

.project-info p {
  margin: 0 0 0.25rem 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.project-date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.project-stats {
  color: #6b7280;
  font-size: 0.85rem;
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.upload-option {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.upload-option h4 {
  margin: 0 0 1rem 0;
  color: var(--ui-ink);
}

.upload-button {
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
  margin: 0 auto;
}

.upload-button:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #000;
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-divider {
  color: #6b7280;
  font-style: italic;
  position: relative;
}

.upload-divider::before,
.upload-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 50px;
  height: 1px;
  background: var(--border-soft);
}

.upload-divider::before {
  right: 100%;
  margin-right: 1rem;
}

.upload-divider::after {
  left: 100%;
  margin-left: 1rem;
}

.json-paste-area {
  width: 100%;
  height: 200px;
  padding: 1rem;
  border: 2px dashed var(--border-soft);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ui-ink);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.json-paste-area:focus {
  outline: none;
  border-color: #3b82f6;
}

.hidden-input {
  display: none;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    padding: 1.5rem;
    max-height: 95vh;
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-tabs {
    justify-content: center;
  }
  
  .tab-button {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 98vw;
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.25rem;
  }
  
  .upload-area {
    gap: 1rem;
  }
}
</style>
