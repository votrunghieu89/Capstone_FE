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
