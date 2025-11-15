//createQuiz.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  Eye,
  EyeOff,
  Image,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Modal } from "../../../components/common/Modal";
import { TopNavbar } from "../../../components/layout/TopNavbar";
import { Footer } from "../../../components/layout/Footer";
import { CreateQuizRequest } from "../../../types/quiz";
import { apiClient } from "../../../libs/apiClient";
import { mockAdapter } from "../../../mocks/adapter";
import { storage } from "../../../libs/storage";

const questionSchema = z.object({
  content: z.string().min(5, "Nội dung câu hỏi phải có ít nhất 5 ký tự"),
  questionType: z.enum(["MultipleChoice", "TrueFalse"]),
  timeLimit: z
    .number()
    .min(10, "Thời gian tối thiểu 10 giây")
    .max(300, "Thời gian tối đa 300 giây"),
  points: z.number().min(1, "Điểm tối thiểu 1").max(100, "Điểm tối đa 100"),
  options: z
    .array(
      z.object({
        content: z.string().min(1, "Nội dung đáp án không được để trống"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "Phải có ít nhất 2 đáp án"),
});

const quizSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  description: z.string().optional(),
  topicId: z.string().min(1, "Vui lòng chọn chủ đề"),
  isPrivate: z.boolean(),
  folderId: z.string().optional(),
  avatarUrl: z.string().optional(),
  questions: z.array(questionSchema).min(1, "Phải có ít nhất 1 câu hỏi"),
});

type QuizForm = z.infer<typeof quizSchema>;
type QuestionForm = z.infer<typeof questionSchema>;

interface Option {
  id: string;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  content: string;
  questionType: "MultipleChoice" | "TrueFalse";
  timeLimit: number;
  points: number;
  options: Option[];
}
interface TopicResponse {
  id: number;
  topicName: string;
}

interface FolderResponse {
  id: number;
  folderName: string;
  parentFolderId?: number | null;
}

export default function CreateQuiz() {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);

  // Folder structure for tree view
  interface FolderTree {
    id: string;
    name: string;
    folders?: FolderTree[];
  }
  const [folders, setFolders] = useState<FolderTree[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [showFolderModal, setShowFolderModal] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFileAndPreview(file);
  };

  // ✅ HÀM MỚI ĐỂ ĐẶT FILE VÀ TẠO PREVIEW
  const setSelectedFileAndPreview = (file: File | null) => {
    setThumbnailFile(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };

  // ✅ HÀM XỬ LÝ KHI KÉO THẢ FILE
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      setSelectedFileAndPreview(file);
      event.dataTransfer.clearData();
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      isPrivate: false,
      questions: [],
    },
  });
  useEffect(() => {
    // Khi mảng questions thay đổi, cập nhật giá trị cho RHF.
    // Điều này giúp Zod thấy mảng questions đã có phần tử và vượt qua min(1).
    setValue("questions", questions as any, { shouldValidate: true });
  }, [questions, setValue]);
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = location.state?.from || "/teacher/folders";

  // Fetch topics and folders from API
  useEffect(() => {
    const fetchData = async () => {
      const user = storage.getUser();
      console.log("STORAGE USER OBJECT:", user);
      const currentTeacherId = user?.id;

      // 2. Kiểm tra ID
      if (!currentTeacherId) {
        console.error("Teacher ID not found. Cannot fetch setup data.");
        return;
      }
      try {
        const [topicsResponse, foldersResponse] = await Promise.all([
          apiClient.get("/Topic/getAllTopic") as any,
          apiClient.get(
            `/TeacherFolder/getAllFolder?teacherID=${currentTeacherId}`
          ) as any,
        ]);

        const rawTopicsData =
          (topicsResponse as any).data || (topicsResponse as any);
        const rawFoldersData =
          (foldersResponse as any).data || (foldersResponse as any);

        // ✅ Log dữ liệu thô
        console.log("⭐ RAW TOPICS DATA:", rawTopicsData);
        console.log("⭐ RAW FOLDERS DATA:", rawFoldersData);

        // 1. Xử lý Topics
        setTopics(
          // Ép kiểu array an toàn trước khi map
          (Array.isArray(rawTopicsData) ? rawTopicsData : []).map((t: any) => ({
            id: t.topicId ? t.topicId.toString() : t.id.toString(),
            name: t.topicName || t.name,
          }))
        );

        // 2. Xử lý Folders - Keep nested structure for tree view
        const convertToFolderTree = (folderList: any[]): FolderTree[] => {
          return folderList.map((f: any) => ({
            id: (f.folderId || f.id).toString(),
            name: f.folderName || f.name,
            folders:
              f.folders && Array.isArray(f.folders) && f.folders.length > 0
                ? convertToFolderTree(f.folders)
                : undefined,
          }));
        };

        const folderTree = convertToFolderTree(
          Array.isArray(rawFoldersData) ? rawFoldersData : []
        );
        setFolders(folderTree);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
        setTopics([]);
        setFolders([]);
      }
    };

    fetchData();
  }, []);

  const isPrivate = watch("isPrivate");

  // Folder tree component for UI
  const FolderTreeItem = ({
    folder,
    level = 0,
  }: {
    folder: FolderTree;
    level?: number;
  }) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.folders && folder.folders.length > 0;
    const isSelected = selectedFolderId === folder.id;

    const toggleFolder = () => {
      const newExpanded = new Set(expandedFolders);
      if (isExpanded) {
        newExpanded.delete(folder.id);
      } else {
        newExpanded.add(folder.id);
      }
      setExpandedFolders(newExpanded);
    };

    return (
      <div>
        <div className="flex items-stretch">
          {hasChildren && (
            <button
              type="button"
              onClick={toggleFolder}
              className="flex items-center justify-center w-8 hover:bg-secondary-100 rounded transition-colors"
              style={{ marginLeft: `${level * 20}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedFolderId(folder.id);
              setValue("folderId", folder.id);
            }}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
              isSelected
                ? "bg-primary-600 text-white"
                : "hover:bg-secondary-100 text-secondary-900"
            }`}
            style={{ marginLeft: hasChildren ? "0" : `${level * 20 + 32}px` }}
          >
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="flex-1 truncate text-sm font-medium">
              {folder.name}
            </span>
          </button>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-1 space-y-1">
            {folder.folders!.map((subFolder) => (
              <FolderTreeItem
                key={subFolder.id}
                folder={subFolder}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const mapQuestionType = (
    type: "MultipleChoice" | "TrueFalse"
  ): "MCQ" | "TF" => {
    return type === "MultipleChoice" ? "MCQ" : "TF";
  };
  const onSubmit = async (data: QuizForm) => {
    setIsLoading(true);
    console.log("LOG 1: onSubmit started. Form data:", data);
    try {
      // 1. Lấy Teacher ID thật cho Submission
      const user = storage.getUser();
      const teacherId = user?.id;

      if (!teacherId) {
        console.log("LOG 2: Error - Teacher ID is missing.");
        throw new Error(
          "Thông tin giáo viên không hợp lệ. Vui lòng đăng nhập lại."
        );
      }

      // 2. Upload ảnh (nếu có)
      let avatarURL: string | undefined = data.avatarUrl; // giữ lại nếu người dùng nhập link
      const formData = new FormData();
      if (thumbnailFile) {
        formData.append("AvatarURL", thumbnailFile);
      } else {
        formData.append("AvatarURL", null as any); // TypeScript ok, runtime backend nhận null
      }
      const uploadResponse = (await apiClient.post(
        "/Quiz/uploadImage",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )) as any;
      avatarURL = uploadResponse.imageUrl;
      console.log("LOG 3: File uploaded. URL:", avatarURL);

      // 3. Build payload (tất cả field phải PascalCase theo DTO của BE)
      const payload = {
        TeacherId: parseInt(teacherId, 10),
        TopicId: parseInt(data.topicId, 10),
        FolderId: data.folderId ? parseInt(data.folderId, 10) : 0,
        Title: data.title,
        Description: data.description || "",
        IsPrivate: data.isPrivate,
        AvatarURL: avatarURL || "",
        NumberOfPlays: 0,
        CreatedAt: new Date().toISOString(),
        Questions: questions.map((q) => ({
          QuestionType: mapQuestionType(q.questionType),
          QuestionContent: q.content,
          Time: q.timeLimit,
          Score: q.points,
          Options: q.options.map((opt) => ({
            OptionContent: opt.content,
            IsCorrect: opt.isCorrect,
          })),
        })),
      };
      // 4. Gọi API tạo quiz
      console.log("LOG 4: Attempting to create quiz...");
      console.log("📤 Payload tạo quiz:", payload);
      const response = (await apiClient.post(
        "/Quiz/createQuiz",
        payload
      )) as any;

      if (response.status === 200 || response.status === 201 || response) {
        alert("✅ Tạo quiz thành công!");
        navigate("/teacher/folders");
      } else {
        console.error("Create quiz bad response:", response);
        throw new Error("Tạo quiz thất bại");
      }
    } catch (error) {
      console.error("❌ Lỗi khi tạo quiz:", error);
      alert("Đã xảy ra lỗi khi tạo quiz. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      content: "",
      questionType: "MultipleChoice",
      timeLimit: 30,
      points: 10,
      options: [
        { id: "1", content: "", isCorrect: false },
        { id: "2", content: "", isCorrect: false },
      ],
    };
    setCurrentQuestion(newQuestion);
    setShowAddQuestion(true);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setShowAddQuestion(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleSaveQuestion = (questionData: QuestionForm) => {
    if (currentQuestion) {
      const updatedQuestion = {
        ...currentQuestion,
        ...questionData,
        options: questionData.options.map((opt, index) => ({
          id: currentQuestion.options[index]?.id || (index + 1).toString(),
          content: opt.content,
          isCorrect: opt.isCorrect,
        })),
      };

      if (questions.find((q) => q.id === currentQuestion.id)) {
        // Edit existing question
        setQuestions((prev) =>
          prev.map((q) => (q.id === currentQuestion.id ? updatedQuestion : q))
        );
      } else {
        // Add new question
        setQuestions((prev) => [...prev, updatedQuestion]);
      }
    }
    setShowAddQuestion(false);
    setCurrentQuestion(null);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "MultipleChoice":
        return "Trắc nghiệm";
      case "TrueFalse":
        return "Đúng/Sai";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(previousPath)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Tạo Quiz mới
              </h1>
              <p className="text-secondary-600">
                Thiết kế và tạo quiz tương tác
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Quiz Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Thông tin Quiz
                </h3>
              </div>
              <div className="card-content space-y-4">
                <Input
                  label="Tiêu đề Quiz"
                  placeholder="Nhập tiêu đề quiz"
                  icon={<BookOpen size={16} />}
                  error={errors.title?.message}
                  {...register("title")}
                />

                <div>
                  <label className="text-sm font-medium text-secondary-700 mb-2 block">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    placeholder="Nhập mô tả quiz"
                    {...register("description")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-700 mb-2 block">
                      Chủ đề
                    </label>
                    <select className="input" {...register("topicId")}>
                      <option value="">Chọn chủ đề</option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                    {errors.topicId && (
                      <p className="text-sm text-error-600 mt-1">
                        {errors.topicId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary-700 mb-2 block">
                      Lưu vào thư mục
                    </label>
                    {selectedFolderId ? (
                      <div className="flex items-center justify-between bg-success-50 border border-success-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-success-700" />
                          <span className="text-sm text-success-900 font-medium">
                            {(() => {
                              const findFolder = (
                                folders: FolderTree[],
                                id: string
                              ): string | null => {
                                for (const f of folders) {
                                  if (f.id === id) return f.name;
                                  if (f.folders) {
                                    const found = findFolder(f.folders, id);
                                    if (found) return found;
                                  }
                                }
                                return null;
                              };
                              return findFolder(folders, selectedFolderId);
                            })()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowFolderModal(true)}
                            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                          >
                            Đổi
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFolderId("");
                              setValue("folderId", "");
                            }}
                            className="text-success-600 hover:text-success-700 hover:bg-success-100 rounded p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFolderModal(true)}
                        className="w-full justify-start"
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        Chọn thư mục
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="thumbnail-upload"
                    className="text-sm font-medium text-secondary-700 mb-2 block"
                  >
                    Ảnh Thumbnail (Tải lên)
                  </label>

                  {/* ✅ Vùng kéo thả và click chọn file */}
                  <div
                    className="relative flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    onDragOver={(e) => e.preventDefault()} // Ngăn chặn hành vi mặc định của trình duyệt
                    onDrop={handleDrop} // Xử lý khi file được thả vào
                    onClick={() =>
                      document.getElementById("hidden-thumbnail-input")?.click()
                    } // Click để mở hộp thoại chọn file
                  >
                    {thumbnailPreview ? (
                      // Hiển thị preview nếu có ảnh
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      // Nội dung mặc định khi chưa có ảnh
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Image className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Chọn ảnh thumbnail
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Kéo thả hoặc click để chọn file (PNG, JPG, GIF)
                        </p>
                      </div>
                    )}

                    {/* ✅ Input type="file" ẩn đi */}
                    <input
                      id="hidden-thumbnail-input" // ID để liên kết với onClick của div
                      type="file"
                      accept="image/*"
                      className="hidden" // Ẩn input đi
                      onChange={handleFileChange} // Gọi hàm xử lý khi file được chọn
                    />
                  </div>

                  {/* Vùng hiển thị lỗi validation nếu cần */}
                  {errors.avatarUrl && ( // Sử dụng error từ avatarUrl, mặc dù nó là hidden input
                    <p className="text-sm text-red-500 mt-1">
                      {errors.avatarUrl.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      {...register("isPrivate")}
                    />
                    <span className="ml-2 text-sm text-secondary-600">
                      Quiz riêng tư (chỉ học sinh trong lớp mới thấy)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Câu hỏi ({questions.length})
                  </h3>
                  <Button type="button" onClick={handleAddQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm câu hỏi
                  </Button>
                </div>
              </div>
              <div className="card-content">
                {questions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-600 mb-4">
                      Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-4 border border-secondary-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-secondary-900">
                                Câu {index + 1}:
                              </span>
                              <span className="text-sm text-secondary-600">
                                {getQuestionTypeLabel(question.questionType)}
                              </span>
                              <span className="text-sm text-primary-600">
                                {question.points} điểm
                              </span>
                              <span className="text-sm text-secondary-500">
                                {question.timeLimit}s
                              </span>
                            </div>
                            <p className="text-secondary-900 mb-2">
                              {question.content}
                            </p>
                            <div className="text-sm text-secondary-600">
                              {question.options.length} đáp án
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-error-600"
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

            {/* Footer summary + Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-600">
                <div>Tổng câu hỏi: {questions.length}</div>
                <div>
                  Thời gian ước tính:{" "}
                  {questions.reduce((t, q) => t + (q.timeLimit || 0), 0)} giây
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || questions.length === 0}
                >
                  {isLoading ? (
                    "Đang tạo..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
        title="Thêm/Sửa câu hỏi"
        size="xl"
      >
        {currentQuestion && (
          <QuestionForm
            question={currentQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => setShowAddQuestion(false)}
          />
        )}
      </Modal>

      {/* Folder Selection Modal */}
      <Modal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="Chọn thư mục"
      >
        <div className="space-y-4">
          {folders.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-8">
              Không có thư mục nào
            </p>
          ) : (
            <>
              <div className="border rounded-lg p-2 max-h-96 overflow-y-auto bg-secondary-50">
                <div className="space-y-1">
                  {folders.map((folder) => (
                    <FolderTreeItem key={folder.id} folder={folder} />
                  ))}
                </div>
              </div>
              {selectedFolderId && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                  <p className="text-sm text-success-900">
                    ✓ Đã chọn:{" "}
                    <span className="font-semibold">
                      {(() => {
                        const findFolder = (
                          folders: FolderTree[],
                          id: string
                        ): string | null => {
                          for (const f of folders) {
                            if (f.id === id) return f.name;
                            if (f.folders) {
                              const found = findFolder(f.folders, id);
                              if (found) return found;
                            }
                          }
                          return null;
                        };
                        return findFolder(folders, selectedFolderId);
                      })()}
                    </span>
                  </p>
                </div>
              )}
            </>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFolderModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => setShowFolderModal(false)}
              disabled={!selectedFolderId}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

// Question Form Component
interface QuestionFormProps {
  question: Question;
  onSave: (data: QuestionForm) => void;
  onCancel: () => void;
}

function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const [options, setOptions] = useState<Option[]>(question.options);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: question.content,
      questionType: question.questionType,
      timeLimit: question.timeLimit,
      points: question.points,
      options: question.options,
    },
  });

  const questionType = watch("questionType");
  useEffect(() => {
    setValue("options", options as any, { shouldValidate: true });
  }, [options, setValue]); // Chạy lại mỗi khi options thay đổi

  const handleAddOption = () => {
    const newOption: Option = {
      id: Date.now().toString(),
      content: "",
      isCorrect: false,
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== optionId));
  };

  const handleOptionChange = (
    optionId: string,
    field: keyof Option,
    value: any
  ) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    );
  };

  const onSubmit = (data: QuestionForm) => {
    // 1. Lấy mảng options đã được cập nhật từ state cục bộ
    const finalOptions = options.map((opt) => ({
      content: opt.content,
      isCorrect: opt.isCorrect,
    }));

    // 2. KIỂM TRA LOGIC: Đảm bảo có ít nhất một đáp án đúng
    const correctCount = finalOptions.filter((opt) => opt.isCorrect).length;

    if (correctCount === 0) {
      // Nếu không có đáp án nào được chọn là đúng, hiển thị lỗi và dừng submit
      alert("Vui lòng chọn ít nhất một đáp án đúng!");
      return;
    }

    // 3. Gửi dữ liệu an toàn nếu validation tùy chỉnh thành công
    onSave({
      ...data,
      options: finalOptions, // Gửi mảng options đã được map
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Nội dung câu hỏi"
        placeholder="Nhập câu hỏi"
        error={errors.content?.message}
        {...register("content")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-secondary-700 mb-2 block">
            Loại câu hỏi
          </label>
          <select className="input" {...register("questionType")}>
            <option value="MultipleChoice">Trắc nghiệm</option>
            <option value="TrueFalse">Đúng/Sai</option>
          </select>
        </div>

        <Input
          label="Thời gian (giây)"
          type="number"
          placeholder="30"
          error={errors.timeLimit?.message}
          {...register("timeLimit", { valueAsNumber: true })}
        />

        <Input
          label="Điểm số"
          type="number"
          placeholder="10"
          error={errors.points?.message}
          {...register("points", { valueAsNumber: true })}
        />
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-secondary-700">
            Đáp án
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm đáp án
          </Button>
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center space-x-3">
              <input
                type="radio"
                name="correctAnswer"
                checked={option.isCorrect}
                onChange={() => {
                  setOptions((prev) =>
                    prev.map((opt) => ({
                      ...opt,
                      isCorrect: opt.id === option.id,
                    }))
                  );
                }}
                className="text-primary-600"
              />
              <Input
                placeholder={`Đáp án ${index + 1}`}
                value={option.content}
                onChange={(e) =>
                  handleOptionChange(option.id, "content", e.target.value)
                }
                className="flex-1"
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(option.id)}
                  className="text-error-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">Lưu câu hỏi</Button>
      </div>
    </form>
  );
}
