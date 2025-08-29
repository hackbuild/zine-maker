<template>
  <div class="properties-panel" :class="{ collapsed: uiStore.propertiesCollapsed }">
    <div class="properties-header">
      <div class="tabs">
        <button :class="['tab', activeTab === 'properties' && 'active']" @click="activeTab = 'properties'">Properties</button>
        <button :class="['tab', activeTab === 'layers' && 'active']" @click="activeTab = 'layers'">Layers</button>
      </div>
      <button class="collapse-button" @click="uiStore.togglePropertiesCollapsed()">
        <ChevronRight v-if="uiStore.propertiesCollapsed" :size="20" />
        <ChevronDown v-else :size="20" />
      </button>
    </div>

    <div class="properties-content" v-show="!uiStore.propertiesCollapsed">
      <template v-if="activeTab === 'layers'">
        <LayersPanel />
      </template>
      <template v-else>
        <div v-if="!hasSelection" class="no-selection">
          <p>Select an element to edit its properties</p>
        </div>

        <div v-else-if="selectedContent.length === 1" class="single-selection">
          <TextProperties 
            v-if="selectedContent[0].type === 'text'"
            :content="selectedContent[0]"
            @update="updateContent"
          />
          <ImageProperties 
            v-else-if="selectedContent[0].type === 'image'"
            :content="selectedContent[0]"
            @update="updateContent"
          />
          <ShapeProperties 
            v-else-if="selectedContent[0].type === 'shape'"
            :content="selectedContent[0]"
            @update="updateContent"
          />
          <DrawingProperties 
            v-else-if="selectedContent[0].type === 'drawing'"
            :content="selectedContent[0]"
            @update="updateContent"
          />
        </div>

        <div v-else class="multi-selection">
          <MultiSelectionProperties 
            :content="selectedContent"
            @update="updateMultipleContent"
          />
        </div>

        <!-- Common transform properties for all selections -->
        <TransformProperties 
          v-if="hasSelection"
          :content="selectedContent"
          @update="updateTransform"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import { ChevronRight, ChevronDown } from 'lucide-vue-next';
import LayersPanel from '@/components/LayersPanel.vue';
import TextProperties from './TextProperties.vue';
import ImageProperties from './ImageProperties.vue';
import ShapeProperties from './ShapeProperties.vue';
import DrawingProperties from './DrawingProperties.vue';
import MultiSelectionProperties from './MultiSelectionProperties.vue';
import TransformProperties from './TransformProperties.vue';
import type { ZineContent } from '@/types';

defineEmits<{
  close: [];
}>();

const projectStore = useProjectStore();
const uiStore = useUIStore();
const activeTab = ref<'properties' | 'layers'>('properties');

const hasSelection = computed(() => projectStore.selectedContentIds.length > 0);

const selectedContent = computed(() => {
  return projectStore.selectedContentIds
    .map(id => projectStore.getContentById(id))
    .filter(Boolean) as ZineContent[];
});

function updateContent(contentId: string, updates: Partial<ZineContent>) {
  projectStore.updateContent(contentId, updates);
}

function updateMultipleContent(updates: Partial<ZineContent>) {
  projectStore.selectedContentIds.forEach(id => {
    projectStore.updateContent(id, updates);
  });
}

function updateTransform(contentId: string, updates: Partial<ZineContent>) {
  if (contentId === 'multi') {
    updateMultipleContent(updates);
  } else {
    updateContent(contentId, updates);
  }
}
</script>

<style scoped>
.properties-panel {
  width: 280px;
  background: var(--panel);
  border-left: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  height: 100%;
}
.properties-panel.collapsed { width: 40px; }
.properties-panel.collapsed .properties-content { display: none; }
.properties-panel.collapsed .tabs { display: none; }

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface);
}

.tabs { display: flex; gap: 6px; }
.tab {
  padding: 6px 10px;
  border: 1px solid var(--border-soft);
  background: var(--panel);
  border-radius: 6px;
  cursor: pointer;
}
.tab.active { border-color: var(--border); box-shadow: 1px 1px 0 #000; }
.collapse-button { 
  border: none; 
  background: transparent; 
  color: var(--ui-ink); 
  cursor: pointer; 
  padding: 0.4rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.collapse-button:hover {
  background: var(--surface);
}

.properties-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ui-ink);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--ui-ink);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--ink);
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.no-selection {
  text-align: center;
  color: var(--ui-ink);
  padding: 2rem 1rem;
}

.no-selection p {
  margin: 0;
  font-size: 0.9rem;
}

/* Mobile responsive properties panel */
@media (max-width: 768px) {
  .properties-panel {
    /* Improve touch scrolling */
    -webkit-overflow-scrolling: touch;
  }
  
  .properties-header {
    padding: 0.8rem;
  }
  
  .tab {
    padding: 8px 12px;
    font-size: 0.85rem;
    /* Larger touch target */
    min-height: 40px;
  }
  
  .properties-content {
    padding: 0.8rem;
  }
  
  .collapse-button {
    min-width: 36px;
    min-height: 36px;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .properties-header {
    padding: 0.6rem;
  }
  
  .tab {
    padding: 6px 8px;
    font-size: 0.8rem;
    min-height: 36px;
  }
  
  .properties-content {
    padding: 0.6rem;
  }
  
  .no-selection {
    padding: 1.5rem 0.8rem;
  }
  
  .no-selection p {
    font-size: 0.85rem;
  }
}
</style>
