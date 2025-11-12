import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "../../../components/common/Button";

import { useGetStudentHistory } from "../../../libs/api/studentHistoryApi";
import { useGetStudentProfile } from "../../../libs/api/profileApi";
import { QuizHistory } from "../../../types/quiz";
import { HistoryResultCard } from "../../../components/common/HistoryResultCard";
import { storage } from "../../../libs/storage";

export default function StudentHistory() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<"all" | "public" | "private">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const user = storage.getUser();
  const accountId = user?.id;

  const { data: profile, isLoading: profileLoading, error: profileError } =
    useGetStudentProfile(accountId);
 
  const studentId =
    (profile as any)?.profile?.studentId ?? (profile as any)?.data?.studentId ?? (profile as any)?.result?.studentId ?? undefined;
    

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useGetStudentHistory(studentId ?? 0, filterType);

  const isLoading = profileLoading || historyLoading;
  const error = profileError || historyError;

  const history: QuizHistory[] = historyData || [];

  const filteredResults = useMemo(() => {
    return history.filter((quiz) =>
      quiz.QuizTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  const handleViewDetail = (quizId: string, completedAt: string) => {
    if (!studentId) return;
    navigate(`/report/detail/${studentId}/${quizId}?date=${completedAt}`);
  };

  return (
    <div className="w-full">
        <div className="mb-8 flex justify-between items-center"> <div> <h1 className="text-3xl font-bold text-secondary-900 mb-2">📖 Lịch sử Quiz</h1> <p className="text-secondary-600">Xem lại các quiz đã hoàn thành</p> </div> </div>
      <div className="mb-6 flex space-x-4">
        <Button variant={filterType === "all" ? "primary" : "outline"} onClick={() => setFilterType("all")}>Tất cả</Button>
        <Button variant={filterType === "public" ? "primary" : "outline"} onClick={() => setFilterType("public")}>Quiz Homepage</Button>
        <Button variant={filterType === "private" ? "primary" : "outline"} onClick={() => setFilterType("private")}>Quiz Nhóm lớp</Button>
      </div>

      {isLoading && (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 font-medium">Lỗi tải dữ liệu:</p>
          <p className="text-red-600">{(error as any)?.message ?? String(error)}</p>
        </div>
      )}

      {!isLoading && !error && filteredResults.length > 0 && (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <HistoryResultCard
              key={result.QuizId}
              result={result}
              onViewDetail={() => handleViewDetail(result.QuizId.toString(), result.CompletedAt)}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && history.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <p className="text-gray-500">Bạn chưa hoàn thành quiz nào. Hãy bắt đầu thôi!</p>
        </div>
      )}
    </div>
  );
}
