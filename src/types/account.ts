export interface Account {
  id: string;
  email: string;
  password: string;
  role: 'Admin' | 'Teacher' | 'Student';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  id: string;
  accountId: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: string;
  accountId: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'Teacher' | 'Student';
  fullName: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}
