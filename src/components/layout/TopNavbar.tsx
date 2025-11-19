import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  User as UserIcon,
  FolderOpen,
  History,
  Heart,
  FileBarChart,
  RefreshCcw,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { storage } from "../../libs/storage";
import { Logo } from "../common/Logo";
import { notificationApi } from "../../libs/api/notificationApi";
import { NotificationDTO } from "../../types/notification";

const parseAccountId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatNotificationTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

export const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getUser());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isBulkAction, setIsBulkAction] = useState(false);

  const accountId = useMemo(
    () =>
      parseAccountId(user?.accountId) ??
      parseAccountId(user?.id ?? user?.userId),
    [user]
  );

  const fetchNotifications = useCallback(async () => {
    if (!accountId) return;
    setIsLoadingNotifications(true);
    setNotifError(null);
    try {
      const data = await notificationApi.getLatest(accountId);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      setNotifError("Không thể tải thông báo");
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [accountId]);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(storage.getUser());
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("click", handler);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      document.removeEventListener("click", handler);
    };
  }, []);

  useEffect(() => {
    if (!accountId) return;
    fetchNotifications();
  }, [accountId, fetchNotifications]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      fetchNotifications();
    };
    window.addEventListener("notification:received", handler);
    return () => {
      window.removeEventListener("notification:received", handler);
    };
  }, [fetchNotifications]);

  const hasUnread = notifications.some((n) => !n.isRead);

  const handleToggleNotifications = () => {
    if (!accountId) {
      toast.error("Bạn cần đăng nhập để xem thông báo");
      return;
    }
    if (!notifOpen && notifications.length === 0) {
      fetchNotifications();
    }
    setNotifOpen((prev) => !prev);
  };

  const handleRefreshNotifications = () => {
    fetchNotifications();
  };

  const handleMarkRead = async (notificationId: number) => {
    try {
      setActionLoadingId(notificationId);
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      toast.error("Không thể đánh dấu đã đọc");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkUnread = async (notificationId: number) => {
    try {
      setActionLoadingId(notificationId);
      await notificationApi.markAsUnread(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notificationId
            ? { ...item, isRead: false }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as unread", error);
      toast.error("Không thể đánh dấu chưa đọc");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!accountId) return;
    try {
      setIsBulkAction(true);
      await notificationApi.markAllAsRead(accountId);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
      toast.error("Không thể đánh dấu tất cả đã đọc");
    } finally {
      setIsBulkAction(false);
    }
  };

  const handleMarkAllUnread = async () => {
    if (!accountId) return;
    try {
      setIsBulkAction(true);
      await notificationApi.markAllAsUnread(accountId);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: false }))
      );
    } catch (error) {
      console.error("Failed to mark all as unread", error);
      toast.error("Không thể đánh dấu tất cả chưa đọc");
    } finally {
      setIsBulkAction(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuth();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
        {/* Brand */}
        <Logo size="md" to="/" variant="white" />

        {/* Nav removed as requested */}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative" ref={notifRef}>
            <button
              className="relative p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Notifications"
              onClick={handleToggleNotifications}
            >
              <Bell className="w-5 h-5 text-white" />
              {hasUnread && (
                <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-error-400" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 max-h-[28rem] overflow-y-auto rounded-lg bg-white shadow-lg border border-secondary-200 p-3 z-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-secondary-900">
                    Thông báo
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-1 text-xs text-secondary-600 hover:text-primary-600"
                      onClick={handleRefreshNotifications}
                      disabled={isLoadingNotifications}
                    >
                      <RefreshCcw className="w-3.5 h-3.5" /> Làm mới
                    </button>
                    <button
                      className="flex items-center gap-1 text-xs text-secondary-600 hover:text-primary-600"
                      onClick={handleMarkAllRead}
                      disabled={isBulkAction || notifications.length === 0}
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Đọc hết
                    </button>
                  </div>
                </div>
                {!accountId && (
                  <p className="text-sm text-secondary-500">
                    Đăng nhập để xem thông báo.
                  </p>
                )}
                {accountId && isLoadingNotifications && (
                  <p className="text-sm text-secondary-500">
                    Đang tải thông báo...
                  </p>
                )}
                {accountId && notifError && (
                  <p className="text-sm text-error-500">{notifError}</p>
                )}
                {accountId &&
                  !isLoadingNotifications &&
                  !notifError &&
                  notifications.length === 0 && (
                    <p className="text-sm text-secondary-500">
                      Bạn chưa có thông báo mới.
                    </p>
                  )}
                {accountId &&
                  !isLoadingNotifications &&
                  notifications.length > 0 && (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`rounded-lg border p-3 ${
                            notification.isRead
                              ? "bg-secondary-50 border-secondary-100"
                              : "bg-primary-50 border-primary-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-secondary-900">
                              {notification.message}
                            </p>
                            {!notification.isRead && (
                              <span className="text-[10px] font-semibold text-primary-600 bg-white/80 rounded-full px-2 py-0.5">
                                Mới
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-secondary-500">
                            <span>{formatNotificationTime(notification.createAt)}</span>
                            <button
                              className="text-primary-600 hover:text-primary-700 disabled:opacity-60"
                              onClick={() =>
                                notification.isRead
                                  ? handleMarkUnread(notification.notificationId)
                                  : handleMarkRead(notification.notificationId)
                              }
                              disabled={actionLoadingId === notification.notificationId}
                            >
                              {notification.isRead
                                ? "Đánh dấu chưa đọc"
                                : "Đánh dấu đã đọc"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                {accountId && notifications.length > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      className="text-xs text-secondary-600 hover:text-primary-600"
                      onClick={handleMarkAllUnread}
                      disabled={isBulkAction}
                    >
                      Đánh dấu tất cả chưa đọc
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="flex items-center gap-3 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
              onClick={() => setProfileOpen((v) => !v)}
            >
              <div className="hidden sm:block leading-4 text-right">
                <p className="text-sm font-medium text-white">
                  {user?.name || "Người dùng"}
                </p>
                <p className="text-[12px] text-white/80">
                  {user?.email || "guest@example.com"}
                </p>
              </div>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "Avatar"}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                </div>
              )}
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-lg bg-white shadow-lg border border-secondary-200 p-2 z-50">
                {user?.role !== "Admin" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() =>
                        navigate("/profile", {
                          state: { from: window.location.pathname },
                        })
                      }
                    >
                      <UserIcon className="w-4 h-4 mr-2 inline" /> Hồ sơ
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() => navigate("/favourites")}
                    >
                      <Heart className="w-4 h-4 mr-2 inline" /> Yêu thích
                    </button>
                  </>
                )}
                {user?.role === "Student" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() => navigate("/student/classes")}
                    >
                      <UserIcon className="w-4 h-4 mr-2 inline" /> Lớp học
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() => navigate("/student/history")}
                    >
                      <History className="w-4 h-4 mr-2 inline" /> Lịch sử
                    </button>
                  </>
                )}
                {user?.role === "Teacher" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() => navigate("/teacher/folders")}
                    >
                      <FolderOpen className="w-4 h-4 mr-2 inline" /> Thư mục
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() => navigate("/teacher/classes")}
                    >
                      <UserIcon className="w-4 h-4 mr-2 inline" /> Lớp học
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() => navigate("/teacher/history")}
                    >
                      <FileBarChart className="w-4 h-4 mr-2 inline" /> Báo cáo
                    </button>
                  </>
                )}
                <div className="my-1 h-px bg-secondary-200" />
                <button
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm text-error-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2 inline" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
