const { ipcMain, dialog } = require('electron');
const axios = require('axios');
const path = require('path');

// Địa chỉ của backend Python đang chạy
const API_BASE_URL = 'http://localhost:8000/api/v1';

function registerIpcHandlers() {
  // Đã cập nhật để nhận thêm tham số 'mode' cho 'comic'
  ipcMain.handle('start-processing', async (event, type, mode) => {
    let dialogOptions = {};

    if (type === 'comic') {
      if (mode === 'directory') {
        dialogOptions = {
          title: 'Chọn thư mục chứa các trang truyện',
          properties: ['openDirectory'],
        };
      } else { // mode === 'files' hoặc mặc định
        dialogOptions = {
          title: 'Chọn các trang truyện',
          properties: ['openFile', 'multiSelections'],
          filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] },
            { name: 'All Files', extensions: ['*'] }
          ],
        };
      }
    } else if (type === 'rpg') {
      dialogOptions = {
        title: 'Chọn file game .exe',
        properties: ['openFile'],
        filters: [
            { name: 'Game Executable', extensions: ['exe'] },
            { name: 'All Files', extensions: ['*'] }
        ],
      };
    } else { // Dành cho unity, unreal
      dialogOptions = {
        title: 'Chọn thư mục dự án',
        properties: ['openDirectory'],
      };
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled || !filePaths || filePaths.length === 0) {
      return { status: 'canceled' };
    }

    try {
      const endpoint = type === 'comic' ? '/comic/process' : '/game/process';

      // Cấu trúc payload cho comic giờ đây nhất quán.
      // Backend sẽ tự xử lý dù nhận được đường dẫn thư mục hay danh sách file.
      const payload = (type === 'comic')
          ? { paths: filePaths }
          : { path: filePaths[0], type: type };

      // Gửi payload đã được tạo tới backend
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      return { status: 'success', data: response.data };

    } catch (error) {
      const message = error.response?.data?.detail || error.message || "Không thể kết nối đến backend.";
      return { status: 'error', message: message };
    }
  });
}

module.exports = { registerIpcHandlers };