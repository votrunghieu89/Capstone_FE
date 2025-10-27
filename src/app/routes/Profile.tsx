import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { TopNavbar } from "../../components/layout/TopNavbar";
import { Footer } from "../../components/layout/Footer";
import { storage } from "../../libs/storage";

const profileSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Cần nhập mật khẩu hiện tại để đổi mật khẩu",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    }
  );

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const user = storage.getUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      // TODO: Call update profile API
      console.log("Update profile:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local storage
      const updatedUser = {
        ...user,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
      };
      storage.setUser(updatedUser);

      // TODO: Show success message
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = () => {
    // TODO: Implement avatar upload
    console.log("Change avatar");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Cài đặt tài khoản
              </h1>
              <p className="text-secondary-600">Quản lý thông tin cá nhân</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-content">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar Section */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <User className="w-12 h-12 text-primary-600" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -bottom-2 -right-2"
                      onClick={handleAvatarChange}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-secondary-600">
                    Nhấn để thay đổi ảnh đại diện
                  </p>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Thông tin cơ bản
                  </h3>

                  <Input
                    label="Họ và tên"
                    placeholder="Nhập họ và tên"
                    icon={<User size={16} />}
                    error={errors.fullName?.message}
                    {...register("fullName")}
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="Nhập email"
                    icon={<Mail size={16} />}
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <Input
                    label="Số điện thoại"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    icon={<Phone size={16} />}
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Đổi mật khẩu
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Để trống nếu không muốn đổi mật khẩu
                  </p>

                  <Input
                    label="Mật khẩu hiện tại"
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    icon={<Eye size={16} />}
                    showPasswordToggle
                    error={errors.currentPassword?.message}
                    {...register("currentPassword")}
                  />

                  <Input
                    label="Mật khẩu mới"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    icon={<Eye size={16} />}
                    showPasswordToggle
                    error={errors.newPassword?.message}
                    {...register("newPassword")}
                  />

                  <Input
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    icon={<Eye size={16} />}
                    showPasswordToggle
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </div>

                {/* Role Information */}
                <div className="bg-secondary-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Thông tin vai trò
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Vai trò:</span>
                      <span className="font-medium text-secondary-900">
                        {user?.role === "Teacher"
                          ? "Giáo viên"
                          : user?.role === "Student"
                          ? "Học sinh"
                          : "Quản trị viên"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Ngày tạo:</span>
                      <span className="font-medium text-secondary-900">
                        {new Date().toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Đang lưu..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
