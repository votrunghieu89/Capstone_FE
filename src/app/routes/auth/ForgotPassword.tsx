import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Logo } from "../../../components/common/Logo";
import { authApi } from "../../../libs/api/authApi";
import { useToast, ToastContainer } from "../../../components/common/Toast";

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type EmailForm = z.infer<typeof emailSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [accountId, setAccountId] = useState<number>(0);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const onSendOTP = async () => {
    const emailValue = getValues("email");
    if (!emailValue) {
      toast.warning("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.checkEmail(emailValue);
      setEmail(emailValue);
      setAccountId(response.accountId);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gửi mã OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.warning("Vui lòng nhập đầy đủ 6 số mã OTP");
      return;
    }
    if (!email || !accountId) {
      toast.error("Vui lòng nhập email và gửi OTP trước");
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP(email, otp);
      toast.success(response.message);
      navigate("/auth/reset-password", { state: { email, accountId } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mã OTP không hợp lệ");
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
            <div
              className="inline-flex items-center justify-center mb-4 cursor-pointer"
              onClick={() => {
                console.log("Logo clicked - navigating to home");
                navigate("/");
              }}
            >
              <div className="pointer-events-none">
                <Logo size="lg" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Quên mật khẩu?
            </h1>
            <p className="text-white/90">Nhập email để nhận mã OTP</p>
          </div>

          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/30">
            <div className="px-6 md:px-8 py-6">
              <form onSubmit={handleSubmit(onVerifyOTP)} className="space-y-6">
                {/* Email field with Send OTP button */}
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
                      onClick={onSendOTP}
                      disabled={isLoading}
                      className="whitespace-nowrap"
                    >
                      Gửi OTP
                    </Button>
                  </div>
                </div>

                {/* OTP field */}
                <div>
                  <label className="text-sm font-medium text-secondary-700 mb-2 block">
                    Mã OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="Nhập mã OTP"
                    icon={<KeyRound size={16} />}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? "Đang xác minh..." : "Xác nhận"}
                </Button>

                {/* Back to login */}
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
