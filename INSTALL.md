# Installation Guide

## 💻 Download FocusFlow

FocusFlow is available as a standalone desktop application for Windows, macOS, and Linux.

### Windows
- **Installer** - `FocusFlow-1.0.0.exe` (Recommended)
  - Full installer with uninstaller
  - Creates Start Menu shortcut
  - Auto-updates supported
- **Portable** - `FocusFlow-1.0.0-portable.exe`
  - No installation required
  - Run directly from USB drive
  - Requires Windows 10+

### macOS
- **DMG Installer** - `FocusFlow-1.0.0.dmg`
  - Drag app to Applications folder
  - Requires macOS 10.13+
  - Intel and Apple Silicon supported

### Linux
- **AppImage** - `FocusFlow-1.0.0.AppImage`
  - Single file, no installation
  - `chmod +x` and run directly
  - Works on most Linux distributions
- **Debian Package** - `focusflow_1.0.0_amd64.deb`
  - `sudo dpkg -i focusflow_*.deb`
  - Installs to system applications

## ⚙️ System Requirements

### Windows
- Windows 10 or later
- 500MB free disk space
- No additional software needed

### macOS
- macOS 10.13 or later
- 500MB free disk space
- Works on Intel and Apple Silicon Macs

### Linux
- Any Linux distribution (Ubuntu, Fedora, Arch, etc.)
- 500MB free disk space
- libgtk-3 required (usually pre-installed)

## 🚀 First Launch

1. Download the installer for your OS from [Releases](https://github.com/yourname/focusflow/releases)
2. Run the installer
3. FocusFlow launches automatically
4. Start creating reminders, todos, and notes!

## ✨ No Additional Setup Needed

FocusFlow includes everything:
- ✅ Database (MongoDB) - Built-in
- ✅ Backend server - Runs in background
- ✅ Frontend app - Fully installed
- ✅ No web server needed
- ✅ Works offline

## 🔄 Updates

FocusFlow will automatically notify you of updates. Install them with one click!

## 🆘 Troubleshooting

### App won't open on Windows
- Ensure Windows Defender isn't blocking it
- Run as Administrator
- Reinstall the app

### "App is damaged" on macOS
```bash
# Fix permission issue
xattr -rd com.apple.quarantine /Applications/FocusFlow.app
```

### Won't start on Linux
```bash
# Make executable
chmod +x FocusFlow-*.AppImage

# Or install deb
sudo dpkg -i focusflow_*.deb
```

## 📝 License

FocusFlow is free to use. See LICENSE file for details.

---

**Happy focusing! 🎯**
