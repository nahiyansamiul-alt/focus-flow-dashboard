# FocusFlow Backend API

Express.js REST API server for the FocusFlow productivity dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/focusflow
PORT=5000
EOF

# Start server
node index.js
# Server runs on http://localhost:5000
```

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

### Folders
- `GET /folders` - Get all folders
- `POST /folders` - Create folder
- `PUT /folders/:id` - Update folder
- `DELETE /folders/:id` - Delete folder

### Reminders
- `GET /reminders` - Get all reminders
- `GET /reminders/date/:date` - Get reminders by date
- `POST /reminders` - Create reminder
- `PUT /reminders/:id` - Update reminder
- `DELETE /reminders/:id` - Delete reminder

### History
- `GET /history` - Get all history
- `GET /history/:date` - Get history by date
- `POST /history` - Log action

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

## 🔧 Configuration

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/focusflow
PORT=5000
```

Or use MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focusflow
PORT=5000
```

## 📚 Models

Located in `models/`:
- `Todo.js` - Todo tasks
- `Note.js` - Notes
- `Folder.js` - Note folders
- `Reminder.js` - Task reminders
- `History.js` - Activity history

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
  -d '{"title":"Meeting","date":"2026-02-01T10:00:00","description":"Team sync"}'
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