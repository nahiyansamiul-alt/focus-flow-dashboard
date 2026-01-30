import { useNavigate } from "react-router-dom";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import FoldersSidebar from "@/components/FoldersSidebar";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Plus } from "lucide-react";

const NotesContent = () => {
  const navigate = useNavigate();
  const { getSelectedNote, updateNote, selectedNoteId, selectedFolderId, createNote, selectNote } = useNotes();
  
  const selectedNote = getSelectedNote();

  const handleCreateNote = () => {
    if (selectedFolderId) {
      const note = createNote(selectedFolderId);
      selectNote(note.id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          title="Back to Focus"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tighter">
          NOTES
        </h1>
        <div className="flex-1" />
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Folders Sidebar - Discord style */}
        <aside className="w-72 border-r border-border p-4 overflow-y-auto flex-shrink-0">
          <FoldersSidebar />
        </aside>

        {/* Editor Area */}
        <main className="flex-1 p-6 overflow-hidden">
          {selectedNote ? (
            <MarkdownEditor
              key={selectedNoteId}
              content={selectedNote.content}
              title={selectedNote.title}
              onContentChange={(content) => updateNote(selectedNote.id, { content })}
              onTitleChange={(title) => updateNote(selectedNote.id, { title })}
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
