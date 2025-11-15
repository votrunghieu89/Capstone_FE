import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "../../../libs/apiClient";
import { storage } from "../../../libs/storage";

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
import { Spinner } from "../../../components/common/Spinner";

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
  avatarUrl: z.string().url("URL ảnh không hợp lệ").optional(),
  questions: z.array(questionSchema).min(1, "Phải có ít nhất 1 câu hỏi"),
});

type QuizForm = z.infer<typeof quizSchema>;

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

// ✅ INTERFACE CHO DỮ LIỆU TẢI VỀ (Sử dụng camelCase thực tế từ API)
interface QuizDetailResponse {
  quizId: number;
  title: string;
  description: string;
  topicId: number;
  isPrivate: boolean;
  folderId?: number | null;
  avatarURL?: string;
  questions: any[]; // Mảng câu hỏi thực tế
}

export default function EditQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      isPrivate: false,
      questions: [],
    },
  });

  const isPrivate = watch("isPrivate");
  // ✅ HÀM CHUYỂN ĐỔI QUESTION TYPE (Tương tự CreateQuiz)
  const mapQuestionTypeToForm = (
    type: string
  ): "MultipleChoice" | "TrueFalse" => {
    return type === "MTC" ? "MultipleChoice" : "TrueFalse";
  };

  // ✅ HÀM CHUYỂN ĐỔI QUESTION TYPE TỪ FORM (Tương tự CreateQuiz)
  const mapQuestionTypeToPayload = (
    type: "MultipleChoice" | "TrueFalse"
  ): "MTC" | "TF" => {
    return type === "MultipleChoice" ? "MTC" : "TF";
  };

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

  // Load quiz data
  useEffect(() => {
    const loadData = async () => {
      const user = storage.getUser();
      const teacherId = user?.id;

      if (!quizId || !teacherId) {
        setIsLoading(false);
        alert("Thiếu Quiz ID hoặc Teacher ID. Vui lòng kiểm tra đăng nhập.");
        return;
      }
      try {
        // 1. TẢI DỮ LIỆU SETUP (TOPICS VÀ FOLDERS)
        const [topicsResponse, foldersResponse, quizResponse] =
          await Promise.all([
            apiClient.get("/Topic/getAllTopic") as any,

            apiClient.get(
              `/TeacherFolder/getAllFolder?teacherID=${teacherId}`
            ) as any,

            apiClient.get(`Quiz/getDetailOfATeacherQuiz/${quizId}`) as any,
          ]);

        console.log("📡 quizResponse", quizResponse);
        console.log("📚 topicsResponse =", topicsResponse);
        console.log("🗂️ foldersResponse =", foldersResponse);
        setTopics(
          topicsResponse.data.map((t: any) => ({
            id: t.TopicId.toString(),
            name: t.TopicName,
          }))
        );

        // Keep nested folder structure for tree view
        const convertToFolderTree = (folderList: any[]): FolderTree[] => {
          return folderList.map((f: any) => ({
            id: (f.folderId || f.FolderId).toString(),
            name: f.folderName || f.FolderName,
            folders:
              f.folders && Array.isArray(f.folders) && f.folders.length > 0
                ? convertToFolderTree(f.folders)
                : undefined,
          }));
        };

        const rawFolders = foldersResponse.data || foldersResponse;
        const folderTree = convertToFolderTree(
          Array.isArray(rawFolders) ? rawFolders : []
        );
        setFolders(folderTree);

        // 2. XỬ LÝ VÀ HYDRATE DỮ LIỆU QUIZ
        const realQuizData = quizResponse as QuizDetailResponse;
        if (!realQuizData || !realQuizData.questions) {
          // Thay 'quiz' bằng thuộc tính chứa dữ liệu chi tiết, ở đây là kiểm tra 'realQuizData' và mảng 'Questions'
          console.error("Quiz không tồn tại hoặc dữ liệu lỗi:", realQuizData);
          setIsLoading(false);
          return;
        }
        const mappedQuestions: Question[] = realQuizData.questions.map(
          (q: any) => ({
            id: q.quizId?.toString() || "",
            content: q.questionContent,
            questionType: mapQuestionTypeToForm(q.questionType),
            timeLimit: q.timeLimit,
            points: q.score,
            options: q.options.map((o: any) => ({
              id: o.optionId.toString() || o.id?.toString() || "",
              content: o.optionContent,
              isCorrect: o.IsCorrect,
            })),
          })
        );

        // ĐIỀN DỮ LIỆU VÀO FORM (HYDRATION)
        reset({
          title: realQuizData.title,
          description: realQuizData.description,
          topicId: realQuizData.topicId?.toString(),
          isPrivate: realQuizData.isPrivate,
          folderId: realQuizData.folderId?.toString() || "",
          avatarUrl: realQuizData.avatarURL,
          questions: mappedQuestions,
        });

        setQuestions(mappedQuestions); // Đồng bộ hóa state questions

        // Set selected folder for UI
        if (realQuizData.folderId) {
          setSelectedFolderId(realQuizData.folderId.toString());
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        alert(
          "Không thể tải dữ liệu quiz. Vui lòng kiểm tra API getQuizDetail."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [quizId, reset]);

  const handleAddQuestion = (question: Question) => {
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = question;
      setQuestions(updatedQuestions);
      setValue("questions", updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      const updatedQuestions = [
        ...questions,
        { ...question, id: Date.now().toString() },
      ];
      setQuestions(updatedQuestions);
      setValue("questions", updatedQuestions);
    }
    setShowAddQuestion(false);
    setCurrentQuestion(null);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
    setShowAddQuestion(true);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
      setValue("questions", updatedQuestions);
    }
  };
  // ✅ HÀM RENDER FOLDER (Tương tự CreateQuiz)
  const onSubmit = async (data: QuizForm) => {
    try {
      setIsSaving(true);
      const user = storage.getUser();
      const teacherId = user?.id;

      if (quizId || !teacherId)
        throw new Error("Thông tin giáo viên không hợp lệ.");

      // 1. Chuẩn bị Payload UPDATE
      const finalPayload = {
        QuizId: parseInt(quizId!, 10), // Bắt buộc phải có QuizId để update
        //TeacherId: parseInt(teacherId, 10),
        FolderId: data.folderId ? parseInt(data.folderId, 10) : 0,
        TopicId: parseInt(data.topicId, 10),
        Title: data.title,
        Description: data.description || "",
        IsPrivate: data.isPrivate,
        AvartarURL: data.avatarUrl || "",
        UpdateAt: new Date().toISOString(),

        // Chuyển đổi questions/options sang PascalCase/Mã rút gọn
        Questions: questions.map((q) => ({
          QuestionId: parseInt(q.id, 10), // Giữ lại ID nếu là câu hỏi cũ
          QuestionType: mapQuestionTypeToPayload(q.questionType),
          QuestionContent: q.content,
          Time: q.timeLimit,
          Score: q.points,
          IsDeleted: false, // Giả định false, trừ khi có logic xóa phức tạp
          UpdateAt: new Date().toISOString(),
          Options: q.options.map((opt) => ({
            OptionId: parseInt(opt.id, 10), // Giữ lại ID nếu là đáp án cũ
            OptionContent: opt.content,
            IsCorrect: opt.isCorrect,
            IsDeleted: false, // Giả định false
            UpdateAt: new Date().toISOString(),
          })),
        })),
      };

      const response = await apiClient.put(
        `/api/Quiz/updateQuiz`,
        finalPayload
      );

      alert("Cập nhật quiz thành công!");
      navigate("/teacher/folders"); // Chuyển hướng về trang quản lý folders
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Có lỗi xảy ra khi cập nhật quiz. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-secondary-600">Đang tải dữ liệu quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNavbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/teacher/folders")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại thư mục
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Chỉnh sửa quiz
              </h1>
              <p className="text-secondary-600">
                Cập nhật thông tin và câu hỏi cho quiz của bạn
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Quiz Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold text-secondary-900">
                Thông tin quiz
              </h2>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("title")}
                  placeholder="Nhập tiêu đề quiz..."
                  error={errors.title?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  {...register("description")}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập mô tả về quiz..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Chủ đề <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("topicId")}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Chọn chủ đề</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  {errors.topicId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.topicId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Thư mục
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
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  URL ảnh bìa
                </label>
                <Input
                  {...register("avatarUrl")}
                  placeholder="https://example.com/image.jpg"
                  error={errors.avatarUrl?.message}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue("isPrivate", !isPrivate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPrivate ? "bg-primary-600" : "bg-secondary-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPrivate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <div className="flex items-center gap-2">
                  {isPrivate ? (
                    <EyeOff className="w-4 h-4 text-secondary-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-secondary-600" />
                  )}
                  <span className="text-sm font-medium text-secondary-700">
                    {isPrivate ? "Riêng tư" : "Công khai"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-secondary-900">
                  Câu hỏi ({questions.length})
                </h2>
                {errors.questions && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.questions.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={() => {
                  setCurrentQuestion(null);
                  setEditingQuestionIndex(null);
                  setShowAddQuestion(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm câu hỏi
              </Button>
            </div>

            <div className="card-content">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary-100 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-secondary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Chưa có câu hỏi nào
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Hãy thêm câu hỏi đầu tiên cho quiz của bạn
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentQuestion(null);
                      setEditingQuestionIndex(null);
                      setShowAddQuestion(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm câu hỏi
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border border-secondary-200 rounded-lg p-4 hover:border-primary-400 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                              Câu {index + 1}
                            </span>
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs">
                              {question.questionType === "MultipleChoice"
                                ? "Trắc nghiệm"
                                : "Đúng/Sai"}
                            </span>
                          </div>
                          <p className="font-medium text-secondary-900 mb-2">
                            {question.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-secondary-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {question.timeLimit}s
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {question.points} điểm
                            </span>
                            <span>{question.options.length} đáp án</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(index)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`p-2 rounded border ${
                              option.isCorrect
                                ? "bg-green-50 border-green-300"
                                : "bg-secondary-50 border-secondary-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {option.isCorrect && (
                                <span className="text-green-600 text-xs">
                                  ✓
                                </span>
                              )}
                              <span className="text-sm">{option.content}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/teacher/folders")}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      <Footer />

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

      {/* Add/Edit Question Modal */}
      {showAddQuestion && (
        <QuestionModal
          question={currentQuestion}
          onSave={handleAddQuestion}
          onClose={() => {
            setShowAddQuestion(false);
            setCurrentQuestion(null);
            setEditingQuestionIndex(null);
          }}
        />
      )}
    </div>
  );
}

// Question Modal Component
interface QuestionModalProps {
  question: Question | null;
  onSave: (question: Question) => void;
  onClose: () => void;
}

function QuestionModal({ question, onSave, onClose }: QuestionModalProps) {
  const [content, setContent] = useState(question?.content || "");
  const [questionType, setQuestionType] = useState<
    "MultipleChoice" | "TrueFalse"
  >(question?.questionType || "MultipleChoice");
  const [timeLimit, setTimeLimit] = useState(question?.timeLimit || 30);
  const [points, setPoints] = useState(question?.points || 10);
  const [options, setOptions] = useState<Option[]>(
    question?.options || [
      { id: "1", content: "", isCorrect: false },
      { id: "2", content: "", isCorrect: false },
    ]
  );

  const handleAddOption = () => {
    setOptions([
      ...options,
      { id: Date.now().toString(), content: "", isCorrect: false },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
    }
  };

  const handleOptionChange = (id: string, content: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, content } : opt))
    );
  };

  const handleCorrectChange = (id: string) => {
    setOptions(
      options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      }))
    );
  };

  const handleSave = () => {
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi!");
      return;
    }

    if (options.some((opt) => !opt.content.trim())) {
      alert("Vui lòng nhập nội dung cho tất cả đáp án!");
      return;
    }

    if (!options.some((opt) => opt.isCorrect)) {
      alert("Vui lòng chọn ít nhất một đáp án đúng!");
      return;
    }

    const newQuestion: Question = {
      id: question?.id || Date.now().toString(),
      content,
      questionType,
      timeLimit,
      points,
      options,
    };

    onSave(newQuestion);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={question ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Nội dung câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Nhập nội dung câu hỏi..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Loại câu hỏi
            </label>
            <select
              value={questionType}
              onChange={(e) =>
                setQuestionType(
                  e.target.value as "MultipleChoice" | "TrueFalse"
                )
              }
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="MultipleChoice">Trắc nghiệm</option>
              <option value="TrueFalse">Đúng/Sai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Thời gian (giây)
            </label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min={10}
              max={300}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Điểm số
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-secondary-700">
              Đáp án <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAddOption}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Thêm đáp án
            </button>
          </div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectChange(option.id)}
                  className="w-4 h-4 text-primary-600"
                />
                <input
                  type="text"
                  value={option.content}
                  onChange={(e) =>
                    handleOptionChange(option.id, e.target.value)
                  }
                  placeholder={`Đáp án ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-secondary-200">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            {question ? "Cập nhật" : "Thêm câu hỏi"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
