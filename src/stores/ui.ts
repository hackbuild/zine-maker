import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const showTemplateSelector = ref(true);
  const showPageList = ref(true);
  const showProperties = ref(true);
  const showImageUploadModal = ref(false);
  const showExportModal = ref(false);
  const showProjectsModal = ref(false);
  const showShareModal = ref(false);
  const showIpfsDirectoryModal = ref(false);
  const exportImageData = ref('');
  const exportImages = ref<string[]>([]);
  const exportImageWidth = ref(0);
  const exportImageHeight = ref(0);
  const exportPdfData = ref('');
  const zoom = ref(1);
  const canvasOffset = ref({ x: 0, y: 0 });
  const shouldFit = ref(false);
  const pageListCollapsed = ref(false);
  const propertiesCollapsed = ref(false);
  const showPageNumbers = ref(true);
  const showFoldMarks = ref(true);
  const showCutMarks = ref(true);
  const showStorageNotice = ref(false);

  function hideTemplateSelector(): void {
    showTemplateSelector.value = false;
  }

  function showTemplateSelectorModal(): void {
    showTemplateSelector.value = true;
  }

  function openProjectsModal(): void {
    showProjectsModal.value = true;
  }
  function closeProjectsModal(): void {
    showProjectsModal.value = false;
  }
  function openShareModal(): void {
    showShareModal.value = true;
  }
  function closeShareModal(): void {
    showShareModal.value = false;
  }
  function openIpfsDirectoryModal(): void {
    showIpfsDirectoryModal.value = true;
  }
  function closeIpfsDirectoryModal(): void {
    showIpfsDirectoryModal.value = false;
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

  function requestFit(): void {
    shouldFit.value = true;
  }

  function togglePageListCollapsed(): void {
    pageListCollapsed.value = !pageListCollapsed.value;
  }
  function togglePropertiesCollapsed(): void {
    propertiesCollapsed.value = !propertiesCollapsed.value;
  }

  function openStorageNotice(): void {
    showStorageNotice.value = true;
  }
  function closeStorageNotice(): void {
    showStorageNotice.value = false;
  }

  return {
    showTemplateSelector,
    showPageList,
    showProperties,
    showImageUploadModal,
    showExportModal,
    showProjectsModal,
    showShareModal,
    showIpfsDirectoryModal,
    exportImageData,
    exportImages,
    exportImageWidth,
    exportImageHeight,
    exportPdfData,
    zoom,
    canvasOffset,
    shouldFit,
    pageListCollapsed,
    propertiesCollapsed,
    showPageNumbers,
    showFoldMarks,
    showCutMarks,
    showStorageNotice,
    hideTemplateSelector,
    showTemplateSelectorModal,
    openProjectsModal,
    closeProjectsModal,
    openShareModal,
    closeShareModal,
    openIpfsDirectoryModal,
    closeIpfsDirectoryModal,
    togglePageList,
    toggleProperties,
    setZoom,
    setCanvasOffset,
    requestFit,
    togglePageListCollapsed,
    togglePropertiesCollapsed,
    openStorageNotice,
    closeStorageNotice
  };
});