# 🎯 FocusFlow - Productivity Dashboard

A modern, feature-rich productivity and focus management application built with React, TypeScript, Express.js, and SQLite.

**Available as a free desktop app!** Download for Windows, macOS, or Linux → [INSTALL.md](./INSTALL.md)

**Self-Hosted Single .exe** - Deploy as a standalone executable with built-in SQLite database!

## ✨ Features

### 📊 Core Features
- **Focus Timer** - Track focus sessions with visual timer
- **Todo List** - Manage daily tasks and priorities
- **Activity Dashboard** - Visual contribution grid showing productivity over time
- **Statistics** - Real-time productivity metrics and insights
- **Task Reminders** - Set date-based reminders with notifications (dates glow red!)
- **Notes & Folders** - Organize notes with markdown editor and folder structure
- **Clock** - Real-time clock display

### 🎨 User Experience
- **Dark/Light Mode** - Comfortable viewing in any environment
- **Keyboard Shortcuts** - Fast navigation with hotkeys:
  - `Ctrl+Shift+R` - Create new reminder
  - `Ctrl+N` - New note
  - `Ctrl+Shift+N` - New folder
  - `Ctrl+S` - Save
  - `Ctrl+K` - Search
  - `Esc` - Close dialogs
- **Real-time Sync** - All data persists to SQLite
- **Responsive Design** - Works on desktop and tablet
- **Toast Notifications** - User-friendly feedback

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or bun

### Installation

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd focus-flow-dashboard
npm install

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Create .env file in backend directory
cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/focusflow
PORT=5000
EOF

# 4. Start MongoDB (if running locally)
mongod

# 5. Start both servers in separate terminals

# Terminal 1 - Backend (SQLite)
cd backend
node index.js
# Should see: Server running on port 5000
# SQLite database created at: backend/focusflow.db

