import { useState, useCallback, useRef } from 'react';
import { CanvasNode, NewCanvasNode, Tool } from './types';

const MAX_HISTORY = 50;

export const useCanvasState = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool, setTool] = useState<Tool>('select');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  const historyRef = useRef<CanvasNode[][]>([[]]);
  const historyIndexRef = useRef(0);

  const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const pushToHistory = useCallback((newNodes: CanvasNode[]) => {
    // Remove any redo states
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    // Add new state
    historyRef.current.push([...newNodes]);
    // Limit history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
  }, []);

  const addNode = useCallback((node: NewCanvasNode): string => {
    const id = generateId();
    const newNode = { ...node, id } as CanvasNode;
    setNodes(prev => {
      const newNodes = [...prev, newNode];
      pushToHistory(newNodes);
      return newNodes;
    });
    return id;
  }, [pushToHistory]);

  const updateNode = useCallback((id: string, updates: Partial<CanvasNode>) => {
    setNodes(prev => {
      const newNodes = prev.map(node => {
        if (node.id !== id) return node;
        // Merge updates with existing node, preserving type
        return { ...node, ...updates } as CanvasNode;
      });
      pushToHistory(newNodes);
      return newNodes;
    });
  }, [pushToHistory]);

  const deleteNodes = useCallback((ids: string[]) => {
    setNodes(prev => {
      const newNodes = prev.filter(node => !ids.includes(node.id));
      pushToHistory(newNodes);
      return newNodes;
    });
    setSelectedIds([]);
  }, [pushToHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setNodes([...historyRef.current[historyIndexRef.current]]);
      setSelectedIds([]);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setNodes([...historyRef.current[historyIndexRef.current]]);
      setSelectedIds([]);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setSelectedIds([]);
    pushToHistory([]);
  }, [pushToHistory]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return {
    nodes,
    setNodes,
    selectedIds,
    setSelectedIds,
    tool,
    setTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    addNode,
    updateNode,
    deleteNodes,
    undo,
    redo,
    clearCanvas,
    canUndo,
    canRedo,
    generateId,
    pushToHistory,
  };
};
