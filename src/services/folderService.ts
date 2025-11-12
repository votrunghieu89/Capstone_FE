import { apiClient } from "../libs/apiClient";

// Types matching BE DTOs
export interface FolderType {
  folderId: number;
  folderName: string;
  parentFolderId: number | null;
  folders: FolderType[]; // Subfolders
}

export interface QuizInFolder {
  quizzId: number;
  title: string;
  avatarURL: string;
  totalQuestion: number;
  topicName: string;
  totalParticipants: number;
  teacherName: string;
}

export interface FolderDetailResponse {
  folderID: number;
  folderName: string;
  parentFolderID: number | null;
  quizzFolder: QuizInFolder[];
}

export interface CreateFolderRequest {
  teacherID: number;
  folderName: string;
  parentFolderID?: number | null;
}

export interface UpdateFolderRequest {
  folderId: number;
  folderName: string;
}

export interface MoveQuizRequest {
  quizId: number;
  folderId: number;
}

class FolderService {
  private baseUrl = "/TeacherFolder";

  // GET: Get all folders for a teacher
  async getAllFolders(teacherID: number): Promise<FolderType[]> {
    return apiClient.get<FolderType[]>(
      `${this.baseUrl}/getAllFolder?teacherID=${teacherID}`
    );
  }

  // GET: Get folder detail
  async getFolderDetail(
    teacherId: number,
    folderId: number
  ): Promise<FolderDetailResponse> {
    return apiClient.get<FolderDetailResponse>(
      `${this.baseUrl}/getFolderDetail?teacherId=${teacherId}&folderId=${folderId}`
    );
  }

  // POST: Create new folder
  async createFolder(data: CreateFolderRequest): Promise<{ message: string }> {
    const params = new URLSearchParams();
    params.append("teacherID", data.teacherID.toString());
    params.append("folderName", data.folderName);
    if (data.parentFolderID !== null && data.parentFolderID !== undefined) {
      params.append("parentFolderID", data.parentFolderID.toString());
    }

    return apiClient.post<{ message: string }>(
      `${this.baseUrl}/createFolder?${params.toString()}`
    );
  }

  // PUT: Update folder
  async updateFolder(data: UpdateFolderRequest): Promise<{ message: string }> {
    const params = new URLSearchParams();
    params.append("folderId", data.folderId.toString());
    params.append("folderName", data.folderName);

    return apiClient.put<{ message: string }>(
      `${this.baseUrl}/updateFolder?${params.toString()}`
    );
  }

  // PUT: Move quiz to another folder
  async moveQuizToFolder(data: MoveQuizRequest): Promise<{ message: string }> {
    const params = new URLSearchParams();
    params.append("quizId", data.quizId.toString());
    params.append("folderId", data.folderId.toString());

    return apiClient.put<{ message: string }>(
      `${this.baseUrl}/moveQuizToOtherFolder?${params.toString()}`
    );
  }

  // DELETE: Delete folder
  async deleteFolder(folderId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.baseUrl}/deleteFolder?folderId=${folderId}`
    );
  }

  async deleteQuiz(quizId: string): Promise<{ message: string }> {
        // ✅ CÁCH GỌI ĐÚNG VÀ TỐI ƯU: Chỉ định Controller/Action
        return apiClient.delete<{ message: string }>(
            `/Quiz/deleteQuiz/${quizId}` 
        );
    }
}

export const folderService = new FolderService();
