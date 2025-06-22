'use client';
import { ArrowLeft, FileJson, FileUp, Sparkles } from 'lucide-react';

interface RpgEditorViewProps {
    gameName: string;
    onGoBack: () => void;
}

export default function RpgEditorView({ gameName, onGoBack }: RpgEditorViewProps) {
    const files = [
      { name: 'Actors.json', progress: '66%', selected: true, checked: true },
      { name: 'Items.json', progress: '100%', selected: false, checked: true },
      { name: 'Skills.json', progress: '15%', selected: false, checked: false },
    ];
    return (
        <div className="flex flex-col h-screen">
            <header className="text-center mb-4 flex-shrink-0 pt-8"><h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Trình Dịch Thuật Game RPG</h1></header>
            <div className="flex flex-grow flex-col min-h-0 p-4 md:p-6">
                <div className="flex-shrink-0 flex items-center justify-between mb-4 space-x-4">
                    <div className="flex items-center space-x-2"><button onClick={onGoBack} className="text-sm font-semibold py-2 px-4 rounded-md shadow-sm bg-surface-2 border border-default text-primary hover:bg-hover flex items-center space-x-2"><ArrowLeft className="h-4 w-4" /><span>Chọn Game Khác</span></button><button className="bg-gray-400 text-white text-sm font-semibold py-2 px-4 rounded-md shadow-lg flex items-center space-x-2 cursor-not-allowed" disabled><FileUp className="h-4 w-4" /><span>Xuất file</span></button></div>
                    <div className="hidden md:block text-center text-sm truncate text-secondary flex-1"><p>Đang làm việc với: <span className="font-semibold text-primary">{gameName}</span></p></div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-colors flex items-center space-x-2"><Sparkles className="h-4 w-4" /><span>Chế độ dịch</span></button>
                </div>
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
                    <div className="lg:col-span-3 flex flex-col rounded-lg p-3 min-h-0 bg-surface-1 border border-default card">
                        <h2 className="text-lg font-bold mb-2 flex-shrink-0 text-primary">Danh sách file</h2>
                        <div className="flex-grow overflow-y-auto pr-2">
                            <ul className="space-y-1">
                                {files.map(file => (<li key={file.name} className={`tree-item flex items-center p-2 rounded-md cursor-pointer ${file.selected ? 'active' : ''}`}><input type="checkbox" defaultChecked={file.checked} className="mr-3 h-4 w-4 rounded border-default text-indigo-600 bg-surface-2 focus:ring-indigo-500" /><FileJson className="h-4 w-4 mr-2 text-secondary icon flex-shrink-0" /><span className="flex-grow truncate text-sm text-primary">{file.name}</span><span className="text-xs font-mono ml-2 text-secondary">{file.progress}</span></li>))}
                            </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col rounded-lg p-3 min-h-0 bg-surface-1 border border-default card">
                        <h2 className="text-lg font-bold mb-2 flex-shrink-0 text-primary">Nội dung gốc</h2>
                        <div className="flex-grow rounded-md p-3 text-base leading-relaxed overflow-y-auto space-y-2 bg-surface-2"><p className="text-primary">Diễn viên</p><div className="my-1 border-t border-default"></div><p className="text-primary">Nhân vật chính</p></div>
                    </div>
                    <div className="lg:col-span-5 flex flex-col rounded-lg p-3 min-h-0 bg-surface-1 border border-default card">
                        <h2 className="text-lg font-bold mb-2 flex-shrink-0 text-primary">Nội dung dịch</h2>
                        <div className="flex-grow rounded-md p-3 text-base leading-relaxed overflow-y-auto space-y-2 bg-surface-2"><p className="text-primary">Actor</p><div className="my-1 border-t border-default"></div><p className="text-primary">Main Character</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}