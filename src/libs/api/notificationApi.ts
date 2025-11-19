import { NotificationDTO } from "../../types/notification";
import { apiClient } from "../apiClient";

class NotificationApi {
  private basePath = "/Notification";

  async getLatest(accountId: number): Promise<NotificationDTO[]> {
    return apiClient.get<NotificationDTO[]>(
      `${this.basePath}/latest/${accountId}`
    );
  }

  async markAsRead(notificationId: number): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `${this.basePath}/mark-read/${notificationId}`
    );
  }

  async markAsUnread(notificationId: number): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `${this.basePath}/mark-unread/${notificationId}`
    );
  }

  async markAllAsRead(accountId: number): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `${this.basePath}/mark-all-read/${accountId}`
    );
  }

  async markAllAsUnread(accountId: number): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `${this.basePath}/mark-all-unread/${accountId}`
    );
  }

  async deleteAllRead(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.basePath}/delete-all-read`
    );
  }
}

export const notificationApi = new NotificationApi();

