// src/components/editors/ComicEditorView.tsx

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Save, Sparkles, Bold, Italic, AlignCenter, Image as ImageIcon } from 'lucide-react';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
// IMPORT CÁC INTERFACE TỪ COMIC MODAL
import { Chapter, Page, Bubble } from '@/components/modals/ComicModal';

interface ComicEditorViewProps {
  chapterName: string;
  chapterData: Chapter; 
  onGoBack: () => void;
}

export default function ComicEditorView({ chapterName, chapterData, onGoBack }: ComicEditorViewProps) {
  const [activePageId, setActivePageId] = useState(chapterData.pages[0]?.id ?? '');
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  
  const sourcePageContainerRef = useRef<HTMLDivElement>(null);
  const translationPageContainerRef = useRef<HTMLDivElement>(null); // Thêm ref cho cột bản dịch

  // Đồng bộ scroll giữa hai cột
  useEffect(() => {
    const sourceEl = sourcePageContainerRef.current;
    const translationEl = translationPageContainerRef.current;

    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      return () => {
        target.scrollTop = source.scrollTop;
        target.scrollLeft = source.scrollLeft;
      };
    };

    if (sourceEl && translationEl) {
      const handleSourceScroll = syncScroll(sourceEl, translationEl);
      const handleTranslationScroll = syncScroll(translationEl, sourceEl);
      
      sourceEl.addEventListener('scroll', handleSourceScroll);
      translationEl.addEventListener('scroll', handleTranslationScroll);
      
      return () => {
        sourceEl.removeEventListener('scroll', handleSourceScroll);
        translationEl.removeEventListener('scroll', handleTranslationScroll);
      };
    }
  }, [activePageId]);

  useEffect(() => {
    if (sourcePageContainerRef.current) {
        sourcePageContainerRef.current.scrollTop = 0;
        sourcePageContainerRef.current.scrollLeft = 0;
    }
    if (translationPageContainerRef.current) {
        translationPageContainerRef.current.scrollTop = 0;
        translationPageContainerRef.current.scrollLeft = 0;
    }
  }, [activePageId]); 
  
  useEffect(() => {
    setActivePageId(chapterData.pages[0]?.id ?? '');
    setActiveBubbleId(null);
  }, [chapterData]);

  const activePageData = chapterData.pages.find(p => p.id === activePageId);
  const pageBubbles = activePageData?.bubbles || []; // Sửa lại để an toàn hơn
  const activeBubble = activeBubbleId ? pageBubbles.find(b => b.id === activeBubbleId) : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header giữ nguyên */}
      <header /* ... */ >
        {/* ... */}
      </header>

      <div className="flex-grow flex min-h-0">
        {/* Sidebar giữ nguyên */}
        <aside className="w-28 bg-surface-1 border-r border-default flex-shrink-0 overflow-y-auto h-full p-2 space-y-2">
            {chapterData.pages.map((page, index) => (
                <div
                    key={page.id}
                    onClick={() => { setActivePageId(page.id); setActiveBubbleId(null); }}
                    className={`group flex flex-col items-center cursor-pointer p-1 rounded-md border-2 transition ${
                        page.id === activePageId ? 'border-blue-500 bg-hover' : 'border-transparent hover:border-gray-300'
                    }`}
                >
                    <img
                        src={page.original_url} // Sử dụng original_url
                        alt={`Trang ${index + 1}`}
                        className="w-16 h-20 object-cover rounded-sm shadow-sm"
                    />
                    <span className="mt-1 text-[11px] text-center text-secondary font-medium">Trang {index + 1}</span>
                </div>
            ))}
        </aside>

        {/* Nội dung chính */}
        <main className="flex-grow flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
          
          {/* Cột Bản gốc */}
          <div className="col-span-12 md:col-span-4 bg-surface-1 flex flex-col min-h-0 card rounded-lg p-2">
            <h3 className="text-xs uppercase font-bold text-secondary text-center mb-2">Bản gốc</h3>
            <div 
              ref={sourcePageContainerRef}
              className="flex-grow bg-surface-2 rounded overflow-auto p-0 w-full h-full"
            >
              {activePageData ? (
                <img
                  src={activePageData.original_url} // Sử dụng original_url
                  alt="Original Page"
                  className="w-full object-contain"
                />
              ) : (
                <p className="text-secondary p-4 text-center">Không có trang nào được chọn</p>
              )}
            </div>
          </div>

          {/* Cột Bản dịch - ĐÂY LÀ THAY ĐỔI LỚN */}
          <div className="col-span-12 md:col-span-4 bg-surface-1 flex flex-col min-h-0 card rounded-lg p-2">
            <h3 className="text-xs uppercase font-bold text-secondary text-center mb-2">Bản dịch (đã xóa chữ)</h3>
            <div 
              ref={translationPageContainerRef}
              className="flex-grow bg-surface-2 rounded overflow-auto p-0 w-full h-full"
            >
              {activePageData ? (
                <img
                  src={activePageData.inpainted_url} // SỬ DỤNG INPAINTED_URL
                  alt="Inpainted Page"
                  className="w-full object-contain"
                />
              ) : (
                <div className="text-center flex items-center justify-center h-full text-secondary">
                  <ImageIcon className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-2 text-sm">Ảnh đã dịch sẽ hiện ở đây</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột Công cụ - Logic hiển thị bubble đã có sẵn và tương thích */}
          <div className="col-span-12 md:col-span-4 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
            <div className="p-3 border-b border-default flex-shrink-0">
              <h2 className="font-bold text-xs uppercase tracking-wider text-primary">Công cụ</h2>
            </div>
            <div className="flex-grow p-3 space-y-4 overflow-y-auto">
              <div>
                <h4 className="font-semibold text-sm text-primary mb-2">Các Khung thoại</h4>
                <div className="space-y-2">
                  {pageBubbles.length > 0 ? (
                    pageBubbles.map(bubble => (
                      <div key={bubble.id}
                        onClick={() => setActiveBubbleId(bubble.id)}
                        className={`bubble-item p-2 rounded-md cursor-pointer bg-surface-2 hover:bg-hover ${bubble.id === activeBubbleId ? 'border-blue-600 border' : 'border-transparent border'}`}>
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
                      {/* Phần soạn thảo giữ nguyên, nó sẽ hoạt động với activeBubble */}
                      <div>
                        <label className="text-xs font-semibold text-secondary">Văn bản gốc</label>
                        <textarea readOnly className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs code-font" rows={3} defaultValue={activeBubble.text}></textarea>
                      </div>
                      {/* ... các phần còn lại của form */}
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