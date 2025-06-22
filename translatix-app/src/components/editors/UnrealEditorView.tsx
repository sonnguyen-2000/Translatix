'use client';
import { useState } from 'react';
import { ArrowLeft, Download, RefreshCw, Save, Search, Sparkles } from 'lucide-react';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

interface UnrealEditorViewProps { projectName: string; onGoBack: () => void; }

export default function UnrealEditorView({ projectName, onGoBack }: UnrealEditorViewProps) {
    const [activeNamespace, setActiveNamespace] = useState('UI.MainMenu');
    return (
        <div className="flex flex-col h-screen">
            <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-default bg-surface-1 card z-10">
                <div className="flex items-center space-x-3">
                    <button onClick={onGoBack} className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition"><ArrowLeft className="h-4 w-4" /><span>Quay Lại</span></button>
                    <button className="flex items-center space-x-2 bg-surface-2 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-hover transition"><RefreshCw className="h-4 w-4" /><span>Gather Text</span></button>
                    <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 transition"><Download className="h-4 w-4" /><span>Export</span></button>
                </div>
                 <div className="text-secondary text-sm">Dự án: <span className="font-semibold text-primary">{projectName}</span></div>
            </header>
            <main className="flex-grow grid grid-cols-12 gap-4 p-4 min-h-0">
                <div className="col-span-12 md:col-span-2 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
                    <div className="p-3 border-b border-default flex-shrink-0"><h2 className="font-bold text-xs uppercase tracking-wider">Namespaces</h2></div>
                    <div className="flex-grow overflow-y-auto p-2">
                        <ul className="space-y-1 text-secondary">
                            <li onClick={() => setActiveNamespace('All')} className={`tree-item flex items-center justify-between p-1.5 rounded cursor-pointer ${activeNamespace === 'All' ? 'active' : ''}`}><span>All</span><span className="text-xs px-1.5 bg-surface-2 rounded-full">12</span></li>
                            <li onClick={() => setActiveNamespace('UI.MainMenu')} className={`tree-item flex items-center justify-between p-1.5 rounded cursor-pointer ${activeNamespace === 'UI.MainMenu' ? 'active' : ''}`}><span>UI.MainMenu</span><span className="text-xs px-1.5 bg-blue-800 text-white rounded-full">4</span></li>
                        </ul>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-7 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
                    <div className="p-3 border-b border-default flex-shrink-0"><h2 className="font-bold text-xs uppercase tracking-wider">String Table: MainMenu</h2></div>
                    <div className="p-3 flex-shrink-0"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" /><input type="text" placeholder="Tìm kiếm..." className="w-full bg-surface-2 p-2 pl-9 rounded-md border border-default text-xs focus:ring-2 focus:ring-blue-500 outline-none" /></div></div>
                    <div className="flex-grow overflow-y-auto">
                        <table className="w-full text-left text-xs"><thead className="sticky top-0 bg-surface-1 z-10"><tr className="border-b border-default"><th className="p-2 font-semibold uppercase w-[5%]"></th><th className="p-2 font-semibold uppercase w-[25%]">Key</th><th className="p-2 font-semibold uppercase w-[35%]">Source Text</th><th className="p-2 font-semibold uppercase w-[35%]">Translation</th></tr></thead>
                            <tbody className="divide-y border-default">
                                <tr className="table-row active"><td className="p-2 text-center"><span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span></td><td className="p-2 text-secondary code-font">start_button_text</td><td className="p-2 text-primary">Start Game</td><td className="p-1"><input type="text" className="w-full bg-transparent p-1 rounded" defaultValue="Bắt Đầu" /></td></tr>
                                <tr className="table-row"><td className="p-2 text-center"><span className="h-2 w-2 rounded-full bg-yellow-500 inline-block"></span></td><td className="p-2 text-secondary code-font">quit_button_text</td><td className="p-2 text-primary">Quit Game</td><td className="p-1"><input type="text" className="w-full bg-transparent p-1 rounded" defaultValue="Thoát" /></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-3 bg-surface-1 flex flex-col min-h-0 card rounded-lg">
                    <div className="p-3 border-b border-default flex-shrink-0"><h2 className="font-bold text-xs uppercase tracking-wider">Context</h2></div>
                    <div className="flex-grow p-3 space-y-4 overflow-y-auto">
                        <div><h3 className="font-bold mb-2">Key: <span className="code-font text-blue-400">start_button_text</span></h3><p className="text-secondary text-xs">Đây là văn bản hiển thị trên nút bấm chính ở màn hình menu.</p></div>
                        <div><h4 className="font-semibold text-xs text-secondary mb-2">Source Location</h4><p className="code-font bg-surface-2 p-2 rounded-md text-xs">/Game/UI/Widgets/WBP_MainMenu.uasset</p></div>
                    </div>
                </div>
            </main>
        </div>
    );
}