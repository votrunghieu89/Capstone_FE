// mockHistory.ts (Tạo file này để test)

export const MOCK_HISTORY_LIST = [
    {
        QuizId: 101, // ID này phải khớp với ID trong mock data chi tiết (nếu bạn đã mock)
        QuizTitle: "Kiểm tra Giải tích cơ bản",
        CorrectCount: 7,
        TotalQuestions: 10,
        FinalScore: 70,
        CompletedAt: "2024-10-25T09:15:00Z", 
        GroupName: "Nhóm lớp 12A1", 
        IsPublic: false,
        CreatedBy: "Teacher Anh", 
        maxScore: 100, 
        correctAnswers: 7, // Giống CorrectCount nếu cần
        timeSpent: 15,
    },
    {
        QuizId: 102,
        QuizTitle: "Tiếng Anh - Thì hiện tại đơn",
        CorrectCount: 9,
        TotalQuestions: 10,
        FinalScore: 90,
        CompletedAt: "2024-10-24T14:30:00Z",
        GroupName: null, 
        IsPublic: true,
        CreatedBy: "Teacher Anh",
        maxScore: 100,
        correctAnswers: 9,
        timeSpent: 8,
    },
];