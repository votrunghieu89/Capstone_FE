// src/app/routes/student/History.tsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Calendar,
    Clock,
    RotateCcw,
    Eye,
} from "lucide-react";

import { Button } from "../../../components/common/Button"; 
// 🛑 ĐÃ XÓA StatCardProps VÀ QuizCard
// 🛑 GIẢ ĐỊNH BẠN ĐÃ CÓ HistoryResultCard THỰC SỰ
import { HistoryResultCard } from '../../../components/common/HistoryResultCard';
import { QuizHistory } from '../../../components/common/HistoryResultCard';


// MOCK DATA (Dữ liệu giả)
const history: QuizHistory[] = [
    { id: "1", title: "Kiểm tra Toán chương 1", topic: "Toán học", score: 85, maxScore: 100, totalQuestions: 20, correctAnswers: 17, timeSpent: 25, completedAt: "2024-10-03T17:30:00", difficulty: "Medium", class: "Lớp 10A1", teacher: "Cô Lan", createdBy: "Lê Minh Tuấn", avatarURL: '/path/to/avatar1.png', GroupName: null },
    { id: "2", title: "Quiz Vật lý - Điện học", topic: "Vật lý", score: 92, maxScore: 100, totalQuestions: 15, correctAnswers: 14, timeSpent: 35, completedAt: "2024-10-02T16:45:00", difficulty: "Hard", class: "Lớp 11B2", teacher: "Cô Lan", createdBy: "Phạm Văn Nam", avatarURL: '/path/to/avatar2.png', GroupName: "Lớp 9A" },
    { id: "3", title: "Lịch sử Việt Nam", topic: "Lịch sử", score: 78, maxScore: 100, totalQuestions: 25, correctAnswers: 20, timeSpent: 20, completedAt: "2024-10-01T10:15:00", difficulty: "Easy", createdBy: "Phạm Văn Nam", GroupName: null },
    { id: "4", title: "Bài tập Hóa học", topic: "Hóa học", score: 65, maxScore: 100, totalQuestions: 18, correctAnswers: 12, timeSpent: 40, completedAt: "2024-09-30T09:30:00", difficulty: "Medium", createdBy: "Lê Minh Tuấn", GroupName: "Lớp 9A" },
];

export default function StudentHistory() {
    const navigate = useNavigate();
    const [filterTopic, setFilterTopic] = useState("all");
    // 🛑 ĐÃ BỎ STATE SẮP XẾP VÀ FILTER ĐIỂM SỐ
    
    // 🛑 DANH SÁCH LOẠI QUIZ ĐÚNG 🛑
    const quizTypes = [
        { label: "Tất cả", value: "all" },
        { label: "Quiz Homepage", value: "public" }, 
        { label: "Quiz Nhóm lớp", value: "private" },
    ];

    // LOGIC LỌC VÀ SẮP XẾP
    const filteredResults = history.filter((quiz) => {
        // Sau này dùng API thật: 'all' -> giữ lại, 'public' -> !quiz.GroupName, 'private' -> !!quiz.GroupName
        const matchesType = filterTopic === "all" || 
                            (filterTopic === "public" && !quiz.GroupName) || 
                            (filterTopic === "private" && !!quiz.GroupName);
        return matchesType;
    });

    const sortedResults = useMemo(() => {
        // Tự động sắp xếp theo ngày hoàn thành (mới nhất lên trước)
        return [...filteredResults].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }, [filteredResults]);

    const handleViewDetail = (resultId: string) => {
        // Giả định đường dẫn xem chi tiết là /report/detail/:resultId
        navigate(`/report/detail/${resultId}`); 
    };

    const handleRetake = (quizId: string) => {
        // Giả định đường dẫn làm lại quiz là /quiz/start/:quizId
        navigate(`/quiz/start/${quizId}`);
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                    📖 Lịch sử Quiz
                </h1>
                <p className="text-secondary-600">Xem lại các quiz đã hoàn thành</p>
            </div>

            

            {/* Filters */}
            <div className="card p-4 mb-6 w-48"> {/* Đơn giản hóa card filter */}
                <label className="text-sm font-medium text-gray-700 block mb-2">Loại Quiz</label>
                <select
                    className="input w-full"
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                >
                    {quizTypes.map((type) => (
                        <option
                            key={type.value}
                            value={type.value}
                        >
                            {type.label}
                        </option>
                    ))}
                </select>
                {/* 🛑 ĐÃ XÓA SẮP XẾP VÀ CÁC INPUT KHÁC 🛑 */}
            </div>

            {/* Quiz List (List dọc đơn giản) */}
            <div className="space-y-4"> 
                {sortedResults.map((result) => (
                   
                    <HistoryResultCard
                        key={result.id}
                        result={result}
                        onViewDetail={handleViewDetail}
                       // onRetake={handleRetake}
                    />
                ))}
            </div>

            {sortedResults.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">Chưa có lịch sử quiz</h3>
                    <p className="text-secondary-600">Hoàn thành quiz đầu tiên để xem lịch sử</p>
                </div>
            )}
        </div>
    );
}