import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Check, X } from "lucide-react";
import { CATEGORY_COLORS, Category, useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ColorSwatches = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
  <div className="flex flex-wrap gap-1.5">
    {CATEGORY_COLORS.map((c) => (
      <button
        key={c}
        type="button"
        aria-label={`Color ${c}`}
        onClick={() => onChange(c)}
        className={cn(
          "w-6 h-6 rounded-full border-2 transition-all",
          value === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
        )}
        style={{ backgroundColor: c }}
      />
    ))}
  </div>
);

export const CategoryManager = ({ isOpen, onOpenChange }: CategoryManagerProps) => {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error,
  } = useCategories();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(CATEGORY_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    setOperationError(null);
    try {
      await createCategory(newName, newColor);
      setNewName("");
      setNewColor(CATEGORY_COLORS[0]);
    } catch (requestError) {
      setOperationError(
        requestError instanceof Error ? requestError.message : "Failed to create category"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const beginEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditColor(c.color);
  };

  const commitEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setIsSaving(true);
    setOperationError(null);
    try {
      await updateCategory(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
    } catch (requestError) {
      setOperationError(
        requestError instanceof Error ? requestError.message : "Failed to update category"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    setOperationError(null);
    try {
      await deleteCategory(id);
    } catch (requestError) {
      setOperationError(
        requestError instanceof Error ? requestError.message : "Failed to delete category"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Manage Categories</DialogTitle>
          <DialogDescription className="font-body text-sm">
            Create, rename, recolor, or delete categories for your tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {(operationError || error) && (
            <p role="alert" className="text-sm text-destructive font-body">
              {operationError || error}
            </p>
          )}

          {/* Existing */}
          <div className="space-y-2">
            <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              Your Categories
            </Label>
            {isLoading && categories.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground py-4 text-center">
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground py-4 text-center">
                No categories yet.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((c) => (
                  <div key={c.id} className="border border-border rounded p-3 bg-muted/30">
                    {editingId === c.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="font-body text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void commitEdit();
                          }}
                        />
                        <ColorSwatches value={editColor} onChange={setEditColor} />
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                          <Button size="sm" onClick={() => void commitEdit()} disabled={isSaving}>
                            <Check className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="font-body text-sm flex-1 truncate">{c.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => beginEdit(c)} className="h-7">
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDelete(c.id)}
                          disabled={isSaving}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create new */}
          <div className="space-y-2 border-t pt-4">
            <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              New Category
            </Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="font-body text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
            />
            <ColorSwatches value={newColor} onChange={setNewColor} />
            <Button
              onClick={() => void handleCreate()}
              disabled={!newName.trim() || isSaving}
              className="w-full gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
