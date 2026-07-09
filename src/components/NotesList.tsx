import { useMemo, useRef, useState, forwardRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useNotes } from "@/contexts/NotesContext";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNoteFolderId, getNoteId } from "@/lib/note-links";

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

const NOTE_ROW_HEIGHT = 41;
const NOTE_LIST_HEIGHT = 640;
const NOTE_OVERSCAN = 8;

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
  const [scrollTop, setScrollTop] = useState(0);
  
  // Filter notes by the selected folder's folderId
  const filteredNotes = notes.filter(note => {
    return getNoteFolderId(note) === String(selectedFolderId);
  });
  const visibleNotes = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / NOTE_ROW_HEIGHT) - NOTE_OVERSCAN);
    const count = Math.ceil(NOTE_LIST_HEIGHT / NOTE_ROW_HEIGHT) + NOTE_OVERSCAN * 2;
    return {
      start,
      items: filteredNotes.slice(start, start + count),
      before: start * NOTE_ROW_HEIGHT,
      after: Math.max(0, (filteredNotes.length - start - count) * NOTE_ROW_HEIGHT),
    };
  }, [filteredNotes, scrollTop]);

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
      <div
        className="sidebar-scroll flex-1 overflow-y-auto overscroll-contain pr-1"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
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
            <div>
              <div style={{ height: visibleNotes.before }} />
              <div className="space-y-1">
                {visibleNotes.items.map((note, index) => (
                  <AnimatedNoteItem
                    key={getNoteId(note)}
                    noteId={getNoteId(note)}
                    title={note.title}
                    isSelected={getNoteId(note) === String(selectedNoteId)}
                    onClick={() => selectNote(getNoteId(note) || null)}
                    onDelete={() => handleDeleteNote(getNoteId(note))}
                    index={visibleNotes.start + index}
                  />
                ))}
              </div>
              <div style={{ height: visibleNotes.after }} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotesList;
