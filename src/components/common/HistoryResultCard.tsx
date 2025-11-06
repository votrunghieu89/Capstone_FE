// src/components/common/HistoryResultCard.tsx

import React from "react";
import { Button } from "./Button";
import { Eye, BookOpen, Clock } from "lucide-react"; 


export interface QuizHistory {
    id: string;
    title: string;
    topic: string; // Tạm dùng cho lọc
    score: number;
    maxScore: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number; // in minutes
    completedAt: string;
    difficulty: "Easy" | "Medium" | "Hard";
    class?: string; // Tên lớp (cho nhóm lớp)
    teacher?: string; // Tên người tạo
    createdBy?: string; //Tên người hoàn thành
    avatarURL?: string; 
    GroupName?: string | null; // Nếu là Quiz Nhóm lớp
}

interface HistoryResultCardProps {
    result: QuizHistory;
    onViewDetail: (resultId: string) => void;
}

// Helper để format ngày/giờ (Giữ nguyên)
const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return `${date.toLocaleDateString('vi-VN')} lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

export const HistoryResultCard: React.FC<HistoryResultCardProps> = ({
    result,
    onViewDetail,
}) => {
    
    // 🛑 LOGIC XỬ LÝ NỀN (Người tạo và Nhóm lớp) 🛑
    const secondaryInfo = result.GroupName 
        ? (
            <span className="text-sm font-semibold text-primary-600">
                {result.GroupName}
            </span>
        ) : (
            <span className="text-sm text-secondary-600">
                {result.createdBy || "Người tạo không rõ"} • Người tạo 
            </span>
        );
    
    // 🛑 LOGIC BỔ SUNG: Kiểm tra dữ liệu bị thiếu từ Mock Data 🛑
    const totalQuestionsDisplay = result.totalQuestions > 0 
        ? `${result.totalQuestions} câu hỏi` 
        : 'Không rõ số câu';


    return (
        <div key={result.id} className="card p-5 flex flex-col justify-between transition-shadow hover:shadow-lg">
            <div className="flex items-start gap-4">
                
                {/* AVATAR */}
                <img 
                    src={result.avatarURL || "/default-avatar.png"} 
                    alt={result.createdBy || "Avatar"}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 mt-1"
                />

                {/* THÔNG TIN CHÍNH */}
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-secondary-900 mb-1 truncate">
                        {result.title || "Tên Quiz không rõ"}
                    </h3>
                    
                    {/* DÒNG NGƯỜI TẠO / NHÓM LỚP */}
                    <p className="mb-3">{secondaryInfo}</p>

                    {/* 🛑 HIỂN THỊ STATS THỰC TẾ 🛑 */}
                    <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-4">
                        <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {/* 🛑 SỬ DỤNG TRƯỜNG TOTALQUESTIONS 🛑 */}
                            <span>{totalQuestionsDisplay}</span> 
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {/* 🛑 SỬ DỤNG TRƯỜNG COMPLETEDAT VÀ FORMAT 🛑 */}
                            <span>Hoàn thành: {formatDateTime(result.completedAt)}</span> 
                        </div>
                    </div>

                    {/* NÚT XEM CHI TIẾT */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-40 justify-center"
                        onClick={() => onViewDetail(result.id.toString())}
                    >
                        <Eye className="w-4 h-4 mr-1" /> Xem chi tiết
                    </Button>
                </div>
            </div>
        </div>
    );
};