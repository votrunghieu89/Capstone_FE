import { useState, useEffect } from "react";
import { Calendar, ArrowLeft, Search, X } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../../libs/api/adminApi";
import { Spinner } from "../../../components/common/Spinner";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "Admin" | "Teacher" | "Student";
  isActive: boolean;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsers() {
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 10 users mỗi trang
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  // Tính tổng số trang
  const totalPages = Math.ceil(totalUsers / pageSize);

  // Gọi API lấy danh sách users hoặc tìm kiếm
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Nếu có search email, gọi API tìm kiếm
        if (searchEmail.trim()) {
          setIsSearching(true);
          const account = await adminApi.searchAccountByEmail(
            searchEmail.trim()
          );

          if (account) {
            // Convert AccountByRole sang User format
            const convertedUser: User = {
              id: account.accountId.toString(),
              email: account.email,
              fullName: account.email.split("@")[0],
              role: account.role as "Admin" | "Teacher" | "Student",
              isActive: account.isActive,
              phone: undefined,
              createdAt: new Date(account.createAt).toLocaleDateString("vi-VN"),
              lastLogin: undefined,
            };
            setUsers([convertedUser]);
            setTotalUsers(1);
          } else {
            setUsers([]);
            setTotalUsers(0);
          }
        } else {
          // Không có search, lấy danh sách bình thường
          setIsSearching(false);
          const allAccounts = await adminApi.getAllAccounts(1, 1000);
          setTotalUsers(allAccounts.length);

          // Pagination ở frontend vì BE không hỗ trợ totalCount
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedAccounts = allAccounts.slice(startIndex, endIndex);

          // Convert AccountByRole sang User format
          const convertedUsers: User[] = paginatedAccounts.map((account) => ({
            id: account.accountId.toString(),
            email: account.email,
            fullName: account.email.split("@")[0],
            role: account.role as "Admin" | "Teacher" | "Student",
            isActive: account.isActive,
            phone: undefined,
            createdAt: new Date(account.createAt).toLocaleDateString("vi-VN"),
            lastLogin: undefined,
          }));

          setUsers(convertedUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Không thể tải danh sách người dùng");
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, pageSize, searchEmail]);

  const goDetail = (id: string) => {
    navigate(`/admin/users/${id}`);
  };

  const goDashboard = () => navigate("/admin");

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-error-100 text-error-800";
      case "Teacher":
        return "bg-primary-100 text-primary-800";
      case "Student":
        return "bg-success-100 text-success-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

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

      <div className="p-6">
        <div className="mb-4">
          <Button
            variant="outline"
            className="btn-outline"
            onClick={goDashboard}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Trở về Dashboard
          </Button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-content">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mt-[20px]">
                    Quản lý người dùng
                  </h3>
                  <p className="text-sm text-secondary-600 mt-1">
                    Danh sách tất cả người dùng trong hệ thống
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Tìm kiếm email */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    className="input pl-10 pr-10"
                    placeholder="Tìm kiếm theo email..."
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value);
                      setPage(1); // Reset về trang 1 khi search
                    }}
                  />
                  {searchEmail && (
                    <button
                      onClick={() => {
                        setSearchEmail("");
                        setPage(1);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Filter role */}
                <div className="md:w-48">
                  <select
                    className="input"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="Admin">Admin</option>
                    <option value="Teacher">Giáo viên</option>
                    <option value="Student">Học sinh</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-content p-0">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
                <span className="ml-3 text-secondary-600">
                  Đang tải danh sách người dùng...
                </span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-error-600 mb-4">⚠️ {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Data Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-secondary-500"
                        >
                          Không tìm thấy người dùng nào
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {user.createdAt}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goDetail(user.id)}
                            >
                              Xem
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination - Chỉ hiển thị khi không search */}
        {!loading && !error && totalUsers > 0 && !isSearching && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-secondary-700">
              Hiển thị {Math.min((page - 1) * pageSize + 1, totalUsers)} -{" "}
              {Math.min(page * pageSize, totalUsers)} trong tổng số {totalUsers}{" "}
              người dùng
            </div>
            <div className="flex items-center space-x-2">
              {/* Nút Trước */}
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </Button>

              {/* Render page numbers */}
              {(() => {
                const pages = [];
                const maxPagesToShow = 5;

                if (totalPages <= maxPagesToShow) {
                  // Hiển thị tất cả nếu ít trang
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={page === i ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPage(i)}
                      >
                        {i}
                      </Button>
                    );
                  }
                } else {
                  // Hiển thị thông minh: 1 ... 3 4 5 ... 10
                  pages.push(
                    <Button
                      key={1}
                      variant={page === 1 ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setPage(1)}
                    >
                      1
                    </Button>
                  );

                  if (page > 3) {
                    pages.push(
                      <span key="dots1" className="px-2 text-secondary-500">
                        ...
                      </span>
                    );
                  }

                  const start = Math.max(2, page - 1);
                  const end = Math.min(totalPages - 1, page + 1);

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={page === i ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPage(i)}
                      >
                        {i}
                      </Button>
                    );
                  }

                  if (page < totalPages - 2) {
                    pages.push(
                      <span key="dots2" className="px-2 text-secondary-500">
                        ...
                      </span>
                    );
                  }

                  if (totalPages > 1) {
                    pages.push(
                      <Button
                        key={totalPages}
                        variant={page === totalPages ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    );
                  }
                }

                return pages;
              })()}

              {/* Nút Sau */}
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
