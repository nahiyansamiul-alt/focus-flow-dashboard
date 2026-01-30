const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('electron', {
  // Get API URL from main process
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  
  // Get app version
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Platform info
  platform: process.platform,
  isElectron: true,
});
