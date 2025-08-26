import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const showTemplateSelector = ref(true);
  const showPageList = ref(true);
  const showProperties = ref(true);
  const showImageUploadModal = ref(false);
  const showExportModal = ref(false);
  const exportImageData = ref('');
  const exportImageWidth = ref(0);
  const exportImageHeight = ref(0);
  const exportPdfData = ref('');
  const zoom = ref(1);
  const canvasOffset = ref({ x: 0, y: 0 });

  function hideTemplateSelector(): void {
    showTemplateSelector.value = false;
  }

  function showTemplateSelectorModal(): void {
    showTemplateSelector.value = true;
  }

  function togglePageList(): void {
    showPageList.value = !showPageList.value;
  }

  function toggleProperties(): void {
    showProperties.value = !showProperties.value;
  }

  function setZoom(newZoom: number): void {
    zoom.value = Math.max(0.1, Math.min(5, newZoom));
  }

  function setCanvasOffset(x: number, y: number): void {
    canvasOffset.value = { x, y };
  }

  return {
    showTemplateSelector,
    showPageList,
    showProperties,
    showImageUploadModal,
    showExportModal,
    exportImageData,
    exportImageWidth,
    exportImageHeight,
    exportPdfData,
    zoom,
    canvasOffset,
    hideTemplateSelector,
    showTemplateSelectorModal,
    togglePageList,
    toggleProperties,
    setZoom,
    setCanvasOffset
  };
});