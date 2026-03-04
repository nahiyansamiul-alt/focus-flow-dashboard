import { useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { Stage, Layer, Line, Rect as KonvaRect, Ellipse, Text as KonvaText, Transformer } from 'react-konva';
import Konva from 'konva';
import { AnnotationElement, AnnotationTool, StrokeAnnotation, LineAnnotation, RectAnnotation, CircleAnnotation, TextAnnotation } from './useAnnotations';

interface AnnotationOverlayProps {
  annotations: AnnotationElement[];
  onAddAnnotation: (el: AnnotationElement) => void;
  onUpdateAnnotation: (id: string, updates: Partial<AnnotationElement>) => void;
  onDeleteAnnotation: (id: string) => void;
  tool: AnnotationTool;
  color: string;
  brushSize: number;
  active: boolean;
  contentRef: RefObject<HTMLDivElement>;
}

const genId = () => `ann-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

export const AnnotationOverlay = ({
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  tool,
  color,
  brushSize,
  active,
  contentRef,
}: AnnotationOverlayProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [previewShape, setPreviewShape] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Track content size with ResizeObserver
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.ceil(width), height: Math.ceil(height) });
    });
    ro.observe(el);
    // Initial measurement
    setSize({ width: el.scrollWidth, height: el.scrollHeight });
    return () => ro.disconnect();
  }, [contentRef]);

  // Update transformer
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      if (selectedId && active) {
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
  }, [selectedId, active]);

  // Clear selection when deactivating
  useEffect(() => {
    if (!active) {
      setSelectedId(null);
      setIsDrawing(false);
      setCurrentPoints([]);
      setShapeStart(null);
      setPreviewShape(null);
    }
  }, [active]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!active) return;
    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();
    if (!pos) return;
    const clickedOnEmpty = e.target === e.target.getStage();

    if (tool === 'pan') return;

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
      const newEl: TextAnnotation = {
        id: genId(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Text',
        fontSize: 20,
        color,
      };
      onAddAnnotation(newEl);
      setSelectedId(newEl.id);
    } else if (clickedOnEmpty) {
      setSelectedId(null);
    }
  }, [active, tool, color, onAddAnnotation]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing || !active) return;
    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();
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
  }, [isDrawing, active, tool, shapeStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !active) return;

    if ((tool === 'pen' || tool === 'highlighter' || tool === 'eraser') && currentPoints.length > 2) {
      const newEl: StrokeAnnotation = {
        id: genId(),
        type: 'stroke',
        tool: tool as 'pen' | 'highlighter' | 'eraser',
        points: currentPoints,
        color: tool === 'eraser' ? 'rgba(0,0,0,0)' : color,
        strokeWidth: tool === 'highlighter' ? brushSize * 4 : tool === 'eraser' ? brushSize * 3 : brushSize,
        opacity: tool === 'highlighter' ? 0.35 : 1,
      };
      onAddAnnotation(newEl);
    } else if (tool === 'line' && shapeStart) {
      const stage = stageRef.current;
      const pos = stage?.getPointerPosition();
      if (pos) {
        const newEl: LineAnnotation = {
          id: genId(),
          type: 'line',
          points: [shapeStart.x, shapeStart.y, pos.x, pos.y],
          color,
          strokeWidth: brushSize,
        };
        onAddAnnotation(newEl);
      }
    } else if (tool === 'rect' && shapeStart) {
      const stage = stageRef.current;
      const pos = stage?.getPointerPosition();
      if (pos) {
        const x = Math.min(shapeStart.x, pos.x);
        const y = Math.min(shapeStart.y, pos.y);
        const w = Math.abs(pos.x - shapeStart.x);
        const h = Math.abs(pos.y - shapeStart.y);
        if (w > 2 && h > 2) {
          const newEl: RectAnnotation = {
            id: genId(),
            type: 'rect',
            x, y, width: w, height: h,
            color,
            strokeWidth: brushSize,
          };
          onAddAnnotation(newEl);
        }
      }
    } else if (tool === 'circle' && shapeStart) {
      const stage = stageRef.current;
      const pos = stage?.getPointerPosition();
      if (pos) {
        const cx = (shapeStart.x + pos.x) / 2;
        const cy = (shapeStart.y + pos.y) / 2;
        const rx = Math.abs(pos.x - shapeStart.x) / 2;
        const ry = Math.abs(pos.y - shapeStart.y) / 2;
        if (rx > 2 && ry > 2) {
          const newEl: CircleAnnotation = {
            id: genId(),
            type: 'circle',
            x: cx, y: cy, radiusX: rx, radiusY: ry,
            color,
            strokeWidth: brushSize,
          };
          onAddAnnotation(newEl);
        }
      }
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setShapeStart(null);
    setPreviewShape(null);
  }, [isDrawing, active, tool, currentPoints, shapeStart, color, brushSize, onAddAnnotation]);

  // Text double-click edit
  const handleTextDblClick = useCallback((ann: TextAnnotation) => {
    const stage = stageRef.current;
    const textNode = stage?.findOne(`#${ann.id}`) as Konva.Text | undefined;
    if (!stage || !textNode) return;

    textNode.hide();
    transformerRef.current?.hide();

    const textPos = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = ann.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPos.y}px`;
    textarea.style.left = `${stageBox.left + textPos.x}px`;
    textarea.style.width = `${Math.max(100, textNode.width())}px`;
    textarea.style.fontSize = `${ann.fontSize}px`;
    textarea.style.border = '2px solid hsl(var(--primary))';
    textarea.style.padding = '4px';
    textarea.style.background = 'hsl(var(--background))';
    textarea.style.color = ann.color;
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';
    textarea.focus();
    setEditingTextId(ann.id);

    const remove = () => {
      if (textarea.parentNode) {
        onUpdateAnnotation(ann.id, { text: textarea.value || 'Text' } as Partial<TextAnnotation>);
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
  }, [onUpdateAnnotation]);

  const getCursor = () => {
    if (!active) return 'default';
    switch (tool) {
      case 'pen': case 'highlighter': case 'eraser': return 'crosshair';
      case 'text': return 'text';
      case 'pan': return 'grab';
      default: return 'crosshair';
    }
  };

  const renderAnnotation = (ann: AnnotationElement) => {
    switch (ann.type) {
      case 'stroke': {
        const s = ann as StrokeAnnotation;
        return (
          <Line
            key={s.id}
            id={s.id}
            points={s.points}
            stroke={s.color}
            strokeWidth={s.strokeWidth}
            opacity={s.opacity}
            globalCompositeOperation={s.tool === 'eraser' ? 'destination-out' : 'source-over'}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            onClick={() => active && setSelectedId(s.id)}
          />
        );
      }
      case 'line': {
        const l = ann as LineAnnotation;
        return (
          <Line
            key={l.id}
            id={l.id}
            points={l.points}
            stroke={l.color}
            strokeWidth={l.strokeWidth}
            lineCap="round"
            onClick={() => active && setSelectedId(l.id)}
          />
        );
      }
      case 'rect': {
        const r = ann as RectAnnotation;
        return (
          <KonvaRect
            key={r.id}
            id={r.id}
            x={r.x}
            y={r.y}
            width={r.width}
            height={r.height}
            stroke={r.color}
            strokeWidth={r.strokeWidth}
            onClick={() => active && setSelectedId(r.id)}
          />
        );
      }
      case 'circle': {
        const c = ann as CircleAnnotation;
        return (
          <Ellipse
            key={c.id}
            id={c.id}
            x={c.x}
            y={c.y}
            radiusX={c.radiusX}
            radiusY={c.radiusY}
            stroke={c.color}
            strokeWidth={c.strokeWidth}
            onClick={() => active && setSelectedId(c.id)}
          />
        );
      }
      case 'text': {
        const t = ann as TextAnnotation;
        return (
          <KonvaText
            key={t.id}
            id={t.id}
            x={t.x}
            y={t.y}
            text={t.text}
            fontSize={t.fontSize}
            fill={t.color}
            draggable={active}
            visible={editingTextId !== t.id}
            onClick={() => active && setSelectedId(t.id)}
            onDblClick={() => handleTextDblClick(t)}
            onDblTap={() => handleTextDblClick(t)}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute top-0 left-0 z-10"
      style={{
        width: size.width,
        height: size.height,
        pointerEvents: active ? 'auto' : 'none',
        cursor: getCursor(),
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {/* Saved annotations */}
          {annotations.map(renderAnnotation)}

          {/* Current freehand stroke preview */}
          {isDrawing && (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') && currentPoints.length > 0 && (
            <Line
              points={currentPoints}
              stroke={tool === 'eraser' ? 'rgba(0,0,0,0)' : color}
              strokeWidth={tool === 'highlighter' ? brushSize * 4 : tool === 'eraser' ? brushSize * 3 : brushSize}
              opacity={tool === 'highlighter' ? 0.35 : 1}
              globalCompositeOperation={tool === 'eraser' ? 'destination-out' : 'source-over'}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Shape preview */}
          {isDrawing && tool === 'line' && shapeStart && previewShape && (
            <Line
              points={[shapeStart.x, shapeStart.y, shapeStart.x + previewShape.w, shapeStart.y + previewShape.h]}
              stroke={color}
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
              stroke={color}
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
              stroke={color}
              strokeWidth={brushSize}
              dash={[5, 5]}
            />
          )}

          {active && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
