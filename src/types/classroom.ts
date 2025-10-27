export interface Group {
  groupId: number;            // PK
  groupName: string;
  groupDescription?: string;
  teacherId: number;          // FK -> TeacherProfile/Accounts
  idUnique: string;           // mã tham gia lớp
  createdAt: string;
}

export interface StudentGroup {
  id: number;
  studentId: number;
  groupId: number;
  joinedAt: string;
}

export interface CreateGroupRequest {
  groupName: string;
  groupDescription?: string;
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
  groupId: number;
}

export interface AddStudentsRequest {
  groupId: number;
  studentIds: number[];
}

export interface AddQuizzesRequest {
  groupId: number;
  quizIds: number[];
}
