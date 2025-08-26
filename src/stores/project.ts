import { defineStore } from 'pinia';
import { ref, computed, watch, toRaw } from 'vue';
import type { ZineProject, ZinePage, ZineContent, ZineTemplate, ExportOptions } from '@/types';
import { saveProject } from '@/utils/persistence';
import { debounce } from 'lodash-es';

export const useProjectStore = defineStore('project', () => {
  const currentProject = ref<ZineProject | null>(null);
  const currentPageIndex = ref(0);
  const selectedContentIds = ref<string[]>([]);
  const isModified = ref(false);

  // Auto-save watcher
  const debouncedSave = debounce((project: ZineProject) => {
    saveProject(toRaw(project));
    isModified.value = false;
  }, 1000);

  watch(currentProject, (newValue) => {
    if (newValue && isModified.value) {
      debouncedSave(newValue);
    }
  }, { deep: true });

  const currentPage = computed(() => {
    if (!currentProject.value || currentPageIndex.value < 0) return null;
    return currentProject.value.pages[currentPageIndex.value] || null;
  });

  const pageCount = computed(() => {
    return currentProject.value?.pages.length || 0;
  });

  function createNewProject(name: string, template: ZineTemplate): void {
    const pages: ZinePage[] = [];
    
    // Create pages based on template
    for (let i = 0; i < template.pageCount; i++) {
      pages.push({
        id: `page-${i + 1}`,
        pageNumber: i + 1,
        title: `Page ${i + 1}`,
        content: [],
        backgroundColor: '#ffffff'
      });
    }

    currentProject.value = {
      id: `project-${Date.now()}`,
      name,
      template,
      pages,
      createdAt: new Date(),
      modifiedAt: new Date(),
      metadata: {
        author: '',
        description: '',
        tags: []
      }
    };

    currentPageIndex.value = 0;
    selectedContentIds.value = [];
    isModified.value = false;
  }

  function loadProject(project: ZineProject): void {
    // Ensure dates are correctly revived from JSON serialization
    project.createdAt = new Date(project.createdAt);
    project.modifiedAt = new Date(project.modifiedAt);
    currentProject.value = project;
    currentPageIndex.value = 0;
    selectedContentIds.value = [];
    isModified.value = false;
  }

  function setCurrentPage(index: number): void {
    if (currentProject.value && index >= 0 && index < currentProject.value.pages.length) {
      currentPageIndex.value = index;
      selectedContentIds.value = [];
    }
  }

  function addContentToCurrentPage(content: Omit<ZineContent, 'id'>): void {
    if (!currentPage.value) return;

    const newContent: ZineContent = {
      ...content,
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    currentPage.value.content.push(newContent);
    isModified.value = true;
  }

  function updateContent(contentId: string, updates: Partial<ZineContent>): void {
    if (!currentPage.value) return;

    const contentIndex = currentPage.value.content.findIndex(c => c.id === contentId);
    if (contentIndex !== -1) {
      currentPage.value.content[contentIndex] = {
        ...currentPage.value.content[contentIndex],
        ...updates
      };
      isModified.value = true;
    }
  }

  function deleteContent(contentId: string): void {
    if (!currentPage.value) return;

    const contentIndex = currentPage.value.content.findIndex(c => c.id === contentId);
    if (contentIndex !== -1) {
      currentPage.value.content.splice(contentIndex, 1);
      selectedContentIds.value = selectedContentIds.value.filter(id => id !== contentId);
      isModified.value = true;
    }
  }

  function selectContent(contentId: string, addToSelection = false): void {
    if (addToSelection) {
      if (!selectedContentIds.value.includes(contentId)) {
        selectedContentIds.value.push(contentId);
      }
    } else {
      selectedContentIds.value = [contentId];
    }
  }

  function clearSelection(): void {
    selectedContentIds.value = [];
  }

  function updatePageBackground(backgroundColor: string, backgroundImage?: string): void {
    if (!currentPage.value) return;

    currentPage.value.backgroundColor = backgroundColor;
    if (backgroundImage !== undefined) {
      currentPage.value.backgroundImage = backgroundImage;
    }
    isModified.value = true;
  }

  function updateProjectMetadata(metadata: Partial<ZineProject['metadata']>): void {
    if (!currentProject.value) return;

    currentProject.value.metadata = {
      ...currentProject.value.metadata,
      ...metadata
    };
    currentProject.value.modifiedAt = new Date();
    isModified.value = true;
  }

  function updateProjectName(name: string): void {
    if (!currentProject.value) return;

    currentProject.value.name = name;
    currentProject.value.modifiedAt = new Date();
    isModified.value = true;
  }

  function getContentById(contentId: string): ZineContent | null {
    if (!currentPage.value) return null;
    return currentPage.value.content.find(c => c.id === contentId) || null;
  }

  function duplicateContent(contentId: string): void {
    const content = getContentById(contentId);
    if (!content) return;

    const duplicated = {
      ...content,
      x: content.x + 20,
      y: content.y + 20
    };
    delete (duplicated as any).id; // Remove id so addContentToCurrentPage creates a new one
    addContentToCurrentPage(duplicated);
  }

  function exportProject(_options: ExportOptions): string {
    if (!currentProject.value) return '';
    
    // This would generate the actual export
    // For now, return a placeholder
    return 'export-data';
  }

  return {
    currentProject,
    currentPageIndex,
    currentPage,
    pageCount,
    selectedContentIds,
    isModified,
    createNewProject,
    loadProject,
    setCurrentPage,
    addContentToCurrentPage,
    updateContent,
    deleteContent,
    selectContent,
    clearSelection,
    updatePageBackground,
    updateProjectMetadata,
    updateProjectName,
    getContentById,
    duplicateContent,
    exportProject
  };
});