import { useState } from "react";
import { useReminders, type Reminder } from "@/contexts/RemindersContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit2, X } from "lucide-react";
import { motion } from "motion/react";

interface ReminderPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reminders: Reminder[];
  selectedDate: Date | null;
}

export const ReminderPopup = ({
  isOpen,
  onOpenChange,
  reminders,
  selectedDate,
}: ReminderPopupProps) => {
  const { updateReminder, deleteReminder } = useReminders();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const handleToggleComplete = async (reminder: Reminder) => {
    const id = reminder._id || reminder.id || "";
    await updateReminder(id, { ...reminder, completed: !reminder.completed });
  };

  const handleDelete = async (reminder: Reminder) => {
    const id = reminder._id || reminder.id || "";
    await deleteReminder(id);
  };

  const handleSaveEdit = async (reminder: Reminder) => {
    const id = reminder._id || reminder.id || "";
    await updateReminder(id, {
      ...reminder,
      title: editingTitle,
      description: editingDescription,
    });
    setEditingId(null);
  };

  const handleStartEdit = (reminder: Reminder) => {
    setEditingId(reminder._id || reminder.id || "");
    setEditingTitle(reminder.title);
    setEditingDescription(reminder.description);
  };

  if (!selectedDate) return null;

  const dateStr = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            Reminders for {dateStr}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No reminders for this date
            </p>
          ) : (
            reminders.map((reminder) => (
              <motion.div
                key={reminder._id || reminder.id}
                layout
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="p-3 border rounded-lg bg-card hover:bg-accent transition-colors"
              >
                {editingId === (reminder._id || reminder.id) ? (
                  <div className="space-y-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="Reminder title"
                      className="text-sm"
                    />
                    <Textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="text-sm min-h-16"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(reminder)}
                        variant="default"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setEditingId(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={reminder.completed}
                        onCheckedChange={() => handleToggleComplete(reminder)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm ${
                            reminder.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {reminder.title}
                        </p>
                        {reminder.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {reminder.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(reminder.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(reminder)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