# Terminal 2 - Frontend
npm run dev
# Should see: Local: http://localhost:5173
```

### Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Database**: SQLite file at `backend/focusflow.db`

## 📁 Project Structure

```
focus-flow-dashboard/
├── backend/                          # Express.js server
│   ├── models/                       # MongoDB schemas
│   │   ├── Todo.js
│   │   ├── Note.js
│   │   ├── Folder.js
│   │   ├── Reminder.js
│   │   └── History.js
│   ├── routes/                       # API endpoints
│   │   ├── todos.js
│   │   ├── notes.js
│   │   ├── folders.js
│   │   ├── reminders.js
│   │   └── history.js
│   ├── index.js                      # Server entry point
│   └── package.json
│
├── src/
│   ├── components/                   # React components
│   │   ├── Timer.tsx                 # Focus timer
│   │   ├── Clock.tsx                 # Real-time clock
│   │   ├── TodoList.tsx              # Todo management
│   │   ├── ContributionGrid.tsx      # Activity board
│   │   ├── Stats.tsx                 # Statistics
│   │   ├── NotesList.tsx             # Notes list
│   │   ├── FoldersSidebar.tsx        # Folder management
│   │   ├── MarkdownEditor.tsx        # Rich note editor
│   │   ├── ReminderForm.tsx          # Reminder creation
│   │   ├── ReminderPopup.tsx         # Reminder details
│   │   └── ui/                       # shadcn/ui components
│   │
│   ├── contexts/                     # React Context API
│   │   ├── SessionContext.tsx        # Session management
│   │   ├── NotesContext.tsx          # Notes & folders state
│   │   └── RemindersContext.tsx      # Reminders state
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── use-keyboard-shortcuts.ts # Keyboard shortcuts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── lib/
│   │   ├── api.ts                    # Centralized API calls
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── Index.tsx                 # Dashboard home
│   │   ├── Notes.tsx                 # Notes page
│   │   └── NotFound.tsx              # 404 page
│   │
│   ├── App.tsx                       # Main app component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
│
├── public/                           # Static assets
├── package.json                      # Frontend dependencies
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts                # Tailwind CSS
├── tsconfig.json                     # TypeScript config
└── README.md                         # This file
```

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (lightning fast)
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **motion/react** - Smooth animations
- **sonner** - Toast notifications
- **React Router** - Client-side routing
- **React Context API** - State management

### Backend
- **Node.js + Express.js** - REST API server
- **SQLite** - Lightweight, self-hosted database
- **TypeScript** - Type-safe backend code
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## 📡 API Endpoints

### Todos
```
GET    /api/todos              - Get all todos
POST   /api/todos              - Create todo
PUT    /api/todos/:id          - Update todo
DELETE /api/todos/:id          - Delete todo
```

### Notes
```
GET    /api/notes              - Get all notes
POST   /api/notes              - Create note
PUT    /api/notes/:id          - Update note
DELETE /api/notes/:id          - Delete note
```

### Folders
```
GET    /api/folders            - Get all folders
POST   /api/folders            - Create folder
PUT    /api/folders/:id        - Update folder
DELETE /api/folders/:id        - Delete folder
```

### Reminders
```
GET    /api/reminders          - Get all reminders
GET    /api/reminders/date/:date - Get reminders by date
POST   /api/reminders          - Create reminder
PUT    /api/reminders/:id      - Update reminder
DELETE /api/reminders/:id      - Delete reminder
```

### Sessions & History
```
GET    /api/history            - Get all history
POST   /api/history            - Log action
```

## 💾 Data Models

### Todo
```typescript
{
  title: string,
  completed: boolean,
  createdAt: Date
}
```

### Note
```typescript
{
  title: string,
  content: string,
  createdAt: Date,
  updatedAt?: Date
}
```

### Folder
```typescript
{
  name: string,
  color: string,
  createdAt: Date
}
```

### Reminder
```typescript
{
  title: string,
  description: string,
  date: Date,
  completed: boolean,
  createdAt: Date,
  updatedAt?: Date
}
```

### Session
```typescript
{
  start: string,
  end: string,
  duration: number,
  date: Date
}
```

## 🎮 Usage Guide

### Create a Focus Session
1. Click the timer on the home page
2. Enter duration in minutes
3. Click "Start" to begin
4. Focus time tracked automatically

### Manage Todos
1. Click "ADD TODO" to create new task
2. Type task description
3. Check box to mark complete
4. Click trash to delete

### Create Reminders
1. Press `Ctrl+Shift+R` or click "New Reminder"
2. Enter title, description, date, and time
3. Click "Create Reminder"
4. Dates with reminders show red glow on activity board
5. Click red date to view reminder details

### Organize Notes
1. Go to NOTES page
2. Create folders in sidebar
3. Create notes inside folders
4. Edit with markdown support
5. Changes auto-save to database

### View Activity
- Activity board shows productivity heatmap
- Click any date to see focus sessions
- Dates with reminders show red pulse
- Darker squares = more focus time

## 📊 Statistics

Real-time stats show:
- **Total Sessions** - Number of focus sessions
- **Total Time** - Combined focus time
- **Daily Average** - Average focus per day
- **Longest Session** - Maximum duration
- **Current Streak** - Consecutive days active

## ⌨ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+R` | Create new reminder |
| `Ctrl+N` | New note |
| `Ctrl+Shift+N` | New folder |
| `Ctrl+S` | Save note |
| `Ctrl+K` | Search |
| `Esc` | Close dialogs |

## 🔧 Development

### Running in Development Mode

```bash
# Terminal 1 - Backend with auto-reload
cd backend
npm run dev

# Terminal 2 - Frontend with hot reload
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production node index.js
```

### Testing

```bash
npm run test
npm run test:ui
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## 🐛 Troubleshooting

### Frontend shows "Server is up and running"
- You're visiting `http://localhost:5000` (backend) instead of `http://localhost:8080` (frontend)
- Go to `http://localhost:8080`

### Cannot create notes/reminders
- Ensure MongoDB is running
- Check backend console for connection errors
- Verify `MONGODB_URI` in `backend/.env`

### Keyboard shortcuts not working
- Ensure app window is focused
- Some browser extensions may intercept shortcuts
- Try different key combinations

### Data not persisting
- Verify MongoDB connection: `mongosh` → `use focusflow` → `db.todos.find()`
- Check backend logs for errors
- Ensure backend is running

### Port already in use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 8080 (frontend)
npx kill-port 8080
```

## 📈 Future Enhancements

Planned features:
- [ ] Search & filter notes
- [ ] Tags system for notes
- [ ] Export notes (PDF, Markdown, HTML)
- [ ] Calendar view for sessions
- [ ] Goal setting & tracking
- [ ] Habit tracking
- [ ] Integrations (Google Calendar, Slack)
- [ ] Mobile app (React Native)
- [ ] Collaborative features
- [ ] AI-powered suggestions

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

Need help? 
- Check the troubleshooting section
- Review backend logs: `backend/index.js`
- Check browser console for errors (F12)

---

**Built with ❤️ for productive people who want to stay focused.**

*Last Updated: January 31, 2026*

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
