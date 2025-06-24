import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';

interface RpgModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (projectName: string, data: any) => void;
}

const RpgModal: React.FC<RpgModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleUploadClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Gọi IPC để bắt đầu quá trình chọn file RPG
            const result = await window.ipc.invoke('start-processing', 'rpg');
            
            if (result.status === 'success') {
                // Backend trả về { projectName: string, files: string[] }
                // Ta truyền projectName và toàn bộ object data về cho HomePage
                onSelect(result.data.projectName, result.data);
            } else if (result.status !== 'canceled') {
                setError(result.message || 'Đã xảy ra lỗi không xác định.');
            }
        } catch (e: any) {
            setError(e.message || 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý khi click vào backdrop để đóng modal
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Mở Dự Án Game RPG</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="modal-description mb-6">
                        Chọn file thực thi (.exe) của game RPG Maker để hệ thống tự động tìm các tệp dữ liệu JSON.
                    </p>

                    <button
                        onClick={handleUploadClick}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <UploadCloud size={20} className="mr-2" />
                        )}
                        <span>{isLoading ? 'Đang xử lý...' : 'Chọn File Game (.exe)...'}</span>
                    </button>
                    
                    {error && (
                        <div className="mt-4 text-red-500 text-sm bg-red-100 p-3 rounded-md">
                            <p><strong>Lỗi:</strong> {error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RpgModal;