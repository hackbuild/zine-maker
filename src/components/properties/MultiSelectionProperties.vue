<template>
  <div class="multi-selection-properties">
    <div class="property-section">
      <h4>Multi-Selection ({{ content.length }} items)</h4>
      
      <div class="selection-summary">
        <div class="content-types">
          <span v-for="(count, type) in contentTypeCounts" :key="type" class="type-badge">
            {{ count }} {{ type }}{{ count > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>

    <div class="property-section" v-if="hasCommonProperties">
      <h4>Common Properties</h4>
      
      <!-- Show color picker if all selected items support color -->
      <div class="property-group" v-if="supportsColor">
        <label>Color</label>
        <ColorPicker 
          :value="commonColor || '#000000'"
          @update="updateCommonColor"
        />
      </div>

      <!-- Show opacity if all selected items support it -->
      <div class="property-group" v-if="supportsOpacity">
        <label>Opacity</label>
        <div class="opacity-control">
          <input 
            type="range"
            :value="(commonOpacity || 1) * 100"
            @input="updateCommonOpacity"
            min="0"
            max="100"
            class="opacity-slider"
          />
          <span class="opacity-value">{{ Math.round((commonOpacity || 1) * 100) }}%</span>
        </div>
      </div>
    </div>

    <div class="property-section">
      <h4>Bulk Actions</h4>
      <div class="property-group">
        <button @click="groupItems" class="action-button">
          Group Items
        </button>
        <button @click="distributeHorizontally" class="action-button">
          Distribute Horizontally
        </button>
        <button @click="distributeVertically" class="action-button">
          Distribute Vertically
        </button>
        <button @click="matchSize" class="action-button">
          Match Size to First
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ZineContent, TextProperties, ShapeProperties, ImageProperties, DrawingProperties } from '@/types';
import ColorPicker from './ColorPicker.vue';

interface Props {
  content: ZineContent[];
}

interface Emits {
  update: [updates: Partial<ZineContent>];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const contentTypeCounts = computed(() => {
  const counts: Record<string, number> = {};
  props.content.forEach(item => {
    counts[item.type] = (counts[item.type] || 0) + 1;
  });
  return counts;
});

const hasCommonProperties = computed(() => {
  return supportsColor.value || supportsOpacity.value;
});

const supportsColor = computed(() => {
  return props.content.every(item => 
    item.type === 'text' || item.type === 'shape' || item.type === 'drawing'
  );
});

const supportsOpacity = computed(() => {
  return props.content.every(item => 
    item.type === 'shape' || item.type === 'image' || item.type === 'drawing'
  );
});

const commonColor = computed(() => {
  if (!supportsColor.value) return null;
  
  const colors = props.content.map(item => {
    const props = item.properties as TextProperties | ShapeProperties | DrawingProperties;
    if (item.type === 'text') return (props as TextProperties).color;
    if (item.type === 'shape') return (props as ShapeProperties).fill;
    if (item.type === 'drawing') return (props as DrawingProperties).strokeColor;
    return null;
  }).filter(Boolean);
  
  // Return color if all items have the same color
  const firstColor = colors[0];
  return colors.every(color => color === firstColor) ? firstColor : null;
});

const commonOpacity = computed(() => {
  if (!supportsOpacity.value) return null;
  
  const opacities = props.content.map(item => {
    const props = item.properties as ShapeProperties | ImageProperties | DrawingProperties;
    return props.opacity;
  });
  
  // Return opacity if all items have the same opacity
  const firstOpacity = opacities[0];
  return opacities.every(opacity => opacity === firstOpacity) ? firstOpacity : null;
});

function updateCommonColor(color: string) {
  props.content.forEach(item => {
    let updates: any = {};
    
    if (item.type === 'text') {
      updates.properties = { ...item.properties, color };
    } else if (item.type === 'shape') {
      updates.properties = { ...item.properties, fill: color };
    } else if (item.type === 'drawing') {
      updates.properties = { ...item.properties, strokeColor: color };
    }
    
    if (Object.keys(updates).length > 0) {
      emit('update', updates);
    }
  });
}

function updateCommonOpacity(event: Event) {
  const target = event.target as HTMLInputElement;
  const opacity = parseInt(target.value) / 100;
  
  emit('update', {
    properties: { opacity } as any
  });
}

function groupItems() {
  // This would implement grouping functionality
  console.log('Group items functionality would be implemented here');
}

function distributeHorizontally() {
  if (props.content.length < 3) return;
  
  const sorted = [...props.content].sort((a, b) => a.x - b.x);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalWidth = (last.x + last.width) - first.x;
  const spacing = totalWidth / (sorted.length - 1);
  
  sorted.forEach((_, index) => {
    if (index > 0 && index < sorted.length - 1) {
      const newX = first.x + (spacing * index);
      emit('update', { x: newX });
    }
  });
}

function distributeVertically() {
  if (props.content.length < 3) return;
  
  const sorted = [...props.content].sort((a, b) => a.y - b.y);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalHeight = (last.y + last.height) - first.y;
  const spacing = totalHeight / (sorted.length - 1);
  
  sorted.forEach((_, index) => {
    if (index > 0 && index < sorted.length - 1) {
      const newY = first.y + (spacing * index);
      emit('update', { y: newY });
    }
  });
}

function matchSize() {
  if (props.content.length < 2) return;
  
  const first = props.content[0];
  emit('update', {
    width: first.width,
    height: first.height
  });
}
</script>

<style scoped>
.multi-selection-properties {
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

.selection-summary {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.75rem;
}

.content-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.type-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
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
</style>
