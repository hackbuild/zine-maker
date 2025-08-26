<template>
  <div class="page-editor">
    <div class="editor-toolbar">
      <div class="toolbar-section">
        <button 
          v-for="tool in toolsStore.tools" 
          :key="tool.id"
          @click="toolsStore.setActiveTool(tool.id)"
          :class="{ active: toolsStore.activeTool === tool.id }"
          class="tool-button"
          :title="`${tool.name} (${tool.shortcut})`"
        >
          {{ tool.icon }}
        </button>
      </div>

      <div class="toolbar-section">
        <button @click="addText" class="action-button">Add Text</button>
        <button @click="addShape" class="action-button">Add Shape</button>
        <input 
          type="file" 
          @change="handleImageUpload" 
          accept="image/*" 
          ref="imageInput" 
          style="display: none"
        />
        <button @click="imageInput?.click()" class="action-button">Add Image</button>
      </div>

      <div class="toolbar-section" v-if="hasSelection">
        <label>Color:</label>
        <input 
          type="color" 
          v-model="selectedColor" 
          @input="updateSelectedColor"
          class="color-picker"
        />
        <label>Size:</label>
        <input 
          type="range" 
          v-model.number="selectedSize" 
          @input="updateSelectedSize"
          min="8" 
          max="72" 
          class="size-slider"
        />
        <span>{{ selectedSize }}px</span>
      </div>

      <div class="toolbar-section">
        <button @click="deleteSelected" :disabled="!hasSelection" class="action-button">Delete</button>
        <button @click="duplicateSelected" :disabled="!hasSelection" class="action-button">Duplicate</button>
      </div>
    </div>

    <div class="editor-content">
      <div class="page-canvas" ref="canvasContainer">
        <canvas 
          ref="canvas" 
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @click="handleCanvasClick"
          @dblclick="handleDoubleClick"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useToolsStore } from '@/stores/tools';
// import { useUIStore } from '@/stores/ui';
import type { ZineContent, TextProperties, ImageProperties, ShapeProperties } from '@/types';

const projectStore = useProjectStore();
const toolsStore = useToolsStore();
// const uiStore = useUIStore(); // Not used currently

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let isDragging = false;
let dragStart = { x: 0, y: 0 };

const hasSelection = computed(() => projectStore.selectedContentIds.length > 0);
const selectedColor = ref('#000000');
const selectedSize = ref(16);

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
    setupCanvas();
    renderPage();
  }
});

watch(() => projectStore.currentPage, () => {
  nextTick(() => renderPage());
});

watch(() => projectStore.selectedContentIds, () => {
  renderPage();
});

function setupCanvas(): void {
  if (!canvas.value || !projectStore.currentProject) return;

  const template = projectStore.currentProject.template;
  const pagePos = template.printLayout.pagePositions[0]; // Use first page position for sizing
  
  canvas.value.width = pagePos.width;
  canvas.value.height = pagePos.height;
  canvas.value.style.border = '1px solid #ccc';
}

function renderPage(): void {
  if (!ctx || !canvas.value || !projectStore.currentPage) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // Draw background
  ctx.fillStyle = projectStore.currentPage.backgroundColor;
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);

  // Draw content
  projectStore.currentPage.content.forEach(content => {
    drawContent(content);
  });
}

