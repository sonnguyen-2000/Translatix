'use client';
import { FolderPlus, Box, X } from 'lucide-react';
import { useEffect } from 'react';

interface UnityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (projectName: string) => void;
}

export default function UnityModal({ isOpen, onClose, onSelect }: UnityModalProps) {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (isOpen && event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const recentProjects = [
        { name: "MyAwesomeGame", path: "D:/Games/Unity/MyAwesomeGame" },
        { name: "Project: Survival RPG", path: "C:/Users/Admin/Documents/Unity Projects/SurvivalRPG" }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="modal-content w-full max-w-lg rounded-xl p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Mở Dự án Unity</h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary p-1 rounded-full"><X size={24} /></button>
                </div>
                <p className="text-secondary mb-6">Chọn thư mục gốc của dự án Unity bạn muốn dịch.</p>
                <button onClick={() => onSelect("Dự án Unity Mới")} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition mb-6">
                    <FolderPlus size={24} />
                    <span>Chọn Thư Mục Dự Án...</span>
                </button>
                <div>
                    <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3 border-t border-default pt-4">Hoặc mở dự án gần đây</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentProjects.map(p => (
                            <div key={p.name} onClick={() => onSelect(p.name)} className="p-3 bg-surface-2 rounded-md hover:bg-hover cursor-pointer transition group">
                                <div className="flex items-center space-x-3">
                                    <Box className="h-5 w-5 text-secondary flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-primary">{p.name}</p>
                                        <p className="text-xs text-secondary code-font truncate">{p.path}</p>
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