import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Pause, SkipForward, Users, X, BarChart3 } from "lucide-react";
import { Button } from "../../../components/common/Button";

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

interface PlayerAnswer {
  playerId: string;
  nickname: string;
  selectedAnswer: number;
  answerTime: number;
  isCorrect: boolean;
}

interface PlayerStats {
  id: string;
  nickname: string;
  score: number;
  currentStreak: number;
}

export default function HostLive() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  console.log("HostLive - quizId:", quizId);

  // Mock quiz data
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
  const [isPaused, setIsPaused] = useState(false);
  const [gamePhase, setGamePhase] = useState<"question" | "results">(
    "question"
  );

  const [players] = useState<PlayerStats[]>([
    { id: "1", nickname: "Nguyễn Văn Anh", score: 0, currentStreak: 0 },
    { id: "2", nickname: "Trần Thị Bình", score: 0, currentStreak: 0 },
    { id: "3", nickname: "Lê Hoàng Cường", score: 0, currentStreak: 0 },
    { id: "4", nickname: "Phạm Thu Hà", score: 0, currentStreak: 0 },
    { id: "5", nickname: "Hoàng Minh Tuấn", score: 0, currentStreak: 0 },
  ]);

  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const currentQuestion = mockQuestions[currentQuestionIndex];

  useEffect(() => {
    if (!isPaused && timeLeft > 0 && gamePhase === "question") {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === "question") {
      handleShowResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, timeLeft, gamePhase]);

  useEffect(() => {
    if (gamePhase === "question" && timeLeft < currentQuestion.timeLimit - 2) {
      const interval = setInterval(() => {
        setAnswers((prev) => {
          if (prev.length < players.length) {
            const answeredIds = prev.map((a) => a.playerId);
            const unansweredPlayers = players.filter(
              (p) => !answeredIds.includes(p.id)
            );
            if (unansweredPlayers.length > 0) {
              const randomPlayer =
                unansweredPlayers[
                  Math.floor(Math.random() * unansweredPlayers.length)
                ];
              const randomAnswer = Math.floor(Math.random() * 4);
              return [
                ...prev,
                {
                  playerId: randomPlayer.id,
                  nickname: randomPlayer.nickname,
                  selectedAnswer: randomAnswer,
                  answerTime: currentQuestion.timeLimit - timeLeft,
                  isCorrect: randomAnswer === currentQuestion.correctAnswer,
                },
              ];
            }
          }
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gamePhase, timeLeft, players, currentQuestion]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleShowResults = () => {
    setGamePhase("results");
    setIsPaused(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(mockQuestions[nextIndex].timeLimit);
      setGamePhase("question");
      setIsPaused(false);
      setAnswers([]);
    } else {
      navigate(`/host/results/${quizId}`);
    }
  };

  const handleEndQuiz = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn kết thúc quiz sớm? Kết quả sẽ được lưu lại."
      )
    ) {
      navigate(`/host/results/${quizId}`);
    }
  };

  const answerDistribution = [0, 1, 2, 3].map((optionIndex) => {
    return answers.filter((a) => a.selectedAnswer === optionIndex).length;
  });

  const maxAnswers = Math.max(...answerDistribution, 1);
  const answerColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const answerShapes = ["△", "◆", "○", "□"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10">
        <div className="bg-black/20 backdrop-blur-md px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={handleEndQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              Kết thúc
            </button>

            <div className="text-white text-xl font-bold">
              Câu {currentQuestionIndex + 1}/{mockQuestions.length}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                <span className="font-semibold">
                  {answers.length}/{players.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {gamePhase === "question" ? (
          <div className="max-w-6xl mx-auto px-8 py-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="text-6xl font-black text-white">
                    {timeLeft}
                  </span>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 px-4 py-1 rounded-full">
                  <span className="text-sm font-bold text-purple-600">
                    giây
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-3xl px-12 py-8 mb-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 text-center leading-relaxed">
                {currentQuestion.content}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`${answerColors[index]} rounded-2xl p-8 text-white shadow-xl transform transition-transform hover:scale-105`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">{answerShapes[index]}</span>
                    </div>
                    <p className="text-2xl font-bold flex-1">{option}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handlePauseToggle}
                variant="outline"
                className="bg-white/90 hover:bg-white text-purple-600 px-8 py-6 text-lg font-bold"
              >
                {isPaused ? (
                  <>
                    <Play className="w-6 h-6" />
                    Tiếp tục
                  </>
                ) : (
                  <>
                    <Pause className="w-6 h-6" />
                    Tạm dừng
                  </>
                )}
              </Button>

              <Button
                onClick={handleShowResults}
                className="bg-white/90 hover:bg-white text-purple-600 px-8 py-6 text-lg font-bold"
              >
                <BarChart3 className="w-6 h-6" />
                Xem kết quả
              </Button>
            </div>

            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">
                Trạng thái học sinh
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {players.map((player) => {
                  const hasAnswered = answers.some(
                    (a) => a.playerId === player.id
                  );
                  return (
                    <div
                      key={player.id}
                      className={`px-4 py-2 rounded-lg text-center transition-all ${
                        hasAnswered
                          ? "bg-green-500 text-white"
                          : "bg-white/30 text-white/70"
                      }`}
                    >
                      <p className="text-sm font-semibold truncate">
                        {player.nickname}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-8 py-12">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-6 mb-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {currentQuestion.content}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {currentQuestion.options.map((option, index) => {
                const count = answerDistribution[index];
                const percentage =
                  players.length > 0
                    ? ((count / players.length) * 100).toFixed(0)
                    : 0;
                const isCorrect = index === currentQuestion.correctAnswer;
                const barHeight = `${(count / maxAnswers) * 100}%`;

                return (
                  <div
                    key={index}
                    className={`${answerColors[index]} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}
                  >
                    {isCorrect && (
                      <div className="absolute top-4 right-4 bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                        ✓ Đúng
                      </div>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{answerShapes[index]}</span>
                      </div>
                      <p className="text-xl font-bold flex-1">{option}</p>
                    </div>

                    <div className="relative h-24 bg-white/20 rounded-lg overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-white/40 transition-all duration-500"
                        style={{ height: barHeight }}
                      ></div>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-3xl font-black">{count}</span>
                      <span className="text-2xl font-bold">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleNextQuestion}
                className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 text-xl font-bold"
              >
                <SkipForward className="w-6 h-6" />
                {currentQuestionIndex < mockQuestions.length - 1
                  ? "Câu tiếp theo"
                  : "Kết thúc Quiz"}
              </Button>
            </div>

            <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">
                Bảng xếp hạng tạm thời
              </h3>
              <div className="space-y-2">
                {players.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className="bg-white/20 rounded-lg px-4 py-3 flex items-center gap-4"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-400 text-yellow-900"
                          : index === 1
                          ? "bg-gray-300 text-gray-700"
                          : index === 2
                          ? "bg-orange-400 text-orange-900"
                          : "bg-white/30 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-white font-semibold flex-1">
                      {player.nickname}
                    </p>
                    <p className="text-white text-xl font-bold">
                      {player.score}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
