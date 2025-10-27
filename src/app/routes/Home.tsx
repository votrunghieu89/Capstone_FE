import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Play,
  SlidersHorizontal,
  Bookmark,
  BookOpen,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Logo } from "../../components/common/Logo";
import { TopNavbar } from "../../components/layout/TopNavbar";
import { Footer } from "../../components/layout/Footer";
import { storage } from "../../libs/storage";
import { useMemo, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const categories = [
    "Tất cả",
    "Toán học",
    "Khoa học",
    "Lịch sử",
    "Văn học",
    "Tiếng Anh",
    "Địa lý",
  ];

  const quizzes = [
    {
      id: "q1",
      title: "Sinh học tế bào",
      desc: "Khám phá cấu trúc và chức năng của tế bào",
      cat: "Khoa học",
      questions: 18,
      minutes: 22,
      plays: 189,
    },
    {
      id: "q2",
      title: "Phương trình bậc hai",
      desc: "Ôn tập các dạng bài tập về phương trình bậc hai cơ bản",
      cat: "Toán học",
      questions: 15,
      minutes: 20,
      plays: 234,
    },
    {
      id: "q3",
      title: "Lịch sử Việt Nam thế kỷ 20",
      desc: "Tìm hiểu các sự kiện quan trọng trong lịch sử Việt Nam",
      cat: "Lịch sử",
      questions: 20,
      minutes: 25,
      plays: 456,
    },
    {
      id: "q4",
      title: "Từ vựng tiếng Anh cơ bản",
      desc: "Các mẫu câu và từ vựng phổ biến",
      cat: "Tiếng Anh",
      questions: 12,
      minutes: 15,
      plays: 120,
    },
    {
      id: "q5",
      title: "Địa lý thế giới",
      desc: "Kiến thức địa lý tổng hợp",
      cat: "Địa lý",
      questions: 16,
      minutes: 18,
      plays: 98,
    },
    {
      id: "q6",
      title: "Văn học Việt Nam",
      desc: "Tác phẩm tiêu biểu và tác giả",
      cat: "Văn học",
      questions: 14,
      minutes: 20,
      plays: 140,
    },
  ];

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return quizzes.filter(
      (q) =>
        (activeCategory === "Tất cả" || q.cat === activeCategory) &&
        (!s ||
          q.title.toLowerCase().includes(s) ||
          q.desc.toLowerCase().includes(s))
    );
  }, [activeCategory, search]);

  const user = storage.getUser();

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden flex flex-col">
      {user ? (
        <TopNavbar />
      ) : (
        <header className="relative z-10 w-full backdrop-blur-lg bg-white/70 border-b border-white/30">
          <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-2">
              <Link to="/auth/login">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="relative z-10 flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Hero with gradient card background like mock */}
        <section className="mb-8">
          <div
            className="rounded-2xl px-6 md:px-12 py-10 md:py-12 border border-white/30 shadow-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(236,72,153,0.9) 100%)",
            }}
          >
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-sm mb-3">
                Chào mừng đến với EduQuiz!
              </h1>
              <p className="text-white/95 max-w-3xl mx-auto">
                Nền tảng học tập tương tác hàng đầu Việt Nam. Khám phá hàng
                nghìn bài quiz thú vị và nâng cao kiến thức của bạn!
              </p>
            </div>
            <div className="mt-6 max-w-3xl mx-auto flex items-center gap-3">
              <div className="input flex items-center flex-1 bg-white/95">
                <Search className="w-4 h-4 mr-2" />
                <input
                  className="flex-1 outline-none"
                  placeholder="Tìm kiếm quiz, giáo viên, chủ đề..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="whitespace-nowrap"
                onClick={() =>
                  document
                    .getElementById("landing-quizzes")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Play className="w-4 h-4 mr-2" /> Khám phá
              </Button>
              <Button
                variant="outline"
                className="whitespace-nowrap"
                onClick={() => navigate("/play/join")}
              >
                Tham gia bằng mã PIN
              </Button>
            </div>
          </div>
        </section>

        {/* Categories filter bar */}
        <section className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === c
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-white hover:bg-primary-50 text-secondary-700 border border-secondary-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="px-3 py-2 rounded-lg bg-white border border-secondary-200 text-sm flex items-center hover:bg-primary-50 transition-all">
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Lọc
          </button>
        </section>

        <p className="text-sm text-secondary-600 mb-6 font-medium">
          Tìm thấy {filtered.length} quiz
        </p>

        {/* Featured grid */}
        <section
          id="landing-quizzes"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl overflow-hidden border border-primary-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white"
            >
              <Link to={`/quiz/preview/${q.id}`} className="block">
                <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-blue-400" />
                </div>
                <div className="p-5">
                  <div className="mb-3">
                    <span className="inline-block text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {q.cat}
                    </span>
                  </div>
                  <h3 className="font-bold text-secondary-900 mb-2 text-lg line-clamp-2">
                    {q.title}
                  </h3>
                  <div className="flex items-center text-sm text-secondary-600 space-x-4 mb-4">
                    <span className="flex items-center">
                      <Bookmark className="w-4 h-4 mr-1" />
                      {q.questions} câu
                    </span>
                    <span>{q.plays} lượt chơi</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/quiz/preview/${q.id}`);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </Link>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
