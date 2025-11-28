import { apiClient } from "../libs/apiClient";
import { QuestionDetail } from "./quizService";

export interface OnlineAnswerPayload {
  roomCode: string;
  studentId: string;
  quizId: number;
  questionId: number;
  optionId: number | null;
}

export type OnlineAnswerResponse =
  | boolean
  | {
      isCorrect?: boolean | number | string;
      result?: boolean | number | string;
      data?: {
        isCorrect?: boolean | number | string;
        correctOptionId?: number;
        [key: string]: any;
      };
      correctOptionId?: number;
      correctAnswerId?: number;
      correctOption?: {
        optionId?: number;
      };
      [key: string]: any;
    };

class OnlineQuizService {
  async cacheQuizQuestions(quizId: number): Promise<QuestionDetail[]> {
    return apiClient.get<QuestionDetail[]>(`/Quiz/GetQuestionOfQuizCache/${quizId}`);
  }

  async submitOnlineAnswer(payload: OnlineAnswerPayload) {
    return apiClient.post<OnlineAnswerResponse>("/OnlineQuiz/CheckOnlineAnswer", payload);
  }

  async insertOnlineReport(roomCode: string | number) {
    return apiClient.post(
      `/OnlineQuiz/InsertOnlineReport`,
      null,
      {
        params: { roomCode },
      }
    );
  }
}

export const onlineQuizService = new OnlineQuizService();

