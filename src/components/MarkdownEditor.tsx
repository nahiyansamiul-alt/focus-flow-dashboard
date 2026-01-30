import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  content: string;
  title: string;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
}

const MarkdownEditor = ({ content, title, onContentChange, onTitleChange }: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  const insertMarkdown = useCallback((before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    onContentChange(newContent);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onContentChange]);

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

  const handleTitleSubmit = () => {
    onTitleChange(editableTitle);
    setIsEditingTitle(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-4 flex items-center gap-2">
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
          <div className="h-full overflow-auto p-4 prose prose-sm max-w-none dark:prose-invert">
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
              {content || "*Start writing...*"}
            </ReactMarkdown>
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Start writing in Markdown..."
            className="h-full resize-none border-none rounded-none focus-visible:ring-0 font-mono text-sm"
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
