import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Spinner } from "../../../components/common/Spinner";
import { storage } from "../../../libs/storage";
import {
  offlineQuizService,
  OfflineResultDetailViewDTO,
} from "../../../services/offlineQuizService";
import { toast } from "react-hot-toast";

export default function QuizResultView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] =
    useState<OfflineResultDetailViewDTO | null>(null);

  const qgIdFromParams = useMemo(() => {
    const qgIdQuery = searchParams.get("qgId");
    if (qgIdQuery) return parseInt(qgIdQuery, 10);
    const stateQGId = (location.state as any)?.qgId;
    if (stateQGId) return Number(stateQGId);
    return null;
  }, [searchParams, location.state]);

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
            ? parseInt(studentIdRaw, 10)
            : studentIdRaw;

        const result = await offlineQuizService.getResult(
          studentId,
          parseInt(quizId, 10),
          qgIdFromParams ?? undefined
        );

        setResultData(result);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải kết quả";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [quizId, qgIdFromParams]);

  const handleBackToClass = () => navigate("/student/classes");

  const handlePlayAgain = () => {
    if (!quizId) return;
    navigate(`/quiz/preview/${quizId}`, {
      state: { from: location.pathname, qgId: qgIdFromParams },
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-secondary-700 text-lg mb-4">
            {error || "Không tìm thấy kết quả"}
          </p>
          <Button onClick={handleBackToClass}>Quay về lớp học</Button>
        </div>
      </div>
    );
  }

  const score = resultData.score ?? 0;
  const correctAnswers = resultData.correctCount ?? 0;
  const totalQuestions = resultData.totalQuestion ?? 0;
  const duration = resultData.duration ?? 0;
  const averageTime =
    totalQuestions > 0 ? Math.round(duration / totalQuestions) : 0;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
  const questionDetails = resultData.questionDetails ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={handleBackToClass}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-700 bg-white rounded-full shadow-md border border-primary-100 hover:bg-primary-50 hover:text-primary-900 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay về lớp học
        </button>

        {/* Hero Card */}
        <div
          className={`bg-gradient-to-r ${getPerformanceColor(
            score
          )} rounded-3xl p-8 text-white shadow-2xl`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/30 flex items-center justify-center">
                  <Trophy className="w-9 h-9 text-white" />
                </div>
                <div>
                  <p className="text-sm uppercase text-white/70">
                    Kết quả bài làm
                  </p>
                  <h1 className="text-3xl font-black">
                    {getPerformanceMessage(score)}
                  </h1>
                </div>
              </div>
              <p className="text-white/90 text-lg">
                Bạn đã hoàn thành quiz:{" "}
                <span className="font-semibold">{resultData.quizTitle}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                <div className="text-3xl font-black">{score}</div>
                <div className="text-xs text-white/90">Điểm số</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                <div className="text-3xl font-black">
                  {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-xs text-white/90">Câu đúng</div>
              </div>
              {resultData.rank !== undefined && resultData.rank !== null && (
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black">#{resultData.rank}</div>
                  <div className="text-xs text-white/90">Xếp hạng</div>
                </div>
              )}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
                <div className="text-3xl font-black">{duration}s</div>
                <div className="text-xs text-white/90">Thời gian</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-white/80">
            Nếu muốn làm lại quiz, quay về trang lớp và mở lại bài kiểm tra.
          </div>
        </div>

        {/* Personal Stats */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-primary-600" />
            Kết quả của bạn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 rounded-2xl p-5 text-center">
              <Target className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <div className="text-4xl font-black text-primary-700">
                {accuracy}%
              </div>
              <p className="text-sm text-secondary-500 mt-1">Độ chính xác</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-5 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-4xl font-black text-green-600">
                {correctAnswers}
              </div>
              <p className="text-sm text-secondary-500 mt-1">Câu đúng</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-4xl font-black text-blue-600">
                {averageTime}s
              </div>
              <p className="text-sm text-secondary-500 mt-1">Thời gian TB/câu</p>
            </div>
          </div>
        </div>

        {/* Question Detail */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h3 className="text-2xl font-bold text-secondary-900 mb-6">
            Chi tiết từng câu hỏi
          </h3>

          <div className="space-y-4">
            {questionDetails.map((question, index) => {
              const options = question.options ?? [];
              const isCorrect =
                question.selectedOptionId === question.correctOptionId;

              return (
                <div
                  key={question.questionId}
                  className={`rounded-2xl p-5 border-2 ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="font-semibold text-secondary-900">
                        {question.questionContent}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 font-semibold ${
                        isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Đúng
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Sai
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {options.map((option) => {
                      const isSelected =
                        option.optionId === question.selectedOptionId;
                      const isCorrectOpt =
                        option.optionId === question.correctOptionId;

                      return (
                        <div
                          key={option.optionId}
                          className={`p-3 rounded-lg border flex items-center gap-2 ${
                            isCorrectOpt
                              ? "bg-green-100 border-green-300"
                              : isSelected
                              ? "bg-red-100 border-red-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          {isCorrectOpt && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {isSelected && !isCorrectOpt && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={
                              isCorrectOpt || isSelected ? "font-semibold" : ""
                            }
                          >
                            {option.optionContent}
                          </span>
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
