<template>
  <div class="konva-page-editor">
    <AppToolbar />

    <div class="stage-wrapper" ref="stageWrapper">
      <div class="canvas-container">
        <v-stage
          ref="stageRef"
          :config="stageConfig"
          @wheel="onWheel"
          @mousedown="onStageMouseDown"
          @mousemove="onStageMouseMove"
          @mouseup="onStageMouseUp"
          @click="onStageClick"
          @tap="onStageClick"
        >
          <v-layer ref="contentLayerRef">
            <!-- Background page -->
            <v-rect :config="pageBackgroundConfig" />
            
            <!-- Render shapes/images/text -->
            <template v-for="node in pageNodes" :key="node.id">
              <v-rect
                v-if="node.kind === 'shape' && node.shapeType === 'rectangle'"
                :config="node.config"
                @click="selectNode(node.id, $event)"
                @dragend="onDragEnd(node.id, $event)"
              />
              <v-circle
                v-else-if="node.kind === 'shape' && node.shapeType === 'circle'"
                :config="node.config"
                @click="selectNode(node.id, $event)"
                @dragend="onDragEnd(node.id, $event)"
              />
              <v-line
                v-else-if="node.kind === 'shape' && node.shapeType === 'line'"
                :config="node.config"
                @click="selectNode(node.id, $event)"
                @dragend="onDragEnd(node.id, $event)"
              />
              <v-regular-polygon
                v-else-if="node.kind === 'shape' && node.shapeType === 'triangle'"
                :config="node.config"
                @click="selectNode(node.id, $event)"
                @dragend="onDragEnd(node.id, $event)"
              />
              <v-text
                v-else-if="node.kind === 'text'"
                :config="node.config"
                @click="selectNode(node.id, $event)"
                @dblclick="startTextEdit(node.id, $event)"
                @dragend="onDragEnd(node.id, $event)"
              />
              <v-image
                v-else-if="node.kind === 'image'"
                :config="node.config"
                @click="selectNode(node.id, $event)"
                @dragend="onDragEnd(node.id, $event)"
              />
              <v-line
                v-else-if="node.kind === 'drawing'"
                :config="node.config"
                @click="selectNode(node.id, $event)"
                @dragend="onDragEnd(node.id, $event)"
              />
            </template>

            <!-- Selection marquee -->
            <v-rect v-if="isSelecting"
              :config="{ x: selectionRect.x, y: selectionRect.y, width: selectionRect.width, height: selectionRect.height, stroke: '#2563eb', dash: [4,4], listening: false }"
            />

            <!-- Konva Transformer -->
            <v-transformer
              v-if="hasSelection"
              ref="transformerRef"
              :config="transformerConfig"
            />
          </v-layer>
        </v-stage>
      </div>

      <!-- Text editor overlay -->
      <textarea
        v-if="editingText.visible"
        ref="textAreaRef"
        v-model="editingText.value"
        class="text-editor"
        :style="editingText.style"
        @blur="commitTextEdit"
        @keydown.enter.prevent="commitTextEdit"
        @keydown.esc.prevent="cancelTextEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, shallowRef } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useToolsStore } from '@/stores/tools';
import { useAssetStore } from '@/stores/assetStore';
import type { TextProperties, ImageProperties, ShapeProperties } from '@/types';
import Konva from 'konva';
import AppToolbar from './AppToolbar.vue';
import { useUIStore } from '@/stores/ui';

const projectStore = useProjectStore();
const toolsStore = useToolsStore();
const assetStore = useAssetStore();
const uiStore = useUIStore();

const stageRef = ref<any>(null);
const contentLayerRef = ref<any>(null);
const transformerRef = ref<any>(null);
const stageWrapper = ref<HTMLDivElement | null>(null);

const scaleBy = 1.05;

const stageConfig = computed(() => {
  const width = pageBackgroundConfig.value.width + 100;
  const height = pageBackgroundConfig.value.height + 100;
  return { width, height, draggable: isSpacePanning.value || toolsStore.activeTool === 'pan' };
});

const selectedIds = computed(() => projectStore.selectedContentIds);
const hasSelection = computed(() => selectedIds.value.length > 0);

