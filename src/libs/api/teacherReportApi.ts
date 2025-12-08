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
    qgId?: number; // optional in BE raw item
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
    qgId: number; // keep for offline-check
}

// call backend check-expired (sends qgId as required by swagger)
export const checkQuizExpired = async (quizId: number, qgId: number) => {
    const res = await apiClient.post("/TeacherReport/check-expired", {
        quizId,
        qgId
    });
    return res;
};
const flattenReports = async (rawData: any[], type: QuizReportType): Promise<TeacherQuizReportFlat[]> => {
    if (!Array.isArray(rawData)) return [];

    const flatReports: TeacherQuizReportFlat[] = rawData.flatMap((group: GroupReport) =>
        group.quizzes?.map((quiz) => ({
            QuizId: quiz.quizzId,
            OfflineReportId: quiz.offlineReportId,
            Title: quiz.reportName,
            GroupName: group.groupName,
            GroupId: group.groupId,
            TotalQuestions: quiz.totalQuestions,
            TotalAttempts: quiz.totalParticipants ?? 0,
            Type: type,
            Status: "Pending",              
            EndTime: quiz.endTime ?? null,
            reportName: quiz.reportName ?? "",
            qgId: (quiz as any).qgId,
        })) ?? []
    );

    // 🔥 Chỉ offline mới check expired
    const updated = await Promise.all(
        flatReports.map(async (item) => {
            if (item.Type === "offline") {
                try {
                    const res: any = await checkQuizExpired(item.QuizId, item.qgId);

                    item.Status = res?.isExpired
                        ? "Completed"
                        : "Pending";
                } catch (err) {
                    console.error("check-expired error", err);
                }
            }
            return item;
        })
    );

    return updated; 
};

const mapOnlineReports = (raw: any[]): TeacherQuizReportFlat[] => {
    if (!Array.isArray(raw)) return [];

    return raw.map(item => ({
        QuizId: item.quizId,
        OfflineReportId: item.onlineReportId ?? 0, 
        Title: item.reportName ?? "Online Quiz",
        GroupName: "Online Quiz",
        GroupId: 0,
        TotalQuestions: 0,
        TotalAttempts: item.totalParticipants ?? 0,
        Type: "online",
        Status: item.status ?? "Completed",
        EndTime: item.createdAt ?? null,
        reportName: item.reportName ?? "",
        qgId: item.qgId ?? 0 
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

        const onlineRaw = (onlineResponse as any).data ?? [];
        const offlineRaw = (offlineResponse as any).data ?? [];

        const online = mapOnlineReports(onlineRaw);
        const offline = await flattenReports(offlineRaw, "offline");

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

    return await flattenReports(rawData, type);
};

// Hook
export const useGetTeacherReports = (teacherId: number, type: QuizReportType, refreshCounter: number = 0) => {
    return useQuery<TeacherQuizReportFlat[]>({
        queryKey: ['teacherReports', teacherId, type, refreshCounter],
        queryFn: () => fetchTeacherReports(teacherId, type),
        enabled: teacherId > 0,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false
    });
};
