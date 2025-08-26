<template>
  <div class="text-properties">
    <div class="property-section">
      <h4>Text</h4>
      <div class="property-group">
        <label>Content</label>
        <textarea 
          :value="textProps.text"
          @input="updateText(($event.target as HTMLTextAreaElement).value)"
          class="text-input"
          rows="3"
        />
      </div>
    </div>

    <div class="property-section">
      <h4>Typography</h4>
      <div class="property-group">
        <label>Font Family</label>
        <select 
          :value="textProps.fontFamily"
          @change="updateProperty('fontFamily', ($event.target as HTMLSelectElement).value)"
          class="select-input"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Impact">Impact</option>
        </select>
      </div>

      <div class="property-row">
        <div class="property-group">
          <label>Size</label>
          <NumberInput 
            :value="textProps.fontSize"
            @update="updateProperty('fontSize', $event)"
            :min="8"
            :max="200"
            suffix="px"
          />
        </div>
        <div class="property-group">
          <label>Line Height</label>
          <NumberInput 
            :value="textProps.lineHeight"
            @update="updateProperty('lineHeight', $event)"
            :min="0.5"
            :max="3"
            :step="0.1"
          />
        </div>
      </div>

      <div class="property-group">
        <label>Style</label>
        <div class="button-group">
          <button 
            @click="toggleWeight"
            :class="{ active: textProps.fontWeight === 'bold' }"
            class="style-button"
          >
            <strong>B</strong>
          </button>
          <button 
            @click="toggleStyle"
            :class="{ active: textProps.fontStyle === 'italic' }"
            class="style-button"
          >
            <em>I</em>
          </button>
          <button 
            @click="toggleDecoration"
            :class="{ active: textProps.textDecoration === 'underline' }"
            class="style-button"
          >
            <u>U</u>
          </button>
        </div>
      </div>

      <div class="property-group">
        <label>Alignment</label>
        <div class="button-group">
          <button 
            @click="updateProperty('textAlign', 'left')"
            :class="{ active: textProps.textAlign === 'left' }"
            class="align-button"
          >
            ⬅
          </button>
          <button 
            @click="updateProperty('textAlign', 'center')"
            :class="{ active: textProps.textAlign === 'center' }"
            class="align-button"
          >
            ↔
          </button>
          <button 
            @click="updateProperty('textAlign', 'right')"
            :class="{ active: textProps.textAlign === 'right' }"
            class="align-button"
          >
            ➡
          </button>
        </div>
      </div>
    </div>

    <div class="property-section">
      <h4>Appearance</h4>
      <div class="property-group">
        <label>Text Color</label>
        <ColorPicker 
          :value="textProps.color"
          @update="updateProperty('color', $event)"
        />
      </div>

      <div class="property-group" v-if="textProps.backgroundColor">
        <label>Background Color</label>
        <ColorPicker 
          :value="textProps.backgroundColor || '#ffffff'"
          @update="updateProperty('backgroundColor', $event)"
        />
      </div>

      <div class="property-group">
        <label>Padding</label>
        <NumberInput 
          :value="textProps.padding"
          @update="updateProperty('padding', $event)"
          :min="0"
          :max="50"
          suffix="px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ZineContent, TextProperties } from '@/types';
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

const textProps = computed(() => props.content.properties as TextProperties);

function updateProperty(key: keyof TextProperties, value: any) {
  emit('update', props.content.id, {
    properties: { ...textProps.value, [key]: value }
  });
}

function updateText(text: string) {
  updateProperty('text', text);
}

function toggleWeight() {
  const newWeight = textProps.value.fontWeight === 'bold' ? 'normal' : 'bold';
  updateProperty('fontWeight', newWeight);
}

function toggleStyle() {
  const newStyle = textProps.value.fontStyle === 'italic' ? 'normal' : 'italic';
  updateProperty('fontStyle', newStyle);
}

function toggleDecoration() {
  const newDecoration = textProps.value.textDecoration === 'underline' ? 'none' : 'underline';
  updateProperty('textDecoration', newDecoration);
}
</script>

<style scoped>
.text-properties {
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

.property-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.text-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
}

.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
}

.button-group {
  display: flex;
  gap: 0.25rem;
}

.style-button,
.align-button {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.style-button.active,
.align-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.style-button:hover,
.align-button:hover {
  background: #f3f4f6;
}

.style-button.active:hover,
.align-button.active:hover {
  background: #2563eb;
}
</style>
