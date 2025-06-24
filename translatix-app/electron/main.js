const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { createMainWindow } = require('./windows');
const { registerIpcHandlers } = require('./ipcHandlers');

// ⚠️ Đăng ký scheme safe-file là 'secure' & 'standard'
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'safe-file',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
      corsEnabled: true,
    },
  },
]);

let mainWindow;

function initializeApp() {
  // ✅ Đăng ký handler cho safe-file://
  protocol.registerFileProtocol('safe-file', (request, callback) => {
    try {
      const url = new URL(request.url);
      let decodedPath;

      if (process.platform === 'win32') {
        const driveLetter = url.hostname.toUpperCase(); // ví dụ: 'D'
        const restOfPath = decodeURIComponent(url.pathname); // ví dụ: '/folder/image.jpg'
        decodedPath = `${driveLetter}:${restOfPath}`; // D:/folder/image.jpg
      } else {
        decodedPath = decodeURIComponent(url.pathname); // Unix/mac
      }

      const normalizedPath = path.normalize(decodedPath);

      // 🧪 Log để kiểm tra khi load ảnh
      console.log('[safe-file] Request URL:', request.url);
      console.log('[safe-file] Decoded Path:', normalizedPath);
      console.log('[safe-file] Exists:', fs.existsSync(normalizedPath));

      callback({ path: normalizedPath });
    } catch (error) {
      console.error('❌ Lỗi khi xử lý safe-file:', error);
      callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
    }
  });

  // ✅ Tạo window & khởi chạy app
  mainWindow = createMainWindow();
  registerIpcHandlers();
}

// Khởi động app sau khi sẵn sàng
app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  }
});
