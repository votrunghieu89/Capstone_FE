import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

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

  const topics = [
    { id: "1", name: "Toán học" },
    { id: "2", name: "Vật lý" },
    { id: "3", name: "Hóa học" },
    { id: "4", name: "Lịch sử" },
    { id: "5", name: "Địa lý" },
    { id: "6", name: "Văn học" },
  ];

  const folders = [
    { id: "1", name: "Toán học lớp 10" },
    { id: "2", name: "Vật lý cơ bản" },
    { id: "3", name: "Hóa học" },
    { id: "4", name: "Lịch sử Việt Nam" },
  ];

  // Load quiz data
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);

        // Mock data - Replace with actual API call
        // const response = await apiClient.get(`/quiz/${quizId}`);
        const mockQuiz = {
          id: quizId,
          title: "Hàm số bậc nhất",
          description: "Khái niệm và tính chất hàm số bậc nhất",
          topicId: "1",
          isPrivate: false,
          folderId: "1",
          avatarUrl: "",
          questions: [
            {
              id: "q1",
              content: "Hàm số bậc nhất có dạng tổng quát như thế nào?",
              questionType: "MultipleChoice" as const,
              timeLimit: 30,
              points: 10,
              options: [
                { id: "o1", content: "y = ax + b (a ≠ 0)", isCorrect: true },
                { id: "o2", content: "y = ax² + bx + c", isCorrect: false },
                { id: "o3", content: "y = a/x", isCorrect: false },
                { id: "o4", content: "y = √x", isCorrect: false },
              ],
            },
            {
              id: "q2",
              content: "Đồ thị hàm số bậc nhất là đường gì?",
              questionType: "MultipleChoice" as const,
              timeLimit: 25,
              points: 10,
              options: [
                { id: "o1", content: "Đường thẳng", isCorrect: true },
                { id: "o2", content: "Đường cong", isCorrect: false },
                { id: "o3", content: "Đường tròn", isCorrect: false },
                { id: "o4", content: "Parabol", isCorrect: false },
              ],
            },
          ],
        };

        // Set form values
        reset({
          title: mockQuiz.title,
          description: mockQuiz.description,
          topicId: mockQuiz.topicId,
          isPrivate: mockQuiz.isPrivate,
          folderId: mockQuiz.folderId,
          avatarUrl: mockQuiz.avatarUrl,
          questions: mockQuiz.questions,
        });

        setQuestions(mockQuiz.questions);
      } catch (error) {
        console.error("Error loading quiz:", error);
        alert("Không thể tải dữ liệu quiz. Vui lòng thử lại!");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizId, reset]);

  const handleAddQuestion = (question: Question) => {
    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = question;
      setQuestions(updatedQuestions);
      setValue("questions", updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      const updatedQuestions = [...questions, question];
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

  const onSubmit = async (data: QuizForm) => {
    try {
      setIsSaving(true);
      console.log("Updating quiz:", data);

      // Mock API call - Replace with actual API call
      // await apiClient.put(`/quiz/${quizId}`, data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Cập nhật quiz thành công!");
      navigate("/teacher/folders");
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
                  <select
                    {...register("folderId")}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Không có thư mục</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
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
