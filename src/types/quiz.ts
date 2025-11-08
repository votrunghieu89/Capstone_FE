export interface Quiz {
  quizId: number;
  title: string;
  description?: string;
  topicId: number;
  isPrivate: boolean;
  numberPlays: number;
  avatarUrl?: string;
  teacherId: number;
  folderId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Topic {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface QuizFolder {
  id: number;
  folderName: string;
  parentFolderId?: number;
  teacherId: number;
  createdAt: string;
}

export interface QuizGroup {
  id: number;
  quizId: number;
  groupId: number;
  createdAt: string;
}

export interface QuizFavourite {
  id: number;
  accountId: number;
  quizId: number;
  createdAt: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  topicId: number;
  isPrivate: boolean;
  avatarUrl?: string;
  folderId?: number;
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {
  quizId: number;
}

// Interface for Quiz in Group (from API response)
export interface DeliveredQuiz {
  quizId: number;
  avatarURL: string;
  totalQuestions: number;
}

export interface QuizInGroup {
  qgId: number;
  deliveredQuiz: DeliveredQuiz;
  title: string;
  teacherName: string;
  dateCreated: string;
  expiredDate: string;
  message: string;
}

export interface QuizGroup_API {
  groupId: number;
  teacherId: number;
  groupName: string;
  groupDescription: string;
  idUnique: string;
  createAt: string;
  quizzes: QuizInGroup[];
}
export interface QuizHistory {
    QuizId: string; // ID thật từ BE
    QuizTitle: string; // Tên Quiz
    TotalQuestions: number; // Tổng số câu hỏi
    CompletedAt: string; // Ngày hoàn thành

    // 💡 TRƯỜNG PHÂN BIỆT VAI TRÒ 💡
    CreatedBy: string; // Tên NGƯỜI TẠO (Giáo viên)
    CompletedBy?: string; // Tên NGƯỜI HOÀN THÀNH (Học sinh)

    // Các trường API khác
    AvatarURL?: string | null;
    GroupName?: string | null; // Tên nhóm (Fix lỗi GroupName)

    // 💡 TRƯỜNG FE/UI BỔ SUNG (Giữ lại tên camelCase)
    topic?: string; // Tạm dùng cho lọc
    score: number;
    maxScore: number;
    correctAnswers: number;
    timeSpent: number;
    difficulty?: "Easy" | "Medium" | "Hard";
    class?: string; // Tên lớp (cho nhóm lớp)
    teacher?: string; // Tên người tạo
}

// ----------------------------------------------------
// INTERFACE CHI TIẾT KẾT QUẢ (Dùng trong QuizDetail.tsx)
// ----------------------------------------------------
export interface QuizDetail {
    // 🛑 DỮ LIỆU CHÍNH TỪ API 🛑
    QuizTitle: string;
    NumberOfCorrectAnswers: number;
    NumberOfWrongAnswers: number;
    TotalQuestions: number;
    FinalScore: number; // Điểm số
    Rank: number; // Xếp hạng
    StartDate: string;
    CompletedAt: string;
    CreatedBy: string; // Tên Người Tạo
    
    // 🛑 TRƯỜNG CỦA HỌC SINH ĐANG XEM 🛑
    CompletedBy: string; // Tên Người Hoàn thành (Học sinh)

    // Chi tiết câu hỏi
    QuestionDetails: QuestionDetails[]; // Hoặc Questions: QuestionDetails[]
    
    // Nếu API có trả về Participants, bạn cần thêm Participants: any[];
}
export interface QuestionDetails {
    id: string;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    options: string[];
    // Thêm các trường khác nếu BE trả về (ví dụ: QuestionName, AnswerName)
}