'use client';

import { useState } from 'react';
// ... các import khác của bạn
import { RpgFileData } from '@/data/mockRpgFiles'; // Import kiểu dữ liệu
import { BookOpen, Box, Layers3, Shield } from 'lucide-react';
import ComicEditorView, { Chapter } from '@/components/editors/ComicEditorView';
import RpgEditorView from '@/components/editors/RpgEditorView';
import UnityEditorView from '@/components/editors/UnityEditorView';
import UnrealEditorView from '@/components/editors/UnrealEditorView';
import RpgModal from '@/components/modals/RpgModal';
import ComicModal from '@/components/modals/ComicModal';
import UnityModal from '@/components/modals/UnityModal';
import UnrealModal from '@/components/modals/UnrealModal';
import ServiceCard from '@/components/ui/ServiceCard';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

type EditorType = 'rpg' | 'unity' | 'unreal' | 'comic';

export default function HomePage() {
    const [activeModal, setActiveModal] = useState<EditorType | null>(null);
    const [activeEditor, setActiveEditor] = useState<EditorType | null>(null);
    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [loadedProjectData, setLoadedProjectData] = useState<any>(null);

    const services = [
        { id: 'rpg', title: "Dịch Game RPG", description: "Bản địa hóa cốt truyện, nhiệm vụ, và lời thoại nhân vật.", icon: <Shield size={32} /> },
        { id: 'unity', title: "Dịch Game Unity", description: "Xử lý tệp ngôn ngữ, UI/UX và nội dung phức tạp.", icon: <Box size={32} /> },
        { id: 'unreal', title: "Dịch Game Unreal", description: "Tích hợp và dịch thuật chuyên sâu cho các dự án Unreal.", icon: <Layers3 size={32} /> },
        { id: 'comic', title: "Dịch Truyện Tranh", description: "Dịch thuật và biên tập lời thoại, giữ trọn vẹn phong cách.", icon: <BookOpen size={32} /> }
    ];

    // THAY THẾ TOÀN BỘ HÀM NÀY
    const handleProjectSelect = (projectName: string, data: any) => {
        const currentModalType = activeModal;
        setSelectedProjectName(projectName);

        // --- BẮT ĐẦU PHẦN CHỈNH SỬA ---

        // Kiểm tra nếu là dự án RPG và có dữ liệu file
        if (currentModalType === 'rpg' && data?.files && Array.isArray(data.files)) {
            // Chuyển đổi mảng chuỗi đường dẫn từ backend thành mảng object mà RpgEditorView cần
            const transformedFiles: RpgFileData[] = data.files.map((fullPath: string, index: number) => ({
                name: fullPath.split(/[\\/]/).pop() || 'unknown.json', // Lấy tên file từ đường dẫn
                progress: '0%', // Đặt giá trị mặc định
                selected: index === 0, // Mặc định chọn file đầu tiên
                checked: true, // Mặc định tick chọn tất cả
            }));
            // Lưu dữ liệu đã được chuyển đổi vào state
            setLoadedProjectData({ files: transformedFiles });
        } else {
            // Đối với các loại dự án khác, giữ nguyên dữ liệu
            setLoadedProjectData(data);
        }

        // --- KẾT THÚC PHẦN CHỈNH SỬA ---
        
        setActiveModal(null);
        setTimeout(() => setActiveEditor(currentModalType), 100);
    };
    
    const handleBackToPlatform = () => {
        setActiveEditor(null);
        setSelectedProjectName('');
        setLoadedProjectData(null);
    };

    if (activeEditor) {
        // ... (phần switch case giữ nguyên)
        switch (activeEditor) {
            case 'rpg':
                return <RpgEditorView gameName={selectedProjectName} files={loadedProjectData?.files || []} onGoBack={handleBackToPlatform} />;
            case 'unity': 
                return <UnityEditorView projectName={selectedProjectName} onGoBack={handleBackToPlatform} />;
            case 'unreal':
                return <UnrealEditorView projectName={selectedProjectName} onGoBack={handleBackToPlatform} />;
            case 'comic':
                if (!loadedProjectData) return null;
                return (
                    <ComicEditorView
                        chapterName={selectedProjectName}
                        chapterData={loadedProjectData as Chapter}
                        onGoBack={handleBackToPlatform}
                    />
                );
            default: 
              setActiveEditor(null);
              return null;
        }
    }

    return (
        // ... (phần return của giao diện chính giữ nguyên)
        <div className="main-content">
            <ThemeToggleButton />
            <main className="min-h-screen flex flex-col items-center justify-center p-8">
                <header className="text-center mb-12 md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-3">Chọn Nền Tảng Dịch Thuật</h1>
                    <p className="text-lg text-secondary max-w-2xl mx-auto">Giải pháp bản địa hóa chuyên nghiệp cho các dự án game và truyện tranh của bạn.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
                    {services.map((service) => (
                        <div key={service.id} 
                             className={`platform-card-wrapper ${service.id}-card cursor-pointer`}
                             onClick={() => setActiveModal(service.id as EditorType)}
                        >
                            <ServiceCard
                                title={service.title}
                                description={service.description}
                                icon={service.icon}
                            />
                        </div>
                    ))}
                </div>
            </main>
            
            <RpgModal isOpen={activeModal === 'rpg'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
            <UnityModal isOpen={activeModal === 'unity'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
            <UnrealModal isOpen={activeModal === 'unreal'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
            <ComicModal isOpen={activeModal === 'comic'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
        </div>
    );
}