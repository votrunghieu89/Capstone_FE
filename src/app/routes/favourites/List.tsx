import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, Heart } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { QuizCard } from "../../../components/common/QuizCard";
import { TopNavbar } from "../../../components/layout/TopNavbar";
import { Footer } from "../../../components/layout/Footer";

interface FavouriteQuiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  numberOfPlays: number;
  rating: number;
  estimatedTime: number;
  addedAt: string;
  author: string;
}

export default function FavouriteQuizzes() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("all");

  // Mock data - sẽ thay thế bằng API call thực tế
  const favouriteQuizzes: FavouriteQuiz[] = [
    {
      id: "1",
      title: "Kiểm tra Toán học lớp 10",
      description: "Bài kiểm tra về đại số và hình học cơ bản",
      topic: "Toán học",
      difficulty: "Medium",
      numberOfPlays: 1247,
      rating: 4.8,
      estimatedTime: 30,
      addedAt: "2024-10-01",
      author: "Nguyễn Văn Giáo viên",
    },
    {
      id: "2",
      title: "Quiz Vật lý - Điện học",
      description: "Câu hỏi về dòng điện và từ trường",
      topic: "Vật lý",
      difficulty: "Hard",
      numberOfPlays: 892,
      rating: 4.6,
      estimatedTime: 45,
      addedAt: "2024-09-28",
      author: "Trần Thị Giáo viên",
    },
    {
      id: "3",
      title: "Lịch sử Việt Nam",
      description: "Các sự kiện lịch sử quan trọng",
      topic: "Lịch sử",
      difficulty: "Easy",
      numberOfPlays: 1567,
      rating: 4.9,
      estimatedTime: 20,
      addedAt: "2024-09-25",
      author: "Lê Văn Giáo viên",
    },
  ];

  const topics = [
    "Tất cả",
    "Toán học",
    "Vật lý",
    "Hóa học",
    "Lịch sử",
    "Địa lý",
    "Văn học",
  ];

  const filteredQuizzes = favouriteQuizzes.filter((quiz) => {
    const matchesTopic =
      selectedTopic === "all" || quiz.topic === selectedTopic;
    return matchesTopic;
  });

  // rút gọn hiển thị như card đơn giản

  const handleRemoveFavourite = (quizId: string) => {
    // TODO: Call remove favourite API
    console.log("Remove favourite:", quizId);
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <TopNavbar />
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-error-600" />
            <h1 className="text-4xl font-bold text-secondary-900">
              Quiz yêu thích
            </h1>
          </div>
          <p className="text-secondary-600">
            Danh sách quiz bạn đã thêm vào yêu thích
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 flex-1">
        {/* Results Count & Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-lg font-medium text-secondary-900">
              {filteredQuizzes.length} quiz yêu thích
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <select
              className="input w-full sm:w-64"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              {topics.map((topic) => (
                <option key={topic} value={topic === "Tất cả" ? "all" : topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quiz Grid (simplified card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="relative">
              <QuizCard
                title={quiz.title}
                topic={quiz.topic}
                questionCount={18}
                plays={quiz.numberOfPlays}
                onDetail={() => navigate(`/quiz/preview/${quiz.id}`)}
              />
              <button
                className="absolute top-3 right-3 text-error-600 hover:text-error-700"
                onClick={() => handleRemoveFavourite(quiz.id)}
                title="Bỏ yêu thích"
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Chưa có quiz yêu thích nào
            </h3>
            <p className="text-secondary-600 mb-6">
              Thêm quiz vào yêu thích để dễ dàng truy cập sau này
            </p>
            <Button>
              <BookOpen className="w-4 h-4 mr-2" />
              Khám phá Quiz
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
