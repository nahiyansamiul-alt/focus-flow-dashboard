import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounceWithStatus } from "@/hooks/use-debounce";
import { PaperBackground, PatternPreview, paperPatterns, type PaperPattern } from "@/components/ui/paper-background";
import NoteTimer from "@/components/NoteTimer";
import { LatexTemplates } from "@/components/editor/LatexTemplates";
import { CodeBlock, InlineCode } from "@/components/editor/CodeBlock";
import { SaveIndicator } from "@/components/editor/SaveIndicator";
import { InlineCanvas } from "@/components/editor/InlineCanvas";
import { toast } from "sonner";

interface MarkdownEditorProps {
  content: string;
  title: string;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
}

const MarkdownEditor = ({ content, title, onContentChange, onTitleChange }: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const [showCanvas, setShowCanvas] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [paperPattern, setPaperPattern] = useState<PaperPattern>(() => {
    const saved = localStorage.getItem("editor-paper-pattern");
    return (saved as PaperPattern) || "none";
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce content changes with status tracking
  const saveStatus = useDebounceWithStatus(
    localContent, 
    500, 
    (debouncedContent) => {
      if (debouncedContent !== content) {
        onContentChange(debouncedContent);
      }
    },
    content
  );

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    localStorage.setItem("editor-paper-pattern", paperPattern);
  }, [paperPattern]);

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
    
    // Set cursor position after insertion
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

  const handleCanvasSaveToMd = useCallback((mdSnippet: string) => {
    // Insert the markdown snippet into the content
    const textarea = textareaRef.current;
    if (textarea && !isPreview) {
      const start = textarea.selectionStart;
      const newContent = localContent.substring(0, start) + "\n" + mdSnippet + "\n" + localContent.substring(start);
      setLocalContent(newContent);
    } else {
      // Append to end
      setLocalContent(prev => prev + "\n\n" + mdSnippet);
    }
    toast.success("Sketch markdown inserted");
  }, [localContent, isPreview]);

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
      // Clear any pending updates
      if (titleChangeTimeoutRef.current) {
        clearTimeout(titleChangeTimeoutRef.current);
      }
      // Debounce the title change with a slight delay
      titleChangeTimeoutRef.current = setTimeout(() => {
        onTitleChange(trimmedTitle);
      }, 100);
    }
    setIsEditingTitle(false);
  }, [editableTitle, title, onTitleChange]);

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
        
        {/* Auto-save indicator */}
        <div className="ml-auto">
          <SaveIndicator status={saveStatus} />
        </div>
      </div>

      {/* Toolbar */}
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
        
        {/* LaTeX Templates */}
        <LatexTemplates onInsert={handleLatexInsert} disabled={isPreview} />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Canvas Toggle */}
        <Button
          variant={showCanvas ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowCanvas(!showCanvas)}
          title="Drawing Canvas"
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
          onClick={() => setIsPreview(!isPreview)}
          className="gap-2"
        >
          {isPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {/* Canvas Panel */}
      {showCanvas && (
        <div className="h-[400px] border border-t-0 border-border">
          <InlineCanvas onSaveToMd={handleCanvasSaveToMd} />
        </div>
      )}

      {/* Editor / Preview */}
      <div className={cn("flex-1 border border-t-0 border-border rounded-b-lg overflow-hidden", showCanvas && "border-t")}>
        {isPreview ? (
          <PaperBackground pattern={paperPattern} className="h-full overflow-auto">
            <div className="p-4 prose prose-sm max-w-none dark:prose-invert min-h-full">
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
          </PaperBackground>
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
