<template>
  <div class="page-list" :class="{ collapsed: uiStore.pageListCollapsed }">
    <div class="page-list-header">
      <h3>Pages</h3>
      <span class="page-count">{{ projectStore.pageCount }} pages</span>
      <button class="collapse-button" @click="uiStore.togglePageListCollapsed()">{{ uiStore.pageListCollapsed ? '▸' : '▾' }}</button>
    </div>

    <div class="pages-grid">
      <div 
        v-for="(page, index) in projectStore.currentProject?.pages" 
        :key="page.id"
        class="page-item"
        :class="{ active: index === projectStore.currentPageIndex }"
        @click="projectStore.setCurrentPage(index)"
      >
        <div class="page-preview">
          <div class="page-number">{{ page.pageNumber }}</div>
          <div class="page-content-preview">
            <!-- Simple preview: draw a mini white page and shallow content bars -->
            <div class="mini-page">
              <div class="mini-content" v-for="(c, i) in page.content.slice(0,6)" :key="i" :style="{ width: (20 + (i%3)*20) + '%'}"></div>
            </div>
          </div>
        </div>
        <div class="page-info">
          <div class="page-title">{{ page.title }}</div>
          <div class="page-stats">{{ page.content.length }} items</div>
        </div>
      </div>
    </div>

    <div class="page-actions">
      <button @click="exportZine" class="export-button">
        Export Zine for Printing
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/project';
import { useUIStore } from '@/stores/ui';
import { useAssetStore } from '@/stores/assetStore';
import Konva from 'konva';
import jsPDF from 'jspdf';
import type { ZineContent, ShapeProperties, TextProperties, ImageProperties } from '@/types';

const projectStore = useProjectStore();
const uiStore = useUIStore();
const assetStore = useAssetStore();

async function exportZine(): Promise<void> {
  if (!projectStore.currentProject) {
    console.error('No current project to export.');
    return;
  }

  const template = projectStore.currentProject.template;
  
  // Create a truly off-screen container for rendering
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = `${template.printLayout.sheetWidth}px`;
  tempContainer.style.height = `${template.printLayout.sheetHeight}px`;
  document.body.appendChild(tempContainer);

  try {
    const stage = new Konva.Stage({
      container: tempContainer,
      width: template.printLayout.sheetWidth,
      height: template.printLayout.sheetHeight,
    });
    
    const layer = new Konva.Layer();
    stage.add(layer);
    
    // White background
    layer.add(new Konva.Rect({ x: 0, y: 0, width: stage.width(), height: stage.height(), fill: 'white' }));

    const nodePromises: Promise<void>[] = [];

    // Add all pages to the layout
    for (const pagePos of template.printLayout.pagePositions) {
      const page = projectStore.currentProject.pages.find(p => p.pageNumber === pagePos.pageNumber);
      if (!page) continue;

      const pageGroup = new Konva.Group({
        x: pagePos.x,
        y: pagePos.y,
        clip: { x: 0, y: 0, width: pagePos.width, height: pagePos.height },
      });

      // Page background
      pageGroup.add(new Konva.Rect({ 
        x: 0, y: 0,
        width: pagePos.width, 
        height: pagePos.height, 
        fill: page.backgroundColor || 'white'
      }));
      
      // Add content sorted by z-index (bottom to top)
      const sorted = [...page.content].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      for (const content of sorted) {
        const promise = createKonvaNode(content).then(node => {
          if (node) {
            pageGroup.add(node as Konva.Shape);
          }
        });
        nodePromises.push(promise);
      }

      // Apply transformations
      if (pagePos.rotation !== 0) {
        pageGroup.rotation(pagePos.rotation);
        pageGroup.offsetX(pagePos.width / 2);
        pageGroup.offsetY(pagePos.height / 2);
        pageGroup.x(pagePos.x + pagePos.width / 2);
        pageGroup.y(pagePos.y + pagePos.height / 2);
      }
      if (pagePos.isFlipped) {
        pageGroup.scaleX(-1);
        pageGroup.offsetX(pagePos.width);
      }

      layer.add(pageGroup);
    }

    // Add labels for two-sided printing if needed
    if (template.format === 'half-fold') {
      layer.add(new Konva.Text({
        x: 10, y: 10, text: 'FRONT SIDE - PRINT THIS SIDE FIRST', fontSize: 14, fill: 'black'
      }));
      layer.add(new Konva.Text({
        x: 10, y: 622, text: 'BACK SIDE - PRINT ON REVERSE', fontSize: 14, fill: 'black'
      }));
    }

    // Wait for ALL nodes (especially images) to be created and loaded
    await Promise.all(nodePromises);

    // Render and export
    await new Promise<void>(resolve => {
      layer.draw();
      stage.draw();
      requestAnimationFrame(() => {
        setTimeout(resolve, 100); // Small extra delay for safety
      });
    });

    const dataURL = stage.toDataURL({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      pixelRatio: 2
    });
    const pdf = await generatePDF(stage, template);
    
    // Show export modal
    // Record image intrinsic size so modal can scale precisely
    uiStore.exportImageWidth = stage.width() * 2; // pixelRatio
    uiStore.exportImageHeight = stage.height() * 2;
    uiStore.exportImageData = dataURL;
    uiStore.exportPdfData = pdf;
    uiStore.showExportModal = true;

  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please check the console for details.');
  } finally {
    // Cleanup container and stage regardless of success or failure
    if (tempContainer) {
      document.body.removeChild(tempContainer);
    }
  }
}

