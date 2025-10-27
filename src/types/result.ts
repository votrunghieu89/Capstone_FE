export interface OnlineResult {
  id: string;
  accountId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
}

export interface OfflineResult {
  id: string;
  accountId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
}

export interface QuestionStats {
  id: string;
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number;
  lastUpdated: Date;
}

export interface QuizHistory {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
}
