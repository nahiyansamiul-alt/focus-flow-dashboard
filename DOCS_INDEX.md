# 📚 Documentation Index

Welcome to FocusFlow! Here's where to find everything you need.

## 🚀 Getting Started

**Want to use FocusFlow?** → [INSTALL.md](./INSTALL.md)
- Download desktop app
- System requirements
- First launch setup
- Troubleshooting

**New to development?** → [QUICK_START.md](./QUICK_START.md)
- Set up the project in 5 minutes
- Verify everything works
- Quick troubleshooting guide

## 📖 Main Documentation

**Full Project Guide** → [README.md](./README.md)
- Complete feature list
- Project structure
- API endpoints
- Technology stack
- Keyboard shortcuts
- Common issues & fixes

**Desktop App Guide** → [ELECTRON_SETUP.md](./ELECTRON_SETUP.md)
- How to build desktop app
- Package for distribution
- Create installers
- Release on GitHub

**Backend API Reference** → [backend/README.md](./backend/README.md)
- API routes
- Models & schemas
- Testing the API
- Configuration
- Error handling

## 🛠 For Developers

**Development Guide** → [DEVELOPMENT.md](./DEVELOPMENT.md)
- Architecture overview
- How to add new features
- Code organization best practices
- Component patterns
- Debugging tips
- Common tasks

## 🎯 Quick Reference

### URLs
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api
- MongoDB: mongodb://localhost:27017/focusflow

### Key Commands
```bash
# First time setup
npm install
cd backend && npm install && cd ..

# Start development
cd backend && node index.js      # Terminal 1
npm run dev                      # Terminal 2

# Build for production
npm run build
```

### Keyboard Shortcuts
- **Ctrl+Shift+R** - New reminder
- **Ctrl+N** - New note
- **Ctrl+Shift+N** - New folder
- **Ctrl+S** - Save
- **Ctrl+K** - Search
- **Esc** - Close dialogs

## 📁 File Guide

| File | Purpose |
|------|---------|
| INSTALL.md | Download and install desktop app |
| README.md | Main documentation |
| QUICK_START.md | 5-minute dev setup guide |
| ELECTRON_SETUP.md | Build desktop app |
| DEVELOPMENT.md | Developer guide |
| backend/README.md | Backend API reference |
| package.json | Frontend dependencies |
| backend/package.json | Backend dependencies |
| electron-builder.json | Electron build config |
| electron/main.js | Electron entry point |
| vite.config.ts | Vite configuration |
| tsconfig.json | TypeScript configuration |

## 🏗 Project Structure

```
focus-flow-dashboard/
├── README.md                 # Main docs
├── QUICK_START.md            # Setup guide
├── DEVELOPMENT.md            # Dev guide
│
├── src/                      # Frontend (React)
│   ├── components/           # React components
│   ├── contexts/             # State management
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Page routes
│   ├── lib/api.ts            # API service
│   └── App.tsx               # Root component
│
├── backend/                  # Express.js API
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API handlers
│   ├── index.js              # Server entry
│   └── README.md             # API docs
│
├── package.json              # Frontend deps
└── vite.config.ts            # Vite config
```

## ❓ Common Questions

**Q: How do I start the project?**
A: See [QUICK_START.md](./QUICK_START.md)

**Q: How do I add a new feature?**
A: See [DEVELOPMENT.md](./DEVELOPMENT.md) → "Adding a New Feature"

**Q: What API endpoints are available?**
A: See [backend/README.md](./backend/README.md)

**Q: How do I deploy this?**
A: See [README.md](./README.md) → "Deployment"

**Q: What should I do if something breaks?**
A: See [README.md](./README.md) → "Troubleshooting"

## 🔗 Navigation

- **I want to...** 
  - Set up the project → [QUICK_START.md](./QUICK_START.md)
  - Understand the architecture → [DEVELOPMENT.md](./DEVELOPMENT.md)
  - Add a new feature → [DEVELOPMENT.md](./DEVELOPMENT.md#-adding-a-new-feature)
  - Check API endpoints → [backend/README.md](./backend/README.md)
  - Fix a problem → [README.md](./README.md#-troubleshooting)
  - Learn keyboard shortcuts → [README.md](./README.md#⌨-keyboard-shortcuts)

## 📞 Support

1. Check the relevant documentation above
2. Review error messages in browser console (F12)
3. Check backend logs in terminal
4. Search MongoDB data with `mongosh`

---

**Happy coding! 🚀**

*Last updated: January 31, 2026*
