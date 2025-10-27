import { useNavigate, useParams } from "react-router-dom";
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

interface QuestionResult {
  questionNumber: number;
  content: string;
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export default function SoloResult() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  // Mock data - sẽ được lấy từ state hoặc API
  const quizTitle = "Phương trình bậc hai";
  const totalScore = 20; // 2 câu đúng x 10 điểm
  const totalQuestions = 3;
  const correctAnswers = 2;
  const totalTime = 45; // seconds
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  const questionResults: QuestionResult[] = [
    {
      questionNumber: 1,
      content:
        "Tên cứ của hành tinh được phân loại lại thành hành tinh lùn vào năm 2006?",
      selectedAnswer: 2,
      correctAnswer: 2,
      isCorrect: true,
      timeSpent: 15,
    },
    {
      questionNumber: 2,
      content: "Phương trình x² - 5x + 6 = 0 có nghiệm là:",
      selectedAnswer: 1,
      correctAnswer: 0,
      isCorrect: false,
      timeSpent: 18,
    },
    {
      questionNumber: 3,
      content: "Thủ đô của nước Úc là:",
      selectedAnswer: 2,
      correctAnswer: 2,
      isCorrect: true,
      timeSpent: 12,
    },
  ];

  const getPerformanceMessage = (accuracy: number) => {
    if (accuracy >= 90) return "Xuất sắc! 🎉";
    if (accuracy >= 70) return "Tốt lắm! 👏";
    if (accuracy >= 50) return "Khá tốt! 👍";
    return "Cố gắng thêm nhé! 💪";
  };

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return "from-green-500 to-emerald-600";
    if (accuracy >= 70) return "from-blue-500 to-cyan-600";
    if (accuracy >= 50) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  const handlePlayAgain = () => {
    navigate(`/quiz/preview/${quizId}`);
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
            accuracy
          )} rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-8`}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/30 backdrop-blur-md rounded-full mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">
              {getPerformanceMessage(accuracy)}
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Bạn đã hoàn thành quiz: {quizTitle}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-black mb-1">
                {accuracy}%
              </div>
              <div className="text-sm text-white/90">Điểm số</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-black mb-1">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm text-white/90">Câu đúng</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-black mb-1">
                {totalScore}
              </div>
              <div className="text-sm text-white/90">Điểm</div>
            </div>

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
                {accuracy}%
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
                {Math.round(totalTime / totalQuestions)}s
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
            {questionResults.map((question) => (
              <div
                key={question.questionNumber}
                className={`rounded-2xl p-6 border-2 ${
                  question.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        question.isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {question.questionNumber}
                    </div>
                    <h3 className="font-semibold text-gray-900 flex-1">
                      {question.content}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {question.isCorrect ? (
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

                <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-4">
                    {question.selectedAnswer !== null ? (
                      <span>
                        Bạn chọn:{" "}
                        <span className="font-semibold">
                          Đáp án {question.selectedAnswer + 1}
                        </span>
                      </span>
                    ) : (
                      <span className="text-orange-600 font-semibold">
                        Không trả lời
                      </span>
                    )}
                    {!question.isCorrect && (
                      <span className="text-green-700">
                        Đáp án đúng:{" "}
                        <span className="font-semibold">
                          Đáp án {question.correctAnswer + 1}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{question.timeSpent}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
