import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  RotateCcw,
  Award,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { storage } from "../../../libs/storage";
import {
  offlineQuizService,
  OfflineResultDetailViewDTO,
} from "../../../services/offlineQuizService";
import { Spinner } from "../../../components/common/Spinner";
import { toast } from "react-hot-toast";

export default function SoloResult() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] =
    useState<OfflineResultDetailViewDTO | null>(null);

  // Load result từ API
  useEffect(() => {
    const loadResult = async () => {
      if (!quizId) {
        setError("Không tìm thấy quiz ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const user = storage.getUser();
        const studentIdRaw = user?.id || user?.accountId;
        if (!studentIdRaw) {
          throw new Error("Vui lòng đăng nhập để xem kết quả");
        }

        const studentId =
          typeof studentIdRaw === "string"
            ? parseInt(studentIdRaw)
            : studentIdRaw;

        const result = await offlineQuizService.getResult(
          studentId,
          parseInt(quizId),
          null // Solo mode không có qgId
        );

        setResultData(result);
      } catch (err: any) {
        setError(err.message || "Không thể tải kết quả");
        toast.error(err.message || "Không thể tải kết quả");
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="text-primary-600" />
          <p className="mt-4 text-secondary-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-xl font-semibold text-secondary-900 mb-4">
            {error || "Không tìm thấy kết quả"}
          </p>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  // Tính toán từ dữ liệu API
  const scorePercent = resultData.score ?? 0;
  const correctAnswers = resultData.correctCount ?? 0;
  const totalQuestions = resultData.totalQuestion ?? 0;
  const totalTime = resultData.duration ?? 0;
  const averageTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;
  const accuracyPercent =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
  const questionDetails = resultData.questionDetails ?? [];

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Xuất sắc! 🎉";
    if (score >= 70) return "Tốt lắm! 👏";
    if (score >= 50) return "Khá tốt! 👍";
    return "Cố gắng thêm nhé! 💪";
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600";
    if (score >= 70) return "from-blue-500 to-cyan-600";
    if (score >= 50) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  const handlePlayAgain = () => {
    navigate(`/quiz/preview/${quizId}`, {
      state: { from: `/quiz/result/${quizId}` },
    });
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header - Result Card */}
        <div
          className={`bg-gradient-to-r ${getPerformanceColor(
            scorePercent
          )} rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-8`}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/30 backdrop-blur-md rounded-full mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">
              {getPerformanceMessage(scorePercent)}
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Bạn đã hoàn thành quiz: {resultData.quizTitle}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-black mb-1">
                {scorePercent}
              </div>
              <div className="text-sm text-white/90">Điểm số</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-black mb-1">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm text-white/90">Câu đúng</div>
            </div>

            {resultData.rank && (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                <div className="text-3xl md:text-4xl font-black mb-1">
                  #{resultData.rank}
                </div>
                <div className="text-sm text-white/90">Xếp hạng</div>
              </div>
            )}

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-black mb-1">
                {totalTime}s
              </div>
              <div className="text-sm text-white/90">Thời gian</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              onClick={handlePlayAgain}
              variant="outline"
              className="bg-white/90 hover:bg-white text-purple-600 px-6 py-3"
            >
              <RotateCcw className="w-5 h-5" />
              Chơi lại
            </Button>

            <Button
              onClick={handleGoHome}
              className="bg-white/90 hover:bg-white text-purple-600 px-6 py-3"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </Button>
          </div>
        </div>

        {/* Personal Stats */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="w-7 h-7 text-purple-600" />
            Kết quả của bạn
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-purple-600">
                {accuracyPercent}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Độ chính xác</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-green-600">
                {correctAnswers}
              </div>
              <div className="text-sm text-gray-600 mt-1">Câu đúng</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-blue-600">
                {averageTime}s
              </div>
              <div className="text-sm text-gray-600 mt-1">TB/câu</div>
            </div>
          </div>
        </div>

        {/* Question Details */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Chi tiết từng câu hỏi
          </h2>

          <div className="space-y-4">
            {questionDetails.map((question, index) => {
              const options = question.options ?? [];
              const isCorrect =
                question.selectedOptionId === question.correctOptionId;

              return (
                <div
                  key={question.questionId}
                  className={`rounded-2xl p-6 border-2 ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-gray-900 flex-1">
                          {question.questionContent}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {isCorrect ? (
                        <div className="flex items-center gap-2 text-green-700 font-bold">
                          <CheckCircle className="w-5 h-5" />
                          <span>Đúng</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-700 font-bold">
                          <XCircle className="w-5 h-5" />
                          <span>Sai</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    {options.map((option) => {
                      const isSelected =
                        option.optionId === question.selectedOptionId;
                      const isCorrectOpt =
                        option.optionId === question.correctOptionId;

                      return (
                        <div
                          key={option.optionId}
                          className={`p-3 rounded-lg border ${
                            isCorrectOpt
                              ? "bg-green-100 border-green-300"
                              : isSelected
                              ? "bg-red-100 border-red-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrectOpt && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {isSelected && !isCorrectOpt && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span
                              className={
                                isSelected || isCorrectOpt
                                  ? "font-semibold"
                                  : ""
                              }
                            >
                              {option.optionContent}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
