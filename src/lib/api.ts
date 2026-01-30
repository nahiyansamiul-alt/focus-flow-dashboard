// API Service Layer - Centralized API calls with error handling
// Detect if running in Electron or browser
const isElectron = () => !!(window as any).electron;
const API_BASE_URL = isElectron() 
  ? 'http://localhost:5000/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Generic fetch wrapper with error handling
const fetchAPI = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = response.status === 204 ? null : await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// TODO API
export const todoAPI = {
  getAll: () => fetchAPI<any[]>('/todos'),
  create: (title: string) => 
    fetchAPI<any>('/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  update: (id: string, updates: any) =>
    fetchAPI<any>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchAPI<any>(`/todos/${id}`, {
      method: 'DELETE',
    }),
};

// NOTES API
export const notesAPI = {
  getAll: () => fetchAPI<any[]>('/notes'),
  getByFolder: (folderId: string) => fetchAPI<any[]>(`/notes/folder/${folderId}`),
  create: (title: string, folderId: string, content?: string) =>
    fetchAPI<any>('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, folderId, content }),
    }),
  update: (id: string, updates: any) =>
    fetchAPI<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchAPI<any>(`/notes/${id}`, {
      method: 'DELETE',
    }),
};

// FOLDERS API
export const foldersAPI = {
  getAll: () => fetchAPI<any[]>('/folders'),
  create: (name: string, color: string) =>
    fetchAPI<any>('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
  update: (id: string, updates: any) =>
    fetchAPI<any>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchAPI<any>(`/folders/${id}`, {
      method: 'DELETE',
    }),
};

// REMINDERS API
export const remindersAPI = {
  getAll: () => fetchAPI<any[]>('/reminders'),
  getByDate: (date: string) => fetchAPI<any[]>(`/reminders/date/${date}`),
  create: (title: string, date: string, description?: string) =>
    fetchAPI<any>('/reminders', {
      method: 'POST',
      body: JSON.stringify({ title, date, description }),
    }),
  update: (id: string, updates: any) =>
    fetchAPI<any>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchAPI<any>(`/reminders/${id}`, {
      method: 'DELETE',
    }),
};

// HISTORY API
export const historyAPI = {
  getAll: () => fetchAPI<any[]>('/history'),
  getByDate: (date: string) => fetchAPI<any[]>(`/history/${date}`),
  create: (action: string, details?: string) =>
    fetchAPI<any>('/history', {
      method: 'POST',
      body: JSON.stringify({ action, details }),
    }),
};
