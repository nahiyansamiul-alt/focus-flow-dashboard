import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { notesAPI, foldersAPI } from "@/lib/api";
import { toast } from "sonner";

export interface Note {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface NoteFolder {
  _id?: string;
  id?: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface NotesContextType {
  folders: NoteFolder[];
  notes: Note[];
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  loading: boolean;
  
  // Folder CRUD
  createFolder: (name: string, color?: string) => Promise<NoteFolder | null>;
  updateFolder: (id: string, updates: Partial<Pick<NoteFolder, 'name' | 'color'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  
  // Note CRUD
  createNote: (title?: string, content?: string) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Selection
  selectFolder: (id: string | null) => void;
  selectNote: (id: string | null) => void;
  
  // Getters
  getSelectedNote: () => Note | null;
  getSelectedFolder: () => NoteFolder | null;
}

const NotesContext = createContext<NotesContextType | null>(null);

const folderColors = [
  "#5227FF", // Purple
  "#FF5733", // Red-Orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#FF33A1", // Pink
  "#FFD700", // Gold
  "#00CED1", // Cyan
];

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider = ({ children }: NotesProviderProps) => {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load folders and notes from backend
  const loadFolders = async () => {
    try {
      const result = await foldersAPI.getAll();
      if (result.success) {
        const data = result.data || [];
        const mappedFolders = data.map((f: any) => ({
          ...f,
          id: f._id || f.id,
          createdAt: new Date(f.createdAt)
        }));
        setFolders(mappedFolders);
        
        // Select first folder by default
        if (mappedFolders.length > 0 && !selectedFolderId) {
          setSelectedFolderId(mappedFolders[0]._id || mappedFolders[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const loadNotes = async () => {
    try {
      const result = await notesAPI.getAll();
      if (result.success) {
        const data = result.data || [];
        const mappedNotes = data.map((n: any) => ({
          ...n,
          id: n._id || n.id,
          createdAt: new Date(n.createdAt),
          updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date(n.createdAt)
        }));
        setNotes(mappedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadFolders();
      await loadNotes();
      
      // If no folders exist, create a default dummy folder
      const foldersResult = await foldersAPI.getAll();
      if (foldersResult.success && (!foldersResult.data || foldersResult.data.length === 0)) {
        try {
          const defaultFolder = await foldersAPI.create("Notes", "#5227FF");
          if (defaultFolder.success && defaultFolder.data) {
            const newFolder = {
              ...defaultFolder.data,
              id: defaultFolder.data._id,
              createdAt: new Date(defaultFolder.data.createdAt)
            };
            setFolders([newFolder]);
            setSelectedFolderId(newFolder._id || newFolder.id);
          }
        } catch (error) {
          console.error("Error creating default folder:", error);
        }
      }
      
      setLoading(false);
    };
    loadData();
  }, []);

  // Folder CRUD
  const createFolder = async (name: string, color?: string): Promise<NoteFolder | null> => {
    try {
      const selectedColor = color || folderColors[folders.length % folderColors.length];
      const result = await foldersAPI.create(name, selectedColor);
      if (result.success && result.data) {
        const newFolder = {
          ...result.data,
          id: result.data._id,
          createdAt: new Date(result.data.createdAt)
        };
        setFolders(prev => [...prev, newFolder]);
        toast.success("Folder created");
        return newFolder;
      } else {
        toast.error(result.error || "Failed to create folder");
      }
    } catch (error) {
      toast.error("Error creating folder");
      console.error(error);
    }
    return null;
  };

  const updateFolder = async (id: string, updates: Partial<Pick<NoteFolder, 'name' | 'color'>>) => {
    try {
      const result = await foldersAPI.update(id, updates);
      if (result.success) {
        setFolders(prev => prev.map(f => 
          (f._id === id || f.id === id) ? { ...f, ...updates } : f
        ));
        toast.success("Folder updated");
      } else {
        toast.error(result.error || "Failed to update folder");
      }
    } catch (error) {
      toast.error("Error updating folder");
      console.error(error);
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const result = await foldersAPI.delete(id);
      if (result.success) {
        setFolders(prev => prev.filter(f => (f._id !== id && f.id !== id)));
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedFolderId === id) {
          setSelectedFolderId(null);
          setSelectedNoteId(null);
        }
        toast.success("Folder deleted");
      } else {
        toast.error(result.error || "Failed to delete folder");
      }
    } catch (error) {
      toast.error("Error deleting folder");
      console.error(error);
    }
  };

  // Note CRUD
  const createNote = async (title?: string, content?: string): Promise<Note | null> => {
    try {
      const result = await notesAPI.create(title || "Untitled", content || "");
      if (result.success && result.data) {
        const newNote = {
          ...result.data,
          id: result.data._id,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt || result.data.createdAt)
        };
        setNotes(prev => [...prev, newNote]);
        toast.success("Note created");
        return newNote;
      } else {
        toast.error(result.error || "Failed to create note");
      }
    } catch (error) {
      toast.error("Error creating note");
      console.error(error);
    }
    return null;
  };

  const updateNote = async (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    try {
      const result = await notesAPI.update(id, updates);
      if (result.success) {
        setNotes(prev => prev.map(n => 
          (n._id === id || n.id === id) ? { ...n, ...updates, updatedAt: new Date() } : n
        ));
      } else {
        toast.error(result.error || "Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const result = await notesAPI.delete(id);
      if (result.success) {
        setNotes(prev => prev.filter(n => (n._id !== id && n.id !== id)));
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
        }
        toast.success("Note deleted");
      } else {
        toast.error(result.error || "Failed to delete note");
      }
    } catch (error) {
      toast.error("Error deleting note");
      console.error(error);
    }
  };

  // Selection
  const selectFolder = (id: string | null) => {
    setSelectedFolderId(id);
    setSelectedNoteId(null);
  };

  const selectNote = (id: string | null) => {
    setSelectedNoteId(id);
  };

  // Getters
  const getSelectedNote = () => {
    return notes.find(n => (n._id === selectedNoteId || n.id === selectedNoteId)) || null;
  };

  const getSelectedFolder = () => {
    return folders.find(f => (f._id === selectedFolderId || f.id === selectedFolderId)) || null;
  };

  return (
    <NotesContext.Provider value={{
      folders,
      notes,
      selectedFolderId,
      selectedNoteId,
      loading,
      createFolder,
      updateFolder,
      deleteFolder,
      createNote,
      updateNote,
      deleteNote,
      selectFolder,
      selectNote,
      getSelectedNote,
      getSelectedFolder
    }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
