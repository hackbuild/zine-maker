<template>
  <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
    <div class="modal-content" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
      <button class="close-button" @click="$emit('close')">×</button>
      
      <div class="modal-header">
        <h3>Add Image</h3>
        <p>Drag & drop an image file or click to select</p>
      </div>

      <div 
        class="dropzone"
        :class="{ dragging: isDragging }"
        @click="openFileInput"
      >
        <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" class="hidden-input" />
        <div class="dropzone-content">
          <ImageIcon :size="48" stroke-width="1.5" />
          <p v-if="isDragging">Drop image here</p>
          <p v-else>Click to upload or drag a file</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAssetStore } from '@/stores/assetStore';
import { ImageIcon } from 'lucide-vue-next';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'image-added', id: number): void
}>();

const assetStore = useAssetStore();
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function openFileInput() {
  fileInput.value?.click();
}

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return;
  const id = await assetStore.addAsset(file);
  if (id) {
    emit('image-added', id);
    emit('close');
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files?.[0]) {
    handleFile(target.files[0]);
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files?.[0]) {
    handleFile(event.dataTransfer.files[0]);
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropzone.dragging,
.dropzone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dropzone-content {
  color: #6b7280;
}

.dropzone-content svg {
  margin: 0 auto 1rem;
}

.hidden-input {
  display: none;
}
</style>
