import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Database,
  HardDrive,
  Network,
  Server,
  Eye,
  Settings,
  Plus,
  PlayCircle,
  Bell,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { storage } from "../../../libs/storage";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = storage.getUser();

  const handleLogout = () => {
    storage.clearAuth();
    navigate("/auth/login");
  };

  const goDashboard = () => navigate("/admin");

  // Dữ liệu tĩnh để hiển thị ngay, sau có thể thay bằng API
  const kpi = {
    totalUsers: 1247,
    totalQuizzes: 523,
    totalPlays: 15780,
    onlineNow: 89,
    uptime: 99.8,
  };

  const quizCreateByMonth = [
    { label: "Jan", value: 45 },
    { label: "Feb", value: 52 },
    { label: "Mar", value: 61 },
    { label: "Apr", value: 73 },
    { label: "May", value: 80 },
    { label: "Jun", value: 76 },
  ];

  const userDistribution = [
    { label: "Học sinh", value: 985, percent: 79 },
    { label: "Giáo viên", value: 262, percent: 21 },
  ];

  const systemStatus = [
    {
      id: "db",
      name: "Cơ Sở Dữ Liệu",
      percent: 99,
      color: "bg-success-500",
      Icon: Database,
    },
    {
      id: "storage",
      name: "Lưu Trữ",
      percent: 85,
      color: "bg-warning-500",
      Icon: HardDrive,
    },
    {
      id: "network",
      name: "Mạng",
      percent: 97,
      color: "bg-success-500",
      Icon: Network,
    },
    {
      id: "api",
      name: "API",
      percent: 99,
      color: "bg-success-500",
      Icon: Server,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      icon: Plus,
      text: 'Quiz mới: "Lịch sử Việt Nam" bởi Cô Lan',
      time: "15 phút trước",
    },
    {
      id: 2,
      icon: TrendingUp,
      text: "Hoạt động cao: 150+ người chơi online",
      time: "1 giờ trước",
    },
    {
      id: 3,
      icon: Settings,
      text: "Hệ thống được cập nhật thành công",
      time: "2 giờ trước",
    },
    {
      id: 4,
      icon: Activity,
      text: "Báo cáo spam từ người dùng ID: 1234",
      time: "3 giờ trước",
      action: "Xem",
    },
  ];

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
              Chào mừng, {user?.name || "Admin System"}!
            </h2>
            <p className="mt-2 text-white/90">
              Quản lý và giám sát hệ thống EduQuiz
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tổng người dùng (clickable) */}
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
                    {kpi.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-success-600 mt-1">+12 hôm nay</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">
                    Tổng quiz
                  </p>
                  <p className="text-3xl font-bold text-secondary-900">
                    {kpi.totalQuizzes.toLocaleString()}
                  </p>
                  <p className="text-xs text-success-600 mt-1">+34 hôm nay</p>
                </div>
                <div className="p-3 bg-success-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">
                    Lượt chơi tổng
                  </p>
                  <p className="text-3xl font-bold text-secondary-900">
                    {kpi.totalPlays.toLocaleString()}
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    {kpi.onlineNow} đang online
                  </p>
                </div>
                <div className="p-3 bg-accent-100 rounded-lg">
                  <PlayCircle className="w-6 h-6 text-accent-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">
                    Uptime hệ thống
                  </p>
                  <p className="text-3xl font-bold text-secondary-900">
                    {kpi.uptime}%
                  </p>
                  <p className="text-xs text-success-600 mt-1">Hoạt động tốt</p>
                </div>
                <div className="p-3 bg-warning-100 rounded-lg">
                  <Activity className="w-6 h-6 text-warning-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ tiến trình & Phân bố người dùng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                Biểu Đồ Tạo Quiz
              </h3>
              <p className="text-sm text-secondary-600">
                Số lượng quiz được tạo theo tháng
              </p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {quizCreateByMonth.map((m) => (
                  <div
                    key={m.label}
                    className="grid grid-cols-6 items-center gap-3"
                  >
                    <div className="col-span-1 text-sm text-secondary-700">
                      {m.label}
                    </div>
                    <div className="col-span-4 h-3 bg-secondary-100 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-primary-600 rounded-full"
                        style={{ width: `${Math.min(100, m.value)}%` }}
                      ></div>
                    </div>
                    <div className="col-span-1 text-right text-sm text-secondary-700">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                Phân Bố Người Dùng
              </h3>
              <p className="text-sm text-secondary-600">
                Tỷ lệ giáo viên và học sinh
              </p>
            </div>
            <div className="card-content">
              <div className="space-y-6">
                {userDistribution.map((u, idx) => (
                  <div key={u.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          idx === 0
                            ? "bg-primary-100 text-primary-800"
                            : "bg-accent-100 text-accent-800"
                        }`}
                      >
                        {u.label}
                      </div>
                      <div className="text-secondary-700">{u.value}</div>
                    </div>
                    <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                      <div
                        className={`${
                          idx === 0 ? "bg-primary-600" : "bg-accent-600"
                        } h-3`}
                        style={{ width: `${u.percent}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-secondary-500 mt-1">
                      {u.percent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trạng thái hệ thống & Hoạt động */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                Trạng thái hệ thống
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {systemStatus.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                      <div className="text-secondary-800 font-medium flex items-center gap-2">
                        <s.Icon className="w-4 h-4 text-secondary-400" />{" "}
                        {s.name}
                      </div>
                    </div>
                    <div className="text-secondary-800 font-semibold">
                      {s.percent}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" className="btn-outline">
                  <TrendingUp className="w-4 h-4 mr-2" /> Xem chi tiết
                </Button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                Hoạt động gần đây
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <a.icon className="w-5 h-5 text-secondary-500" />
                      <div>
                        <div className="text-secondary-900 text-sm font-medium">
                          {a.text}
                        </div>
                        <div className="text-secondary-500 text-xs">
                          {a.time}
                        </div>
                      </div>
                    </div>
                    {a.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-outline"
                      >
                        {a.action}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="secondary" className="btn-secondary">
                  <Eye className="w-4 h-4 mr-2" /> Xem tất cả hoạt động
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
