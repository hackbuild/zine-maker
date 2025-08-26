<template>
  <div class="image-properties">
    <div class="property-section">
      <h4>Image</h4>
      <div class="property-group">
        <label>Source</label>
        <div class="image-source">
          <div class="image-preview">
            <img :src="imageProps.src" :alt="imageProps.alt" />
          </div>
          <div class="image-info">
            <input 
              type="file"
              @change="handleImageChange"
              accept="image/*"
              ref="fileInput"
              class="hidden-input"
            />
            <button @click="selectNewImage" class="change-button">
              Change Image
            </button>
          </div>
        </div>
      </div>

      <div class="property-group">
        <label>Alt Text</label>
        <input 
          type="text"
          :value="imageProps.alt"
          @input="updateProperty('alt', ($event.target as HTMLInputElement).value)"
          class="text-input"
          placeholder="Describe the image"
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
            :value="imageProps.opacity * 100"
            @input="updateOpacity"
            min="0"
            max="100"
            class="opacity-slider"
          />
          <span class="opacity-value">{{ Math.round(imageProps.opacity * 100) }}%</span>
        </div>
      </div>

      <div class="property-group" v-if="imageProps.filters">
        <label>Filters</label>
        <select 
          :value="imageProps.filters || 'none'"
          @change="updateProperty('filters', ($event.target as HTMLSelectElement).value === 'none' ? undefined : ($event.target as HTMLSelectElement).value)"
          class="select-input"
        >
          <option value="none">None</option>
          <option value="grayscale(100%)">Grayscale</option>
          <option value="sepia(100%)">Sepia</option>
          <option value="blur(2px)">Blur</option>
          <option value="brightness(150%)">Bright</option>
          <option value="contrast(150%)">High Contrast</option>
          <option value="saturate(200%)">Saturated</option>
        </select>
      </div>
    </div>

    <div class="property-section">
      <h4>Actions</h4>
      <div class="property-group">
        <button @click="resetImage" class="action-button">
          Reset to Original
        </button>
        <button @click="duplicateImage" class="action-button">
          Duplicate Image
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ZineContent, ImageProperties } from '@/types';
import { useProjectStore } from '@/stores/project';

interface Props {
  content: ZineContent;
}

interface Emits {
  update: [contentId: string, updates: Partial<ZineContent>];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const projectStore = useProjectStore();
const fileInput = ref<HTMLInputElement | null>(null);

const imageProps = computed(() => props.content.properties as ImageProperties);

function updateProperty(key: keyof ImageProperties, value: any) {
  emit('update', props.content.id, {
    properties: { ...imageProps.value, [key]: value }
  });
}

function updateOpacity(event: Event) {
  const target = event.target as HTMLInputElement;
  const opacity = parseInt(target.value) / 100;
  updateProperty('opacity', opacity);
}

function selectNewImage() {
  fileInput.value?.click();
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      updateProperty('src', src);
    };
    reader.readAsDataURL(file);
  }
}

function resetImage() {
  // Reset filters and opacity
  emit('update', props.content.id, {
    properties: { 
      ...imageProps.value, 
      opacity: 1,
      filters: undefined
    }
  });
}

function duplicateImage() {
  projectStore.duplicateContent(props.content.id);
}
</script>

<style scoped>
.image-properties {
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

.image-source {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.image-preview {
  width: 60px;
  height: 60px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow: hidden;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.image-info {
  flex: 1;
}

.hidden-input {
  display: none;
}

.change-button {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #374151;
}

.change-button:hover {
  background: #e5e7eb;
}

.text-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
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
