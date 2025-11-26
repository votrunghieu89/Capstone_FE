import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";

// Type to include "all"
export type QuizReportType = "all" | "online" | "offline";

// Interfaces
interface QuizDetailReport { }

interface QuizReportItem {
    quizzId: number;
    quizTitle: string;
    totalQuestions: number;
    reportReports: QuizDetailReport[];
    status: string;
    endTime: string | null;
    totalParticipants: number;
    reportName: string;
    offlineReportId: number;
}

interface GroupReport {
    groupId: number;
    groupName: string;
    quizzes: QuizReportItem[];
}

// Type for frontend display
export interface TeacherQuizReportFlat {
    QuizId: number;
    OfflineReportId: number;
    Title: string;
    GroupName: string;
    GroupId: number;
    TotalQuestions: number;
    TotalAttempts: number;
    Type: QuizReportType;
    Status: string;
    EndTime: string | null;
    reportName: string;
}

// 🟦 FLATTEN OFFLINE REPORTS (giữ nguyên)
const flattenReports = (rawData: any[], type: QuizReportType): TeacherQuizReportFlat[] => {
    if (!Array.isArray(rawData)) return [];

    const flatReports: TeacherQuizReportFlat[] = [];

    rawData.forEach((group: GroupReport) => {
        if (group.quizzes) {
            group.quizzes.forEach(quiz => {
                flatReports.push({
                    QuizId: quiz.quizzId,
                    OfflineReportId: quiz.offlineReportId,
                    Title: quiz.reportName,
                    GroupName: group.groupName,
                    GroupId: group.groupId,
                    TotalQuestions: quiz.totalQuestions,
                    TotalAttempts: quiz.totalParticipants ?? 0,
                    Type: type,
                    Status: quiz.status ?? "Unknown",
                    EndTime: quiz.endTime ?? null,
                    reportName: quiz.reportName ?? "",
                });
            });
        }
    });

    return flatReports;
};

// 🟩 MAPPER ONLINE REPORTS (thêm mới)
const mapOnlineReports = (raw: any[]): TeacherQuizReportFlat[] => {
    if (!Array.isArray(raw)) return [];

    return raw.map(item => ({
        QuizId: item.quizId,
        OfflineReportId: item.onlineReportId, // dùng ID này khi xem detail....
        Title: item.reportName ?? "Online Quiz",
        GroupName: "Online Quiz",
        GroupId: 0,
        TotalQuestions: 0,
        TotalAttempts: item.totalParticipants ?? 0,
        Type: "online",
        Status: "Completed",
        EndTime: item.createdAt ?? null,
        reportName: item.reportName
    }));
};

// 🟧 MAIN FETCH
const fetchTeacherReports = async (
    teacherId: number,
    type: QuizReportType
): Promise<TeacherQuizReportFlat[]> => {
    if (teacherId === 0) return [];

    // ALL → gộp online + offline
    if (type === "all") {
        const [onlineResponse, offlineResponse] = await Promise.all([
            apiClient.get(`/TeacherReport/online/quiz-reports/${teacherId}`),
            apiClient.get(`/TeacherReport/offline/quiz-reports/${teacherId}`),
        ]);

        const onlineRaw =  (onlineResponse as any).data;
        const offlineRaw =  (offlineResponse as any).data;

        const online = mapOnlineReports(onlineRaw);
        const offline = flattenReports(offlineRaw, "offline");

        return [...online, ...offline];
    }

    // ONLINE —> dùng mapper riêng
    if (type === "online") {
        const res = await apiClient.get(`/TeacherReport/online/quiz-reports/${teacherId}`);
        const rawData = (res as any).data || res;
        return mapOnlineReports(rawData);
    }

    // OFFLINE —> dùng flatten
    const endpoint = `/TeacherReport/${type}/quiz-reports/${teacherId}`;
    const response = await apiClient.get(endpoint) as any;
    const rawData = response.data || response;

    return flattenReports(rawData, type);
};

// Hook
export const useGetTeacherReports = (teacherId: number, type: QuizReportType) => {
    return useQuery<TeacherQuizReportFlat[]>({
        queryKey: ['teacherReports', teacherId, type],
        queryFn: () => fetchTeacherReports(teacherId, type),
        enabled: teacherId > 0,
    });
};
