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
      orientation: 'portrait',
      pageCount: 8,
      description: 'Classic 8-page zine made from a single letter-size sheet',
      foldInstructions: 'Fold in half hamburger-style, then in half again. Unfold once, cut the center slit, then fold into a booklet.',
      printLayout: {
        // Standard US Letter size at 72 DPI
        sheetWidth: 612, 
        sheetHeight: 792,
        pagePositions: [
          // This is a standard 8-page zine imposition layout.
          // The top row is printed upside down.
          // After printing, fold the sheet in half hamburger-style, then hotdog-style.
          // Cut along the center horizontal line between pages.
          // Finally, fold into a booklet.
          { pageNumber: 4, x: 0,    y: 0,     width: 306, height: 198, rotation: 180, isFlipped: false },
          { pageNumber: 5, x: 306,  y: 0,     width: 306, height: 198, rotation: 180, isFlipped: false },
          { pageNumber: 8, x: 0,    y: 198,   width: 306, height: 198, rotation: 180, isFlipped: false },
          { pageNumber: 1, x: 306,  y: 198,   width: 306, height: 198, rotation: 180, isFlipped: false },
          { pageNumber: 2, x: 306,  y: 396,   width: 306, height: 198, rotation: 0, isFlipped: false },
          { pageNumber: 7, x: 0,    y: 396,   width: 306, height: 198, rotation: 0, isFlipped: false },
          { pageNumber: 6, x: 0,    y: 594,   width: 306, height: 198, rotation: 0, isFlipped: false },
          { pageNumber: 3, x: 306,  y: 594,   width: 306, height: 198, rotation: 0, isFlipped: false }
        ]
      }
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
        sheetHeight: 612 * 2, // 8.5" * 2 to show front and back
        pagePositions: [
          // Front side of sheet
          { pageNumber: 4, x: 0,    y: 0,     width: 396, height: 612, rotation: 0, isFlipped: false },
          { pageNumber: 1, x: 396,  y: 0,     width: 396, height: 612, rotation: 0, isFlipped: false },
          // Back side of sheet (printed below the front)
          { pageNumber: 2, x: 0,    y: 612,   width: 396, height: 612, rotation: 0, isFlipped: false },
          { pageNumber: 3, x: 396,  y: 612,   width: 396, height: 612, rotation: 0, isFlipped: false },
        ]
      }
    },
    {
      id: 'booklet-letter',
      name: 'Booklet (Letter)',
      format: 'booklet',
      pageSize: 'letter',
      orientation: 'portrait',
      pageCount: 16,
      description: '16-page booklet using 4 letter-size sheets',
      foldInstructions: 'Print 4 sheets, stack them, fold in half, and staple along the spine',
      printLayout: {
        sheetWidth: 816,
        sheetHeight: 1056,
        pagePositions: [
          // Sheet 1
          { pageNumber: 16, x: 0, y: 0, width: 408, height: 528, rotation: 0, isFlipped: false },
          { pageNumber: 1, x: 408, y: 0, width: 408, height: 528, rotation: 0, isFlipped: false },
          { pageNumber: 2, x: 0, y: 528, width: 408, height: 528, rotation: 180, isFlipped: true },
          { pageNumber: 15, x: 408, y: 528, width: 408, height: 528, rotation: 180, isFlipped: true },
          // Additional sheets would be calculated dynamically
        ]
      }
    },
    {
      id: 'quarter-fold-a4',
      name: 'Quarter Fold Zine (A4)',
      format: 'quarter-fold',
      pageSize: 'a4',
      orientation: 'portrait',
      pageCount: 8,
      description: 'Classic 8-page zine made from a single A4 sheet',
      foldInstructions: 'Fold in half horizontally, then in half vertically, then cut along the fold to create pages',
      printLayout: {
        sheetWidth: 595, // A4 width at 72 DPI
        sheetHeight: 842, // A4 height at 72 DPI
        pagePositions: [
          { pageNumber: 1, x: 297, y: 0, width: 298, height: 211, rotation: 0, isFlipped: false },
          { pageNumber: 2, x: 0, y: 0, width: 297, height: 211, rotation: 0, isFlipped: false },
          { pageNumber: 7, x: 0, y: 211, width: 297, height: 211, rotation: 0, isFlipped: false },
          { pageNumber: 8, x: 297, y: 211, width: 298, height: 211, rotation: 0, isFlipped: false },
          { pageNumber: 3, x: 0, y: 422, width: 297, height: 211, rotation: 180, isFlipped: true },
          { pageNumber: 4, x: 297, y: 422, width: 298, height: 211, rotation: 180, isFlipped: true },
          { pageNumber: 5, x: 297, y: 633, width: 298, height: 209, rotation: 180, isFlipped: true },
          { pageNumber: 6, x: 0, y: 633, width: 297, height: 209, rotation: 180, isFlipped: true },
        ]
      }
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