// Page background config
const pageBackgroundConfig = computed(() => {
  const template = projectStore.currentProject?.template;
  if (!template) return { id: 'page-background', x: 50, y: 50, width: 400, height: 300, fill: 'white', stroke: '#e5e7eb', strokeWidth: 1 };
  
  const pagePos = template.printLayout.pagePositions[0];
  return {
    id: 'page-background',
    x: 50,
    y: 50,
    width: pagePos.width,
    height: pagePos.height,
    fill: 'white',
    listening: true // use as deselect area only
  };
});

// Build Konva configs from current page content
const pageNodes = shallowRef<any[]>([]);

watch(() => projectStore.currentPage?.content, async (content) => {
  if (!content) {
    pageNodes.value = [];
    return;
  }

  const nodes = await Promise.all(content.map(async (c) => {
    const common = {
      id: c.id,
      x: c.x + pageBackgroundConfig.value.x,
      y: c.y + pageBackgroundConfig.value.y,
      width: c.width,
      height: c.height,
      rotation: c.rotation,
      draggable: toolsStore.activeTool === 'select'
    };

    if (c.type === 'shape') {
      const p = c.properties as ShapeProperties;
      const shapeCommon = {
        ...common,
        fill: p.fill,
        stroke: p.stroke,
        strokeWidth: p.strokeWidth,
        opacity: p.opacity,
      };
      if (p.shapeType === 'rectangle') {
        return { id: c.id, kind: 'shape', shapeType: 'rectangle', config: { ...shapeCommon, cornerRadius: p.cornerRadius || 0 } };
      } else if (p.shapeType === 'circle') {
        const r = Math.min(c.width, c.height) / 2;
        return { id: c.id, kind: 'shape', shapeType: 'circle', config: { ...shapeCommon, x: common.x + r, y: common.y + r, radius: r } };
      } else if (p.shapeType === 'triangle') {
        return { id: c.id, kind: 'shape', shapeType: 'triangle', config: { ...shapeCommon, x: common.x + c.width / 2, y: common.y + c.height / 2, sides: 3, radius: Math.min(c.width, c.height) / 2 }};
      } else {
        return { id: c.id, kind: 'shape', shapeType: 'line', config: { ...shapeCommon, points: [0, c.height / 2, c.width, c.height / 2], stroke: p.stroke, strokeWidth: p.strokeWidth, lineCap: 'round' } };
      }
    }
    if (c.type === 'text') {
      const p = c.properties as TextProperties;
      return {
        id: c.id,
        kind: 'text',
        config: {
          ...common,
          text: p.text,
          fontSize: p.fontSize,
          fontFamily: p.fontFamily,
          fontStyle: `${p.fontStyle} ${p.fontWeight}`.trim(),
          fill: p.color,
          align: p.textAlign,
        }
      };
    }
    if (c.type === 'image') {
      const p = c.properties as ImageProperties;
      const imageObj = new window.Image();
      
      if (p.assetId) {
        const file = await assetStore.getAsset(p.assetId);
        if (file) {
          imageObj.src = URL.createObjectURL(file);
        }
      } else {
        imageObj.src = p.src;
      }

      return {
        id: c.id,
        kind: 'image',
        config: {
          ...common,
          image: imageObj,
          opacity: p.opacity,
        }
      };
    }
    if (c.type === 'drawing') {
      const p = c.properties as any; // DrawingProperties
      // For now, render the first path as a simple line
      if (p.paths && p.paths.length > 0) {
        const path = p.paths[0];
        const points = path.points.flatMap((pt: any) => [
          pt.x + c.x + pageBackgroundConfig.value.x, 
          pt.y + c.y + pageBackgroundConfig.value.y
        ]);
        return {
          id: c.id,
          kind: 'drawing',
          config: {
            x: 0, // Points are already absolute
            y: 0,
            points,
            stroke: p.strokeColor,
            strokeWidth: p.strokeWidth,
            opacity: p.opacity,
            lineCap: p.lineCap || 'round',
            lineJoin: p.lineJoin || 'round',
            tension: p.smoothing ? 0.5 : 0,
            draggable: toolsStore.activeTool === 'select',
            listening: true, // Ensure it can receive events
            hitStrokeWidth: Math.max(p.strokeWidth, 10) // Make thin lines easier to select
          }
        };
      }
    }
    return { id: c.id, kind: 'unknown', config: {} };
  }));
  
  pageNodes.value = nodes;
}, { deep: true, immediate: true });


