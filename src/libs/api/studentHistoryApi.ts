// src/libs/api/studentHistoryApi.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../apiClient'; 
import { QuizHistory, QuizDetail } from '../../types/quiz'; 

const mapQuizHistory = (item: any): QuizHistory => ({
    QuizId: item.quizId?.toString() ?? "",
    QuizTitle: item.quizTitle ?? "Không rõ",
    TotalQuestions: item.totalQuestions ?? 0,
    CompletedAt: item.completedAt ?? "",

    CreatedBy: item.createBy ?? "",
    CompletedBy: item.completedBy ?? "",

    AvatarURL: item.avatarURL ?? null,
    GroupName: item.groupName ?? null,

    // FE thêm
    score: item.finalScore ?? 0,
    maxScore: item.maxScore ?? 0,
    correctAnswers: item.correctAnswers ?? 0,
    timeSpent: item.timeSpent ?? 0,
    topic: item.topic,
    difficulty: item.difficulty,
    class: item.class,
    teacher: item.teacher,
    creatAt:item.creatAt,
});
const fetchRawData = async (url: string): Promise<any> => {
    try {
        const res = await apiClient.get(url);
        console.log("🔥 RAW API RESPONSE FOR URL:", url);
        console.log(JSON.stringify(res, null, 2));
        return res; // Giả định apiClient trả về data thuần
    } catch (error: any) {
        // Xử lý lỗi 404 (Không tìm thấy dữ liệu) bằng cách trả về mảng rỗng
        if (error.response?.status === 404) {
            console.log(`Data not found, returning empty array for: ${url}`);
            return [];
        }
        throw error;
    }
};

// Hàm lấy Quiz Homepage (Public)
const fetchPublicQuizzes = async (studentId: number): Promise<QuizHistory[]> => {
    const publicUrl = `/StudentReport/public-quizzes/${studentId}`;
    let publicRes = await fetchRawData(publicUrl);
    console.log("🔥 RAW PUBLIC QUIZ API:", publicRes);

    return publicRes.map((q: any) => ({
        ...mapQuizHistory(q),
        GroupName: null, // public quiz không có lớp
    }));
};
// Hàm lấy Quiz Nhóm lớp (Private)
const fetchPrivateQuizzes = async (studentId: number): Promise<QuizHistory[]> => {
    const privateUrl = `/StudentReport/private-quizzes/${studentId}`;
    let privateRes = await fetchRawData(privateUrl);
    console.log("🔥 RAW PRIVATE QUIZ API:", privateRes);

    return privateRes.map((q: any) => ({
        ...mapQuizHistory(q),
        GroupName: q.groupName ?? "Nhóm lớp",
    }));
};

/**
 * Hook gọi và gộp Public và Private Quizzes
 */
export const useGetStudentHistory = (studentId: number, filterType: 'all' | 'public' | 'private') => {
    return useQuery({
        queryKey: ['studentHistory', studentId, filterType],
        queryFn: async () => {
            let publicRes: QuizHistory[] = [];
            
            let privateRes: QuizHistory[] = [];

            // 🛑 LỌC LOGIC 🛑
            const fetchPromises: Promise<any>[] = [];
            
            if (filterType === 'public' || filterType === 'all') {
                fetchPromises.push(fetchPublicQuizzes(studentId));
            }
            
            if (filterType === 'private' || filterType === 'all') {
                fetchPromises.push(fetchPrivateQuizzes(studentId));
            }

            const results = await Promise.all(fetchPromises);

            // Gán kết quả vào biến tương ứng
            if (filterType === 'all') {
                publicRes = results[0] || [];
                privateRes = results[1] || [];
            } else if (filterType === 'public') {
                publicRes = results[0] || [];
            } else if (filterType === 'private') {
                privateRes = results[0] || [];
            }
            
            const allHistory = [...publicRes, ...privateRes] as QuizHistory[];
            console.log("📌 MAPPED HISTORY:", allHistory);

            // Sắp xếp theo ngày hoàn thành (mới nhất lên trước)
            return allHistory.sort((a, b) => new Date(b.CompletedAt).getTime() - new Date(a.CompletedAt).getTime());
        },
        enabled: !!studentId,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hàm fetch chi tiết kết quả Quiz
 */
const fetchQuizDetail = async (studentId: number, quizId: string, createAt: string): Promise<QuizDetail> => {
    
    const url = `/StudentReport/quiz-detail/${studentId}/${quizId}?createAt=${createAt}`; 
    
    // Giả định BE trả về object QuizDetail, không phải mảng
    const res = await apiClient.get<QuizDetail>(url); 
    return res as QuizDetail; 
};


/**
 * Hook lấy chi tiết kết quả Quiz của một học sinh
 */
export const useGetQuizDetail = (studentId: number, quizId: string, completedAt: string) => {
    // Tên param là completedAt, nhưng truyền vào hàm fetch với tên createAt (như BE yêu cầu)
    const createAt = completedAt.split('T')[0]; // Lấy phần ngày YYYY-MM-DD
    
    return useQuery({
        queryKey: ['quizDetail', studentId, quizId, createAt],
        queryFn: () => fetchQuizDetail(studentId, quizId, createAt), 
        enabled: !!studentId && !!quizId && !!createAt,
        staleTime: Infinity, 
    });
};