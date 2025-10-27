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
