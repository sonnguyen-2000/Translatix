'use client';
import { useState } from 'react';
import { ArrowLeft, Download, RefreshCw, Save, Search } from 'lucide-react';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import { mockUnrealData, UnrealNamespace, UnrealEntry } from '@/data/mockUnreal';

interface UnrealEditorViewProps {
  projectName: string;
  onGoBack: () => void;
}

export default function UnrealEditorView({ projectName, onGoBack }: UnrealEditorViewProps) {
  // Tính toán namespace 'All' một lần duy nhất
  const [namespaces] = useState<UnrealNamespace[]>(() => {
    const allEntries = mockUnrealData.flatMap(ns => ns.name !== 'All' ? ns.entries : []);
    return mockUnrealData.map(ns =>
      ns.name === 'All'
        ? { ...ns, entries: allEntries }
        : ns
    );
  });

  const [activeNamespace, setActiveNamespace] = useState(namespaces.find(ns => ns.entries.length > 0)?.name || 'All');
  const [activeEntryKey, setActiveEntryKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const activeData = namespaces.find(ns => ns.name === activeNamespace);
  
  const filteredEntries = activeData?.entries.filter(e =>
    e.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.translation.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Xác định activeEntry dựa trên activeEntryKey, nếu không có thì lấy phần tử đầu tiên
  const activeEntry = activeEntryKey 
    ? filteredEntries.find(e => e.key === activeEntryKey)
    : filteredEntries[0];

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-default bg-surface-1 card z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onGoBack} className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition"><ArrowLeft className="h-4 w-4" /><span>Quay Lại</span></button>
          <button className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition"><RefreshCw className="h-4 w-4" /><span>Gather Text</span></button>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 transition"><Download className="h-4 w-4" /><span>Export</span></button>
        </div>
        <div className="text-secondary text-sm">Dự án: <span className="font-semibold text-primary">{projectName}</span></div>
        <ThemeToggleButton/>
      </header>

      <main className="flex-grow grid grid-cols-12 gap-4 p-4 min-h-0">
        {/* Namespace List */}
        <div className="col-span-12 md:col-span-2 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
          <div className="p-3 border-b border-default flex-shrink-0"><h2 className="font-bold text-xs uppercase tracking-wider">Namespaces</h2></div>
          <div className="flex-grow overflow-y-auto p-2">
            <ul className="space-y-1 text-secondary">
              {namespaces.map(ns => (
                <li key={ns.name}
                  onClick={() => setActiveNamespace(ns.name)}
                  className={`tree-item flex items-center justify-between p-1.5 rounded cursor-pointer ${activeNamespace === ns.name ? 'active' : ''}`}
                >
                  <span>{ns.name}</span>
                  <span className={`text-xs px-1.5 rounded-full ${activeNamespace === ns.name ? 'bg-blue-800 text-white' : 'bg-surface-2'}`}>{ns.entries.length}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* String Table */}
        <div className="col-span-12 md:col-span-7 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
          <div className="p-3 border-b border-default flex-shrink-0"><h2 className="font-bold text-xs uppercase tracking-wider">String Table: {activeNamespace}</h2></div>
          <div className="p-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
              <input type="text" placeholder="Tìm kiếm..." className="w-full bg-surface-2 p-2 pl-9 rounded-md border border-default text-xs focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface-1 z-10"><tr className="border-b border-default"><th className="p-2 w-[5%]"></th><th className="p-2 font-semibold uppercase w-[25%]">Key</th><th className="p-2 font-semibold uppercase w-[35%]">Source Text</th><th className="p-2 font-semibold uppercase w-[35%]">Translation</th></tr></thead>
              <tbody className="divide-y border-default">
                {filteredEntries.map(entry => (
                  <tr key={entry.key} onClick={() => setActiveEntryKey(entry.key)} className={`table-row cursor-pointer ${activeEntry?.key === entry.key ? 'active' : ''}`}>
                    <td className="p-2 text-center"><span className={`h-2 w-2 rounded-full inline-block`} style={{ backgroundColor: `var(--status-${entry.status})`}}></span></td>
                    <td className="p-2 text-secondary code-font">{entry.key}</td>
                    <td className="p-2 text-primary">{entry.source}</td>
                    <td className="p-1"><input type="text" className="w-full bg-transparent p-1 rounded" defaultValue={entry.translation} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Context Viewer */}
        <div className="col-span-12 md:col-span-3 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
          <div className="p-3 border-b border-default flex-shrink-0"><h2 className="font-bold text-xs uppercase tracking-wider">Context</h2></div>
          <div className="flex-grow p-3 space-y-4 overflow-y-auto">
            {activeEntry ? (
              <>
                <div><h3 className="font-bold mb-2">Key: <span className="code-font text-blue-400">{activeEntry.key}</span></h3><p className="text-secondary text-xs">{activeEntry.description || 'Không có mô tả.'}</p></div>
                {activeEntry.location && (<div><h4 className="font-semibold text-xs text-secondary mb-2">Source Location</h4><p className="code-font bg-surface-2 p-2 rounded-md text-xs">{activeEntry.location}</p></div>)}
              </>
            ) : (<p className="text-secondary text-sm p-4 text-center">Chọn một mục để xem chi tiết.</p>)}
          </div>
        </div>
      </main>
    </div>
  );
}