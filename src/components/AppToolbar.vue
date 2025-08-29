<template>
  <div class="app-toolbar">
    <div class="toolbar-section">
      <button 
        v-for="tool in toolsStore.tools" 
        :key="tool.id"
        @click="handleToolClick(tool.id)"
        :class="{ active: toolsStore.activeTool === tool.id }"
        class="tool-button"
        :title="`${tool.name} (${tool.shortcut})`"
      >
        <component :is="tool.icon" :size="20" stroke-width="2" />
        <div v-if="tool.id === 'shape'" class="dropdown-arrow"></div>
      </button>

      <div v-if="isShapePopoverVisible" class="shape-popover" ref="shapePopoverRef">
        <button v-for="shape in availableShapes" :key="shape.type" @click="selectShape(shape.type)" class="shape-select-button">
          <component :is="shape.icon" :size="18" />
          <span>{{ shape.name }}</span>
        </button>
      </div>

      <!-- Drawing Tools (moved below main toolbar; reserved spot here) -->
      <div v-if="false" class="drawing-toolbar">
        <div class="drawing-controls">
          <div class="control-group">
            <label>Size</label>
            <input 
              type="range"
              :value="toolsStore.drawingSettings.strokeWidth"
              @input="updateDrawingSetting('strokeWidth', parseInt(($event.target as HTMLInputElement).value))"
              min="1"
              max="20"
              class="size-slider"
            />
            <span class="size-value">{{ toolsStore.drawingSettings.strokeWidth }}px</span>
          </div>
          <div class="control-group">
            <label>Color</label>
            <input 
              type="color"
              :value="toolsStore.drawingSettings.strokeColor"
              @input="updateDrawingSetting('strokeColor', ($event.target as HTMLInputElement).value)"
              class="color-input"
            />
          </div>
          <div class="control-group">
            <label>Opacity</label>
            <input 
              type="range"
              :value="toolsStore.drawingSettings.opacity * 100"
              @input="updateDrawingSetting('opacity', parseInt(($event.target as HTMLInputElement).value) / 100)"
              min="10"
              max="100"
              class="opacity-slider"
            />
            <span class="opacity-value">{{ Math.round(toolsStore.drawingSettings.opacity * 100) }}%</span>
          </div>
        </div>
      </div>

      
      
      <div class="history-controls">
        <button class="tool-button" :disabled="!projectStoreCanUndo" @click="undo" title="Undo (⌘/Ctrl+Z)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-5-5 5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
        </button>
        <button class="tool-button" :disabled="!projectStoreCanRedo" @click="redo" title="Redo (⇧+⌘/Ctrl+Z)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
        </button>
      </div>
    </div>
  </div>
  <div v-if="toolsStore.activeTool === 'draw'" class="drawing-toolbar below">
    <div class="drawing-controls">
      <div class="control-group">
        <label>Size</label>
        <input 
          type="range"
          :value="toolsStore.drawingSettings.strokeWidth"
          @input="updateDrawingSetting('strokeWidth', parseInt(($event.target as HTMLInputElement).value))"
          min="1"
          max="20"
          class="size-slider"
        />
        <span class="size-value">{{ toolsStore.drawingSettings.strokeWidth }}px</span>
      </div>
      <div class="control-group">
        <label>Color</label>
        <input 
          type="color"
          :value="toolsStore.drawingSettings.strokeColor"
          @input="updateDrawingSetting('strokeColor', ($event.target as HTMLInputElement).value)"
          class="color-input"
        />
      </div>
      <div class="control-group">
        <label>Opacity</label>
        <input 
          type="range"
          :value="toolsStore.drawingSettings.opacity * 100"
          @input="updateDrawingSetting('opacity', parseInt(($event.target as HTMLInputElement).value) / 100)"
          min="10"
          max="100"
          class="opacity-slider"
        />
        <span class="opacity-value">{{ Math.round(toolsStore.drawingSettings.opacity * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, type Component, computed } from 'vue';
import { useToolsStore } from '@/stores/tools';
import { useUIStore } from '@/stores/ui';
import { onClickOutside } from '@vueuse/core';
import type { ShapeProperties, ToolType } from '@/types';
import { Square, Circle, Minus, Triangle } from 'lucide-vue-next';
import { useProjectStore } from '@/stores/project';

const toolsStore = useToolsStore();
const uiStore = useUIStore();
const projectStore = useProjectStore();

const projectStoreCanUndo = computed(() => projectStore.canUndo);
const projectStoreCanRedo = computed(() => projectStore.canRedo);

function undo(){ if (projectStoreCanUndo.value) projectStore.undo(); }
function redo(){ if (projectStoreCanRedo.value) projectStore.redo(); }

const isShapePopoverVisible = ref(false);
const shapePopoverRef = ref(null);

interface AvailableShape {
  type: ShapeProperties['shapeType'];
  name: string;
  icon: Component;
}

const availableShapes: AvailableShape[] = [
  { type: 'rectangle', name: 'Rectangle', icon: markRaw(Square) },
  { type: 'circle', name: 'Circle', icon: markRaw(Circle) },
  { type: 'line', name: 'Line', icon: markRaw(Minus) },
  { type: 'triangle', name: 'Triangle', icon: markRaw(Triangle) },
];

onClickOutside(shapePopoverRef, () => isShapePopoverVisible.value = false);

function handleToolClick(toolId: ToolType) {
  if (toolId === 'shape') {
    isShapePopoverVisible.value = !isShapePopoverVisible.value;
  } else if (toolId === 'image') {
    uiStore.showImageUploadModal = true;
  } else {
    isShapePopoverVisible.value = false;
    toolsStore.setActiveTool(toolId);
  }
}

function selectShape(shapeType: ShapeProperties['shapeType']) {
  toolsStore.setActiveShapeType(shapeType);
  isShapePopoverVisible.value = false;
}

function updateDrawingSetting(key: string, value: any) {
  toolsStore.updateDrawingSetting(key as any, value);
}

// zoom controls moved into canvas floating UI
</script>

<style scoped>
.app-toolbar {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--panel);
  border-bottom: 1px solid var(--border-soft);
  align-items: center;
  position: relative;
  border-radius: 12px;
  margin: 0 1rem;
}

.toolbar-section {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--ui-ink);
  transition: all 0.2s ease;
  position: relative;
  /* Touch optimization */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}

