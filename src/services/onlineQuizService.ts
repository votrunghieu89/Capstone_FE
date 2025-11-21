import { apiClient } from "../libs/apiClient";

export interface OnlineAnswerPayload {
  roomCode: string;
  studentId: string;
  quizId: number;
  questionId: number;
  optionId: number | null;
}

class OnlineQuizService {
  async cacheQuizQuestions(quizId: number) {
    return apiClient.get(`/Quiz/GetQuestionOfQuizCache/${quizId}`);
  }

  async submitOnlineAnswer(payload: OnlineAnswerPayload) {
    return apiClient.post("/OnlineQuiz/CheckOnlineAnswer", payload);
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

