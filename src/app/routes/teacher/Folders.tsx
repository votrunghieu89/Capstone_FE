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
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Input } from "../../../components/common/Input";

interface FolderType {
  id: string;
  name: string;
  description?: string;
  quizCount: number;
  createdAt: string;
  color?: string;
  parentId?: string | null;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  folderId: string;
  questionCount: number;
  plays: number;
  visibility: "public" | "private";
  createdAt: string;
  coverImage?: string;
}

export default function TeacherFolders() {
  const navigate = useNavigate();
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>("all");
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderDescription, setEditFolderDescription] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [parentFolderForNew, setParentFolderForNew] = useState<string | null>(
    null
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);

  // Mock data - Folders (with hierarchical structure)
  const folders: FolderType[] = [
    {
      id: "1",
      name: "Toán học lớp 10",
      description: "Tất cả quiz toán học lớp 10",
      quizCount: 8,
      createdAt: "2024-09-01",
      color: "bg-blue-500",
      parentId: null,
    },
    {
      id: "1-1",
      name: "Đại số",
      description: "Các chủ đề về đại số",
      quizCount: 4,
      createdAt: "2024-09-02",
      color: "bg-blue-400",
      parentId: "1",
    },
    {
      id: "1-2",
      name: "Hình học",
      description: "Các chủ đề về hình học",
      quizCount: 4,
      createdAt: "2024-09-03",
      color: "bg-blue-400",
      parentId: "1",
    },
    {
      id: "2",
      name: "Vật lý cơ bản",
      description: "Quiz vật lý cho học sinh trung học",
      quizCount: 5,
      createdAt: "2024-09-05",
      color: "bg-purple-500",
      parentId: null,
    },
    {
      id: "2-1",
      name: "Cơ học",
      description: "Chủ đề cơ học",
      quizCount: 3,
      createdAt: "2024-09-06",
      color: "bg-purple-400",
      parentId: "2",
    },
    {
      id: "3",
      name: "Hóa học",
      description: "Bộ quiz hóa học đa dạng",
      quizCount: 6,
      createdAt: "2024-09-10",
      color: "bg-green-500",
      parentId: null,
    },
    {
      id: "4",
      name: "Lịch sử Việt Nam",
      description: "Lịch sử và văn hóa Việt Nam",
      quizCount: 4,
      createdAt: "2024-09-15",
      color: "bg-orange-500",
      parentId: null,
    },
  ];

  // Mock data - Quizzes
  const quizzes: Quiz[] = [
    // Toán học
    {
      id: "q1",
      title: "Hàm số bậc nhất",
      description: "Khái niệm và tính chất hàm số bậc nhất",
      folderId: "1",
      questionCount: 15,
      plays: 234,
      visibility: "public",
      createdAt: "2024-09-02",
    },
    {
      id: "q2",
      title: "Phương trình bậc 2",
      description: "Giải và biện luận phương trình bậc 2",
      folderId: "1",
      questionCount: 20,
      plays: 189,
      visibility: "public",
      createdAt: "2024-09-03",
    },
    {
      id: "q3",
      title: "Lượng giác cơ bản",
      description: "Công thức lượng giác và ứng dụng",
      folderId: "1",
      questionCount: 18,
      plays: 156,
      visibility: "private",
      createdAt: "2024-09-04",
    },
    // Vật lý
    {
      id: "q4",
      title: "Chuyển động thẳng đều",
      description: "Các bài tập về chuyển động thẳng đều",
      folderId: "2",
      questionCount: 12,
      plays: 145,
      visibility: "public",
      createdAt: "2024-09-06",
    },
    {
      id: "q5",
      title: "Định luật Newton",
      description: "3 định luật Newton và ứng dụng",
      folderId: "2",
      questionCount: 16,
      plays: 198,
      visibility: "public",
      createdAt: "2024-09-07",
    },
    // Hóa học
    {
      id: "q6",
      title: "Bảng tuần hoàn",
      description: "Cấu tạo và tính chất bảng tuần hoàn",
      folderId: "3",
      questionCount: 14,
      plays: 167,
      visibility: "public",
      createdAt: "2024-09-11",
    },
    {
      id: "q7",
      title: "Phản ứng hóa học",
      description: "Các loại phản ứng hóa học cơ bản",
      folderId: "3",
      questionCount: 15,
      plays: 134,
      visibility: "private",
      createdAt: "2024-09-12",
    },
    // Lịch sử
    {
      id: "q8",
      title: "Lịch sử Việt Nam thế kỷ 20",
      description: "Các sự kiện lịch sử quan trọng",
      folderId: "4",
      questionCount: 20,
      plays: 223,
      visibility: "public",
      createdAt: "2024-09-16",
    },
  ];

  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  // Calculate actual quiz count for each folder
  const getQuizCountByFolder = (folderId: string) => {
    return quizzes.filter((q) => q.folderId === folderId).length;
  };

  // Update folders with actual quiz counts
  const foldersWithCounts = folders.map((folder) => ({
    ...folder,
    quizCount: getQuizCountByFolder(folder.id),
  }));

  // Get subfolders of current selected folder
  const currentSubfolders =
    selectedFolder === "all"
      ? folders.filter((f) => f.parentId === null)
      : folders.filter((f) => f.parentId === selectedFolder);

  // Filter quizzes based on selected folder
  const filteredQuizzes =
    selectedFolder === "all"
      ? []
      : quizzes.filter((q) => q.folderId === selectedFolder);

  // Show folders when: at root level OR current folder has subfolders
  const showFolders = selectedFolder === "all" || currentSubfolders.length > 0;

  // Show quizzes when: not at root level (có thể có quiz ở bất kỳ level nào trừ root)
  const showQuizzes = selectedFolder !== "all";

  // Helper functions
  const toggleFolderExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getSubfolders = (parentId: string | null) => {
    return folders.filter((f) => f.parentId === parentId);
  };

  const hasSubfolders = (folderId: string) => {
    return folders.some((f) => f.parentId === folderId);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      console.log("Create folder:", {
        name: newFolderName,
        description: newFolderDescription,
        parentId: parentFolderForNew,
      });
      setShowCreateFolderModal(false);
      setNewFolderName("");
      setNewFolderDescription("");
      setParentFolderForNew(null);
    }
  };

  const openCreateFolderModal = (parentId: string | null = null) => {
    setParentFolderForNew(parentId);
    setShowCreateFolderModal(true);
  };

  const handleEditFolder = (folder: FolderType) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderDescription(folder.description || "");
    setSelectedFolder(folder.id);
  };

  const handleSaveFolder = () => {
    if (editFolderName.trim()) {
      console.log("Update folder:", {
        id: editingFolder?.id,
        name: editFolderName,
        description: editFolderDescription,
      });
      // TODO: API call to update folder
      setEditingFolder(null);
      setEditFolderName("");
      setEditFolderDescription("");
    }
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
    setEditFolderName("");
    setEditFolderDescription("");
    setSelectedFolder("all");
  };

  const handleDeleteFolder = (folder: FolderType) => {
    setFolderToDelete(folder);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const confirmDeleteFolder = () => {
    if (folderToDelete) {
      console.log("Delete folder:", folderToDelete.id);
      // TODO: API call to delete folder
      setShowDeleteModal(false);
      setFolderToDelete(null);
      setSelectedFolder("all");
    }
  };

  const toggleMenu = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === folderId ? null : folderId);
  };

  // Recursive function to render folder tree
  const renderFolderTree = (
    parentId: string | null,
    level: number
  ): JSX.Element[] => {
    const subfolders = getSubfolders(parentId);

    return subfolders.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      const hasSub = hasSubfolders(folder.id);
      const isSelected = selectedFolder === folder.id;

      return (
        <div key={folder.id}>
          {/* Folder Item */}
          <div className="relative group">
            <button
              className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600"
                  : "text-secondary-700 hover:bg-secondary-50"
              }`}
              style={{ paddingLeft: `${12 + level * 16}px` }}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Expand/Collapse Button */}
                  {hasSub && (
                    <button
                      className="p-0.5 hover:bg-secondary-200 rounded transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderExpand(folder.id);
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
                  <span className="truncate">{folder.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isSelected
                        ? "bg-primary-100 text-primary-700"
                        : "bg-secondary-100 text-secondary-600"
                    }`}
                  >
                    {folder.quizCount}
                  </span>
                  {/* Add Subfolder Button */}
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary-200 rounded transition-all flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateFolderModal(folder.id);
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
            <div className="mt-1">{renderFolderTree(folder.id, level + 1)}</div>
          )}
        </div>
      );
    });
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
        {selectedFolder === "all" && (
          <Button onClick={() => setShowCreateFolderModal(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Tạo thư mục
          </Button>
        )}
      </div>

      {/* Layout with sidebar + content */}
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
                  selectedFolder === "all"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-secondary-700 hover:bg-secondary-50"
                }`}
                onClick={() => setSelectedFolder("all")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-0.5 hover:bg-white/20 rounded transition-colors"
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
                    </button>
                    <Folder className="w-4 h-4" />
                    <span>Thư mục của bạn</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedFolder === "all"
                        ? "bg-white/20 text-white"
                        : "bg-secondary-100 text-secondary-600"
                    }`}
                  >
                    {foldersWithCounts.length}
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
                  {renderFolderTree(null, 0)}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex justify-end items-center">
            <div className="flex gap-2">
              {/* Show Create Subfolder button only when not at root */}
              {selectedFolder !== "all" && (
                <Button
                  onClick={() => openCreateFolderModal(selectedFolder)}
                  variant="outline"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Tạo thư mục con
                </Button>
              )}

              {/* Show Create Quiz button only when not at root */}
              {selectedFolder !== "all" && (
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

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={editFolderDescription}
                    onChange={(e) => setEditFolderDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Nhập mô tả về thư mục..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleSaveFolder} className="flex-1">
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Show Folders (root or subfolders) */}
              {showFolders &&
                currentSubfolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="group rounded-2xl overflow-hidden border border-secondary-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white cursor-pointer relative"
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    {/* Folder Cover */}
                    <div className="h-40 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center relative">
                      <Folder className="w-20 h-20 text-blue-500 opacity-80" />

                      {/* 3-dot Menu Button */}
                      <div className="absolute top-3 right-3">
                        <button
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                          onClick={(e) => toggleMenu(folder.id, e)}
                        >
                          <MoreVertical className="w-4 h-4 text-secondary-600" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === folder.id && (
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

                    {/* Folder Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                        {folder.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-secondary-500">
                        <span>{folder.quizCount} quiz</span>
                        <span>
                          {new Date(folder.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
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
                ))}

              {/* Show Quizzes when a specific folder is selected */}
              {showQuizzes &&
                filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="group rounded-2xl overflow-hidden border border-secondary-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white cursor-pointer"
                    onClick={() => navigate(`/quiz/preview/${quiz.id}`)}
                  >
                    {/* Quiz Cover */}
                    <div className="h-40 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center relative">
                      <BookOpen className="w-16 h-16 text-white opacity-80" />
                      <div className="absolute top-3 right-3">
                        <button
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {quiz.visibility === "private" && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-secondary-700">
                          🔒 Riêng tư
                        </div>
                      )}
                    </div>

                    {/* Quiz Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                        {quiz.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-secondary-500">
                        <span>{quiz.questionCount} câu hỏi</span>
                        <span>{quiz.plays} lượt chơi</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 pb-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quiz/preview/${quiz.id}`);
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
                          navigate(`/quiz/edit/${quiz.id}`);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

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
                {folders.find((f) => f.id === parentFolderForNew)?.name}
              </p>
            </div>
          )}
          <Input
            label="Tên thư mục"
            placeholder="Nhập tên thư mục"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <Input
            label="Mô tả (tùy chọn)"
            placeholder="Mô tả ngắn về thư mục"
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateFolderModal(false);
                setParentFolderForNew(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateFolder}>
              {parentFolderForNew ? "Tạo thư mục con" : "Tạo thư mục"}
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
              "{folderToDelete?.name}"
            </span>
            ?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              ⚠️ Hành động này sẽ xóa tất cả quiz và thư mục con bên trong.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setFolderToDelete(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteFolder}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa thư mục
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
