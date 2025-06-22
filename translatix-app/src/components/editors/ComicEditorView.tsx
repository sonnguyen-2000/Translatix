'use client';
import { useState } from 'react';
import { ArrowLeft, Download, Save, Sparkles, Bold, Italic, AlignCenter } from 'lucide-react';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

export interface Bubble {
  id: string;
  text: string;
  translation: string;
}

export interface Page {
  id: string;
  url: string;
}

export interface Chapter {
  pages: Page[];
  bubbles: Record<string, Bubble[]>;
}

interface ComicEditorViewProps {
  chapterName: string;
  chapterData: Chapter;
  onGoBack: () => void;
}

export default function ComicEditorView({ chapterName, chapterData, onGoBack }: ComicEditorViewProps) {
  const [activePageId, setActivePageId] = useState(chapterData.pages[0]?.id ?? '');
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);

  const activePageData = chapterData.pages.find(p => p.id === activePageId);
  const pageBubbles = chapterData.bubbles[activePageId] || [];
  const activeBubble = activeBubbleId ? pageBubbles.find(b => b.id === activeBubbleId) : null;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-default bg-surface-1 card z-30">
        <div className="flex items-center space-x-3">
          <button onClick={onGoBack} className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition">
            <ArrowLeft className="h-4 w-4" /><span>Quay Lại</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition">
            <Save className="h-4 w-4" /><span>Lưu</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 transition">
            <Download className="h-4 w-4" /><span>Xuất Bản</span>
          </button>
        </div>
        <div className="text-secondary text-sm">Chương: <span className="font-semibold text-primary">{chapterName}</span></div>
        <ThemeToggleButton />
      </header>

      <div className="flex-grow flex min-h-0">
        {/* Sidebar */}
        <aside className="w-24 bg-surface-1 border-r border-default flex-shrink-0 p-2 space-y-2 overflow-y-auto">
          {chapterData.pages.map(page => (
            <div key={page.id}
              onClick={() => { setActivePageId(page.id); setActiveBubbleId(null); }}
              className={`page-thumb p-1 border-2 ${page.id === activePageId ? 'active' : 'border-transparent'} rounded-md cursor-pointer`}>
              <img src={page.url} alt={`Page ${page.id}`} className="w-full h-auto object-contain rounded-sm" />
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-grow flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
          {/* Original Page */}
          <div className="col-span-12 md:col-span-5 bg-surface-1 flex flex-col min-h-0 card rounded-lg p-2">
            <h3 className="text-xs uppercase font-bold text-secondary text-center mb-2">Bản gốc</h3>
            <div className="flex-grow bg-surface-2 rounded flex items-center justify-center overflow-hidden">
              <img src={activePageData?.url} alt="Original Page" className="max-w-full max-h-full object-contain" />
            </div>
          </div>

          {/* Translated Page */}
          <div className="col-span-12 md:col-span-4 bg-surface-1 flex flex-col min-h-0 card rounded-lg p-2">
            <h3 className="text-xs uppercase font-bold text-secondary text-center mb-2">Bản dịch</h3>
            <div className="flex-grow bg-surface-2 rounded flex items-center justify-center overflow-hidden">
              <img src={activePageData?.url} alt="Translated Page" className="max-w-full max-h-full object-contain" />
            </div>
          </div>

          {/* Tool Sidebar */}
          <div className="col-span-12 md:col-span-3 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
            <div className="p-3 border-b border-default flex-shrink-0">
              <h2 className="font-bold text-xs uppercase tracking-wider text-primary">Công cụ</h2>
            </div>
            <div className="flex-grow p-3 space-y-4 overflow-y-auto">
              {/* Dialog bubbles */}
              <div>
                <h4 className="font-semibold text-sm text-primary mb-2">Các Khung thoại</h4>
                <div className="space-y-2">
                  {pageBubbles.length > 0 ? (
                    pageBubbles.map(bubble => (
                      <div key={bubble.id}
                        onClick={() => setActiveBubbleId(bubble.id)}
                        className={`bubble-item p-2 rounded-md cursor-pointer bg-surface-2 hover:bg-hover ${bubble.id === activeBubbleId ? 'active' : ''}`}>
                        <p className="text-xs truncate">{bubble.text || '<i>Khung thoại trống</i>'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-secondary text-center">Không có khung thoại.</p>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="border-t border-default pt-4">
                <h4 className="font-semibold text-sm text-primary mb-2">Soạn thảo</h4>
                <div className="space-y-3 text-secondary">
                  {!activeBubble ? (
                    <p className="text-xs">Chọn một khung thoại để bắt đầu dịch.</p>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-secondary">Văn bản gốc</label>
                        <textarea readOnly className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs code-font" rows={3} defaultValue={activeBubble.text}></textarea>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-secondary">Bản dịch</label>
                        <textarea className="w-full bg-surface-2 p-2 mt-1 rounded-md border border-default text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-y" rows={4} defaultValue={activeBubble.translation}></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-default">
                        <label className="col-span-2 text-xs font-semibold text-secondary">Tùy chỉnh Font</label>
                        <div>
                          <select className="w-full bg-surface-2 p-2 rounded-md border border-default text-xs">
                            <option>Arial</option>
                            <option>Comic Sans</option>
                          </select>
                        </div>
                        <div>
                          <input type="number" defaultValue="14" className="w-full bg-surface-2 p-2 rounded-md border border-default text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button className="bg-surface-2 p-2 rounded-md border border-default hover:bg-hover"><Bold size={16} /></button>
                        <button className="bg-surface-2 p-2 rounded-md border border-default hover:bg-hover"><Italic size={16} /></button>
                        <button className="bg-surface-2 p-2 rounded-md border border-default hover:bg-hover"><AlignCenter size={16} /></button>
                      </div>
                      <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition">
                        <Sparkles className="h-4 w-4" /><span>Dịch bằng AI</span>
                      </button>
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
