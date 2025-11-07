import { apiClient } from "../apiClient";

// ==================== TYPES ====================
export interface AccountByRole {
  accountId: number;
  email: string;
  role: string;
  isActive: boolean;
  createAt: string;
}

export interface PaginatedAccountsResponse {
  accounts: AccountByRole[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export interface DashboardStats {
  totalAccounts: number;
  totalQuizzes: number;
  totalStudents: number;
  totalTeachers: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  count: number;
}

// ==================== ADMIN API ====================
export const adminApi = {
  // ========== DASHBOARD STATISTICS ==========

  /**
   * Lấy tổng số tài khoản
   * GET /api/Admin/getAccount
   */
  async getTotalAccounts(): Promise<number> {
    return await apiClient.get<number>("/Admin/getAccount");
  },

  /**
   * Lấy số tài khoản theo tháng
   * GET /api/Admin/getAccountByMonth/{month}/{year}
   */
  async getAccountsByMonth(month: number, year: number): Promise<number> {
    return await apiClient.get<number>(
      `/Admin/getAccountByMonth/${month}/${year}`
    );
  },

  /**
   * Lấy tổng số quiz
   * GET /api/Admin/getQuizzes
   */
  async getTotalQuizzes(): Promise<number> {
    return await apiClient.get<number>("/Admin/getQuizzes");
  },

  /**
   * Lấy số quiz theo tháng
   * GET /api/Admin/getQuizzesByMonth/{month}/{year}
   */
  async getQuizzesByMonth(month: number, year: number): Promise<number> {
    return await apiClient.get<number>(
      `/Admin/getQuizzesByMonth/${month}/${year}`
    );
  },

  /**
   * Lấy tổng số tài khoản học sinh
   * GET /api/Admin/getAccountStudent
   */
  async getTotalStudents(): Promise<number> {
    return await apiClient.get<number>("/Admin/getAccountStudent");
  },

  /**
   * Lấy số tài khoản học sinh theo tháng
   * GET /api/Admin/getAccountStudentByMonth/{month}/{year}
   */
  async getStudentsByMonth(month: number, year: number): Promise<number> {
    return await apiClient.get<number>(
      `/Admin/getAccountStudentByMonth/${month}/${year}`
    );
  },

  /**
   * Lấy tổng số tài khoản giáo viên
   * GET /api/Admin/getAccountTeacher
   */
  async getTotalTeachers(): Promise<number> {
    return await apiClient.get<number>("/Admin/getAccountTeacher");
  },

  /**
   * Lấy số tài khoản giáo viên theo tháng
   * GET /api/Admin/getAccountTeacherByMonth/{month}/{year}
   */
  async getTeachersByMonth(month: number, year: number): Promise<number> {
    return await apiClient.get<number>(
      `/Admin/getAccountTeacherByMonth/${month}/${year}`
    );
  },

  /**
   * Lấy tổng hợp tất cả thống kê dashboard (gọi song song nhiều API)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [totalAccounts, totalQuizzes, totalStudents, totalTeachers] =
      await Promise.all([
        adminApi.getTotalAccounts(),
        adminApi.getTotalQuizzes(),
        adminApi.getTotalStudents(),
        adminApi.getTotalTeachers(),
      ]);

    return {
      totalAccounts,
      totalQuizzes,
      totalStudents,
      totalTeachers,
    };
  },

  /**
   * Lấy dữ liệu biểu đồ quiz theo tháng (6 tháng gần nhất)
   */
  async getQuizMonthlyChart(year: number): Promise<MonthlyStats[]> {
    const currentMonth = new Date().getMonth() + 1;
    const months = [];

    // Lấy 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let yearAdjusted = year;

      if (month <= 0) {
        month += 12;
        yearAdjusted -= 1;
      }

      months.push({ month, year: yearAdjusted });
    }

    const results = await Promise.all(
      months.map(({ month, year }) => adminApi.getQuizzesByMonth(month, year))
    );

    return months.map(({ month, year }, index) => ({
      month,
      year,
      count: results[index],
    }));
  },

  /**
   * Lấy dữ liệu biểu đồ tài khoản theo tháng (6 tháng gần nhất)
   */
  async getAccountMonthlyChart(year: number): Promise<MonthlyStats[]> {
    const currentMonth = new Date().getMonth() + 1;
    const months = [];

    // Lấy 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let yearAdjusted = year;

      if (month <= 0) {
        month += 12;
        yearAdjusted -= 1;
      }

      months.push({ month, year: yearAdjusted });
    }

    const results = await Promise.all(
      months.map(({ month, year }) => adminApi.getAccountsByMonth(month, year))
    );

    return months.map(({ month, year }, index) => ({
      month,
      year,
      count: results[index],
    }));
  },

  // ========== USER MANAGEMENT ==========

  /**
   * Lấy danh sách tất cả tài khoản (phân trang)
   * GET /api/Admin/getAllAccounts?page=1&pageSize=10
   */
  async getAllAccounts(
    page: number = 1,
    pageSize: number = 10
  ): Promise<AccountByRole[]> {
    return await apiClient.get<AccountByRole[]>(
      `/Admin/getAllAccounts?page=${page}&pageSize=${pageSize}`
    );
  },

  /**
   * Cấm tài khoản
   * PUT /api/Admin/ban-account/{accountId}
   */
  async banAccount(accountId: number): Promise<{ message: string }> {
    return await apiClient.put<{ message: string }>(
      `/Admin/ban-account/${accountId}`,
      {}
    );
  },

  /**
   * Bỏ cấm tài khoản
   * PUT /api/Admin/unban-account/{accountId}
   */
  async unbanAccount(accountId: number): Promise<{ message: string }> {
    return await apiClient.put<{ message: string }>(
      `/Admin/unban-account/${accountId}`,
      {}
    );
  },
};
