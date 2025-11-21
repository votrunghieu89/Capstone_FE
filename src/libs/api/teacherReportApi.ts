import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

// 💡 Cập nhật Type để bao gồm "all"
export type QuizReportType = "all" | "online" | "offline"; 

// --- INTERFACES (Giữ nguyên hoặc đơn giản hóa) ---

interface QuizDetailReport {
    // Không cần định nghĩa chi tiết ở đây
}

interface QuizReportItem {
    quizId: number;
    quizTitle: string;
    totalQuestions: number;
    reportReports: QuizDetailReport[];
}

interface GroupReport {
    groupId: number;
    groupName: string;
    quizzes: QuizReportItem[];
}

// 💡 Type cuối cùng cần hiển thị trên frontend
export interface TeacherQuizReportFlat {
    QuizId: number;
    Title: string;
    GroupName: string;
    GroupId: number;
    TotalQuestions: number;
    TotalAttempts: number;
    Type: QuizReportType; // Bắt buộc phải có để phân biệt Online/Offline
}

// --- HÀM HELPER: LÀM PHẲNG DỮ LIỆU ---

const flattenReports = (rawData: any[], type: QuizReportType): TeacherQuizReportFlat[] => {
    // Nếu dữ liệu rỗng hoặc không phải mảng, trả về mảng rỗng để tránh lỗi
    if (!Array.isArray(rawData)) return [];

    const flatReports: TeacherQuizReportFlat[] = [];

    rawData.forEach((group: GroupReport) => {
        if (group.quizzes) {
            group.quizzes.forEach(quiz => {
                flatReports.push({
                    QuizId: quiz.quizId,
                    Title: quiz.quizTitle,
                    GroupName: group.groupName,
                    GroupId: group.groupId,
                    TotalQuestions: quiz.totalQuestions,
                    // Giả định TotalAttempts là số lượng các báo cáo chi tiết có sẵn
                    TotalAttempts: quiz.reportReports?.length ?? 0, 
                    Type: type, // Gắn loại báo cáo vào
                });
            });
        }
    });

    return flatReports;
};

// --- HÀM CHÍNH: FETCH DỮ LIỆU ---

const fetchTeacherReports = async (teacherId: number, type: QuizReportType): Promise<TeacherQuizReportFlat[]> => {
    if (teacherId === 0) return [];
    
    // 🚀 BƯỚC 1: XỬ LÝ TRƯỜNG HỢP "ALL" (Trộn dữ liệu)
    if (type === "all") {
        
        try {
            // Gọi song song cả hai API
            const [onlineResponse, offlineResponse] = await Promise.all([
                apiClient.get(`/TeacherReport/online/quiz-reports/${teacherId}`),
                apiClient.get(`/TeacherReport/offline/quiz-reports/${teacherId}`),
            ]);

            // Trích xuất dữ liệu thô và làm phẳng
            const onlineReports = flattenReports((onlineResponse as any).data || onlineResponse, "online");
            const offlineReports = flattenReports((offlineResponse as any).data || offlineResponse, "offline");

            // Trộn hai mảng lại
            return [...onlineReports, ...offlineReports];

        } catch (error) {
            console.error("Error fetching combined reports:", error);
            // Ném lỗi để hook useQuery có thể bắt được và hiển thị Error State
            throw error; 
        }
    } 
    
    // 🚀 BƯỚC 2: XỬ LÝ TRƯỜNG HỢP "ONLINE" HOẶC "OFFLINE" (Fetch 1 API)
    
    // API: /api/TeacherReport/{online/offline}/quiz-reports/{teacherId}
    // Vì type ở đây chắc chắn là "online" hoặc "offline"
    const endpoint = `/TeacherReport/${type}/quiz-reports/${teacherId}`;

    const response = await apiClient.get(endpoint) as any;
    const rawData = response.data || response;

    return flattenReports(rawData, type);
};

// --- HOOK TÂN DỤNG (REUSE) ---

export const useGetTeacherReports = (teacherId: number, type: QuizReportType) => {
    return useQuery<TeacherQuizReportFlat[]>({
        // Khi type là "all", queryKey sẽ là 'teacherReports', ID, 'all'
        // Điều này đảm bảo khi chuyển từ 'online' sang 'all' hook sẽ fetch lại
        queryKey: ['teacherReports', teacherId, type], 
        queryFn: () => fetchTeacherReports(teacherId, type),
        enabled: teacherId > 0,
    });
};