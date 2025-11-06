import { apiClient } from "../apiClient";
import type {
  StudentProfile,
  TeacherProfile,
  GetProfileResponse,
} from "../../types/profile";

export const profileApi = {
  /**
   * Get student profile by ID
   */
  async getStudentProfile(
    studentId: number
  ): Promise<GetProfileResponse<StudentProfile>> {
    return await apiClient.get<GetProfileResponse<StudentProfile>>(
      `/StudentProfile/getStudentProfile/${studentId}`
    );
  },

  /**
   * Update student profile
   */
  async updateStudentProfile(
    studentId: number,
    fullName: string,
    avatar?: File
  ): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("StudentId", studentId.toString());
    formData.append("FullName", fullName);
    if (avatar) {
      formData.append("FormFile", avatar);
    }

    return await apiClient.post<{ message: string }>(
      "/StudentProfile/updateStudentProfile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  /**
   * Get teacher profile by ID
   */
  async getTeacherProfile(
    teacherId: number
  ): Promise<GetProfileResponse<TeacherProfile>> {
    return await apiClient.get<GetProfileResponse<TeacherProfile>>(
      `/TeacherProfile/getTeacherProfile/${teacherId}`
    );
  },

  /**
   * Update teacher profile
   */
  async updateTeacherProfile(
    teacherId: number,
    fullName: string,
    phoneNumber?: string,
    organizationName?: string,
    organizationAddress?: string,
    avatar?: File
  ): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("TeacherId", teacherId.toString());
    formData.append("FullName", fullName);
    if (phoneNumber) formData.append("PhoneNumber", phoneNumber);
    if (organizationName) formData.append("OrganizationName", organizationName);
    if (organizationAddress)
      formData.append("OrganizationAddress", organizationAddress);
    if (avatar) {
      formData.append("FormFile", avatar);
    }

    return await apiClient.post<{ message: string }>(
      "/TeacherProfile/updateTeacherProfile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};
