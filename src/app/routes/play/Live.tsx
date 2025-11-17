import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Users, Clock, X, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { storage } from "../../../libs/storage";
import { quizService, QuestionDetail } from "../../../services/quizService";
import { offlineQuizService } from "../../../services/offlineQuizService";
import { toast } from "react-hot-toast";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <p className="text-xl font-semibold mb-4">
            {error || "Không tìm thấy câu hỏi"}
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
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
