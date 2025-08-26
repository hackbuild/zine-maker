<template>
  <div class="shape-properties">
    <div class="property-section">
      <h4>Shape</h4>
      <div class="property-group">
        <label>Type</label>
        <select 
          :value="shapeProps.shapeType"
          @change="updateProperty('shapeType', ($event.target as HTMLSelectElement).value)"
          class="select-input"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="line">Line</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

      <div class="property-group" v-if="shapeProps.shapeType === 'rectangle'">
        <label>Corner Radius</label>
        <NumberInput 
          :value="shapeProps.cornerRadius || 0"
          @update="updateProperty('cornerRadius', $event)"
          :min="0"
          :max="50"
          suffix="px"
        />
      </div>
    </div>

    <div class="property-section">
      <h4>Fill</h4>
      <div class="property-group">
        <label>Fill Color</label>
        <ColorPicker 
          :value="shapeProps.fill"
          @update="updateProperty('fill', $event)"
        />
      </div>
    </div>

    <div class="property-section">
      <h4>Stroke</h4>
      <div class="property-group">
        <label>Stroke Color</label>
        <ColorPicker 
          :value="shapeProps.stroke"
          @update="updateProperty('stroke', $event)"
        />
      </div>

      <div class="property-group">
        <label>Stroke Width</label>
        <NumberInput 
          :value="shapeProps.strokeWidth"
          @update="updateProperty('strokeWidth', $event)"
          :min="0"
          :max="20"
          suffix="px"
        />
      </div>
    </div>

    <div class="property-section">
      <h4>Appearance</h4>
      <div class="property-group">
        <label>Opacity</label>
        <div class="opacity-control">
          <input 
            type="range"
            :value="shapeProps.opacity * 100"
            @input="updateOpacity"
            min="0"
            max="100"
            class="opacity-slider"
          />
          <span class="opacity-value">{{ Math.round(shapeProps.opacity * 100) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ZineContent, ShapeProperties } from '@/types';
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

const shapeProps = computed(() => props.content.properties as ShapeProperties);

function updateProperty(key: keyof ShapeProperties, value: any) {
  emit('update', props.content.id, {
    properties: { ...shapeProps.value, [key]: value }
  });
}

function updateOpacity(event: Event) {
  const target = event.target as HTMLInputElement;
  const opacity = parseInt(target.value) / 100;
  updateProperty('opacity', opacity);
}
</script>

<style scoped>
.shape-properties {
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
  color: var(--ui-ink);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px dashed var(--border-soft);
  padding-bottom: 6px;
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

.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
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
</style>
