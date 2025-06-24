'use client';
import { BookOpen, FolderPlus, LoaderCircle, X, FileImage } from 'lucide-react'; // Đã thêm icon FileImage
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

    // Đã cập nhật để chấp nhận `mode` là 'directory' hoặc 'files'
    const handleUploadClick = async (mode: 'directory' | 'files') => {
        setIsLoading(true);
        setError('');

        if (!window.ipc) {
            setError("Lỗi: Cầu nối IPC không khả dụng.");
            setIsLoading(false);
            return;
        }

        try {
            // Truyền `mode` đã chọn vào IPC handler
            const result = await window.ipc.invoke('start-processing', 'comic', mode);
            
            if (result.status === 'success') {
                const backendData = result.data;
                const chapterName = backendData.projectName;
                const filePaths: string[] = backendData.files;

                const pages: Page[] = filePaths.map((filePath, index) => ({
                    id: `p${index + 1}`,
                    url: `safe-file://${filePath.replace(/\\/g, '/')}`
                }));

                const bubbles: Record<string, Bubble[]> = {};
                pages.forEach(page => {
                    bubbles[page.id] = [];
                });

                const chapterData: Chapter = { pages, bubbles };
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="modal-content w-full max-w-lg rounded-xl p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Mở Chương Truyện</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-full"><X size={24} /></button>
                </div>
                <p className="text-secondary mb-6">Chọn cách bạn muốn tải lên chương truyện của mình.</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => handleUploadClick('directory')}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? <LoaderCircle className="animate-spin" /> : <FolderPlus size={24} />}
                        <span>{isLoading ? 'Đang xử lý...' : 'Tải lên thư mục truyện'}</span>
                    </button>

                    <div
          onClick={() => handleUploadClick('files')}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:underline cursor-pointer"
        >
          <FileImage size={16} />
          <span>Tải lên ảnh truyện (1 hoặc nhiều tệp)</span>
        </div>
                </div>

                {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}
            </div>
        </div>
    );
}