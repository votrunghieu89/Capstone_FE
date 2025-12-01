import { useState, useEffect } from "react";
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
import { profileApi } from "../../../libs/api/profileApi";
import { useToast, ToastContainer } from "../../../components/common/Toast";
import { handleGoogleAuth, getRedirectPath } from "../../../utils/googleAuth";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, success, error: showError, removeToast } = useToast();

  // Debug: Log toasts whenever they change
  useEffect(() => {
    console.log("📋 Toasts state changed:", toasts);
  }, [toasts]);

  // Debug: Test toast on mount
  // useEffect(() => {
  //   setTimeout(() => {
  //     showError("Test error message");
  //   }, 1000);
  // }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Handle Google Login (default to Student role)
  const handleGoogleLogin = async () => {
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

      console.log("Initializing Google Sign-In...");
      console.log("Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

      // Use Google Sign-In with popup instead of One Tap
      const handleGoogleResponse = async (response: any) => {
        try {
          const idToken = response.credential;
          console.log("Google ID Token received");

          // Try Student first, then Teacher if fails
          try {
            const { response: authResponse } = await handleGoogleAuth(
              idToken,
              "Student"
            );
            success("✅ Đăng nhập thành công!");
            setTimeout(
              () => navigate(getRedirectPath(authResponse.role)),
              1000
            );
          } catch (studentError: any) {
            console.log("Student login failed, trying Teacher...");
            const { response: authResponse } = await handleGoogleAuth(
              idToken,
              "Teacher"
            );
            success("✅ Đăng nhập thành công!");
            setTimeout(
              () => navigate(getRedirectPath(authResponse.role)),
              1000
            );
          }
        } catch (error: any) {
          console.error("Google auth error:", error);
          showError(
            error?.response?.data?.message ||
              "❌ Đăng nhập Google thất bại. Vui lòng đăng ký trước."
          );
        } finally {
          setIsGoogleLoading(false);
        }
      };

      // Initialize with callback
        google.accounts.id.initialize({
        client_id: "111414326741-nq9mnuu8a7ft5vfbqgbu860nch4s47r7.apps.googleusercontent.com",
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
      console.error("Google login error:", error);
      showError("❌ Đăng nhập Google thất bại: " + (error.message || ""));
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Gọi API login
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      // Lưu token trước để có thể gọi API profile
      storage.setToken(response.accesToken); // Note: BE có typo "accesToken"
      storage.setRefreshToken(response.refreshToken);

      // Lấy tên thật và ảnh từ profile dựa trên role
      let fullName = response.email.split("@")[0]; // Mặc định lấy từ email
      let avatarURL: string | null = null;

      try {
        if (response.role === "Student") {
          const profileResponse = await profileApi.getStudentProfile(
            response.accountId
          );
          fullName = profileResponse.profile.fullName;
          avatarURL = profileResponse.profile.avatarURL || null;
        } else if (response.role === "Teacher") {
          const profileResponse = await profileApi.getTeacherProfile(
            response.accountId
          );
          fullName = profileResponse.profile.fullName;
          avatarURL = profileResponse.profile.avatarURL || null;
        }
      } catch (profileError) {
        console.warn(
          "Không lấy được profile, dùng tên từ email:",
          profileError
        );
        // Giữ fullName và avatarURL mặc định
      }

      // Tạo user object với tên thật và ảnh
      const user = {
        id: response.accountId.toString(),
        email: response.email,
        name: fullName,
        role: response.role as "Admin" | "Teacher" | "Student",
        avatar: avatarURL,
      };
      storage.setUser(user);

      // Dispatch event để các component khác biết user đã được cập nhật
      window.dispatchEvent(new Event("userUpdated"));

      success("✅ Đăng nhập thành công!");

      // Điều hướng theo role
      setTimeout(() => {
        if (response.role === "Admin") {
          navigate("/admin");
        } else if (response.role === "Teacher") {
          navigate("/teacher");
        } else if (response.role === "Student") {
          navigate("/student");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error: any) {
      console.log("=================");
      console.log("LOGIN ERROR CAUGHT");
      console.log("=================");
      console.error("Login error:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      console.error("Error status:", error?.response?.status);

      let errorMessage =
        "❌ Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 401) {
        errorMessage = "❌ Email hoặc mật khẩu không chính xác.";
      } else if (error?.response?.status === 404) {
        errorMessage = "❌ Tài khoản không tồn tại.";
      } else if (error?.code === "ERR_NETWORK") {
        errorMessage =
          "❌ Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.";
      }

      console.log("=== CALLING showError ===");
      console.log("Error message:", errorMessage);
      console.log("Current toasts:", toasts);

      // Force show error immediately
      showError(errorMessage);

      // Debug after a short delay to see if state updated
      setTimeout(() => {
        console.log("After showError (delayed), toasts:", toasts);
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };
  // Check database connection on component mount
  // useEffect(() => {
  //   const checkDatabase = async () => {
  //     try {
  //       const result = await authApi.checkDb();
  //       console.log("DB check result:", result);
  //     } catch (error) {
  //       console.error("DB check error:", error);
  //     }
  //   };

  //   checkDatabase();
  // }, []);
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen auth-bg relative flex items-center justify-center p-4">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="w-full max-w-3xl relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
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

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
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
                  Đăng nhập với Google
                </Button>

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
    </>
  );
}
