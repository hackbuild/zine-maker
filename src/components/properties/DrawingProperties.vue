<template>
  <div class="drawing-properties">
    <div class="property-section">
      <h4>Drawing</h4>
      <div class="property-group">
        <label>Paths</label>
        <div class="paths-info">
          <span class="path-count">{{ drawingProps.paths.length }} path(s)</span>
          <button @click="clearPaths" class="clear-button">Clear All</button>
        </div>
      </div>
    </div>

    <div class="property-section">
      <h4>Stroke</h4>
      <div class="property-group">
        <label>Stroke Color</label>
        <ColorPicker 
          :value="drawingProps.strokeColor"
          @update="updateProperty('strokeColor', $event)"
        />
      </div>

      <div class="property-group">
        <label>Stroke Width</label>
        <NumberInput 
          :value="drawingProps.strokeWidth"
          @update="updateProperty('strokeWidth', $event)"
          :min="1"
          :max="50"
          suffix="px"
        />
      </div>

      <div class="property-group">
        <label>Line Cap</label>
        <select 
          :value="drawingProps.lineCap || 'round'"
          @change="updateProperty('lineCap', ($event.target as HTMLSelectElement).value)"
          class="select-input"
        >
          <option value="butt">Butt</option>
          <option value="round">Round</option>
          <option value="square">Square</option>
        </select>
      </div>

      <div class="property-group">
        <label>Line Join</label>
        <select 
          :value="drawingProps.lineJoin || 'round'"
          @change="updateProperty('lineJoin', ($event.target as HTMLSelectElement).value)"
          class="select-input"
        >
          <option value="miter">Miter</option>
          <option value="round">Round</option>
          <option value="bevel">Bevel</option>
        </select>
      </div>
    </div>

    <div class="property-section">
      <h4>Appearance</h4>
      <div class="property-group">
        <label>Opacity</label>
        <div class="opacity-control">
          <input 
            type="range"
            :value="drawingProps.opacity * 100"
            @input="updateOpacity"
            min="0"
            max="100"
            class="opacity-slider"
          />
          <span class="opacity-value">{{ Math.round(drawingProps.opacity * 100) }}%</span>
        </div>
      </div>

      <div class="property-group">
        <label>
          <input 
            type="checkbox"
            :checked="drawingProps.smoothing !== false"
            @change="updateProperty('smoothing', ($event.target as HTMLInputElement).checked)"
          />
          Smooth Lines
        </label>
      </div>
    </div>

    <div class="property-section">
      <h4>Actions</h4>
      <div class="property-group">
        <button @click="duplicateDrawing" class="action-button">
          Duplicate Drawing
        </button>
        <button @click="convertToShape" class="action-button">
          Convert to Shape
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ZineContent, DrawingProperties } from '@/types';
import { useProjectStore } from '@/stores/project';
import ColorPicker from './ColorPicker.vue';
import NumberInput from './NumberInput.vue';

interface Props {
  content: ZineContent;
}

interface Emits {
  update: [contentId: string, updates: Partial<ZineContent>];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const projectStore = useProjectStore();

const drawingProps = computed(() => props.content.properties as DrawingProperties);

function updateProperty(key: keyof DrawingProperties, value: any) {
  emit('update', props.content.id, {
    properties: { ...drawingProps.value, [key]: value }
  });
}

function updateOpacity(event: Event) {
  const target = event.target as HTMLInputElement;
  const opacity = parseInt(target.value) / 100;
  updateProperty('opacity', opacity);
}

function clearPaths() {
  updateProperty('paths', []);
}

function duplicateDrawing() {
  projectStore.duplicateContent(props.content.id);
}

function convertToShape() {
  // This would convert the drawing paths to a shape
  // For now, just show a placeholder
  console.log('Convert to shape functionality would be implemented here');
}
</script>

<style scoped>
.drawing-properties {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.property-section {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem;
}

.property-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.property-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.property-group {
  margin-bottom: 0.75rem;
}

.property-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.paths-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.path-count {
  font-size: 0.8rem;
  color: #6b7280;
}

.clear-button {
  padding: 0.25rem 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.7rem;
}

.clear-button:hover {
  background: #fecaca;
}

.opacity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.opacity-slider {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.opacity-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.opacity-value {
  font-size: 0.8rem;
  color: #6b7280;
  min-width: 35px;
  text-align: right;
}

.action-button {
  width: 100%;
  padding: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.action-button:last-child {
  margin-bottom: 0;
}

.action-button:hover {
  background: #e5e7eb;
}

.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
}
</style>
