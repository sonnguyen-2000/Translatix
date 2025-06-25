// src/components/editors/ComicEditorView.tsx

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Save, Sparkles, Bold, Italic, AlignCenter, Image as ImageIcon } from 'lucide-react';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
// THAY ĐỔI 1: Đảm bảo bạn import các interface từ ComicModal, nơi chúng được định nghĩa khớp với API backend.
import { Chapter, Page, Bubble } from '@/components/modals/ComicModal';

interface ComicEditorViewProps {
  chapterName: string;
  chapterData: Chapter; 
  onGoBack: () => void;
  sessionId: string;
}

export default function ComicEditorView({ chapterName, chapterData, onGoBack }: ComicEditorViewProps) {
  // State để theo dõi trang và bubble đang hoạt động
  const [activePageId, setActivePageId] = useState(chapterData.pages[0]?.id ?? '');
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  
  const sourcePageContainerRef = useRef<HTMLDivElement>(null);
  const translationPageContainerRef = useRef<HTMLDivElement>(null);

  // Reset state khi chapterData thay đổi
  useEffect(() => {
    setActivePageId(chapterData.pages[0]?.id ?? '');
    setActiveBubbleId(null);
  }, [chapterData]);

  // Tìm dữ liệu cho trang đang được chọn
  const activePageData = chapterData.pages.find(p => p.id === activePageId);

  // THAY ĐỔI 2: Lấy danh sách bubble trực tiếp từ dữ liệu của trang đang hoạt động (activePageData).
  // Nếu activePageData không tồn tại hoặc không có bubbles, nó sẽ là một mảng rỗng.
  const pageBubbles = activePageData?.bubbles || [];
  
  // Tìm dữ liệu cho bubble đang được chọn
  const activeBubble = activeBubbleId ? pageBubbles.find(b => b.id === activeBubbleId) : null;

  return (
    <div className="flex flex-col h-screen bg-main">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-default bg-surface-1 card z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onGoBack} className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition"><ArrowLeft className="h-4 w-4" /><span>Quay Lại</span></button>
        </div>
        <div className="text-secondary text-sm">Chương: <span className="font-semibold text-primary">{chapterName}</span></div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-purple-700 transition"><Sparkles className="h-4 w-4" /><span>Dịch Tự Động</span></button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition"><Save className="h-4 w-4" /><span>Lưu</span></button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 transition"><Download className="h-4 w-4" /><span>Xuất Ảnh</span></button>
          <ThemeToggleButton/>
        </div>
      </header>

      <div className="flex-grow flex min-h-0">
        {/* Sidebar hiển thị thumbnail các trang */}
        <aside className="w-28 bg-surface-1 border-r border-default flex-shrink-0 overflow-y-auto h-full p-2 space-y-2">
            {chapterData.pages.map((page, index) => (
                <div
                    key={page.id}
                    onClick={() => { setActivePageId(page.id); setActiveBubbleId(null); }}
                    className={`group flex flex-col items-center cursor-pointer p-1 rounded-md border-2 transition ${
                        page.id === activePageId ? 'border-blue-500 bg-hover' : 'border-transparent hover:bg-hover'
                    }`}
                >
                    <img
                        // THAY ĐỔI 3: Sử dụng `original_url` đã được xử lý (safe-file://)
                        src={page.original_url} 
                        alt={`Trang ${index + 1}`}
                        className="w-16 h-20 object-cover rounded-sm shadow-sm"
                    />
                    <span className="mt-1 text-[11px] text-center text-secondary font-medium">Trang {index + 1}</span>
                </div>
            ))}
        </aside>

        {/* Nội dung chính */}
        <main className="flex-grow flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
          
          <div className="col-span-12 md:col-span-4 bg-surface-1 flex flex-col min-h-0 card rounded-lg p-2">
            <h3 className="text-xs uppercase font-bold text-secondary text-center mb-2">Bản gốc</h3>
            <div ref={sourcePageContainerRef} className="flex-grow bg-surface-2 rounded overflow-auto p-0 w-full h-full">
              {activePageData ? (
                <img
                  src={activePageData.original_url}
                  alt="Original Page"
                  className="w-full object-contain"
                />
              ) : <p className="text-secondary p-4 text-center">Không có trang nào được chọn</p>}
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-surface-1 flex flex-col min-h-0 card rounded-lg p-2">
            <h3 className="text-xs uppercase font-bold text-secondary text-center mb-2">Bản dịch (đã xóa chữ)</h3>
            <div ref={translationPageContainerRef} className="flex-grow bg-surface-2 rounded overflow-auto p-0 w-full h-full">
              {activePageData?.inpainted_url ? (
                <img
                  // THAY ĐỔI 4: Sử dụng `inpainted_url` đã được xử lý
                  src={activePageData.inpainted_url}
                  alt="Inpainted Page"
                  className="w-full object-contain"
                />
              ) : <div className="text-center flex items-center justify-center h-full text-secondary">Ảnh đã dịch sẽ hiện ở đây</div>}
            </div>
          </div>

          {/* Cột Công cụ */}
          <div className="col-span-12 md:col-span-4 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
            <div className="p-3 border-b border-default flex-shrink-0">
              <h2 className="font-bold text-xs uppercase tracking-wider text-primary">Công cụ</h2>
            </div>
            <div className="flex-grow p-3 space-y-4 overflow-y-auto">
              <div>
                <h4 className="font-semibold text-sm text-primary mb-2">Các Khung thoại</h4>
                {/* THAY ĐỔI 5: Logic hiển thị các bubble. Vòng lặp này bây giờ sẽ hoạt động đúng. */}
                <div className="space-y-2">
                  {pageBubbles.length > 0 ? (
                    pageBubbles.map(bubble => (
                      <div key={bubble.id}
                        onClick={() => setActiveBubbleId(bubble.id)}
                        className={`p-2 rounded-md cursor-pointer bg-surface-2 hover:bg-hover border transition-colors ${bubble.id === activeBubbleId ? 'border-blue-600' : 'border-transparent'}`}>
                        <p className="text-xs truncate text-primary">{bubble.text || '<i>Khung thoại trống</i>'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-secondary text-center p-4">Không có bong bóng thoại nào cho trang này.</p>
                  )}
                </div>
              </div>
              <div className="border-t border-default pt-4">
                <h4 className="font-semibold text-sm text-primary mb-2">Soạn thảo</h4>
                <div className="space-y-3 text-secondary">
                  {!activeBubble ? (
                    <p className="text-xs text-center p-4">Chọn một khung thoại để bắt đầu dịch.</p>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-secondary">Văn bản gốc</label>
                        <textarea readOnly className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs" rows={3} value={activeBubble.text}></textarea>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-secondary">Bản dịch</label>
                        <textarea className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs" rows={3} defaultValue={activeBubble.translation}></textarea>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}