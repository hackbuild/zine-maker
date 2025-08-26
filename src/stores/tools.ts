import { defineStore } from 'pinia';
import { ref, markRaw } from 'vue';
import type { Tool, ToolType, ShapeProperties } from '@/types';
import { MousePointer2, Type, ImageIcon, Square, PenLine, Hand, ZoomIn } from 'lucide-vue-next';

export const useToolsStore = defineStore('tools', () => {
  const tools = ref<Tool[]>([
    { id: 'select', name: 'Select', icon: markRaw(MousePointer2), shortcut: 'V' },
    { id: 'text', name: 'Text', icon: markRaw(Type), shortcut: 'T' },
    { id: 'image', name: 'Image', icon: markRaw(ImageIcon), shortcut: 'I' },
    { id: 'shape', name: 'Shape', icon: markRaw(Square), shortcut: 'S' },
    { id: 'draw', name: 'Draw', icon: markRaw(PenLine), shortcut: 'D' },
    { id: 'pan', name: 'Pan', icon: markRaw(Hand), shortcut: 'H' },
    { id: 'zoom', name: 'Zoom', icon: markRaw(ZoomIn), shortcut: 'Z' }
  ]);

  const activeTool = ref<ToolType>('select');
  const activeShapeType = ref<ShapeProperties['shapeType']>('rectangle');
  
  // Drawing tool settings
  const drawingSettings = ref({
    strokeColor: '#000000',
    strokeWidth: 2,
    opacity: 1,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
    smoothing: true
  });

  function setActiveTool(toolId: ToolType): void {
    activeTool.value = toolId;
  }

  function setActiveShapeType(shapeType: ShapeProperties['shapeType']): void {
    activeShapeType.value = shapeType;
    activeTool.value = 'shape';
  }

  function getToolById(toolId: ToolType): Tool | undefined {
    return tools.value.find(tool => tool.id === toolId);
  }

  function updateDrawingSetting(key: keyof typeof drawingSettings.value, value: any): void {
    (drawingSettings.value as any)[key] = value;
  }

  return {
    tools,
    activeTool,
    activeShapeType,
    drawingSettings,
    setActiveTool,
    setActiveShapeType,
    getToolById,
    updateDrawingSetting
  };
});