import { useState, useEffect, useRef } from "react";
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
  Building,
  MapPin,
  Key,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { TopNavbar } from "../../components/layout/TopNavbar";
import { Footer } from "../../components/layout/Footer";
import { Modal } from "../../components/common/Modal";
import { storage } from "../../libs/storage";
import { profileApi } from "../../libs/api/profileApi";
import { authApi } from "../../libs/api/authApi";
import { useToast, ToastContainer } from "../../components/common/Toast";
import type { StudentProfile, TeacherProfile } from "../../types/profile";

// Schema đơn giản cho profile (không có password)
const studentSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
});

const teacherSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phoneNumber: z.string().optional(),
  organizationName: z.string().optional(),
  organizationAddress: z.string().optional(),
});

// Schema riêng cho đổi mật khẩu
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type StudentForm = z.infer<typeof studentSchema>;
type TeacherForm = z.infer<typeof teacherSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profile, setProfile] = useState<
    StudentProfile | TeacherProfile | null
  >(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = storage.getUser();
  const toast = useToast();
  const isTeacher = user?.role === "Teacher";

  const studentForm = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: "" },
  });

  const teacherForm = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      organizationName: "",
      organizationAddress: "",
    },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = isTeacher ? teacherForm : studentForm;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;
    setIsFetching(true);
    try {
      if (isTeacher) {
        const response = await profileApi.getTeacherProfile(parseInt(user.id));
        setProfile(response.profile);
        const p = response.profile as TeacherProfile;
        reset({
          fullName: p.fullName,
          phoneNumber: p.phoneNumber || "",
          organizationName: p.organizationName || "",
          organizationAddress: p.organizationAddress || "",
        });
        if (p.avatarURL) setAvatarPreview(p.avatarURL);
      } else {
        const response = await profileApi.getStudentProfile(parseInt(user.id));
        setProfile(response.profile);
        const p = response.profile as StudentProfile;
        reset({ fullName: p.fullName });
        if (p.avatarURL) setAvatarPreview(p.avatarURL);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Không thể tải thông tin profile"
      );
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: StudentForm | TeacherForm) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      if (isTeacher) {
        const d = data as TeacherForm;
        await profileApi.updateTeacherProfile(
          parseInt(user.id),
          d.fullName,
          d.phoneNumber,
          d.organizationName,
          d.organizationAddress,
          selectedAvatar || undefined
        );
      } else {
        const d = data as StudentForm;
        await profileApi.updateStudentProfile(
          parseInt(user.id),
          d.fullName,
          selectedAvatar || undefined
        );
      }

      // Fetch lại profile để lấy avatar mới (nếu có)
      await fetchProfile();

      // Cập nhật tên và avatar trong storage để TopNavbar hiển thị đúng
      const updatedUser = {
        ...user,
        name: data.fullName,
        avatar: avatarPreview || user.avatar, // Dùng preview hoặc giữ avatar cũ
      };
      storage.setUser(updatedUser);

      // Dispatch event để TopNavbar biết storage đã thay đổi
      window.dispatchEvent(new Event("userUpdated"));

      toast.success("Cập nhật profile thành công");
      setSelectedAvatar(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Cập nhật profile thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordForm) => {
    if (!user?.email) return;
    setIsChangingPassword(true);
    try {
      await authApi.changePassword(
        user.email,
        data.currentPassword,
        data.newPassword
      );
      toast.success("Đổi mật khẩu thành công");
      setShowPasswordModal(false);
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-secondary-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="min-h-screen bg-white flex flex-col">
        <TopNavbar />
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
                <form
                  onSubmit={handleSubmit(onSubmit as any)}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-primary-600" />
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -bottom-2 -right-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-secondary-600">
                      Nhấn để thay đổi ảnh đại diện
                    </p>
                  </div>

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
                      value={user?.email || ""}
                      disabled
                      icon={<Mail size={16} />}
                    />

                    {isTeacher && (
                      <>
                        <Input
                          label="Số điện thoại"
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          icon={<Phone size={16} />}
                          error={(errors as any).phoneNumber?.message}
                          {...register("phoneNumber")}
                        />
                        <Input
                          label="Tên trường/Tổ chức"
                          placeholder="Nhập tên trường hoặc tổ chức"
                          icon={<Building size={16} />}
                          error={(errors as any).organizationName?.message}
                          {...register("organizationName")}
                        />
                        <Input
                          label="Địa chỉ tổ chức"
                          placeholder="Nhập địa chỉ"
                          icon={<MapPin size={16} />}
                          error={(errors as any).organizationAddress?.message}
                          {...register("organizationAddress")}
                        />
                      </>
                    )}
                  </div>

                  {/* Button đổi mật khẩu */}
                  <div className="pt-4 border-t border-secondary-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </div>

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
                      {profile && "idUnique" in profile && (
                        <div className="flex justify-between">
                          <span className="text-secondary-600">ID:</span>
                          <span className="font-medium text-secondary-900">
                            {profile.idUnique}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

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

      {/* Modal đổi mật khẩu */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          passwordForm.reset();
        }}
        title="Đổi mật khẩu"
      >
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="space-y-4"
        >
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            placeholder="Nhập mật khẩu hiện tại"
            showPasswordToggle
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register("currentPassword")}
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            placeholder="Nhập mật khẩu mới"
            showPasswordToggle
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword")}
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            showPasswordToggle
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword")}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false);
                passwordForm.reset();
              }}
            >
              Hủy
            </Button>
            <Button type="submit" loading={isChangingPassword}>
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
