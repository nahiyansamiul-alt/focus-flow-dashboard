import { useRef, forwardRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useNotes } from "@/contexts/NotesContext";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedNoteItemProps {
  noteId: string;
  title: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  index: number;
}

const AnimatedNoteItem = forwardRef<HTMLDivElement, AnimatedNoteItemProps>(
  ({ noteId, title, isSelected, onClick, onDelete, index }, ref) => {
    const localRef = useRef<HTMLDivElement>(null);
    const inView = useInView(localRef, { amount: 0.5, once: true });

    // merge forwarded ref and localRef
    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (!ref) return;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as any).current = node;
    };

    return (
    <motion.div
      ref={setRefs}
      layout
      initial={{ scale: 0.8, opacity: 0, x: -20 }}
      animate={inView ? { scale: 1, opacity: 1, x: 0 } : { scale: 0.8, opacity: 0, x: -20 }}
      exit={{ scale: 0.8, opacity: 0, x: -50 }}
      transition={{ 
        duration: 0.2, 
        delay: index * 0.03,
        layout: { duration: 0.15 }
      }}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
      onClick={onClick}
    >
      <FileText className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 truncate text-sm font-body">{title}</span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected ? "hover:bg-primary-foreground/20" : ""
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </motion.div>
    );
  }
);

const NotesList = () => {
  const { 
    selectedFolderId, 
    selectedNoteId, 
    notes,
    createNote, 
    deleteNote, 
    selectNote,
    getSelectedFolder
  } = useNotes();

  const folder = getSelectedFolder();
  
  // Filter notes by the selected folder's folderId
  const filteredNotes = notes.filter(note => {
    const noteFolderId = typeof note.folderId === 'object' ? note.folderId?._id : note.folderId;
    return noteFolderId === selectedFolderId;
  });

  const handleCreateNote = async () => {
    if (selectedFolderId) {
      await createNote("Untitled", "");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
  };

  if (!selectedFolderId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Select a folder to view notes
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg truncate">
          {folder?.name || "Notes"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateNote}
          title="New Note"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <AnimatePresence>
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-sm text-center py-8"
            >
              No notes yet. Create one!
            </motion.div>
          ) : (
            filteredNotes.map((note, index) => (
              <AnimatedNoteItem
                key={note._id || note.id}
                noteId={note._id || note.id || ""}
                title={note.title}
                isSelected={(note._id || note.id) === selectedNoteId}
                onClick={() => selectNote(note._id || note.id || null)}
                onDelete={() => handleDeleteNote(note._id || note.id || "")}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotesList;