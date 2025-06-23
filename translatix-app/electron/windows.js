// electron/windows.js

const { BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createMainWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log(`[DEBUG] Đường dẫn đến preload.js: ${preloadPath}`);
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // DÒNG NÀY PHẢI CÓ VÀ ĐÚNG ĐƯỜNG DẪN
      preload: path.join(__dirname, 'preload.js'),

      // DÒNG NÀY PHẢI LÀ `true`
      contextIsolation: true,

      // DÒNG NÀY PHẢI LÀ `false`
      nodeIntegration: false, 
    },
  });

  // ... phần còn lại của file không thay đổi ...
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools();
  }

  return win;
}

module.exports = { createMainWindow };