function attachTransformer() {
  nextTick(() => {
    const stage = stageRef.value?.getNode?.();
    const tr = transformerRef.value?.getNode?.();
    if (!stage || !tr) return;

    // First, detach all nodes
    tr.nodes([]);

    // If no selection, ensure transformer is hidden and exit
    if (selectedIds.value.length === 0) {
      tr.hide();
      const layer = contentLayerRef.value?.getNode?.();
      layer?.batchDraw();
      return;
    }

    const nodesToAttach: Konva.Node[] = [];
    selectedIds.value.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        nodesToAttach.push(node as Konva.Node);
      }
    });

    if (nodesToAttach.length > 0) {
      tr.nodes(nodesToAttach);
      tr.show();
    } else {
      tr.hide();
    }
    
    const layer = contentLayerRef.value?.getNode?.();
    layer?.batchDraw();
  });
}

watch(selectedIds, () => attachTransformer(), { immediate: true });
watch(pageNodes, () => attachTransformer());

function selectNode(id: string, e?: any) {
  if (toolsStore.activeTool === 'select') {
    const isShiftKey = !!e?.evt?.shiftKey;
    projectStore.selectContent(id, isShiftKey);
    
    // Prevent event bubbling to avoid deselection
    if (e?.evt) {
      e.evt.stopPropagation();
    }
  }
}

function onDragEnd(id: string, e: any) {
  const node = e.target as Konva.Node;
  
  if (node.className === 'Line') {
    // Special handling for Line objects (drawings)
    // Lines don't have x/y position like other shapes, they use points
    // We need to update the content's position based on the line's movement
    const content = projectStore.getContentById(id);
    if (content && content.type === 'drawing') {
      const points = (node as any).points();
      if (points && points.length >= 4) {
        const xCoords = points.filter((_: any, i: number) => i % 2 === 0);
        const yCoords = points.filter((_: any, i: number) => i % 2 === 1);
        const minX = Math.min(...xCoords);
        const minY = Math.min(...yCoords);
        
        // Update the content position
        projectStore.updateContent(id, { 
          x: minX - pageBackgroundConfig.value.x, 
          y: minY - pageBackgroundConfig.value.y 
        });
      }
    }
  } else {
    // Standard handling for other shapes
    const { x, y } = node.position();
    projectStore.updateContent(id, { x: x - pageBackgroundConfig.value.x, y: y - pageBackgroundConfig.value.y });
  }
}

function onWheel(e: any) {
  const stage = stageRef.value?.getNode?.();
  if (!stage) return;
  
  const evt = e.evt;
  if (evt && evt.preventDefault) {
    evt.preventDefault();
  }
  
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const direction = evt.deltaY > 0 ? 1 : -1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  stage.scale({ x: newScale, y: newScale });

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
  stage.batchDraw();
}

// Watch for fit requests from UI store
watch(() => uiStore.shouldFit, (flag) => {
  if (!flag) return;
  const stage = stageRef.value?.getNode?.();
  if (!stage) { uiStore.shouldFit = false as any; return; }
  const bg = pageBackgroundConfig.value;
  const container = stage.container().parentElement as HTMLElement;
  const availW = container?.clientWidth || stage.width();
  const availH = container?.clientHeight || stage.height();
  const margin = 80;
  const scale = Math.min((availW - margin) / (bg.width + 100), (availH - margin) / (bg.height + 100));
  stage.scale({ x: scale, y: scale });
  const centerX = (availW - (bg.width + 100) * scale) / 2;
  const centerY = (availH - (bg.height + 100) * scale) / 2;
  stage.position({ x: centerX, y: centerY });
  stage.batchDraw();
  uiStore.shouldFit = false as any;
});

onMounted(() => {
  const tr = transformerRef.value?.getNode?.();
  const layer = contentLayerRef.value?.getNode?.();
  if (!tr || !layer) return;

  tr.on('transformend', () => {
    const nodes = tr.nodes() as Konva.Node[];
    nodes.forEach((node) => {
      const id = node.id();
      const rotation = node.rotation();
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const width = (node.width() as number) * scaleX;
      const height = (node.height() as number) * scaleY;
      node.scale({ x: 1, y: 1 });
      const pos = node.position();
      projectStore.updateContent(id, { x: pos.x - pageBackgroundConfig.value.x, y: pos.y - pageBackgroundConfig.value.y, width, height, rotation });
    });
    layer.batchDraw();
  });
});

