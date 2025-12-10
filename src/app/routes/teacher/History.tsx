import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { storage } from "../../../libs/storage";
import { TeacherReportCard } from "../../../components/common/TeacherReportCard"; // 💡 IMPORT CARD MỚI

// 💡 IMPORT HOOK VÀ TYPE MỚI
import { useGetTeacherReports, TeacherQuizReportFlat } from "../../../libs/api/teacherReportApi"; 

export default function TeacherHistory() {
    const navigate = useNavigate();
    // Giữ nguyên layout lọc
    const [filterType, setFilterType] = useState<"all" | "online" | "offline">("online");
    const [searchTerm, setSearchTerm] = useState("");

    const user = storage.getUser();
    const teacherId = user?.id; 

    const {
        data: reportsData,
        isLoading: reportsLoading,
        error: reportsError,
    } = useGetTeacherReports(teacherId ?? 0, filterType);

    const isLoading = reportsLoading;
    const error = reportsError;

    const reports: TeacherQuizReportFlat[] = reportsData || [];

    const filteredReports = useMemo(() => {
        if (!searchTerm) return reports;

        return reports.filter((report) =>
            report.Title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reports, searchTerm]);

    const handleViewDetail = (quizId: number, groupId: number) => {
        // Chuyển hướng đến trang chi tiết báo cáo, cần truyền cả GroupId/QuizId
        navigate(`/teacher/report/detail?quizId=${quizId}&groupId=${groupId}&type=${filterType}`);
    };

    return (
        <div className="w-full">
            {/* ... (Phần Header, Input, Buttons giữ nguyên) ... */}
            
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">📊Lịch sử Quiz</h1>
                    <p className="text-secondary-600">Xem báo cáo chi tiết về các quiz của bạn</p>
                </div>
            </div>

            <div className="mb-6 flex space-x-4">
                
                <Button variant={filterType === "online" ? "primary" : "outline"} onClick={() => setFilterType("online")}>Quiz Online</Button>
                <Button variant={filterType === "offline" ? "primary" : "outline"} onClick={() => setFilterType("offline")}>Quiz Offline</Button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium">Lỗi tải dữ liệu:</p>
                    <p className="text-red-600">{(error as any)?.message ?? String(error)}</p>
                </div>
            )}

            {/* Kết quả */}
            {!isLoading && !error && filteredReports.length > 0 && (
                <div className="space-y-4">
                    {filteredReports.map((report) => (
                        <TeacherReportCard
                            key={`${report.QuizId}-${report.OfflineReportId}-${report.GroupId}`}
                            report={report}
                            //onViewDetail={() => handleViewDetail(report.QuizId, report.GroupId)}
                            /*onViewDetail={() =>
                                navigate(
                                    `/teacher/reports/offline/${report.QuizId}/${report.OfflineReportId}/${report.GroupId}`
                                )
                            }*/
                           onViewDetail={() => {
                            if (report.Type === "online") {
                                // navigate đến trang xem chi tiết online
                                navigate(
                                    `/teacher/reports/online/${report.QuizId}/${report.OfflineReportId}`
                                );
                            } else {
                                // navigate đến trang xem chi tiết offline
                                navigate(
                                    `/teacher/reports/offline/${report.QuizId}/${report.OfflineReportId}/${report.GroupId}`
                                );
                            }
                        }}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && reports.length === 0 && (
                <div className="text-center py-20">
                    <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có dữ liệu báo cáo nào cho loại hình này.</p>
                </div>
            )}
        </div>
    );
}