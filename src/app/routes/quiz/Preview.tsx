import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  Play,
  User,
  Heart,
  Calendar,
  Radio,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { storage } from "../../../libs/storage";

export default function QuizPreview() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();

  // Check if this quiz is from a class
  const classId = searchParams.get("classId");
  const fromClass = classId !== null;

  // Get current user to check role
  const currentUser = storage.getUser();
  const isTeacher = currentUser?.role === "Teacher";

  // Mock dữ liệu preview – sau sẽ gọi API theo quizId
  const quiz = {
    id: quizId ?? "q-demo",
    title: "Phương trình bậc hai",
    description: "Ôn tập cực nhanh kiến thức về phương trình bậc hai cơ bản.",
    author: "GV. Nguyễn Văn Lam",
    teacherName: "Nguyễn Văn Lam",
    questions: 12,
    totalQuestions: 12,
    timePerQuestion: 20,
    dateCreated: "2025-10-17T20:19:19.9083377",
    expiredDate: "2025-11-17T13:17:34.749",
    message: "Chúc các em làm bài tốt!",
    avatarURL:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop",
  };

  // Yêu thích (mock bằng localStorage)
  const [isFav, setIsFav] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("fav_quizzes");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      return ids.includes(quiz.id);
    } catch {
      return false;
    }
  });

  const toggleFav = () => {
    try {
      const raw = localStorage.getItem("fav_quizzes");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = isFav
        ? ids.filter((id) => id !== quiz.id)
        : Array.from(new Set([...ids, quiz.id]));
      localStorage.setItem("fav_quizzes", JSON.stringify(next));
      setIsFav(!isFav);
    } catch {
      setIsFav(!isFav);
    }
  };

  const handleStart = () => {
    if (fromClass && classId) {
      // Quiz from class - will show leaderboard after completion
      navigate(`/play/live/class-${classId}-${quiz.id}`);
    } else {
      // Solo/Practice mode - will show personal result
      navigate(`/play/live/solo-${quiz.id}`);
    }
  };

  const handleHostLive = () => {
    // Giáo viên tổ chức live - chuyển đến trang phòng chờ (shared lobby)
    // Pass state to indicate this is the host/creator
    navigate(`/lobby/${quiz.id}`, { state: { isHost: true } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500">
            {quiz.cover && (
              <img
                src={quiz.cover}
                alt={quiz.title}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            {/* Favorite button */}
            <button
              aria-label="Yêu thích"
              onClick={toggleFav}
              className={`absolute top-4 right-4 rounded-full border px-3 py-2 transition shadow-lg ${
                isFav
                  ? "bg-rose-500 border-rose-600 text-white"
                  : "bg-white border-white text-secondary-700"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                <span className="text-sm font-medium">
                  {isFav ? "Đã yêu thích" : "Yêu thích"}
                </span>
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 py-6 relative">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white shadow-lg -mt-16 bg-white flex-shrink-0 relative z-10">
                {quiz.avatarURL ? (
                  <img
                    src={quiz.avatarURL}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/80?text=Quiz";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 pt-2">
                <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
                  {quiz.title}
                </h1>
                <p className="text-secondary-600 mb-2">{quiz.description}</p>
                <div className="flex items-center gap-2 text-secondary-600 text-sm">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{quiz.teacherName}</span>
                </div>
              </div>
            </div>

            {/* Message from teacher */}
            {quiz.message && (
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">
                    💬 Lời nhắn từ giáo viên:
                  </span>
                  <br />
                  <span className="italic">{quiz.message}</span>
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50 rounded-xl px-4 py-3 border border-primary-100">
                <div className="text-xs text-primary-600 mb-1 font-medium">
                  Câu hỏi
                </div>
                <div className="text-2xl font-bold text-primary-700">
                  {quiz.totalQuestions}
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl px-4 py-3 border border-purple-100">
                <div className="flex items-center gap-1 text-xs text-purple-600 mb-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Thời gian/câu
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {quiz.timePerQuestion}s
                </div>
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                <div className="flex items-center gap-1 text-xs text-green-600 mb-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Ngày tạo
                </div>
                <div className="text-sm font-bold text-green-700">
                  {new Date(quiz.dateCreated).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isTeacher ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 py-3 text-base border-primary-600 text-primary-600 hover:bg-primary-50"
                    onClick={handleStart}
                  >
                    <Play className="w-5 h-5 mr-2" /> Làm thử
                  </Button>
                  <Button
                    className="flex-1 py-3 text-base bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700"
                    onClick={handleHostLive}
                  >
                    <Radio className="w-5 h-5 mr-2" /> Tổ chức Live
                  </Button>
                </>
              ) : (
                <Button className="flex-1 py-3 text-base" onClick={handleStart}>
                  <Play className="w-5 h-5 mr-2" /> Bắt đầu làm Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
