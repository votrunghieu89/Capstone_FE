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
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Modal } from "../../../components/common/Modal";
import { TopNavbar } from "../../../components/layout/TopNavbar";
import { Footer } from "../../../components/layout/Footer";
import { Spinner } from "../../../components/common/Spinner";

const quizSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  description: z.string().optional(),
  topicId: z.string().min(1, "Vui lòng chọn chủ đề"),
  isPrivate: z.boolean(),
  folderId: z.string().optional(),
  avatarUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        // Cho phép empty string, URL hợp lệ, hoặc relative path
        if (!val || val === "") return true;
        // Kiểm tra nếu là URL hợp lệ
        if (z.string().url().safeParse(val).success) return true;
        // Cho phép relative path (không có protocol)
        if (!val.includes("://") && val.length > 0) return true;
        return false;
      },
      { message: "URL ảnh không hợp lệ" }
    ),
  questions: z.any(), // Bỏ hết validation cho questions
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

  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(
    null
  ); // Lưu URL gốc từ BE

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      isPrivate: false,
      questions: [],
    },
  });

  const isPrivate = watch("isPrivate");
  // ✅ HÀM CHUYỂN ĐỔI QUESTION TYPE (BE: MCQ = Multiple Choice, TF = True/False)
  const mapQuestionTypeToForm = (
    type: string
  ): "MultipleChoice" | "TrueFalse" => {
    return type === "MCQ" ? "MultipleChoice" : "TrueFalse";
  };

  // ✅ HÀM CHUYỂN ĐỔI QUESTION TYPE TỪ FORM (FE → BE: MCQ, TF)
  const mapQuestionTypeToPayload = (
    type: "MultipleChoice" | "TrueFalse"
  ): "MCQ" | "TF" => {
    return type === "MultipleChoice" ? "MCQ" : "TF";
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
    let isMounted = true; // Flag để tránh update state khi component đã unmount

    const loadData = async () => {
      const user = storage.getUser();
      const teacherId = user?.id;

      if (!quizId || !teacherId) {
        if (isMounted) {
          setIsLoading(false);
          alert("Thiếu Quiz ID hoặc Teacher ID. Vui lòng kiểm tra đăng nhập.");
        }
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

        const rawTopics = topicsResponse.data || topicsResponse;
        if (isMounted) {
          setTopics(
            (Array.isArray(rawTopics) ? rawTopics : []).map((t: any) => ({
              id: (t.topicId || t.TopicId).toString(),
              name: t.topicName || t.TopicName,
            }))
          );
        }

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
        if (isMounted) {
          setFolders(folderTree);
        }

        // 2. XỬ LÝ VÀ HYDRATE DỮ LIỆU QUIZ
        const realQuizData = quizResponse as QuizDetailResponse;
        if (!realQuizData || !realQuizData.questions) {
          // Thay 'quiz' bằng thuộc tính chứa dữ liệu chi tiết, ở đây là kiểm tra 'realQuizData' và mảng 'Questions'
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }
        const mappedQuestions: Question[] = realQuizData.questions.map(
          (q: any) => ({
            id: q.questionId?.toString() || "",
            content: q.questionContent,
            questionType: mapQuestionTypeToForm(q.questionType),
            timeLimit: q.time,
            points: q.score,
            options: q.options.map((o: any) => ({
              id: o.optionId.toString() || o.id?.toString() || "",
              content: o.optionContent,
              isCorrect: o.isCorrect,
            })),
          })
        );

        // ĐIỀN DỮ LIỆU VÀO FORM (HYDRATION)
        // Lưu URL gốc từ BE để hiển thị
        const originalUrl = realQuizData.avatarURL || "";

        // Normalize avatar URL: loại bỏ base URL nếu có để tránh duplicate khi gửi lên BE
        let normalizedAvatarUrl = originalUrl || "";
        if (normalizedAvatarUrl) {
          // Chỉ normalize nếu URL có chứa base URL
          if (
            normalizedAvatarUrl.includes("localhost:7126/") ||
            normalizedAvatarUrl.includes("https://") ||
            normalizedAvatarUrl.includes("http://")
          ) {
            // Loại bỏ protocol và domain nếu có
            normalizedAvatarUrl = normalizedAvatarUrl
              .replace(/^https?:\/\//, "") // Loại bỏ http:// hoặc https://
              .replace(/^localhost:7126\//, "") // Loại bỏ localhost:7126/
              .replace(/^[^/]+\//, ""); // Loại bỏ domain/ nếu còn sót
          }
          // Nếu không có base URL thì giữ nguyên (đã là relative path)
        }

        if (isMounted) {
          reset({
            title: realQuizData.title,
            description: realQuizData.description,
            topicId: realQuizData.topicId?.toString(),
            isPrivate: realQuizData.isPrivate,
            folderId: realQuizData.folderId?.toString() || "",
            avatarUrl: normalizedAvatarUrl, // Lưu normalized URL vào form
            questions: mappedQuestions,
          });

          setQuestions(mappedQuestions); // Đồng bộ hóa state questions

          // Lưu URL gốc từ BE để hiển thị
          if (originalUrl) {
            setOriginalAvatarUrl(originalUrl); // Lưu URL gốc để hiển thị
            setThumbnailPreview(null); // Clear file preview, chỉ dùng URL từ BE
            setThumbnailFile(null);
          } else {
            setOriginalAvatarUrl(null);
          }

          // Set selected folder for UI
          if (realQuizData.folderId) {
            setSelectedFolderId(realQuizData.folderId.toString());
          }
        }
      } catch (error) {
        if (isMounted) {
          alert(
            "Không thể tải dữ liệu quiz. Vui lòng kiểm tra API getQuizDetail."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (quizId) {
      loadData();
    } else {
      if (isMounted) {
        setIsLoading(false);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [quizId]); // Loại bỏ reset khỏi dependencies để tránh re-render vô hạn

  const handleAddQuestion = (question: Question) => {
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = question;
      setQuestions(updatedQuestions);
      setValue("questions", updatedQuestions, { shouldValidate: true });
      trigger("questions"); // Trigger validation
      setEditingQuestionIndex(null);
    } else {
      const updatedQuestions = [
        ...questions,
        { ...question, id: "0" }, // ID = 0 cho câu hỏi mới
      ];
      setQuestions(updatedQuestions);
      setValue("questions", updatedQuestions, { shouldValidate: true });
      trigger("questions"); // Trigger validation
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
      setValue("questions", updatedQuestions, { shouldValidate: true });
      trigger("questions"); // Trigger validation
    }
  };

  // Thumbnail handlers
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    // Chỉ xóa preview của ảnh mới upload, giữ nguyên ảnh cũ từ BE
    if (thumbnailPreview) {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      // Không set avatarUrl = "" để giữ nguyên ảnh cũ
    }
  };

  const onSubmit = async (data: QuizForm) => {

    if (!quizId) {
      alert("Không tìm thấy Quiz ID!");
      return;
    }

    try {
      setIsSaving(true);

      let finalAvatarUrl = data.avatarUrl || "";

      // 1. Luôn gọi API updateImage để lưu thumbnail (có ảnh mới hoặc giữ nguyên ảnh cũ)
      const formData = new FormData();
      formData.append("QuizId", quizId!);

      if (thumbnailFile) {
        // Nếu có ảnh mới, gửi file
        formData.append("AvatarURL", thumbnailFile);
      } else {
        // Nếu không có ảnh mới, gửi URL hiện tại (nếu có) hoặc empty string
        let avatarUrlToSend = finalAvatarUrl || "";
        // Thêm QuizImage/ prefix nếu chỉ là tên file
        if (avatarUrlToSend && !avatarUrlToSend.includes("/")) {
          avatarUrlToSend = `QuizImage/${avatarUrlToSend}`;
        }
        formData.append("AvatarURL", avatarUrlToSend);
      }

      // Luôn gọi API updateImage để lưu thumbnail
      try {
        const imageResponse = (await apiClient.put(
          "/Quiz/updateImage",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )) as any;

        // Lấy response từ BE và gán trực tiếp, không thêm URL
        // Response có thể là imageUrl hoặc toàn bộ response object
        const responseUrl =
          imageResponse?.imageUrl ||
          imageResponse?.data?.imageUrl ||
          imageResponse ||
          "";

        // Chỉ cập nhật finalAvatarUrl nếu có response, nếu không giữ nguyên
        if (responseUrl) {
          finalAvatarUrl = responseUrl;
        }
      } catch (imageError: any) {
        // Nếu API updateImage lỗi, log nhưng vẫn tiếp tục với updateQuiz
        // Giữ nguyên finalAvatarUrl hiện tại
      }

      // 2. Chuẩn bị payload cho API updateQuiz
      const updatePayload = {
        QuizId: Number(quizId),
        FolderId: data.folderId ? Number(data.folderId) : 0,
        TopicId: data.topicId ? Number(data.topicId) : null,
        Title: data.title,
        Description: data.description || "",
        IsPrivate: data.isPrivate,
        AvartarURL: finalAvatarUrl, // Dùng response từ BE, không thêm prefix
        Questions: data.questions.map((q: any) => {
          const questionId =
            q.id &&
            q.id !== "0" &&
            !q.id.startsWith("new-") &&
            !isNaN(Number(q.id))
              ? Number(q.id)
              : null;

          // Tạo object cho question, chỉ thêm QuestionId nếu có (không gửi null)
          const mappedQuestionType = mapQuestionTypeToPayload(q.questionType); // MCQ hoặc TF

          const questionPayload: any = {
            QuestionType: mappedQuestionType,
            QuestionContent: q.content,
            Time: q.timeLimit,
            Score: q.points,
            Options: q.options.map((o: any) => {
              const optionId =
                o.id &&
                o.id !== "0" &&
                !o.id.startsWith("new-") &&
                !isNaN(Number(o.id))
                  ? Number(o.id)
                  : null;

              // Tạo object cho option, chỉ thêm OptionId nếu có (không gửi null)
              const optionPayload: any = {
                OptionContent: o.content,
                IsCorrect: o.isCorrect,
              };

              // Chỉ thêm OptionId nếu có (câu hỏi cũ)
              if (optionId !== null) {
                optionPayload.OptionId = optionId;
              }

              return optionPayload;
            }),
          };

          // Chỉ thêm QuestionId nếu có (câu hỏi cũ)
          if (questionId !== null) {
            questionPayload.QuestionId = questionId;
          }

          return questionPayload;
        }),
      };

      // 3. Gọi API updateQuiz
      await apiClient.put("/Quiz/updateQuiz", updatePayload);
      alert("Cập nhật quiz thành công!");

      // Trở về trang thư mục, truyền folderId để tự động mở folder đó
      navigate("/teacher/folders", {
        state: {
          openFolderId: data.folderId,
          updatedQuizId: quizId,
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Có lỗi xảy ra khi cập nhật quiz!";
      alert(errorMessage);
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

        <form
          onSubmit={handleSubmit(
            async (data) => {

              // Đảm bảo questions được sync từ state
              if (questions.length === 0) {
                alert("Vui lòng thêm ít nhất 1 câu hỏi!");
                return;
              }

              // Gọi onSubmit với await để đảm bảo API được gọi
              try {
                await onSubmit({ ...data, questions });
              } catch (error) {
                // Error đã được handle trong onSubmit
              }
            },
            (errors) => {
              // Callback khi validation fail
              const errorMessages = Object.entries(errors)
                .map(([key, value]) => {
                  if (value?.message) return `${key}: ${value.message}`;
                  return null;
                })
                .filter(Boolean)
                .join("\n");

              if (errorMessages) {
                alert(`Vui lòng sửa các lỗi sau:\n${errorMessages}`);
              } else {
                alert("Vui lòng kiểm tra lại thông tin trong form!");
              }
            }
          )}
          className="space-y-8"
        >
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
                <label
                  htmlFor="thumbnail-upload"
                  className="text-sm font-medium text-secondary-700 mb-2 block"
                >
                  Ảnh bìa quiz
                </label>

                {/* Vùng kéo thả và click chọn file */}
                <div
                  className="relative flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (
                      e.dataTransfer.files &&
                      e.dataTransfer.files.length > 0
                    ) {
                      const file = e.dataTransfer.files[0];
                      handleThumbnailChange({
                        target: { files: [file] },
                      } as any);
                      e.dataTransfer.clearData();
                    }
                  }}
                  onClick={() =>
                    document.getElementById("thumbnail-upload")?.click()
                  }
                >
                  {thumbnailPreview ||
                  originalAvatarUrl ||
                  watch("avatarUrl") ? (
                    <>
                      {/* Hiển thị preview nếu có ảnh */}
                      <img
                        src={
                          thumbnailPreview ||
                          (() => {
                            if (originalAvatarUrl) {
                              if (
                                originalAvatarUrl.startsWith("http://") ||
                                originalAvatarUrl.startsWith("https://")
                              ) {
                                return originalAvatarUrl;
                              }
                              return `https://localhost:7126/${originalAvatarUrl.replace(
                                /^\/+/,
                                ""
                              )}`;
                            }
                            const avatarUrl = watch("avatarUrl");
                            if (!avatarUrl) return "";
                            if (
                              avatarUrl.startsWith("http://") ||
                              avatarUrl.startsWith("https://")
                            ) {
                              return avatarUrl;
                            }
                            return `https://localhost:7126/${avatarUrl.replace(
                              /^\/+/,
                              ""
                            )}`;
                          })()
                        }
                        alt="Thumbnail Preview"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      {/* Chỉ hiển thị nút X khi có ảnh mới upload */}
                      {thumbnailPreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveThumbnail();
                          }}
                          className="absolute top-2 right-2 bg-error-600 text-white rounded-full p-2 hover:bg-error-700 transition-colors z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    /* Nội dung mặc định khi chưa có ảnh */
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Chọn ảnh bìa quiz</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Kéo thả hoặc click để chọn file (PNG, JPG, GIF)
                      </p>
                    </div>
                  )}

                  {/* Input type="file" ẩn đi */}
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </div>
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
                    {typeof errors.questions === "object" &&
                    "message" in errors.questions
                      ? String(errors.questions.message)
                      : "Vui lòng kiểm tra lại các câu hỏi"}
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
                        {question.options.map((option, optIdx) => (
                          <div
                            key={`${option.id}-${optIdx}`}
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
      { id: "new-1", content: "", isCorrect: false },
      { id: "new-2", content: "", isCorrect: false },
    ]
  );

  const handleAddOption = () => {
    setOptions([
      ...options,
      { id: `new-${Date.now()}`, content: "", isCorrect: false },
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
      id: question?.id || "0",
      content,
      questionType,
      timeLimit,
      points,
      options: options, // Giữ nguyên ID để không bị trùng key khi render
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