const transformerConfig = { 
  rotateAnchorOffset: 20, 
  enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center'] 
};

const isSelecting = ref(false);
const selectionStart = ref({ x: 0, y: 0 });
const selectionRect = ref({ x: 0, y: 0, width: 0, height: 0 });

function toStagePoint(stage: Konva.Stage, p: {x:number; y:number}) {
  const scale = stage.scaleX();
  const pos = stage.position();
  return { x: (p.x - pos.x) / scale, y: (p.y - pos.y) / scale };
}

function onStageMouseDown(e: any) {
  const stage = stageRef.value?.getNode?.();
  if (!stage) return;

  // Handle drawing tool
  if (toolsStore.activeTool === 'draw') {
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Create a new line for drawing
    const layer = contentLayerRef.value?.getNode?.();
    if (!layer) return;

    const settings = toolsStore.drawingSettings;
    lastLine = new Konva.Line({
      stroke: settings.strokeColor,
      strokeWidth: settings.strokeWidth,
      opacity: settings.opacity,
      globalCompositeOperation: 'source-over',
      lineCap: settings.lineCap,
      lineJoin: settings.lineJoin,
      points: [pos.x, pos.y],
      tension: settings.smoothing ? 0.5 : 0, // Add smoothing
    });
    
    layer.add(lastLine);
    isDrawing.value = true;
    return;
  }

  // Handle selection tool
  if (toolsStore.activeTool !== 'select') return;

  // Check if we clicked on the stage (empty area) or page background
  const clickedOnEmpty = e.target === stage || e.target.id?.() === 'page-background';
  
  if (clickedOnEmpty) {
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const sp = toStagePoint(stage, pos);
    selectionStart.value = sp;
    selectionRect.value = { x: sp.x, y: sp.y, width: 0, height: 0 };
    isSelecting.value = true;
    
    // Only clear selection if not holding shift
    if (!e.evt?.shiftKey) {
      projectStore.clearSelection();
    }
  }
}

function onStageMouseMove() {
  if (isDrawing.value && lastLine) {
    const stage = stageRef.value?.getNode?.();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Add point smoothing for better drawing experience
    const currentPoints = lastLine.points();
    const lastX = currentPoints[currentPoints.length - 2];
    const lastY = currentPoints[currentPoints.length - 1];
    
    // Only add point if it's far enough from the last point (reduces jitter)
    const distance = Math.sqrt(Math.pow(pos.x - lastX, 2) + Math.pow(pos.y - lastY, 2));
    if (distance > 2) {
      const newPoints = currentPoints.concat([pos.x, pos.y]);
      lastLine.points(newPoints);
    }
    return;
  }

  if (!isSelecting.value) return;
  const stage = stageRef.value?.getNode?.();
  if (!stage) return;
  const pos = stage.getPointerPosition();
  if (!pos) return;
  const sp = toStagePoint(stage, pos);
  const x = Math.min(sp.x, selectionStart.value.x);
  const y = Math.min(sp.y, selectionStart.value.y);
  const width = Math.abs(sp.x - selectionStart.value.x);
  const height = Math.abs(sp.y - selectionStart.value.y);
  selectionRect.value = { x, y, width, height };
}

