import { useNavigate, useParams } from "react-router-dom";
import { Trophy, ChevronLeft } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { useState, useEffect } from "react";

interface StudentResult {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  rank: number;
}

interface QuizLeaderboardData {
  quizTitle: string;
  className: string;
  maxScore: number;
  totalQuestions: number;
  myResult?: StudentResult;
  leaderboard: StudentResult[];
}

export default function QuizResultView() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] =
    useState<QuizLeaderboardData | null>(null);

  useEffect(() => {
    // TODO: Call API to get quiz leaderboard for class
    const fetchQuizLeaderboard = async () => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 500));

      // Mock data - Bảng xếp hạng các thành viên trong lớp
      setLeaderboardData({
        quizTitle: "Kiểm tra Toán chương 1",
        className: "Lớp 10A1 - Toán học",
        maxScore: 100,
        totalQuestions: 10,
        myResult: {
          studentId: "current-user",
          studentName: "Học sinh (Bạn)",
          score: 85,
          correctAnswers: 8,
          totalQuestions: 10,
          timeSpent: 240,
          completedAt: "2024-10-10T10:30:00",
          rank: 3,
        },
        leaderboard: [
          {
            studentId: "1",
            studentName: "Nguyễn Văn A",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random",
            score: 100,
            correctAnswers: 10,
            totalQuestions: 10,
            timeSpent: 180,
            completedAt: "2024-10-10T09:15:00",
            rank: 1,
          },
          {
            studentId: "2",
            studentName: "Trần Thị B",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Tran+Thi+B&background=random",
            score: 90,
            correctAnswers: 9,
            totalQuestions: 10,
            timeSpent: 200,
            completedAt: "2024-10-10T09:45:00",
            rank: 2,
          },
          {
            studentId: "current-user",
            studentName: "Học sinh (Bạn)",
            score: 85,
            correctAnswers: 8,
            totalQuestions: 10,
            timeSpent: 240,
            completedAt: "2024-10-10T10:30:00",
            rank: 3,
          },
          {
            studentId: "3",
            studentName: "Lê Văn C",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Le+Van+C&background=random",
            score: 80,
            correctAnswers: 8,
            totalQuestions: 10,
            timeSpent: 300,
            completedAt: "2024-10-10T10:45:00",
            rank: 4,
          },
          {
            studentId: "4",
            studentName: "Phạm Thị D",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Pham+Thi+D&background=random",
            score: 75,
            correctAnswers: 7,
            totalQuestions: 10,
            timeSpent: 280,
            completedAt: "2024-10-10T11:00:00",
            rank: 5,
          },
          {
            studentId: "5",
            studentName: "Hoàng Văn E",
            avatarUrl:
              "https://ui-avatars.com/api/?name=Hoang+Van+E&background=random",
            score: 70,
            correctAnswers: 7,
            totalQuestions: 10,
            timeSpent: 320,
            completedAt: "2024-10-10T11:15:00",
            rank: 6,
          },
        ],
      });
      setIsLoading(false);
    };

    fetchQuizLeaderboard();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-600 mb-4">Không tìm thấy kết quả</p>
          <Button onClick={() => navigate("/student/classes")}>
            Quay về lớp học
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600 bg-yellow-50";
    if (rank === 2) return "text-gray-600 bg-gray-50";
    if (rank === 3) return "text-orange-600 bg-orange-50";
    return "text-secondary-600 bg-secondary-50";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const { myResult } = leaderboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/student/classes")}
          className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Quay về lớp học
        </button>

        {/* Quiz Info Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-1">
                {leaderboardData.quizTitle}
              </h1>
              <p className="text-secondary-600">{leaderboardData.className}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-secondary-600">Tổng số câu</div>
              <div className="text-2xl font-bold text-primary-600">
                {leaderboardData.totalQuestions}
              </div>
            </div>
          </div>
        </div>

        {/* My Result Card */}
        {myResult && (
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm mb-1">Kết quả của bạn</p>
                  <p className="text-2xl font-bold">Hạng {myResult.rank}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{myResult.score}</div>
                  <div className="text-xs text-white/80">Điểm</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {myResult.correctAnswers}/{myResult.totalQuestions}
                  </div>
                  <div className="text-xs text-white/80">Đúng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {formatTime(myResult.timeSpent)}
                  </div>
                  <div className="text-xs text-white/80">Thời gian</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="w-7 h-7 mr-2" />
              Bảng Xếp Hạng
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {leaderboardData.leaderboard.length} học sinh đã hoàn thành
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {leaderboardData.leaderboard.map((student) => {
                const isCurrentUser = student.studentId === "current-user";
                const accuracy = Math.round(
                  (student.correctAnswers / student.totalQuestions) * 100
                );

                return (
                  <div
                    key={student.studentId}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? "bg-primary-50 border-2 border-primary-300 shadow-md"
                        : "bg-secondary-50 border border-secondary-200 hover:shadow-md"
                    }`}
                  >
                    {/* Rank & Avatar */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${getRankColor(
                          student.rank
                        )}`}
                      >
                        {getRankIcon(student.rank)}
                      </div>

                      <div className="flex items-center space-x-3">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.studentName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                              {student.studentName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p
                            className={`font-semibold ${
                              isCurrentUser
                                ? "text-primary-900"
                                : "text-secondary-900"
                            }`}
                          >
                            {student.studentName}
                          </p>
                          <p className="text-xs text-secondary-500">
                            Hoàn thành lúc{" "}
                            {new Date(student.completedAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {student.score}
                        </div>
                        <div className="text-xs text-secondary-600">điểm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-secondary-700">
                          {accuracy}%
                        </div>
                        <div className="text-xs text-secondary-600">
                          chính xác
                        </div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-semibold text-secondary-700">
                          {formatTime(student.timeSpent)}
                        </div>
                        <div className="text-xs text-secondary-600">
                          thời gian
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/student/classes")}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Quay về lớp học
          </Button>
        </div>
      </div>
    </div>
  );
}
