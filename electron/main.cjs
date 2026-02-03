const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');
const http = require('http');

const PORT = 3000;
const API_PORT = 5000;

// Detect if running in development mode
let isDev = true;
let mainWindow;
let backendProcess;

// Start Express backend server
function startBackend(backendPath) {
  return new Promise((resolve) => {
    console.log('Starting backend from:', backendPath);

    backendProcess = spawn('node', [backendPath], {
      cwd: path.dirname(backendPath),
      env: {
        ...process.env,
        PORT: API_PORT,
        DB_PATH: path.join(app.getPath('userData'), 'focusflow.db'),
      },
      stdio: 'pipe',
      detached: false,
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend error: ${data.toString().trim()}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err);
    });

    const waitForBackend = (attemptsLeft = 20) => {
      const req = http.get(`http://localhost:${API_PORT}/health`, (res) => {
        if (res.statusCode === 200) {
          res.resume();
          resolve();
        } else if (attemptsLeft > 0) {
          res.resume();
          setTimeout(() => waitForBackend(attemptsLeft - 1), 500);
        } else {
          resolve();
        }
      });

      req.on('error', () => {
        if (attemptsLeft > 0) {
          setTimeout(() => waitForBackend(attemptsLeft - 1), 500);
        } else {
          resolve();
        }
      });
    };

    waitForBackend();
  });
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: isDev 
      ? path.join(__dirname, '../public/icon.png')
      : path.join(process.resourcesPath, 'app.asar', 'public', 'icon.png'),
  });

  // Load app
  let startUrl;
  if (isDev) {
    startUrl = `http://localhost:${PORT}`;
  } else {
    // In production, load from dist folder
    // app.getAppPath() automatically handles asar unpacking
    const distPath = path.join(app.getAppPath(), 'dist', 'index.html');
    startUrl = `file://${distPath}`;
    console.log('App path:', app.getAppPath());
    console.log('Loading production app from:', distPath);
  }

  mainWindow.loadURL(startUrl);

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load app:', errorCode, errorDescription, startUrl);
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  // Temporary: Show dev tools in production to debug
  if (!isDev) {
    // Uncomment to debug production app
    // mainWindow.webContents.openDevTools();
  }

  // Only open DevTools if in development AND mainWindow exists
  // Comment this out for production
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload(),
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => mainWindow.webContents.toggleDevTools(),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About FocusFlow',
          click: () => {
            // Open about dialog
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App initialization
app.on('ready', async () => {
  // Check if app is packaged to determine dev mode
  isDev = !app.isPackaged;

  // Determine backend path based on dev or production
  let backendPath;
  if (isDev) {
    backendPath = path.join(__dirname, '../backend/index.js');
  } else {
    // In production, use app.getAppPath() which handles asar
    backendPath = path.join(app.getAppPath(), 'backend', 'index.js');
  }

  console.log('Backend path:', backendPath);
  console.log('Is packaged:', app.isPackaged);

  // Configure auto-updater (only in production/packaged)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();

    // Listen for update events
    autoUpdater.on('update-available', () => {
      if (mainWindow) {
        mainWindow.webContents.send('update-available');
      }
    });

    autoUpdater.on('update-downloaded', () => {
      if (mainWindow) {
        mainWindow.webContents.send('update-downloaded');
      }
    });

    autoUpdater.on('error', (error) => {
      console.error('Update error:', error);
    });
  }

  // Start backend
  await startBackend(backendPath);

  // Create window
  createWindow();

  // Create menu
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Clean up backend on app close
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// IPC Handlers
ipcMain.handle('get-api-url', () => {
  return `http://localhost:${API_PORT}`;
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// Update IPC handlers
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('check-for-updates', async () => {
  return await autoUpdater.checkForUpdates();
});

module.exports = { mainWindow };
