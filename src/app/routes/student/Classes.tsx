import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  Play,
  Loader2,
  LogOut,
  Copy,
  Hash,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import {
  groupService,
  AllGroupDTO,
  ViewQuizDTO,
} from "../../../services/groupService";
import { toast } from "react-hot-toast";

interface ClassWithDetails extends AllGroupDTO {
  quizzes?: ViewQuizDTO[];
  groupDescription?: string;
  idUnique?: string;
  createAt?: string;
}

export default function StudentClasses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(
    null
  );
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [detailQuizzes, setDetailQuizzes] = useState<ViewQuizDTO[]>([]);
  const [detailQuizPage, setDetailQuizPage] = useState(1);
  const detailQuizzesPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 5 rows x 3 columns
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [classToLeave, setClassToLeave] = useState<number | null>(null);

  const getStudentId = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const id = payload.AccountId || payload.StudentId || payload.nameid;
        if (id) return parseInt(id);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
    return 0;
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const studentId = getStudentId();
      if (!studentId) {
        toast.error("Vui lòng đăng nhập");
        return;
      }
      const data = await groupService.getGroupsByStudentId(studentId);
      setClasses(data);
    } catch (error: any) {
      toast.error("Không thể tải danh sách lớp");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleViewDetail = async (classItem: ClassWithDetails) => {
    try {
      const detail = await groupService.getGroupDetail(classItem.groupId);
      setSelectedClass({
        ...classItem,
        quizzes: detail.quizzes,
        groupDescription: detail.groupDescription,
        idUnique: detail.idUnique,
      });
      setDetailQuizzes(detail.quizzes || []);
      setDetailQuizPage(1);
    } catch (error: any) {
      console.warn(
        "Cannot fetch class detail, showing basic info:",
        error.message
      );

      // Silently handle error - still show the class with empty quiz list
      // Don't show error toast to avoid annoying users
      setSelectedClass({
        ...classItem,
        quizzes: [],
        groupDescription:
          classItem.groupDescription || `Lớp ${classItem.groupName}`,
        idUnique: classItem.idUnique,
      });
      setDetailQuizzes([]);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Vui lòng nhập mã lớp");
      return;
    }
    setIsJoining(true);
    try {
      const studentId = getStudentId();
      await groupService.joinGroupByInvite(joinCode, studentId);
      toast.success("Tham gia lớp thành công!");
      setJoinCode("");
      fetchClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tham gia lớp thất bại");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClass = (groupId: number) => {
    setClassToLeave(groupId);
    setShowLeaveConfirm(true);
  };

  const confirmLeaveClass = async () => {
    if (!classToLeave) return;

    try {
      const studentId = getStudentId();
      await groupService.leaveGroup(classToLeave, studentId, 0);
      toast.success("Đã rời khỏi lớp");
      setSelectedClass(null);
      fetchClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể rời lớp");
    } finally {
      setClassToLeave(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã copy mã lớp");
  };

  // Navigate to quiz preview page (student view)
  // Preview page will show quiz details with "Bắt đầu làm Quiz" button
  // (No "Tổ chức Live" button for students - that's teacher only)
  const handleStartQuiz = (quizId: number) => {
    navigate(`/quiz/preview/${quizId}`);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeaveClass}
        title="Rời khỏi lớp"
        message="Bạn có chắc chắn muốn rời khỏi lớp này?"
        confirmText="Rời lớp"
        cancelText="Hủy"
        confirmVariant="destructive"
      />

      <div className="w-full p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            {" "}
            Lớp học của tôi
          </h1>
          <p className="text-secondary-600">Quản lý các lớp học và bài tập</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="card">
              <div className="card-content">
                <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                  Tham gia lớp học
                </h3>
                <form onSubmit={handleJoinClass} className="space-y-3">
                  <Input
                    placeholder="Nhập mã lớp"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={isJoining || !joinCode.trim()}
                  >
                    {isJoining ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                    <span className="ml-2">Tham gia</span>
                  </Button>
                </form>
              </div>
            </div>
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-secondary-900">
                    Danh sách lớp đã tham gia
                  </h3>
                  <span className="text-xs text-secondary-500">
                    {classes.length}
                  </span>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : classes.length === 0 ? (
                  <p className="text-sm text-secondary-500 text-center py-8">
                    Chưa tham gia lớp nào
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {classes.map((classItem) => (
                      <button
                        key={classItem.groupId}
                        onClick={() => handleViewDetail(classItem)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedClass?.groupId === classItem.groupId
                            ? "bg-primary-600 text-white font-medium"
                            : "text-secondary-700 hover:bg-secondary-100"
                        }`}
                      >
                        {classItem.groupName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
          <main className="flex flex-col">
            {!selectedClass ? (
              // Show all classes as grid when no class is selected
              loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : classes.length === 0 ? (
                <div className="card">
                  <div className="card-content text-center py-12">
                    <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                      Chưa tham gia lớp nào
                    </h3>
                    <p className="text-secondary-600">
                      Nhập mã lớp ở bên trái để tham gia lớp học
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                      Tất cả lớp học
                    </h2>
                    <p className="text-secondary-600">
                      Click vào lớp để xem chi tiết và quiz
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {classes
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      )
                      .map((classItem) => (
                        <div
                          key={classItem.groupId}
                          className="card hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => handleViewDetail(classItem)}
                        >
                          <div className="card-content relative p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-secondary-900 truncate mb-1">
                                  Lớp {classItem.groupName}
                                </h3>
                                <p className="text-xs text-secondary-500 truncate">
                                  {classItem.groupDescription ||
                                    `Lớp ${classItem.groupName}`}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-error-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLeaveClass(classItem.groupId);
                                }}
                              >
                                <LogOut className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Mã lớp */}
                            {classItem.idUnique && (
                              <div className="flex items-center gap-1.5 bg-secondary-100 px-2 py-1 rounded mb-3">
                                <Hash className="w-3 h-3 text-secondary-600" />
                                <span className="font-mono text-xs font-semibold text-secondary-700 flex-1">
                                  {classItem.idUnique}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCode(classItem.idUnique || "");
                                  }}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <div className="text-center p-3 bg-primary-50 rounded-lg">
                              <BookOpen className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                              <p className="text-xs text-primary-600 font-medium">
                                Xem chi tiết lớp học
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Pagination - At the bottom, separate from grid */}
                  <div className="mt-auto pt-8">
                    {classes.length > itemsPerPage && (
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Trước
                        </Button>

                        {Array.from(
                          { length: Math.ceil(classes.length / itemsPerPage) },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "primary" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(
                                Math.ceil(classes.length / itemsPerPage),
                                p + 1
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(classes.length / itemsPerPage)
                          }
                        >
                          Tiếp
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div>
                {/* Back Button - Outside card */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClass(null)}
                  className="mb-4 bg-secondary-50 hover:bg-secondary-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>

                <div className="card">
                  <div className="card-content border-b border-secondary-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                          Lớp {selectedClass.groupName}
                        </h2>
                        <p className="text-secondary-600 mb-3">
                          {selectedClass.groupDescription ||
                            `Lớp ${selectedClass.groupName}`}
                        </p>
                        {selectedClass.idUnique && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-secondary-600">Mã lớp:</span>
                            <code className="bg-secondary-100 px-2 py-1 rounded font-mono">
                              {selectedClass.idUnique}
                            </code>
                            <button
                              onClick={() =>
                                handleCopyCode(selectedClass.idUnique!)
                              }
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-error-600 border-error-600 hover:bg-error-50"
                        onClick={() => handleLeaveClass(selectedClass.groupId)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Rời lớp
                      </Button>
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                      Quiz đã giao
                    </h3>
                    <div className="flex flex-col min-h-[60vh]">
                    {detailQuizzes.length === 0 ? (
                      <p className="text-sm text-secondary-500 text-center py-8">
                        Chưa có quiz nào được giao
                      </p>
                    ) : (
                        <div className="space-y-3 flex-1">
                          {detailQuizzes
                            .slice(
                              (detailQuizPage - 1) * detailQuizzesPerPage,
                              detailQuizPage * detailQuizzesPerPage
                            )
                            .map((quiz) => (
                          <div
                            key={quiz.qgId}
                            className="card border border-secondary-200"
                          >
                            <div className="card-content p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-secondary-900 leading-tight truncate">
                                    {quiz.title}
                                  </h4>
                                  {quiz.message && (
                                        <p className="text-sm text-secondary-600 line-clamp-1">
                                      {quiz.message}
                                    </p>
                                  )}
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleStartQuiz(
                                          quiz.deliveredQuiz?.quizId ||
                                            quiz.quizId
                                        )
                                      }
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Làm bài
                                    </Button>
                                  </div>

                                  {/* Meta compact */}
                                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary-600">
                                    <span>GV: {quiz.teacherName}</span>
                                    <span>•</span>
                                    <span>
                                      Giao:{" "}
                                      {new Date(
                                        quiz.dateCreated
                                      ).toLocaleDateString("vi-VN")}
                                    </span>
                                  {quiz.expiredDate && (
                                      <span className="flex items-center gap-1 text-error-600">
                                        <Calendar className="w-3 h-3" />
                                      Hết hạn:{" "}
                                      {new Date(
                                        quiz.expiredDate
                                      ).toLocaleDateString("vi-VN")}
                                      </span>
                                  )}
                                  {quiz.maxAttempts !== undefined &&
                                    quiz.maxAttempts !== null && (
                                        <span className="flex items-center gap-1">
                                          <RotateCcw className="w-3 h-3" />
                                        Số lần làm: {quiz.maxAttempts || 0}
                                        </span>
                                      )}
                                      </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                      {detailQuizzes.length > detailQuizzesPerPage && (
                        <div className="mt-6 py-3 flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDetailQuizPage((p) => Math.max(1, p - 1))
                            }
                            disabled={detailQuizPage === 1}
                          >
                            Trước
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from(
                              {
                                length: Math.ceil(
                                  detailQuizzes.length / detailQuizzesPerPage
                                ),
                              },
                              (_, i) => i + 1
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => setDetailQuizPage(page)}
                                className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                                  detailQuizPage === page
                                    ? "bg-primary-600 text-white"
                                    : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDetailQuizPage((p) =>
                                Math.min(
                                  Math.ceil(
                                    detailQuizzes.length / detailQuizzesPerPage
                                  ),
                                  p + 1
                                )
                              )
                            }
                            disabled={
                              detailQuizPage ===
                              Math.ceil(
                                detailQuizzes.length / detailQuizzesPerPage
                              )
                            }
                          >
                            Sau
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