function drawContent(content: ZineContent): void {
  if (!ctx) return;

  ctx.save();
  ctx.translate(content.x + content.width / 2, content.y + content.height / 2);
  ctx.rotate((content.rotation * Math.PI) / 180);
  ctx.translate(-content.width / 2, -content.height / 2);

  switch (content.type) {
    case 'text':
      drawText(content);
      break;
    case 'image':
      drawImage(content);
      break;
    case 'shape':
      drawShape(content);
      break;
  }

  // Draw selection border
  if (projectStore.selectedContentIds.includes(content.id)) {
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-2, -2, content.width + 4, content.height + 4);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawText(content: ZineContent): void {
  if (!ctx || content.type !== 'text') return;

  const props = content.properties as TextProperties;
  ctx.fillStyle = props.color;
  ctx.font = `${props.fontWeight} ${props.fontSize}px ${props.fontFamily}`;
  ctx.textAlign = props.textAlign as CanvasTextAlign;
  
  const lines = props.text.split('\n');
  const lineHeight = props.fontSize * props.lineHeight;
  
  lines.forEach((line, index) => {
    const y = index * lineHeight + props.fontSize;
    let x = 0;
    
    switch (props.textAlign) {
      case 'center':
        x = content.width / 2;
        break;
      case 'right':
        x = content.width;
        break;
      default:
        x = 0;
    }
    
    ctx?.fillText(line, x, y);
  });
}

function drawImage(content: ZineContent): void {
  if (!ctx || content.type !== 'image') return;

  const props = content.properties as ImageProperties;
  const img = new Image();
  
  img.onload = () => {
    if (ctx) {
      ctx.globalAlpha = props.opacity;
      ctx.drawImage(img, 0, 0, content.width, content.height);
      ctx.globalAlpha = 1;
    }
  };
  
  img.src = props.src;
}

function drawShape(content: ZineContent): void {
  if (!ctx || content.type !== 'shape') return;

  const props = content.properties as ShapeProperties;
  
  ctx.globalAlpha = props.opacity;
  ctx.fillStyle = props.fill;
  ctx.strokeStyle = props.stroke;
  ctx.lineWidth = props.strokeWidth;

  switch (props.shapeType) {
    case 'rectangle':
      ctx.fillRect(0, 0, content.width, content.height);
      if (props.strokeWidth > 0) {
        ctx.strokeRect(0, 0, content.width, content.height);
      }
      break;
    case 'circle':
      const radius = Math.min(content.width, content.height) / 2;
      ctx.beginPath();
      ctx.arc(content.width / 2, content.height / 2, radius, 0, 2 * Math.PI);
      ctx.fill();
      if (props.strokeWidth > 0) {
        ctx.stroke();
      }
      break;
  }
  
  ctx.globalAlpha = 1;
}

function handleCanvasClick(event: MouseEvent): void {
  const rect = canvas.value?.getBoundingClientRect();
  if (!rect) return;

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (toolsStore.activeTool === 'text') {
    addTextAt(x, y);
  } else if (toolsStore.activeTool === 'shape') {
    addShapeAt(x, y);
  } else if (toolsStore.activeTool === 'select') {
    selectContentAt(x, y);
  }
}

function handleDoubleClick(event: MouseEvent): void {
  const rect = canvas.value?.getBoundingClientRect();
  if (!rect) return;

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Find text content at this position
  if (projectStore.currentPage) {
    const textContent = projectStore.currentPage.content.find(content => 
      content.type === 'text' &&
      x >= content.x && x <= content.x + content.width &&
      y >= content.y && y <= content.y + content.height
    );

    if (textContent) {
      const newText = prompt('Edit text:', (textContent.properties as TextProperties).text);
      if (newText !== null) {
        const props = textContent.properties as TextProperties;
        projectStore.updateContent(textContent.id, {
          properties: { ...props, text: newText }
        });
      }
    }
  }
}

function selectContentAt(x: number, y: number): void {
  if (!projectStore.currentPage) return;

  // Find content at position (reverse order to get top-most)
  const content = [...projectStore.currentPage.content]
    .reverse()
    .find(c => 
      x >= c.x && x <= c.x + c.width &&
      y >= c.y && y <= c.y + c.height
    );

  if (content) {
    projectStore.selectContent(content.id);
  } else {
    projectStore.clearSelection();
  }
}

function addText(): void {
  addTextAt(50, 50);
}

function addTextAt(x: number, y: number): void {
  const textContent: Omit<ZineContent, 'id'> = {
    type: 'text',
    x,
    y,
    width: 200,
    height: 50,
    rotation: 0,
    zIndex: Date.now(),
    properties: {
      text: 'New Text',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      textAlign: 'left',
      lineHeight: 1.2
    } as TextProperties
  };

  projectStore.addContentToCurrentPage(textContent);
}

function addShape(): void {
  addShapeAt(50, 50);
}

function addShapeAt(x: number, y: number): void {
  const shapeContent: Omit<ZineContent, 'id'> = {
    type: 'shape',
    x,
    y,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: Date.now(),
    properties: {
      shapeType: 'rectangle',
      fill: '#007bff',
      stroke: '#000000',
      strokeWidth: 1,
      opacity: 1
    } as ShapeProperties
  };

  projectStore.addContentToCurrentPage(shapeContent);
}

function handleImageUpload(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      addImageContent(src);
    };
    reader.readAsDataURL(file);
  }
}

