// Electron entry point for the Gradient desktop app.
// Run with `npm start`; build installers with `npm run dist` (see README).
const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
let win;

function send(cmd) { if (win) win.webContents.send('menu', cmd); }

function createWindow() {
  win = new BrowserWindow({
    width: 1320, height: 900, minWidth: 380, minHeight: 500,
    title: 'Gradient', backgroundColor: '#0a1828', show: false,
    icon: path.join(ROOT, 'icons', 'icon-512.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(ROOT, 'index.html'));
  // Links to the web open in the user's browser, never inside the app window.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });
  win.on('closed', () => { win = null; });
}

function buildMenu() {
  const mac = process.platform === 'darwin';
  const template = [
    ...(mac ? [{ role: 'appMenu' }] : []),
    { label: 'File', submenu: [
      { label: 'Export progress…', accelerator: 'CmdOrCtrl+S', click: () => send('progress') },
      { label: 'Import progress…', accelerator: 'CmdOrCtrl+O', click: () => send('progress') },
      { type: 'separator' }, mac ? { role: 'close' } : { role: 'quit' },
    ] },
    { label: 'Study', submenu: [
      { label: 'Course map', accelerator: 'CmdOrCtrl+0', click: () => win && win.webContents.executeJavaScript("location.hash = 'home'") },
      { label: 'Daily review', accelerator: 'CmdOrCtrl+1', click: () => send('review') },
      { label: 'Exam builder', accelerator: 'CmdOrCtrl+2', click: () => send('exam') },
      { label: 'Progress & weak spots', accelerator: 'CmdOrCtrl+3', click: () => send('progress') },
    ] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

const stamp = () => new Date().toISOString().slice(0, 10);
ipcMain.handle('save-progress', async (_e, json) => {
  const r = await dialog.showSaveDialog(win, { title: 'Export progress', defaultPath: path.join(app.getPath('documents'), `gradient-progress-${stamp()}.json`), filters: [{ name: 'Gradient progress', extensions: ['json'] }] });
  if (r.canceled || !r.filePath) return false;
  await fs.promises.writeFile(r.filePath, String(json), 'utf8');
  return true;
});
ipcMain.handle('open-progress', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Import progress', properties: ['openFile'], filters: [{ name: 'Gradient progress', extensions: ['json'] }] });
  if (r.canceled || !r.filePaths.length) return null;
  return fs.promises.readFile(r.filePaths[0], 'utf8');
});
// Automatic daily backup of progress into the app's data folder (keeps the last 14).
ipcMain.handle('auto-backup', async (_e, json) => {
  const dir = path.join(app.getPath('userData'), 'backups');
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, `progress-${stamp()}.json`), String(json), 'utf8');
  const files = (await fs.promises.readdir(dir)).filter((f) => f.startsWith('progress-')).sort();
  await Promise.all(files.slice(0, Math.max(0, files.length - 14)).map((f) => fs.promises.unlink(path.join(dir, f))));
  return dir;
});

app.whenReady().then(() => { buildMenu(); createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
