import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  User,
  Play,
  ArrowLeft,
  Users,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Logo } from "../../../components/common/Logo";

export default function JoinByPin() {
  const [pinCode, setPinCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!pinCode.trim() || !nickname.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call join session API
      console.log("Joining session:", { pinCode, nickname });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to shared lobby (public route, no role restriction)
      navigate(`/lobby/${pinCode}`);
    } catch (error) {
      console.error("Join session error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(236,72,153,0.9) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Tham gia Quiz
          </h1>
          <p className="text-white/90">Nhập mã PIN để tham gia quiz</p>
        </div>

        {/* Join Form */}
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-2xl border border-white/30">
          <div className="px-6 md:px-8 py-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoin();
              }}
              className="space-y-6"
            >
              <Input
                label="Mã PIN"
                placeholder="Nhập mã PIN (VD: ABC123)"
                icon={<Hash size={16} />}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />

              <Input
                label="Tên hiển thị"
                placeholder="Nhập tên của bạn"
                icon={<User size={16} />}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading || !pinCode.trim() || !nickname.trim()}
              >
                {isLoading ? (
                  "Đang tham gia..."
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Tham gia Quiz
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Quiz Info Preview */}
        {pinCode.length >= 3 && (
          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl border border-white/30 mt-6">
            <div className="px-6 md:px-8 py-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Thông tin Quiz
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      Kiểm tra Toán học lớp 10
                    </p>
                    <p className="text-sm text-secondary-600">
                      Bài kiểm tra về đại số và hình học
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      25 người chơi
                    </p>
                    <p className="text-sm text-secondary-600">Đã tham gia</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">30 phút</p>
                    <p className="text-sm text-secondary-600">
                      Thời gian dự kiến
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
