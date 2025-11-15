import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User as UserIcon, MapPin, Building2 } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Spinner } from "../../../components/common/Spinner";
import { Logo } from "../../../components/common/Logo";
import { authApi } from "../../../libs/api/authApi";
import { useToast, ToastContainer } from "../../../components/common/Toast";
import { handleGoogleAuth, getRedirectPath } from "../../../utils/googleAuth";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu không được để trống"),
    name: z
      .string()
      .min(1, "Họ tên không được để trống")
      .min(2, "Họ tên phải có ít nhất 2 ký tự"),
    role: z.enum(["Student", "Teacher"], {
      required_error: "Vui lòng chọn vai trò",
    }),
    address: z.string().optional(),
    organizationName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // Nếu là Teacher, yêu cầu organizationName và address
      if (data.role === "Teacher") {
        return !!data.organizationName && !!data.address;
      }
      return true;
    },
    {
      message: "Giáo viên phải nhập tên trường/tổ chức và địa chỉ",
      path: ["organizationName"],
    }
  );

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationRole, setRegistrationRole] = useState<
    "Student" | "Teacher"
  >("Student");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const navigate = useNavigate();
  const { toasts, success, error: showError, removeToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "Student",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      address: "",
      organizationName: "",
    },
  });

  // Handle Google Register (use selected role)
  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);

    // Wait for Google SDK to load
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      // @ts-ignore
      if (window.google?.accounts?.id) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      retries++;
    }

    try {
      // @ts-ignore
      const google = window.google;
      if (!google?.accounts?.id) {
        showError("Google OAuth chưa được tải. Vui lòng thử lại sau.");
        setIsGoogleLoading(false);
        return;
      }

      const selectedRole = watch("role");
      console.log("Initializing Google Sign-In for registration...");
      console.log("Selected role:", selectedRole);
      console.log("Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

      // Use Google Sign-In with popup
      const handleGoogleResponse = async (response: any) => {
        try {
          const idToken = response.credential;
          console.log("Google ID Token received");
          console.log("Token length:", idToken?.length);
          console.log("Token preview:", idToken?.substring(0, 50) + "...");
          console.log("Calling API with role:", selectedRole);

          // Register/Login with Google based on selected role
          const { response: authResponse } = await handleGoogleAuth(
            idToken,
            selectedRole
          );
          success("✅ Đăng ký/Đăng nhập thành công!");
          setTimeout(() => navigate(getRedirectPath(authResponse.role)), 1000);
        } catch (error: any) {
          console.error("Google auth error:", error);
          console.error("Error details:", {
            message: error?.response?.data?.message,
            status: error?.response?.status,
            data: error?.response?.data,
          });

          const errorMessage =
            error?.response?.data?.message ||
            (error?.response?.status === 500
              ? "❌ Lỗi server. Vui lòng kiểm tra backend đang chạy và Google Client ID đúng."
              : "❌ Đăng ký Google thất bại. Tài khoản có thể đã tồn tại hoặc chưa được đăng ký.");

          showError(errorMessage);
        } finally {
          setIsGoogleLoading(false);
        }
      };

      // Initialize with callback
      google.accounts.id.initialize({
        client_id:
          import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
        callback: handleGoogleResponse,
      });

      // Create a temporary container for Google button
      const tempDiv = document.createElement("div");
      tempDiv.style.display = "none";
      document.body.appendChild(tempDiv);

      // Render Google button and auto-click it
      google.accounts.id.renderButton(tempDiv, {
        type: "standard",
        size: "large",
        width: 250,
      });

      console.log("Triggering Google Sign-In...");
      // Auto-click the button
      setTimeout(() => {
        const googleButton = tempDiv.querySelector(
          'div[role="button"]'
        ) as HTMLElement;
        if (googleButton) {
          googleButton.click();
          // Clean up after a short delay
          setTimeout(() => document.body.removeChild(tempDiv), 1000);
        } else {
          console.error("Google button not found");
          showError("❌ Không thể khởi tạo Google Sign-In");
          setIsGoogleLoading(false);
          document.body.removeChild(tempDiv);
        }
      }, 100);
    } catch (error: any) {
      console.error("Google register error:", error);
      showError("❌ Đăng ký Google thất bại: " + (error.message || ""));
      setIsGoogleLoading(false);
    }
  };

  // Log errors khi có thay đổi
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("=== VALIDATION ERRORS ===");
      console.log(errors);
    }
  }, [errors]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    console.log("=== FORM SUBMIT STARTED ===");
    console.log("Form data:", data);
    console.log("Current role:", data.role);

    try {
      if (data.role === "Student") {
        // Gửi OTP cho Student
        const payload = {
          fullName: data.name,
          email: data.email,
          passwordHash: data.password,
        };
        console.log("Sending OTP for Student:", payload);

        const response = await authApi.sendOTPStudent(payload);
        console.log("OTP sent response:", response);

        success("✅ Mã OTP đã được gửi đến email của bạn!");
        setRegistrationEmail(data.email);
        setRegistrationRole("Student");
        setShowOTPModal(true);
      } else {
        // Gửi OTP cho Teacher
        if (!data.organizationName || !data.address) {
          console.error("Missing required teacher fields");
          showError("Giáo viên phải nhập tên trường/tổ chức và địa chỉ");
          setIsLoading(false);
          return;
        }

        const payload = {
          fullName: data.name,
          email: data.email,
          passwordHash: data.password,
          organizationName: data.organizationName,
          organizationAddress: data.address,
        };
        console.log("Sending OTP for Teacher:", payload);

        const response = await authApi.sendOTPTeacher(payload);
        console.log("OTP sent response:", response);

        success("✅ Mã OTP đã được gửi đến email của bạn!");
        setRegistrationEmail(data.email);
        setRegistrationRole("Teacher");
        setShowOTPModal(true);
      }
    } catch (error: any) {
      console.error("=== SEND OTP ERROR ===");
      console.error("Send OTP error:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.message ||
        "❌ Gửi mã OTP thất bại. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      console.log("=== FORM SUBMIT ENDED ===");
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      showError("Vui lòng nhập mã OTP gồm 6 chữ số");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      let response;
      if (registrationRole === "Student") {
        response = await authApi.registerStudent(registrationEmail, otp);
      } else {
        response = await authApi.registerTeacher(registrationEmail, otp);
      }

      console.log("Registration completed:", response);
      success("✅ Đăng ký thành công! Đang chuyển tới trang đăng nhập...");
      setShowOTPModal(false);
      setTimeout(() => navigate("/auth/login"), 1500);
    } catch (error: any) {
      console.error("=== VERIFY OTP ERROR ===");
      console.error("Verify OTP error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "❌ Xác thực OTP thất bại. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const currentRole = watch("role");

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen auth-bg relative flex items-center justify-center p-4">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="w-full max-w-3xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center mb-4"
            >
              <Logo size="lg" />
            </Link>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Tạo tài khoản
            </h1>
            <p className="text-secondary-600">
              Chọn vai trò và điền thông tin để bắt đầu
            </p>
          </div>

          {/* Card */}
          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/30">
            <div className="px-6 md:px-10 py-6">
              <h2 className="text-2xl font-bold text-secondary-900 text-center">
                Đăng Ký Tài Khoản
              </h2>
              <p className="text-secondary-600 text-center mb-6">
                Chọn vai trò của bạn và điền thông tin để tạo tài khoản
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Segmented role toggle */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex w-full md:w-auto bg-white rounded-full p-1 border border-secondary-200">
                    <button
                      type="button"
                      onClick={() => setValue("role", "Student")}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                        currentRole === "Student"
                          ? "bg-secondary-900 text-white"
                          : "text-secondary-700 hover:bg-secondary-50"
                      }`}
                    >
                      Học sinh
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("role", "Teacher")}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                        currentRole === "Teacher"
                          ? "bg-secondary-900 text-white"
                          : "text-secondary-700 hover:bg-secondary-50"
                      }`}
                    >
                      Giáo viên
                    </button>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-sm text-error-600 text-center">
                    {errors.role.message}
                  </p>
                )}

                {/* Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Họ và tên *"
                      placeholder="Nhập họ và tên của bạn"
                      icon={<UserIcon size={16} />}
                      error={errors.name?.message}
                      {...register("name")}
                    />
                  </div>
                  <div>
                    <Input
                      label="Email *"
                      type="email"
                      placeholder={
                        currentRole === "Teacher"
                          ? "teacher@school.edu.vn"
                          : "student@email.com"
                      }
                      icon={<Mail size={16} />}
                      error={errors.email?.message}
                      {...register("email")}
                    />
                  </div>
                </div>

                {/* Teacher only fields */}
                {currentRole === "Teacher" && (
                  <>
                    <Input
                      label="Địa chỉ trường/tổ chức *"
                      placeholder="Nhập địa chỉ của Trường/Tổ chức"
                      icon={<MapPin size={16} />}
                      error={errors.address?.message}
                      {...register("address")}
                    />
                    <Input
                      label="Tên trường/tổ chức *"
                      placeholder="Trường THPT ABC"
                      icon={<Building2 size={16} />}
                      error={errors.organizationName?.message}
                      {...register("organizationName")}
                    />
                  </>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Mật khẩu *"
                      type="password"
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                      icon={<Lock size={16} />}
                      showPasswordToggle
                      error={errors.password?.message}
                      {...register("password")}
                    />
                  </div>
                  <div>
                    <Input
                      label="Xác nhận mật khẩu *"
                      type="password"
                      placeholder="Nhập lại mật khẩu của bạn"
                      icon={<Lock size={16} />}
                      showPasswordToggle
                      error={errors.confirmPassword?.message}
                      {...register("confirmPassword")}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                  onClick={() => {
                    console.log("Button clicked!");
                    console.log("Form errors:", errors);
                    console.log("Is loading:", isLoading);
                  }}
                >
                  {isLoading ? (
                    <Spinner size="sm" />
                  ) : currentRole === "Teacher" ? (
                    "Đăng Ký Giáo Viên"
                  ) : (
                    "Đăng Ký Học Sinh"
                  )}
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

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleRegister}
                  loading={isGoogleLoading}
                  disabled={isGoogleLoading}
                >
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
                  Đăng ký với Google
                </Button>

                <div className="text-center">
                  <span className="text-sm text-secondary-600">
                    Đã có tài khoản?{" "}
                  </span>
                  <Link
                    to="/auth/login"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <h3 className="text-2xl font-bold text-secondary-900 mb-2 text-center">
              Xác thực OTP
            </h3>
            <p className="text-secondary-600 text-center mb-6">
              Chúng tôi đã gửi mã xác thực đến email{" "}
              <strong>{registrationEmail}</strong>
            </p>

            <div className="mb-6">
              <Input
                label="Mã OTP (6 chữ số)"
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                }}
                disabled={isVerifyingOTP}
              >
                Hủy
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerifyOTP}
                loading={isVerifyingOTP}
                disabled={isVerifyingOTP || otp.length !== 6}
              >
                {isVerifyingOTP ? <Spinner size="sm" /> : "Xác nhận"}
              </Button>
            </div>

            <p className="text-sm text-secondary-600 text-center mt-4">
              Không nhận được mã?{" "}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => {
                  setShowOTPModal(false);
                  showError("Vui lòng gửi lại form đăng ký để nhận mã OTP mới");
                }}
              >
                Gửi lại
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
