'use client';

import { useState } from 'react';
import ServiceCard from '@/components/ui/ServiceCard';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import RpgModal from '@/components/modals/RpgModal';
import UnityModal from '@/components/modals/UnityModal';
import UnrealModal from '@/components/modals/UnrealModal';
import ComicModal from '@/components/modals/ComicModal';
import RpgEditorView from '@/components/editors/RpgEditorView';
import UnityEditorView from '@/components/editors/UnityEditorView';
import UnrealEditorView from '@/components/editors/UnrealEditorView';
import ComicEditorView, { Chapter } from '@/components/editors/ComicEditorView';
import { BookOpen, Box, Layers3, Shield } from 'lucide-react';

type EditorType = 'rpg' | 'unity' | 'unreal' | 'comic';

export default function HomePage() {
    const [activeModal, setActiveModal] = useState<EditorType | null>(null);
    const [activeEditor, setActiveEditor] = useState<EditorType | null>(null);
    const [selectedProjectName, setSelectedProjectName] = useState('');
    
    // State chung để lưu dữ liệu tải lên cho mọi loại dự án
    const [loadedProjectData, setLoadedProjectData] = useState<any>(null);

    const services = [
        { id: 'rpg', title: "Dịch Game RPG", description: "Bản địa hóa cốt truyện, nhiệm vụ, và lời thoại nhân vật.", icon: <Shield size={32} /> },
        { id: 'unity', title: "Dịch Game Unity", description: "Xử lý tệp ngôn ngữ, UI/UX và nội dung phức tạp.", icon: <Box size={32} /> },
        { id: 'unreal', title: "Dịch Game Unreal", description: "Tích hợp và dịch thuật chuyên sâu cho các dự án Unreal.", icon: <Layers3 size={32} /> },
        { id: 'comic', title: "Dịch Truyện Tranh", description: "Dịch thuật và biên tập lời thoại, giữ trọn vẹn phong cách.", icon: <BookOpen size={32} /> }
    ];

    // Hàm này được gọi từ BÊN TRONG MODAL sau khi có dữ liệu
    const handleProjectSelect = (projectName: string, data: any) => {
        const currentModalType = activeModal;
        setSelectedProjectName(projectName);
        setLoadedProjectData(data); // Lưu tất cả dữ liệu trả về
        
        setActiveModal(null);
        // Chuyển sang giao diện editor
        setTimeout(() => setActiveEditor(currentModalType), 100);
    };
    
    const handleBackToPlatform = () => {
        setActiveEditor(null);
        setSelectedProjectName('');
        setLoadedProjectData(null); // Reset tất cả dữ liệu khi quay lại
    };

    if (activeEditor) {
        switch (activeEditor) {
            case 'rpg':
                // Truyền danh sách file JSON thật vào editor
                return <RpgEditorView gameName={selectedProjectName} files={loadedProjectData?.files || []} onGoBack={handleBackToPlatform} />;
            case 'unity': 
                return <UnityEditorView projectName={selectedProjectName} onGoBack={handleBackToPlatform} />;
            case 'unreal':
                return <UnrealEditorView projectName={selectedProjectName} onGoBack={handleBackToPlatform} />;
            case 'comic':
                // Chỉ render khi có dữ liệu thật
                if (!loadedProjectData) return null;
                return (
                    <ComicEditorView
                        chapterName={selectedProjectName}
                        chapterData={loadedProjectData as Chapter} // Ép kiểu để component nhận đúng props
                        onGoBack={handleBackToPlatform}
                    />
                );
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
                    {services.map((service) => (
                        <div key={service.id} 
                             className={`platform-card-wrapper ${service.id}-card cursor-pointer`}
                             // Khi nhấn vào thẻ, chỉ mở modal
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
            
            {/* Truyền các props cần thiết vào từng modal */}
            <RpgModal isOpen={activeModal === 'rpg'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
            <UnityModal isOpen={activeModal === 'unity'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
            <UnrealModal isOpen={activeModal === 'unreal'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
            <ComicModal isOpen={activeModal === 'comic'} onClose={() => setActiveModal(null)} onSelect={handleProjectSelect} />
        </div>
    );
}