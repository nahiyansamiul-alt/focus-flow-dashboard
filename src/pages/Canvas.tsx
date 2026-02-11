import { useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Konva from 'konva';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ActiveTimerIndicator } from '@/components/ActiveTimerIndicator';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { CanvasStage } from '@/components/canvas/CanvasStage';
import { useCanvasState } from '@/components/canvas/useCanvasState';
import { NewImageNode } from '@/components/canvas/types';
import { toast } from 'sonner';

const MAX_IMAGE_SIZE = 800;

const Canvas = () => {
  const navigate = useNavigate();
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    nodes,
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
  } = useCanvasState();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Tool shortcuts
      if (e.key.toLowerCase() === 'v') setTool('select');
      if (e.key.toLowerCase() === 'd') setTool('draw');
      if (e.key.toLowerCase() === 't') setTool('text');

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          deleteNodes(selectedIds);
        }
      }

      // Undo/Redo
      if (ctrlKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (ctrlKey && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteNodes, undo, redo, setTool]);

  const loadImage = useCallback((file: File, x?: number, y?: number) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Scale down large images
        let width = img.width;
        let height = img.height;
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          const scale = MAX_IMAGE_SIZE / Math.max(width, height);
          width *= scale;
          height *= scale;
        }

        const newImageNode: NewImageNode = {
          type: 'image',
          src: reader.result as string,
          x: x ?? 50,
          y: y ?? 50,
          width,
          height,
        };
        addNode(newImageNode);
        toast.success('Image added');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, [addNode]);

  const handleAddImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [loadImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      loadImage(file, x, y);
    }
  }, [loadImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleExport = useCallback(() => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `canvas-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Canvas exported');
  }, []);

  const handleClear = useCallback(() => {
    if (nodes.length === 0) return;
    clearCanvas();
    toast.success('Canvas cleared');
  }, [nodes.length, clearCanvas]);

  return (
    <div className="h-dvh max-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          title="Back to Focus"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tighter">
          CANVAS
        </h1>
        <div className="flex-1" />
        <ActiveTimerIndicator compact />
        <ThemeToggle />
      </header>

      {/* Toolbar */}
      <CanvasToolbar
        tool={tool}
        setTool={setTool}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onUndo={undo}
        onRedo={redo}
        onClear={handleClear}
        onExport={handleExport}
        onAddImage={handleAddImage}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Canvas Area */}
      <div 
        className="flex-1 overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CanvasStage
          nodes={nodes}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          tool={tool}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          addNode={addNode}
          updateNode={updateNode}
          stageRef={stageRef}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default Canvas;
