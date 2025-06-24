const { ipcMain, dialog } = require('electron');
const axios = require('axios');

// Địa chỉ của backend Python
const API_BASE_URL = 'http://localhost:5001/api/v1';

function registerIpcHandlers() {
  ipcMain.handle('start-processing', async (event, type) => {
    let dialogOptions = {};

    // --- PHẦN SỬA LỖI NẰM Ở ĐÂY ---
    if (type === 'comic') {
      dialogOptions = {
        title: 'Chọn trang truyện hoặc thư mục',
        properties: ['openFile', 'multiSelections'], // Cho phép chọn nhiều file
        // Cập nhật bộ lọc để hoạt động tốt hơn, đặc biệt trên Windows
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] },
          { name: 'All Files', extensions: ['*'] }
        ],
      };
    } else if (type === 'rpg') {
      dialogOptions = {
        title: 'Chọn file game .exe',
        properties: ['openFile'],
        filters: [
            { name: 'Game Executable', extensions: ['exe'] },
            { name: 'All Files', extensions: ['*'] }
        ],
      };
    } else { // unity, unreal
      dialogOptions = {
        title: 'Chọn thư mục dự án',
        properties: ['openDirectory'],
      };
    }
    // -------------------------------------

    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled || !filePaths || filePaths.length === 0) {
      return { status: 'canceled' };
    }
    
    // Nếu người dùng chọn thư mục, selectedPath sẽ là đường dẫn thư mục.
    // Nếu người dùng chọn file, selectedPath sẽ là đường dẫn file đầu tiên.
    const selectedPath = filePaths[0];

    try {
      const endpoint = type === 'comic' ? '/comic/process' : '/game/process';
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        // Gửi đường dẫn đã chọn tới backend Python
        path: selectedPath,
        type: type, 
      });
      
      return { status: 'success', data: response.data };

    } catch (error) {
      const message = error.response?.data?.detail || error.message || "Không thể kết nối đến backend.";
      return { status: 'error', message: message };
    }
  });
}

module.exports = { registerIpcHandlers };
