import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  Loader2,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  Hash,
  Copy,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Play,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Input } from "../../../components/common/Input";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { groupService, AllGroupDTO } from "../../../services/groupService";
import {
  folderService,
  FolderType,
  QuizInFolder,
} from "../../../services/folderService";
import { toast } from "react-hot-toast";

interface ClassWithDetails extends AllGroupDTO {
  studentCount?: number;
  quizCount?: number;
  createAt?: string;
  idUnique?: string;
  groupDescription?: string;
}

export default function TeacherClasses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [editClassName, setEditClassName] = useState("");
  const [editClassDescription, setEditClassDescription] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [quizMessage, setQuizMessage] = useState("");
  const [quizExpiredTime, setQuizExpiredTime] = useState("");
  const [quizMaxAttempts, setQuizMaxAttempts] = useState("");
  const [creating, setCreating] = useState(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [quizzesInFolder, setQuizzesInFolder] = useState<QuizInFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 lớp mỗi trang (4 hàng x 3 cột)
  const [detailStudents, setDetailStudents] = useState<any[]>([]);
  const [detailQuizzes, setDetailQuizzes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"activity" | "students">(
    "activity"
  );
  const [recentClasses, setRecentClasses] = useState<ClassWithDetails[]>([]);

  // Confirm dialog states
  const [showDeleteClassConfirm, setShowDeleteClassConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] =
    useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [showDeleteQuizConfirm, setShowDeleteQuizConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

  const getTeacherId = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const id = payload.AccountId || payload.TeacherId || payload.nameid;
        if (id) return parseInt(id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return 0;
  };

  const loadFolders = async () => {
    const teacherId = getTeacherId();
    if (teacherId === 0) return;

    try {
      setLoadingFolders(true);
      const data = await folderService.getAllFolders(teacherId);
      setFolders(data);
    } catch (error: any) {
      console.error("Error loading folders:", error);
      toast.error("Không thể tải danh sách thư mục");
    } finally {
      setLoadingFolders(false);
    }
  };

  const loadQuizzesInFolder = async (folderId: number) => {
    const teacherId = getTeacherId();
    if (teacherId === 0) return;

    try {
      setLoadingQuizzes(true);
      const data = await folderService.getFolderDetail(teacherId, folderId);
      setQuizzesInFolder(data.quizzFolder);
    } catch (error: any) {
      console.error("Error loading quizzes:", error);
      toast.error("Không thể tải danh sách quiz");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchGroups = async () => {
    const teacherId = getTeacherId();
    if (teacherId === 0) {
      console.warn("Teacher ID is 0, skipping fetch");
      return;
    }

    // Check if token exists
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found");
      toast.error("Vui lòng đăng nhập lại");
      return;
    }

    console.log("Fetching groups for teacher:", teacherId);
    console.log("Token exists:", !!token);

    try {
      setLoading(true);
      const data = await groupService.getGroupsByTeacherId(teacherId);

      // Fetch details for each group
      const classesWithDetails = await Promise.all(
        data.map(async (classItem) => {
          try {
            const [detail, students] = await Promise.all([
              groupService.getGroupDetail(classItem.groupId),
              groupService.getStudentsByGroupId(classItem.groupId),
            ]);

            return {
              ...classItem,
              studentCount: students.length,
              quizCount: detail.quizzes.length,
              createAt: detail.createAt,
              idUnique: detail.idUnique,
              groupDescription: detail.groupDescription,
            };
          } catch (error) {
            console.error(
              `Error fetching details for group ${classItem.groupId}:`,
              error
            );
            return {
              ...classItem,
              studentCount: 0,
              quizCount: 0,
            };
          }
        })
      );

      setClasses(classesWithDetails);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      } else {
        toast.error(
          error.response?.data?.message || "Không thể tải danh sách lớp"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error("Vui lòng nhập tên lớp");
      return;
    }

    const teacherId = getTeacherId();
    try {
      setCreating(true);
      await groupService.createGroup({
        TeacherId: teacherId,
        GroupName: newClassName.trim(),
        GroupDescription: newClassDescription.trim() || undefined,
      });
      toast.success("Tạo lớp thành công");
      setShowCreateModal(false);
      setNewClassName("");
      setNewClassDescription("");
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tạo lớp thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClass = (groupId: number) => {
    setClassToDelete(groupId);
    setShowDeleteClassConfirm(true);
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      await groupService.deleteGroup(classToDelete);
      toast.success("Xóa lớp thành công");

      // Remove from classes list
      setClasses((prev) => prev.filter((c) => c.groupId !== classToDelete));

      // Remove from recent classes
      setRecentClasses((prev) =>
        prev.filter((c) => c.groupId !== classToDelete)
      );
      setSelectedClass(null); // Close selected class when it's deleted
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xóa lớp thất bại");
    } finally {
      setClassToDelete(null);
      setShowDeleteClassConfirm(false); // Close dialog after successful deletion
    }
  };

  const handleViewDetail = async (classItem: ClassWithDetails) => {
    try {
      setSelectedClass(classItem);
      const [students, detail] = await Promise.all([
        groupService.getStudentsByGroupId(classItem.groupId),
        groupService.getGroupDetail(classItem.groupId),
      ]);
      setDetailStudents(students);
      setDetailQuizzes(detail.quizzes);

      // Add to recent classes
      setRecentClasses((prev) => {
        const filtered = prev.filter((c) => c.groupId !== classItem.groupId);
        return [classItem, ...filtered].slice(0, 5); // Keep only 5 most recent
      });
    } catch (error) {
      console.error("Error fetching class detail:", error);
      toast.error("Không thể tải chi tiết lớp");
    }
  };

  const handleEditClass = async () => {
    if (!selectedClass) return;

    try {
      await groupService.updateGroup({
        GroupId: selectedClass.groupId,
        GroupName: editClassName.trim(),
        GroupDescription: editClassDescription.trim() || undefined,
      });
      toast.success("Cập nhật lớp thành công");
      setShowEditModal(false);
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật lớp thất bại");
    }
  };

  const handleAddStudent = async () => {
    if (!selectedClass || !newStudentId.trim()) {
      toast.error("Vui lòng nhập ID học sinh");
      return;
    }

    try {
      await groupService.insertStudentToGroup(
        selectedClass.groupId,
        newStudentId.trim()
      );
      toast.success("Thêm học sinh thành công");
      setNewStudentId("");
      setShowAddStudentModal(false);
      // Refresh class list and reload selected class detail
      await fetchGroups();
      await handleViewDetail(selectedClass);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thêm học sinh thất bại");
    }
  };

  const handleRemoveStudent = (studentId: number) => {
    if (!selectedClass) return;
    setStudentToDelete(studentId);
    setShowDeleteStudentConfirm(true);
  };

  const confirmRemoveStudent = async () => {
    if (!selectedClass || !studentToDelete) return;

    const teacherId = getTeacherId();
    try {
      await groupService.removeStudentFromGroup(
        selectedClass.groupId,
        studentToDelete,
        teacherId
      );
      toast.success("Xóa học sinh thành công");
      handleViewDetail(selectedClass);
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xóa học sinh thất bại");
    } finally {
      setStudentToDelete(null);
    }
  };

  const handleAddQuiz = async () => {
    if (!selectedClass || !selectedQuizId) {
      toast.error("Vui lòng chọn quiz");
      return;
    }

    if (!quizExpiredTime) {
      toast.error("Vui lòng chọn thời gian hết hạn");
      return;
    }

    if (!quizMaxAttempts) {
      toast.error("Vui lòng nhập số lần làm tối đa");
      return;
    }

    const teacherId = getTeacherId();
    if (teacherId === 0) {
      toast.error("Không tìm thấy thông tin giáo viên");
      return;
    }

    try {
      await groupService.insertQuizToGroup({
        QuizId: selectedQuizId,
        TeacherId: teacherId,
        GroupId: selectedClass.groupId,
        Message: quizMessage.trim() || undefined,
        ExpiredTime: quizExpiredTime, // ISO string from datetime-local input
        MaxAttempts: parseInt(quizMaxAttempts),
      });
      toast.success("Giao quiz thành công");
      setSelectedQuizId(null);
      setSelectedFolder(null);
      setQuizzesInFolder([]);
      setQuizMessage("");
      setQuizExpiredTime("");
      setQuizMaxAttempts("");
      setShowAddQuizModal(false);
      handleViewDetail(selectedClass);
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Giao quiz thất bại");
    }
  };

  const handleRemoveQuiz = (quizId: number) => {
    if (!selectedClass) return;
    setQuizToDelete(quizId);
    setShowDeleteQuizConfirm(true);
  };

  const confirmRemoveQuiz = async () => {
    if (!selectedClass || !quizToDelete) return;

    try {
      await groupService.removeQuizFromGroup(
        selectedClass.groupId,
        quizToDelete
      );
      toast.success("Xóa quiz thành công");
      handleViewDetail(selectedClass);
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xóa quiz thất bại");
    } finally {
      setQuizToDelete(null);
    }
  };

  useEffect(() => {
    fetchGroups();

    // Load recent classes from localStorage
    const savedRecent = localStorage.getItem("recentClasses");
    if (savedRecent) {
      try {
        setRecentClasses(JSON.parse(savedRecent));
      } catch (error) {
        console.error("Error loading recent classes:", error);
      }
    }
  }, []);

  // Save recent classes to localStorage when it changes
  useEffect(() => {
    if (recentClasses.length > 0) {
      localStorage.setItem("recentClasses", JSON.stringify(recentClasses));
    }
  }, [recentClasses]);

  // Toggle folder expand/collapse
  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Recursive folder tree component
  const FolderTreeItem = ({
    folder,
    level = 0,
  }: {
    folder: FolderType;
    level?: number;
  }) => {
    const isExpanded = expandedFolders.has(folder.folderId);
    const hasChildren = folder.folders && folder.folders.length > 0;

    return (
      <div>
        <button
          onClick={() => {
            toggleFolder(folder.folderId);
            if (!isExpanded) {
              setSelectedFolder(folder);
              loadQuizzesInFolder(folder.folderId);
            }
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-secondary-100 text-secondary-900"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}

          {isExpanded ? (
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 flex-shrink-0" />
          )}

          <span className="flex-1 truncate text-sm font-medium">
            {folder.folderName}
          </span>
        </button>

        {isExpanded && (
          <div className="mt-1 space-y-1">
            {/* Quizzes in this folder */}
            {selectedFolder?.folderId === folder.folderId && loadingQuizzes ? (
              <div
                className="flex items-center justify-center py-2"
                style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}
              >
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              </div>
            ) : (
              selectedFolder?.folderId === folder.folderId &&
              quizzesInFolder.length > 0 &&
              quizzesInFolder.map((quiz) => (
                <button
                  key={quiz.quizzId}
                  onClick={() => setSelectedQuizId(quiz.quizzId)}
                  className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedQuizId === quiz.quizzId
                      ? "bg-success-600 text-white"
                      : "bg-white hover:bg-success-50 text-secondary-900 border border-secondary-200"
                  }`}
                  style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{quiz.title}</p>
                    <p className="text-xs opacity-75 mt-0.5">
                      {quiz.totalQuestion} câu • {quiz.topicName}
                    </p>
                  </div>
                </button>
              ))
            )}

            {/* Subfolders */}
            {hasChildren && (
              <div>
                {folder.folders.map((subFolder) => (
                  <FolderTreeItem
                    key={subFolder.folderId}
                    folder={subFolder}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteClassConfirm}
        onClose={() => setShowDeleteClassConfirm(false)}
        onConfirm={confirmDeleteClass}
        title="Xóa lớp học"
        message="Bạn có chắc chắn muốn xóa lớp này?"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={showDeleteStudentConfirm}
        onClose={() => setShowDeleteStudentConfirm(false)}
        onConfirm={confirmRemoveStudent}
        title="Xóa học sinh"
        message="Bạn có chắc chắn muốn xóa học sinh này khỏi lớp?"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={showDeleteQuizConfirm}
        onClose={() => setShowDeleteQuizConfirm(false)}
        onConfirm={confirmRemoveQuiz}
        title="Xóa quiz"
        message="Bạn có chắc chắn muốn xóa quiz này khỏi lớp?"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="destructive"
      />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Lớp học của tôi
            </h1>
            <p className="text-secondary-600 mt-1">
              Quản lý các lớp học và học sinh
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Lớp
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-secondary-900">
                    Lớp do bạn sở hữu
                  </h3>
                  <span className="text-xs text-secondary-500">
                    {classes.length}
                  </span>
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {classes.map((classItem) => (
                    <button
                      key={classItem.groupId}
                      onClick={() => handleViewDetail(classItem)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                        selectedClass?.groupId === classItem.groupId
                          ? "bg-primary-600 text-white font-medium"
                          : "text-secondary-700 hover:bg-secondary-100"
                      }`}
                    >
                      {classItem.groupName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Tạo Lớp
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                  Lớp gần đây
                </h3>

                <div className="space-y-1">
                  {recentClasses.length === 0 ? (
                    <p className="text-xs text-secondary-500 text-center py-2">
                      Chưa có lớp nào
                    </p>
                  ) : (
                    recentClasses.map((classItem) => (
                      <button
                        key={classItem.groupId}
                        onClick={() => handleViewDetail(classItem)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                          selectedClass?.groupId === classItem.groupId
                            ? "bg-primary-600 text-white font-medium"
                            : "text-secondary-700 hover:bg-secondary-100"
                        }`}
                      >
                        {classItem.groupName}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>

          <main>
            {selectedClass ? (
              // Detail View
              <div className="space-y-6">
                {/* Back Button - Outside card */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedClass(null);
                    setActiveTab("activity");
                  }}
                  className="bg-secondary-50 hover:bg-secondary-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>

                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                          Lớp {selectedClass.groupName}
                        </h2>
                        <p className="text-secondary-600 mb-3">
                          {selectedClass.groupDescription ||
                            `Lớp ${selectedClass.groupName}`}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-secondary-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Tạo ngày:{" "}
                            {selectedClass.createAt
                              ? new Date(
                                  selectedClass.createAt
                                ).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditClassName(selectedClass.groupName);
                          setEditClassDescription(
                            selectedClass.groupDescription || ""
                          );
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-error-600 border-error-600 hover:bg-error-50"
                        onClick={() => {
                          handleDeleteClass(selectedClass.groupId);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa Lớp
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-secondary-200">
                  <div className="flex gap-8">
                    <button
                      onClick={() => setActiveTab("activity")}
                      className={`pb-3 px-1 font-medium transition-colors relative ${
                        activeTab === "activity"
                          ? "text-primary-600"
                          : "text-secondary-600 hover:text-secondary-900"
                      }`}
                    >
                      Hoạt động
                      {activeTab === "activity" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("students")}
                      className={`pb-3 px-1 font-medium transition-colors relative ${
                        activeTab === "students"
                          ? "text-primary-600"
                          : "text-secondary-600 hover:text-secondary-900"
                      }`}
                    >
                      Học sinh ({detailStudents.length})
                      {activeTab === "students" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === "activity" && (
                    <div>
                      {/* Two columns: Invite & Assign */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Mời thành viên */}
                        <div className="card">
                          <div className="card-content text-center">
                            <h3 className="font-semibold text-secondary-900 mb-4">
                              Mời thành viên
                            </h3>
                            <Button
                              size="sm"
                              onClick={() => setShowAddStudentModal(true)}
                            >
                              Thêm Học sinh
                            </Button>
                          </div>
                        </div>

                        {/* Giao */}
                        <div className="card">
                          <div className="card-content text-center">
                            <h3 className="font-semibold text-secondary-900 mb-4">
                              Giao
                            </h3>
                            <Button
                              size="sm"
                              onClick={() => {
                                setShowAddQuizModal(true);
                                loadFolders();
                              }}
                            >
                              Giao bài
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Activity List */}
                      {detailQuizzes.length === 0 &&
                      detailStudents.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-secondary-500 text-sm">
                            Chưa có hoạt động nào trong nhóm này – hãy bắt đầu
                            bằng cách tạo nội dung.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Quiz Activities */}
                          {detailQuizzes.map((quiz: any) => (
                            <div key={quiz.qgId} className="card">
                              <div className="card-content">
                                <div>
                                  {/* Top section: Icon + Content */}
                                  <div className="flex gap-4 mb-3">
                                    {/* Icon */}
                                    <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                                      <BookOpen className="w-6 h-6 text-success-600" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-secondary-900 text-base mb-1">
                                        {quiz.title}
                                      </h4>
                                      <div className="flex items-center gap-3 text-sm text-secondary-600 mb-2">
                                        <span>
                                          Giáo Viên: {quiz.teacherName}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          Giao ngày:{" "}
                                          {new Date(
                                            quiz.dateCreated
                                          ).toLocaleDateString("vi-VN")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs">
                                        {quiz.expiredDate && (
                                          <span className="text-error-600 flex items-center gap-1.5 font-medium">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Hết hạn:{" "}
                                            {new Date(
                                              quiz.expiredDate
                                            ).toLocaleDateString("vi-VN")}
                                          </span>
                                        )}
                                        <span className="text-secondary-600 flex items-center gap-1.5">
                                          <RotateCcw className="w-3.5 h-3.5" />
                                          Số lần làm: {quiz.maxAttempts || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bottom section: Actions */}
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      className="min-w-[140px]"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        // Lấy quizId từ quiz.quizId hoặc quiz.deliveredQuiz?.quizId
                                        const quizId =
                                          quiz.quizId ||
                                          quiz.deliveredQuiz?.quizId;
                                        const classId = selectedClass?.groupId;

                                        if (!quizId || !classId) {
                                          toast.error(
                                            "Không tìm thấy ID của quiz hoặc lớp học"
                                          );
                                          console.error(
                                            "Quiz:",
                                            quiz,
                                            "Class:",
                                            selectedClass
                                          );
                                          return;
                                        }

                                        // Navigate đến preview page với classId
                                        const url = `/quiz/preview/${quizId}?classId=${classId}`;
                                        console.log("Navigating to:", url);
                                        window.location.href = url;
                                      }}
                                    >
                                      <Play className="w-4 h-4 mr-1.5" />
                                      Bắt đầu làm bài
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-error-600 hover:bg-error-50"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Lấy quizId từ quiz.quizId hoặc quiz.deliveredQuiz?.quizId
                                        const quizId =
                                          quiz.quizId ||
                                          quiz.deliveredQuiz?.quizId;
                                        if (quizId) {
                                          handleRemoveQuiz(quizId);
                                        } else {
                                          toast.error(
                                            "Không tìm thấy ID của quiz"
                                          );
                                          console.error("Quiz data:", quiz);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "students" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Mời thành viên</h3>
                        <Button
                          size="sm"
                          onClick={() => setShowAddStudentModal(true)}
                        >
                          Thêm Học sinh
                        </Button>
                      </div>

                      {/* Card hiển thị mã lớp để học sinh tham gia */}
                      <div className="card mb-6">
                        <div className="card-content">
                          <p className="text-sm text-secondary-600 mb-2">
                            Chia sẻ mã lớp này với học sinh để họ tham gia:
                          </p>
                          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Hash className="w-5 h-5 text-secondary-600" />
                              <span className="font-mono text-lg font-bold text-secondary-900">
                                {selectedClass.idUnique}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  selectedClass.idUnique || ""
                                );
                                toast.success("Đã sao chép mã lớp");
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Sao chép
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="font-semibold mb-4">
                          Danh sách học sinh
                        </h3>
                        {detailStudents.length === 0 ? (
                          <p className="text-sm text-secondary-500 text-center py-8">
                            Chưa có học sinh nào
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {detailStudents.map((student: any) => (
                              <div key={student.studentId} className="card">
                                <div className="card-content">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-primary-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium">
                                          {student.fullName}
                                        </p>
                                        <p className="text-sm text-secondary-600">
                                          {student.email}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-error-600"
                                      onClick={() =>
                                        handleRemoveStudent(student.studentId)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : classes.length === 0 ? (
              <div className="card h-96 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    Chưa có lớp học nào
                  </h3>
                  <p className="text-secondary-600 mb-6">
                    Tạo lớp học đầu tiên để bắt đầu
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo lớp học mới
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
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
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClass(classItem);
                                  setEditClassName(classItem.groupName);
                                  setEditClassDescription("");
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-error-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClass(classItem.groupId);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          {/* Mã lớp - compact */}
                          {classItem.idUnique && (
                            <div className="flex items-center gap-1.5 bg-secondary-100 px-2 py-1 rounded mb-3">
                              <Hash className="w-3 h-3 text-secondary-600" />
                              <span className="font-mono text-xs font-semibold text-secondary-700 flex-1">
                                {classItem.idUnique}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    classItem.idUnique || ""
                                  );
                                  toast.success("Đã sao chép mã lớp");
                                }}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="text-center p-2 bg-primary-50 rounded-lg">
                              <Users className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                              <p className="text-xl font-bold text-primary-900">
                                {classItem.studentCount ?? 0}
                              </p>
                              <p className="text-xs text-primary-600">
                                Học sinh
                              </p>
                            </div>
                            <div className="text-center p-2 bg-success-50 rounded-lg">
                              <BookOpen className="w-5 h-5 text-success-600 mx-auto mb-1" />
                              <p className="text-xl font-bold text-success-900">
                                {classItem.quizCount ?? 0}
                              </p>
                              <p className="text-xs text-success-600">Quiz</p>
                            </div>
                          </div>
                          {classItem.createAt && (
                            <div className="flex items-center gap-1.5 text-xs text-secondary-500 mb-3 pb-3 border-b border-secondary-100">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Tạo:{" "}
                                {new Date(
                                  classItem.createAt
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClass(classItem);
                                setShowAddStudentModal(true);
                              }}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Thêm HS
                            </Button>
                            <Button
                              size="sm"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClass(classItem);
                                setShowAddQuizModal(true);
                                loadFolders();
                              }}
                            >
                              <BookOpen className="w-3 h-3 mr-1" />
                              Giao Quiz
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </main>
        </div>

        {/* Pagination - Outside grid, centered on full width */}
        {!selectedClass && classes.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-2 mt-6 pb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.ceil(classes.length / itemsPerPage) },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
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
                setCurrentPage((prev) =>
                  Math.min(Math.ceil(classes.length / itemsPerPage), prev + 1)
                )
              }
              disabled={
                currentPage === Math.ceil(classes.length / itemsPerPage)
              }
            >
              Sau
            </Button>
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tạo lớp học mới"
        >
          <div className="space-y-4">
            <Input
              label="Tên lớp học"
              placeholder="Nhập tên lớp học"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Mô tả
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="Nhập mô tả lớp học"
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleCreateClass} disabled={creating}>
                {creating ? "Đang tạo..." : "Tạo lớp học"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Sửa thông tin lớp học"
        >
          <div className="space-y-4">
            <Input
              label="Tên lớp học"
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Mô tả
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={editClassDescription}
                onChange={(e) => setEditClassDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleEditClass}>Lưu</Button>
            </div>
          </div>
        </Modal>

        {/* Add Student Modal */}
        <Modal
          isOpen={showAddStudentModal}
          onClose={() => {
            setShowAddStudentModal(false);
            setNewStudentId("");
          }}
          title={`Thêm học sinh vào Lớp ${selectedClass?.groupName || ""}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                ID học sinh (IdUnique)
              </label>
              <Input
                placeholder="Nhập ID học sinh"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
              />
              <p className="text-xs text-secondary-500 mt-1">
                Học sinh có thể tìm ID của mình trong phần Hồ sơ
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddStudentModal(false);
                  setNewStudentId("");
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleAddStudent}>Thêm học sinh</Button>
            </div>
          </div>
        </Modal>

        {/* Add Quiz Modal */}
        <Modal
          isOpen={showAddQuizModal}
          onClose={() => {
            setShowAddQuizModal(false);
            setSelectedQuizId(null);
            setSelectedFolder(null);
            setQuizzesInFolder([]);
            setQuizMessage("");
            setQuizExpiredTime("");
            setQuizMaxAttempts("");
          }}
          title={`Giao quiz cho Lớp ${selectedClass?.groupName || ""}`}
        >
          <div className="space-y-4">
            {/* Folder Selection - Tree View */}
            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Chọn quiz từ thư mục <span className="text-error-600">*</span>
              </label>
              {loadingFolders ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                </div>
              ) : folders.length === 0 ? (
                <p className="text-sm text-secondary-500 text-center py-4">
                  Không có thư mục nào
                </p>
              ) : (
                <div className="border rounded-lg p-2 max-h-72 overflow-y-auto bg-secondary-50">
                  <div className="space-y-1">
                    {folders.map((folder) => (
                      <FolderTreeItem key={folder.folderId} folder={folder} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quiz info - Show selected quiz */}
            {selectedQuizId && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                <p className="text-sm font-medium text-success-900">
                  ✓ Đã chọn quiz:{" "}
                  {
                    quizzesInFolder.find((q) => q.quizzId === selectedQuizId)
                      ?.title
                  }
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Thông điệp
              </label>
              <textarea
                className="input min-h-[60px] resize-none"
                placeholder="Nhập thông điệp cho học sinh (tùy chọn)"
                value={quizMessage}
                onChange={(e) => setQuizMessage(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Thời gian hết hạn <span className="text-error-600">*</span>
              </label>
              <Input
                type="datetime-local"
                value={quizExpiredTime}
                onChange={(e) => setQuizExpiredTime(e.target.value)}
              />
              <p className="text-xs text-secondary-500 mt-1">
                Thời gian học sinh có thể làm quiz
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Số lần làm tối đa <span className="text-error-600">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="VD: 3"
                value={quizMaxAttempts}
                onChange={(e) => setQuizMaxAttempts(e.target.value)}
              />
              <p className="text-xs text-secondary-500 mt-1">
                Số lần học sinh được phép làm quiz này
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddQuizModal(false);
                  setSelectedQuizId(null);
                  setSelectedFolder(null);
                  setQuizzesInFolder([]);
                  setQuizMessage("");
                  setQuizExpiredTime("");
                  setQuizMaxAttempts("");
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleAddQuiz}>Giao quiz</Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
