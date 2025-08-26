<template>
  <div class="color-picker">
    <div class="color-preview" :style="{ backgroundColor: value }" @click="togglePicker">
      <input 
        ref="colorInput"
        type="color" 
        :value="value"
        @input="updateColor"
        class="hidden-input"
      />
    </div>
    <input 
      type="text"
      :value="value"
      @input="updateColorText"
      @blur="validateColor"
      class="color-text"
      placeholder="#000000"
    />
    <button @click="setTransparent" class="transparent-button" title="Set transparent">
      <Slash :size="16" stroke-width="2.5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Slash } from 'lucide-vue-next';

interface Props {
  value: string;
}

interface Emits {
  update: [color: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const colorInput = ref<HTMLInputElement | null>(null);

function togglePicker() {
  colorInput.value?.click();
}

function setTransparent() {
  emit('update', 'transparent');
}

function updateColor(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update', target.value);
}

function updateColorText(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update', target.value);
}

function validateColor(event: Event) {
  const target = event.target as HTMLInputElement;
  const color = target.value;
  
  // Basic hex color validation
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    // Reset to current valid value if invalid
    target.value = props.value;
  }
}
</script>

<style scoped>
.color-picker {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.transparent-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #ef4444;
  cursor: pointer;
}

.transparent-button:hover {
  background: #fef2f2;
}

.color-preview {
  width: 32px;
  height: 32px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  background-image: 
    linear-gradient(45deg, #ccc 25%, transparent 25%), 
    linear-gradient(-45deg, #ccc 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #ccc 75%), 
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;
}

.color-text {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: monospace;
}

.color-text:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>
