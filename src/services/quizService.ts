import { apiClient } from "../libs/apiClient";

// ============ TYPES ============

export interface QuizDetailHP {
  quizId: number;
  title: string;
  description?: string;
  avatarURL?: string;
  totalParticipants?: number;
  totalQuestions?: number;
  createBy?: string;
  createdDate: string;
}

export interface QuestionDetail {
  questionId: number;
  questionType: string;
  questionContent: string;
  time: number;
  score: number;
  options: OptionDetail[];
}

export interface OptionDetail {
  optionId: number;
  optionContent: string;
  isCorrect: boolean;
}

export interface QuizDetailTeacher {
  quizId: number;
  title: string;
  description?: string;
  avatarURL?: string;
  totalParticipants?: number;
  totalQuestions?: number;
  createdDate: string;
  questions: QuestionDetail[];
}

export interface ViewAllQuizDTO {
  quizId: number;
  title: string;
  avatarURL: string;
  createdBy?: string;
  topicName: string;
  totalQuestions: number;
  totalParticipants: number;
}

// ============ QUIZ SERVICE ============

class QuizService {
  /**
   * Get quiz detail for homepage/preview (Student & Teacher)
   * GET /api/Quiz/getDetailOfAHomePageQuiz/{quizId}
   */
  async getQuizDetailHP(quizId: number): Promise<QuizDetailHP> {
    const response = await apiClient.get<QuizDetailHP>(
      `/Quiz/getDetailOfAHomePageQuiz/${quizId}`
    );
    return response;
  }

  /**
   * Get quiz detail with questions (Teacher only)
   * GET /api/Quiz/getDetailOfATeacherQuiz/{quizId}
   */
  async getQuizDetailTeacher(quizId: number): Promise<QuizDetailTeacher> {
    const response = await apiClient.get<QuizDetailTeacher>(
      `/Quiz/getDetailOfATeacherQuiz/${quizId}`
    );
    return response;
  }

  /**
   * Get all public quizzes with pagination
   * GET /api/Quiz/GetAllQuizzes
   */
  async getAllQuizzes(
    page: number,
    pageSize: number
  ): Promise<ViewAllQuizDTO[]> {
    const response = await apiClient.get<ViewAllQuizDTO[]>(
      `/Quiz/GetAllQuizzes`,
      {
        params: { page, pageSize },
      }
    );
    return response;
  }

  /**
   * Get questions of a quiz (cached)
   * GET /api/Quiz/GetQuestionOfQuizCache/{quizId}
   */
  async getQuizQuestions(quizId: number): Promise<QuestionDetail[]> {
    const response = await apiClient.get<QuestionDetail[]>(
      `/Quiz/GetQuestionOfQuizCache/${quizId}`
    );
    return response;
  }

  /**
   * Delete a quiz
   * DELETE /api/Quiz/deleteQuiz/{quizId}
   */
  async deleteQuiz(quizId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/Quiz/deleteQuiz/${quizId}`
    );
    return response;
  }
}

export const quizService = new QuizService();
