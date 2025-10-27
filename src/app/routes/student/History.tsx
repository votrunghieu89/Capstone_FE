import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../../components/common/Button";

interface QuizHistory {
  id: string;
  title: string;
  topic: string;
  score: number;
  maxScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in minutes
  completedAt: string;
  difficulty: "Easy" | "Medium" | "Hard";
  class?: string;
  teacher?: string;
}

export default function StudentHistory() {
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterScore, setFilterScore] = useState("all");

  // Mock data - sẽ thay thế bằng API call thực tế
  const history: QuizHistory[] = [
    {
      id: "1",
      title: "Kiểm tra Toán chương 1",
      topic: "Toán học",
      score: 85,
      maxScore: 100,
      totalQuestions: 20,
      correctAnswers: 17,
      timeSpent: 25,
      completedAt: "2024-10-03T14:30:00",
      difficulty: "Medium",
      class: "Lớp 10A1",
      teacher: "Nguyễn Văn Giáo viên",
    },
    {
      id: "2",
      title: "Quiz Vật lý - Điện học",
      topic: "Vật lý",
      score: 92,
      maxScore: 100,
      totalQuestions: 15,
      correctAnswers: 14,
      timeSpent: 35,
      completedAt: "2024-10-02T16:45:00",
      difficulty: "Hard",
      class: "Lớp 11B2",
      teacher: "Trần Thị Giáo viên",
    },
    {
      id: "3",
      title: "Lịch sử Việt Nam",
      topic: "Lịch sử",
      score: 78,
      maxScore: 100,
      totalQuestions: 25,
      correctAnswers: 20,
      timeSpent: 20,
      completedAt: "2024-10-01T10:15:00",
      difficulty: "Easy",
    },
    {
      id: "4",
      title: "Bài tập Hóa học",
      topic: "Hóa học",
      score: 65,
      maxScore: 100,
      totalQuestions: 18,
      correctAnswers: 12,
      timeSpent: 40,
      completedAt: "2024-09-30T09:30:00",
      difficulty: "Medium",
    },
  ];

  const topics = [
    "Tất cả",
    "Toán học",
    "Vật lý",
    "Hóa học",
    "Lịch sử",
    "Địa lý",
    "Văn học",
  ];

  const filteredHistory = history.filter((quiz) => {
    const matchesTopic = filterTopic === "all" || quiz.topic === filterTopic;
    const matchesScore =
      filterScore === "all" ||
      (filterScore === "excellent" && quiz.score >= 90) ||
      (filterScore === "good" && quiz.score >= 70 && quiz.score < 90) ||
      (filterScore === "average" && quiz.score >= 50 && quiz.score < 70) ||
      (filterScore === "poor" && quiz.score < 50);
    return matchesTopic && matchesScore;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success-600";
    if (score >= 70) return "text-warning-600";
    return "text-error-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <TrendingUp className="w-4 h-4 text-success-600" />;
    if (score >= 70) return <Target className="w-4 h-4 text-warning-600" />;
    return <TrendingDown className="w-4 h-4 text-error-600" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success-100 text-success-800";
      case "Medium":
        return "bg-warning-100 text-warning-800";
      case "Hard":
        return "bg-error-100 text-error-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, quiz) => sum + quiz.score, 0) / history.length
        )
      : 0;

  const totalTimeSpent = history.reduce((sum, quiz) => sum + quiz.timeSpent, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          📖 Lịch sử Quiz
        </h1>
        <p className="text-secondary-600">Xem lại các quiz đã hoàn thành</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Quiz đã làm
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  {history.length}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Điểm trung bình
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  {averageScore}%
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <Trophy className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Thời gian học
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  {totalTimeSpent}m
                </p>
              </div>
              <div className="p-3 bg-accent-100 rounded-lg">
                <Clock className="w-6 h-6 text-accent-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Tỷ lệ đúng
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  {history.length > 0
                    ? Math.round(
                        (history.reduce(
                          (sum, quiz) => sum + quiz.correctAnswers,
                          0
                        ) /
                          history.reduce(
                            (sum, quiz) => sum + quiz.totalQuestions,
                            0
                          )) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <Target className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <select
                className="input"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
              >
                {topics.map((topic) => (
                  <option
                    key={topic}
                    value={topic === "Tất cả" ? "all" : topic}
                  >
                    {topic}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:w-48">
              <select
                className="input"
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
              >
                <option value="all">Tất cả điểm</option>
                <option value="excellent">Xuất sắc (90%+)</option>
                <option value="good">Tốt (70-89%)</option>
                <option value="average">Trung bình (50-69%)</option>
                <option value="poor">Yếu (&lt;50%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((quiz) => (
          <div key={quiz.id} className="card">
            <div className="card-content">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {quiz.topic}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        quiz.difficulty
                      )}`}
                    >
                      {quiz.difficulty}
                    </span>
                    {quiz.class && (
                      <span className="text-secondary-500">
                        {quiz.class} • {quiz.teacher}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getScoreIcon(quiz.score)}
                  </div>
                  <p
                    className={`text-lg font-bold ${getScoreColor(quiz.score)}`}
                  >
                    {quiz.score}%
                  </p>
                  <p className="text-xs text-secondary-500">Điểm số</p>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 text-primary-600" />
                  </div>
                  <p className="text-lg font-bold text-secondary-900">
                    {quiz.correctAnswers}/{quiz.totalQuestions}
                  </p>
                  <p className="text-xs text-secondary-500">Câu đúng</p>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-accent-600" />
                  </div>
                  <p className="text-lg font-bold text-secondary-900">
                    {quiz.timeSpent}m
                  </p>
                  <p className="text-xs text-secondary-500">Thời gian</p>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-4 h-4 text-success-600" />
                  </div>
                  <p className="text-sm font-bold text-secondary-900">
                    {new Date(quiz.completedAt).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-xs text-secondary-500">Hoàn thành</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Xem chi tiết
                </Button>
                <Button size="sm" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Làm lại
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Chưa có lịch sử quiz
          </h3>
          <p className="text-secondary-600">
            Hoàn thành quiz đầu tiên để xem lịch sử
          </p>
        </div>
      )}
    </div>
  );
}
