# 🖥 Electron Desktop App Setup Guide

Convert FocusFlow into a standalone desktop application that users can download and run instantly.

## 🎯 What You Get

- ✅ Single executable file (Windows .exe, Mac .dmg, Linux .AppImage)
- ✅ Auto-bundled frontend + backend + MongoDB
- ✅ Works offline (no web server needed)
- ✅ Installer with auto-update capabilities
- ✅ Native desktop experience (menu bar, taskbar, etc.)

## 📦 Architecture

```
FocusFlow Desktop App
├── Electron Main Process (Node.js)
│   ├── Manages window and app lifecycle
│   └── Runs Express backend server
├── Frontend (React)
│   └── Renders in Electron window
└── Backend (Express.js + MongoDB embedded)
    └── Provides API endpoints
```

## 🚀 Installation & Setup

### Step 1: Install Electron Dependencies

```bash
npm install
```

This installs:
- `electron` - Desktop framework
- `electron-builder` - Package into installers
- `concurrently` - Run multiple processes
- `wait-on` - Wait for servers to start

### Step 2: Verify Backend Configuration

Create/update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/focusflow
PORT=5000
NODE_ENV=production
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

## 🔧 Development with Electron

### Run in Development Mode

```bash
npm run dev:electron
```

This:
1. Starts Vite dev server on port 3000
2. Waits for it to be ready
3. Opens Electron app with DevTools

### Testing Features

- Frontend hot-reload works (Vite HMR)
- Backend runs inside Electron
- Press `Ctrl+Shift+I` to open DevTools
- Debugging: Use Chrome DevTools

## 🏗 Building for Distribution

### Build for Your Platform

```bash
# Windows (creates .exe installer and portable)
npm run build:electron:win

# Mac (creates .dmg)
npm run build:electron:mac

# Linux (creates AppImage and deb)
npm run build:electron:linux

# All platforms
npm run build:electron:all
```

### Output Files

After building, find installers in `dist_electron/`:

```
dist_electron/
├── FocusFlow-1.0.0.exe         # Windows installer
├── FocusFlow-1.0.0-portable.exe # Windows portable (no install needed)
├── FocusFlow-1.0.0.dmg         # Mac installer
├── FocusFlow-1.0.0.AppImage    # Linux executable
└── focusflow_1.0.0_amd64.deb   # Linux package
```

## 📤 Distribution Methods

### Option 1: Direct Download
Upload `.exe` / `.AppImage` / `.dmg` to GitHub Releases:

```bash
# Create release on GitHub and upload executable
```

Users click download and run!

### Option 2: Installer Packages
- **Windows**: Users run `.exe` → App installs → Creates Start Menu shortcut
- **Mac**: Users drag app to Applications folder
- **Linux**: Users run `AppImage` or `sudo dpkg -i *.deb`

### Option 3: Auto-Update (Advanced)
```bash
npm install electron-updater
```

Add to `electron/main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

## 🔐 Code Signing (Production)

For distribution on app stores, you need code signing:

```bash
# Windows
set CSC_LINK=<certificate-file>
set CSC_KEY_PASSWORD=<password>
npm run build:electron:win

# Mac (requires Apple Developer account)
set CSC_IDENTITY_AUTO_DISCOVERY=true
npm run build:electron:mac
```

## 🗃 Packaging Details

### What's Bundled

```
FocusFlow.exe (~150MB includes:)
├── Chromium browser engine
├── Node.js runtime
├── Express.js + dependencies
├── React app + all modules
└── MongoDB embedded
```

### File Size Optimization

- Frontend: ~500KB (gzipped)
- Backend: ~50MB (with modules)
- Chromium: ~100MB
- **Total**: ~150-200MB

To reduce:
```bash
# Remove DevTools in production
# Remove unused modules
# Enable code splitting
```

## 🔍 Configuration Files

### `electron-builder.json`
Defines build output, installer options, icons:
- `win.target` - Windows installer type
- `nsis` - Installer options
- `files` - What to include in package
- `directories` - Build output location

### `electron/main.js`
Main process - manages:
- Creating windows
- Starting backend server
- Handling app lifecycle
- Creating menus

### `electron/preload.js`
Bridge between Node.js and browser:
- Exposes safe APIs
- Prevents XSS attacks
- Provides Electron context

## 🚨 Troubleshooting

### App won't start in production build
```bash
# Check if backend is starting
# Verify NODE_ENV is not "development"
# Check MongoDB connection in backend logs
```

### "Cannot find module" errors
```bash
# Ensure backend/node_modules exists
npm install
cd backend && npm install && cd ..
```

### Port already in use
```bash
# Kill existing processes
npx kill-port 5000 3000
```

### Building fails
```bash
# Clear caches
rm -rf dist dist_electron
npm run build:electron
```

## 📝 Release Checklist

- [ ] Update version in `package.json`
- [ ] Test dev build: `npm run dev:electron`
- [ ] Test production build: `npm run build:electron`
- [ ] Verify installer runs and app launches
- [ ] Test all features (timer, notes, reminders, etc.)
- [ ] Check file size is reasonable
- [ ] Create GitHub release
- [ ] Upload executables to release
- [ ] Update download links in README

## 🎉 Publishing Release

### GitHub Releases (Recommended)

```bash
# 1. Create release on GitHub
# 2. Upload built files:
#    - FocusFlow-1.0.0.exe (Windows)
#    - FocusFlow-1.0.0.dmg (Mac)
#    - FocusFlow-1.0.0.AppImage (Linux)

# 3. Users download and run
```

### Website Download Link

```html
<a href="https://github.com/yourname/focusflow/releases/download/v1.0.0/FocusFlow-1.0.0.exe">
  Download FocusFlow for Windows
</a>
```

## 📦 Platform-Specific Notes

### Windows
- Installer with uninstaller
- Start menu shortcut auto-created
- Taskbar icon support
- File association possible

### macOS
- .dmg installer
- Code signing required for distribution
- Auto-updater works
- Notarization needed for Big Sur+

### Linux
- AppImage (single file, no install needed)
- .deb package (apt install)
- Desktop entry auto-created
- No special permissions needed

## 🔗 Useful Resources

- [Electron Docs](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [IPC Communication](https://www.electronjs.org/docs/latest/api/ipc-main)

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Test dev mode**: `npm run dev:electron`
3. **Build for Windows**: `npm run build:electron:win`
4. **Upload to GitHub Releases**
5. **Share download link with users!**

---

**Now your users can download FocusFlow and use it immediately! 🚀**