function addImageContent(src: string): void {
  const imageContent: Omit<ZineContent, 'id'> = {
    type: 'image',
    x: 50,
    y: 50,
    width: 150,
    height: 150,
    rotation: 0,
    zIndex: Date.now(),
    properties: {
      src,
      alt: 'Uploaded image',
      opacity: 1
    } as ImageProperties
  };

  projectStore.addContentToCurrentPage(imageContent);
}

function deleteSelected(): void {
  projectStore.selectedContentIds.forEach(id => {
    projectStore.deleteContent(id);
  });
}

function duplicateSelected(): void {
  projectStore.selectedContentIds.forEach(id => {
    projectStore.duplicateContent(id);
  });
}

function handleMouseDown(event: MouseEvent): void {
  if (toolsStore.activeTool === 'select') {
    isDragging = true;
    const rect = canvas.value?.getBoundingClientRect();
    if (rect) {
      dragStart.x = event.clientX - rect.left;
      dragStart.y = event.clientY - rect.top;
    }
  }
}

function handleMouseMove(event: MouseEvent): void {
  if (isDragging && toolsStore.activeTool === 'select') {
    const rect = canvas.value?.getBoundingClientRect();
    if (!rect) return;

    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    // Move selected content
    projectStore.selectedContentIds.forEach(id => {
      const content = projectStore.getContentById(id);
      if (content) {
        projectStore.updateContent(id, {
          x: content.x + deltaX,
          y: content.y + deltaY
        });
      }
    });

    dragStart.x = currentX;
    dragStart.y = currentY;
  }
}

function handleMouseUp(): void {
  isDragging = false;
}

function updateSelectedColor(): void {
  projectStore.selectedContentIds.forEach(id => {
    const content = projectStore.getContentById(id);
    if (content) {
      if (content.type === 'text') {
        const props = content.properties as TextProperties;
        projectStore.updateContent(id, {
          properties: { ...props, color: selectedColor.value }
        });
      } else if (content.type === 'shape') {
        const props = content.properties as ShapeProperties;
        projectStore.updateContent(id, {
          properties: { ...props, fill: selectedColor.value }
        });
      }
    }
  });
}

function updateSelectedSize(): void {
  projectStore.selectedContentIds.forEach(id => {
    const content = projectStore.getContentById(id);
    if (content && content.type === 'text') {
      const props = content.properties as TextProperties;
      projectStore.updateContent(id, {
        properties: { ...props, fontSize: selectedSize.value }
      });
    }
  });
}
</script>

<style scoped>
.page-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.toolbar-section label {
  font-size: 0.9rem;
  color: #555;
  margin-left: 1rem;
}

.color-picker {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.size-slider {
  width: 80px;
}

.tool-button {
  padding: 0.5rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  min-width: 40px;
  font-weight: bold;
}

.tool-button:hover {
  background: #f0f0f0;
}

.tool-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.action-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.action-button:hover:not(:disabled) {
  background: #f0f0f0;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f5f5f5;
}

.page-canvas {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 1rem;
}

canvas {
  display: block;
  cursor: crosshair;
}
</style>
