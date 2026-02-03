# 🛠 Development Guide

Guide for developers working on FocusFlow.

## Project Overview

**FocusFlow** is a full-stack productivity dashboard with:
- React 18 + TypeScript frontend
- Express.js + MongoDB backend
- Real-time data persistence
- Focus timer, todo list, activity tracking, reminders, and notes

## 📁 Architecture

```
Frontend (React/TypeScript)
        ↓
API Service Layer (src/lib/api.ts)
        ↓
Express.js Backend (REST API)
        ↓
MongoDB (Database)
```

## 🏗 Code Organization

### Frontend Structure
```
src/
├── components/        # Reusable React components
├── contexts/          # React Context for state management
├── hooks/             # Custom React hooks
├── pages/             # Page-level components
├── lib/
│   └── api.ts         # Centralized API calls
└── App.tsx            # Root component
```

### Backend Structure
```
backend/
├── src/
│   ├── controllers/    # SQLite query handlers
│   ├── models/         # TypeScript type definitions
│   ├── routes/         # API endpoint routing
│   ├── database.ts     # SQLite initialization & queries
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── index.js            # Bootstrap file
└── package.json
```

## 🔄 Data Flow

### Creating a Todo Example

**Frontend:**
```
User clicks "Add Todo" 
  → TodoList component calls fetch with POST to /api/todos
  → API service sends request
  
Backend receives request
  → Route handler receives data
  → Controller validates and processes
  → Executes SQLite INSERT query
  → Returns created todo with ID

Frontend receives response
  → Updates local state
  → Shows toast notification
  → Re-renders TodoList
```

## 📝 Adding a New Feature

### Step 1: Backend Controller (SQLite)
Create `backend/src/controllers/yourController.ts`:
```typescript
import { Request, Response } from 'express';
import { allAsync, runAsync, getAsync } from '../database';

export const getItems = async (_req: Request, res: Response) => {
  try {
    const items = await allAsync('SELECT * FROM items ORDER BY createdAt DESC');
    res.json(items);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch items' });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const result = await runAsync(
      `INSERT INTO items (name, description, createdAt) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [name, description || null]
    );
    const item = await getAsync('SELECT * FROM items WHERE id = ?', [result.id]);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create item' });
  }
};
```

### Step 2: Backend Routes
Create `backend/src/routes/yourRoutes.ts`:
```typescript
import { Router } from 'express';
import { getItems, createItem } from '../controllers/yourController';

const router = Router();

router.get('/', getItems);
router.post('/', createItem);

export default router;
```

### Step 3: Register Route in database.ts
Add table creation to `backend/src/database.ts`:
```typescript
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### Step 4: Register Route in app.ts
In `backend/src/app.ts`:
```typescript
import yourRoutes from './routes/yourRoutes';

app.use('/api/your-route', yourRoutes);
```

### Step 5: Frontend API Service
In `src/lib/api.ts`:
```typescript
export const yourAPI = {
  getAll: () => fetchAPI<any[]>('/your-route'),
  create: (data: any) =>
    fetchAPI<any>('/your-route', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI<any>(`/your-route/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<any>(`/your-route/${id}`, {
      method: 'DELETE',
    }),
};
```

### Step 6: Frontend Context (Optional)
Create `src/contexts/YourContext.tsx`:
```typescript
import { createContext, useContext } from "react";
import { yourAPI } from "@/lib/api";

interface YourContextType {
  items: any[];
  createItem: (data: any) => Promise<void>;
  // ... other methods
}

const YourContext = createContext<YourContextType | null>(null);

export const YourProvider = ({ children }: any) => {
  // ... implementation
  return (
    <YourContext.Provider value={{ /* ... */ }}>
      {children}
    </YourContext.Provider>
  );
};

export const useYour = () => {
  const context = useContext(YourContext);
  if (!context) throw new Error("useYour must be within provider");
  return context;
};
```

### Step 6: Frontend Component
Create `src/components/YourComponent.tsx`:
```typescript
import { useYour } from "@/contexts/YourContext";

const YourComponent = () => {
  const { items, createItem } = useYour();
  
  return (
    <div>
      {items.map(item => (
        <div key={item._id}>{item.title}</div>
      ))}
    </div>
  );
};

export default YourComponent;
```

## 🎨 Component Best Practices

### State Management Hierarchy
1. **Component State** - Local UI state (loading, open/closed)
2. **Context API** - Shared data across multiple components
3. **Backend/MongoDB** - Persistent data

### Example:
```typescript
// Local state for UI
const [isOpen, setIsOpen] = useState(false);

// Shared state from context
const { items, loading } = useYour();

// Backend persistence
const { createItem } = useYour(); // Calls API → DB
```

## 🔌 API Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Success Response:
```javascript
{
  success: true,
  data: { _id: "123", title: "Todo 1", ... }
}
```

### Error Response:
```javascript
{
  success: false,
  error: "Failed to create todo"
}
```

## 🧪 Testing Workflow

### Frontend
```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run lint     # Check code style
```

### Backend
```bash
cd backend
node index.js                # Start server
curl http://localhost:5000/api/todos  # Test endpoint
```

### Full Stack
```bash
# Terminal 1
cd backend && node index.js

# Terminal 2
npm run dev

# Then visit http://localhost:8080
```

## 🐛 Debugging Tips

### Frontend (Browser DevTools)
- F12 opens DevTools
- Console tab shows React errors
- Network tab shows API calls
- Application tab shows stored data

### Backend (Terminal)
```javascript
console.log('Debug:', data);  // Print to terminal
console.error('Error:', error); // Error logging
```

### Database (MongoDB)
```bash
mongosh
use focusflow
db.todos.find()              # See all todos
db.reminders.findOne()       # See one reminder
db.todos.deleteMany({})      # Clear collection
```

## 📚 Dependencies to Know

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Utility styling
- **shadcn/ui** - Component library
- **motion/react** - Animations
- **sonner** - Toast notifications
- **React Router** - Navigation

### Backend
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin requests
- **dotenv** - Environment config

## 🚀 Deployment Checklist

- [ ] Update API_BASE_URL in src/lib/api.ts
- [ ] Set proper MongoDB URI
- [ ] Run `npm run build` and test build
- [ ] Ensure error handling for all routes
- [ ] Add input validation
- [ ] Test on production database
- [ ] Set NODE_ENV=production
- [ ] Monitor logs after deploy

## 📖 Useful Commands

```bash
# Frontend
npm run dev              # Dev server with HMR
npm run build           # Production build
npm run lint            # Lint code
npm run format          # Format code

# Backend
cd backend && npm install    # Install deps
node index.js                # Start server
npm run dev                  # Dev with auto-reload (if configured)

# Database
mongosh                      # Connect to MongoDB
db.stats()                   # Database stats
show collections             # List all collections
db.collection.count()        # Count documents
```

## 🎯 Common Tasks

### Add New API Endpoint
1. Create route in `backend/routes/`
2. Add to `backend/index.js`
3. Add API function in `src/lib/api.ts`
4. Use in component via API service

### Add New Context
1. Create `src/contexts/NewContext.tsx`
2. Wrap route in `App.tsx` or page component
3. Use `useNew()` hook in components

### Update Component
1. Edit component file
2. HMR automatically refreshes (if running `npm run dev`)
3. Test in browser

## 📞 Support

- Check error messages in console (Ctrl+Shift+I)
- Review backend logs in terminal
- Check MongoDB data with mongosh
- Read relevant README files
