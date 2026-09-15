const { contextBridge } = require('electron');

// Expose minimal API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
});
