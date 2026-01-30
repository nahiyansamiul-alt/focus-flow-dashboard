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
  
  // Platform info
  platform: process.platform,
  isElectron: true,
});
