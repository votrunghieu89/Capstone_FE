import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  User as UserIcon,
  FolderOpen,
  History,
  Heart,
  FileBarChart,
} from "lucide-react";
import { storage } from "../../libs/storage";
import { Button } from "../common/Button";
import { Logo } from "../common/Logo";

export const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getUser());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lắng nghe sự kiện cập nhật user
    const handleUserUpdate = () => {
      setUser(storage.getUser());
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      document.removeEventListener("click", handler);
    };
  }, []);

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
          <button
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-white" />
          </button>
          <div className="relative" ref={ref}>
            <button
              type="button"
              className="flex items-center gap-3 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
              onClick={() => setOpen((v) => !v)}
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
            {open && (
              <div className="absolute right-0 top-12 w-56 rounded-lg bg-white shadow-lg border border-secondary-200 p-2 z-50">
                {user?.role !== "Admin" && (
                  <>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary-50 text-sm"
                      onClick={() => navigate("/profile")}
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
