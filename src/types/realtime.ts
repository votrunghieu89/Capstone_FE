export interface HostSession {
  id: string;
  quizId: string;
  pinCode: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'ended';
  currentQuestionId?: string;
  startedAt?: Date;
  endedAt?: Date;
}

export interface PlayerSession {
  id: string;
  sessionId: string;
  nickname: string;
  socketId: string;
  score: number;
  joinedAt: Date;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  rank: number;
  studentId?: string;
}

export interface JoinSessionRequest {
  pinCode: string;
  nickname: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  optionId: string;
  timeSpent: number;
}

export const ONLINE_SESSION_STORAGE_KEY = "online_session";
export const HOST_LIVE_SESSION_STORAGE_KEY = "host_live_context";
export const HOST_RESULTS_SESSION_STORAGE_KEY = "host_results_context";

export interface OnlineSessionContext {
  mode: "online";
  roomCode: string;
  quizId: number;
  studentId: string;
  studentName: string;
}

export interface HostLiveContext {
  roomCode: string;
  quizId: number;
  totalQuestions?: number | null;
}

export interface HostResultsContext {
  roomCode: string;
  quizId: number;
  leaderboard: LeaderboardEntry[];
}

export interface StudentCompleteResult {
  studentName: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  rank: number;
  questions: StudentQuestionResult[];
  leaderboard?: LeaderboardEntry[];
}

export interface StudentQuestionResult {
  questionId: number;
  questionContent: string;
  isSkipped?: boolean;
  options: StudentOptionResult[];
}

export interface StudentOptionResult {
  optionId: number;
  optionContent: string;
  isCorrect: boolean;
  isSelectedWrong: boolean;
}