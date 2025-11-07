import { useNavigate } from "react-router-dom";
import { Users, BookOpen } from "lucide-react";
import { storage } from "../../../libs/storage";
import { adminApi } from "../../../libs/api/adminApi";
import { useEffect, useState } from "react";
import { Spinner } from "../../../components/common/Spinner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = storage.getUser();

  // State cho dữ liệu từ API
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalQuizzes: 0,
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API khi component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const goDashboard = () => navigate("/admin");

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Admin Navbar */}
      <div className="bg-white border-b border-secondary-200">
        <div className="px-6 py-3 flex items-center justify-between">
          <button
            onClick={goDashboard}
            className="flex items-center gap-2 cursor-pointer"
            title="Về Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-error-100 flex items-center justify-center">
              <span className="text-error-600 font-bold">A</span>
            </div>
            <span className="text-base font-semibold text-secondary-900">
              Admin Dashboard
            </span>
          </button>
        </div>
      </div>

      {/* Hero banner (không nút hành động) */}
      <div className="px-6 pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-warning-300 via-warning-400 to-warning-500 text-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=2070&auto=format&fit=crop)",
              backgroundSize: "cover",
            }}
          ></div>
          <div className="relative z-10 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-extrabold drop-shadow-sm">
              Chào mừng, {user?.name || user?.email?.split("@")[0] || "Admin"}!
            </h2>
            <p className="mt-2 text-white/90">
              Quản lý và giám sát hệ thống EduQuiz
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-secondary-600">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card mb-8">
            <div className="card-content">
              <div className="text-center py-8">
                <p className="text-error-600 mb-2">⚠️ {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards - Hiển thị dữ liệu thật từ API */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Tổng người dùng - CÓ API */}
              <div
                className="card cursor-pointer hover:shadow-md transition-shadow"
                role="button"
                aria-label="Đi tới danh sách người dùng"
                onClick={() => navigate("/admin/users")}
              >
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">
                        Tổng người dùng
                      </p>
                      <p className="text-3xl font-bold text-secondary-900">
                        {stats.totalAccounts.toLocaleString()}
                      </p>
                      <p className="text-xs text-success-600 mt-1">
                        {stats.totalStudents} học sinh, {stats.totalTeachers}{" "}
                        giáo viên
                      </p>
                    </div>
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tổng quiz - CÓ API */}
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">
                        Tổng quiz
                      </p>
                      <p className="text-3xl font-bold text-secondary-900">
                        {stats.totalQuizzes.toLocaleString()}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Đã tạo trong hệ thống
                      </p>
                    </div>
                    <div className="p-3 bg-success-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-success-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Học sinh - CÓ API */}
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">
                        Học sinh
                      </p>
                      <p className="text-3xl font-bold text-secondary-900">
                        {stats.totalStudents.toLocaleString()}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Tài khoản học sinh
                      </p>
                    </div>
                    <div className="p-3 bg-accent-100 rounded-lg">
                      <Users className="w-6 h-6 text-accent-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Giáo viên - CÓ API */}
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">
                        Giáo viên
                      </p>
                      <p className="text-3xl font-bold text-secondary-900">
                        {stats.totalTeachers.toLocaleString()}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Tài khoản giáo viên
                      </p>
                    </div>
                    <div className="p-3 bg-warning-100 rounded-lg">
                      <Users className="w-6 h-6 text-warning-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông báo: Các tính năng đang phát triển */}
            <div className="card mb-8">
              <div className="card-content">
                <div className="text-center py-8">
                  <p className="text-secondary-600 mb-2">
                    📊 Biểu đồ thống kê và phân tích chi tiết đang được phát
                    triển
                  </p>
                  <p className="text-sm text-secondary-500">
                    Các tính năng như biểu đồ theo tháng, phân bố người dùng sẽ
                    sớm được bổ sung
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
