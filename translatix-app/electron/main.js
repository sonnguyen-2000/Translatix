/**
 * main.js
 * * Đây là tiến trình chính (main process) của Electron.
 * Nó chịu trách nhiệm quản lý vòng đời của ứng dụng,
 * tạo và quản lý các cửa sổ trình duyệt (BrowserWindow),
 * và xử lý các tương tác với hệ điều hành.
 */

const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net'); // << THÊM: Module để kiểm tra kết nối mạng (port)
const isDev = require('electron-is-dev'); // << THÊM: Kiểm tra môi trường dev

// Import các module tùy chỉnh từ các file khác
const { createMainWindow } = require('./windows');
const { registerIpcHandlers } = require('./ipcHandlers');

// Khai báo các biến cửa sổ ở phạm vi toàn cục để không bị garbage collected
let mainWindow;
let loadingWindow;

// ---- CÁC HÀM TẠO CỬA SỔ ----

/**
 * Tạo cửa sổ loading.
 * Cửa sổ này nhỏ, không có viền và sẽ hiển thị trong khi chờ backend khởi động.
 */
function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 450,
        height: 250,
        frame: false, // Không có viền cửa sổ (title bar, etc.)
        transparent: true, // Nền trong suốt
        resizable: false,
        webPreferences: {
            nodeIntegration: true, // Cho phép dùng API của Node.js trong file HTML
        },
    });
    // Tải file HTML cho cửa sổ loading
    loadingWindow.loadFile(path.join(__dirname, 'loading.html'));
    loadingWindow.on('closed', () => (loadingWindow = null));
}


// ---- LOGIC KHỞI ĐỘNG ỨNG DỤNG ----

/**
 * Hàm kiểm tra xem server backend đã sẵn sàng nhận kết nối hay chưa.
 * Nó sẽ thử kết nối đến port 8000.
 * @param {function(boolean)} callback - Callback sẽ được gọi với kết quả (true nếu sẵn sàng, false nếu chưa)
 */
const checkBackendStatus = (callback) => {
    // Sử dụng module 'net' của Node để tạo một socket client
    const client = new net.Socket();
    
    // Thử kết nối tới backend
    client.connect({ port: 8000, host: '127.0.0.1' }, () => {
        // Nếu kết nối thành công, backend đã sẵn sàng
        console.log('✅ Backend is ready.');
        client.end(); // Đóng kết nối
        if (callback) callback(true);
    });

    // Bắt lỗi kết nối (ví dụ: port chưa mở)
    client.on('error', (err) => {
        console.log('⏳ Backend not ready yet, retrying in 2 seconds...');
        client.destroy(); // Hủy client để tránh rò rỉ bộ nhớ
        if (callback) callback(false);
    });
};

/**
 * Hàm khởi tạo chính của ứng dụng.
 * Sẽ được gọi sau khi backend đã sẵn sàng.
 */
function initializeApp() {
    // ⚠️ Đăng ký scheme `safe-file` để có thể hiển thị ảnh từ hệ thống file một cách an toàn.
    // Việc này phải được thực hiện trước khi app 'ready'.
    protocol.registerFileProtocol('safe-file', (request, callback) => {
        try {
            // Chuyển URL `safe-file://D/path/to/image.png` thành đường dẫn tuyệt đối
            const url = new URL(request.url);
            let decodedPath;

            if (process.platform === 'win32') {
                const driveLetter = url.hostname.toUpperCase();
                const restOfPath = decodeURIComponent(url.pathname.substring(1)); // Bỏ dấu / ở đầu
                decodedPath = `${driveLetter}:\\${restOfPath}`;
            } else {
                decodedPath = decodeURIComponent(url.pathname);
            }

            const normalizedPath = path.normalize(decodedPath);
            
            // Log để debug
            // console.log('[safe-file] Request URL:', request.url);
            // console.log('[safe-file] Resolved Path:', normalizedPath);
            // console.log('[safe-file] Exists:', fs.existsSync(normalizedPath));

            callback({ path: normalizedPath });
        } catch (error) {
            console.error('❌ Error processing safe-file protocol:', error);
            callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
        }
    });

    // Tạo cửa sổ chính và đăng ký các IPC handler
    mainWindow = createMainWindow();
    registerIpcHandlers(mainWindow); // Truyền mainWindow vào để IPC có thể tương tác nếu cần
}


// ---- VÒNG ĐỜI CỦA APP ELECTRON ----

// Đăng ký scheme `safe-file` với các đặc quyền cần thiết.
// Phải được gọi trước khi app 'ready'.
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'safe-file',
        privileges: {
            secure: true,
            standard: true,
            supportFetchAPI: true,
            bypassCSP: true,
            corsEnabled: true,
            stream: true,
        },
    },
]);

// Sự kiện này sẽ được kích hoạt khi Electron đã hoàn tất
// việc khởi tạo. Đây là điểm bắt đầu của ứng dụng.
app.whenReady().then(() => {
    // 1. Luôn luôn hiển thị cửa sổ loading trước tiên
    createLoadingWindow();

    // 2. Bắt đầu vòng lặp kiểm tra trạng thái của backend
    const tryConnecting = () => {
        checkBackendStatus((isReady) => {
            if (isReady) {
                // 3. Nếu backend sẵn sàng:
                // - Đóng cửa sổ loading
                if (loadingWindow) {
                    loadingWindow.close();
                }
                // - Khởi tạo phần còn lại của ứng dụng
                initializeApp();
            } else {
                // 4. Nếu chưa, thử lại sau 2 giây
                setTimeout(tryConnecting, 2000);
            }
        });
    };

    // Bắt đầu lần kiểm tra đầu tiên
    tryConnecting();
});

// Thoát ứng dụng khi tất cả cửa sổ đã bị đóng (trên Windows & Linux).
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') { // 'darwin' là macOS
        app.quit();
    }
});

// Trên macOS, click vào icon trên dock sẽ mở lại cửa sổ nếu chưa có cửa sổ nào.
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        // Chỉ khởi tạo lại nếu backend đã chạy, nếu không sẽ quay lại vòng lặp loading
        // Điều này tránh trường hợp người dùng đóng app trong lúc loading rồi mở lại
        if (!mainWindow && !loadingWindow) {
            app.relaunch(); // Khởi động lại toàn bộ app
            app.exit();
        } else if (mainWindow) {
            mainWindow.show();
        }
    }
});
