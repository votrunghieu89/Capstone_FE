import { apiClient } from "../apiClient";
import type {
  LoginRequest,
  LoginResponse,
  RegisterStudentRequest,
  RegisterTeacherRequest,
} from "../../types/account";

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>("/Auth/login", credentials);
  },

  /**
   * Register new student
   */
  async registerStudent(
    data: RegisterStudentRequest
  ): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(
      "/Auth/registerStudent",
      data
    );
  },

  /**
   * Register new teacher
   */
  async registerTeacher(
    data: RegisterTeacherRequest
  ): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(
      "/Auth/registerTeacher",
      data
    );
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return await apiClient.post<{ accessToken: string }>("/Auth/accessToken", {
      refreshToken,
    });
  },

  /**
   * Check if email exists and send OTP
   */
  async checkEmail(
    email: string
  ): Promise<{ message: string; accountId: number }> {
    return await apiClient.post<{ message: string; accountId: number }>(
      "/Auth/checkEmail",
      JSON.stringify(email),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },

  /**
   * Verify OTP for password reset
   */
  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/Auth/verifyOTP", {
      email,
      otp,
    });
  },

  /**
   * Reset password using OTP
   */
  async resetPasswordOTP(
    accountId: number,
    passwordReset: string
  ): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/Auth/resetPasswordOTP", {
      accountId,
      passwordReset,
    });
  },

  /**
   * Change password (requires old password)
   */
  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>("/Auth/changePassword", {
      email,
      oldPassword,
      newPassword,
    });
  },

  /**
   * Logout user
   */
  async logout(accountId: number): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(
      `/Auth/logout/${accountId}`,
      {}
    );
  },

  /**
   * Get new access token using refresh token
   */
  async getNewAccessToken(
    accountId: number,
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    return await apiClient.post<{ accessToken: string }>("/Auth/accessToken", {
      accountId,
      refreshToken,
    });
  },

  /**
   * Google login for student
   */
  async googleLoginStudent(idToken: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>("/Auth/googleLoginStudent", {
      idToken,
    });
  },

  /**
   * Google login for teacher
   */
  async googleLoginTeacher(idToken: string): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>("/Auth/googleLoginTeacher", {
      idToken,
    });
  },

  /**
   * Check database connection
   */
  async checkDb(): Promise<{ message: string }> {
    return await apiClient.get<{ message: string }>("/Connection/check-db");
  },
};
