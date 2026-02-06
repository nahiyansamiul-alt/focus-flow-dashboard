import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer2,
  Pencil,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  ImagePlus,
} from "lucide-react";
import { Tool } from "./types";
import { cn } from "@/lib/utils";

interface CanvasToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  onAddImage: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { id: Tool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'draw', icon: Pencil, label: 'Draw (D)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
];

const colors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

export const CanvasToolbar = ({
  tool,
  setTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onAddImage,
  canUndo,
  canRedo,
}: CanvasToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-3 bg-card border-b border-border flex-wrap">
        {/* Tool Selection */}
        <div className="flex items-center gap-1 border-r border-border pr-3">
          {tools.map(({ id, icon: Icon, label }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === id ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setTool(id)}
                  className="h-9 w-9"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-1 border-r border-border pr-3">
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  strokeColor === color ? "border-primary ring-2 ring-primary/30" : "border-border"
                )}
                style={{ backgroundColor: color }}
                onClick={() => setStrokeColor(color)}
              />
            ))}
          </div>
          <Input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-8 h-8 p-0 border-0 cursor-pointer"
          />
        </div>

        {/* Stroke Width */}
        <div className="flex items-center gap-2 border-r border-border pr-3 min-w-[140px]">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Width:</span>
          <Slider
            value={[strokeWidth]}
            onValueChange={([value]) => setStrokeWidth(value)}
            min={1}
            max={20}
            step={1}
            className="w-20"
          />
          <span className="text-xs font-mono w-5 text-center">{strokeWidth}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-r border-border pr-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-9 w-9"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-9 w-9"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        {/* Add Image */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAddImage} className="h-9 w-9">
              <ImagePlus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Image</TooltipContent>
        </Tooltip>

        {/* Clear */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onClear} className="h-9 w-9 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Canvas</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        {/* Export */}
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export PNG
        </Button>
      </div>
    </TooltipProvider>
  );
};
