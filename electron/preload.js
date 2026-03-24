const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('electron', {
  // Get API URL from main process
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  
  // Get app version
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // IPC methods for updates
  ipcRenderer: {
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  },
  
  // Desktop audio capture (system audio)
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),

  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),

  // Platform info
  platform: process.platform,
  isElectron: true,
});
