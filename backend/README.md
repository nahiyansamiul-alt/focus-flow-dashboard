# FocusFlow Backend API

Express.js REST API server for the FocusFlow productivity dashboard with SQLite database.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start server (uses SQLite - no configuration needed!)
node index.js
# Server runs on http://localhost:5000
# Database automatically created at: ./focusflow.db
```

## 🗄️ Database

- **SQLite** - Self-contained database file (`focusflow.db`)
- **No external dependencies** - Perfect for desktop/self-hosted apps
- **Automatic schema creation** - Tables created on first run
- **Foreign keys enabled** - Data integrity maintained

## 📡 API Routes

All routes are prefixed with `/api/`

### Todos
- `GET /todos` - Get all todos
- `POST /todos` - Create todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

### Notes
- `GET /notes` - Get all notes
- `POST /notes` - Create note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `GET /notes/folder/:folderId` - Get notes in folder

### Folders
- `GET /folders` - Get all folders
- `POST /folders` - Create folder
- `PUT /folders/:id` - Update folder
- `DELETE /folders/:id` - Delete folder (cascades to notes/todos)

### Reminders
- `GET /reminders` - Get all reminders
- `GET /reminders/:date` - Get reminders by date
- `POST /reminders` - Create reminder
- `PUT /reminders/:id` - Update reminder
- `DELETE /reminders/:id` - Delete reminder

### History (Focus Sessions)
- `GET /history` - Get all history
- `GET /history/:date` - Get history by date
- `POST /history` - Log action/session

### Sessions
- `GET /sessions` - Get all sessions
- `POST /sessions` - Create session

## 📦 Dependencies

- **express** - Web framework
- **sqlite3** - SQLite database driver
- **typescript** - Type safety
- **ts-node** - TypeScript runtime
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

## 🔧 Configuration

Set these environment variables in `.env` (optional):
```env
PORT=5000
DB_PATH=./focusflow.db
NODE_ENV=development
```

## 📚 Database Schema

Located in `src/database.ts`:

### todos
- id, title, description, completed, priority, dueDate, folderId, createdAt, updatedAt

### notes
- id, title, content, folderId, createdAt, updatedAt

### folders
- id, name, color, createdAt, updatedAt

### history
- id, action, details, duration, startTime, endTime, date, timestamp

### reminders
- id, title, description, reminderDate, reminderTime, completed, createdAt, updatedAt

### sessions
- id, date, startTime, endTime, duration, createdAt

## 🧪 Testing API

Use curl or Postman:

```bash
# Create todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test todo"}'

# Get all todos
curl http://localhost:5000/api/todos

# Create reminder
curl -X POST http://localhost:5000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{"title":"Meeting","reminderDate":"2026-02-01","reminderTime":"10:00","description":"Team sync"}'

# Create folder
curl -X POST http://localhost:5000/api/folders \
  -H "Content-Type: application/json" \
  -d '{"name":"Work","color":"#3b82f6"}'
```

## 🐛 Error Handling

All errors return JSON:
```json
{
  "error": "Error message describing what went wrong"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `404` - Not found
- `500` - Server error

## 📝 License

MIT