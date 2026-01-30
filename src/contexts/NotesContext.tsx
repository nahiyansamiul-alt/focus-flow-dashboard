import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface NotesContextType {
  folders: NoteFolder[];
  notes: Note[];
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  
  // Folder CRUD
  createFolder: (name: string, color?: string) => NoteFolder;
  updateFolder: (id: string, updates: Partial<Pick<NoteFolder, 'name' | 'color'>>) => void;
  deleteFolder: (id: string) => void;
  
  // Note CRUD
  createNote: (folderId: string, title?: string) => Note;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => void;
  
  // Selection
  selectFolder: (id: string | null) => void;
  selectNote: (id: string | null) => void;
  
  // Getters
  getNotesByFolder: (folderId: string) => Note[];
  getSelectedNote: () => Note | null;
  getSelectedFolder: () => NoteFolder | null;
}

const NotesContext = createContext<NotesContextType | null>(null);

const STORAGE_KEY = "notes-data";

const generateId = () => Math.random().toString(36).substring(2, 9);

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

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFolders(data.folders?.map((f: NoteFolder) => ({
          ...f,
          createdAt: new Date(f.createdAt)
        })) || []);
        setNotes(data.notes?.map((n: Note) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt)
        })) || []);
      } catch (e) {
        console.error("Failed to parse notes data", e);
      }
    } else {
      // Initialize with a default folder
      const defaultFolder: NoteFolder = {
        id: generateId(),
        name: "My Notes",
        color: folderColors[0],
        createdAt: new Date()
      };
      setFolders([defaultFolder]);
      
      const defaultNote: Note = {
        id: generateId(),
        title: "Welcome",
        content: "# Welcome to Notes\n\nStart writing your thoughts here!\n\n## Features\n- **Bold** and *italic* text\n- Images and videos from URLs\n- Organized folders",
        folderId: defaultFolder.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes([defaultNote]);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (folders.length > 0 || notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders, notes }));
    }
  }, [folders, notes]);

  // Folder CRUD
  const createFolder = (name: string, color?: string): NoteFolder => {
    const newFolder: NoteFolder = {
      id: generateId(),
      name,
      color: color || folderColors[folders.length % folderColors.length],
      createdAt: new Date()
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Pick<NoteFolder, 'name' | 'color'>>) => {
    setFolders(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setNotes(prev => prev.filter(n => n.folderId !== id));
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
      setSelectedNoteId(null);
    }
  };

  // Note CRUD
  const createNote = (folderId: string, title?: string): Note => {
    const newNote: Note = {
      id: generateId(),
      title: title || "Untitled",
      content: "",
      folderId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
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
  const getNotesByFolder = (folderId: string) => {
    return notes.filter(n => n.folderId === folderId);
  };

  const getSelectedNote = () => {
    return notes.find(n => n.id === selectedNoteId) || null;
  };

  const getSelectedFolder = () => {
    return folders.find(f => f.id === selectedFolderId) || null;
  };

  return (
    <NotesContext.Provider value={{
      folders,
      notes,
      selectedFolderId,
      selectedNoteId,
      createFolder,
      updateFolder,
      deleteFolder,
      createNote,
      updateNote,
      deleteNote,
      selectFolder,
      selectNote,
      getNotesByFolder,
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
