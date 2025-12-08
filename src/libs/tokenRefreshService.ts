import { storage } from "./storage";
import { apiClient } from "./apiClient";

class TokenRefreshService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 4.5 * 60 * 1000; // 4 phút 30 giây

  /**
   * Bắt đầu tự động refresh token
   */
  start() {
    // Clear timer cũ nếu có
    this.stop();

    console.log("🔄 Token auto-refresh service started (every 4m30s)");

    // Refresh ngay lập tức nếu đã đăng nhập
    this.refreshTokenNow();

    // Set interval để refresh định kỳ
    this.refreshTimer = setInterval(() => {
      this.refreshTokenNow();
    }, this.REFRESH_INTERVAL);
  }

  /**
   * Dừng auto-refresh
   */
  stop() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log("⏹️ Token auto-refresh service stopped");
    }
  }

  /**
   * Refresh token ngay lập tức
   */
  private async refreshTokenNow() {
    try {
      const refreshToken = storage.getRefreshToken();
      const user = storage.getUser();

      if (!refreshToken || !user) {
        console.log("⏭️ Skip refresh: No refresh token or user found");
        return;
      }

      const accountId = parseInt(user.id || user.accountId);
      if (!accountId) {
        console.error("❌ Invalid accountId for refresh");
        return;
      }

      console.log("🔄 Refreshing access token...");

      // Gọi API refresh token
      const response = await apiClient.post<{ accessToken: string }>(
        "/Auth/accessToken",
        {
          accountId,
          refreshToken,
        }
      );

      const { accessToken } = response;

      // Lưu token mới
      storage.setToken(accessToken);

      console.log("✅ Access token refreshed successfully");
    } catch (error: any) {
      console.error("❌ Failed to refresh token:", error);

      // Nếu refresh token hết hạn hoặc không hợp lệ, clear storage
      if (error?.response?.status === 401 || error?.response?.status === 400) {
        console.log("🚪 Refresh token expired, logging out...");
        storage.clearAuth();

        // Redirect về login nếu không phải trang public
        const publicPaths = [
          "/",
          "/auth/login",
          "/auth/register",
          "/auth/forgot",
          "/browse",
          "/quiz/preview",
        ];
        const currentPath = window.location.pathname;
        const isPublicPage = publicPaths.some((path) =>
          currentPath.startsWith(path)
        );

        if (!isPublicPage) {
          window.location.href = "/auth/login";
        }

        // Dừng service
        this.stop();
      }
    }
  }

  /**
   * Reset và khởi động lại service (dùng sau khi login)
   */
  restart() {
    this.stop();
    this.start();
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
