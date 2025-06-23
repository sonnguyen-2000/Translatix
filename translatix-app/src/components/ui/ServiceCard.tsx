'use client';
import { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    isLoading: boolean;
    onClick: () => void;
}

export default function ServiceCard({ title, description, icon, isLoading, onClick }: ServiceCardProps) {
    const iconColorClass = {
        'Dịch Game RPG': 'text-blue-400 bg-blue-500/10',
        'Dịch Game Unity': 'text-indigo-400 bg-indigo-500/10',
        'Dịch Game Unreal': 'text-purple-400 bg-purple-500/10',
        'Dịch Truyện Tranh': 'text-pink-400 bg-pink-500/10',
    }[title] || 'text-gray-400 bg-gray-500/10';

    return (
        <div className="platform-card h-full rounded-xl p-6 flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${iconColorClass}`}>
                {icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-primary">{title}</h3>
            <p className="text-secondary text-xs flex-grow mb-6">{description}</p>
            <button 
                className="w-full font-semibold py-2 rounded-md transition-colors bg-surface-2 text-primary border border-default hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={isLoading}
                onClick={onClick}
            >
                {isLoading ? (
                    <>
                        <LoaderCircle className="animate-spin h-4 w-4" />
                        <span>Đang chờ...</span>
                    </>
                ) : (
                    'Bắt đầu'
                )}
            </button>
        </div>
    );
}
