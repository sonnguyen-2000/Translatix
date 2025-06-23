// electron/main.js
const { app, BrowserWindow } = require('electron');
const { createMainWindow } = require('./windows');
const { registerIpcHandlers } = require('./ipcHandlers');

let mainWindow;

function initializeApp() {
  mainWindow = createMainWindow();
  registerIpcHandlers();
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  }
});
