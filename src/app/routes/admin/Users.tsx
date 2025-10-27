import { useState } from "react";
import { Edit, Trash2, Phone, Calendar, ArrowLeft, Bell } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { storage } from "../../../libs/storage";
import { useNavigate } from "react-router-dom";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const userInfo = storage.getUser();

  const handleLogout = () => {
    storage.clearAuth();
    navigate("/auth/login");
  };

  const goDetail = (id: string) => {
    navigate(`/admin/users/${id}`);
  };

  const goDashboard = () => navigate("/admin");

  // Mock data - sẽ thay thế bằng API call thực tế
  const users: User[] = [
    {
      id: "1",
      email: "admin@example.com",
      fullName: "Nguyễn Văn Admin",
      role: "Admin",
      isActive: true,
      phone: "0123456789",
      createdAt: "2024-01-15",
      lastLogin: "2024-10-04",
    },
    {
      id: "2",
      email: "teacher1@example.com",
      fullName: "Trần Thị Giáo viên",
      role: "Teacher",
      isActive: true,
      phone: "0987654321",
      createdAt: "2024-02-20",
      lastLogin: "2024-10-03",
    },
    {
      id: "3",
      email: "student1@example.com",
      fullName: "Lê Văn Học sinh",
      role: "Student",
      isActive: true,
      phone: undefined, // Student: để trống
      createdAt: "2024-03-10",
      lastLogin: "2024-10-02",
    },
    {
      id: "4",
      email: "student2@example.com",
      fullName: "Phạm Thị Học sinh 2",
      role: "Student",
      isActive: false,
      phone: undefined, // Student: để trống
      createdAt: "2024-04-05",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesRole;
  });

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      // TODO: Call delete user API
      console.log("Delete user:", selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Quản lý người dùng
                </h3>
                <p className="text-sm text-secondary-600 mt-1">
                  Danh sách tất cả người dùng trong hệ thống
                </p>
              </div>
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

        {/* Users Table */}
        <div className="card">
          <div className="card-content p-0">
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
                      Liên hệ
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
                  {filteredUsers.map((user) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">
                          {user.role !== "Student" && user.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-secondary-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goDetail(user.id)}
                          >
                            Xem
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log("Edit user:", user.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-secondary-700">
            Hiển thị {filteredUsers.length} trong tổng số {users.length} người
            dùng
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <Button variant="primary" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa tài khoản"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Bạn có chắc chắn muốn xóa tài khoản{" "}
            <span className="font-semibold text-secondary-900">
              {selectedUser?.email}
            </span>{" "}
            không? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa tài khoản
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
