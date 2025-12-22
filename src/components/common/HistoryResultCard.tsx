// src/components/common/HistoryResultCard.tsx

import React from "react";
import { Button } from "./Button";
import { Eye, BookOpen, Clock, CheckCircle } from "lucide-react";
import { QuizHistory } from "../../types/quiz";

interface HistoryResultCardProps {
    result: QuizHistory;
    onViewDetail: (quizId: number,completedAt: string) => void; // 🔥 Không nhận quizId ở đây nữa, vì đã bao bọc ở component cha
}

const normalizeAvatarUrl = (url?: string | null) => {
    if (!url) return "/default-avatar.png";

    const doublePrefix = "http://localhost:5119/http://localhost:5119/";
    if (url.startsWith(doublePrefix)) {
        return url.replace("http://localhost:5119/", "");
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    const BASE_URL = "http://localhost:5119";
    return `${BASE_URL}/${url.replace(/^\/+/, "")}`;
};

const formatDateTime = (isoString: string) => {
    if (!isoString) return "N/A";

    try {
        const date = new Date(isoString);
        return `${date.toLocaleDateString("vi-VN")} lúc ${date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    } catch {
        return "N/A";
    }
};

export const HistoryResultCard: React.FC<HistoryResultCardProps> = ({
    result,
    onViewDetail,
}) => {
    const percentCorrect =
        result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;

    const secondaryInfo = result.GroupName ? (
        <span className="text-sm font-semibold text-primary-600">
            Nhóm lớp: {result.GroupName}
        </span>
    ) : (
        <span className="text-sm text-secondary-600">
            Người tạo: <span className="font-medium">{result.CreatedBy || "Không rõ"}</span>
        </span>
    );

    const totalQuestionsDisplay =
        result.TotalQuestions > 0 ? `${result.TotalQuestions} câu hỏi` : "Không rõ số câu";

    const scoreDisplay =
    result.score !== undefined && result.score !== null
        ? `${result.score} điểm`
        : "Điểm số N/A";

    return (
        <div
            key={result.QuizId}
            className="card p-5 flex items-start gap-4 transition-shadow hover:shadow-lg cursor-pointer"
             onClick={() => onViewDetail(result.QuizId,result.creatAt)} // 🔥 Click cả card → xem chi tiết
        >
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mt-1 bg-secondary-100 flex items-center justify-center">
                <img
                    src={normalizeAvatarUrl(result.AvatarURL) || "/default-avatar.png"}
                    alt={result.QuizTitle || "Quiz"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        if (e.currentTarget.src.includes("default-avatar.png")) return;
                        e.currentTarget.src = "/default-avatar.png";
                    }}
                />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-lg font-bold text-secondary-900 mb-1 truncate">
                    {result.QuizTitle || "Tên Quiz không rõ"}
                </h3>

                <p className="mb-3">{secondaryInfo}</p>

                <div className="flex justify-between items-center text-sm text-secondary-600 mb-4">
                    <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{totalQuestionsDisplay}</span>
                    </div>
                    <div className="flex items-center whitespace-nowrap">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Hoàn thành: {formatDateTime(result.CompletedAt)}</span>
                    </div>
                </div>

                {/* NÚT XEM CHI TIẾT */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-40 justify-center mt-2"
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn click card
                        onViewDetail(result.QuizId,result.creatAt); // 🔥 GỌI ĐÚNG CALLBACK
                    }}
                >
                    <Eye className="w-4 h-4 mr-1" /> Xem chi tiết
                </Button>
            </div>
        </div>
    );
};
