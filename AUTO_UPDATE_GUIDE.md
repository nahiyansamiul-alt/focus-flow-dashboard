# 🚀 FocusFlow Auto-Update Guide

This guide explains how to build your Electron app and set up automatic updates for your users.

## 📦 Building the App

### Windows Build
```bash
npm run build:electron:win
```
Output: Creates `.exe` installer in `dist_electron/` folder

### Mac Build
```bash
npm run build:electron:mac
```
Output: Creates `.dmg` installer

### Linux Build
```bash
npm run build:electron:linux
```
Output: Creates `.AppImage` installer

### All Platforms
```bash
npm run build:electron:all
```

---

## 🔄 Setting Up Auto-Updates

### How It Works

1. **User installs the app** from the `.exe` installer
2. **App checks GitHub Releases** for new versions on startup
3. **If update available**: Shows "Update Available" notification
4. **User clicks "Install Now"** → app downloads and installs
5. **App restarts** with new version

### Step 1: Setup GitHub Repository

1. Create a **public GitHub repository**:
   - Go to github.com and create a new repo
   - Name it: `focus-flow-dashboard`
   - Make it **PUBLIC** (required for updates)

2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/focus-flow-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Update Configuration

Edit `electron-builder.json`:
- Replace `"your-username"` with your actual GitHub username
- Replace `"focus-flow-dashboard"` with your repo name

Current config:
```json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "focus-flow-dashboard"
}
```

### Step 3: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it permissions:
   - `repo` (Full control of private repositories)
4. Copy the token

### Step 4: Build and Release

1. **Update version** in `package.json`:
```json
{
  "version": "1.0.1"
}
```

2. **Set GitHub token** (Windows PowerShell):
```powershell
$env:GH_TOKEN = "your_token_here"
```

3. **Build the app**:
```bash
npm run build:electron:win
```

4. **electron-builder automatically publishes** to GitHub Releases

### Step 5: Verify Release

1. Go to: https://github.com/YOUR_USERNAME/focus-flow-dashboard/releases
2. You should see a new release with:
   - `FocusFlow Setup 1.0.1.exe` (installer)
   - `FocusFlow 1.0.1.exe` (portable)
   - `latest.yml` (update metadata - auto-generated)

---

## 🔔 Update Notification UI

The app now shows two dialogs:

### 1. "Update Available" Dialog
- Shows when a new version is found
- User can click "Later" to dismiss
- Update downloads automatically in background

### 2. "Update Ready to Install" Dialog
- Shows when download completes
- User clicks "Install Now" → app restarts with new version
- Or click "Later" to install on next app restart

---

## 📋 Update Flow Diagram

```
User opens app
    ↓
Check GitHub for new version
    ↓
No new version? → Continue normally
    ↓ (new version found)
Show "Update Available" dialog
    ↓
Download update in background
    ↓
Show "Update Ready to Install" dialog
    ↓
User clicks "Install Now"
    ↓
Quit and install → Restart app
```

---

## 🔧 Advanced Configuration

### Change Update Check Interval

In `electron/main.cjs`:
```javascript
// Default: checks on startup only
autoUpdater.checkForUpdatesAndNotify();

// To check periodically (every 1 hour):
autoUpdater.checkForUpdatesAndNotify();
setInterval(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 60 * 60 * 1000);
```

### Use Different Update Provider

Instead of GitHub, you can use:
- **AWS S3**
- **Aliyun**
- **Generic HTTP server**

See: https://www.electron.build/configuration/publish

---

## 🚨 Troubleshooting

### Updates not showing up?

1. **Check GitHub token** is valid
2. **Repo must be PUBLIC**
3. **Version must be higher** than previous release
4. **Delete `dist_electron/` folder** before rebuilding:
   ```bash
   rmdir dist_electron /s /q
   npm run build:electron:win
   ```

### Release created but no `.yml` file?

- Rebuild with: `npm run build:electron:win`
- electron-builder auto-generates it

### Users getting old version?

- Check app's auto-updater logs
- Verify GitHub release has `latest.yml` file
- Make sure version in `package.json` is higher

---

## 📝 Development Workflow

1. Make changes to code
2. Test with: `npm run dev:electron`
3. Increase version in `package.json`
4. Commit and push to GitHub
5. Build: `npm run build:electron:win`
6. Release created automatically on GitHub

Next users to install will get the new version, and existing users will get update notification!

---

## 🔗 Resources

- [electron-updater docs](https://www.electron.build/auto-update)
- [electron-builder publish config](https://www.electron.build/configuration/publish)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
