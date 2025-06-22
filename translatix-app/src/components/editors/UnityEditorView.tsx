'use client';
import { useState } from 'react';
import { ArrowLeft, Download, FileText, Folder, Map, Save, Search, Sparkles } from 'lucide-react';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import { mockUnityProject, UnityFile } from '@/data/mockUnity';

interface UnityEditorViewProps {
  projectName: string;
  onGoBack: () => void;
}

export default function UnityEditorView({ projectName, onGoBack }: UnityEditorViewProps) {
  const [activeFile, setActiveFile] = useState<UnityFile>(
    mockUnityProject.files.find(f => f.strings?.length > 0)!
  );
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (type: string) => {
    if (type === 'scene') return <Map className="h-4 w-4 icon text-secondary flex-shrink-0" />;
    if (type === 'table') return <FileText className="h-4 w-4 icon text-secondary flex-shrink-0" />;
    return <Folder className="h-4 w-4 icon text-secondary flex-shrink-0" />;
  };

  const filteredStrings = activeFile.strings?.filter(s =>
    s.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.vi.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-default bg-surface-1 card z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onGoBack} className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition">
            <ArrowLeft className="h-4 w-4" /><span>Quay Lại</span>
          </button>
          <div>
            <span className="text-secondary text-xs">Dự án:</span>
            <span className="font-semibold text-primary"> {projectName}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-purple-700 transition">
            <Sparkles className="h-4 w-4" /><span>Dịch Tự Động</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition">
            <Save className="h-4 w-4" /><span>Lưu</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 transition">
            <Download className="h-4 w-4" /><span>Xuất File</span>
          </button>
          <ThemeToggleButton />
        </div>
      </header>

      <main className="flex-grow grid grid-cols-12 gap-4 p-4 min-h-0">
        <div className="col-span-12 md:col-span-2 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
          <div className="p-3 border-b border-default flex-shrink-0">
            <h2 className="font-bold text-xs uppercase tracking-wider">Project Explorer</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-2">
            <ul className="space-y-1">
              {mockUnityProject.files.map(file => (
                <li key={file.id}
                    onClick={() => file.strings && setActiveFile(file)}
                    className={`tree-item flex items-center space-x-2 px-2 py-1.5 rounded-md ${file.strings ? 'cursor-pointer' : 'opacity-60'} ${activeFile.id === file.id ? 'active' : ''}`}>
                  {getIcon(file.type)}
                  <span className="truncate">{file.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
          <div className="p-3 border-b border-default flex-shrink-0">
            <h2 className="font-bold text-xs uppercase tracking-wider">Inspector: <span className="text-primary">{activeFile.name}</span></h2>
          </div>
          <div className="flex-grow overflow-y-auto p-3 space-y-4">
            {activeFile.components?.length > 0 ? activeFile.components.map(comp => (
              <div key={comp.name} className="bg-surface-2 p-3 rounded-lg border border-default">
                <h3 className="font-bold text-primary mb-2">{comp.name} <span className="text-xs font-normal text-secondary">({comp.type})</span></h3>
                <div className="space-y-1 text-xs code-font">
                  {Object.entries(comp.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-secondary">{key}:</span>
                      <span className="text-primary">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )) : <p className="text-secondary text-center p-4">Không có thành phần để kiểm tra.</p>}
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
          <div className="p-3 border-b border-default flex-shrink-0">
            <h2 className="font-bold text-xs uppercase tracking-wider">Bảng Dịch: <span className="text-primary">{activeFile.name}</span></h2>
          </div>
          <div className="p-3 flex-shrink-0 border-b border-default">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-surface-2 p-2 pl-9 rounded-md border border-default text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex-grow overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface-1 z-10">
                <tr>
                  <th className="p-3 w-8"></th>
                  <th className="p-3 font-semibold uppercase">Key</th>
                  <th className="p-3 font-semibold uppercase">Văn bản gốc</th>
                  <th className="p-3 font-semibold uppercase">Bản dịch</th>
                </tr>
              </thead>
              <tbody className="divide-y border-default">
                {filteredStrings.length > 0 ? filteredStrings.map(s => (
                  <tr key={s.key} className="table-row">
                    <td className="p-3 align-top">
                      <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `var(--status-${s.status})` }} title={`Trạng thái: ${s.status}`}></span>
                    </td>
                    <td className="p-3 align-top font-semibold code-font text-secondary">{s.key}</td>
                    <td className="p-3 align-top text-primary">{s.en}</td>
                    <td className="p-3 align-top">
                      <textarea
                        className="w-full bg-surface-2 p-2 rounded-md border border-default text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        rows={2}
                        defaultValue={s.vi}
                      ></textarea>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-secondary">Không tìm thấy kết quả.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
