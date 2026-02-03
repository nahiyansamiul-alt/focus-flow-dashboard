import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Folder {
  _id?: string;
  id?: string;
  name: string;
  color: string;
  createdAt?: Date;
}

interface Note {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  folderId: string | { _id: string }; // Can be populated or just an ID
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotesContextType {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  
  // Folder operations
  createFolder: (name: string, color: string) => Promise<Folder | null>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  selectFolder: (id: string | null) => void;
  getSelectedFolder: () => Folder | null;
  
  // Note operations
  createNote: (title: string, content: string) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  getSelectedNote: () => Note | null;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Fetch folders on mount
  useEffect(() => {
    fetchFolders();
  }, []);

  // Fetch notes when folder is selected
  useEffect(() => {
    if (selectedFolderId) {
      fetchNotesByFolder(selectedFolderId);
    } else {
      setNotes([]);
    }
  }, [selectedFolderId]);

  // Fetch all folders
  const fetchFolders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/folders`);
      if (!response.ok) throw new Error("Failed to fetch folders");
      const data = await response.json();
      // Sort folders by creation date (oldest first, newest last)
      const sortedData = data.sort((a: Folder, b: Folder) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      setFolders(sortedData);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  // Fetch notes by folder
  const fetchNotesByFolder = async (folderId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/folder/${folderId}`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    }
  };

  // Create folder
  const createFolder = async (name: string, color: string): Promise<Folder | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (!response.ok) throw new Error("Failed to create folder");
      const folder = await response.json();
      setFolders((prev) => [...prev, folder]);
      return folder;
    } catch (error) {
      console.error("Error creating folder:", error);
      return null;
    }
  };

  // Update folder
  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update folder");
      const updatedFolder = await response.json();
      setFolders((prev) =>
        prev.map((f) => ((f._id || f.id) === id ? updatedFolder : f))
      );
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  // Delete folder (and its notes via backend cascade)
  const deleteFolder = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete folder");
      
      setFolders((prev) => prev.filter((f) => (f._id || f.id) !== id));
      
      // If the deleted folder was selected, clear selection
      if (selectedFolderId === id) {
        setSelectedFolderId(null);
        setSelectedNoteId(null);
        setNotes([]);
      } else {
        // Remove notes from the deleted folder from state
        setNotes((prev) => prev.filter((n) => {
          const noteFolderId = typeof n.folderId === 'string' ? n.folderId : n.folderId._id;
          return noteFolderId !== id;
        }));
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  // Select folder
  const selectFolder = (id: string | null) => {
    setSelectedFolderId(id);
    setSelectedNoteId(null); // Clear note selection when switching folders
  };

  // Get selected folder
  const getSelectedFolder = (): Folder | null => {
    if (!selectedFolderId) return null;
    return folders.find((f) => (f._id || f.id) === selectedFolderId) || null;
  };

  // Create note
  const createNote = async (title: string, content: string): Promise<Note | null> => {
    if (!selectedFolderId) {
      console.error("No folder selected");
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, folderId: selectedFolderId }),
      });
      if (!response.ok) throw new Error("Failed to create note");
      const note = await response.json();
      setNotes((prev) => [note, ...prev]); // Add to beginning for newest first
      setSelectedNoteId(note._id || note.id);
      return note;
    } catch (error) {
      console.error("Error creating note:", error);
      return null;
    }
  };

  // Update note
  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      // Only send fields that were actually updated, not undefined ones
      const updateData = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      );
      
      console.log(`[NotesContext] Updating note ${id} with:`, updateData);
      
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error(`[NotesContext] API Error updating note ${id}:`, error);
        throw new Error(error.error || "Failed to update note");
      }
      
      const updatedNote = await response.json();
      console.log(`[NotesContext] Note ${id} updated successfully:`, updatedNote);
      
      setNotes((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? updatedNote : n))
      );
    } catch (error) {
      console.error(`[NotesContext] Error updating note ${id}:`, error);
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete note");
      
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      
      // If the deleted note was selected, clear selection
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Select note
  const selectNote = (id: string | null) => {
    setSelectedNoteId(id);
  };

  // Get selected note
  const getSelectedNote = (): Note | null => {
    if (!selectedNoteId) return null;
    return notes.find((n) => (n._id || n.id) === selectedNoteId) || null;
  };

  return (
    <NotesContext.Provider
      value={{
        folders,
        notes,
        selectedFolderId,
        selectedNoteId,
        createFolder,
        updateFolder,
        deleteFolder,
        selectFolder,
        getSelectedFolder,
        createNote,
        updateNote,
        deleteNote,
        selectNote,
        getSelectedNote,
      }}
    >
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