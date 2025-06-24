const { ipcMain, dialog } = require('electron');
const axios = require('axios');
const path = require('path');
const historyManager = require('./historyManager'); // Import module mới

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Hàm xử lý chung cho việc mở dự án và thêm vào lịch sử
async function processProject(type, filePaths) {
    try {
        const endpoint = type === 'comic' ? '/comic/process' : '/game/process';
        const payload = (type === 'comic')
            ? { paths: filePaths }
            : { path: filePaths[0], type: type };

        const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
        
        // Sau khi xử lý thành công, thêm vào lịch sử
        const historyEntry = {
            name: response.data.projectName,
            timestamp: new Date().toISOString(),
        };
        if (type === 'comic') {
            historyEntry.paths = filePaths;
        } else {
            historyEntry.path = filePaths[0];
        }
        historyManager.addToHistory(type, historyEntry);
        
        return { status: 'success', data: response.data };
    } catch (error) {
        const message = error.response?.data?.detail || error.message || "Không thể kết nối đến backend.";
        return { status: 'error', message: message };
    }
}

function registerIpcHandlers() {
  // IPC handler mới để lấy lịch sử
  ipcMain.handle('get-history', async (event, type) => {
    try {
      return { status: 'success', data: historyManager.getHistory(type) };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  });
  
  // Handler cũ được giữ lại để mở dự án mới
  ipcMain.handle('start-processing', async (event, type, mode) => {
    let dialogOptions = {};
    if (type === 'comic') {
        if (mode === 'directory') {
          dialogOptions = { title: 'Chọn thư mục chứa các trang truyện', properties: ['openDirectory'] };
        } else {
          dialogOptions = { title: 'Chọn các trang truyện', properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] }]};
        }
    } else if (type === 'rpg') {
      dialogOptions = { title: 'Chọn file game .exe', properties: ['openFile'], filters: [{ name: 'Game Executable', extensions: ['exe'] }]};
    } else {
      dialogOptions = { title: 'Chọn thư mục dự án', properties: ['openDirectory'] };
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled || !filePaths || filePaths.length === 0) {
      return { status: 'canceled' };
    }
    // Gọi hàm xử lý chung
    return await processProject(type, filePaths);
  });
  
  // IPC handler mới để mở từ lịch sử
  ipcMain.handle('open-from-history', async (event, type, historyEntry) => {
      const paths = type === 'comic' ? historyEntry.paths : [historyEntry.path];
      // Gọi hàm xử lý chung
      return await processProject(type, paths);
  });
}

module.exports = { registerIpcHandlers };