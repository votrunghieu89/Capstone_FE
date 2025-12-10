import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { storage } from "../../../libs/storage";
import { adminApi, AccountByRole } from "../../../libs/api/adminApi";
import { Spinner } from "../../../components/common/Spinner";
import {
  Mail,
  Shield,
  Calendar,
  Ban,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const current = storage.getUser();
  const [showDelete, setShowDelete] = useState(false);
  const [user, setUser] = useState<AccountByRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API lấy thông tin user
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy tất cả accounts và filter theo userId
        const accounts = await adminApi.getAllAccounts(1, 100);
        const foundUser = accounts.find(
          (acc) => acc.accountId.toString() === userId
        );

        if (foundUser) {
          setUser(foundUser);
        } else {
          setError("Không tìm thấy người dùng");
        }
      } catch (err) {
        setError("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const handleDelete = async () => {
    if (!user) return;

    try {
      if (user.isActive) {
        // Cấm tài khoản
        await adminApi.banAccount(user.accountId);
      } else {
        // Gỡ cấm tài khoản
        await adminApi.unbanAccount(user.accountId);
      }
      setShowDelete(false);
      navigate("/admin/users");
    } catch (err) {
      alert("Không thể thay đổi trạng thái người dùng này");
    }
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-secondary-600">
              Đang tải thông tin người dùng...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card">
            <div className="card-content">
              <div className="text-center py-12">
                <p className="text-error-600 mb-4">⚠️ {error}</p>
                <Button onClick={() => navigate("/admin/users")}>
                  Quay lại danh sách
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* User Detail - Chỉ hiển thị khi có data */}
        {!loading && !error && user && (
          <>
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card lg:col-span-2">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {user.email.split("@")[0]}
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
                      <Shield className="w-4 h-4 mr-2" />{" "}
                      {user.isActive ? "Hoạt động" : "Đã bị cấm"}
                    </div>
                    <div className="flex items-center text-secondary-700">
                      <Calendar className="w-4 h-4 mr-2" /> Tạo ngày{" "}
                      {new Date(user.createAt).toLocaleDateString("vi-VN")}
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
                  {user.isActive ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowDelete(true)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cấm tài khoản
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setShowDelete(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Gỡ cấm tài khoản
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Thông báo: API không hỗ trợ stats */}
            <div className="card mt-6">
              <div className="card-content">
                <div className="text-center py-8">
                  <p className="text-secondary-600 mb-2">
                    📊 Thống kê chi tiết sẽ được bổ sung sau
                  </p>
                  <p className="text-sm text-secondary-500">
                    API hiện tại chỉ cung cấp thông tin cơ bản về tài khoản
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal xác nhận thay đổi trạng thái */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title={
          user?.isActive
            ? "Xác nhận cấm tài khoản"
            : "Xác nhận gỡ cấm tài khoản"
        }
      >
        <div className="space-y-4">
          <p className="text-secondary-700">
            {user?.isActive ? (
              <>
                Bạn chắc chắn muốn cấm tài khoản{" "}
                <span className="font-semibold">{user?.email}</span>? Người dùng
                sẽ không thể đăng nhập vào hệ thống.
              </>
            ) : (
              <>
                Bạn chắc chắn muốn gỡ cấm tài khoản{" "}
                <span className="font-semibold">{user?.email}</span>? Người dùng
                sẽ có thể đăng nhập trở lại.
              </>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="btn-outline"
              onClick={() => setShowDelete(false)}
            >
              Huỷ
            </Button>
            <Button
              variant={user?.isActive ? "destructive" : "primary"}
              onClick={handleDelete}
            >
              {user?.isActive ? (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Cấm tài khoản
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Gỡ cấm
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