function onStageMouseUp() {
  if (isDrawing.value && lastLine) {
    // Convert the drawn line to a drawing content item
    const points = lastLine.points();
    if (points.length >= 4) { // At least 2 points (x,y pairs)
      // Calculate bounding box
      const xCoords = points.filter((_, i) => i % 2 === 0);
      const yCoords = points.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xCoords);
      const minY = Math.min(...yCoords);
      const maxX = Math.max(...xCoords);
      const maxY = Math.max(...yCoords);

      // Convert stage coordinates to page-relative coordinates
      const stagePos = stageRef.value?.getNode?.()?.position() || { x: 0, y: 0 };
      const scale = stageRef.value?.getNode?.()?.scaleX() || 1;
      
      const settings = toolsStore.drawingSettings;
      const drawingContent = {
        type: 'drawing' as const,
        x: (minX - stagePos.x) / scale - pageBackgroundConfig.value.x,
        y: (minY - stagePos.y) / scale - pageBackgroundConfig.value.y,
        width: (maxX - minX) / scale,
        height: (maxY - minY) / scale,
        rotation: 0,
        zIndex: Date.now(),
        properties: {
          paths: [{
            points: points.reduce((acc, val, i) => {
              if (i % 2 === 0) {
                acc.push({ 
                  x: (val - stagePos.x) / scale - pageBackgroundConfig.value.x - ((minX - stagePos.x) / scale - pageBackgroundConfig.value.x), 
                  y: (points[i + 1] - stagePos.y) / scale - pageBackgroundConfig.value.y - ((minY - stagePos.y) / scale - pageBackgroundConfig.value.y)
                });
              }
              return acc;
            }, [] as { x: number; y: number }[]),
            color: settings.strokeColor,
            width: settings.strokeWidth
          }],
          strokeColor: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          opacity: settings.opacity,
          lineCap: settings.lineCap,
          lineJoin: settings.lineJoin,
          smoothing: settings.smoothing
        }
      };
      projectStore.addContentToCurrentPage(drawingContent);
    }

    // Remove the temporary line
    lastLine.destroy();
    lastLine = null;
    isDrawing.value = false;
    return;
  }

  if (!isSelecting.value) return;
  const stage = stageRef.value?.getNode?.();
  const layer = contentLayerRef.value?.getNode?.();
  if (!stage || !layer) { isSelecting.value = false; return; }
  
  const box = selectionRect.value;
  const selected: string[] = [];
  
  // Get all nodes in the layer
  const allNodes = layer.getChildren();
  
  allNodes.forEach((node: any) => {
    // Skip transformer and background
    if (node.className === 'Transformer' || !node.id || typeof node.id !== 'function') return;
    
    const id = node.id();
    if (!id || id.startsWith('page-bg')) return; // Skip page background
    
    // Get bounding box for intersection test
    let nodeRect;
    try {
      if (node.className === 'Line') {
        // Special handling for Line objects (drawings)
        const points = node.points();
        if (points && points.length >= 4) {
          const xCoords = points.filter((_: any, i: number) => i % 2 === 0);
          const yCoords = points.filter((_: any, i: number) => i % 2 === 1);
          const minX = Math.min(...xCoords);
          const minY = Math.min(...yCoords);
          const maxX = Math.max(...xCoords);
          const maxY = Math.max(...yCoords);
          
          nodeRect = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          };
        }
      } else {
        // Standard bounding box for other shapes
        nodeRect = node.getClientRect({ skipShadow: true, skipStroke: true });
      }
      
      if (nodeRect) {
        const hit = Konva.Util.haveIntersection(nodeRect, box as any);
        if (hit) {
          selected.push(id);
        }
      }
    } catch (error) {
      console.warn('Error getting bounds for node:', id, error);
    }
  });
  
  // Apply selection
  if (selected.length > 0) {
    projectStore.clearSelection();
    selected.forEach((id, index) => {
      projectStore.selectContent(id, index > 0);
    });
  }
  
  isSelecting.value = false;
}

const isSpacePanning = ref(false);
const isDrawing = ref(false);
let lastLine: Konva.Line | null = null;

onMounted(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') { isSpacePanning.value = true; }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') { isSpacePanning.value = false; }
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
});

const textAreaRef = ref<HTMLTextAreaElement | null>(null);
const editingText = ref<{ visible: boolean; id: string | null; value: string; style: any }>({ visible: false, id: null, value: '', style: {} });
const editingKonvaNode = ref<Konva.Text | null>(null);
const editingWasDraggable = ref<boolean>(false);

