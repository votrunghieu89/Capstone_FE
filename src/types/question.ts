export interface Question {
  id: number;
  quizId: number;
  questionType: "MultipleChoice" | "TrueFalse";
  content: string;
  time?: number; // theo DB là Time (giây)
  points: number;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Option {
  id: number;
  questionId: number;
  content: string;
  isCorrect: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateQuestionRequest {
  quizId: number;
  questionType: "MultipleChoice" | "TrueFalse";
  content: string;
  time?: number;
  points: number;
  order: number;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: number;
}

export interface CreateOptionRequest {
  questionId: number;
  content: string;
  isCorrect: boolean;
  order: number;
}

export interface UpdateOptionRequest extends Partial<CreateOptionRequest> {
  id: number;
}
