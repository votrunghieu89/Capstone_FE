// Student Profile Types
export interface StudentProfile {
  studentId: number;
  fullName: string;
  avatarURL?: string;
  idUnique: string;
  createAt?: string;
  updateAt?: string;
}

export interface StudentProfileUpdateRequest {
  studentId: number;
  fullName: string;
  formFile: File;
}

// Teacher Profile Types
export interface TeacherProfile {
  teacherId: number;
  fullName: string;
  phoneNumber?: string;
  avatarURL?: string;
  idUnique: string;
  organizationName?: string;
  organizationAddress?: string;
  createAt?: string;
  updateAt?: string;
}

export interface TeacherProfileUpdateRequest {
  teacherId: number;
  fullName: string;
  phoneNumber?: string;
  organizationName?: string;
  organizationAddress?: string;
  formFile: File;
}

// API Response Types
export interface GetProfileResponse<T> {
  message: string;
  profile: T;
}
