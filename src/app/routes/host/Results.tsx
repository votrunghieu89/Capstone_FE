import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  Users,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Download,
  Home,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Button } from "../../../components/common/Button";

interface PlayerResult {
  id: string;
  nickname: string;
  score: number;
  rank: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  avgTimePerQuestion: number;
}

interface QuestionStats {
  questionNumber: number;
  content: string;
  correctRate: number;
  totalAnswers: number;
  correctAnswers: number;
}

export default function HostResults() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "questions">(
    "leaderboard"
  );

  console.log("HostResults - quizId:", quizId);

  // Mock data
  const quizTitle = "Phương trình bậc hai";
  const totalPlayers = 20;
  const totalQuestions = 3;
  const avgScore = 18.5;
  const avgAccuracy = 65;

  const players: PlayerResult[] = [
    {
      id: "1",
      nickname: "Nguyễn Văn Anh",
      score: 30,
      rank: 1,
      correctAnswers: 3,
      totalQuestions: 3,
      accuracy: 100,
      avgTimePerQuestion: 12,
    },
    {
      id: "2",
      nickname: "Trần Thị Bình",
      score: 30,
      rank: 2,
      correctAnswers: 3,
      totalQuestions: 3,
      accuracy: 100,
      avgTimePerQuestion: 14,
    },
    {
      id: "3",
      nickname: "Lê Hoàng Cường",
      score: 30,
      rank: 3,
      correctAnswers: 3,
      totalQuestions: 3,
      accuracy: 100,
      avgTimePerQuestion: 16,
    },
    {
      id: "4",
      nickname: "Phạm Thu Hà",
      score: 20,
      rank: 4,
      correctAnswers: 2,
      totalQuestions: 3,
      accuracy: 67,
      avgTimePerQuestion: 15,
    },
    {
      id: "5",
      nickname: "Hoàng Minh Tuấn",
      score: 20,
      rank: 5,
      correctAnswers: 2,
      totalQuestions: 3,
      accuracy: 67,
      avgTimePerQuestion: 17,
    },
    {
      id: "6",
      nickname: "Võ Thị Phương",
      score: 20,
      rank: 6,
      correctAnswers: 2,
      totalQuestions: 3,
      accuracy: 67,
      avgTimePerQuestion: 18,
    },
    {
      id: "7",
      nickname: "Đặng Quốc Gia",
      score: 20,
      rank: 7,
      correctAnswers: 2,
      totalQuestions: 3,
      accuracy: 67,
      avgTimePerQuestion: 19,
    },
    {
      id: "8",
      nickname: "Bùi Thị Hoa",
      score: 10,
      rank: 8,
      correctAnswers: 1,
      totalQuestions: 3,
      accuracy: 33,
      avgTimePerQuestion: 16,
    },
    {
      id: "9",
      nickname: "Dương Văn Ích",
      score: 10,
      rank: 9,
      correctAnswers: 1,
      totalQuestions: 3,
      accuracy: 33,
      avgTimePerQuestion: 18,
    },
    {
      id: "10",
      nickname: "Mai Thị Kim",
      score: 10,
      rank: 10,
      correctAnswers: 1,
      totalQuestions: 3,
      accuracy: 33,
      avgTimePerQuestion: 20,
    },
  ];

  const questionStats: QuestionStats[] = [
    {
      questionNumber: 1,
      content: "Tên cứ của hành tinh được phân loại lại...",
      correctRate: 75,
      totalAnswers: 20,
      correctAnswers: 15,
    },
    {
      questionNumber: 2,
      content: "Phương trình x² - 5x + 6 = 0 có nghiệm là:",
      correctRate: 60,
      totalAnswers: 20,
      correctAnswers: 12,
    },
    {
      questionNumber: 3,
      content: "Thủ đô của nước Úc là:",
      correctRate: 55,
      totalAnswers: 20,
      correctAnswers: 11,
    },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2 rounded-full font-black text-lg">
          <Trophy className="w-6 h-6" />
          <span>#{rank}</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-4 py-2 rounded-full font-bold text-lg">
          <Award className="w-5 h-5" />
          <span>#{rank}</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900 px-4 py-2 rounded-full font-bold text-lg">
          <Award className="w-5 h-5" />
          <span>#{rank}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-700 rounded-full font-bold">
          {rank}
        </div>
      );
    }
  };

  const handleExportResults = () => {
    console.log("Exporting results...");
    // TODO: Implement export to CSV/Excel
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 px-4 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-4 shadow-2xl">
              <Trophy className="w-10 h-10 text-yellow-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Kết quả Quiz
            </h1>
            <p className="text-xl text-white/90">{quizTitle}</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-gray-900">
                {totalPlayers}
              </div>
              <div className="text-sm text-gray-600">Học sinh</div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-gray-900">
                {totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Câu hỏi</div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-gray-900">
                {avgScore}
              </div>
              <div className="text-sm text-gray-600">Điểm TB</div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-gray-900">
                {avgAccuracy}%
              </div>
              <div className="text-sm text-gray-600">Độ chính xác TB</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              onClick={handleExportResults}
              variant="outline"
              className="bg-white/90 hover:bg-white text-purple-600 px-6 py-3"
            >
              <Download className="w-5 h-5" />
              Xuất kết quả
            </Button>

            <Button
              onClick={handleBackToHome}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
                activeTab === "leaderboard"
                  ? "bg-white text-purple-600 shadow-xl scale-105"
                  : "bg-white/30 text-white hover:bg-white/40"
              }`}
            >
              <Trophy className="w-6 h-6 inline-block mr-2" />
              Bảng xếp hạng
            </button>

            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
                activeTab === "questions"
                  ? "bg-white text-purple-600 shadow-xl scale-105"
                  : "bg-white/30 text-white hover:bg-white/40"
              }`}
            >
              <BarChart3 className="w-6 h-6 inline-block mr-2" />
              Thống kê câu hỏi
            </button>
          </div>

          {/* Content */}
          {activeTab === "leaderboard" ? (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-600" />
                Bảng xếp hạng cuối cùng
              </h2>

              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                {players[1] && (
                  <div className="text-center pt-12">
                    <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl p-6 shadow-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-3xl font-black text-gray-700">
                          {players[1].nickname.charAt(0)}
                        </span>
                      </div>
                      <Award className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                      <div className="text-4xl font-black text-gray-800 mb-1">
                        2
                      </div>
                      <p className="font-bold text-gray-800 mb-2">
                        {players[1].nickname}
                      </p>
                      <p className="text-2xl font-black text-gray-900">
                        {players[1].score}
                      </p>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {players[0] && (
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-2xl transform scale-110">
                      <div className="w-24 h-24 bg-yellow-200 rounded-full mx-auto mb-3 flex items-center justify-center border-4 border-yellow-300">
                        <span className="text-4xl font-black text-yellow-900">
                          {players[0].nickname.charAt(0)}
                        </span>
                      </div>
                      <Trophy className="w-16 h-16 text-yellow-900 mx-auto mb-2" />
                      <div className="text-5xl font-black text-yellow-900 mb-1">
                        1
                      </div>
                      <p className="font-black text-yellow-900 mb-2 text-lg">
                        {players[0].nickname}
                      </p>
                      <p className="text-3xl font-black text-yellow-900">
                        {players[0].score}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {players[2] && (
                  <div className="text-center pt-12">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 shadow-lg">
                      <div className="w-20 h-20 bg-orange-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-3xl font-black text-orange-800">
                          {players[2].nickname.charAt(0)}
                        </span>
                      </div>
                      <Award className="w-12 h-12 text-orange-800 mx-auto mb-2" />
                      <div className="text-4xl font-black text-orange-900 mb-1">
                        3
                      </div>
                      <p className="font-bold text-orange-900 mb-2">
                        {players[2].nickname}
                      </p>
                      <p className="text-2xl font-black text-orange-900">
                        {players[2].score}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Leaderboard */}
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      player.rank <= 3
                        ? "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getRankBadge(player.rank)}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">
                        {player.nickname}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {player.correctAnswers}/{player.totalQuestions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-blue-600" />
                          {player.accuracy}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-purple-600" />
                          {player.avgTimePerQuestion}s
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-purple-600">
                        {player.score}
                      </div>
                      <div className="text-xs text-gray-500">điểm</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                Thống kê theo câu hỏi
              </h2>

              <div className="space-y-4">
                {questionStats.map((stat) => (
                  <div
                    key={stat.questionNumber}
                    className="bg-gray-50 rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                            {stat.questionNumber}
                          </span>
                          <h3 className="font-bold text-gray-900">
                            {stat.content}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-3xl font-black text-purple-600">
                          {stat.correctRate}%
                        </div>
                        <div className="text-sm text-gray-500">Tỷ lệ đúng</div>
                      </div>
                    </div>

                    <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 flex items-center justify-end px-3"
                        style={{ width: `${stat.correctRate}%` }}
                      >
                        <span className="text-white text-sm font-bold">
                          {stat.correctAnswers}/{stat.totalAnswers}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">
                          {stat.correctAnswers} trả lời đúng
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">
                          {stat.totalAnswers - stat.correctAnswers} trả lời sai
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
