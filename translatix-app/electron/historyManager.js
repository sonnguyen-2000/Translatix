const Store = require('electron-store');

// Khởi tạo store với giá trị mặc định
const store = new Store({
    defaults: {
        history: {
            comic: [],
            rpg: [],
            unity: [],
            unreal: []
        }
    }
});

const MAX_HISTORY_ITEMS = 2;

/**
 * Lấy lịch sử cho một loại dự án cụ thể.
 * @param {string} type - 'comic', 'rpg', 'unity', or 'unreal'
 * @returns {Array} - Mảng lịch sử cho loại dự án đó.
 */
function getHistory(type) {
    if (!type) return [];
    return store.get(`history.${type}`, []);
}

/**
 * Thêm một dự án mới vào lịch sử.
 * @param {string} type - 'comic', 'rpg', 'unity', or 'unreal'
 * @param {object} projectData - Dữ liệu dự án cần lưu.
 */
function addToHistory(type, projectData) {
    if (!type || !projectData) return;

    const history = getHistory(type);

    // Xác định định danh của entry (dựa trên đường dẫn) để tránh trùng lặp
    const entryIdentifier = Array.isArray(projectData.paths) ? projectData.paths[0] : projectData.path;
    
    // Lọc bỏ entry cũ nếu đã tồn tại để đưa entry mới lên đầu
    const filteredHistory = history.filter(item => {
        const itemIdentifier = Array.isArray(item.paths) ? item.paths[0] : item.path;
        return itemIdentifier !== entryIdentifier;
    });

    // Thêm entry mới vào đầu danh sách
    const newHistory = [projectData, ...filteredHistory];

    // Giới hạn lịch sử chỉ lưu tối đa 2 mục gần nhất
    if (newHistory.length > MAX_HISTORY_ITEMS) {
        newHistory.length = MAX_HISTORY_ITEMS;
    }

    store.set(`history.${type}`, newHistory);
}

module.exports = {
    getHistory,
    addToHistory
};