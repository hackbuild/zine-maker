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
    // removed outdated 'booklet-letter' per request
    {
      id: 'accordion-16-letter',
      name: 'Accordion 16 (Letter)',
      format: 'accordion',
      pageSize: 'letter',
      orientation: 'landscape',
      pageCount: 16,
      description: '16-page one-sheet cut-and-fold (accordion snake) on letter size',
      foldInstructions: 'Print double-sided. Cut along indicated lines and fold accordion-style following the snake order.',
      printLayout: {
        sheetWidth: 792,
        sheetHeight: 612,
        pagePositions: [
          // 4x4 grid; rotate portrait tiles into landscape slots
          // Top row (was upside down) -> rotate 270
          { pageNumber: 16, x:   0, y:   0, width: 198, height: 153, rotation: 270, isFlipped: false },
          { pageNumber: 14, x: 198, y:   0, width: 198, height: 153, rotation: 270, isFlipped: false },
          { pageNumber: 13, x: 396, y:   0, width: 198, height: 153, rotation: 270, isFlipped: false },
          { pageNumber: 12, x: 594, y:   0, width: 198, height: 153, rotation: 270, isFlipped: false },
          // Row 3 (upright) -> rotate 90
          { pageNumber: 8,  x:   0, y: 153, width: 198, height: 153, rotation: 90, isFlipped: false },
          { pageNumber: 9,  x: 198, y: 153, width: 198, height: 153, rotation: 90, isFlipped: false },
          { pageNumber: 10, x: 396, y: 153, width: 198, height: 153, rotation: 90, isFlipped: false },
          { pageNumber: 11, x: 594, y: 153, width: 198, height: 153, rotation: 90, isFlipped: false },
          // Row 2 (upside down) -> rotate 270
          { pageNumber: 7,  x:   0, y: 306, width: 198, height: 153, rotation: 270, isFlipped: false },
          { pageNumber: 6,  x: 198, y: 306, width: 198, height: 153, rotation: 270, isFlipped: false },
          { pageNumber: 5,  x: 396, y: 306, width: 198, height: 153, rotation: 270, isFlipped: false },
          { pageNumber: 4,  x: 594, y: 306, width: 198, height: 153, rotation: 270, isFlipped: false },
          // Bottom row (upright) -> rotate 90
          { pageNumber: 1,  x:   0, y: 459, width: 198, height: 153, rotation: 90, isFlipped: false },
          { pageNumber: 2,  x: 198, y: 459, width: 198, height: 153, rotation: 90, isFlipped: false },
          { pageNumber: 3,  x: 396, y: 459, width: 198, height: 153, rotation: 90, isFlipped: false },
          { pageNumber: 15, x: 594, y: 459, width: 198, height: 153, rotation: 90, isFlipped: false }
        ]
      },
      pageCanvas: { width: 153, height: 198 }
    }
    ,
    {
      id: 'booklet-half-letter-20',
      name: 'Booklet (Half Letter, 20 pages)',
      format: 'booklet',
      pageSize: 'letter',
      orientation: 'landscape',
      pageCount: 20,
      description: 'Saddle-stitched half-letter booklet; front cover is page 1, back cover page 20.',
      foldInstructions: 'Print double-sided (flip on short edge). Fold and staple at the spine.',
      printLayout: {
        sheetWidth: 792,
        sheetHeight: 612,
        pagePositions: []
      },
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
