// electron/ipcHandlers.js
const { ipcMain, dialog } = require('electron');

function registerIpcHandlers() {
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return result;
  });

  // Thêm các ipcMain.handle/once/on khác ở đây sau này nếu cần
}

module.exports = { registerIpcHandlers };
