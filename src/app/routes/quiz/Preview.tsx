import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Play, User, Heart, Calendar, Radio } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { storage } from "../../../libs/storage";
import { quizService, QuizDetailHP } from "../../../services/quizService";
import { favouriteService } from "../../../services/favouriteService";
import { toast } from "react-hot-toast";

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

  // Debug user data
  console.log("Current User Data:", currentUser);
  console.log("Account ID:", currentUser?.accountId || currentUser?.id);

  // State for quiz data
  const [quiz, setQuiz] = useState<QuizDetailHP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Yêu thích state
  const [isFav, setIsFav] = useState<boolean>(false);
  const [isFavLoading, setIsFavLoading] = useState(false);

  // Fetch quiz details from API
  useEffect(() => {
    const fetchQuizDetail = async () => {
      console.log("=== Fetching quiz detail ===");
      console.log("QuizId from URL:", quizId);

      if (!quizId) {
        console.error("No quizId provided");
        setError("Không tìm thấy ID quiz");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("Calling API for quizId:", quizId);
        // Fetch quiz detail first
        const data = await quizService.getQuizDetailHP(Number(quizId));
        console.log("Quiz data received:", data);
        console.log("Avatar URL:", data?.avatarURL);

        // Fix duplicate base URL issue
        if (data?.avatarURL) {
          // Remove duplicate base URL if exists
          data.avatarURL = data.avatarURL.replace(
            /^https?:\/\/[^\/]+\/https?:\/\//,
            "https://"
          );
          console.log("Fixed Avatar URL:", data.avatarURL);
        }

        setQuiz(data);

        // Only check favourite status if quiz loaded successfully AND user is logged in
        const accountIdRaw = currentUser?.accountId || currentUser?.id;
        const accountId =
          typeof accountIdRaw === "string"
            ? parseInt(accountIdRaw)
            : accountIdRaw;

        if (accountId && !isNaN(accountId) && data?.quizId) {
          try {
            const isFavourite = await favouriteService.isFavouriteExists(
              accountId,
              data.quizId
            );
            setIsFav(isFavourite);
          } catch (err) {
            console.error("Error checking favourite status:", err);
            // Don't show error for favourite check, just set to false
            setIsFav(false);
          }
        }
      } catch (err: any) {
        console.error("=== Error fetching quiz detail ===");
        console.error("Error object:", err);
        console.error("Error code:", err?.code);
        console.error("Error response:", err?.response);

        let errorMsg = "Không thể tải thông tin quiz";

        if (err?.code === "ECONNABORTED") {
          errorMsg = "Yêu cầu quá lâu. Vui lòng kiểm tra kết nối Backend";
        } else if (err?.code === "ERR_NETWORK") {
          errorMsg =
            "Không thể kết nối tới Backend. Vui lòng kiểm tra Backend có đang chạy không";
        } else if (err?.response?.status === 404) {
          errorMsg = "Quiz không tồn tại";
        } else if (err?.response?.status === 401) {
          errorMsg = "Vui lòng đăng nhập để xem quiz";
        } else if (err?.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        console.log("=== Loading complete, isLoading set to false ===");
        setIsLoading(false);
      }
    };

    fetchQuizDetail();
  }, [quizId]); // Remove currentUser from deps to prevent re-fetch loop

  const toggleFav = async () => {
    // Get account ID from either accountId or id field and convert to number
    const accountIdRaw = currentUser?.accountId || currentUser?.id;
    const accountId =
      typeof accountIdRaw === "string" ? parseInt(accountIdRaw) : accountIdRaw;

    console.log("toggleFav called", {
      hasQuiz: !!quiz,
      currentUser: currentUser,
      accountIdRaw: accountIdRaw,
      accountId: accountId,
      accountIdType: typeof accountId,
      isFavLoading,
      isFav,
    });

    if (!quiz) {
      console.error("No quiz data");
      toast.error("Chưa có thông tin quiz");
      return;
    }

    if (!accountId || isNaN(accountId)) {
      console.error("Not logged in - no valid account ID found");
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    if (isFavLoading) {
      console.log("Already loading...");
      return;
    }

    try {
      setIsFavLoading(true);

      if (isFav) {
        // Can't remove from favourites - need favouriteId from BE
        toast.error(
          "Để xóa yêu thích, vui lòng vào trang 'Yêu thích' và xóa ở đó"
        );
        setIsFavLoading(false);
        return;
      } else {
        // Add to favourites
        console.log("Adding to favourites:", accountId, quiz.quizId);
        const result = await favouriteService.addFavouriteQuiz(
          accountId,
          quiz.quizId
        );
        console.log("Add favourite result:", result);
        setIsFav(true);
        toast.success("Đã thêm vào danh sách yêu thích!");
      }
    } catch (err: any) {
      console.error("Error toggling favourite:", err);
      const errorMsg = err?.message || "Không thể thực hiện thao tác";
      toast.error(errorMsg);
    } finally {
      setIsFavLoading(false);
    }
  };

  const handleStart = () => {
    if (!quiz) return;

    if (fromClass && classId) {
      // Quiz from class - will show leaderboard after completion
      navigate(`/play/live/class-${classId}-${quiz.quizId}`);
    } else {
      // Solo/Practice mode - will show personal result
      navigate(`/play/live/solo-${quiz.quizId}`);
    }
  };

  const handleHostLive = () => {
    if (!quiz) return;
    // Giáo viên tổ chức live - chuyển đến trang phòng chờ (shared lobby)
    // Pass state to indicate this is the host/creator
    navigate(`/lobby/${quiz.quizId}`, { state: { isHost: true } });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 px-4 py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Đang tải thông tin quiz...</p>
          <p className="text-xs text-secondary-400 mt-2">Quiz ID: {quizId}</p>
          <p className="text-xs text-secondary-400">
            Mở DevTools Console (F12) để xem chi tiết
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 px-4 py-10 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Không thể tải quiz
          </h2>
          <p className="text-secondary-600 mb-4">
            {error || "Không tìm thấy thông tin quiz"}
          </p>
          {error?.includes("Backend") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                💡 Gợi ý khắc phục:
              </p>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>Kiểm tra Backend có đang chạy không (port 7126)</li>
                <li>
                  Mở terminal và chạy:{" "}
                  <code className="bg-yellow-100 px-1 rounded">
                    cd BE; dotnet run
                  </code>
                </li>
                <li>Đợi Backend khởi động xong rồi refresh lại trang</li>
              </ul>
            </div>
          )}
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

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
            {quiz.avatarURL && quiz.avatarURL.trim() !== "" ? (
              <img
                src={quiz.avatarURL}
                alt={quiz.title}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  console.error("Image failed to load:", quiz.avatarURL);
                  // Hide broken image and show fallback
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "absolute inset-0 flex flex-col items-center justify-center";
                    fallback.innerHTML = `
                      <svg class="w-16 h-16 text-white text-opacity-50 mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                      <p class="text-white text-opacity-70 text-sm">Ảnh không tải được</p>
                    `;
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg
                  className="w-16 h-16 text-white text-opacity-50 mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-white text-opacity-70 text-sm">
                  Chưa có hình ảnh
                </p>
              </div>
            )}

            {/* Favorite button */}
            {currentUser && (
              <button
                type="button"
                aria-label="Yêu thích"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Favourite button clicked!", {
                    isFav,
                    isFavLoading,
                  });
                  toggleFav();
                }}
                disabled={isFavLoading}
                className={`absolute top-4 right-4 z-10 rounded-full border px-3 py-2 transition shadow-lg hover:scale-105 active:scale-95 ${
                  isFav
                    ? "bg-rose-500 border-rose-600 text-white"
                    : "bg-white border-white text-secondary-700 hover:bg-secondary-50"
                } ${
                  isFavLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                  <span className="text-sm font-medium">
                    {isFavLoading
                      ? "Đang xử lý..."
                      : isFav
                      ? "Đã yêu thích"
                      : "Yêu thích"}
                  </span>
                </span>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 py-6 relative">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white shadow-lg -mt-16 bg-gradient-to-br from-primary-100 to-purple-100 flex-shrink-0 relative z-10">
                {quiz.avatarURL && quiz.avatarURL.trim() !== "" ? (
                  <img
                    src={quiz.avatarURL}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Replace with icon on error
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector("svg")) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                            <svg class="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                          </div>
                        `;
                      }
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
                  <span className="font-medium">
                    {quiz.createBy || "Giáo viên"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50 rounded-xl px-4 py-3 border border-primary-100">
                <div className="text-xs text-primary-600 mb-1 font-medium">
                  Câu hỏi
                </div>
                <div className="text-2xl font-bold text-primary-700">
                  {quiz.totalQuestions || 0}
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl px-4 py-3 border border-purple-100">
                <div className="flex items-center gap-1 text-xs text-purple-600 mb-1 font-medium">
                  <User className="w-3.5 h-3.5" />
                  Lượt chơi
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {quiz.totalParticipants || 0}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                <div className="flex items-center gap-1 text-xs text-green-600 mb-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Ngày tạo
                </div>
                <div className="text-sm font-bold text-green-700">
                  {new Date(quiz.createdDate).toLocaleDateString("vi-VN")}
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
