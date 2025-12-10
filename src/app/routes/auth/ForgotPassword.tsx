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
  email: z.string().email("Email không h?p l?"),
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
      toast.warning("Vui lòng nh?p email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.checkEmail(emailValue);
      setEmail(emailValue);
      setAccountId(response.accountId);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "G?i mã OTP th?t b?i");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.warning("Vui lòng nh?p d?y d? 6 s? mã OTP");
      return;
    }
    if (!email || !accountId) {
      toast.error("Vui lòng nh?p email và g?i OTP tru?c");
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP(email, otp);
      toast.success(response.message);
      navigate("/auth/reset-password", { state: { email, accountId } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mã OTP không h?p l?");
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
                navigate("/");
              }}
            >
              <div className="pointer-events-none">
                <Logo size="lg" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Quên m?t kh?u?
            </h1>
            <p className="text-white/90">Nh?p email d? nh?n mã OTP</p>
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
                        placeholder="Nh?p email c?a b?n"
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
                      G?i OTP
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
                    placeholder="Nh?p mã OTP"
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
                  {isLoading ? "Ðang xác minh..." : "Xác nh?n"}
                </Button>

                {/* Back to login */}
                <div className="text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay l?i dang nh?p
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
