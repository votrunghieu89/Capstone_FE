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
    endTime:string | null;
    totalParticipants: number;
    reportName: string;
    offlineReportId:number;
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
    Status:string;
    EndTime: string| null;
    reportName:string;
}

// Helper: Flatten data
const flattenReports = (rawData: any[], type: QuizReportType): TeacherQuizReportFlat[] => {
    if (!Array.isArray(rawData)) return [];

    const flatReports: TeacherQuizReportFlat[] = [];

    rawData.forEach((group: GroupReport) => {
        if (group.quizzes) {
            group.quizzes.forEach(quiz => {
                flatReports.push({
                    QuizId: quiz.quizzId,
                    OfflineReportId: quiz.offlineReportId,
                    Title: quiz.quizTitle,
                    GroupName: group.groupName,
                    GroupId: group.groupId,
                    TotalQuestions: quiz.totalQuestions,
                    TotalAttempts: quiz.totalParticipants ?? 0,
                    Type: type,
                    Status:quiz.status ?? "Unknown",
                    EndTime:quiz.endTime ?? null,
                    reportName:quiz.reportName ?? "",
                });
            });
        }
    });

    return flatReports;
};

// Main fetch function
const fetchTeacherReports = async (
    teacherId: number,
    type: QuizReportType
): Promise<TeacherQuizReportFlat[]> => {
    if (teacherId === 0) return [];

    if (type === "all") {
        try {
            const [onlineResponse, offlineResponse] = await Promise.all([
                apiClient.get(`/TeacherReport/online/quiz-reports/${teacherId}`),
                apiClient.get(`/TeacherReport/offline/quiz-reports/${teacherId}`),
            ]);

            const onlineReports = flattenReports((onlineResponse as any).data || onlineResponse, "online");
            const offlineReports = flattenReports((offlineResponse as any).data || offlineResponse, "offline");

            return [...onlineReports, ...offlineReports];
        } catch (error) {
            console.error("Error fetching combined reports:", error);
            throw error;
        }
    }

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


