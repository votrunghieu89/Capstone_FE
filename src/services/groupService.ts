import { apiClient } from "../libs/apiClient";

// ===== TYPES MATCHING BE DTOs =====

// Response types
export interface AllGroupDTO {
  groupId: number;
  groupName: string;
}

export interface ViewStudentDTO {
  studentId: number;
  idUnique: string;
  fullName: string;
  email: string;
  avatarURL?: string;
  dateJoined: string;
  permission: string;
}

export interface ViewQuizDTO {
  qgId: number;
  quizId: number;
  deliveredQuiz?: {
    quizId: number;
    avatarURL?: string;
    totalQuestions?: number;
  };
  title: string;
  teacherName: string;
  dateCreated: string;
  expiredDate: string;
  message: string;
  avatarURL?: string;
  totalQuestions?: number;
  maxAttempts?: number;
  isCompleted?: boolean; // Student has completed this quiz
  studentScore?: number; // Student's score if completed
}

export interface GroupDetailResponse {
  groupId: number;
  teacherId: number;
  groupName: string;
  groupDescription: string;
  idUnique: string;
  createAt: string;
  quizzes: ViewQuizDTO[];
}

// Request types (match BE DTO naming - PascalCase)
export interface CreateGroupRequest {
  TeacherId: number;
  GroupName: string;
  GroupDescription?: string;
}

export interface UpdateGroupRequest {
  GroupId: number;
  GroupName: string;
  GroupDescription?: string;
}

export interface InsertQuizRequest {
  QuizId: number;
  TeacherId: number;
  GroupId: number;
  Message?: string;
  ExpiredTime: string; // DateTime - required in BE
  MaxAttempts: number; // Required in BE
}

class GroupService {
  private baseUrl = "/Group";

  // ===== GET METHODS =====

  /**
   * Get all groups by teacher ID
   * GET /api/Group/GetGroupByTeacherId/{teacherId}
   */
  async getGroupsByTeacherId(teacherId: number): Promise<AllGroupDTO[]> {
    const response = await apiClient.get<AllGroupDTO[]>(
      `${this.baseUrl}/GetGroupByTeacherId/${teacherId}`
    );
    console.log("API Response for getGroupsByTeacherId:", response); // Debug log
    return response;
  }

  /**
   * Get group detail with quizzes
   * GET /api/Group/GetGroupDetail/{groupId}
   */
  async getGroupDetail(groupId: number): Promise<GroupDetailResponse> {
    return apiClient.get<GroupDetailResponse>(
      `${this.baseUrl}/GetGroupDetail/${groupId}`
    );
  }

  /**
   * Get all students in a group
   * GET /api/Group/GetAllStudentsByGroupId/{groupId}
   */
  async getStudentsByGroupId(groupId: number): Promise<ViewStudentDTO[]> {
    return apiClient.get<ViewStudentDTO[]>(
      `${this.baseUrl}/GetAllStudentsByGroupId/${groupId}`
    );
  }

  // ===== POST METHODS =====

  /**
   * Create new group
   * POST /api/Group/createGroup
   */
  async createGroup(request: CreateGroupRequest): Promise<any> {
    return apiClient.post<any>(`${this.baseUrl}/createGroup`, request);
  }

  /**
   * Add student to group by IdUnique
   * POST /api/Group/insert-student?groupId={groupId}&IdUnique={idUnique}
   */
  async insertStudentToGroup(
    groupId: number,
    idUnique: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      `${this.baseUrl}/insert-student?groupId=${groupId}&IdUnique=${idUnique}`
    );
  }

  /**
   * Add quiz to group
   * POST /api/Group/InsertQuizToGroup
   */
  async insertQuizToGroup(request: InsertQuizRequest): Promise<any> {
    return apiClient.post<any>(`${this.baseUrl}/InsertQuizToGroup`, request);
  }

  // ===== PUT METHODS =====

  /**
   * Update group information
   * PUT /api/Group/updateGroup
   */
  async updateGroup(request: UpdateGroupRequest): Promise<UpdateGroupRequest> {
    return apiClient.put<UpdateGroupRequest>(
      `${this.baseUrl}/updateGroup`,
      request
    );
  }

  // ===== DELETE METHODS =====

  /**
   * Delete group
   * DELETE /api/Group/deleteGroup/{groupId}
   */
  async deleteGroup(groupId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.baseUrl}/deleteGroup/${groupId}`
    );
  }

  /**
   * Remove student from group
   * DELETE /api/Group/removeStudentFromGroup/{groupId}/{studentId}?teacherId={teacherId}
   */
  async removeStudentFromGroup(
    groupId: number,
    studentId: number,
    teacherId: number
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.baseUrl}/removeStudentFromGroup/${groupId}/${studentId}?teacherId=${teacherId}`
    );
  }

  /**
   * Remove quiz from group
   * DELETE /api/Group/RemoveQuizFromGroup/{groupId}/{quizId}
   */
  async removeQuizFromGroup(
    groupId: number,
    quizId: number
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.baseUrl}/RemoveQuizFromGroup/${groupId}/${quizId}`
    );
  }

  // ===== STUDENT METHODS =====

  /**
   * Get all groups by student ID
   * GET /api/Group/GetAllGroupsByStudentId/{studentId}
   */
  async getGroupsByStudentId(studentId: number): Promise<AllGroupDTO[]> {
    return apiClient.get<AllGroupDTO[]>(
      `${this.baseUrl}/GetAllGroupsByStudentId/${studentId}`
    );
  }

  /**
   * Join group by invite code
   * POST /api/Group/JoinGroupByInvite/{IdUnique}/{studentId}
   */
  async joinGroupByInvite(
    idUnique: string,
    studentId: number
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      `${this.baseUrl}/JoinGroupByInvite/${idUnique}/${studentId}`
    );
  }

  /**
   * Leave group
   * DELETE /api/Group/leaveGroup/{groupId}/{studentId}?teacherId={teacherId}
   */
  async leaveGroup(
    groupId: number,
    studentId: number,
    teacherId: number
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.baseUrl}/leaveGroup/${groupId}/${studentId}?teacherId=${teacherId}`
    );
  }
}

export const groupService = new GroupService();
