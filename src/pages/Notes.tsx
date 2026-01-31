import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import FoldersSidebar from "@/components/FoldersSidebar";
import NotesList from "@/components/NotesList";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, Plus, PanelLeftClose, PanelLeft } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const NotesContent = () => {
  const navigate = useNavigate();
  const { getSelectedNote, updateNote, selectedNoteId, selectedFolderId, createNote, selectNote } = useNotes();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const selectedNote = getSelectedNote();

  const handleCreateNote = async () => {
    if (selectedFolderId) {
      const note = await createNote("Untitled", "");
      if (note) {
        selectNote(note._id || note.id || "");
      }
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center gap-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          title="Back to Focus"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
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

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Folders Sidebar - Collapsible */}
          {!isSidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                <ScrollArea className="h-full">
                  <div className="p-4 border-r border-border h-full">
                    <FoldersSidebar />
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle withHandle />
            </>
          )}

          {/* Notes List - Only show when folder is selected */}
          {!isSidebarCollapsed && selectedFolderId && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <ScrollArea className="h-full">
                  <div className="p-4 border-r border-border h-full">
                    <NotesList />
                  </div>
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle withHandle />
            </>
          )}

          {/* Editor Area */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <main className="h-full p-6 overflow-hidden">
              {selectedNote ? (
                <MarkdownEditor
                  key={selectedNoteId}
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
          </ResizablePanel>
        </ResizablePanelGroup>
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
