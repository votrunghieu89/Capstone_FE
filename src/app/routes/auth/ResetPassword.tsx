import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Logo } from "../../../components/common/Logo";
import { authApi } from "../../../libs/api/authApi";
import { useToast, ToastContainer } from "../../../components/common/Toast";

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu không hợp lệ"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, accountId } = location.state || {};
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  if (!email || !accountId) {
    navigate("/auth/forgot");
    return null;
  }

  const onResetPassword = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.resetPasswordOTP(
        accountId,
        data.newPassword
      );
      toast.success(response.message);
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Đặt lại mật khẩu thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="min-h-screen auth-bg relative flex items-center justify-center p-4">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Đặt mật khẩu mới
            </h1>
            <p className="text-white/90">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/30">
            <div className="px-6 md:px-8 py-6">
              <form
                onSubmit={handleSubmit(onResetPassword)}
                className="space-y-6"
              >
                <div>
                  <p className="text-sm text-secondary-600 mb-4">
                    Email: <strong>{email}</strong>
                  </p>
                </div>

                <Input
                  label="Mật khẩu mới"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  icon={<Lock size={16} />}
                  showPasswordToggle
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />

                <Input
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  icon={<Lock size={16} />}
                  showPasswordToggle
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </Button>

                <div className="text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
