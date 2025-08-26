<template>
  <div class="properties-panel">
    <div class="properties-header">
      <h3>Properties</h3>
      <button @click="$emit('close')" class="close-button">×</button>
    </div>

    <div class="properties-content">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStore } from '@/stores/project';
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
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.properties-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #374151;
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.no-selection {
  text-align: center;
  color: #6b7280;
  padding: 2rem 1rem;
}

.no-selection p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
