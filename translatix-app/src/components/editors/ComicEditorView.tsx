import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { ArrowLeft, Download, Save, Sparkles, Sun, Moon, ZoomIn, ZoomOut } from 'lucide-react';
import { useBeforeUnload } from 'react-use';

// --- Bắt đầu: Định nghĩa Type cục bộ ---
// Do không thể truy cập các file ngoài, tôi định nghĩa các kiểu dữ liệu (types) cần thiết ngay tại đây.
// Điều này giúp component tự chứa và giải quyết lỗi import.
interface Bubble {
  id: string;
  text: string;
  translation?: string;
}

interface Page {
  id: string;
  original_url: string;
  inpainted_url?: string;
  bubbles: Bubble[];
}

interface Chapter {
  pages: Page[];
}
// --- Kết thúc: Định nghĩa Type cục bộ ---

interface ComicEditorViewProps {
  chapterName: string;
  chapterData: Chapter;
  onGoBack: () => void;
  sessionId: string;
}

function drawImageOnCanvas(canvas: HTMLCanvasElement, imageUrl: string, zoom: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Hữu ích nếu ảnh từ một domain khác
  img.onload = () => {
    canvas.width = img.width * zoom;
    canvas.height = img.height * zoom;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.onerror = () => {
    console.error('Không thể tải ảnh:', imageUrl);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  img.src = imageUrl;
}

// --- Bắt đầu: Component ThemeToggleButton cục bộ ---
// Thay thế cho component không thể import, tôi tạo một phiên bản đơn giản ở đây.
const ThemeToggleButton = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    // Trong ứng dụng thực tế, bạn sẽ thêm logic để đổi class 'dark' trên thẻ <html>
  };

  return (
    <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-hover">
      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
// --- Kết thúc: Component ThemeToggleButton cục bộ ---

const ComicEditorView = memo(function ComicEditorView({
  chapterName,
  chapterData,
  onGoBack,
  sessionId,
}: ComicEditorViewProps) {
  const [activePageId, setActivePageId] = useState(chapterData.pages[0]?.id ?? '');
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);

  // --- CẢI TIẾN: Quản lý state cho bản dịch và thay đổi ---
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  useBeforeUnload(hasUnsavedChanges, 'Bạn có chắc muốn rời đi? Thay đổi chưa được lưu sẽ bị mất.');

  // Effect để reset state khi toàn bộ chương thay đổi
  useEffect(() => {
    setActivePageId(chapterData.pages[0]?.id ?? '');
    setActiveBubbleId(null);
    setHasUnsavedChanges(false); // Reset lại trạng thái "chưa lưu"

    // Khởi tạo state `translations` từ dữ liệu chương
    const initialTranslations: Record<string, string> = {};
    chapterData.pages.forEach((page) => {
      page.bubbles.forEach((bubble) => {
        initialTranslations[bubble.id] = bubble.translation ?? '';
      });
    });
    setTranslations(initialTranslations);

    // **TỐI ƯU HÓA:** Đã loại bỏ vòng lặp preload tất cả hình ảnh để tránh lag
  }, [chapterData]);

  // Effect để vẽ ảnh lên canvas khi trang hiện tại hoặc mức độ zoom thay đổi
  useEffect(() => {
    const activePage = chapterData.pages.find((p) => p.id === activePageId);
    if (activePage && originalCanvasRef.current) {
      drawImageOnCanvas(originalCanvasRef.current, activePage.original_url, zoom);
    }
  }, [activePageId, zoom, chapterData.pages]);

  const handleGoBack = async () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('Bạn có muốn lưu trước khi thoát không?');
      if (!confirm) {
        try {
          await fetch(`http://localhost:8000/api/cleanup/${sessionId}`, { method: 'DELETE' });
        } catch (err) {
          console.warn('Không thể dọn dẹp session:', err);
        }
      }
    }
    onGoBack();
  };

  const activePageData = useMemo(
    () => chapterData.pages.find((p) => p.id === activePageId),
    [chapterData.pages, activePageId]
  );

  const pageBubbles = useMemo(() => activePageData?.bubbles || [], [activePageData]);

  const activeBubble = useMemo(
    () => (activeBubbleId ? pageBubbles.find((b) => b.id === activeBubbleId) : null),
    [activeBubbleId, pageBubbles]
  );

  return (
    <div className="flex flex-col h-screen bg-main text-primary">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-default bg-surface-1 card z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay Lại</span>
          </button>
        </div>
        <div className="text-secondary text-sm">
          Chương: <span className="font-semibold text-primary">{chapterName}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="bg-gray-700 text-white px-2 py-1 rounded"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            className="bg-gray-700 text-white px-2 py-1 rounded"
            onClick={() => setZoom((z) => z + 0.1)}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-purple-700 transition">
            <Sparkles className="h-4 w-4" />
            <span>Dịch Tự Động</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition">
            <Save className="h-4 w-4" />
            <span>Lưu</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 transition">
            <Download className="h-4 w-4" />
            <span>Xuất Ảnh</span>
          </button>
          <ThemeToggleButton />
        </div>
      </header>

      <div className="flex-grow flex min-h-0">
        {/* Sidebar với ảnh thumbnail các trang */}
        <aside className="w-28 bg-surface-1 border-r border-default flex-shrink-0 overflow-y-auto h-full p-2 space-y-2">
          {chapterData.pages.map((page, index) => (
            <div
              key={page.id}
              onClick={() => {
                setActivePageId(page.id);
                setActiveBubbleId(null);
              }}
              className={`group flex flex-col items-center cursor-pointer p-1 rounded-md border-2 transition ${
                page.id === activePageId
                  ? 'border-blue-500 bg-hover'
                  : 'border-transparent hover:bg-hover'
              }`}
            >
              <img
                src={page.original_url}
                alt={`Trang ${index + 1}`}
                className="w-16 h-20 object-cover rounded-sm shadow-sm"
              />
              <span className="mt-1 text-[11px] text-center text-secondary font-medium">
                Trang {index + 1}
              </span>
            </div>
          ))}
        </aside>

        <main className="flex-grow flex min-h-0 overflow-hidden p-2 gap-2">
          {/* Cột Canvas */}
          <div className="flex-grow bg-surface-1 flex flex-col min-h-0 card rounded-lg p-2 overflow-auto">
            <h3 className="text-xs uppercase font-bold text-secondary text-center mb-2">Bản gốc</h3>
            <div className="flex-grow overflow-auto max-h-full relative flex items-center justify-center">
              <div className="w-fit h-fit pointer-events-none">
                <canvas ref={originalCanvasRef} />
              </div>
            </div>
          </div>

          {/* Cột Bong bóng thoại & Công cụ */}
          <div className="w-[300px] flex-shrink-0 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
            <div className="p-3 border-b border-default flex-shrink-0">
              <h2 className="font-bold text-xs uppercase tracking-wider text-primary">Công cụ</h2>
            </div>
            <div className="flex-grow p-3 space-y-4 overflow-y-auto">
              <div>
                <h4 className="font-semibold text-sm text-primary mb-2">Các Khung thoại</h4>
                <div className="space-y-2">
                  {pageBubbles.length > 0 ? (
                    pageBubbles.map((bubble) => (
                      <div
                        key={`${activePageId}-${bubble.id}`}
                        onClick={() => setActiveBubbleId(bubble.id)}
                        className={`p-2 rounded-md cursor-pointer bg-surface-2 hover:bg-hover border transition-colors ${
                          bubble.id === activeBubbleId ? 'border-blue-600' : 'border-transparent'
                        }`}
                      >
                        <p className="text-xs truncate text-primary">
                          {bubble.text || <i>Khung thoại trống</i>}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-secondary text-center p-4">
                      Không có bong bóng thoại nào cho trang này.
                    </p>
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
                        <textarea
                          readOnly
                          className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs"
                          rows={3}
                          value={activeBubble.text}
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-secondary">Bản dịch</label>
                        <textarea
                          className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs"
                          rows={3}
                          value={translations[activeBubble.id] ?? ''}
                          onChange={(e) => {
                            setTranslations((prev) => ({
                              ...prev,
                              [activeBubble.id]: e.target.value,
                            }));
                            if (!hasUnsavedChanges) {
                              setHasUnsavedChanges(true);
                            }
                          }}
                        ></textarea>
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
});

export default ComicEditorView;
