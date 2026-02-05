import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Grid3X3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { PaperBackground, PatternPreview, paperPatterns, type PaperPattern } from "@/components/ui/paper-background";
import NoteTimer from "@/components/NoteTimer";

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
  const [localContent, setLocalContent] = useState(content);
  const [paperPattern, setPaperPattern] = useState<PaperPattern>(() => {
    const saved = localStorage.getItem("editor-paper-pattern");
    return (saved as PaperPattern) || "none";
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce content changes
  useDebounce(localContent, 500, (debouncedContent) => {
    if (debouncedContent !== content) {
      onContentChange(debouncedContent);
    }
  });

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
    { icon: Code, action: () => insertMarkdown("`", "`", "code"), title: "Inline Code" },
    { type: "divider" },
    { icon: Link, action: () => insertMarkdown("[", "](url)", "link text"), title: "Link" },
    { icon: Image, action: () => insertMarkdown("![alt](", ")", "image-url"), title: "Image" },
    { icon: Video, action: () => insertMarkdown('<video src="', '" controls></video>', "video-url"), title: "Video" },
  ];

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
        
        <div className="flex-1" />

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

      {/* Editor / Preview */}
      <div className="flex-1 border border-t-0 border-border rounded-b-lg overflow-hidden">
        {isPreview ? (
          <PaperBackground pattern={paperPattern} className="h-full overflow-auto">
            <div className="p-4 prose prose-sm max-w-none dark:prose-invert min-h-full">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
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
                  // Handle video elements
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
