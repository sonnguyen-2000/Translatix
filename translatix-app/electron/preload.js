// GIỮ LẠI DUY NHẤT ĐOẠN NÀY
console.log('[DEBUG] Preload script BẮT ĐẦU được thực thi.');

const { contextBridge, ipcRenderer } = require('electron');

try {
  contextBridge.exposeInMainWorld('ipc', {
    invoke: (channel, ...args) => {
      // Đã thêm 2 kênh mới 'get-history' và 'open-from-history'
      const validChannels = ['start-processing', 'get-history', 'open-from-history']; 
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      console.error(`Kênh IPC không hợp lệ: ${channel}`);
    },
  });

  console.log('[DEBUG] Preload script đã TẠO CẦU NỐI IPC thành công.');

} catch (error) {
  console.error('[LỖI] Không thể tạo cầu nối IPC:', error);
}