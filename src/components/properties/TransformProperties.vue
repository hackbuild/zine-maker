<template>
  <div class="transform-properties">
    <div class="property-section">
      <h4>Transform</h4>
      
      <div class="property-row">
        <div class="property-group">
          <label>X</label>
          <NumberInput 
            :value="transformData.x"
            @update="updateTransform('x', $event)"
            suffix="px"
          />
        </div>
        <div class="property-group">
          <label>Y</label>
          <NumberInput 
            :value="transformData.y"
            @update="updateTransform('y', $event)"
            suffix="px"
          />
        </div>
      </div>

      <div class="property-row">
        <div class="property-group">
          <label>Width</label>
          <NumberInput 
            :value="transformData.width"
            @update="updateTransform('width', $event)"
            :min="1"
            suffix="px"
          />
        </div>
        <div class="property-group">
          <label>Height</label>
          <NumberInput 
            :value="transformData.height"
            @update="updateTransform('height', $event)"
            :min="1"
            suffix="px"
          />
        </div>
      </div>

      <div class="property-group">
        <label>Rotation</label>
        <div class="rotation-control">
          <input 
            type="range"
            :value="transformData.rotation"
            @input="updateRotation"
            min="-180"
            max="180"
            class="rotation-slider"
          />
          <NumberInput 
            :value="transformData.rotation"
            @update="updateTransform('rotation', $event)"
            :min="-180"
            :max="180"
            suffix="°"
            class="rotation-input"
          />
        </div>
      </div>

      <div class="property-group" v-if="content.length === 1">
        <label>Z-Index</label>
        <div class="z-index-control">
          <NumberInput 
            :value="content[0].zIndex"
            @update="updateTransform('zIndex', $event)"
            :min="0"
            class="z-index-input"
          />
          <div class="z-index-buttons">
            <button @click="bringToFront" class="z-button">Front</button>
            <button @click="sendToBack" class="z-button">Back</button>
          </div>
        </div>
      </div>
    </div>

    <div class="property-section" v-if="content.length > 1">
      <h4>Multi-Selection</h4>
      <div class="property-group">
        <div class="multi-actions">
          <button @click="alignLeft" class="align-button">Align Left</button>
          <button @click="alignCenter" class="align-button">Align Center</button>
          <button @click="alignRight" class="align-button">Align Right</button>
        </div>
        <div class="multi-actions">
          <button @click="alignTop" class="align-button">Align Top</button>
          <button @click="alignMiddle" class="align-button">Align Middle</button>
          <button @click="alignBottom" class="align-button">Align Bottom</button>
        </div>
      </div>
    </div>

    <div class="property-section">
      <h4>Actions</h4>
      <div class="property-group">
        <button @click="resetTransform" class="action-button">
          Reset Transform
        </button>
        <button @click="flipHorizontal" class="action-button">
          Flip Horizontal
        </button>
        <button @click="flipVertical" class="action-button">
          Flip Vertical
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ZineContent } from '@/types';
import NumberInput from './NumberInput.vue';

interface Props {
  content: ZineContent[];
}

interface Emits {
  update: [contentId: string, updates: Partial<ZineContent>];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const transformData = computed(() => {
  if (props.content.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0, rotation: 0, zIndex: 0 };
  }
  if (props.content.length === 1) {
    return props.content[0];
  } 
  
  // For multi-selection, show average/common values
  const first = props.content[0];
  return {
    x: Math.round(props.content.reduce((sum, c) => sum + c.x, 0) / props.content.length),
    y: Math.round(props.content.reduce((sum, c) => sum + c.y, 0) / props.content.length),
    width: first.width, // Show first item's dimensions
    height: first.height,
    rotation: first.rotation
  };
});

function updateTransform(property: keyof ZineContent, value: number) {
  if (props.content.length === 1) {
    emit('update', props.content[0].id, { [property]: value });
  } else {
    // For multi-selection, apply to all
    emit('update', 'multi', { [property]: value });
  }
}

function updateRotation(event: Event) {
  const target = event.target as HTMLInputElement;
  const rotation = parseInt(target.value);
  updateTransform('rotation', rotation);
}

function bringToFront() {
  if (props.content.length === 1) {
    const maxZ = Math.max(...(props.content[0] as any).page?.content?.map((c: any) => c.zIndex) || [0]);
    updateTransform('zIndex', maxZ + 1);
  }
}

function sendToBack() {
  if (props.content.length === 1) {
    updateTransform('zIndex', 0);
  }
}

function alignLeft() {
  if (props.content.length > 1) {
    const minX = Math.min(...props.content.map(c => c.x));
    props.content.forEach(c => {
      emit('update', c.id, { x: minX });
    });
  }
}

function alignCenter() {
  if (props.content.length > 1) {
    const centerX = props.content.reduce((sum, c) => sum + c.x + c.width / 2, 0) / props.content.length;
    props.content.forEach(c => {
      emit('update', c.id, { x: centerX - c.width / 2 });
    });
  }
}

function alignRight() {
  if (props.content.length > 1) {
    const maxX = Math.max(...props.content.map(c => c.x + c.width));
    props.content.forEach(c => {
      emit('update', c.id, { x: maxX - c.width });
    });
  }
}

function alignTop() {
  if (props.content.length > 1) {
    const minY = Math.min(...props.content.map(c => c.y));
    props.content.forEach(c => {
      emit('update', c.id, { y: minY });
    });
  }
}

function alignMiddle() {
  if (props.content.length > 1) {
    const centerY = props.content.reduce((sum, c) => sum + c.y + c.height / 2, 0) / props.content.length;
    props.content.forEach(c => {
      emit('update', c.id, { y: centerY - c.height / 2 });
    });
  }
}

function alignBottom() {
  if (props.content.length > 1) {
    const maxY = Math.max(...props.content.map(c => c.y + c.height));
    props.content.forEach(c => {
      emit('update', c.id, { y: maxY - c.height });
    });
  }
}

function resetTransform() {
  const updates = { x: 0, y: 0, rotation: 0 };
  if (props.content.length === 1) {
    emit('update', props.content[0].id, updates);
  } else {
    emit('update', 'multi', updates);
  }
}

function flipHorizontal() {
  // This would implement horizontal flip
  console.log('Flip horizontal functionality would be implemented here');
}

function flipVertical() {
  // This would implement vertical flip
  console.log('Flip vertical functionality would be implemented here');
}
</script>

<style scoped>
.transform-properties {
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

.property-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.rotation-control {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.rotation-slider {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.rotation-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.rotation-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.rotation-input {
  width: 80px;
}

.z-index-control {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.z-index-input {
  flex: 1;
}

.z-index-buttons {
  display: flex;
  gap: 0.25rem;
}

.z-button {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.7rem;
  color: #374151;
}

.z-button:hover {
  background: #e5e7eb;
}

.multi-actions {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.multi-actions:last-child {
  margin-bottom: 0;
}

.align-button {
  flex: 1;
  padding: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  color: #374151;
}

.align-button:hover {
  background: #e5e7eb;
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
</style>
