// Exposes a small, safe API to the page as window.desktop (no Node access in the page itself).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  saveProgress: (json) => ipcRenderer.invoke('save-progress', json),
  openProgress: () => ipcRenderer.invoke('open-progress'),
  autoBackup: (json) => ipcRenderer.invoke('auto-backup', json),
  onMenu: (cb) => ipcRenderer.on('menu', (_e, cmd) => cb(cmd)),
});
