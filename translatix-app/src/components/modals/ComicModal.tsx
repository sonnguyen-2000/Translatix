'use client';
import { FolderPlus, LoaderCircle, X, FileImage, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chapter, Page, Bubble } from '@/components/editors/ComicEditorView';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Định nghĩa cấu trúc của một mục trong lịch sử
interface HistoryEntry {
    name: string;
    paths: string[]; // Dành cho comic
    timestamp: string;
}

interface ComicModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Sửa kiểu dữ liệu ở đây
    onSelect: (chapterName: string, chapterData: Chapter) => void;
}

export interface Bubble {
  id: string;
  text: string;
  translation: string;
  coords: [number, number, number, number];
}

export interface Page {
  id: string;
  original_url: string;
  inpainted_url: string;
  bubbles: Bubble[];
}

export interface Chapter {
  pages: Page[];
}

export default function ComicModal({ isOpen, onClose, onSelect }: ComicModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // Lấy lịch sử khi modal được mở
    useEffect(() => {
        if (isOpen) {
            const fetchHistory = async () => {
                setLoadingHistory(true);
                if (window.ipc) {
                    try {
                        const result = await window.ipc.invoke('get-history', 'comic');
                        if (result && result.status === 'success') {
                            setHistory(result.data);
                        }
                    } catch (e) {
                        console.error("Failed to fetch history:", e);
                        setHistory([]);
                    }
                }
                setLoadingHistory(false);
            };
            fetchHistory();
        }
    }, [isOpen]);

    // Hàm xử lý chung cho kết quả tải dự án
    const handleProjectLoad = (result: any) => {
    if (result && result.status === 'success') {
        const backendData = result.data;
        const chapterName = backendData.projectName;

        // Backend đã trả về cấu trúc pages chuẩn, chỉ cần lấy ra
        const pages: Page[] = backendData.pages.map((page: any) => ({
            ...page,
            // Chuyển đổi đường dẫn file thành URL mà Electron có thể hiểu
            original_url: `safe-file://${page.original_url.replace(/\\/g, '/')}`,
            inpainted_url: `safe-file://${page.inpainted_url.replace(/\\/g, '/')}`
        }));

        const chapterData: Chapter = { pages };
        onSelect(chapterName, chapterData);
    } else if (result && result.status !== 'canceled') {
        setError(result.message || 'Đã xảy ra lỗi khi xử lý dự án.');
    }
};
    
    // Xử lý khi click vào các nút tải lên mới
    const handleUploadClick = async (mode: 'directory' | 'files') => {
        setIsLoading(true);
        setError('');
        if (!window.ipc) {
            setError("Lỗi: Cầu nối IPC không khả dụng.");
            setIsLoading(false);
            return;
        }
        try {
            const result = await window.ipc.invoke('start-processing', 'comic', mode);
            handleProjectLoad(result);
        } catch (err: any) {
            setError(err.message || 'Một lỗi không xác định đã xảy ra.');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi click vào một mục trong lịch sử
    const handleHistoryClick = async (entry: HistoryEntry) => {
        setIsLoading(true);
        setError('');
        if (!window.ipc) {
            setError("Lỗi: Cầu nối IPC không khả dụng.");
            setIsLoading(false);
            return;
        }
        try {
            const result = await window.ipc.invoke('open-from-history', 'comic', entry);
            handleProjectLoad(result);
        } catch (err: any) {
            setError(err.message || 'Một lỗi không xác định đã xảy ra.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Hàm tiện ích để hiển thị đường dẫn
    const getDisplayPath = (paths: string[]) => {
        if (!paths || paths.length === 0) return '';
        return paths[0]; // Hiển thị đường dẫn đầu tiên (thư mục hoặc file đầu tiên)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="modal-content w-full max-w-lg rounded-xl p-6 z-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary">Mở Chương Truyện</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-full"><X size={24} /></button>
                </div>
                
                {/* === KHỐI MỞ DỰ ÁN MỚI (ĐÃ ĐƯA LÊN TRÊN) === */}
                <div className="space-y-4">
                    <button onClick={() => handleUploadClick('directory')} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition disabled:opacity-50">
                        {isLoading ? <LoaderCircle className="animate-spin" /> : <FolderPlus size={24} />}
                        <span>Tải lên thư mục truyện</span>
                    </button>
                                        <div
          onClick={() => handleUploadClick('files')}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:underline cursor-pointer"
        >
          <FileImage size={16} />
          <span>Tải lên ảnh truyện (1 hoặc nhiều tệp)</span>
        </div>
                </div>

                {/* === PHẦN LỊCH SỬ (ĐÃ ĐƯA XUỐNG DƯỚI) === */}
                {(loadingHistory || history.length > 0) && (
                  <div className="relative text-center my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-default"></div>
                    </div>
                    {/* Đã đổi text của divider */}
                    <span className="relative px-2 bg-surface text-secondary text-sm">Hoặc mở dự án gần đây</span>
                  </div>
                )}
                
                {loadingHistory ? (
                    <div className="text-center p-4"><LoaderCircle className="animate-spin inline-block text-primary" /></div>
                ) : history.length > 0 && (
                    <div className="space-y-2">
                        {history.map((item, index) => (
                            <button key={index} onClick={() => handleHistoryClick(item)} disabled={isLoading} className="w-full text-left p-3 rounded-lg bg-surface-2 hover:bg-hover transition flex items-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed">
                                <FolderPlus size={32} className="text-secondary flex-shrink-0"/>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold text-primary truncate" title={item.name}>{item.name}</p>
                                    <p className="text-xs text-secondary truncate" title={getDisplayPath(item.paths)}>{getDisplayPath(item.paths)}</p>
                                </div>
                                <p className="text-xs text-secondary flex-shrink-0 whitespace-nowrap">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: vi })}</p>
                            </button>
                        ))}
                    </div>
                )}

                {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}
            </div>
        </div>
    );
}