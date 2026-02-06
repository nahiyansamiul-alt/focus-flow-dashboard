export type Tool = 'select' | 'draw' | 'text';

export interface PathNode {
  id: string;
  type: 'path';
  points: number[];
  stroke: string;
  strokeWidth: number;
  x: number;
  y: number;
}

export interface ImageNode {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface TextNode {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  rotation?: number;
}

export type CanvasNode = PathNode | ImageNode | TextNode;

// Input types for creating new nodes (without id)
export type NewPathNode = Omit<PathNode, 'id'>;
export type NewImageNode = Omit<ImageNode, 'id'>;
export type NewTextNode = Omit<TextNode, 'id'>;
export type NewCanvasNode = NewPathNode | NewImageNode | NewTextNode;

export interface CanvasState {
  nodes: CanvasNode[];
  selectedIds: string[];
  tool: Tool;
  strokeColor: string;
  strokeWidth: number;
  history: CanvasNode[][];
  historyIndex: number;
}
