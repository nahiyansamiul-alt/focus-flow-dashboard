import { useEffect } from 'react';

interface KeyboardShortcuts {
  onNewNote?: () => void;
  onNewFolder?: () => void;
  onNewReminder?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
  onToggleFolders?: () => void;
  onToggleNotesList?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New Note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        shortcuts.onNewNote?.();
      }
      
      // Ctrl/Cmd + Shift + N: New Folder
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        shortcuts.onNewFolder?.();
      }
      
      // Ctrl/Cmd + Shift + R: New Reminder
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        shortcuts.onNewReminder?.();
      }
      
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        shortcuts.onSave?.();
      }
      
      // Ctrl/Cmd + K: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        shortcuts.onSearch?.();
      }
      
      // Ctrl/Cmd + B: Toggle Folders Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        shortcuts.onToggleFolders?.();
      }
      
      // Ctrl/Cmd + L: Toggle Notes List
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        shortcuts.onToggleNotesList?.();
      }
      
      // Escape: Close dialogs
      if (e.key === 'Escape') {
        shortcuts.onEscape?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
