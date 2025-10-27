import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Spinner } from "../../../components/common/Spinner";
import { storage } from "../../../libs/storage";
import { Logo } from "../../../components/common/Logo";
import { authApi } from "../../../libs/api/authApi";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Gọi API login
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      // Lưu token và thông tin user
      storage.setToken(response.accesToken); // Note: BE có typo "accesToken"
      storage.setRefreshToken(response.refreshToken);

      // Tạo user object từ response
      const user = {
        id: response.accountId.toString(),
        email: response.email,
        name: response.email.split("@")[0], // Tạm thời lấy từ email
        role: response.role as "Admin" | "Teacher" | "Student",
        avatar: null,
      };
      storage.setUser(user);

      // Điều hướng theo role
      if (response.role === "Admin") {
        navigate("/admin");
      } else if (response.role === "Teacher") {
        navigate("/teacher");
      } else if (response.role === "Student") {
        navigate("/student");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg relative flex items-center justify-center p-4">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />
      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <Logo size="lg" />
          </Link>
          <p className="text-white/90 text-lg">
            Nền tảng học tập tương tác số 1 Việt Nam
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/30">
          <div className="px-6 md:px-10 py-6">
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-1">
              Đăng Nhập
            </h2>
            <p className="text-secondary-600 text-center mb-6">
              Chào mừng bạn quay trở lại! Vui lòng đăng nhập để tiếp tục.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="Nhập email của bạn"
                icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                icon={<Lock size={16} />}
                showPasswordToggle
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : "Đăng Nhập"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 py-0.5 bg-white/80 text-secondary-600 tracking-wide"></span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng nhập với Google
              </Button>

              {/* Quick login demo */}
              <div className="mt-4">
                <p className="text-center text-sm text-secondary-600 mb-2">
                  Đăng nhập nhanh (Demo)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      storage.setToken("t_admin");
                      storage.setUser({
                        id: "a",
                        email: "admin@test.com",
                        name: "Admin",
                        role: "Admin",
                      });
                      navigate("/admin");
                    }}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      storage.setToken("t_teacher");
                      storage.setUser({
                        id: "t",
                        email: "teacher@test.com",
                        name: "Giáo viên",
                        role: "Teacher",
                      });
                      navigate("/teacher");
                    }}
                  >
                    Teacher
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      storage.setToken("t_student");
                      storage.setUser({
                        id: "s",
                        email: "student@test.com",
                        name: "Học sinh",
                        role: "Student",
                      });
                      navigate("/student");
                    }}
                  >
                    Student
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2 mt-4">
                <Link
                  to="/auth/forgot"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Quên mật khẩu?
                </Link>
                <div className="text-sm text-secondary-700">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/auth/register"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
