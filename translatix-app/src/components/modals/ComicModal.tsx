'use client';
import { BookOpen, FolderPlus, X } from 'lucide-react';
import { useEffect } from 'react';

interface ComicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (chapterName: string) => void;
}

export default function ComicModal({ isOpen, onClose, onSelect }: ComicModalProps) {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (isOpen && event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

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
                <p className="text-secondary mb-6">Tải lên thư mục chứa các trang truyện của bạn (.jpg, .png).</p>
                <button onClick={() => onSelect("Chương Mới")} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition mb-6">
                    <FolderPlus size={24} />
                    <span>Tải lên Thư mục...</span>
                </button>
                <div>
                    <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3 border-t border-default pt-4">Hoặc mở chương gần đây</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentChapters.map(chapter => (
                            <div key={chapter.name} onClick={() => onSelect(chapter.name)} className="p-3 bg-surface-2 rounded-md hover:bg-hover cursor-pointer transition group">
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="h-5 w-5 text-secondary flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-primary">{chapter.name}</p>
                                        <p className="text-xs text-secondary code-font truncate">{chapter.path}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
