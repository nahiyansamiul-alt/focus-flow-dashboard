# ⚡ Quick Start Guide

Get FocusFlow running in 5 minutes!

## Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- 2 terminal windows

## 🚀 Setup (First Time Only)

```bash
# 1. Clone project
git clone <repo-url>
cd focus-flow-dashboard

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Create backend/.env
cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/focusflow
PORT=5000
EOF

# 4. Start MongoDB
mongod  # If running locally
```

## ⚙️ Running the App

**Terminal 1 - Backend:**
```bash
cd backend
node index.js
# Should see: Backend server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Should see: Local: http://localhost:8080
```

## 🌐 Open in Browser
Go to: **http://localhost:8080**

## ✅ Verify It Works

- [ ] Timer displays on home page
- [ ] Can create a todo
- [ ] Can press Ctrl+Shift+R to open reminder dialog
- [ ] Can navigate to NOTES page
- [ ] Can create a folder

## 🔑 Key Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Shift+R` | New reminder |
| `Ctrl+N` | New note |
| Click home icon | Go to dashboard |

## 📡 Check Backend

```bash
# Test if API is working
curl http://localhost:5000/api/todos
# Should return: []
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to MongoDB" | Start mongod or check MONGODB_URI |
| "Port 5000 already in use" | Run: `npx kill-port 5000` |
| "Port 8080 already in use" | Run: `npx kill-port 8080` |
| Blank page | Go to http://localhost:8080 (not 5000) |
| Reminder not saving | Check browser console (F12) for errors |

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [backend/README.md](./backend/README.md) for API details
- Review keyboard shortcuts in footer of app

## 🎉 You're Ready!

Start a focus session, create reminders, and track your productivity! 🚀
