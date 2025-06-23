'use client';
import { BookOpen, FolderPlus, X } from 'lucide-react';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Cần cài: npm install uuid

type Bubble = {
  id: string;
  text: string;
  translation: string;
};

type Page = {
  id: string;
  url: string;
};

type Chapter = {
  pages: Page[];
  bubbles: Record<string, Bubble[]>;
};

type ComicModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (projectName: string, chapter: Chapter) => void;
};

export default function ComicModal({ isOpen, onClose, onSelect }: ComicModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectFolder = async () => {
    // 👇 Dùng preload của Electron để mở thư mục ảnh
    const filePaths: string[] = await window.electron.dialog.openFolder(); // Bạn phải định nghĩa hàm này trong preload
    if (!filePaths || filePaths.length === 0) return;

    const pages: Page[] = filePaths.map((path, index) => ({
      id: `page-${index + 1}`,
      url: `file://${path}`
    }));

    const bubbles: Record<string, Bubble[]> = {};
    pages.forEach(p => {
      bubbles[p.id] = []; // Khởi tạo trống
    });

    const chapter: Chapter = { pages, bubbles };
    onSelect("Chương Mới", chapter);
  };

  const recentChapters = [
    { name: "One Piece - Chapter 1044", path: "D:/Manga/OnePiece/Ch1044" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="modal-content w-full max-w-lg rounded-xl p-6 z-10 bg-surface-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Mở Chương Truyện</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-full"><X size={24} /></button>
        </div>
        <p className="text-secondary mb-6">Tải lên thư mục chứa các trang truyện của bạn (.jpg, .png).</p>
        <button onClick={handleSelectFolder} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition mb-6">
          <FolderPlus size={24} />
          <span>Tải lên Thư mục...</span>
        </button>
        <div>
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3 border-t border-default pt-4">Hoặc mở chương gần đây</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentChapters.map(chapter => (
              <div key={chapter.name} onClick={() => {
                // TODO: load ảnh và gọi onSelect nếu bạn muốn xử lý chương cũ thực sự
                onClose(); // hoặc xử lý tương tự `handleSelectFolder`
              }} className="p-3 bg-surface-2 rounded-md hover:bg-hover cursor-pointer transition group">
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