async function generatePDF(stage: Konva.Stage, template: any): Promise<string> {
  // Convert points to inches (72 DPI)
  const widthInches = template.printLayout.sheetWidth / 72;
  const heightInches = template.printLayout.sheetHeight / 72;
  
  const pdf = new jsPDF({
    orientation: widthInches > heightInches ? 'landscape' : 'portrait',
    unit: 'in',
    format: [widthInches, heightInches]
  });

  const dataURL = stage.toDataURL({ pixelRatio: 2 });
  pdf.addImage(dataURL, 'PNG', 0, 0, widthInches, heightInches);
  
  return pdf.output('datauristring');
}

async function createKonvaNode(content: ZineContent): Promise<Konva.Node | null> {
  const commonConfig = {
    x: content.x,
    y: content.y,
    width: content.width,
    height: content.height,
    rotation: content.rotation,
  };

  if (content.type === 'shape') {
    const p = content.properties as ShapeProperties;
    const shapeConfig = { ...commonConfig, fill: p.fill, stroke: p.stroke, strokeWidth: p.strokeWidth, opacity: p.opacity };
    if (p.shapeType === 'rectangle') {
      return new Konva.Rect({ ...shapeConfig, cornerRadius: p.cornerRadius || 0 });
    } else if (p.shapeType === 'circle') {
      const r = Math.min(content.width, content.height) / 2;
      return new Konva.Circle({ ...shapeConfig, x: commonConfig.x + r, y: commonConfig.y + r, radius: r });
    } else if (p.shapeType === 'triangle') {
        return new Konva.RegularPolygon({ ...shapeConfig, x: commonConfig.x + content.width / 2, y: commonConfig.y + content.height / 2, sides: 3, radius: Math.min(content.width, content.height) / 2 });
    } else { // line
        return new Konva.Line({ ...shapeConfig, points: [0, content.height / 2, content.width, content.height / 2], stroke: p.stroke, strokeWidth: p.strokeWidth, lineCap: 'round' });
    }
  }

  if (content.type === 'text') {
    const p = content.properties as TextProperties;
    return new Konva.Text({
      ...commonConfig,
      text: p.text, fontSize: p.fontSize, fontFamily: p.fontFamily,
      fontStyle: `${p.fontStyle} ${p.fontWeight}`.trim(), fill: p.color, align: p.textAlign,
    });
  }

  if (content.type === 'image') {
    const p = content.properties as ImageProperties;
    return new Promise((resolve, reject) => {
      const imageObj = new window.Image();
      imageObj.crossOrigin = 'anonymous';
      imageObj.onload = () => {
        const konvaImage = new Konva.Image({
          ...commonConfig,
          image: imageObj,
          opacity: p.opacity,
        });
        resolve(konvaImage);
      };
      imageObj.onerror = () => reject(new Error(`Failed to load image from src: ${p.src}`));

      if (p.assetId) {
        assetStore.getAsset(p.assetId).then(file => {
          if (file) {
            imageObj.src = URL.createObjectURL(file);
          } else {
            reject(new Error(`Asset not found in database for ID: ${p.assetId}`));
          }
        });
      } else {
        imageObj.src = p.src;
      }
    });
  }

  if (content.type === 'drawing') {
    const p = content.properties as any; // DrawingProperties
    const group = new Konva.Group({ ...commonConfig });

    if (p.paths && p.paths.length > 0) {
      p.paths.forEach((path: any) => {
        const points = path.points.flatMap((pt: any) => [pt.x, pt.y]);
        const line = new Konva.Line({
          points,
          stroke: p.strokeColor,
          strokeWidth: p.strokeWidth,
          opacity: p.opacity,
          lineCap: p.lineCap || 'round',
          lineJoin: p.lineJoin || 'round',
          tension: p.smoothing ? 0.5 : 0,
        });
        group.add(line);
      });
    }
    return group;
  }

  return null;
}
</script>

<style scoped>
.page-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.75rem;
  background: var(--panel);
  border-right: 1px solid var(--border-soft);
}
.page-list.collapsed { width: 40px; }
.page-list.collapsed .pages-grid, .page-list.collapsed .page-actions, .page-list.collapsed .page-count { display: none; }
.page-list.collapsed .page-list-header h3 { display: none; }

.page-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-soft);
}

.page-list-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ui-ink);
}

.page-count {
  color: var(--ui-ink);
  font-size: 0.8rem;
}
.collapse-button { border: none; background: transparent; color: var(--ui-ink); cursor: pointer; }

.pages-grid {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-right: -0.5rem;
  padding-right: 0.5rem;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.page-item.active {
  border-color: #000;
  box-shadow: 2px 2px 0 #000;
  background: #e7ffe7;
}

.page-preview {
  position: relative;
  width: 64px;
  height: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.page-content-preview {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
}
.mini-page { background: #fff; border: 1px solid var(--border-soft); width: 100%; height: 100%; position: relative; }
.mini-content { height: 3px; background: var(--border); margin: 2px; }

.page-info {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-stats {
  font-size: 0.75rem;
  color: #6b7280;
}

.page-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.export-button {
  width: 100%;
  padding: 0.6rem;
  background: var(--accent-red);
  color: #fff;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
  transform: translate(0,0);
  transition: transform .04s, box-shadow .04s;
}

.export-button:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }
</style>
