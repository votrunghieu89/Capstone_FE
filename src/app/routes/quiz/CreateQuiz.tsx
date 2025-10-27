import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { CreateQuizRequest } from "../../../types/quiz";
import { apiClient } from "../../../libs/apiClient";
import { mockAdapter } from "../../../mocks/adapter";

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

export default function CreateQuiz() {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [folders, setFolders] = useState<
    { id: string; name: string; parentId: string | null }[]
  >([]);

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

  const navigate = useNavigate();

  // Fetch topics and folders from API
  useEffect(() => {
    const fetchData = async () => {
      const useMock = (import.meta as any).env?.VITE_USE_MOCK === "true";

      try {
        if (useMock) {
          // Mock data - will be replaced by real API calls
          setTopics([
            { id: "1", name: "Toán học" },
            { id: "2", name: "Vật lý" },
            { id: "3", name: "Hóa học" },
            { id: "4", name: "Lịch sử" },
            { id: "5", name: "Địa lý" },
            { id: "6", name: "Văn học" },
          ]);

          setFolders([
            { id: "1", name: "Toán học lớp 10", parentId: null },
            { id: "1-1", name: "Đại số", parentId: "1" },
            { id: "1-2", name: "Hình học", parentId: "1" },
            { id: "2", name: "Vật lý cơ bản", parentId: null },
            { id: "2-1", name: "Cơ học", parentId: "2" },
            { id: "2-2", name: "Điện học", parentId: "2" },
            { id: "3", name: "Hóa học", parentId: null },
            { id: "3-1", name: "Hóa vô cơ", parentId: "3" },
            { id: "3-2", name: "Hóa hữu cơ", parentId: "3" },
          ]);
        } else {
          // TODO: Replace with real API calls when .NET backend is ready
          // const topicsResponse = await apiClient.get('/api/topics');
          // setTopics(topicsResponse.data);

          // const foldersResponse = await apiClient.get('/api/folders');
          // setFolders(foldersResponse.data);

          // Temporary: Use same mock data until API is ready
          setTopics([
            { id: "1", name: "Toán học" },
            { id: "2", name: "Vật lý" },
            { id: "3", name: "Hóa học" },
            { id: "4", name: "Lịch sử" },
            { id: "5", name: "Địa lý" },
            { id: "6", name: "Văn học" },
          ]);

          setFolders([
            { id: "1", name: "Toán học lớp 10", parentId: null },
            { id: "1-1", name: "Đại số", parentId: "1" },
            { id: "1-2", name: "Hình học", parentId: "1" },
            { id: "2", name: "Vật lý cơ bản", parentId: null },
            { id: "2-1", name: "Cơ học", parentId: "2" },
            { id: "2-2", name: "Điện học", parentId: "2" },
            { id: "3", name: "Hóa học", parentId: null },
            { id: "3-1", name: "Hóa vô cơ", parentId: "3" },
            { id: "3-2", name: "Hóa hữu cơ", parentId: "3" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching topics and folders:", error);
        // Set empty arrays on error
        setTopics([]);
        setFolders([]);
      }
    };

    fetchData();
  }, []);

  const isPrivate = watch("isPrivate");

  // Function to render folders hierarchically with indentation
  const renderFolderOptions = () => {
    const result: JSX.Element[] = [];

    const renderFolder = (folderId: string | null, level: number) => {
      const subfolders = folders.filter((f) => f.parentId === folderId);
      subfolders.forEach((folder) => {
        const indent = "\u00A0\u00A0".repeat(level * 2); // Non-breaking spaces for indentation
        result.push(
          <option key={folder.id} value={folder.id}>
            {indent}
            {level > 0 ? "└─ " : ""}
            {folder.name}
          </option>
        );
        renderFolder(folder.id, level + 1);
      });
    };

    renderFolder(null, 0);
    return result;
  };

  const onSubmit = async (data: QuizForm) => {
    setIsLoading(true);
    try {
      const payload: CreateQuizRequest = {
        title: data.title,
        description: data.description || undefined,
        topicId: parseInt(data.topicId, 10),
        isPrivate: data.isPrivate,
        avatarUrl: data.avatarUrl || undefined,
        folderId: data.folderId ? parseInt(data.folderId, 10) : undefined,
      };

      const useMock = (import.meta as any).env?.VITE_USE_MOCK === "true";
      if (useMock) {
        const created = await mockAdapter.post<
          { quizId: number } & CreateQuizRequest
        >("/quizzes", payload);
        for (const [index, q] of questions.entries()) {
          const createdQ = await mockAdapter.post<{ id: number }>(
            "/questions",
            {
              quizId: (created as any).quizId,
              questionType: q.questionType,
              content: q.content,
              time: q.timeLimit,
              points: q.points,
              order: index + 1,
            }
          );
          for (const [optIndex, opt] of q.options.entries()) {
            await mockAdapter.post("/options", {
              questionId: (createdQ as any).id,
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: optIndex + 1,
            });
          }
        }
      } else {
        const created = await apiClient.post<
          { quizId: number } & CreateQuizRequest
        >("/quizzes", payload);
        for (const [index, q] of questions.entries()) {
          const createdQ = await apiClient.post<{ id: number }>("/questions", {
            quizId: (created as any).quizId,
            questionType: q.questionType,
            content: q.content,
            time: q.timeLimit,
            points: q.points,
            order: index + 1,
          });
          for (const [optIndex, opt] of q.options.entries()) {
            await apiClient.post("/options", {
              questionId: (createdQ as any).id,
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: optIndex + 1,
            });
          }
        }
      }
    } catch (error) {
      console.error("Create quiz error:", error);
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
              onClick={() => window.history.back()}
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
                    <select className="input" {...register("folderId")}>
                      <option value="">Chọn thư mục</option>
                      {renderFolderOptions()}
                    </select>
                  </div>
                </div>

                <Input
                  label="Link ảnh thumbnail"
                  placeholder="https://example.com/image.jpg"
                  error={errors.avatarUrl?.message}
                  {...register("avatarUrl")}
                />

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
    onSave({
      ...data,
      options: options.map((opt) => ({
        content: opt.content,
        isCorrect: opt.isCorrect,
      })),
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
