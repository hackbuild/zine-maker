<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal" role="dialog" aria-labelledby="projectsTitle">
      <button class="close-button close-button--red" @click="close" aria-label="Close">×</button>
      <header class="modal-header">
        <h2 id="projectsTitle">Projects</h2>
      </header>
      <section class="modal-body">
        <ul class="projects-list">
          <li v-for="project in projects" :key="project.id" class="project-item">
            <div class="info">
              <div class="name">{{ project.name }}</div>
              <div class="meta">Updated {{ formatDate(project.modifiedAt) }}</div>
            </div>
            <div class="actions">
              <button class="btn" @click="openProject(project.id)">Open</button>
              <button class="btn" @click="onRename(project)">Rename</button>
              <button class="btn btn-danger" @click="onDelete(project.id)">Delete</button>
            </div>
          </li>
        </ul>
        <div v-if="!projects.length" class="empty">No projects yet.</div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import { getAllProjects, loadProject, deleteProject, renameProject } from '@/utils/persistence';
import type { ZineProject } from '@/types';

const emit = defineEmits<{ (e: 'close'): void }>();
const uiStore = useUIStore();
const projectStore = useProjectStore();

const projects = ref<ZineProject[]>([]);

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

onMounted(() => {
  refresh();
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  window.addEventListener('keydown', onKey);
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1100;
}
.modal {
  background: var(--panel); width: 720px; max-width: 95vw; max-height: 85vh; overflow: auto; border-radius: 10px; border: 1.5px solid var(--border); position: relative; box-shadow: 4px 4px 0 #000;
}
.modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-soft); }
.modal-body { padding: 1rem 1.25rem; }
.close-button { position: absolute; right: 12px; top: 12px; background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--ui-ink); }
.close-button--red { background: var(--accent-red); color: #fff; width: 28px; height: 28px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid var(--border); box-shadow: 2px 2px 0 #000; }

.projects-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.project-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: 8px; }
.project-item .info .name { font-weight: 600; color: var(--ui-ink); }
.project-item .info .meta { font-size: 0.8rem; color: #6b7280; }
.actions { display: flex; gap: 0.5rem; }
.btn { padding: 0.4rem 0.7rem; border: 1px solid var(--border); background: var(--panel); border-radius: 6px; cursor: pointer; }
.btn-danger { background: var(--accent-red); color: #fff; border: 1.5px solid var(--border); box-shadow: 2px 2px 0 #000; }
.empty { color: var(--ui-ink); opacity: 0.75; padding: 0.5rem; }
</style>
