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
import { Spinner } from "../../components/common/Spinner";
import {
  useGetPublicQuizzes,
  useFilterByTopic,
  useGetAllTopic,
} from "../../libs/api/quizApi";

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [showFilter, setShowFilter] = useState(false);
  // Lấy danh sách topic từ API
  const { data: topics } = useGetAllTopic() ;

  // Danh sách category động từ API + "Tất cả"
  const categories = [
  { topicId: null, topicName: "Tất cả" },
  ...(topics?.slice(0, 5).map((t) => ({
    topicId: t.topicId,
    topicName: t.topicName,
  })) ?? []),
];

  const [activeCategory, setActiveCategory] = useState<{
    topicId: number | null;
    topicName: string;
  }>({
    topicId: null,
    topicName: "Tất cả",
  });

  const topicId = activeCategory.topicId;

  // API: lấy tất cả quiz
  const useAllQuiz = useGetPublicQuizzes(1, 9999);

  // API: filter theo topic
  const useFiltered = useFilterByTopic(topicId ?? null, currentPage, pageSize);
  // lay tong cac quiz de phan trang
  const useFilteredAll = useFilterByTopic(topicId ?? null, 1, 10000);
  // Loading / Error
  const isLoading =
    topicId === null ? useAllQuiz.isLoading : useFiltered.isLoading;

  const isError = topicId === null ? useAllQuiz.isError : useFiltered.isError;

  // Data quiz sau filter topic (BE)
  const quizzes =
    topicId === null
      ? useAllQuiz.data || []
      : ((useFiltered.data || []) as any[]);

  // Tìm kiếm FE
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return quizzes.filter(
      (q: any) =>
        !s ||
        q.title.toLowerCase().includes(s) ||
        q.description?.toLowerCase().includes(s)
    );
  }, [search, quizzes]);

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
            <div className="mt-6 max-w-3xl mx-auto flex items-center justify-center gap-3">
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

        {/* Categories */}
        <section className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c.topicId ?? "all"}
                onClick={() => {
                  setActiveCategory(c);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory.topicId === c.topicId
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-white hover:bg-primary-50 text-secondary-700 border border-secondary-200"
                }`}
              >
                {c.topicName}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className="px-3 py-2 rounded-lg bg-white border border-secondary-200 text-sm flex items-center hover:bg-primary-50 transition-all relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Lọc
          </button>
          {/* MENU LỌC  */}
            {showFilter && (
  <div className="absolute right-0 top-16 z-50 w-72 animate-fadeIn">
    <div className="bg-white/95 backdrop-blur-md border border-secondary-200 shadow-xl rounded-2xl p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-secondary-700">
          Bộ lọc môn học
        </p>
        <button
          onClick={() => setShowFilter(false)}
          className="text-secondary-500 hover:text-secondary-700 transition"
        >
          ✕
        </button>
      </div>

      {/* Danh sách topic */}
      <div className="max-h-64 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-thumb-rounded">
        {topics?.map((t) => {
          const isActive = activeCategory.topicId === t.topicId;
          return (
            <button
              key={t.topicId}
              onClick={() => {
                setActiveCategory(t);
                setCurrentPage(1);
                setShowFilter(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all
                ${
                  isActive
                    ? "bg-primary-100 text-primary-700 font-medium shadow-sm"
                    : "hover:bg-secondary-100 text-secondary-700"
                }
              `}
            >
              {t.topicName}

              {isActive && (
                <span className="text-primary-700 text-xs font-semibold">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  </div>
)}
        </section>

        {/* DATA RENDER */}
        {isLoading ? (
          <div className="text-center py-20">
            <Spinner size="lg" className="text-primary-600" />
            <p className="mt-3 text-secondary-600">
              Đang tải các Quiz mới nhất...
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-600 border border-red-200 p-4 rounded-xl">
            Lỗi tải dữ liệu. Vui lòng kiểm tra kết nối API.
          </div>
        ) : (
          <>
            <p className="text-sm text-secondary-600 mb-6 font-medium">
                {topicId === null
                  ? `Tìm thấy ${filtered.length} quiz` 
                  : `Tìm thấy ${(useFilteredAll.data as any || []).length} quiz`}
              </p>

            {/* Phân trang FE */}
            {(() => {
              let paginated = [];
              let totalPages = 1;

              if (topicId === null) {
               //Fe se phan trang neu chon muc tat ca
                const startIndex = (currentPage - 1) * pageSize;
                paginated = filtered.slice(startIndex, startIndex + pageSize);
                totalPages = Math.ceil(filtered.length / pageSize);
              } else {
               //chon cac topic khac thi phan trang theo be
                paginated = filtered;
                const hasNextPage = filtered.length === pageSize;
                totalPages = hasNextPage ? currentPage + 1 : currentPage;
              }

              return (
                <>
                  <section
                    id="landing-quizzes"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {paginated.map((q: any) => (
                      <div
                        key={q.quizId}
                        className="rounded-2xl overflow-hidden border border-primary-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white"
                      >
                        <Link
                          to={`/quiz/preview/${q.quizId}`}
                          className="block"
                        >
                          <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                            {q.avatarURL ? (
                              <img
                                src={q.avatarURL}
                                alt={q.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-20 h-20 text-blue-400" />
                            )}
                          </div>

                          <div className="p-5">
                            <div className="mb-3">
                              <span className="inline-block text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {q.topicName}
                              </span>
                            </div>

                            <h3 className="font-bold text-secondary-900 mb-2 text-lg line-clamp-2">
                              {q.title}
                            </h3>

                            <div className="flex items-center text-sm text-secondary-600 space-x-4 mb-4">
                              <span className="flex items-center">
                                <Bookmark className="w-4 h-4 mr-1" />
                                {q.totalQuestions || 0} câu
                              </span>
                              <span>
                                {q.totalParticipants || 0} lượt chơi
                              </span>
                            </div>

                            <Button
                              className="w-full"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/quiz/preview/${q.quizId}`);
                              }}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </section>

                  {/* Pagination */}
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((p) => Math.max(p - 1, 1))
                      }
                    >
                      ← Trước
                    </Button>

                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-8 h-8 rounded-full font-medium text-sm ${
                          currentPage === idx + 1
                            ? "bg-primary-600 text-white shadow-md"
                            : "bg-white border border-secondary-200 hover:bg-primary-50 text-secondary-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      topicId === null
                        ? currentPage === totalPages
                        : paginated.length < pageSize
                    }
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Sau →
                  </Button>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}