.tool-button:hover {
  background: var(--surface);
}

.tool-button.active {
  background: #3b82f6;
  color: white;
}

.dropdown-arrow {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-top: 4px solid currentColor;
}

.shape-popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 140px; /* Adjust based on shape tool position */
  background: var(--panel);
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 0.5rem;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
}

.shape-select-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  font-size: 0.85rem;
  width: 100%;
}

.shape-select-button:hover {
  background: var(--surface);
}

.drawing-toolbar {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 6px;
}
.drawing-toolbar.below {
  margin: 8px 1rem 0 1rem;
  border-radius: 12px;
}

.drawing-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-size: 0.8rem;
  color: var(--ui-ink);
  min-width: 40px;
}

.size-slider, .opacity-slider {
  width: 80px;
  height: 4px;
  background: var(--border-soft);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.size-slider::-webkit-slider-thumb, .opacity-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.size-value, .opacity-value {
  font-size: 0.8rem;
  color: var(--ui-ink);
  min-width: 30px;
}

.color-input {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-soft);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

/* history controls match toolbar */
.history-controls { display: flex; gap: 0.25rem; margin-left: 0.5rem; }
.history-controls .tool-button[disabled] { opacity: 0.4; cursor: not-allowed; }

/* Mobile responsive toolbar */
@media (max-width: 768px) {
  .app-toolbar {
    padding: 0.4rem 0.8rem;
    margin: 0 0.8rem;
    gap: 0.8rem;
  }
  
  .toolbar-section {
    gap: 0.2rem;
  }
  
  .tool-button {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }
  
  .drawing-toolbar.below {
    margin: 6px 0.8rem 0 0.8rem;
  }
  
  .drawing-controls {
    gap: 0.8rem;
    flex-wrap: wrap;
  }
  
  .control-group {
    gap: 0.4rem;
  }
  
  .size-slider, .opacity-slider {
    width: 70px;
  }
  
  .color-input {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .app-toolbar {
    padding: 0.3rem 0.6rem;
    margin: 0 0.6rem;
    gap: 0.6rem;
  }
  
  .toolbar-section {
    gap: 0.15rem;
  }
  
  .tool-button {
    width: 38px;
    height: 38px;
  }
  
  .drawing-toolbar.below {
    margin: 4px 0.6rem 0 0.6rem;
    padding: 0.4rem 0.8rem;
  }
  
  .drawing-controls {
    gap: 0.6rem;
    justify-content: center;
  }
  
  .control-group label {
    font-size: 0.75rem;
    min-width: 35px;
  }
  
  .size-slider, .opacity-slider {
    width: 60px;
  }
  
  .size-value, .opacity-value {
    font-size: 0.75rem;
    min-width: 25px;
  }
  
  .shape-popover {
    left: 50%;
    transform: translateX(-50%);
    grid-template-columns: 1fr 1fr;
    min-width: 200px;
  }
}
</style>
