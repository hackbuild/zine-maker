<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal" role="dialog" aria-labelledby="projectsTitle">
      <button class="close-button close-button--red" @click="close" aria-label="Close">×</button>
      <header class="modal-header">
        <h2 id="projectsTitle">Projects</h2>
      </header>
      <section class="modal-body">
        <div class="backup-bar">
          <button class="btn" @click="exportAll">Download All Projects</button>
          <button class="btn" @click="importInput?.click()">Upload All Projects</button>
          <input ref="importInput" type="file" accept="application/json" @change="importAll" style="display:none" />
          <button class="btn" @click="importOneInput?.click()">Upload Single Project</button>
          <input ref="importOneInput" type="file" accept="application/json" @change="importSingle" style="display:none" />
          <button class="btn" @click="toggleSamples">Browse Sample Zines</button>
          <button class="btn btn-danger" @click="openDeleteAll">Delete All</button>
        </div>

        <div v-if="showSamples" class="samples-grid">
          <div v-for="s in samples" :key="s.id" class="sample-card">
            <div class="sample-info">
              <div class="sample-name">{{ s.name }}</div>
              <div class="sample-desc">{{ s.description }}</div>
            </div>
            <div class="sample-actions">
              <button class="btn" @click="loadSample(s.id)">Create from Sample</button>
            </div>
          </div>
        </div>

        <ul class="projects-list">
          <li v-for="project in projects" :key="project.id" class="project-item">
            <div class="info">
              <div class="name">{{ project.name }}</div>
              <div class="meta">Updated {{ formatDate(project.modifiedAt) }}</div>
            </div>
            <div class="actions">
              <button class="btn" @click="downloadProject(project)" title="Download project">
                <Download :size="16" />
              </button>
              <button class="btn" @click="openProject(project.id)">Open</button>
              <button class="btn" @click="onRename(project)">Rename</button>
              <button class="btn btn-danger" @click="onDelete(project.id)">Delete</button>
            </div>
          </li>
        </ul>
        <div v-if="!projects.length" class="empty">No projects yet.</div>

        <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm=false">
          <div class="confirm-modal">
            <h3>Delete all projects</h3>
            <p>Type "delete" to confirm. This action cannot be undone.</p>
            <input class="confirm-input" v-model="confirmText" placeholder="delete" />
            <div class="confirm-actions">
              <button class="btn" @click="showConfirm=false">Cancel</button>
              <button class="btn btn-danger" :disabled="confirmText !== 'delete'" @click="confirmDeleteAll">Confirm</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import { getAllProjects, loadProject, deleteProject, renameProject, saveProject } from '@/utils/persistence';
import type { ZineProject } from '@/types';
import { Download } from 'lucide-vue-next';

const emit = defineEmits<{ (e: 'close'): void }>();
const uiStore = useUIStore();
const projectStore = useProjectStore();

const projects = ref<ZineProject[]>([]);
let onKey: ((e: KeyboardEvent) => void) | null = null;
const importInput = ref<HTMLInputElement | null>(null);
const importOneInput = ref<HTMLInputElement | null>(null);
const showSamples = ref(false);
const samples = ref<{ id: string; name: string; description: string; thumbnail: string }[]>([]);
const showConfirm = ref(false);
const confirmText = ref('');

function close() { emit('close'); }

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

async function refresh() {
  projects.value = await getAllProjects();
  // revive dates
  projects.value.forEach(p => (p.modifiedAt as any) = new Date(p.modifiedAt));
  projects.value.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
}

async function openProject(id: string) {
  const proj = await loadProject(id);
  if (proj) {
    projectStore.loadProject(proj);
    uiStore.hideTemplateSelector();
    close();
  }
}

async function onDelete(id: string) {
  if (!confirm('Delete this project? This cannot be undone.')) return;
  await deleteProject(id);
  await refresh();
}

async function onRename(project: ZineProject) {
  const name = prompt('New name', project.name);
  if (!name || !name.trim()) return;
  await renameProject(project.id, name.trim());
  await refresh();
}

async function exportAll() {
  const { exportAll } = await import('@/utils/portableBackup');
  const data = await exportAll();
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zine-maker-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importAll(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const { importAll } = await import('@/utils/portableBackup');
    await importAll(data);
    await refresh();
    alert('Imported successfully.');
  } catch (err) {
    console.error(err);
    alert('Import failed.');
  } finally {
    if (importInput.value) importInput.value.value = '';
  }
}

