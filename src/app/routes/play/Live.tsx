import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, Clock, X, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

export default function PlayLive() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  // Detect mode:
  // - solo-{quizId}: Solo/practice mode (from home page)
  // - class-{classId}-{quizId}: Class quiz mode (from class page)
  // - {sessionId}: Live multiplayer mode
  const isSoloMode = sessionId?.startsWith("solo-");
  const isClassMode = sessionId?.startsWith("class-");

  // Mock quiz data - same as host
  const mockQuestions: Question[] = [
    {
      id: "1",
      content:
        "Tên cứ của hành tinh được phân loại lại thành hành tinh lùn vào năm 2006?",
      options: ["Sao Thủy", "Ceres", "Sao Diêm Vương", "Sao Hải Vương"],
      correctAnswer: 2,
      timeLimit: 20,
      points: 1000,
    },
    {
      id: "2",
      content: "Phương trình x² - 5x + 6 = 0 có nghiệm là:",
      options: [
        "x = 2 hoặc x = 3",
        "x = 1 hoặc x = 6",
        "x = -2 hoặc x = -3",
        "Vô nghiệm",
      ],
      correctAnswer: 0,
      timeLimit: 20,
      points: 1000,
    },
    {
      id: "3",
      content: "Thủ đô của nước Úc là:",
      options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
      correctAnswer: 2,
      timeLimit: 20,
      points: 1000,
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(mockQuestions[0].timeLimit);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0); // Hidden from UI, will be shown in Results page
  const [streak, setStreak] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    if (!showResult && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      // Time's up - show result
      setShowResult(true);
    }
  }, [timeLeft, showResult]);

  // Auto next question after showing result
  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 3000); // Wait 3 seconds before next question
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult]);

  const handleSelectAnswer = (answerIndex: number) => {
    if (selectedAnswer === null && !showResult) {
      setSelectedAnswer(answerIndex);
      const isCorrect = answerIndex === currentQuestion.correctAnswer;

      if (isCorrect) {
        // Score based on question points set by teacher
        setScore((prev) => prev + currentQuestion.points);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }

      setShowResult(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(mockQuestions[nextIndex].timeLimit);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // End quiz - route based on mode
      const isSoloMode = sessionId?.startsWith("solo-");

      if (isSoloMode && sessionId) {
        // Solo mode (from home page) → SoloResult (no leaderboard)
        const quizId = sessionId.replace("solo-", "");
        navigate(`/quiz/result/${quizId}`);
      } else {
        // Class mode or Live mode → Result (with leaderboard)
        navigate(`/play/result/${sessionId}`);
      }
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
    const baseClasses = `${answerColors[index].bg} rounded-3xl p-8 md:p-12 text-white shadow-2xl cursor-pointer transition-all duration-300`;

    if (showResult) {
      if (index === currentQuestion.correctAnswer) {
        return `${baseClasses} ring-8 ring-yellow-300 scale-105`;
      } else if (index === selectedAnswer) {
        return `${baseClasses} opacity-50 scale-95`;
      } else {
        return `${baseClasses} opacity-30`;
      }
    } else if (selectedAnswer === index) {
      return `${baseClasses} ring-4 ring-white scale-105`;
    } else {
      return `${baseClasses} ${answerColors[index].hover} hover:scale-105 active:scale-95`;
    }
  };

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

              {streak > 0 && (
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold">🔥 {streak} streak</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-white">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base font-semibold">
                Câu {currentQuestionIndex + 1}/{mockQuestions.length}
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
              {currentQuestion.content}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={getAnswerClassName(index)}
                disabled={showResult || selectedAnswer !== null}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white/30 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl md:text-4xl">
                      {answerShapes[index]}
                    </span>
                  </div>
                  <p className="text-lg md:text-2xl font-bold flex-1 text-left">
                    {option}
                  </p>

                  {showResult && index === currentQuestion.correctAnswer && (
                    <div className="flex-shrink-0 bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                  )}
                  {showResult &&
                    index === selectedAnswer &&
                    index !== currentQuestion.correctAnswer && (
                      <div className="flex-shrink-0 bg-red-300 text-red-900 px-3 py-1 rounded-full">
                        <span className="text-sm font-bold">✗</span>
                      </div>
                    )}
                </div>
              </button>
            ))}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className="mt-8 text-center animate-fadeIn">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <div className="bg-green-500/90 backdrop-blur-md rounded-2xl px-8 py-6 inline-block">
                  <p className="text-3xl md:text-4xl font-black text-white">
                    🎉 Chính xác!
                  </p>
                </div>
              ) : selectedAnswer !== null ? (
                <div className="bg-red-500/90 backdrop-blur-md rounded-2xl px-8 py-6 inline-block">
                  <p className="text-3xl md:text-4xl font-black text-white mb-2">
                    😔 Sai rồi!
                  </p>
                  <p className="text-lg md:text-xl text-white/90">
                    Đáp án đúng:{" "}
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                </div>
              ) : (
                <div className="bg-orange-500/90 backdrop-blur-md rounded-2xl px-8 py-6 inline-block">
                  <p className="text-3xl md:text-4xl font-black text-white mb-2">
                    ⏰ Hết giờ!
                  </p>
                  <p className="text-lg md:text-xl text-white/90">
                    Đáp án đúng:{" "}
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                </div>
              )}
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
