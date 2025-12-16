import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Users,
  Clock,
  X,
  AlertTriangle,
  Award,
  Trophy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { storage } from "../../../libs/storage";
import { quizService, QuestionDetail } from "../../../services/quizService";
import {
  onlineQuizService,
  OnlineAnswerResponse,
} from "../../../services/onlineQuizService";
import { offlineQuizService } from "../../../services/offlineQuizService";
import { toast } from "react-hot-toast";
import {
  ONLINE_SESSION_STORAGE_KEY,
  OnlineSessionContext,
  StudentCompleteResult,
  StudentQuestionResult,
  StudentOptionResult,
  LeaderboardEntry,
} from "../../../types/realtime";
import { getSharedQuizHubConnection } from "../../../libs/quizHub";
import type { HubConnection } from "@microsoft/signalr";

export default function PlayLive() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  // Detect mode:
  // - solo-{quizId}: Solo/practice mode (from home page) - OFFLINE
  // - class-{classId}-{quizId}: Class quiz mode (from class page) - OFFLINE
  // - {sessionId}: Live multiplayer mode - ONLINE (không xử lý ở đây)
  const isSoloMode = sessionId?.startsWith("solo-");
  const isClassMode = sessionId?.startsWith("class-");
  const isOfflineMode = isSoloMode || isClassMode;

  const location = useLocation();

  // Parse quizId và classId từ sessionId
  let quizId: number | null = null;
  let qgId: number | null = null;

  if (isSoloMode && sessionId) {
    quizId = parseInt(sessionId.replace("solo-", ""));
  } else if (isClassMode && sessionId) {
    const parts = sessionId.replace("class-", "").split("-");
    // classId = parseInt(parts[0]); // Không sử dụng, chỉ cần quizId
    quizId = parseInt(parts[1]);
    // Lấy qgId từ location.state nếu có (truyền từ Classes page)
    qgId = (location.state as any)?.qgId || null;
  }

  if (!isOfflineMode) {
    return <OnlineLiveMode />;
  }

  // State cho questions từ API
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [startSuccess, setStartSuccess] = useState(false);
  const [startApiCalled, setStartApiCalled] = useState(false);
  const [startApiError, setStartApiError] = useState<string | null>(null);
  const startApiCalledRef = useRef(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [submissionType, setSubmissionType] = useState<
    "submitted" | "timeout" | null
  >(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null
  );

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion =
    questions.length > 0 && currentQuestionIndex === questions.length - 1;
  const canSubmitQuiz = isLastQuestion && showResult && submissionType !== null;

  // Load questions và start quiz (chỉ cho offline mode)
  useEffect(() => {
    if (!isOfflineMode || !quizId) {
      // Live mode - không xử lý ở đây
      setIsLoading(false);
      return;
    }

    // Tránh gọi API start nhiều lần do React Strict Mode
    if (startApiCalledRef.current) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadQuizAndStart = async () => {
      // Đánh dấu đã gọi để tránh gọi lại
      if (startApiCalledRef.current) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }
      startApiCalledRef.current = true;

      try {
        setIsLoading(true);
        setError(null);

        // 1. Lấy questions từ API
        const questionsData = await quizService.getQuizQuestions(quizId!);
        if (!questionsData || questionsData.length === 0) {
          throw new Error("Không tìm thấy câu hỏi cho quiz này");
        }
        setQuestions(questionsData);
        setTimeLeft(questionsData[0].time);

        // 2. Lấy user info
        const user = storage.getUser();
        const studentIdRaw = user?.id || user?.accountId;
        if (!studentIdRaw) {
          throw new Error("Vui lòng đăng nhập để làm quiz");
        }
        const studentId =
          typeof studentIdRaw === "string"
            ? parseInt(studentIdRaw)
            : studentIdRaw;

        // 3. Gọi API start quiz
        const startTimeNow = new Date();
        setStartTime(startTimeNow);

        const startData = {
          StudentId: studentId,
          QuizId: quizId!,
          QGId: qgId || null,
          StartTime: startTimeNow.toISOString(),
        };
        setStartApiCalled(true);
        setStartApiError(null);
        setStartSuccess(false);

        try {
          const startResult = await offlineQuizService.startQuiz(startData);

          if (!startResult || !startResult.message) {
            const errorMsg = "API /start không trả về kết quả hợp lệ";
            setStartApiError(errorMsg);
            startApiCalledRef.current = false; // Reset để có thể thử lại
            throw new Error(errorMsg);
          }

          const hasSuccess =
            startResult.message.includes("successfully") ||
            startResult.message.includes("success");

          if (!hasSuccess) {
            const errorMsg = `API /start trả về message không phải success: ${startResult.message}`;
            setStartApiError(errorMsg);
            startApiCalledRef.current = false; // Reset để có thể thử lại
            throw new Error(errorMsg);
          }

          // Luôn set startSuccess, không cần check isMounted vì state vẫn tồn tại
          setStartSuccess(true);
        } catch (startErr: any) {
          const errorMsg =
            startErr.response?.data?.message ||
            startErr.message ||
            "Không thể bắt đầu quiz";
          setStartApiError(errorMsg);
          setStartSuccess(false);
          startApiCalledRef.current = false; // Reset để có thể thử lại
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Không thể tải quiz");
          toast.error(err.message || "Không thể tải quiz");
        }
      } finally {
        // Luôn set isLoading về false, không cần check isMounted
        setIsLoading(false);
      }
    };

    loadQuizAndStart();

    return () => {
      isMounted = false;
    };
  }, [isOfflineMode, quizId, qgId]);

  // Timer countdown
  useEffect(() => {
    if (!showResult && timeLeft > 0 && currentQuestion) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && currentQuestion) {
      // Time's up - tự động lưu như câu trả lời sai
      handleSubmitAnswer(null, "timeout");
    }
  }, [timeLeft, showResult, currentQuestion]);

  // Auto next question after showing result
  useEffect(() => {
    if (showResult && currentQuestionIndex < questions.length - 1) {
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 3000); // Wait 3 seconds before next question
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult]);

  const handleSubmitAnswer = async (
    optionIndex: number | null,
    mode: "manual" | "timeout" = "manual"
  ) => {
    if (!isOfflineMode || !currentQuestion || !quizId || showResult) return;

    const user = storage.getUser();
    const studentIdRaw = user?.id || user?.accountId;
    if (!studentIdRaw) return;

    const studentId =
      typeof studentIdRaw === "string" ? parseInt(studentIdRaw) : studentIdRaw;

    const selectedOptionId =
      optionIndex !== null
        ? currentQuestion.options[optionIndex]?.optionId
        : null;

    setIsSubmittingAnswer(true);

    try {
      await offlineQuizService.submitAnswer({
        StudentId: studentId,
        QuizId: quizId,
        QGId: qgId || null,
        QuestionId: currentQuestion.questionId,
        SelectedOptionId: selectedOptionId || null,
      });

      if (mode === "timeout") {
        setLastAnswerCorrect(false);
        setSelectedAnswer(null);
      } else {
        let isCorrect = false;
        try {
          const correctAnswer = await quizService.getCorrectAnswer(
            quizId!,
            currentQuestion.questionId
          );
          isCorrect =
            selectedOptionId !== null &&
            correctAnswer.optionId === selectedOptionId;
        } catch (err) {
          const fallback = currentQuestion.options.find((opt) => opt.isCorrect);
          if (fallback && selectedOptionId !== null) {
            isCorrect = fallback.optionId === selectedOptionId;
          }
        }
        setLastAnswerCorrect(isCorrect);
      }

      setSubmissionType(mode === "timeout" ? "timeout" : "submitted");
      setShowResult(true);
    } catch (err: any) {
      toast.error("Không thể lưu đáp án");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitCurrentAnswer = () => {
    if (showResult || isSubmittingAnswer) return;
    if (selectedAnswer === null) {
      toast.error("Vui lòng chọn đáp án trước khi lưu.");
      return;
    }
    handleSubmitAnswer(selectedAnswer, "manual");
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion) {
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(questions[nextIndex].time);
      setSelectedAnswer(null);
      setShowResult(false);
      setSubmissionType(null);
      setLastAnswerCorrect(null);
    } else {
      // Last question - wait for manual submit
    }
  };

  const handleSubmitQuiz = async () => {
    if (!isOfflineMode || !quizId || !startTime) {
      toast.error("Không thể nộp bài: Thiếu thông tin quiz");
      return;
    }

    if (!startApiCalled) {
      toast.error(
        "Lỗi: API bắt đầu quiz chưa được gọi. Vui lòng làm lại từ đầu."
      );
      return;
    }

    if (startApiError) {
      toast.error(`Lỗi: ${startApiError}. Không thể nộp bài.`);
      return;
    }

    if (!startSuccess) {
      // Nếu startApiCalled nhưng startSuccess là false, có thể do state bị reset
      // Thử kiểm tra lại bằng cách gọi API start một lần nữa nếu cần
      if (startApiCalled && !startApiError) {
        // Cho phép tiếp tục nếu API đã được gọi và không có lỗi
        // Vì có thể state bị reset do hot reload
      } else {
        toast.error(
          "Lỗi: Quiz chưa được bắt đầu thành công. Không thể nộp bài."
        );
        return;
      }
    }

    const user = storage.getUser();
    const studentIdRaw = user?.id || user?.accountId;
    if (!studentIdRaw) {
      toast.error("Vui lòng đăng nhập để nộp bài");
      return;
    }

    const studentId =
      typeof studentIdRaw === "string" ? parseInt(studentIdRaw) : studentIdRaw;

    setIsSubmittingQuiz(true);
    try {
      const endTime = new Date();

      const submitData = {
        StudentId: studentId,
        QuizId: quizId,
        QGId: qgId || null,
        EndTime: endTime.toISOString(),
      };

      await offlineQuizService.submitQuiz(submitData);

      // Route based on mode
      if (isSoloMode) {
        navigate(`/quiz/result/${quizId}`);
      } else if (isClassMode) {
        const classResultUrl = `/student/quiz/${quizId}/result${
          qgId ? `?qgId=${qgId}` : ""
        }`;
        // Truyền qgId qua state hoặc URL params
        navigate(classResultUrl, {
          state: { qgId },
        });
      } else {
        toast.error("Không xác định được chế độ quiz");
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.message || err.message || "Không thể nộp bài";

      // Phân tích lỗi chính xác từ BE
      let detailedError = "";
      if (errorMessage.includes("Failed to submit quiz")) {
        if (!startApiCalled) {
          detailedError =
            "Lỗi: API bắt đầu quiz chưa được gọi. Vui lòng làm lại từ đầu.";
        } else if (startApiError) {
          detailedError = `Lỗi: ${startApiError}. Không thể nộp bài.`;
        } else if (!startSuccess) {
          detailedError =
            "Lỗi: Quiz chưa được bắt đầu thành công. Không thể nộp bài.";
        } else {
          if (qgId && qgId > 0) {
            detailedError =
              "Lỗi: Quiz group không tồn tại hoặc đã vượt quá số lần làm (MaxAttempts).";
          } else {
            detailedError =
              "Lỗi: Session không tồn tại trong Redis. Vui lòng thử lại.";
          }
        }
      } else {
        detailedError = errorMessage;
      }

      toast.error(detailedError);

      // Nếu lỗi do session không tồn tại, thử navigate về trang preview
      if (
        errorMessage.includes("session") ||
        errorMessage.includes("Redis") ||
        errorMessage.includes("Failed to submit")
      ) {
        setTimeout(() => {
          navigate(`/quiz/preview/${quizId}`);
        }, 2000);
      }
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    const isSoloMode = sessionId?.startsWith("solo-");
    const isClassMode = sessionId?.startsWith("class-");

    if (isClassMode) {
      navigate("/student/classes");
    } else if (isSoloMode) {
      navigate("/");
    } else {
      navigate("/play/join");
    }
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  const answerColors = [
    { bg: "bg-red-500", hover: "hover:bg-red-600", border: "border-red-600" },
    {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-600",
      border: "border-blue-600",
    },
    {
      bg: "bg-yellow-500",
      hover: "hover:bg-yellow-600",
      border: "border-yellow-600",
    },
    {
      bg: "bg-green-500",
      hover: "hover:bg-green-600",
      border: "border-green-600",
    },
  ];

  const answerShapes = ["△", "◆", "○", "□"];

  const getAnswerClassName = (index: number) => {
    if (!currentQuestion) return "";
    const baseClasses =
      "rounded-3xl p-8 md:p-12 text-white shadow-2xl cursor-pointer transition-all duration-300";

    if (showResult) {
      if (submissionType === "timeout" || selectedAnswer === null) {
        return `${baseClasses} ${answerColors[index].bg} opacity-40`;
      }

      if (index === selectedAnswer) {
        return lastAnswerCorrect
          ? `${baseClasses} bg-green-500 ring-8 ring-green-300 scale-105`
          : `${baseClasses} bg-red-500 opacity-90 scale-95`;
      }

      return `${baseClasses} ${answerColors[index].bg} opacity-30`;
    }

    if (selectedAnswer === index) {
      return `${baseClasses} ${answerColors[index].bg} ring-4 ring-white scale-105`;
    }

    return `${baseClasses} ${answerColors[index].bg} ${answerColors[index].hover} hover:scale-105 active:scale-95`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10">
        {/* Top Bar */}
        <div className="bg-black/30 backdrop-blur-md px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Exit Button */}
              <button
                onClick={handleExit}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium hidden md:inline">
                  Thoát
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-white">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base font-semibold">
                Câu {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Timer */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div
                className={`w-24 h-24 md:w-32 md:h-32 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                  timeLeft <= 5 ? "bg-red-500/30 animate-pulse" : "bg-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock
                    className={`w-6 h-6 md:w-8 md:h-8 ${
                      timeLeft <= 5 ? "text-red-200" : "text-white"
                    }`}
                  />
                  <span
                    className={`text-4xl md:text-6xl font-black ${
                      timeLeft <= 5 ? "text-red-100" : "text-white"
                    }`}
                  >
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl px-6 md:px-12 py-6 md:py-8 mb-6 md:mb-8 shadow-2xl">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 text-center leading-relaxed">
              {currentQuestion.questionContent}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={getAnswerClassName(index)}
                disabled={showResult || isSubmittingAnswer}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/30 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl md:text-4xl">
                      {answerShapes[index]}
                    </span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold flex-1 text-left">
                    {option.optionContent}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              onClick={handleSubmitCurrentAnswer}
              disabled={showResult || isSubmittingAnswer}
            >
              {isSubmittingAnswer ? "Đang lưu..." : "Lưu câu trả lời"}
            </Button>
          </div>

          {/* Result Message */}
          {showResult && (
            <div className="mt-6 text-center animate-fadeIn">
              {submissionType === "timeout" ? (
                <div className="bg-orange-500/90 backdrop-blur-md rounded-2xl px-8 py-6 inline-block">
                  <p className="text-2xl md:text-3xl font-black text-white mb-2">
                    ⏰ Hết thời gian cho câu hỏi này.
                  </p>
                  <p className="text-lg md:text-xl text-white/90">
                    Câu trả lời được tính là sai. Hãy chuẩn bị cho câu tiếp
                    theo.
                  </p>
                </div>
              ) : lastAnswerCorrect ? (
                <div className="bg-green-500/90 backdrop-blur-md rounded-2xl px-8 py-6 inline-block">
                  <p className="text-2xl md:text-3xl font-black text-white mb-2">
                    🎉 Chính xác!
                  </p>
                  <p className="text-lg md:text-xl text-white/90">
                    Tiếp tục giữ phong độ nhé!
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/90 backdrop-blur-md rounded-2xl px-8 py-6 inline-block">
                  <p className="text-2xl md:text-3xl font-black text-white mb-2">
                    😔 Sai rồi!
                  </p>
                  <p className="text-lg md:text-xl text-white/90">
                    Đáp án đúng sẽ hiển thị sau khi bạn hoàn thành bài thi.
                  </p>
                </div>
              )}
            </div>
          )}

          {canSubmitQuiz && (
            <div className="mt-6 flex items-center justify-center">
              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmittingQuiz}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isSubmittingQuiz ? "Đang nộp bài..." : "Nộp bài & xem kết quả"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <Modal isOpen={showExitModal} onClose={cancelExit} title="Xác nhận thoát">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-secondary-900 font-medium mb-1">
                Bạn có chắc muốn thoát?
              </p>
              <p className="text-sm text-secondary-600">
                Tiến trình làm bài của bạn sẽ không được lưu lại. Bạn sẽ phải
                bắt đầu lại từ đầu nếu muốn làm bài này.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={cancelExit}>
              Hủy
            </Button>
            <Button
              onClick={confirmExit}
              className="bg-error-600 hover:bg-error-700 text-white"
            >
              Thoát
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const mapLeaderboardPayload = (payload: unknown): LeaderboardEntry[] => {
  if (!Array.isArray(payload)) return [];
  return payload.map((entry: any, index: number) => ({
    studentId: entry?.studentId ?? entry?.StudentId ?? `${index}`,
    nickname:
      entry?.studentName ??
      entry?.StudentName ??
      entry?.nickname ??
      entry?.Nickname ??
      "Ẩn danh",
    score: Number(entry?.score ?? entry?.Score ?? 0),
    rank: Number(entry?.rank ?? entry?.Rank ?? index + 1),
  }));
};

function OnlineLiveMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [context, setContext] = useState<OnlineSessionContext | null>(null);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [waitingSummary, setWaitingSummary] = useState(false);
  const [completeResult, setCompleteResult] =
    useState<StudentCompleteResult | null>(null);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [answerResult, setAnswerResult] = useState<
    "correct" | "wrong" | "timeout" | null
  >(null);
  const [revealedCorrectOptionId, setRevealedCorrectOptionId] = useState<
    number | null
  >(null);
  const [localAnswers, setLocalAnswers] = useState<
    Record<
      number,
      { status: "correct" | "wrong" | "timeout"; optionId: number | null }
    >
  >({});
  const normalizedQuestionDetails = useMemo(() => {
    if (!completeResult?.questions) return [];
    return completeResult.questions.map((question) => {
      const local = localAnswers[question.questionId];
      if (!local) {
        return question;
      }

      return {
        ...question,
        isSkipped: local.status === "timeout",
        options: question.options.map((opt) => ({
          ...opt,
          isSelectedWrong:
            local.status === "wrong" &&
            local.optionId !== null &&
            opt.optionId === local.optionId,
        })),
      };
    });
  }, [completeResult, localAnswers]);
  const connectionRef = useRef<HubConnection | null>(null);
  const completionRequestedRef = useRef(false);

  useEffect(() => {
    const stateCtx = location.state as OnlineSessionContext | undefined;
    const storedRaw = sessionStorage.getItem(ONLINE_SESSION_STORAGE_KEY);
    const storedCtx = storedRaw
      ? (JSON.parse(storedRaw) as OnlineSessionContext)
      : null;
    const effective =
      stateCtx?.mode === "online"
        ? stateCtx
        : storedCtx?.mode === "online"
        ? storedCtx
        : null;
    if (!effective) {
      setError(
        "Không tìm thấy thông tin phiên live. Vui lòng quay lại trang nhập PIN."
      );
      setLoading(false);
      return;
    }
    setContext(effective);
  }, [location.state]);

  useEffect(() => {
    if (!context) return;
    let mounted = true;
    setLoading(true);
    onlineQuizService
      .cacheQuizQuestions(context.quizId)
      .then((data) => {
        if (!mounted) return;
        if (!data || data.length === 0) {
          setError("Không tìm thấy câu hỏi cho quiz này.");
          return;
        }
        setQuestions(data);
        setTotalQuestionCount(data.length);
        setTimeLeft(data[0].time);
      })
      .catch((err) => {
        setError("Không thể tải câu hỏi quiz.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [context]);

  useEffect(() => {
    completionRequestedRef.current = false;
    setLocalAnswers({});
  }, [context?.roomCode]);

  useEffect(() => {
    if (!context) return;
    const conn = getSharedQuizHubConnection();
    if (!conn) {
      setError("Kết nối live đã bị gián đoạn. Vui lòng quay lại trang join.");
      return;
    }
    connectionRef.current = conn;
    const handleComplete = (payload: any) => {
      const leaderboard = mapLeaderboardPayload(
        payload?.leaderboard ??
          payload?.Leaderboard ??
          payload?.leaderboards ??
          payload?.Leaderboards
      );
      const normalized: StudentCompleteResult = {
        ...payload,
        leaderboard,
      };
      setCompleteResult(normalized);
      setWaitingSummary(false);
    };
    const handleEnd = () => {
      setWaitingSummary(false);
    };
    const handleRoomClosed = (message?: string) => {
      setWaitingSummary(false);
      toast.error(message || "Giáo viên đã đóng phòng.");
      sessionStorage.removeItem(ONLINE_SESSION_STORAGE_KEY);
      navigate("/play/join");
    };
    conn.on("CompleteQuiz", handleComplete);
    conn.on("GameEnded", handleEnd);
    conn.on("EndClick", handleRoomClosed);
    conn.on("EndBeforeStartGame", handleRoomClosed);
    return () => {
      conn.off("CompleteQuiz", handleComplete);
      conn.off("GameEnded", handleEnd);
      conn.off("EndClick", handleRoomClosed);
      conn.off("EndBeforeStartGame", handleRoomClosed);
    };
  }, [context]);

  useEffect(() => {
    if (!questions[currentIndex]) return;
    setTimeLeft(questions[currentIndex].time);
    setSelectedOption(null);
    setAnswerLocked(false);
    setAnswerResult(null);
    setRevealedCorrectOptionId(null);
  }, [currentIndex, questions]);

  useEffect(() => {
    if (!context || !questions[currentIndex]) return;
    if (answerLocked || waitingSummary || completeResult || loading) return;
    if (timeLeft <= 0) {
      handleSubmit(null, "timeout");
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [
    timeLeft,
    answerLocked,
    waitingSummary,
    completeResult,
    context,
    questions,
    loading,
  ]);

  useEffect(() => {
    if (!answerLocked) return;
    // Chờ có kết quả để hiển thị feedback trước khi chuyển câu
    if (!answerResult && !waitingSummary && !completeResult) return;

    const delay = answerResult === "timeout" ? 800 : 2200;
    if (currentIndex >= questions.length - 1) {
      const timeout = setTimeout(() => {
        setWaitingSummary(true);
        setAnswerLocked(false);
      }, delay);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerLocked(false);
    }, delay);
    return () => clearTimeout(timeout);
  }, [
    answerLocked,
    answerResult,
    waitingSummary,
    completeResult,
    currentIndex,
    questions.length,
  ]);

  useEffect(() => {
    if (!waitingSummary) return;
    if (completionRequestedRef.current) return;
    if (!context?.roomCode || !context.studentId) return;
    const conn = connectionRef.current;
    if (!conn) return;
    completionRequestedRef.current = true;
    conn
      .invoke("StudentComplete", context.roomCode, context.studentId)
      .catch((err) => {
        completionRequestedRef.current = false;
        toast.error("Không thể gửi yêu cầu hoàn thành. Thử lại sau.");
      });
  }, [waitingSummary, context]);

  const parseBooleanResult = (value: unknown): boolean | null => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return null;
  };

  const resolveIsCorrect = (
    response: OnlineAnswerResponse | null
  ): boolean | null => {
    if (response === null || response === undefined) return null;
    if (typeof response === "boolean") return response;
    if (typeof response === "object") {
      if ("isCorrect" in response) {
        const parsed = parseBooleanResult((response as any).isCorrect);
        if (parsed !== null) return parsed;
      }
      if ("result" in response) {
        const parsed = parseBooleanResult((response as any).result);
        if (parsed !== null) return parsed;
      }
      if ("data" in response) {
        return resolveIsCorrect((response as any).data);
      }
    }
    return null;
  };

  const resolveCorrectOptionId = (
    response: OnlineAnswerResponse | null
  ): number | null => {
    if (!response || typeof response !== "object") return null;
    if (typeof (response as any).correctOptionId === "number") {
      return (response as any).correctOptionId;
    }
    if (typeof (response as any).correctAnswerId === "number") {
      return (response as any).correctAnswerId;
    }
    if (
      (response as any).correctOption &&
      typeof (response as any).correctOption.optionId === "number"
    ) {
      return (response as any).correctOption.optionId;
    }
    if ((response as any).data) {
      return resolveCorrectOptionId((response as any).data);
    }
    return null;
  };

  const handleSubmit = async (
    optionIndex: number | null,
    reason: "manual" | "timeout"
  ) => {
    if (!context) return;
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion || answerLocked) return;
    setSelectedOption(optionIndex);
    setAnswerLocked(true);
    try {
      const optionId =
        optionIndex !== null
          ? currentQuestion.options[optionIndex]?.optionId ?? null
          : null;
      const response = await onlineQuizService.submitOnlineAnswer({
        roomCode: context.roomCode,
        studentId: context.studentId,
        quizId: context.quizId,
        questionId: currentQuestion.questionId,
        optionId,
      });

      const serverCorrectOptionId = resolveCorrectOptionId(response);
      const fallbackOption = currentQuestion.options.find(
        (opt) => opt.isCorrect
      );
      const effectiveCorrectOptionId =
        serverCorrectOptionId ?? fallbackOption?.optionId ?? null;
      setRevealedCorrectOptionId(effectiveCorrectOptionId);

      let resolvedStatus: "correct" | "wrong" | "timeout";
      if (reason === "timeout") {
        resolvedStatus = "timeout";
        setAnswerResult("timeout");
      } else {
        const serverIsCorrect = resolveIsCorrect(response);
        if (serverIsCorrect !== null) {
          resolvedStatus = serverIsCorrect ? "correct" : "wrong";
        } else {
          const fallbackIsCorrect =
            optionId !== null &&
            (optionId === effectiveCorrectOptionId ||
              currentQuestion.options.some(
                (opt) => opt.optionId === optionId && opt.isCorrect
              ));
          resolvedStatus = fallbackIsCorrect ? "correct" : "wrong";
        }
        setAnswerResult(resolvedStatus);
      }
      setLocalAnswers((prev) => ({
        ...prev,
        [currentQuestion.questionId]: {
          status: resolvedStatus,
          optionId,
        },
      }));
    } catch (err) {
      toast.error("Không gửi được đáp án, vui lòng thử lại.");
      setAnswerLocked(false);
      return;
    }
  };

  const getOptionBackground = (index: number) => {
    const baseColor = [
      "bg-red-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-green-500",
    ][index];
    const option = questions[currentIndex]?.options[index];
    const isCorrectOption =
      option &&
      (option.isCorrect ||
        (revealedCorrectOptionId !== null &&
          option.optionId === revealedCorrectOptionId));
    if (!answerLocked || !option) {
      return `${baseColor} ${
        selectedOption === index
          ? "ring-4 ring-white scale-105"
          : "hover:scale-105"
      }`;
    }
    if (answerResult === "timeout") {
      if (isCorrectOption) {
        return "bg-green-500 ring-4 ring-white";
      }
      return `${baseColor} opacity-60`;
    }
    if (isCorrectOption) {
      return "bg-green-500 ring-4 ring-white";
    }
    if (selectedOption === index && !option.isCorrect) {
      return "bg-red-500 opacity-90";
    }
    return `${baseColor} opacity-40`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Đang chuẩn bị quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center text-white text-center px-6">
        <div className="max-w-md space-y-4">
          <p className="text-xl font-semibold">
            {error || "Không thể bắt đầu quiz."}
          </p>
          <Button onClick={() => navigate("/play/join")}>
            Quay lại nhập PIN
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return null;
  }
  const leaderboardEntries = completeResult?.leaderboard ?? [];
  const fallbackCorrectCount =
    typeof completeResult?.correctCount === "number"
      ? completeResult.correctCount
      : Object.values(localAnswers).filter(
          (answer) => answer.status === "correct"
        ).length;
  const fallbackWrongCount =
    typeof completeResult?.wrongCount === "number"
      ? completeResult.wrongCount
      : Object.values(localAnswers).filter(
          (answer) => answer.status === "wrong" || answer.status === "timeout"
        ).length;
  const effectiveTotalQuestions =
    (completeResult?.totalQuestions ?? totalQuestionCount) || questions.length;
  const questionDetails = normalizedQuestionDetails;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasFinishedQuestions = waitingSummary || !!completeResult;
  const submitLabel = answerLocked
    ? "Đã gửi đáp án"
    : isLastQuestion
    ? "Nộp bài & xem kết quả"
    : "Lưu câu trả lời";
  const accuracy =
    effectiveTotalQuestions > 0
      ? Math.round((fallbackCorrectCount / effectiveTotalQuestions) * 100)
      : 0;
  const displayName = context.studentName?.trim() || "Ẩn danh";

  const answerFeedback = (() => {
    switch (answerResult) {
      case "correct":
        return {
          title: "Chính xác!",
          detail: "Bạn đã ghi điểm câu này.",
          icon: "🎉",
          classes: "bg-green-500/90",
        };
      case "wrong":
        return {
          title: "Sai rồi!",
          detail: "Đáp án đúng sẽ hiển thị sau khi bạn hoàn thành bài thi.",
          icon: "😔",
          classes: "bg-red-500/90",
        };
      case "timeout":
        return {
          title: "Hết thời gian",
          detail:
            selectedOption === null
              ? "Bạn chưa chọn đáp án nào."
              : "Câu trả lời bị tính sai.",
          icon: "⏰",
          classes: "bg-orange-500/90",
        };
      default:
        return null;
    }
  })();

  const handleExit = () => {
    navigate("/play/join");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute top-20 left-12 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-24 right-12 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl text-white px-4 py-3 flex flex-wrap items-center gap-4">
          <button
            onClick={handleExit}
            className="flex items-center gap-2 text-sm font-semibold hover:text-white/80"
          >
            <X className="w-4 h-4" />
            Thoát
          </button>
          <div className="flex-1 flex flex-wrap items-center justify-center gap-10 text-center">
            <div className="min-w-[140px]">
              <p className="text-xs uppercase tracking-wider opacity-80">
                Mã PIN
              </p>
              <p className="text-xl font-black tracking-widest">
                {context.roomCode}
              </p>
            </div>
            <div className="min-w-[140px]">
              <p className="text-xs uppercase tracking-wider opacity-80">
                Câu hỏi
              </p>
              <p className="text-xl font-semibold">
                {currentIndex + 1}/{questions.length}
              </p>
            </div>
          </div>
          <div className="text-right min-w-[200px]">
            <p className="text-xs uppercase tracking-wider opacity-80">
              Tên hiển thị
            </p>
            <p className="text-lg font-semibold truncate">{displayName}</p>
          </div>
        </div>

        {!hasFinishedQuestions && (
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white/15 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white/70 absolute left-1/2 -translate-x-1/2 -top-4" />
                <span className="text-5xl font-black">{timeLeft}</span>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-purple-600 px-4 py-1 rounded-full text-xs font-bold">
                giây
              </div>
            </div>
          </div>
        )}

        {!hasFinishedQuestions && (
          <>
            {answerFeedback && (
              <div
                className={`rounded-3xl px-8 py-5 text-center shadow-2xl text-white ${answerFeedback.classes}`}
              >
                <p className="text-2xl md:text-3xl font-black mb-2">
                  {answerFeedback.icon} {answerFeedback.title}
                </p>
                <p className="text-base md:text-lg opacity-90">
                  {answerFeedback.detail}
                </p>
              </div>
            )}

            <div className="bg-white/95 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
                {currentQuestion.questionContent}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.optionId}
                  onClick={() => {
                    if (!answerLocked) {
                      setSelectedOption(index);
                    }
                  }}
                  disabled={answerLocked}
                  className={`rounded-2xl p-6 text-left text-white transition transform ${getOptionBackground(
                    index
                  )}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center text-2xl">
                      {["△", "◆", "○", "□"][index]}
                    </div>
                    <p className="text-lg md:text-xl font-semibold flex-1">
                      {option.optionContent}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => handleSubmit(selectedOption, "manual")}
                disabled={answerLocked || selectedOption === null}
              >
                {submitLabel}
              </Button>
            </div>

            {answerResult && !answerFeedback && (
              <div className="text-center text-white">
                <div className="inline-block bg-white/20 px-6 py-4 rounded-2xl font-semibold">
                  Đã ghi nhận kết quả.
                </div>
              </div>
            )}
          </>
        )}

        {waitingSummary && (
          <div className="text-center text-white space-y-4">
            <div>
              <p className="text-xl font-semibold">
                Đã hoàn thành tất cả câu hỏi.
              </p>
              <p className="text-white/80">
                Đang chờ giáo viên kết thúc và công bố kết quả...
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
              <Button variant="outline" onClick={() => navigate("/play/join")}>
                Nhập mã PIN khác
              </Button>
            </div>
          </div>
        )}

        {completeResult && (
          <div className="bg-white/95 rounded-3xl p-8 shadow-2xl text-gray-900 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center">
                <Award className="w-8 h-8 text-yellow-700" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-500">Kết quả</p>
                <p className="text-2xl font-black text-purple-700">
                  {completeResult.score} điểm - Hạng {completeResult.rank}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-500">Độ chính xác</p>
                <p className="text-3xl font-bold text-purple-700">
                  {accuracy}%
                </p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-500">Câu đúng</p>
                <p className="text-3xl font-bold text-green-600">
                  {fallbackCorrectCount}/{effectiveTotalQuestions}
                </p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-500">Câu sai</p>
                <p className="text-3xl font-bold text-red-600">
                  {fallbackWrongCount}
                </p>
              </div>
            </div>

            {questionDetails.length > 0 && (
              <div className="space-y-4">
                <p className="text-lg font-semibold text-gray-800">
                  Chi tiết từng câu hỏi
                </p>
                {questionDetails.map(
                  (question: StudentQuestionResult, index: number) => {
                    const isSkipped = question.isSkipped;
                    const selectedWrong = question.options.find(
                      (opt) => opt.isSelectedWrong
                    );
                    const status = isSkipped
                      ? "skip"
                      : selectedWrong
                      ? "wrong"
                      : "correct";
                    return (
                      <div
                        key={question.questionId}
                        className={`rounded-2xl p-5 border-2 ${
                          status === "correct"
                            ? "bg-green-50 border-green-200"
                            : status === "wrong"
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${
                                status === "correct"
                                  ? "bg-green-500"
                                  : status === "wrong"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <p className="font-semibold text-gray-900">
                              {question.questionContent}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-2 font-semibold ${
                              status === "correct"
                                ? "text-green-700"
                                : status === "wrong"
                                ? "text-red-700"
                                : "text-gray-600"
                            }`}
                          >
                            {status === "correct" && (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Đúng
                              </>
                            )}
                            {status === "wrong" && (
                              <>
                                <XCircle className="w-4 h-4" />
                                Sai
                              </>
                            )}
                            {status === "skip" && <>Bỏ qua</>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {question.options.map(
                            (option: StudentOptionResult) => (
                              <div
                                key={option.optionId}
                                className={`p-3 rounded-xl border flex items-center gap-2 ${
                                  option.isCorrect
                                    ? "bg-green-100 border-green-300"
                                    : option.isSelectedWrong
                                    ? "bg-red-100 border-red-300"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                {option.isCorrect && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                {option.isSelectedWrong && (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span
                                  className={`${
                                    option.isCorrect || option.isSelectedWrong
                                      ? "font-semibold"
                                      : ""
                                  }`}
                                >
                                  {option.optionContent}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {leaderboardEntries.length > 0 && (
              <div className="bg-purple-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3 text-purple-800">
                  <Trophy className="w-5 h-5" />
                  <p className="text-lg font-semibold">Bảng xếp hạng phòng</p>
                </div>
                <div className="space-y-3 max-h-64 overflow-auto pr-2 custom-scroll">
                  {leaderboardEntries.map((entry, index) => {
                    const isMe =
                      entry.studentId === context.studentId ||
                      entry.nickname === context.studentName;
                    return (
                      <div
                        key={`${entry.studentId ?? index}-${entry.rank}`}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                          isMe
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                              isMe
                                ? "bg-white/20"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          <div>
                            <p className="font-semibold">{entry.nickname}</p>
                            {isMe && <p className="text-sm opacity-80">Bạn</p>}
                          </div>
                        </div>
                        <p className="text-lg font-semibold">
                          {entry.score} điểm
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
              <Button
                onClick={() => navigate(`/quiz/preview/${context.quizId}`)}
              >
                Xem chi tiết quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
