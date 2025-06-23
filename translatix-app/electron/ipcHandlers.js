// electron/ipcHandlers.js

const { ipcMain, dialog, app } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function registerIpcHandlers() {
  // Lắng nghe yêu cầu từ kênh 'start-processing' mà giao diện gửi lên
  ipcMain.handle('start-processing', async (event, type) => {
    let dialogOptions = {};
    
    // Tùy chỉnh hộp thoại dựa trên loại dịch vụ
    if (type === 'rpg') {
      dialogOptions = {
        title: 'Chọn file game .exe',
        properties: ['openFile'],
        filters: [{ name: 'Game Executable', extensions: ['exe'] }],
      };
    } else { // 'comic', 'unity', 'unreal' đều cần chọn thư mục
      dialogOptions = {
        title: 'Chọn thư mục dự án',
        properties: ['openDirectory'],
      };
    }

    // `dialog` được gọi an toàn ở đây, trong tiến trình chính
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);

    if (canceled || filePaths.length === 0) {
      return { status: 'canceled', message: 'Người dùng đã hủy.' };
    }

    const selectedPath = filePaths[0];
    const projectName = path.basename(selectedPath);

    // Tạm thời trả về tên project để hiển thị trên editor.
    // Logic gọi Python và xử lý file sẽ được thêm vào sau.
    return { status: 'success', data: { projectName } };
  });
}

module.exports = { registerIpcHandlers };
