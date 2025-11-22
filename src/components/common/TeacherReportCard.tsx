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
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("vi-VN");
    };
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "completed":
                return "bg-green-100 text-green-700 border-green-300";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-300";
            default:
                return "bg-gray-100 text-gray-600 border-gray-300";
        }
    };
    return (
        <div className="p-4 border border-secondary-200 rounded-xl bg-white shadow-md flex items-center justify-between hover:border-primary-400 transition-all">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                <BookOpen className="w-8 h-8 text-primary-500 flex-shrink-0" />
                <div className="min-w-0">
                    <h3 className="font-bold text-lg text-secondary-900 truncate">
                        {report.Title}
                    </h3>
                    {/* ⭐ STATUS BADGE */}
                        <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(
                                report.Status ?? ""
                            )}`}
                        >
                            {report.Status}
                        </span>
                    <p className="text-sm text-secondary-600 flex items-center space-x-2">
                       
                        <span className="font-extrabold text-xs"></span>
                        <Users className="w-4 h-4" />
                        <span>{report.GroupName}</span> 
                    </p>
                    <p className="text-sm text-secondary-600 flex items-center space-x-2">
                       
                        <span className="font-extrabold text-xs"></span>
                        
                        <span>{report.reportName}</span> 
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

                {/* ⭐ Hết hạn */}
                <div className="text-center">
                    <p className="text-xs text-secondary-500">Hết hạn</p>
                    <p className="font-bold text-sm text-secondary-700 whitespace-nowrap">
                        {formatDate(report.EndTime ?? undefined)}
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