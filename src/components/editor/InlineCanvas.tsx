import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Rect as KonvaRect, Ellipse, Text as KonvaText, Transformer } from 'react-konva';
import Konva from 'konva';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pen,
  Highlighter,
  Eraser,
  Minus,
  Square,
  Circle,
  Type,
  Hand,
  Undo2,
  Redo2,
  Trash2,
  FileDown,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type InlineTool = 'pen' | 'highlighter' | 'eraser' | 'line' | 'rect' | 'circle' | 'text' | 'pan';

interface DrawElement {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser';
  points: number[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
  globalCompositeOperation: string;
}

interface LineElement {
  id: string;
  tool: 'line';
  points: [number, number, number, number];
  stroke: string;
  strokeWidth: number;
}

interface RectElement {
  id: string;
  tool: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
}

interface CircleElement {
  id: string;
  tool: 'circle';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  stroke: string;
  strokeWidth: number;
}

interface TextElement {
  id: string;
  tool: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
}

type CanvasElement = DrawElement | LineElement | RectElement | CircleElement | TextElement;

const MAX_HISTORY = 50;

const TOOLS: { id: InlineTool; icon: typeof Pen; label: string; shortcut: string }[] = [
  { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter', shortcut: 'H' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'V' },
];

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

interface InlineCanvasProps {
  onSaveToMd: (markdown: string) => void;
}

export const InlineCanvas = ({ onSaveToMd }: InlineCanvasProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [size, setSize] = useState({ width: 800, height: 500 });
  const [tool, setTool] = useState<InlineTool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [previewShape, setPreviewShape] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const historyRef = useRef<CanvasElement[][]>([[]]);
  const historyIndexRef = useRef(0);

  const genId = () => `el-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // Resize
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Push to history
  const pushHistory = useCallback((els: CanvasElement[]) => {
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push([...els]);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    else historyIndexRef.current++;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setElements([...historyRef.current[historyIndexRef.current]]);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setElements([...historyRef.current[historyIndexRef.current]]);
    }
  }, []);

  const clearAll = useCallback(() => {
    const empty: CanvasElement[] = [];
    setElements(empty);
    pushHistory(empty);
    setSelectedId(null);
  }, [pushHistory]);

  // Get pointer in canvas coordinates
  const getCanvasPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stagePos.x) / stageScale,
      y: (pointer.y - stagePos.y) / stageScale,
    };
  }, [stagePos, stageScale]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const pos = getCanvasPos();
    if (!pos) return;
    const clickedOnEmpty = e.target === e.target.getStage();

    if (tool === 'pan') return; // handled by stage draggable

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      setIsDrawing(true);
      setCurrentPoints([pos.x, pos.y]);
      setSelectedId(null);
    } else if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      setIsDrawing(true);
      setShapeStart(pos);
      setPreviewShape({ x: pos.x, y: pos.y, w: 0, h: 0 });
      setSelectedId(null);
    } else if (tool === 'text' && clickedOnEmpty) {
      const newEl: TextElement = {
        id: genId(),
        tool: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Text',
        fontSize: 20,
        fill: strokeColor,
      };
      const newEls = [...elements, newEl];
      setElements(newEls);
      pushHistory(newEls);
      setSelectedId(newEl.id);
    } else if (clickedOnEmpty) {
      setSelectedId(null);
    }
  }, [tool, getCanvasPos, elements, strokeColor, pushHistory]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing) return;
    const pos = getCanvasPos();
    if (!pos) return;

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      setCurrentPoints(prev => [...prev, pos.x, pos.y]);
    } else if ((tool === 'line' || tool === 'rect' || tool === 'circle') && shapeStart) {
      setPreviewShape({
        x: Math.min(shapeStart.x, pos.x),
        y: Math.min(shapeStart.y, pos.y),
        w: pos.x - shapeStart.x,
        h: pos.y - shapeStart.y,
      });
    }
  }, [isDrawing, tool, getCanvasPos, shapeStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;

    if ((tool === 'pen' || tool === 'highlighter' || tool === 'eraser') && currentPoints.length > 2) {
      const newEl: DrawElement = {
        id: genId(),
        tool: tool as 'pen' | 'highlighter' | 'eraser',
        points: currentPoints,
        stroke: tool === 'eraser' ? '#ffffff' : strokeColor,
        strokeWidth: tool === 'highlighter' ? brushSize * 4 : tool === 'eraser' ? brushSize * 3 : brushSize,
        opacity: tool === 'highlighter' ? 0.35 : 1,
        globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
      };
      const newEls = [...elements, newEl];
      setElements(newEls);
      pushHistory(newEls);
    } else if (tool === 'line' && shapeStart) {
      const pos = getCanvasPos();
      if (pos) {
        const newEl: LineElement = {
          id: genId(),
          tool: 'line',
          points: [shapeStart.x, shapeStart.y, pos.x, pos.y],
          stroke: strokeColor,
          strokeWidth: brushSize,
        };
        const newEls = [...elements, newEl];
        setElements(newEls);
        pushHistory(newEls);
      }
    } else if (tool === 'rect' && shapeStart && previewShape) {
      const pos = getCanvasPos();
      if (pos) {
        const x = Math.min(shapeStart.x, pos.x);
        const y = Math.min(shapeStart.y, pos.y);
        const w = Math.abs(pos.x - shapeStart.x);
        const h = Math.abs(pos.y - shapeStart.y);
        if (w > 2 && h > 2) {
          const newEl: RectElement = {
            id: genId(),
            tool: 'rect',
            x, y, width: w, height: h,
            stroke: strokeColor,
            strokeWidth: brushSize,
          };
          const newEls = [...elements, newEl];
          setElements(newEls);
          pushHistory(newEls);
        }
      }
    } else if (tool === 'circle' && shapeStart) {
      const pos = getCanvasPos();
      if (pos) {
        const cx = (shapeStart.x + pos.x) / 2;
        const cy = (shapeStart.y + pos.y) / 2;
        const rx = Math.abs(pos.x - shapeStart.x) / 2;
        const ry = Math.abs(pos.y - shapeStart.y) / 2;
        if (rx > 2 && ry > 2) {
          const newEl: CircleElement = {
            id: genId(),
            tool: 'circle',
            x: cx, y: cy, radiusX: rx, radiusY: ry,
            stroke: strokeColor,
            strokeWidth: brushSize,
          };
          const newEls = [...elements, newEl];
          setElements(newEls);
          pushHistory(newEls);
        }
      }
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setShapeStart(null);
    setPreviewShape(null);
  }, [isDrawing, tool, currentPoints, shapeStart, previewShape, elements, strokeColor, brushSize, pushHistory, getCanvasPos]);

  // Zoom via scroll
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.08;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    setStageScale(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, [stageScale, stagePos]);

  // Pan drag
  const handleStageDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setStagePos({ x: e.target.x(), y: e.target.y() });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const ctrl = e.ctrlKey || e.metaKey;

      const keyMap: Record<string, InlineTool> = {
        p: 'pen', h: 'highlighter', e: 'eraser', l: 'line',
        r: 'rect', c: 'circle', t: 'text', v: 'pan',
      };
      const k = e.key.toLowerCase();
      if (!ctrl && keyMap[k]) { setTool(keyMap[k]); return; }

      if (ctrl && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && k === 's') { e.preventDefault(); handleSaveToMd(); }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        const newEls = elements.filter(el => el.id !== selectedId);
        setElements(newEls);
        pushHistory(newEls);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo, selectedId, elements, pushHistory]);

  // Update transformer
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      if (selectedId) {
        const node = stageRef.current.findOne(`#${selectedId}`);
        if (node) {
          transformerRef.current.nodes([node]);
          transformerRef.current.getLayer()?.batchDraw();
          return;
        }
      }
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  // Text double-click edit
  const handleTextDblClick = useCallback((el: TextElement) => {
    const stage = stageRef.current;
    const textNode = stage?.findOne(`#${el.id}`) as Konva.Text | undefined;
    if (!stage || !textNode) return;

    textNode.hide();
    transformerRef.current?.hide();

    const textPos = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = el.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPos.y}px`;
    textarea.style.left = `${stageBox.left + textPos.x}px`;
    textarea.style.width = `${Math.max(100, textNode.width() * stageScale)}px`;
    textarea.style.fontSize = `${el.fontSize * stageScale}px`;
    textarea.style.border = '2px solid hsl(var(--primary))';
    textarea.style.padding = '4px';
    textarea.style.background = 'hsl(var(--background))';
    textarea.style.color = el.fill;
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';
    textarea.focus();
    setEditingTextId(el.id);

    const remove = () => {
      if (textarea.parentNode) {
        const newEls = elements.map(e => e.id === el.id ? { ...e, text: textarea.value || 'Text' } as TextElement : e);
        setElements(newEls);
        pushHistory(newEls);
        document.body.removeChild(textarea);
      }
      textNode.show();
      transformerRef.current?.show();
      setEditingTextId(null);
    };

    textarea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) remove();
      if (ev.key === 'Escape') remove();
    });
    textarea.addEventListener('blur', remove);
  }, [elements, pushHistory, stageScale]);

  // Save to MD
  const handleSaveToMd = useCallback(() => {
    if (!stageRef.current) return;
    // Reset position/scale for export
    const oldScale = stageScale;
    const oldPos = stagePos;
    const stage = stageRef.current;
    stage.position({ x: 0, y: 0 });
    stage.scale({ x: 1, y: 1 });
    stage.batchDraw();

    const uri = stage.toDataURL({ pixelRatio: 2 });
    const filename = `sketch-${Date.now()}.png`;

    // Download file
    const link = document.createElement('a');
    link.download = filename;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Restore position/scale
    stage.position(oldPos);
    stage.scale({ x: oldScale, y: oldScale });
    stage.batchDraw();

    // Insert markdown
    const mdSnippet = `![sketch](${filename})`;
    onSaveToMd(mdSnippet);
    toast.success(`Saved ${filename} — markdown snippet inserted`);
  }, [stageScale, stagePos, onSaveToMd]);

  const zoomIn = useCallback(() => {
    setStageScale(s => Math.min(5, s * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setStageScale(s => Math.max(0.1, s / 1.2));
  }, []);

  const getCursor = () => {
    switch (tool) {
      case 'pen': case 'highlighter': case 'eraser': return 'crosshair';
      case 'text': return 'text';
      case 'pan': return 'grab';
      case 'line': case 'rect': case 'circle': return 'crosshair';
      default: return 'default';
    }
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <TooltipProvider>
        <div className="flex items-center gap-1.5 p-2 border-b border-border bg-muted/50 flex-wrap">
          {/* Tools */}
          <div className="flex items-center gap-0.5">
            {TOOLS.map(({ id, icon: Icon, label, shortcut }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === id ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTool(id)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label} ({shortcut})</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Colors */}
          <div className="flex items-center gap-0.5">
            {COLORS.map(color => (
              <button
                key={color}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                  strokeColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                )}
                style={{ backgroundColor: color }}
                onClick={() => setStrokeColor(color)}
              />
            ))}
            <Input
              type="color"
              value={strokeColor}
              onChange={e => setStrokeColor(e.target.value)}
              className="w-7 h-7 p-0 border-0 cursor-pointer"
            />
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Brush size */}
          <div className="flex items-center gap-1.5 min-w-[100px]">
            <span className="text-xs text-muted-foreground">Size:</span>
            <Slider
              value={[brushSize]}
              onValueChange={([v]) => setBrushSize(v)}
              min={1}
              max={20}
              step={1}
              className="w-16"
            />
            <span className="text-xs font-mono w-4 text-center">{brushSize}</span>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo}>
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo}>
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={clearAll}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Zoom */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          <span className="text-xs font-mono w-10 text-center">{Math.round(stageScale * 100)}%</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Save to MD */}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSaveToMd}>
            <FileDown className="w-4 h-4" />
            Save to MD
          </Button>
        </div>
      </TooltipProvider>

      {/* Stage */}
      <div ref={containerRef} className="flex-1 bg-white" style={{ cursor: getCursor() }}>
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          draggable={tool === 'pan'}
          onDragEnd={handleStageDragEnd}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {/* Render elements */}
            {elements.map(el => {
              if (el.tool === 'pen' || el.tool === 'highlighter' || el.tool === 'eraser') {
                const d = el as DrawElement;
                return (
                  <Line
                    key={d.id}
                    id={d.id}
                    points={d.points}
                    stroke={d.stroke}
                    strokeWidth={d.strokeWidth}
                    opacity={d.opacity}
                    globalCompositeOperation={d.globalCompositeOperation as GlobalCompositeOperation}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    onClick={() => setSelectedId(d.id)}
                  />
                );
              }
              if (el.tool === 'line') {
                const l = el as LineElement;
                return (
                  <Line
                    key={l.id}
                    id={l.id}
                    points={l.points}
                    stroke={l.stroke}
                    strokeWidth={l.strokeWidth}
                    lineCap="round"
                    onClick={() => setSelectedId(l.id)}
                  />
                );
              }
              if (el.tool === 'rect') {
                const r = el as RectElement;
                return (
                  <KonvaRect
                    key={r.id}
                    id={r.id}
                    x={r.x}
                    y={r.y}
                    width={r.width}
                    height={r.height}
                    stroke={r.stroke}
                    strokeWidth={r.strokeWidth}
                    onClick={() => setSelectedId(r.id)}
                  />
                );
              }
              if (el.tool === 'circle') {
                const c = el as CircleElement;
                return (
                  <Ellipse
                    key={c.id}
                    id={c.id}
                    x={c.x}
                    y={c.y}
                    radiusX={c.radiusX}
                    radiusY={c.radiusY}
                    stroke={c.stroke}
                    strokeWidth={c.strokeWidth}
                    onClick={() => setSelectedId(c.id)}
                  />
                );
              }
              if (el.tool === 'text') {
                const t = el as TextElement;
                return (
                  <KonvaText
                    key={t.id}
                    id={t.id}
                    x={t.x}
                    y={t.y}
                    text={t.text}
                    fontSize={t.fontSize}
                    fill={t.fill}
                    draggable
                    visible={editingTextId !== t.id}
                    onClick={() => setSelectedId(t.id)}
                    onDblClick={() => handleTextDblClick(t)}
                    onDblTap={() => handleTextDblClick(t)}
                  />
                );
              }
              return null;
            })}

            {/* Current freehand drawing */}
            {isDrawing && (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') && currentPoints.length > 0 && (
              <Line
                points={currentPoints}
                stroke={tool === 'eraser' ? '#ffffff' : strokeColor}
                strokeWidth={tool === 'highlighter' ? brushSize * 4 : tool === 'eraser' ? brushSize * 3 : brushSize}
                opacity={tool === 'highlighter' ? 0.35 : 1}
                globalCompositeOperation={tool === 'eraser' ? 'destination-out' : 'source-over'}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            )}

            {/* Preview shapes */}
            {isDrawing && tool === 'line' && shapeStart && previewShape && (
              <Line
                points={[shapeStart.x, shapeStart.y, shapeStart.x + previewShape.w, shapeStart.y + previewShape.h]}
                stroke={strokeColor}
                strokeWidth={brushSize}
                lineCap="round"
                dash={[5, 5]}
              />
            )}
            {isDrawing && tool === 'rect' && previewShape && (
              <KonvaRect
                x={previewShape.x}
                y={previewShape.y}
                width={Math.abs(previewShape.w)}
                height={Math.abs(previewShape.h)}
                stroke={strokeColor}
                strokeWidth={brushSize}
                dash={[5, 5]}
              />
            )}
            {isDrawing && tool === 'circle' && shapeStart && previewShape && (
              <Ellipse
                x={(shapeStart.x + shapeStart.x + previewShape.w) / 2}
                y={(shapeStart.y + shapeStart.y + previewShape.h) / 2}
                radiusX={Math.abs(previewShape.w) / 2}
                radiusY={Math.abs(previewShape.h) / 2}
                stroke={strokeColor}
                strokeWidth={brushSize}
                dash={[5, 5]}
              />
            )}

            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
