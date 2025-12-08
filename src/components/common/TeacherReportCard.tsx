import React, { useEffect, useState } from 'react';
import { BookOpen, Users, BarChart2 } from 'lucide-react';
import { Button } from './Button';
import { TeacherQuizReportFlat} from '../../libs/api/teacherReportApi';
       

//import { checkQuizExpired, endQuizNow } from '../../libs/api/quizApi';
interface TeacherReportCardProps {
    report: TeacherQuizReportFlat;
    onViewDetail: () => void;
}

export const TeacherReportCard: React.FC<TeacherReportCardProps> = ({ report, onViewDetail }) => {
    const [status, setStatus] = useState<string>(report.Status ?? "Pending");
    const [expiredTime, setExpiredTime] = useState<string | null>(report.EndTime);
    const [loading, setLoading] = useState(false);

    const formatDate = (dateStr?: string | null) => {
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

        const isOnlineQuiz = (report.Type || "").toLowerCase() === "online";
const timeLabel = isOnlineQuiz ? "Ngày làm" : "Hết hạn";
    return (
        <div className="p-4 border border-secondary-200 rounded-xl bg-white shadow-md flex items-center justify-between hover:border-primary-400 transition-all">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                <BookOpen className="w-8 h-8 text-primary-500 flex-shrink-0" />
                <div className="min-w-0">
                    <h3 className="font-bold text-lg text-secondary-900 truncate">
                        {report.Title}
                    </h3>

                    {/* STATUS BADGE */}
                    <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(
                            status
                        )}`}
                    >
                        {status}
                    </span>

                    <p className="text-sm text-secondary-600 flex items-center space-x-2 mt-1">
                        <Users className="w-4 h-4" />
                        <span>{report.GroupName}</span>
                    </p>

                    
                </div>
            </div>

            <div className="flex items-center space-x-6 flex-shrink-0">

                {/* Lượt làm bài */}
                <div className="text-center">
                    <p className="text-xs text-secondary-500">Lượt làm bài</p>
                    <p className="font-bold text-xl text-primary-600">
                        {report.TotalAttempts}
                    </p>
                </div>

                {/* Hết hạn */}
                <div className="text-center">
                    <p className="text-xs text-secondary-500">{timeLabel}</p>
                    <p className="font-bold text-sm text-secondary-700 whitespace-nowrap">
                        {formatDate(expiredTime ?? undefined)}
                    </p>

                    
                </div>

                <Button size="sm" onClick={onViewDetail}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Xem chi tiết
                </Button>
            </div>
        </div>
    );
};
