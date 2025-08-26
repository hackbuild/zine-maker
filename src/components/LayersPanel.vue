<template>
  <div class="layers-panel">
    <div class="header">
      <h3>Layers</h3>
      <div class="actions">
        <button class="small" @click="groupSelected" :disabled="projectStore.selectedContentIds.length < 2">Group</button>
        <button class="small" @click="ungroupSelected" :disabled="projectStore.selectedContentIds.length === 0">Ungroup</button>
      </div>
    </div>

    <ul class="layer-list">
      <li v-for="layer in layers" :key="layer.id"
          class="layer-item"
          :class="{ selected: isSelected(layer.id), locked: !!layer.locked }"
          draggable="true"
          @dragstart="onDragStart(layer.id)"
          @dragover.prevent
          @drop="onDrop(layer.id)"
          @click="onClickLayer(layer.id, $event)">
        <div class="left">
          <button class="icon" @click.stop="toggleVisible(layer)" :title="layer.visible === false ? 'Show' : 'Hide'">
            <EyeOff v-if="layer.visible === false" :size="16" />
            <Eye v-else :size="16" />
          </button>
          <button class="icon" @click.stop="toggleLocked(layer)" :title="layer.locked ? 'Unlock' : 'Lock'">
            <Unlock v-if="layer.locked" :size="16" />
            <Lock v-else :size="16" />
          </button>
        </div>
        <div class="name">{{ layer.name || defaultName(layer) }}</div>
        <div class="right">
          <span class="type">{{ layer.type }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProjectStore } from '@/stores/project';
import type { ZineContent } from '@/types';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-vue-next';

const projectStore = useProjectStore();

const layers = computed<ZineContent[]>(() => {
  const content = projectStore.currentPage?.content || [];
  // From back to front by zIndex
  return [...content].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
});

function defaultName(layer: ZineContent): string {
  return `${layer.type} ${layer.id.slice(-4)}`;
}

function isSelected(id: string): boolean {
  return projectStore.selectedContentIds.includes(id);
}

function onClickLayer(id: string, e: MouseEvent) {
  projectStore.selectContent(id, e.shiftKey);
}

function toggleVisible(layer: ZineContent) {
  projectStore.updateContent(layer.id, { visible: layer.visible === false ? true : false });
}

function toggleLocked(layer: ZineContent) {
  projectStore.updateContent(layer.id, { locked: !layer.locked });
}

const draggingId = ref<string | null>(null);
function onDragStart(id: string) {
  draggingId.value = id;
}

function onDrop(targetId: string) {
  const from = draggingId.value;
  draggingId.value = null;
  if (!from || from === targetId) return;
  const ordered = layers.value.map(l => l.id);
  const fromIdx = ordered.indexOf(from);
  const toIdx = ordered.indexOf(targetId);
  if (fromIdx === -1 || toIdx === -1) return;
  ordered.splice(fromIdx, 1);
  ordered.splice(toIdx, 0, from);
  projectStore.reorderContent(ordered);
}

function groupSelected() {
  projectStore.groupSelected();
}

function ungroupSelected() {
  projectStore.ungroupSelected();
}
</script>

<style scoped>
.layers-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header h3 {
  margin: 0;
  font-size: 1rem;
}
.actions { display: flex; gap: 0.5rem; }
.small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }

.layer-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.layer-item {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem;
  border: 1px solid #e5e7eb; border-radius: 4px; background: #fff; cursor: grab;
}
.layer-item.selected { outline: 2px solid #3b82f6; }
.layer-item.locked { opacity: 0.7; }
.left { display: flex; gap: 0.25rem; }
.right { color: #9ca3af; font-size: 0.75rem; }
.name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon { border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 4px; padding: 0.1rem 0.3rem; cursor: pointer; }
.icon:hover { background: #eef2ff; }
</style>

