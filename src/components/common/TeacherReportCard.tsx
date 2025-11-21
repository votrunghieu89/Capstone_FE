import React from 'react';
import { BookOpen, Users, BarChart2, Calendar } from 'lucide-react';
import { Button } from './Button';
import { TeacherQuizReportFlat } from '../../libs/api/teacherReportApi'; 

interface TeacherReportCardProps {
    report: TeacherQuizReportFlat;
    onViewDetail: () => void;
}

export const TeacherReportCard: React.FC<TeacherReportCardProps> = ({ report, onViewDetail }) => {
    
    // Giả định Điểm TB là N/A vì dữ liệu API hiện tại không có, bạn cần bổ sung sau
    const averageScore = report.TotalAttempts > 0 ? 'N/A' : 'N/A'; 

    return (
        <div className="p-4 border border-secondary-200 rounded-xl bg-white shadow-md flex items-center justify-between hover:border-primary-400 transition-all">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                <BookOpen className="w-8 h-8 text-primary-500 flex-shrink-0" />
                <div className="min-w-0">
                    <h3 className="font-bold text-lg text-secondary-900 truncate">
                        {report.Title}
                    </h3>
                    <p className="text-sm text-secondary-600 flex items-center space-x-2">
                        <span>{report.TotalQuestions} câu hỏi</span>
                        <span className="font-extrabold text-xs">•</span>
                        <Users className="w-4 h-4" />
                        <span>{report.GroupName}</span> 
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-6 flex-shrink-0">
                {/* Số lần làm bài */}
                <div className="text-center">
                    <p className="text-xs text-secondary-500">Lượt làm bài</p>
                    <p className="font-bold text-xl text-primary-600">
                        {report.TotalAttempts}
                    </p>
                </div>

                {/* Điểm trung bình (Placeholder) */}
                <div className="text-center">
                    <p className="text-xs text-secondary-500">Điểm TB</p>
                    <p className="font-bold text-xl text-primary-600">
                        {averageScore}
                    </p>
                </div>

                {/* Nút Chi tiết */}
                <Button size="sm" onClick={onViewDetail}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Xem chi tiết
                </Button>
            </div>
        </div>
    );
};