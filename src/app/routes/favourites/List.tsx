import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { QuizCard } from "../../../components/common/QuizCard";
import { TopNavbar } from "../../../components/layout/TopNavbar";
import { Footer } from "../../../components/layout/Footer";
import { storage } from "../../../libs/storage";
import {
  favouriteService,
  FavouriteQuizDTO,
} from "../../../services/favouriteService";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { apiClient } from "../../../libs/apiClient";

export default function FavouriteQuizzes() {
  const navigate = useNavigate();
  const currentUser = storage.getUser();

  const [selectedTopic, setSelectedTopic] = useState("all");
  const [favouriteQuizzes, setFavouriteQuizzes] = useState<FavouriteQuizDTO[]>(
    []
  );
  const [allTopics, setAllTopics] = useState<
    { topicId: number; topicName: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [pendingRemoveQuizId, setPendingRemoveQuizId] = useState<number | null>(
    null
  );

  // Debug user data
  console.log("=== Favourites Page ===");
  console.log("Current User:", currentUser);
  console.log("Has accountId:", currentUser?.accountId);
  console.log("Has id:", currentUser?.id);

  const didFetchRef = useRef(false);

  // Fetch all topics from API
  useEffect(() => {
    const fetchAllTopics = async () => {
      try {
        const topicsData = await apiClient.get<any[]>("/Topic/getAllTopic");
        const topicsList = (Array.isArray(topicsData) ? topicsData : []).map(
          (t: any) => ({
            topicId: t.topicId || t.id,
            topicName: t.topicName || t.name,
          })
        );
        setAllTopics(topicsList);
      } catch (err) {
        console.error("Error fetching topics:", err);
        // Không set error vì không ảnh hưởng đến việc hiển thị trang
      }
    };

    fetchAllTopics();
  }, []);

  // Fetch favourite quizzes from API
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    const fetchFavouriteQuizzes = async () => {
      const accountIdRaw = currentUser?.accountId || currentUser?.id;

      // Convert to number if it's a string
      const accountId =
        typeof accountIdRaw === "string"
          ? parseInt(accountIdRaw)
          : accountIdRaw;

      console.log(
        "Trying to fetch with accountId:",
        accountId,
        "(type:",
        typeof accountId,
        ")"
      );

      if (!accountId || isNaN(accountId)) {
        console.error("No valid accountId found!");
        setError("Vui lòng đăng nhập để xem danh sách yêu thích");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await favouriteService.getAllFavouriteQuizzes(accountId);

        // Fix duplicate base URL issue and handle null/undefined
        const fixedData = data.map((quiz) => {
          let avatarURL = quiz.avatarURL || "";

          // Fix duplicate base URL if exists
          if (avatarURL) {
            avatarURL = avatarURL.replace(
              /^https?:\/\/[^\/]+\/https?:\/\//,
              "https://"
            );
          }

          return {
            ...quiz,
            avatarURL: avatarURL,
          };
        });

        console.log("Favourite quizzes data:", fixedData);
        console.log("Number of quizzes:", fixedData.length);
        console.log(
          "Topics:",
          fixedData.map((q) => q.topicName)
        );
        setFavouriteQuizzes(fixedData);
      } catch (err: any) {
        console.error("Error fetching favourite quizzes:", err);
        console.error("Error details:", err?.response?.data);

        let errorMsg = "Không thể tải danh sách quiz yêu thích";

        // Handle specific BE errors
        if (err?.response?.status === 500) {
          // BE null reference error - quiz has null AvatarURL
          errorMsg =
            "⚠️ Có quiz với dữ liệu không hợp lệ. Vui lòng liên hệ quản trị viên để kiểm tra dữ liệu.";
          console.error(
            "BE Error: Quiz with null AvatarURL detected. Need to fix data in database."
          );
        } else if (err?.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });

        // Set empty array on error so UI can still render
        setFavouriteQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavouriteQuizzes();
  }, [currentUser?.accountId]);

  // Get all topics from API and sort
  const topics = [
    "Tất cả",
    ...allTopics
      .map((t) => t.topicName)
      .filter((topic) => topic && topic.trim() !== "")
      .sort((a, b) => a.localeCompare(b, "vi")),
  ];

  const filteredQuizzes = favouriteQuizzes.filter((quiz) => {
    const matchesTopic =
      selectedTopic === "all" || quiz.topicName === selectedTopic;
    return matchesTopic;
  });

  const handleRemoveFavourite = (quizId: number) => {
    setPendingRemoveQuizId(quizId);
    setShowRemoveConfirm(true);
  };

  const closeRemoveConfirm = () => {
    setShowRemoveConfirm(false);
    setPendingRemoveQuizId(null);
  };

  const confirmRemoveFavourite = async () => {
    if (pendingRemoveQuizId === null) return;
    const quizId = pendingRemoveQuizId;

    const accountIdRaw = currentUser?.accountId || currentUser?.id;
    const accountId =
      typeof accountIdRaw === "string" ? parseInt(accountIdRaw) : accountIdRaw;

    if (!accountId || isNaN(accountId)) {
      toast.error("Vui lòng đăng nhập để sử dụng chức năng này");
      return;
    }

    // Lưu danh sách cũ để có thể rollback nếu cần
    const previousQuizzes = favouriteQuizzes;

    try {
      // Tạm thời xóa khỏi UI (optimistic update)
      setFavouriteQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));

      closeRemoveConfirm();

      // Gọi API xóa thực sự
      await favouriteService.removeFavouriteQuizInDetail(quizId, accountId);

      toast.success("✅ Đã xóa quiz khỏi danh sách yêu thích!");
    } catch (err: any) {
      console.error("Error removing favourite:", err);
      // Rollback nếu có lỗi
      const errorMsg = err?.message || "Không thể xóa quiz khỏi yêu thích";
      toast.error(errorMsg);

      setFavouriteQuizzes(previousQuizzes);
      closeRemoveConfirm();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600">
              Đang tải danh sách yêu thích...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error or not logged in
  if (error) {
    const isLoginError = error.includes("đăng nhập");

    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            {isLoginError ? (
              <>
                <Heart className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  ⚠️ {error}
                </h3>
                <p className="text-secondary-600 mb-6">
                  Bạn cần đăng nhập để xem danh sách quiz yêu thích
                </p>
                <button
                  onClick={() => navigate("/auth/login")}
                  className="btn-primary px-6 py-2"
                >
                  Đăng nhập ngay
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  {error}
                </h3>
                <p className="text-secondary-600 mb-6">
                  Đã xảy ra lỗi khi tải dữ liệu
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary px-6 py-2"
                >
                  Thử lại
                </button>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <TopNavbar />
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-error-600" />
            <h1 className="text-4xl font-bold text-secondary-900">
              Quiz yêu thích
            </h1>
          </div>
          <p className="text-secondary-600">
            Danh sách quiz bạn đã thêm vào yêu thích
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 flex-1">
        {/* Results Count & Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-lg font-medium text-secondary-900">
              {selectedTopic === "all"
                ? `${filteredQuizzes.length} quiz yêu thích`
                : `${filteredQuizzes.length} quiz yêu thích - ${selectedTopic}`}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <select
              className="input w-full sm:w-64"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              {topics.map((topic) => (
                <option key={topic} value={topic === "Tất cả" ? "all" : topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quiz Grid (simplified card) */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.quizId} className="relative">
                <QuizCard
                  thumbnailUrl={quiz.avatarURL}
                  title={quiz.title}
                  topic={quiz.topicName}
                  questionCount={quiz.totalQuestions}
                  plays={quiz.totalParticipants}
                  onDetail={() => navigate(`/quiz/preview/${quiz.quizId}`)}
                />
                <button
                  className="absolute top-3 right-3 text-error-600 hover:text-error-700"
                  onClick={() => handleRemoveFavourite(quiz.quizId)}
                  title="Bỏ yêu thích"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {selectedTopic === "all"
                ? "Chưa có quiz yêu thích nào"
                : `Chưa có quiz yêu thích nào thuộc chủ đề "${selectedTopic}"`}
            </h3>
            <p className="text-secondary-600 mb-6">
              {selectedTopic === "all"
                ? "Thêm quiz vào yêu thích để dễ dàng truy cập sau này"
                : "Thử chọn chủ đề khác hoặc thêm quiz vào yêu thích"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="btn-primary px-6 py-2 inline-flex items-center"
            >
              <Heart className="w-4 h-4 mr-2" />
              Khám phá Quiz
            </button>
          </div>
        )}
      </div>
      <Footer />

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={closeRemoveConfirm}
        onConfirm={confirmRemoveFavourite}
        title="Bỏ quiz khỏi yêu thích"
        message="Bạn có chắc muốn xóa quiz này khỏi danh sách yêu thích?"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="destructive"
      />
    </div>
  );
}
