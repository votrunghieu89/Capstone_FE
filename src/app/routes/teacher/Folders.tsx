import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderPlus,
  Folder,
  Plus,
  MoreVertical,
  Edit,
  BookOpen,
  Play,
  ChevronDown,
  ChevronRight,
  Trash2,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Input } from "../../../components/common/Input";
import {
  folderService,
  FolderType,
  QuizInFolder as Quiz,
} from "../../../services/folderService";
import { quizService } from "../../../services/quizService";
import toast from "react-hot-toast";

export default function TeacherFolders() {
  const navigate = useNavigate();
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null); // null = "all"
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [parentFolderForNew, setParentFolderForNew] = useState<number | null>(
    null
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openQuizMenuId, setOpenQuizMenuId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  // Data from API
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  const [newFolderName, setNewFolderName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get teacherId from localStorage
  const getTeacherId = (): number => {
    // Try both 'user_data' (from storage.ts) and 'user' (legacy)
    const userStr =
      localStorage.getItem("user_data") || localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Try multiple fields that might contain the ID
        const id = user.id || user.accountId || user.userId || user.teacherId;
        if (id) {
          return parseInt(id.toString());
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    // Fallback: check token and decode it
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split(".")[1]));
        const id = payload.nameid || payload.sub || payload.id;
        if (id) {
          console.log("Got teacher ID from token:", id);
          return parseInt(id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    return 0;
  };

  // Fetch all folders from API
  const fetchAllFolders = async () => {
    const teacherId = getTeacherId();
    if (teacherId === 0) {
      return; // Không làm gì nếu chưa login
    }

    try {
      setLoading(true);
      const data = await folderService.getAllFolders(teacherId);
      setFolders(data);
    } catch (error: any) {
      console.error("Error fetching folders:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách thư mục"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch folder detail (to get quizzes)
  const fetchFolderDetail = async (folderId: number) => {
    const teacherId = getTeacherId();
    if (teacherId === 0) {
      return; // Không làm gì nếu chưa login
    }

    try {
      setLoading(true);
      const data = await folderService.getFolderDetail(teacherId, folderId);
      // Sắp xếp quiz: mới tạo (id lớn) nằm trước
      const sorted = [...data.quizzFolder].sort(
        (a, b) => b.quizzId - a.quizzId
      );
      setQuizzes(sorted);
    } catch (error: any) {
      console.error("Error fetching folder detail:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải chi tiết thư mục"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch folders on mount
  useEffect(() => {
    fetchAllFolders();
  }, []);

  // Fetch folder detail when selectedFolder changes
  useEffect(() => {
    if (selectedFolder !== null) {
      fetchFolderDetail(selectedFolder);
    } else {
      setQuizzes([]); // Clear quizzes when at root level
    }
  }, [selectedFolder]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
      if (openQuizMenuId) {
        setOpenQuizMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId, openQuizMenuId]);

  // Helper function to count quizzes recursively (from folders tree)
  const countQuizzes = (folder: FolderType): number => {
    // Count quizzes in subfolders
    const subfolderCount = folder.folders.reduce(
      (sum, subfolder) => sum + countQuizzes(subfolder),
      0
    );
    return subfolderCount;
  };

  // Helper function to find folder by ID recursively
  const findFolderById = (
    folders: FolderType[],
    folderId: number
  ): FolderType | null => {
    for (const folder of folders) {
      if (folder.folderId === folderId) {
        return folder;
      }
      if (folder.folders && folder.folders.length > 0) {
        const found = findFolderById(folder.folders, folderId);
        if (found) return found;
      }
    }
    return null;
  };

  // Get root folders (folders without parent)
  const rootFolders = folders.filter((f) => f.parentFolderId === null);

  // Get current selected folder object
  const currentFolder = selectedFolder
    ? findFolderById(folders, selectedFolder)
    : null;

  // Get subfolders of current selected folder
  const currentSubfolders = currentFolder?.folders || [];

  // Filter quizzes based on selected folder (only when folder detail is fetched)
  const filteredQuizzes = quizzes;

  // Show folders when: at root level (null) OR current folder has subfolders
  const showFolders = selectedFolder === null || currentSubfolders.length > 0;

  // Show quizzes when: not at root level
  const showQuizzes = selectedFolder !== null;

  // Helper functions
  const toggleFolderExpand = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const hasSubfolders = (folder: FolderType) => {
    return folder.folders && folder.folders.length > 0;
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        setLoading(true);
        const teacherId = getTeacherId();

        console.log("=== CREATE FOLDER DEBUG ===");
        console.log("Teacher ID:", teacherId);
        console.log("Folder Name:", newFolderName);
        console.log("Parent Folder ID:", parentFolderForNew);

        if (teacherId === 0) {
          toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
          setTimeout(() => navigate("/auth/login"), 1500);
          return;
        }

        const payload = {
          teacherID: teacherId,
          folderName: newFolderName,
          parentFolderID: parentFolderForNew,
        };
        console.log("API Payload:", payload);

        await folderService.createFolder(payload);

        toast.success("Tạo thư mục thành công!");
        setShowCreateFolderModal(false);
        setNewFolderName("");
        setParentFolderForNew(null);

        // Refresh folders list
        await fetchAllFolders();
      } catch (error: any) {
        console.error("Error creating folder:", error);
        console.error("Error response:", error.response?.data);
        toast.error(error.response?.data?.message || "Không thể tạo thư mục");
      } finally {
        setLoading(false);
      }
    }
  };
  const openCreateFolderModal = (parentId: number | null = null) => {
    setParentFolderForNew(parentId);
    setShowCreateFolderModal(true);
  };

  const handleEditFolder = (folder: FolderType) => {
    setEditingFolder(folder);
    setEditFolderName(folder.folderName);
    setSelectedFolder(folder.folderId);
  };

  const handleSaveFolder = async () => {
    if (editFolderName.trim() && editingFolder) {
      try {
        setLoading(true);
        await folderService.updateFolder({
          folderId: editingFolder.folderId,
          folderName: editFolderName,
        });

        toast.success("Cập nhật thư mục thành công!");
        setEditingFolder(null);
        setEditFolderName("");

        // Refresh folders list
        await fetchAllFolders();
      } catch (error: any) {
        console.error("Error updating folder:", error);
        toast.error(
          error.response?.data?.message || "Không thể cập nhật thư mục"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
    setEditFolderName("");
    setSelectedFolder(null);
  };

  const handleDeleteFolder = (folder: FolderType) => {
    // Check if folder has subfolders
    if (folder.folders && folder.folders.length > 0) {
      toast.error(
        `Không thể xóa thư mục "${folder.folderName}" vì còn ${folder.folders.length} thư mục con. Vui lòng xóa thư mục con trước.`
      );
      setOpenMenuId(null);
      return;
    }

    setFolderToDelete(folder);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const confirmDeleteFolder = async () => {
    if (folderToDelete) {
      try {
        setLoading(true);
        await folderService.deleteFolder(folderToDelete.folderId);

        toast.success("Xóa thư mục thành công!");
        setShowDeleteModal(false);
        setFolderToDelete(null);
        setSelectedFolder(null);

        // Refresh folders list
        await fetchAllFolders();
      } catch (error: any) {
        console.error("Error deleting folder:", error);
        console.error("Error response:", error.response?.data);

        // Show specific error message from BE
        let errorMessage = "Không thể xóa thư mục";
        if (error.response?.data?.message) {
          const beMessage = error.response.data.message;
          if (beMessage.includes("contains quizzes")) {
            errorMessage =
              "Không thể xóa thư mục vì còn chứa quiz. Vui lòng di chuyển hoặc xóa quiz trước.";
          } else if (beMessage.includes("Failed to delete")) {
            errorMessage =
              "Không thể xóa thư mục. Có thể thư mục còn chứa thư mục con hoặc quiz.";
          } else {
            errorMessage = beMessage;
          }
        }

        toast.error(errorMessage);
        setShowDeleteModal(false); // Close modal even on error
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMenu = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === folderId ? null : folderId);
  };

  const toggleQuizMenu = (quizId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenQuizMenuId(openQuizMenuId === quizId ? null : quizId);
  };

  const handleDeleteQuiz = (quiz: Quiz, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuizToDelete(quiz);
    setShowDeleteQuizModal(true);
    setOpenQuizMenuId(null);
  };

  const confirmDeleteQuiz = async () => {
    if (quizToDelete) {
      try {
        setLoading(true);
        await quizService.deleteQuiz(quizToDelete.quizzId);

        toast.success("Xóa quiz thành công!");
        setShowDeleteQuizModal(false);
        setQuizToDelete(null);

        // Refresh quiz list
        if (selectedFolder) {
          await fetchFolderDetail(selectedFolder);
        }
      } catch (error: any) {
        console.error("Error deleting quiz:", error);
        const errorMessage =
          error.response?.data?.message || "Không thể xóa quiz";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Recursive function to render folder tree
  const renderFolderTree = (
    folderList: FolderType[],
    level: number
  ): JSX.Element[] => {
    return folderList.map((folder) => {
      const isExpanded = expandedFolders.has(folder.folderId);
      const hasSub = hasSubfolders(folder);
      const isSelected = selectedFolder === folder.folderId;

      return (
        <div key={folder.folderId}>
          {/* Folder Item */}
          <div className="relative group">
            <button
              className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600"
                  : "text-secondary-700 hover:bg-secondary-50"
              }`}
              style={{ paddingLeft: `${12 + level * 16}px` }}
              onClick={() => setSelectedFolder(folder.folderId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Expand/Collapse Button */}
                  {hasSub && (
                    <button
                      className="p-0.5 hover:bg-secondary-200 rounded transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderExpand(folder.folderId);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  {!hasSub && <div className="w-5" />}

                  <Folder
                    className={`w-4 h-4 flex-shrink-0 ${
                      isSelected ? "text-primary-600" : "text-secondary-500"
                    }`}
                  />
                  <span className="truncate">{folder.folderName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isSelected
                        ? "bg-primary-100 text-primary-700"
                        : "bg-secondary-100 text-secondary-600"
                    }`}
                  >
                    {countQuizzes(folder)}
                  </span>
                  {/* Add Subfolder Button */}
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary-200 rounded transition-all flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateFolderModal(folder.folderId);
                    }}
                    title="Tạo thư mục con"
                  >
                    <Plus className="w-3.5 h-3.5 text-secondary-600" />
                  </button>
                </div>
              </div>
            </button>
          </div>

          {/* Render Subfolders */}
          {hasSub && isExpanded && (
            <div className="mt-1">
              {renderFolderTree(folder.folders, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderFolderCard = (folder: FolderType) => {
    const quizCount = countQuizzes(folder);
    if (viewMode === "grid") {
      return (
        <div
          key={folder.folderId}
          className="group rounded-2xl overflow-hidden border border-secondary-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white relative"
        >
          <div
            className="h-28 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center relative cursor-pointer"
            onClick={() => setSelectedFolder(folder.folderId)}
          >
            <Folder className="w-14 h-14 text-blue-500 opacity-80" />
            <div className="absolute top-3 right-3">
              <button
                className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(folder.folderId, e);
                }}
              >
                <MoreVertical className="w-4 h-4 text-secondary-600" />
              </button>
              {openMenuId === folder.folderId && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa thư mục
                  </button>
                </div>
              )}
            </div>
          </div>
          <div
            className="p-4 cursor-pointer"
            onClick={() => setSelectedFolder(folder.folderId)}
          >
            <h3 className="font-bold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {folder.folderName}
            </h3>
            <p className="text-sm text-secondary-600 mb-3">{quizCount} quiz</p>
          </div>
          <div className="px-4 pb-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleEditFolder(folder);
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Sửa
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={folder.folderId}
        className="relative rounded-xl border border-secondary-200 bg-white px-4 py-3 flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer"
        onClick={() => setSelectedFolder(folder.folderId)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Folder className="w-5 h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-secondary-900 truncate">
                {folder.folderName}
              </h3>
              <p className="text-xs text-secondary-600">{quizCount} quiz</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu(folder.folderId, e);
              }}
            >
              <MoreVertical className="w-4 h-4 text-secondary-600" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleEditFolder(folder);
            }}
          >
            <Edit className="w-3 h-3 mr-1" />
            Sửa
          </Button>
        </div>
        {openMenuId === folder.folderId && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Xóa thư mục
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderQuizCard = (quiz: Quiz) => {
    const resolveAvatarUrl = (raw?: string) => {
      if (!raw) return "";
      let s = String(raw).trim().replace(/\\/g, "/");
      // If starts with '/http' or multiple slashes then http, strip leading slashes
      if (/^\/+https?:\/\//i.test(s)) s = s.replace(/^\/+/, "");
      // Absolute URL
      if (/^https?:\/\//i.test(s)) return s;
      // Relative path
      s = s.replace(/^\/+/, "");
      const root =
        (import.meta as any).env.VITE_SOCKET_URL ||
        ((import.meta as any).env.VITE_API_BASE_URL
          ? (import.meta as any).env.VITE_API_BASE_URL.replace(/\/api\/?$/, "")
          : "");
      return root ? `${root}/${s}` : `/${s}`;
    };
    const avatarUrl = resolveAvatarUrl(quiz.avatarURL);

    if (viewMode === "grid") {
      return (
        <div
          key={quiz.quizzId}
          className="group rounded-2xl overflow-hidden border border-secondary-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white cursor-pointer"
          onClick={() => navigate(`/quiz/preview/${quiz.quizzId}`)}
        >
          <div className="h-28 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none rounded-t-2xl"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <BookOpen className="w-16 h-16 text-white opacity-80" />
            )}
            <div className="absolute top-3 right-3">
              <button
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => toggleQuizMenu(quiz.quizzId, e)}
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
              {openQuizMenuId === quiz.quizzId && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={(e) => handleDeleteQuiz(quiz, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa quiz
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-bold text-secondary-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {quiz.title}
            </h3>
            <p className="text-xs text-secondary-600 mb-2 line-clamp-1">
              {quiz.topicName}
            </p>
            <div className="flex items-center justify-between text-xs text-secondary-500">
              <span>{quiz.totalQuestion} câu hỏi</span>
              <span>{quiz.totalParticipants} lượt chơi</span>
            </div>
          </div>
          <div className="px-3 pb-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/quiz/preview/${quiz.quizzId}`);
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Chơi
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/quiz/edit/${quiz.quizzId}`);
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Sửa
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={quiz.quizzId}
        className="relative rounded-xl border border-secondary-200 bg-white px-4 py-3 flex items-center justify-between gap-4 hover:shadow-md transition-all cursor-pointer"
        onClick={() => navigate(`/quiz/preview/${quiz.quizzId}`)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover pointer-events-none select-none"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <BookOpen className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-secondary-900 truncate">
              {quiz.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary-500">
              <span>{quiz.topicName}</span>
              <span>•</span>
              <span>{quiz.totalQuestion} câu hỏi</span>
              <span>•</span>
              <span>{quiz.totalParticipants} lượt chơi</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quiz/preview/${quiz.quizzId}`);
            }}
          >
            <Play className="w-3 h-3 mr-1" />
            Chơi
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quiz/edit/${quiz.quizzId}`);
            }}
          >
            <Edit className="w-3 h-3 mr-1" />
            Sửa
          </Button>
          <button
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            onClick={(e) => toggleQuizMenu(quiz.quizzId, e)}
          >
            <MoreVertical className="w-4 h-4 text-secondary-600" />
          </button>
        </div>
        {openQuizMenuId === quiz.quizzId && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
            <button
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={(e) => handleDeleteQuiz(quiz, e)}
            >
              <Trash2 className="w-4 h-4" />
              Xóa quiz
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Thư viện của tôi
          </h1>
          <p className="text-secondary-600">
            Quản lý và tổ chức tất cả quiz của bạn
          </p>
        </div>
        {/* Show Create Folder button only at root level */}
        {selectedFolder === null && (
          <Button
            onClick={() => setShowCreateFolderModal(true)}
            disabled={loading}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Tạo thư mục
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && folders.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && folders.length === 0 && (
        <div className="text-center py-20">
          <Folder className="w-16 h-16 mx-auto text-secondary-400 mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Chưa có thư mục nào
          </h3>
          <p className="text-secondary-600 mb-6">
            Tạo thư mục đầu tiên để bắt đầu tổ chức quiz của bạn
          </p>
          <Button onClick={() => setShowCreateFolderModal(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Tạo thư mục đầu tiên
          </Button>
        </div>
      )}

      {/* Layout with sidebar + content */}
      {!loading && folders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar - Folders List */}
          <aside className="card h-fit sticky top-20">
            <div className="card-content p-4">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-secondary-900">Thư mục</h3>
                  <button
                    className="p-1.5 hover:bg-secondary-100 rounded-lg transition-colors"
                    onClick={() => setShowCreateFolderModal(true)}
                  >
                    <Plus className="w-4 h-4 text-secondary-600" />
                  </button>
                </div>

                {/* All Folders - Collapsible Header */}
                <button
                  className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                    selectedFolder === null
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-secondary-700 hover:bg-secondary-50"
                  }`}
                  onClick={() => setSelectedFolder(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="p-0.5 hover:bg-white/20 rounded transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFoldersExpanded(!isFoldersExpanded);
                        }}
                      >
                        {isFoldersExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <Folder className="w-4 h-4" />
                      <span>Thư mục của bạn</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedFolder === null
                          ? "bg-white/20 text-white"
                          : "bg-secondary-100 text-secondary-600"
                      }`}
                    >
                      {rootFolders.length}
                    </span>
                  </div>
                </button>

                {/* Divider */}
                {isFoldersExpanded && (
                  <div className="border-t border-secondary-200 my-3"></div>
                )}

                {/* Folders List - Collapsible with scroll */}
                {isFoldersExpanded && (
                  <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {renderFolderTree(rootFolders, 0)}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <span className="text-sm text-secondary-500">
                  Chế độ hiển thị:
                </span>
                <div className="flex rounded-lg border border-secondary-200 overflow-hidden">
                  <button
                    className={`px-3 py-2 flex items-center gap-1 text-sm transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary-600 text-white"
                        : "text-secondary-600 hover:bg-secondary-100"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Lưới
                  </button>
                  <button
                    className={`px-3 py-2 flex items-center gap-1 text-sm transition-colors border-l border-secondary-200 ${
                      viewMode === "list"
                        ? "bg-primary-600 text-white"
                        : "text-secondary-600 hover:bg-secondary-100"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                    Danh sách
                  </button>
                </div>
              </div>
              <div className="flex gap-2 order-2 sm:order-1">
                {/* Show Create Subfolder button only when not at root */}
                {selectedFolder !== null && (
                  <Button
                    onClick={() => openCreateFolderModal(selectedFolder)}
                    variant="outline"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Tạo thư mục con
                  </Button>
                )}

                {/* Show Create Quiz button only when not at root */}
                {selectedFolder !== null && (
                  <Button onClick={() => navigate("/quiz/create")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Quiz
                  </Button>
                )}
              </div>
            </div>

            {/* Content Grid - Show Folders or Quizzes or Edit Form */}
            {editingFolder ? (
              // Edit Folder Form
              <div className="card max-w-2xl mx-auto">
                <div className="card-header">
                  <h2 className="text-xl font-bold text-secondary-900">
                    Chỉnh sửa thư mục
                  </h2>
                </div>
                <div className="card-content space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Tên thư mục <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      placeholder="Nhập tên thư mục..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                      disabled={loading}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveFolder}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-3"
                }
              >
                {/* Show Folders (subfolders of selected folder or root folders) */}
                {showFolders &&
                  (selectedFolder === null
                    ? rootFolders
                    : currentSubfolders
                  ).map((folder) => renderFolderCard(folder))}

                {/* Show Quizzes when a specific folder is selected */}
                {showQuizzes &&
                  filteredQuizzes.map((quiz) => renderQuizCard(quiz))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal
        isOpen={showCreateFolderModal}
        onClose={() => {
          setShowCreateFolderModal(false);
          setParentFolderForNew(null);
        }}
        title={parentFolderForNew ? "Tạo thư mục con" : "Tạo thư mục mới"}
      >
        <div className="space-y-4">
          {parentFolderForNew && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Thư mục cha:</span>{" "}
                {
                  folders.find((f) => f.folderId === parentFolderForNew)
                    ?.folderName
                }
              </p>
            </div>
          )}
          <Input
            label="Tên thư mục"
            placeholder="Nhập tên thư mục"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateFolderModal(false);
                setParentFolderForNew(null);
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateFolder} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>{parentFolderForNew ? "Tạo thư mục con" : "Tạo thư mục"}</>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Folder Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFolderToDelete(null);
        }}
        title="Xác nhận xóa thư mục"
      >
        <div className="space-y-4">
          <p className="text-secondary-700">
            Bạn có chắc chắn muốn xóa thư mục{" "}
            <span className="font-semibold text-secondary-900">
              "{folderToDelete?.folderName}"
            </span>
            ?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              ⚠️ Thư mục phải rỗng (không có quiz) mới có thể xóa.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setFolderToDelete(null);
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteFolder}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa thư mục"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Quiz Confirmation Modal */}
      <Modal
        isOpen={showDeleteQuizModal}
        onClose={() => {
          setShowDeleteQuizModal(false);
          setQuizToDelete(null);
        }}
        title="Xác nhận xóa quiz"
      >
        <div className="space-y-4">
          <p className="text-secondary-700">
            Bạn có chắc chắn muốn xóa quiz{" "}
            <span className="font-semibold text-secondary-900">
              "{quizToDelete?.title}"
            </span>
            ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ Hành động này không thể hoàn tác. Quiz sẽ bị xóa vĩnh viễn.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteQuizModal(false);
                setQuizToDelete(null);
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteQuiz}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa quiz"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}