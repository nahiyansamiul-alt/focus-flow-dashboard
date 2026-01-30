import { useState } from "react";
import { useNotes } from "@/contexts/NotesContext";
import Folder from "@/components/Folder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Check, X, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const folderColors = [
  "#5227FF",
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#FFD700",
  "#00CED1",
];

const FoldersSidebar = () => {
  const { 
    folders, 
    selectedFolderId, 
    selectedNoteId,
    selectFolder, 
    selectNote,
    createFolder, 
    updateFolder, 
    deleteFolder,
    getNotesByFolder 
  } = useNotes();

  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(folderColors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleExpanded = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleFolderClick = (folderId: string) => {
    selectFolder(folderId);
    toggleExpanded(folderId);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folder = createFolder(newFolderName.trim(), selectedColor);
      selectFolder(folder.id);
      setExpandedFolders(prev => new Set(prev).add(folder.id));
      setNewFolderName("");
      setIsCreating(false);
    }
  };

  const handleUpdateFolder = (id: string) => {
    if (editingName.trim()) {
      updateFolder(id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Folders</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreating(true)}
          title="New Folder"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Folders List */}
      <div className="flex-1 overflow-y-auto pt-2">
        <div className="flex flex-col gap-1">
          <AnimatePresence mode="popLayout">
            {folders.map((folder, index) => {
              const isExpanded = expandedFolders.has(folder.id);
              const notes = getNotesByFolder(folder.id);
              
              return (
                <motion.div
                  key={folder.id}
                  layout
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                >
                  {/* Folder Header */}
                  <div 
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg cursor-pointer transition-colors group",
                      selectedFolderId === folder.id && !selectedNoteId 
                        ? "bg-muted" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handleFolderClick(folder.id)}
                  >
                    {/* Top row with arrow and actions */}
                    <div className="w-full flex items-center justify-between">
                      {/* Expand/Collapse Arrow */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </motion.div>

                      {/* Note count badge */}
                      <span className="text-xs text-muted-foreground">
                        {notes.length}
                      </span>

                      {/* Actions */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(folder.id);
                            setEditingName(folder.name);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(folder.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Folder Icon */}
                    <div className="flex-shrink-0 my-1">
                      <Folder
                        color={folder.color}
                        size={0.5}
                        items={[]}
                      />
                    </div>
                    
                    {/* Folder Name at bottom */}
                    <div className="w-full text-center">
                      {editingId === folder.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdateFolder(folder.id)}
                            className="h-5 text-xs flex-1 text-center"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 flex-shrink-0"
                            onClick={() => handleUpdateFolder(folder.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 flex-shrink-0"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-body truncate block">
                          {folder.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Notes List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 pl-2 border-l border-border">
                          {notes.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-2 px-2">
                              No notes
                            </p>
                          ) : (
                            notes.map((note) => (
                              <div
                                key={note.id}
                                className={cn(
                                  "flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors text-sm",
                                  selectedNoteId === note.id 
                                    ? "bg-primary text-primary-foreground" 
                                    : "hover:bg-muted/50"
                                )}
                                onClick={() => {
                                  selectFolder(folder.id);
                                  selectNote(note.id);
                                }}
                              >
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{note.title}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              {folderColors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    selectedColor === color && "ring-2 ring-offset-2 ring-primary"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This will delete the folder and all its notes. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && handleDeleteFolder(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoldersSidebar;
