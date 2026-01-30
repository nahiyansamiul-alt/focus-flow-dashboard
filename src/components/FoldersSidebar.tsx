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
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
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
    selectFolder, 
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

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folder = createFolder(newFolderName.trim(), selectedColor);
      selectFolder(folder.id);
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

      {/* Folders Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {folders.map((folder, index) => (
              <motion.div
                key={folder.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex flex-col items-center gap-2 group"
              >
                <div 
                  className={cn(
                    "relative rounded-lg transition-all",
                    selectedFolderId === folder.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  <Folder
                    color={folder.color}
                    size={0.8}
                    items={getNotesByFolder(folder.id).slice(0, 3).map((_, i) => (
                      <div key={i} className="w-full h-full p-1">
                        <div className="w-full h-1 bg-muted rounded" />
                      </div>
                    ))}
                    onClick={() => selectFolder(folder.id)}
                  />
                  
                  {/* Actions overlay */}
                  <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(folder.id);
                        setEditingName(folder.name);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(folder.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Folder name */}
                {editingId === folder.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateFolder(folder.id)}
                      className="h-6 text-xs w-20 text-center"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleUpdateFolder(folder.id)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs font-body text-center truncate max-w-[80px]">
                    {folder.name}
                  </span>
                )}
              </motion.div>
            ))}
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
