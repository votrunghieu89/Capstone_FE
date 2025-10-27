import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Logo } from "../../../components/common/Logo";

const forgotSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      // TODO: Call forgot password API
      console.log("Forgot password data:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsEmailSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // TODO: Call resend/send OTP API
    console.log("Send/Resend OTP");
    setIsEmailSent(true);
  };

  // Giữ một trang duy nhất: nhập email (gửi OTP) và nhập OTP bên dưới

  return (
    <div className="min-h-screen auth-bg relative flex items-center justify-center p-4">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Quên mật khẩu?
          </h1>
          <p className="text-white/90">Nhập email để nhận mã OTP</p>
        </div>

        {/* Forgot Form */}
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/30">
          <div className="px-6 md:px-8 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-secondary-700 mb-2 block">
                  Email
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Nhập email của bạn"
                      icon={<Mail size={16} />}
                      error={errors.email?.message}
                      {...register("email")}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOtp}
                  >
                    Gửi OTP
                  </Button>
                </div>
              </div>

              <Input
                label="Mã OTP"
                placeholder="Nhập mã OTP"
                icon={<KeyRound size={16} />}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
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
  );
}
