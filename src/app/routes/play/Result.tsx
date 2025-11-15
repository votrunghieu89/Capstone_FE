import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  Target,
  Clock,
  Users,
  RotateCcw,
  Home,
  Share2,
  Download,
  Star,
} from "lucide-react";
import { Button } from "../../../components/common/Button";

interface FinalResult {
  myScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  rank: number;
  totalPlayers: number;
  accuracy: number;
}

interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  rank: number;
  isMe: boolean;
}

export default function PlayResult() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const playedResults = (location.state as any)?.results as
    | Array<{
        id: string;
        content: string;
        correctIndex: number;
        selectedIndex: number | null;
        time: number;
        isCorrect: boolean;
      }>
    | undefined;

  // Detect mode from sessionId pattern
  const isSoloMode = sessionId?.startsWith("solo-");
  const isClassMode = sessionId?.startsWith("class-");
  const isLiveMode = !isSoloMode && !isClassMode;

  // Mock data - sẽ thay thế bằng API call thực tế
  // Trong class mode: hiển thị leaderboard toàn lớp
  // Trong solo mode: chỉ hiển thị kết quả cá nhân
  // Trong live mode: hiển thị leaderboard realtime
  const result: FinalResult = {
    myScore: 25, // 10 điểm/câu x 2.5 câu trung bình
    totalQuestions: 3,
    correctAnswers: 2,
    timeSpent: 45, // seconds
    rank: 3,
    totalPlayers: isClassMode ? 20 : isSoloMode ? 1 : 20,
    accuracy: 67,
  };

  // Leaderboard: hiển thị cho class mode và live mode
  // Solo mode: chỉ hiển thị kết quả riêng của người chơi
  const leaderboard: LeaderboardEntry[] = isSoloMode
    ? [
        {
          id: "me",
          nickname: "Bạn",
          score: result.myScore,
          rank: 1,
          isMe: true,
        },
      ]
    : [
        {
          id: "1",
          nickname: "Nguyễn Văn Anh",
          score: 30,
          rank: 1,
          isMe: false,
        },
        { id: "2", nickname: "Trần Thị Bình", score: 30, rank: 2, isMe: false },
        { id: "3", nickname: "Bạn", score: 20, rank: 3, isMe: true },
        {
          id: "4",
          nickname: "Lê Hoàng Cường",
          score: 20,
          rank: 4,
          isMe: false,
        },
        { id: "5", nickname: "Phạm Thu Hà", score: 10, rank: 5, isMe: false },
      ];

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Xuất sắc! Bạn đã làm rất tốt!";
    if (score >= 80) return "Tốt! Kết quả khá ấn tượng!";
    if (score >= 70) return "Khá tốt! Hãy cố gắng thêm!";
    if (score >= 60) return "Trung bình. Cần cải thiện thêm!";
    return "Cần cố gắng nhiều hơn!";
  };

  const handlePlayAgain = () => {
    // Solo mode: quay lại preview để chơi lại
    if (isSoloMode && sessionId) {
      const quizId = sessionId.replace("solo-", "");
      navigate(`/quiz/preview/${quizId}`, { state: { from: "/play/result" } });
    }
    // Class mode: quay về trang lớp học
    else if (isClassMode) {
      navigate("/student/classes");
    }
    // Live mode: quay về trang nhập mã PIN
    else {
      navigate("/play/join");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero summary */}
        <div
          className="rounded-2xl p-8 border border-white/40 shadow-xl mb-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(236,72,153,0.9) 100%)",
          }}
        >
          <div className="flex items-center justify-between text-white mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold">
                  {getPerformanceMessage(result.myScore)}
                </h2>
                <p className="text-white/90">
                  Bạn đã hoàn thành quiz: Phương trình bậc hai
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/20 rounded-xl p-5 text-center text-white">
              <div className="text-3xl font-extrabold">{result.myScore}%</div>
              <div className="text-sm">Điểm số</div>
            </div>
            <div className="bg-white/20 rounded-xl p-5 text-center text-white">
              <div className="text-3xl font-extrabold">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-sm">Câu đúng</div>
            </div>
            <div className="bg-white/20 rounded-xl p-5 text-center text-white">
              <div className="text-3xl font-extrabold">#{result.rank}</div>
              <div className="text-sm">Xếp hạng</div>
            </div>
            <div className="bg-white/20 rounded-xl p-5 text-center text-white">
              <div className="text-3xl font-extrabold">
                {Math.round(result.myScore * 10)}
              </div>
              <div className="text-sm">Điểm thưởng</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePlayAgain}
              className="bg-white text-secondary-900 hover:opacity-90"
            >
              Chơi Lại
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="bg-white/10 border-white/40 text-white hover:bg-white/20"
            >
              Về trang chủ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Results */}
          <div className={isSoloMode ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Kết quả của bạn
                </h3>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success-600 mb-2">
                      {result.correctAnswers}
                    </div>
                    <p className="text-sm text-secondary-600">Câu đúng</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-error-600 mb-2">
                      {result.totalQuestions - result.correctAnswers}
                    </div>
                    <p className="text-sm text-secondary-600">Câu sai</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning-600 mb-2">
                      #{result.rank}
                    </div>
                    <p className="text-sm text-secondary-600">Xếp hạng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết kết quả */}
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Chi Tiết Kết Quả
                </h3>
                <div className="text-sm text-secondary-600 mb-3">
                  Phân tích từng câu hỏi trong quiz
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-secondary-700 h-2 rounded-full"
                    style={{ width: `${result.accuracy}%` }}
                  />
                </div>

                {(playedResults && playedResults.length
                  ? playedResults.map((r, i) => ({
                      id: i + 1,
                      content: r.content,
                      correct: r.isCorrect,
                      correctText: "Đáp án đúng",
                      time: `${r.time}s`,
                    }))
                  : [
                      {
                        id: 1,
                        content: "Phương trình x^2 - 5x + 6 = 0 có nghiệm là:",
                        correct: true,
                        correctText: "x = 2 hoặc x = 3",
                        time: "6s",
                      },
                      {
                        id: 2,
                        content:
                          "Phương trình x^2 - 4 = 0 có bao nhiêu nghiệm?",
                        correct: false,
                        correctText: "2 nghiệm",
                        time: "15s",
                      },
                    ]
                ).map((row) => (
                  <div
                    key={row.id}
                    className="p-4 mb-3 rounded-xl border bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">
                        Câu {row.id}
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            row.correct
                              ? "bg-success-100 text-success-700"
                              : "bg-error-100 text-error-700"
                          }`}
                        >
                          {row.correct ? "Đúng" : "Sai"}
                        </span>
                      </div>
                      <div className="text-xs text-secondary-500">
                        {row.time}
                      </div>
                    </div>
                    <div className="text-secondary-900 mb-1">{row.content}</div>
                    <div className="text-sm text-secondary-600">
                      Đáp án đúng:{" "}
                      <span className="font-medium">{row.correctText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard - Only show for Class and Live modes, hide for Solo mode */}
          {!isSoloMode && (
            <div className="lg:col-span-1">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Bảng xếp hạng cuối
                  </h3>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    {leaderboard.map((player) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          player.isMe
                            ? "bg-primary-50 border border-primary-200"
                            : "bg-secondary-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              player.rank <= 3
                                ? player.rank === 1
                                  ? "bg-warning-500 text-white"
                                  : player.rank === 2
                                  ? "bg-secondary-400 text-white"
                                  : "bg-warning-600 text-white"
                                : "bg-primary-100 text-primary-600"
                            }`}
                          >
                            {player.rank}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">
                              {player.nickname}
                            </p>
                            <p className="text-sm text-secondary-500">
                              {player.score} điểm
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {player.rank <= 3 && (
                            <Trophy className="w-5 h-5 text-warning-600" />
                          )}
                          {player.isMe && (
                            <Star className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <div className="text-center">
                      <p className="text-sm text-secondary-600">
                        Bạn xếp hạng {result.rank}/{result.totalPlayers}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Trong tổng số {result.totalPlayers} người chơi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
