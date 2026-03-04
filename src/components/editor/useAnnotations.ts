import { useState, useCallback, useRef, useEffect } from 'react';

export type AnnotationTool = 'pen' | 'highlighter' | 'eraser' | 'line' | 'rect' | 'circle' | 'text' | 'pan';

export interface StrokeAnnotation {
  id: string;
  type: 'stroke';
  tool: 'pen' | 'highlighter' | 'eraser';
  points: number[];
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface LineAnnotation {
  id: string;
  type: 'line';
  points: [number, number, number, number];
  color: string;
  strokeWidth: number;
}

export interface RectAnnotation {
  id: string;
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

export interface CircleAnnotation {
  id: string;
  type: 'circle';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  strokeWidth: number;
}

export interface TextAnnotation {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export type AnnotationElement = StrokeAnnotation | LineAnnotation | RectAnnotation | CircleAnnotation | TextAnnotation;

export interface AnnotationDocument {
  version: number;
  noteId: string;
  annotations: AnnotationElement[];
}

const MAX_HISTORY = 50;

export function useAnnotations(noteId: string) {
  const [annotations, setAnnotations] = useState<AnnotationElement[]>([]);
  const [tool, setTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);

  const historyRef = useRef<AnnotationElement[][]>([[]]);
  const historyIndexRef = useRef(0);
  const [historyVersion, setHistoryVersion] = useState(0); // trigger re-render for canUndo/canRedo

  // Load annotations when noteId changes
  useEffect(() => {
    if (!noteId) {
      setAnnotations([]);
      historyRef.current = [[]];
      historyIndexRef.current = 0;
      setHistoryVersion(v => v + 1);
      return;
    }
    const key = `annotations-${noteId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const doc: AnnotationDocument = JSON.parse(saved);
        const loaded = doc.annotations || [];
        setAnnotations(loaded);
        historyRef.current = [loaded];
        historyIndexRef.current = 0;
        setHistoryVersion(v => v + 1);
      } catch {
        setAnnotations([]);
        historyRef.current = [[]];
        historyIndexRef.current = 0;
        setHistoryVersion(v => v + 1);
      }
    } else {
      setAnnotations([]);
      historyRef.current = [[]];
      historyIndexRef.current = 0;
      setHistoryVersion(v => v + 1);
    }
  }, [noteId]);

  // Save annotations (debounced)
  useEffect(() => {
    if (!noteId) return;
    const timeout = setTimeout(() => {
      const doc: AnnotationDocument = { version: 1, noteId, annotations };
      localStorage.setItem(`annotations-${noteId}`, JSON.stringify(doc));
    }, 500);
    return () => clearTimeout(timeout);
  }, [annotations, noteId]);

  const pushHistory = useCallback((els: AnnotationElement[]) => {
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push([...els]);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
    setHistoryVersion(v => v + 1);
  }, []);

  const addAnnotation = useCallback((el: AnnotationElement) => {
    setAnnotations(prev => {
      const next = [...prev, el];
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const updateAnnotation = useCallback((id: string, updates: Partial<AnnotationElement>) => {
    setAnnotations(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates } as AnnotationElement : a);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => {
      const next = prev.filter(a => a.id !== id);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setAnnotations([...historyRef.current[historyIndexRef.current]]);
      setHistoryVersion(v => v + 1);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setAnnotations([...historyRef.current[historyIndexRef.current]]);
      setHistoryVersion(v => v + 1);
    }
  }, []);

  const clearAll = useCallback(() => {
    setAnnotations([]);
    pushHistory([]);
  }, [pushHistory]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return {
    annotations,
    tool,
    setTool,
    color,
    setColor,
    brushSize,
    setBrushSize,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    undo,
    redo,
    clearAll,
    canUndo,
    canRedo,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _historyVersion: historyVersion, // forces re-render
  };
}
