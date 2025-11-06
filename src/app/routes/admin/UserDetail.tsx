import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { storage } from "../../../libs/storage";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Trash2,
  ArrowLeft,
  Bell,
} from "lucide-react";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const current = storage.getUser();
  const [showDelete, setShowDelete] = useState(false);

  // Mock: dữ liệu người dùng (sau sẽ gọi API .NET)
  const user = {
    id: userId || "1",
    email: "teacher1@example.com",
    fullName: "Trần Thị Giáo viên",
    role: "Teacher",
    isActive: true,
    phone: "0987654321",
    createdAt: "2024-02-20",
    quizzesCreated: 42,
    totalPlays: 1280,
    deletedAccounts: 0,
  };

  const handleDelete = () => {
    // TODO: gọi API xoá tài khoản theo user.id
    console.log("Delete account id:", user.id);
    setShowDelete(false);
    navigate("/admin/users");
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Admin Navbar đơn giản */}
      <div className="bg-white border-b border-secondary-200">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-error-100 flex items-center justify-center">
              <span className="text-error-600 font-bold">A</span>
            </div>
            <span className="text-base font-semibold text-secondary-900">
              Chi tiết người dùng
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <Button
            variant="outline"
            className="btn-outline"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
        </div>

        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {user.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    {user.fullName}
                  </h3>
                  <p className="text-secondary-600">{user.role}</p>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-secondary-700">
                  <Mail className="w-4 h-4 mr-2" /> {user.email}
                </div>
                <div className="flex items-center text-secondary-700">
                  <Phone className="w-4 h-4 mr-2" /> {user.phone}
                </div>
                <div className="flex items-center text-secondary-700">
                  <Shield className="w-4 h-4 mr-2" />{" "}
                  {user.isActive ? "Hoạt động" : "Khoá"}
                </div>
                <div className="flex items-center text-secondary-700">
                  <Calendar className="w-4 h-4 mr-2" /> Tạo ngày{" "}
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </div>

          {/* Hành động quản trị */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                Hành động
              </h3>
            </div>
            <div className="card-content space-y-3">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xoá tài khoản
              </Button>
            </div>
          </div>
        </div>

        {/* Số liệu tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="card">
            <div className="card-content">
              <p className="text-sm text-secondary-600">Quiz đã tạo</p>
              <p className="text-2xl font-bold text-secondary-900">
                {user.quizzesCreated}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <p className="text-sm text-secondary-600">Lượt chơi</p>
              <p className="text-2xl font-bold text-secondary-900">
                {user.totalPlays}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <p className="text-sm text-secondary-600">TK đã xoá</p>
              <p className="text-2xl font-bold text-secondary-900">
                {user.deletedAccounts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận xoá */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Xác nhận xoá tài khoản"
      >
        <div className="space-y-4">
          <p className="text-secondary-700">
            Bạn chắc chắn muốn xoá tài khoản của{" "}
            <span className="font-semibold">{user.fullName}</span>? Hành động
            không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="btn-outline"
              onClick={() => setShowDelete(false)}
            >
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xoá tài khoản
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
