import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import FoldersSidebar from "@/components/FoldersSidebar";
import NotesList from "@/components/NotesList";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, Plus, FolderClosed, List } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ThemeToggle } from "@/components/ThemeToggle";

const NotesContent = () => {
  const navigate = useNavigate();
  const { getSelectedNote, updateNote, selectedNoteId, selectedFolderId, createNote, selectNote } = useNotes();
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isNotesListCollapsed, setIsNotesListCollapsed] = useState(false);
  
  const selectedNote = getSelectedNote();

  const handleCreateNote = async () => {
    if (selectedFolderId) {
      const note = await createNote("Untitled", "");
      if (note) {
        selectNote(note._id || note.id || "");
      }
    }
  };

  const toggleFolders = useCallback(() => setIsFoldersCollapsed(prev => !prev), []);
  const toggleNotesList = useCallback(() => setIsNotesListCollapsed(prev => !prev), []);

  useKeyboardShortcuts({
    onToggleFolders: toggleFolders,
    onToggleNotesList: toggleNotesList,
  });

  // Calculate panel widths based on collapse states
  const getFoldersWidth = () => isFoldersCollapsed ? "0px" : "200px";
  const getNotesListWidth = () => {
    if (!selectedFolderId || isNotesListCollapsed) return "0px";
    return "240px";
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          title="Back to Focus"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        {/* Folders Toggle */}
        <Button
          variant={isFoldersCollapsed ? "outline" : "ghost"}
          size="icon"
          onClick={() => setIsFoldersCollapsed(!isFoldersCollapsed)}
          title={isFoldersCollapsed ? "Show folders" : "Hide folders"}
        >
          <FolderClosed className="w-5 h-5" />
        </Button>
        
        {/* Notes List Toggle - only show when folder is selected */}
        {selectedFolderId && (
          <Button
            variant={isNotesListCollapsed ? "outline" : "ghost"}
            size="icon"
            onClick={() => setIsNotesListCollapsed(!isNotesListCollapsed)}
            title={isNotesListCollapsed ? "Show notes list" : "Hide notes list"}
          >
            <List className="w-5 h-5" />
          </Button>
        )}
        
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tighter ml-2">
          NOTES
        </h1>
        <div className="flex-1" />
        <ThemeToggle />
        {selectedFolderId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNote}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        )}
      </header>

      {/* Main Content with Independent Panels */}
      <div className="flex-1 overflow-hidden flex">
        {/* Folders Sidebar */}
        <div
          className="h-full border-r border-border overflow-hidden flex-shrink-0"
          style={{ 
            width: getFoldersWidth(),
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div 
            className="h-full"
            style={{
              transform: isFoldersCollapsed ? 'translateX(-100%)' : 'translateX(0)',
              opacity: isFoldersCollapsed ? 0 : 1,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
            }}
          >
            <ScrollArea className="h-full">
              <div className="p-4 min-w-[200px]">
                <FoldersSidebar />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Notes List */}
        <div
          className="h-full border-r border-border overflow-hidden flex-shrink-0"
          style={{ 
            width: getNotesListWidth(),
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div 
            className="h-full"
            style={{
              transform: isNotesListCollapsed ? 'translateX(-100%)' : 'translateX(0)',
              opacity: isNotesListCollapsed ? 0 : 1,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
            }}
          >
            <ScrollArea className="h-full">
              <div className="p-4 min-w-[240px]">
                <NotesList />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 h-full overflow-hidden">
          <main className="h-full p-6 overflow-hidden">
            {selectedNote ? (
              <MarkdownEditor
                content={selectedNote.content}
                title={selectedNote.title}
                onContentChange={(content) => updateNote(selectedNote._id || selectedNote.id || "", { content })}
                onTitleChange={(title) => updateNote(selectedNote._id || selectedNote.id || "", { title })}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-body">Select a note to start editing</p>
                <p className="text-sm mt-2">Or create a new one from a folder</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const Notes = () => {
  return (
    <NotesProvider>
      <NotesContent />
    </NotesProvider>
  );
};

export default Notes;
