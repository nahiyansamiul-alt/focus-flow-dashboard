import { useNavigate } from "react-router-dom";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import FoldersSidebar from "@/components/FoldersSidebar";
import NotesList from "@/components/NotesList";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

const NotesContent = () => {
  const navigate = useNavigate();
  const { getSelectedNote, updateNote, selectedNoteId } = useNotes();
  
  const selectedNote = getSelectedNote();

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
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Folders Sidebar */}
        <aside className="w-64 border-r border-border p-4 overflow-hidden flex-shrink-0">
          <FoldersSidebar />
        </aside>

        {/* Notes List */}
        <aside className="w-64 border-r border-border p-4 overflow-hidden flex-shrink-0">
          <NotesList />
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
              <p className="text-sm mt-2">Or create a new one from the folder</p>
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
