import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Video,
  Eye,
  Edit,
  Check,
  Grid3X3,
  Download,
  PenTool,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounceWithStatus } from "@/hooks/use-debounce";
import { PaperBackground, PatternPreview, paperPatterns, type PaperPattern, getPatternStyle } from "@/components/ui/paper-background";
import NoteTimer from "@/components/NoteTimer";
import { LatexTemplates } from "@/components/editor/LatexTemplates";
import { CodeBlock, InlineCode } from "@/components/editor/CodeBlock";
import { SaveIndicator } from "@/components/editor/SaveIndicator";
import { AnnotationOverlay } from "@/components/editor/AnnotationOverlay";
import { useAnnotations, AnnotationTool } from "@/components/editor/useAnnotations";
import { toast } from "sonner";

interface MarkdownEditorProps {
  content: string;
  title: string;
  noteId: string;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
}

const ANNOTATION_TOOLS: { id: AnnotationTool; icon: typeof Pen; label: string; shortcut: string }[] = [
  { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter', shortcut: 'H' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'V' },
];

const ANNOTATION_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

const MarkdownEditor = ({ content, title, noteId, onContentChange, onTitleChange }: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [localContent, setLocalContent] = useState(content || "");
  const [paperPattern, setPaperPattern] = useState<PaperPattern>(() => {
    const saved = localStorage.getItem("editor-paper-pattern");
    return (saved as PaperPattern) || "none";
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentToBackendRef = useRef<string>(content || "");
  const currentNoteIdRef = useRef(noteId);

  // Annotation state
  const ann = useAnnotations(noteId);

  // Memoize the save callback to prevent unnecessary debounce re-triggers
  const handleSave = useCallback((debouncedContent: string) => {
    if (debouncedContent !== lastSentToBackendRef.current) {
      lastSentToBackendRef.current = debouncedContent;
      onContentChange(debouncedContent);
    }
  }, [onContentChange]);

  // Debounce content changes with status tracking
  const saveStatus = useDebounceWithStatus(
    localContent, 
    500, 
    handleSave,
    content || ""
  );

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  // When switching to a different note, reset localContent
  useEffect(() => {
    if (noteId !== currentNoteIdRef.current) {
      currentNoteIdRef.current = noteId;
      setLocalContent(content || "");
      lastSentToBackendRef.current = content || "";
    }
  }, [noteId, content]);

  useEffect(() => {
    localStorage.setItem("editor-paper-pattern", paperPattern);
  }, [paperPattern]);

  // Annotation keyboard shortcuts (only when annotation mode is active)
  useEffect(() => {
    if (!annotationMode) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();

      const keyMap: Record<string, AnnotationTool> = {
        p: 'pen', h: 'highlighter', e: 'eraser', l: 'line',
        r: 'rect', c: 'circle', t: 'text', v: 'pan',
      };
      if (!ctrl && keyMap[k]) { ann.setTool(keyMap[k]); return; }

      if (ctrl && k === 'z' && !e.shiftKey) { e.preventDefault(); ann.undo(); }
      if (ctrl && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); ann.redo(); }

      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        // Delete selected handled inside overlay if needed
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [annotationMode, ann]);

  const insertMarkdown = useCallback((before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      localContent.substring(0, start) + 
      before + textToInsert + after + 
      localContent.substring(end);
    
    setLocalContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [localContent]);

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "**", "bold"), title: "Bold" },
    { icon: Italic, action: () => insertMarkdown("*", "*", "italic"), title: "Italic" },
    { icon: Strikethrough, action: () => insertMarkdown("~~", "~~", "strikethrough"), title: "Strikethrough" },
    { type: "divider" },
    { icon: Heading1, action: () => insertMarkdown("# ", "", "Heading 1"), title: "Heading 1" },
    { icon: Heading2, action: () => insertMarkdown("## ", "", "Heading 2"), title: "Heading 2" },
    { icon: Heading3, action: () => insertMarkdown("### ", "", "Heading 3"), title: "Heading 3" },
    { type: "divider" },
    { icon: List, action: () => insertMarkdown("- ", "", "list item"), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertMarkdown("1. ", "", "list item"), title: "Numbered List" },
    { icon: Quote, action: () => insertMarkdown("> ", "", "quote"), title: "Quote" },
    { icon: Code, action: () => insertMarkdown("```\n", "\n```", "code"), title: "Code Block" },
    { type: "divider" },
    { icon: Link, action: () => insertMarkdown("[", "](url)", "link text"), title: "Link" },
    { icon: Image, action: () => insertMarkdown("![alt](", ")", "image-url"), title: "Image" },
    { icon: Video, action: () => insertMarkdown('<video src="', '" controls></video>', "video-url"), title: "Video" },
  ];

  const handleLatexInsert = useCallback((template: string, isBlock?: boolean) => {
    if (isBlock) {
      insertMarkdown("$$\n", "\n$$", template);
    } else {
      insertMarkdown("$", "$", template);
    }
  }, [insertMarkdown]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([`# ${title}\n\n${localContent}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [title, localContent]);

  const handleTitleSubmit = useCallback(() => {
    const trimmedTitle = editableTitle.trim();
    if (trimmedTitle && trimmedTitle !== title) {
      if (titleChangeTimeoutRef.current) {
        clearTimeout(titleChangeTimeoutRef.current);
      }
      titleChangeTimeoutRef.current = setTimeout(() => {
        onTitleChange(trimmedTitle);
      }, 100);
    }
    setIsEditingTitle(false);
  }, [editableTitle, title, onTitleChange]);

  const toggleAnnotationMode = useCallback(() => {
    if (!isPreview) {
      // Switch to preview first when enabling annotation mode
      setIsPreview(true);
    }
    setAnnotationMode(prev => !prev);
  }, [isPreview]);

  return (
    <div className="flex flex-col h-full">
      {/* Timer and Title Row */}
      <div className="mb-4 flex items-center gap-4">
        <NoteTimer noteTitle={title} />
        <div className="h-6 w-px bg-border" />
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="text-2xl font-display font-bold border-none p-0 h-auto focus-visible:ring-0"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={handleTitleSubmit}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <h2 
            className="text-2xl font-display font-bold cursor-pointer hover:text-muted-foreground transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h2>
        )}
        
        <div className="ml-auto">
          <SaveIndicator status={saveStatus} />
        </div>
      </div>

      {/* Toolbar Row 1 — Markdown formatting */}
      <div className="flex items-center gap-1 p-2 border border-border rounded-t-lg bg-muted/50 flex-wrap">
        {toolbarButtons.map((btn, i) => (
          btn.type === "divider" ? (
            <div key={i} className="w-px h-6 bg-border mx-1" />
          ) : (
            <Button
              key={i}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={btn.action}
              title={btn.title}
              disabled={isPreview}
            >
              {btn.icon && <btn.icon className="w-4 h-4" />}
            </Button>
          )
        ))}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <LatexTemplates onInsert={handleLatexInsert} disabled={isPreview} />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Annotation Mode Toggle */}
        <Button
          variant={annotationMode ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={toggleAnnotationMode}
          title="Annotate (draw on preview)"
        >
          <PenTool className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        {/* Download Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Download as Markdown"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
        </Button>

        {/* Paper Pattern Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Paper background"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Paper Background</p>
              <div className="grid grid-cols-5 gap-2">
                {paperPatterns.map((pattern) => (
                  <PatternPreview
                    key={pattern}
                    pattern={pattern}
                    isSelected={paperPattern === pattern}
                    onClick={() => setPaperPattern(pattern)}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          variant={isPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            if (annotationMode && isPreview) {
              // Don't allow switching to edit mode while annotating
              toast.info("Disable annotation mode first");
              return;
            }
            setIsPreview(!isPreview);
          }}
          className="gap-2"
        >
          {isPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {/* Toolbar Row 2 — Annotation tools (shown when annotation mode is active) */}
      {annotationMode && (
        <div className="flex items-center gap-1 p-2 border border-t-0 border-border bg-muted/30 flex-wrap">
          {/* Tools */}
          {ANNOTATION_TOOLS.map(({ id, icon: Icon, label, shortcut }) => (
            <Button
              key={id}
              variant={ann.tool === id ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => ann.setTool(id)}
              title={`${label} (${shortcut})`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-1" />

          {/* Color palette */}
          <div className="flex items-center gap-0.5">
            {ANNOTATION_COLORS.map(c => (
              <button
                key={c}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                  ann.color === c ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                )}
                style={{ backgroundColor: c }}
                onClick={() => ann.setColor(c)}
              />
            ))}
            <Input
              type="color"
              value={ann.color}
              onChange={e => ann.setColor(e.target.value)}
              className="w-7 h-7 p-0 border-0 cursor-pointer"
            />
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Brush size */}
          <div className="flex items-center gap-1.5 min-w-[100px]">
            <span className="text-xs text-muted-foreground">Size:</span>
            <Slider
              value={[ann.brushSize]}
              onValueChange={([v]) => ann.setBrushSize(v)}
              min={1}
              max={20}
              step={1}
              className="w-16"
            />
            <span className="text-xs font-mono w-4 text-center">{ann.brushSize}</span>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Undo/Redo/Clear */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ann.undo} disabled={!ann.canUndo} title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={ann.redo} disabled={!ann.canRedo} title="Redo (Ctrl+Y)">
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={ann.clearAll} title="Clear all annotations">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Editor / Preview */}
      <div className={cn(
        "flex-1 border border-t-0 border-border rounded-b-lg overflow-hidden",
      )}>
        {isPreview ? (
          <div className="h-full overflow-auto relative" style={getPatternStyle(paperPattern)}>
            <div className="w-full h-full">
              <div ref={contentRef} className="p-4 prose prose-sm max-w-none dark:prose-invert min-h-full relative">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match && !className;
                      return isInline ? (
                        <InlineCode>{children}</InlineCode>
                      ) : (
                        <CodeBlock language={match?.[1]}>
                          {String(children).replace(/\n$/, "")}
                        </CodeBlock>
                      );
                    },
                    img: ({ src, alt }) => (
                      <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full h-auto rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    ),
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {children}
                      </a>
                    ),
                    video: (props) => (
                      <video {...props} className="max-w-full rounded-lg" controls />
                    ),
                  }}
                >
                  {localContent || "*Start writing...*"}
                </ReactMarkdown>
              </div>
            </div>

            {/* Annotation overlay — transparent canvas on top of rendered markdown */}
            <AnnotationOverlay
              annotations={ann.annotations}
              onAddAnnotation={ann.addAnnotation}
              onUpdateAnnotation={ann.updateAnnotation}
              onDeleteAnnotation={ann.deleteAnnotation}
              tool={ann.tool}
              color={ann.color}
              brushSize={ann.brushSize}
              active={annotationMode}
              contentRef={contentRef}
            />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Start writing in Markdown..."
            className="h-full resize-none border-none rounded-none focus-visible:ring-0 font-mono text-sm"
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
