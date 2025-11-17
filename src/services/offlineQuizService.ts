import { apiClient } from "../libs/apiClient";

// ============ TYPES (theo BE DTO) ============

export interface StartOfflineQuizDTO {
  StudentId: number;
  QGId?: number | null;
  QuizId: number;
  StartTime: string; // ISO string
}

export interface StudentAnswerSubmissionDTO {
  StudentId: number;
  QuizId: number;
  QGId?: number | null;
  QuestionId: number;
  SelectedOptionId?: number | null;
}

export interface FinishOfflineQuizDTO {
  StudentId: number;
  QGId?: number | null;
  QuizId: number;
  EndTime: string; // ISO string
}

export interface OfflineResultViewDTO {
  quizId: number;
  quizTitle: string;
  countAttempts: number;
  maxAttempts: number;
  correctCount: number;
  wrongCount: number;
  totalQuestion: number;
  score: number;
  rank?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  duration: number;
}

export interface OptionResultDTO {
  optionId: number;
  optionContent: string;
  isCorrect: boolean;
}

export interface QuestionResultDTO {
  questionId: number;
  questionContent: string;
  selectedOptionId?: number | null;
  correctOptionId: number;
  options: OptionResultDTO[];
}

export interface OfflineResultDetailViewDTO {
  quizId: number;
  quizTitle: string;
  countAttempts: number;
  maxAttempts: number;
  correctCount: number;
  wrongCount: number;
  totalQuestion: number;
  score: number;
  rank?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  duration: number;
  questionDetails: QuestionResultDTO[];
}

// ============ OFFLINE QUIZ SERVICE ============

class OfflineQuizService {
  /**
   * Bắt đầu làm quiz offline
   * POST /api/OfflineQuiz/start
   */
  async startQuiz(dto: StartOfflineQuizDTO): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/OfflineQuiz/start",
      dto
    );
    return response;
  }

  /**
   * Gửi đáp án của một câu hỏi
   * POST /api/OfflineQuiz/answer
   */
  async submitAnswer(
    dto: StudentAnswerSubmissionDTO
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/OfflineQuiz/answer",
      dto
    );
    return response;
  }

  /**
   * Nộp bài quiz
   * POST /api/OfflineQuiz/submit
   */
  async submitQuiz(dto: FinishOfflineQuizDTO): Promise<OfflineResultViewDTO> {
    const response = await apiClient.post<OfflineResultViewDTO>(
      "/OfflineQuiz/submit",
      dto
    );
    return response;
  }

  /**
   * Lấy kết quả chi tiết quiz offline
   * GET /api/OfflineQuiz/result/{studentId}/{quizId}?qgId={qgId}
   */
  async getResult(
    studentId: number,
    quizId: number,
    qgId?: number | null
  ): Promise<OfflineResultDetailViewDTO> {
    let url = `/OfflineQuiz/result/${studentId}/${quizId}`;
    if (qgId) {
      url += `?qgId=${qgId}`;
    }
    const response = await apiClient.get<OfflineResultDetailViewDTO>(url);
    return response;
  }
}

export const offlineQuizService = new OfflineQuizService();