async function importSingle(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const { importProject } = await import('@/utils/portableBackup');
    await importProject(data);
    await refresh();
    alert('Project imported successfully.');
  } catch (err) {
    console.error(err);
    alert('Import failed.');
  } finally {
    if (importOneInput.value) importOneInput.value.value = '';
  }
}

async function downloadProject(project: ZineProject) {
  const { exportProjectById } = await import('@/utils/portableBackup');
  const data = await exportProjectById(project.id);
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-z0-9\-_.]+/gi,'_') || 'project'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function toggleSamples() { showSamples.value = !showSamples.value; }

async function loadSample(id: string) {
  const { createSample } = await import('@/utils/sampleZines');
  const project = createSample(id);
  if (!project) return;
  await saveProject(project);
  await refresh();
  // Immediately open it
  await openProject(project.id);
}

function openDeleteAll() { showConfirm.value = true; confirmText.value = ''; }
async function confirmDeleteAll() {
  if (confirmText.value !== 'delete') return;
  const { deleteAllProjects } = await import('@/utils/persistence');
  await deleteAllProjects();
  await refresh();
  showConfirm.value = false;
}

onMounted(() => {
  refresh();
  // lazy load sample list
  import('@/utils/sampleZines').then(({ getSamples }) => { samples.value = getSamples(); });
  onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  window.addEventListener('keydown', onKey);
});

onUnmounted(() => { if (onKey) window.removeEventListener('keydown', onKey); });
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2100; /* Above mobile panels */
}
.modal {
  background: var(--panel); width: 720px; max-width: 95vw; max-height: 85vh; overflow: auto; border-radius: 10px; border: 1.5px solid var(--border); position: relative; box-shadow: 4px 4px 0 #000;
}
.modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-soft); }
.modal-body { padding: 1rem 1.25rem; }
.close-button { position: absolute; right: 12px; top: 12px; background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--ui-ink); }
.close-button--red { background: var(--accent-red); color: #fff; width: 28px; height: 28px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid var(--border); box-shadow: 2px 2px 0 #000; }

.backup-bar { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
.samples-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem; }
.sample-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 8px; padding: 0.6rem 0.75rem; display: grid; grid-template-columns: 1fr auto; gap: 0.4rem; align-items: center; }
.sample-info { display: flex; flex-direction: column; gap: 0.2rem; }
.sample-name { font-weight: 600; }
.sample-desc { font-size: 0.85rem; opacity: 0.8; }
.sample-actions { display: flex; justify-content: flex-end; }
.projects-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.project-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: 8px; }
.project-item .info .name { font-weight: 600; color: var(--ui-ink); }
.project-item .info .meta { font-size: 0.8rem; color: #6b7280; }
.actions { display: flex; gap: 0.5rem; }
.btn { padding: 0.4rem 0.7rem; border: 1px solid var(--border); background: var(--panel); border-radius: 6px; cursor: pointer; }
.btn-danger { background: var(--accent-red); color: #fff; border: 1.5px solid var(--border); box-shadow: 2px 2px 0 #000; }
.empty { color: var(--ui-ink); opacity: 0.75; padding: 0.5rem; }

.confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2200; /* Above other modals */ }
.confirm-modal { background: var(--panel); border: 1.5px solid var(--border); box-shadow: 4px 4px 0 #000; border-radius: 10px; width: 420px; max-width: 95vw; padding: 1rem; }
.confirm-modal h3 { margin: 0 0 0.25rem 0; }
.confirm-input { width: 100%; padding: 0.5rem 0.6rem; border: 1px solid var(--border-soft); border-radius: 6px; background: var(--surface); color: var(--ui-ink); margin-top: 0.35rem; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem; }

/* Mobile responsive projects modal */
@media (max-width: 768px) {
  .modal {
    width: 95vw;
    max-height: 90vh;
    margin: 0 auto;
  }
  
  .modal-header {
    padding: 0.8rem;
  }
  
  .modal-body {
    padding: 0.8rem;
  }
  
  .backup-bar {
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  
  .backup-bar .btn {
    flex: 1 1 calc(50% - 0.2rem);
    min-width: 120px;
    padding: 0.5rem 0.4rem;
    font-size: 0.8rem;
  }
  
  .project-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .project-item .actions {
    justify-content: stretch;
    gap: 0.4rem;
  }
  
  .project-item .actions .btn {
    flex: 1;
    padding: 0.5rem 0.4rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .modal {
    width: 98vw;
    border-radius: 8px;
  }
  
  .backup-bar .btn {
    flex: 1 1 100%;
    margin-bottom: 0.3rem;
  }
  
  .samples-grid {
    grid-template-columns: 1fr;
  }
}
</style>
