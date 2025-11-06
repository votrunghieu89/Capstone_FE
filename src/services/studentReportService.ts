// src/libs/services/studentReportService.ts
import { apiClient } from "../libs/apiClient";

// ================== TYPES ==================
export interface QuizSummary {
  quizId: number;
  quizName: string;
  score: number;
  createdAt: string;
}

export interface QuizDetail {
  quizId: number;
  quizName: string;
  totalScore: number;
  correctAnswers: number;
  createdAt: string;
}

// ================== SERVICE ==================
class StudentReportService {
  private baseUrl = "/StudentReport";

  // GET: /api/StudentReport/public-quizzes/{studentId}
  async getPublicQuizzes(studentId: number): Promise<QuizSummary[]> {
    return apiClient.get<QuizSummary[]>(
      `${this.baseUrl}/public-quizzes/${studentId}`
    );
  }

  // GET: /api/StudentReport/private-quizzes/{studentId}
  async getPrivateQuizzes(studentId: number): Promise<QuizSummary[]> {
    return apiClient.get<QuizSummary[]>(
      `${this.baseUrl}/private-quizzes/${studentId}`
    );
  }

  // GET: /api/StudentReport/quiz-detail?studentId=&quizId=&createAt=
  async getQuizDetailQuery(params: {
    studentId?: number;
    quizId?: number;
    createAt?: string;
  }): Promise<QuizDetail> {
    const query = new URLSearchParams();
    if (params.studentId) query.append("studentId", params.studentId.toString());
    if (params.quizId) query.append("quizId", params.quizId.toString());
    if (params.createAt) query.append("createAt", params.createAt);

    return apiClient.get<QuizDetail>(
      `${this.baseUrl}/quiz-detail?${query.toString()}`
    );
  }

  // GET: /api/StudentReport/quiz-detail/{studentId}/{quizId}?createAt=
  async getQuizDetailByPath(
    studentId: number,
    quizId: number,
    createAt?: string
  ): Promise<QuizDetail> {
    const query = createAt ? `?createAt=${encodeURIComponent(createAt)}` : "";
    return apiClient.get<QuizDetail>(
      `${this.baseUrl}/quiz-detail/${studentId}/${quizId}${query}`
    );
  }
}

export const studentReportService = new StudentReportService();
