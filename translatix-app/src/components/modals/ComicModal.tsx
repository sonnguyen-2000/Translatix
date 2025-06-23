// src/components/modals/ComicModal.tsx

'use client';
import { BookOpen, FolderPlus, LoaderCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chapter, Page, Bubble } from '@/components/editors/ComicEditorView';

interface ComicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (chapterName: string, chapterData: Chapter) => void;
}

export default function ComicModal({ isOpen, onClose, onSelect }: ComicModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (isOpen && event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Hàm này được gọi khi nhấn nút "Tải lên..."
    const handleUploadClick = async () => {
        setIsLoading(true);
        setError('');

        if (!window.ipc) {
            setError("Lỗi: Cầu nối IPC không khả dụng.");
            setIsLoading(false);
            return;
        }

        try {
            // Gọi IPC và chờ kết quả từ backend
            const result = await window.ipc.invoke('start-processing', 'comic');
            
            if (result.status === 'success') {
                const backendData = result.data;
                const chapterName = backendData.projectName;
                const filePaths: string[] = backendData.files;

                const pages: Page[] = filePaths.map((filePath, index) => ({
                    id: `p${index + 1}`,
                    url: `file://${filePath.replace(/\\/g, '/')}`
                }));

                const bubbles: Record<string, Bubble[]> = {};
                pages.forEach(page => {
                    bubbles[page.id] = [];
                });

                const chapterData: Chapter = { pages, bubbles };

                // Gọi hàm onSelect từ page.tsx để chuyển sang editor
                onSelect(chapterName, chapterData);

            } else if (result.status !== 'canceled') {
                setError(result.message);
            }
        } catch (err: any) {
            setError(err.message || 'Một lỗi không xác định đã xảy ra.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const recentChapters = [
        { name: "One Piece - Chapter 1044", path: "D:/Manga/OnePiece/Ch1044" }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="modal-content w-full max-w-lg rounded-xl p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Mở Chương Truyện</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-full"><X size={24} /></button>
                </div>
                <p className="text-secondary mb-6">Tải lên thư mục hoặc một file ảnh của chương truyện.</p>
                <button 
                    onClick={handleUploadClick} // Gắn hàm xử lý vào đây
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition mb-6 disabled:opacity-50"
                >
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <FolderPlus size={24} />}
                    <span>{isLoading ? 'Đang xử lý...' : 'Tải lên Thư mục / File...'}</span>
                </button>
                
                {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

                <div>
                    <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3 border-t border-default pt-4">Hoặc mở chương gần đây</h3>
                    {/* ... (phần hiển thị các chương gần đây) ... */}
                </div>
            </div>
        </div>
    );
}
