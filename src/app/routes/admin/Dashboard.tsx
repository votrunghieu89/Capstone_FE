import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Activity, Plus, Settings, Eye } from "lucide-react";
import { storage } from "../../../libs/storage";
import {
  adminApi,
  AuditLog,
  AccountByRole,
  MonthlyStats,
} from "../../../libs/api/adminApi";
import { useEffect, useState } from "react";
import { Spinner } from "../../../components/common/Spinner";
import { LineChart, BarChart } from "../../../components/charts";

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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accountMap, setAccountMap] = useState<Map<number, string>>(new Map()); // Map AccountId -> Email
  const [quizChartData, setQuizChartData] = useState<MonthlyStats[]>([]);
  const [accountChartData, setAccountChartData] = useState<MonthlyStats[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [logsError, setLogsError] = useState<string | null>(null);

  // Gọi API khi component mount
  useEffect(() => {
    // Reset state khi vào lại Dashboard
    setAuditLogs([]);
    setLogsLoading(true);
    setLogsError(null);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    const fetchAccountsForMapping = async () => {
      try {
        // Lấy nhiều accounts để map AccountId -> Email
        // Lấy 5 trang đầu (50 accounts) để cover hầu hết users
        const allAccounts: AccountByRole[] = [];
        for (let page = 1; page <= 5; page++) {
          const accounts = await adminApi.getAllAccounts(page, 10);
          allAccounts.push(...accounts);
          if (accounts.length < 10) break; // Hết accounts
        }

        // Tạo map AccountId -> Email
        const map = new Map<number, string>();
        allAccounts.forEach((acc) => {
          map.set(acc.accountId, acc.email);
        });
        setAccountMap(map);
      } catch (err) {
      }
    };

    const fetchAuditLogs = async () => {
      try {
        setLogsLoading(true);
        setLogsError(null);
        const logs = await adminApi.getAuditLogs(1, 100); // Lấy 100 log để hiển thị với scroll
        setAuditLogs(logs);
        if (logs.length === 0) {
        } else {
        }
      } catch (err: any) {
        setLogsError("Không thể tải log hoạt động");
        // Log chi tiết lỗi BE
        if (err.response) {
        } else if (err.code === "ERR_NETWORK") {
        }
      } finally {
        setLogsLoading(false);
      }
    };

    fetchDashboardData();
    fetchAccountsForMapping();
    fetchAuditLogs();
  }, []);

  // Fetch chart data khi selectedYear thay đổi
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartsLoading(true);
        const [quizData, accountData] = await Promise.all([
          adminApi.getQuizMonthlyChart(selectedYear),
          adminApi.getAccountMonthlyChart(selectedYear),
        ]);
        setQuizChartData(quizData);
        setAccountChartData(accountData);
      } catch (err: any) {
        if (err.response) {
        } else if (err.code === "ERR_NETWORK") {
        }
      } finally {
        setChartsLoading(false);
      }
    };

    fetchChartData();
  }, [selectedYear]);

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
                      <p className="text-sm font-medium text-secondary-600 mt-[20px]">
                        Tổng người dùng
                      </p>
                      <p className="text-3xl font-bold text-secondary-900">
                        {stats.totalAccounts.toLocaleString()}
                      </p>
                      <p className="text-xs text-success-600 mt-1 ">
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
                      <p className="text-sm font-medium text-secondary-600 mt-[20px]">
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
                      <p className="text-sm font-medium text-secondary-600 mt-[20px]">
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
                      <p className="text-sm font-medium text-secondary-600 mt-[20px]">
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

            {/* Hoạt động gần đây - Audit Logs */}
            <div className="card mb-8" style={{ display: "block" }}>
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Hoạt động gần đây
                </h3>
              </div>
              <div className="card-content">
                {logsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Spinner size="md" />
                    <span className="ml-3 text-secondary-600">
                      Đang tải log...
                    </span>
                  </div>
                ) : logsError ? (
                  <div className="text-center py-8">
                    <p className="text-error-600 mb-2">⚠️ {logsError}</p>
                    <p className="text-xs text-secondary-500">
                      Vui lòng kiểm tra console để xem chi tiết lỗi BE
                    </p>
                  </div>
                ) : !auditLogs || auditLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                    <p className="text-secondary-600 mb-2">
                      ⚠️ Không có log hoạt động
                    </p>
                    <p className="text-xs text-secondary-500">
                      BE có thể trả về mảng rỗng hoặc endpoint chưa sẵn sàng
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto pr-2">
                    <div className="space-y-4">
                      {/* Hiển thị tất cả log với scroll */}
                      {auditLogs.map((log, idx) => {
                        // Map action thành icon
                        let Icon = Activity;
                        if (
                          log.action?.toLowerCase().includes("create") ||
                          log.action?.toLowerCase().includes("tạo")
                        ) {
                          Icon = Plus;
                        } else if (
                          log.action?.toLowerCase().includes("update") ||
                          log.action?.toLowerCase().includes("cập nhật")
                        ) {
                          Icon = Settings;
                        } else if (
                          log.action?.toLowerCase().includes("view") ||
                          log.action?.toLowerCase().includes("xem")
                        ) {
                          Icon = Eye;
                        }

                        // Lấy email từ map, nếu không có thì hiển thị AccountId
                        const userEmail =
                          accountMap.get(log.accountId) ||
                          `Account ID: ${log.accountId}`;

                        // Format description để thay thế "account with ID:X" bằng email
                        let displayDescription =
                          log.description ||
                          log.action ||
                          "Hoạt động không có mô tả";
                        if (
                          log.description &&
                          log.description.includes(
                            `account with ID:${log.accountId}`
                          )
                        ) {
                          displayDescription = displayDescription.replace(
                            `account with ID:${log.accountId}`,
                            userEmail
                          );
                        } else if (
                          log.description &&
                          log.description.includes(
                            `by account with ID:${log.accountId}`
                          )
                        ) {
                          displayDescription = displayDescription.replace(
                            `by account with ID:${log.accountId}`,
                            `bởi ${userEmail}`
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-secondary-500" />
                              <div>
                                <div className="text-secondary-900 text-sm font-medium">
                                  {displayDescription}
                                </div>
                                <div className="text-secondary-500 text-xs">
                                  {log.creatAt
                                    ? new Date(log.creatAt).toLocaleString(
                                        "vi-VN"
                                      )
                                    : "Không có thời gian"}
                                  {log.ipAddress && ` • IP: ${log.ipAddress}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Biểu đồ thống kê */}
            <div className="mb-6">
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between mt-[20px]">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 ">
                        Biểu đồ thống kê
                      </h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        Chọn năm để xem dữ liệu
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-secondary-700">
                        Năm:
                      </label>
                      <select
                        className="input w-32"
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(parseInt(e.target.value))
                        }
                      >
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Biểu đồ Quiz theo tháng */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Quiz theo tháng ({selectedYear})
                  </h3>
                </div>
                <div className="card-content">
                  {chartsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Spinner size="md" />
                      <span className="ml-3 text-secondary-600">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  ) : quizChartData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-secondary-600 text-sm">
                        Không có dữ liệu
                      </p>
                    </div>
                  ) : (
                    <LineChart
                      data={{
                        labels: quizChartData.map((item) => {
                          const monthNames = [
                            "Tháng 1",
                            "Tháng 2",
                            "Tháng 3",
                            "Tháng 4",
                            "Tháng 5",
                            "Tháng 6",
                            "Tháng 7",
                            "Tháng 8",
                            "Tháng 9",
                            "Tháng 10",
                            "Tháng 11",
                            "Tháng 12",
                          ];
                          return `${monthNames[item.month - 1]}/${item.year}`;
                        }),
                        datasets: [
                          {
                            label: "Số Quiz",
                            data: quizChartData.map((item) => item.count),
                            borderColor: "rgb(99, 102, 241)",
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            tension: 0.4,
                          },
                        ],
                      }}
                      title="Quiz được tạo theo tháng"
                      height={300}
                    />
                  )}
                </div>
              </div>

              {/* Biểu đồ Tài khoản theo tháng */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Tài khoản theo tháng ({selectedYear})
                  </h3>
                </div>
                <div className="card-content">
                  {chartsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Spinner size="md" />
                      <span className="ml-3 text-secondary-600">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  ) : accountChartData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-secondary-600 text-sm">
                        Không có dữ liệu
                      </p>
                    </div>
                  ) : (
                    <BarChart
                      data={{
                        labels: accountChartData.map((item) => {
                          const monthNames = [
                            "Tháng 1",
                            "Tháng 2",
                            "Tháng 3",
                            "Tháng 4",
                            "Tháng 5",
                            "Tháng 6",
                            "Tháng 7",
                            "Tháng 8",
                            "Tháng 9",
                            "Tháng 10",
                            "Tháng 11",
                            "Tháng 12",
                          ];
                          return `${monthNames[item.month - 1]}/${item.year}`;
                        }),
                        datasets: [
                          {
                            label: "Số Tài khoản",
                            data: accountChartData.map((item) => item.count),
                            backgroundColor: "rgba(251, 146, 60, 0.8)",
                            borderColor: "rgb(251, 146, 60)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      title="Tài khoản được tạo theo tháng"
                      height={300}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