function startTextEdit(id: string, e?: any) {
  // Prevent dblclick from bubbling into click/mousedown handlers
  if (e && e.evt) {
    e.evt.cancelBubble = true;
  }
  const stage = stageRef.value?.getNode?.() as Konva.Stage;
  if (!stage) return;
  const node = stage.findOne(`#${id}`) as Konva.Text;
  if (!node) return;

  // Freeze node during editing to avoid accidental drags
  editingKonvaNode.value = node;
  editingWasDraggable.value = !!node.draggable();
  node.draggable(false);
  node.listening(false);
  const tr = transformerRef.value?.getNode?.();
  tr?.hide();
  const layer = contentLayerRef.value?.getNode?.();
  layer?.batchDraw();

  // Use getAbsolutePosition for accurate positioning
  const absPos = node.getAbsolutePosition();
  const stageContainer = stage.container();
  const containerRect = stageContainer.getBoundingClientRect();
  
  const scale = stage.scaleX();
  const fontSize = node.fontSize() * scale;
  const width = Math.max(100, node.width() * scale);
  const height = Math.max(fontSize + 8, node.height() * scale);

  editingText.value = {
    visible: true,
    id,
    value: node.text(),
    style: {
      position: 'fixed',
      left: `${containerRect.left + absPos.x}px`,
      top: `${containerRect.top + absPos.y}px`,
      width: `${width}px`,
      height: `${height}px`,
      fontSize: `${fontSize}px`,
      fontFamily: node.fontFamily(),
      fontWeight: node.fontStyle()?.includes('bold') ? 'bold' : 'normal',
      fontStyle: node.fontStyle()?.includes('italic') ? 'italic' : 'normal',
      color: node.fill(),
      lineHeight: node.lineHeight(),
      padding: '2px 4px',
      border: '2px solid #2563eb',
      background: 'rgba(255,255,255,0.96)',
      outline: 'none',
      resize: 'none',
      zIndex: 1000,
      margin: 0,
      boxSizing: 'border-box'
    }
  };

  nextTick(() => {
    textAreaRef.value?.focus();
    textAreaRef.value?.select();
  });
}

function commitTextEdit() {
  const id = editingText.value.id;
  if (!id) { cancelTextEdit(); return; }
  const content = projectStore.getContentById(id);
  if (content && content.type === 'text') {
    const p = content.properties as TextProperties;
    projectStore.updateContent(id, { properties: { ...p, text: editingText.value.value } });
  }
  cancelTextEdit();
}

function cancelTextEdit() {
  editingText.value.visible = false;
  editingText.value.id = null;
  // Restore node interactivity
  if (editingKonvaNode.value) {
    editingKonvaNode.value.listening(true);
    editingKonvaNode.value.draggable(editingWasDraggable.value);
    editingKonvaNode.value = null;
    const tr = transformerRef.value?.getNode?.();
    tr?.show();
    const layer = contentLayerRef.value?.getNode?.();
    layer?.batchDraw();
  }
}

function onStageClick(e: any) {
  const stage = stageRef.value?.getNode?.();
  if (!stage) return;
  // Allow clicks on stage OR page background to place new items
  const clickedStage = e.target === stage;
  const clickedPageBg = typeof e.target?.id === 'function' && e.target.id() === 'page-background';
  if (!clickedStage && !clickedPageBg) return;

  if (toolsStore.activeTool === 'draw') return;
  
  const pos = toStagePoint(stage, stage.getPointerPosition()!);
  const relativePos = {
    x: pos.x - pageBackgroundConfig.value.x,
    y: pos.y - pageBackgroundConfig.value.y
  };

  if (toolsStore.activeTool === 'text') {
    addText(relativePos.x, relativePos.y);
  } else if (toolsStore.activeTool === 'shape') {
    addShape(relativePos.x, relativePos.y);
  }
}

function addText(x: number, y: number) {
  const textContent = {
    type: 'text' as const,
    x, y,
    width: 200, height: 40, rotation: 0, zIndex: Date.now(),
    properties: {
      text: 'Sample Text', fontSize: 24, fontFamily: 'Arial',
      fontWeight: 'normal' as const, fontStyle: 'normal' as const,
      color: '#000000', textAlign: 'left' as const, lineHeight: 1.2,
      textDecoration: 'none' as const, padding: 0
    }
  };
  projectStore.addContentToCurrentPage(textContent);
  toolsStore.setActiveTool('select');
}

function addShape(x: number, y: number) {
  const shapeContent = {
    type: 'shape' as const,
    x, y,
    width: 100, height: 100, rotation: 0, zIndex: Date.now(),
    properties: {
      shapeType: toolsStore.activeShapeType,
      fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2, opacity: 1
    }
  };
  projectStore.addContentToCurrentPage(shapeContent);
  toolsStore.setActiveTool('select');
}
</script>

<style scoped>
.konva-page-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.stage-wrapper { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: #f1f5f9; 
  width: 100%;
  height: 100%;
  overflow: auto;
}
.canvas-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
.text-editor {
  font-family: inherit;
  border-radius: 4px;
}
</style>
