import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ZineTemplate, ZineFormat, PageSize } from '@/types';

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<ZineTemplate[]>([
    {
      id: 'quarter-fold-letter',
      name: 'Quarter Fold Zine (Letter)',
      format: 'quarter-fold',
      pageSize: 'letter',
      orientation: 'landscape',
      pageCount: 8,
      description: 'Classic 8-page zine made from a single letter-size sheet',
      foldInstructions: 'Fold in half hamburger-style, then in half again. Unfold once, cut the center slit, then fold into a booklet.',
      printLayout: {
        // US Letter landscape 11x8.5 at 72 DPI
        sheetWidth: 792,
        sheetHeight: 612,
        pagePositions: [
          // Top row (upside down): 4, 3, 2, 1
          { pageNumber: 4, x: 0,       y: 0,        width: 792/4, height: 612/2, rotation: 180, isFlipped: false, side: 'front' },
          { pageNumber: 3, x: 792/4,  y: 0,        width: 792/4, height: 612/2, rotation: 180, isFlipped: false, side: 'front' },
          { pageNumber: 2, x: 792/2,  y: 0,        width: 792/4, height: 612/2, rotation: 180, isFlipped: false, side: 'front' },
          { pageNumber: 1, x: 792*3/4,y: 0,        width: 792/4, height: 612/2, rotation: 180, isFlipped: false, side: 'front' },
          // Bottom row (right side up): 5, 6, 7, 8
          { pageNumber: 5, x: 0,       y: 612/2,   width: 792/4, height: 612/2, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 6, x: 792/4,  y: 612/2,   width: 792/4, height: 612/2, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 7, x: 792/2,  y: 612/2,   width: 792/4, height: 612/2, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 8, x: 792*3/4,y: 612/2,   width: 792/4, height: 612/2, rotation: 0, isFlipped: false, side: 'front' }
        ]
      },
      pageCanvas: { width: 792/4, height: 612/2 }
    },
    {
      id: 'half-fold-letter',
      name: 'Half Fold Zine (Letter)',
      format: 'half-fold',
      pageSize: 'letter',
      orientation: 'landscape',
      pageCount: 4,
      description: 'Simple 4-page zine made from a single letter-size sheet folded in half',
      foldInstructions: 'Print double-sided, flipping on the long edge. Fold the sheet in half.',
      printLayout: {
        // Generates an image with Front (pages 4,1) and Back (pages 2,3) for double-sided printing
        sheetWidth: 792, // 11" at 72 DPI
        sheetHeight: 612, // 8.5" at 72 DPI
        pagePositions: [
          // Front side of sheet
          { pageNumber: 4, x: 0,    y: 0,     width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 1, x: 396,  y: 0,     width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          // Back side of sheet
          { pageNumber: 2, x: 0,    y: 0,     width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          { pageNumber: 3, x: 396,  y: 0,     width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
        ]
      }
    },
    {
      id: 'booklet-letter',
      name: 'Booklet (Letter)',
      format: 'booklet',
      pageSize: 'letter',
      orientation: 'landscape',
      pageCount: 16,
      description: '16-page booklet using 4 letter-size sheets (folded in half, saddle-stitched).',
      foldInstructions: 'Print double-sided flipping on the short edge. Stack in order, fold in half, staple at the spine.',
      printLayout: {
        // Each sheet is 11x8.5 (landscape). We'll render sides separately by filtering on side.
        sheetWidth: 792,
        sheetHeight: 612,
        pagePositions: [
          // Sheet 1 (outermost): Front: [16 | 1], Back: [2 | 15]
          { pageNumber: 16, x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 1,  x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 2,  x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          { pageNumber: 15, x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          // Sheet 2: Front: [14 | 3], Back: [4 | 13]
          { pageNumber: 14, x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 3,  x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 4,  x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          { pageNumber: 13, x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          // Sheet 3: Front: [12 | 5], Back: [6 | 11]
          { pageNumber: 12, x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 5,  x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 6,  x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          { pageNumber: 11, x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          // Sheet 4 (innermost): Front: [10 | 7], Back: [8 | 9]
          { pageNumber: 10, x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 7,  x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'front' },
          { pageNumber: 8,  x: 0,   y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' },
          { pageNumber: 9,  x: 396, y: 0, width: 396, height: 612, rotation: 0, isFlipped: false, side: 'back' }
        ]
      },
      // Canvas for a single booklet page (half of letter sheet when folded)
      pageCanvas: { width: 396, height: 612 }
    }
  ]);

  const selectedTemplate = ref<ZineTemplate | null>(null);

  function getTemplate(id: string): ZineTemplate | undefined {
    return templates.value.find(t => t.id === id);
  }

  function selectTemplate(template: ZineTemplate) {
    selectedTemplate.value = template;
  }

  function getTemplatesByFormat(format: ZineFormat): ZineTemplate[] {
    return templates.value.filter(t => t.format === format);
  }

  function getTemplatesByPageSize(pageSize: PageSize): ZineTemplate[] {
    return templates.value.filter(t => t.pageSize === pageSize);
  }

  return {
    templates,
    selectedTemplate,
    getTemplate,
    selectTemplate,
    getTemplatesByFormat,
    getTemplatesByPageSize
  };
});
