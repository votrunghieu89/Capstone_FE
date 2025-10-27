import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  Play,
  Eye,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  Hash,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";

interface Class {
  id: string;
  name: string;
  description: string;
  teacherName: string;
  studentCount: number;
  joinedAt: string;
  quizzes: ClassQuiz[];
}

interface ClassQuiz {
  id: string;
  title: string;
  description: string;
  isAssigned: boolean;
  assignedAt?: string;
  dueDate?: string;
  isCompleted: boolean;
  score?: number;
  maxScore?: number;
  timeLimit?: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
}

export default function StudentClasses() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Mock data - sẽ thay thế bằng API call thực tế
  const classes: Class[] = [
    {
      id: "1",
      name: "Lớp 10A1 - Toán học",
      description: "Lớp Toán học nâng cao",
      teacherName: "Nguyễn Văn Giáo viên",
      studentCount: 25,
      joinedAt: "2024-09-01",
      quizzes: [
        {
          id: "1",
          title: "Kiểm tra Toán chương 1",
          description: "Bài kiểm tra về đại số cơ bản",
          isAssigned: true,
          assignedAt: "2024-09-15",
          dueDate: "2024-10-15",
          isCompleted: true,
          score: 85,
          maxScore: 100,
          timeLimit: 45,
          difficulty: "Medium",
        },
        {
          id: "2",
          title: "Quiz Hình học",
          description: "Câu hỏi về tam giác và đường tròn",
          isAssigned: true,
          assignedAt: "2024-09-20",
          dueDate: "2024-10-20",
          isCompleted: false,
          timeLimit: 30,
          difficulty: "Easy",
        },
        {
          id: "3",
          title: "Bài tập về nhà - Đại số",
          description: "Luyện tập các dạng bài tập đại số",
          isAssigned: false,
          isCompleted: false,
          difficulty: "Hard",
        },
      ],
    },
    {
      id: "2",
      name: "Lớp 11B2 - Vật lý",
      description: "Lớp Vật lý cơ bản",
      teacherName: "Trần Thị Giáo viên",
      studentCount: 30,
      joinedAt: "2024-09-05",
      quizzes: [
        {
          id: "4",
          title: "Kiểm tra Vật lý - Điện học",
          description: "Bài kiểm tra về dòng điện và từ trường",
          isAssigned: true,
          assignedAt: "2024-09-25",
          dueDate: "2024-10-25",
          isCompleted: false,
          timeLimit: 60,
          difficulty: "Hard",
        },
      ],
    },
  ];

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

  const getStatusColor = (isCompleted: boolean, isAssigned: boolean) => {
    if (isCompleted) return "bg-success-100 text-success-800";
    if (isAssigned) return "bg-primary-100 text-primary-800";
    return "bg-secondary-100 text-secondary-800";
  };

  const getStatusText = (isCompleted: boolean, isAssigned: boolean) => {
    if (isCompleted) return "Đã hoàn thành";
    if (isAssigned) return "Chưa làm";
    return "Chưa gán";
  };

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    // TODO: Call API join class with joinCode
    await new Promise((r) => setTimeout(r, 800));
    setIsJoining(false);
    setJoinCode("");
    // Hiện tại chỉ mock: hiển thị thông báo
    alert(
      "Yêu cầu tham gia lớp đã được gửi (mock). Khi có BE sẽ thêm vào danh sách."
    );
  };

  const handleViewQuizDetail = (quizId: string, classId: string) => {
    // Always show preview when clicking "View Details"
    // Pass classId to indicate this quiz is from a class
    navigate(`/quiz/preview/${quizId}?classId=${classId}`);
  };

  const handleViewResult = (quizId: string, classId: string) => {
    // Navigate to result page with pattern: class-{classId}-{quizId}
    // This will show the leaderboard for this class quiz
    navigate(`/play/result/class-${classId}-${quizId}`);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          🎓 Lớp học
        </h1>
        <p className="text-secondary-600">Các lớp học bạn đã tham gia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List & Join */}
        <div className="lg:col-span-1">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                Tham gia lớp học
              </h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleJoinClass} className="space-y-3">
                <Input
                  label="Mã lớp"
                  placeholder="Nhập mã lớp (VD: ABC123)"
                  icon={<Hash size={16} />}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <Button
                  type="submit"
                  className="w-full"
                  loading={isJoining}
                  disabled={isJoining || !joinCode.trim()}
                >
                  Tham gia lớp
                </Button>
              </form>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">
                Danh sách lớp học
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedClass === classItem.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-200 hover:border-secondary-300"
                    }`}
                    onClick={() => setSelectedClass(classItem.id)}
                  >
                    <h4 className="font-medium text-secondary-900 mb-1">
                      {classItem.name}
                    </h4>
                    <p className="text-sm text-secondary-600 mb-2">
                      {classItem.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-secondary-500">
                      <span>GV: {classItem.teacherName}</span>
                      <span>{classItem.studentCount} HS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Class Details */}
        <div className="lg:col-span-2">
          {selectedClassData ? (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {selectedClassData.name}
                    </h3>
                    <p className="text-secondary-600">
                      Giáo viên: {selectedClassData.teacherName}
                    </p>
                  </div>
                  <div className="text-sm text-secondary-500">
                    Tham gia:{" "}
                    {new Date(selectedClassData.joinedAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {selectedClassData.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-4 border border-secondary-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-900 mb-1">
                            {quiz.title}
                          </h4>
                          <p className="text-sm text-secondary-600 mb-2">
                            {quiz.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                              quiz.difficulty
                            )}`}
                          >
                            {quiz.difficulty}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              quiz.isCompleted,
                              quiz.isAssigned
                            )}`}
                          >
                            {getStatusText(quiz.isCompleted, quiz.isAssigned)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-secondary-500 mb-3">
                        <div className="flex items-center space-x-4">
                          {quiz.timeLimit && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {quiz.timeLimit} phút
                            </div>
                          )}
                          {quiz.assignedAt && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Giao:{" "}
                              {new Date(quiz.assignedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          )}
                          {quiz.dueDate && (
                            <div className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              Hạn:{" "}
                              {new Date(quiz.dueDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          )}
                        </div>
                        {quiz.isCompleted && quiz.score !== undefined && (
                          <div className="flex items-center text-success-600">
                            <Trophy className="w-4 h-4 mr-1" />
                            {quiz.score}/{quiz.maxScore} điểm
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewQuizDetail(quiz.id, selectedClassData.id)
                          }
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem chi tiết
                        </Button>
                        {quiz.isAssigned && !quiz.isCompleted && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleViewQuizDetail(
                                quiz.id,
                                selectedClassData.id
                              )
                            }
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Bắt đầu làm
                          </Button>
                        )}
                        {quiz.isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-success-600 hover:bg-success-50"
                            onClick={() =>
                              handleViewResult(quiz.id, selectedClass!)
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Đã hoàn thành
                          </Button>
                        )}
                        {!quiz.isAssigned && (
                          <Button variant="outline" size="sm" disabled>
                            <XCircle className="w-4 h-4 mr-1" />
                            Chưa được gán
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedClassData.quizzes.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-600">
                      Chưa có quiz nào trong lớp này
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-content text-center py-12">
                <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  Chọn lớp học để xem chi tiết
                </h3>
                <p className="text-secondary-600">
                  Nhấn vào lớp học bên trái để xem các quiz
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
