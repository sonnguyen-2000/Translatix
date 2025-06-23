'use client';

import { useState } from 'react';
import ServiceCard from '@/components/ui/ServiceCard';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import RpgEditorView from '@/components/editors/RpgEditorView';
import UnityEditorView from '@/components/editors/UnityEditorView';
import UnrealEditorView from '@/components/editors/UnrealEditorView';
import ComicEditorView from '@/components/editors/ComicEditorView';
import { BookOpen, Box, Layers3, Shield } from 'lucide-react';
import { mockChapter } from '@/data/mockChapter';
import { mockRpgFiles } from '@/data/mockRpgFiles';

type EditorType = 'rpg' | 'unity' | 'unreal' | 'comic';

export default function HomePage() {
    const [activeEditor, setActiveEditor] = useState<EditorType | null>(null);
    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [isLoading, setIsLoading] = useState<EditorType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const services = [
        { id: 'rpg', title: "Dịch Game RPG", description: "Bản địa hóa cốt truyện, nhiệm vụ, và lời thoại nhân vật.", icon: <Shield size={32} /> },
        { id: 'unity', title: "Dịch Game Unity", description: "Xử lý tệp ngôn ngữ, UI/UX và nội dung phức tạp.", icon: <Box size={32} /> },
        { id: 'unreal', title: "Dịch Game Unreal", description: "Tích hợp và dịch thuật chuyên sâu cho các dự án Unreal.", icon: <Layers3 size={32} /> },
        { id: 'comic', title: "Dịch Truyện Tranh", description: "Dịch thuật và biên tập lời thoại, giữ trọn vẹn phong cách.", icon: <BookOpen size={32} /> }
    ];

    const handleStartService = async (serviceId: EditorType) => {
        setIsLoading(serviceId);
        setError(null);

        if (!window.ipc) {
            setError("Lỗi: Cầu nối IPC không khả dụng. Ứng dụng có đang chạy trong Electron không?");
            setIsLoading(null);
            return;
        }

        try {
            const result = await window.ipc.invoke('start-processing', serviceId);

            if (result.status === 'success') {
                setSelectedProjectName(result.data.projectName);
                setActiveEditor(serviceId);
            } else if (result.status !== 'canceled') {
                setError(result.message);
            }
        } catch (err: any) {
            console.error("Lỗi IPC:", err);
            setError(err.message || 'Có lỗi xảy ra khi giao tiếp với tiến trình chính.');
        } finally {
            setIsLoading(null);
        }
    };

    const handleBackToPlatform = () => {
        setActiveEditor(null);
        setSelectedProjectName('');
    };

    if (activeEditor) {
        switch (activeEditor) {
            case 'rpg':
                return <RpgEditorView gameName={selectedProjectName} files={mockRpgFiles} onGoBack={handleBackToPlatform} />;
            case 'unity':
                return <UnityEditorView projectName={selectedProjectName} onGoBack={handleBackToPlatform} />;
            case 'unreal':
                return <UnrealEditorView projectName={selectedProjectName} onGoBack={handleBackToPlatform} />;
            case 'comic':
                return <ComicEditorView chapterName={selectedProjectName} chapterData={mockChapter} onGoBack={handleBackToPlatform} />;
            default:
                setActiveEditor(null);
                return null;
        }
    }

    return (
        <div className="main-content">
            <ThemeToggleButton />
            <main className="min-h-screen flex flex-col items-center justify-center p-8">
                <header className="text-center mb-12 md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-3">Chọn Nền Tảng Dịch Thuật</h1>
                    <p className="text-lg text-secondary max-w-2xl mx-auto">Giải pháp bản địa hóa chuyên nghiệp cho các dự án game và truyện tranh của bạn.</p>
                </header>
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-md mb-8 max-w-2xl w-full text-center text-sm">
                        <strong>Lỗi:</strong> {error}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
                    {services.map((service) => (
                        <div key={service.id} className={`platform-card-wrapper ${service.id}-card`}>
                            <ServiceCard
                                title={service.title}
                                description={service.description}
                                icon={service.icon}
                                isLoading={isLoading === service.id}
                                onClick={() => handleStartService(service.id as EditorType)}
                            />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
