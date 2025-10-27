import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { QuizCard } from "../../../components/common/QuizCard";
import { TopNavbar } from "../../../components/layout/TopNavbar";
import { Footer } from "../../../components/layout/Footer";

interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  numberOfPlays: number;
  rating: number;
  estimatedTime: number;
  createdAt: string;
  isPublic: boolean;
  author: string;
}

export default function BrowseQuizzes() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Mock data - sẽ thay thế bằng API call thực tế
  const quizzes: Quiz[] = [
    {
      id: "1",
      title: "Kiểm tra Toán học lớp 10",
      description: "Bài kiểm tra về đại số và hình học cơ bản",
      topic: "Toán học",
      difficulty: "Medium",
      numberOfPlays: 1247,
      rating: 4.8,
      estimatedTime: 30,
      createdAt: "2024-10-01",
      isPublic: true,
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
      createdAt: "2024-09-28",
      isPublic: true,
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
      createdAt: "2024-09-25",
      isPublic: true,
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
  const difficulties = ["Tất cả", "Easy", "Medium", "Hard"];

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesTopic =
      selectedTopic === "all" || quiz.topic === selectedTopic;
    const matchesDifficulty =
      selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    return matchesTopic && matchesDifficulty;
  });

  // bỏ rating/difficulty để card tối giản theo thiết kế

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopNavbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-100">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">
            Khám phá Quiz
          </h1>
          <p className="text-secondary-600">
            Tìm kiếm và tham gia các quiz thú vị từ cộng đồng
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="card mb-8">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Khám phá quiz
                </h3>
                <p className="text-sm text-secondary-600 mt-1">
                  Tìm quiz phù hợp với bạn
                </p>
              </div>
              <div>
                <select
                  className="input"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  {topics.map((topic) => (
                    <option
                      key={topic}
                      value={topic === "Tất cả" ? "all" : topic}
                    >
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="input"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option
                      key={difficulty}
                      value={difficulty === "Tất cả" ? "all" : difficulty}
                    >
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-secondary-600">
            Tìm thấy {filteredQuizzes.length} quiz
          </p>
        </div>

        {/* Quiz Grid (simplified card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              thumbnailUrl={undefined}
              topic={quiz.topic}
              title={quiz.title}
              questionCount={18}
              plays={quiz.numberOfPlays}
              onDetail={() => navigate(`/quiz/preview/${quiz.id}`)}
            />
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Không tìm thấy quiz nào
            </h3>
            <p className="text-secondary-600">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredQuizzes.length > 0 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="primary" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
