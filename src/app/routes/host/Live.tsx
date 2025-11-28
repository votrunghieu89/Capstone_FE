import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { Users, Trophy, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import {
  HOST_LIVE_SESSION_STORAGE_KEY,
  HostLiveContext,
  LeaderboardEntry,
} from "../../../types/realtime";
import { getSharedQuizHubConnection } from "../../../libs/quizHub";
import type { HubConnection } from "@microsoft/signalr";
import { onlineQuizService } from "../../../services/onlineQuizService";

const mapLeaderboardPayload = (payload: unknown): LeaderboardEntry[] => {
  if (!Array.isArray(payload)) return [];
  return payload.map((entry: any, index) => ({
    studentId: entry?.studentId ?? entry?.StudentId ?? `${index}`,
    nickname:
      entry?.studentName ??
      entry?.StudentName ??
      entry?.nickname ??
      entry?.Nickname ??
      "Ẩn danh",
    score: Number(entry?.score ?? entry?.Score ?? 0),
    rank: Number(entry?.rank ?? entry?.Rank ?? index + 1),
  }));
};

const persistHostContext = (ctx: HostLiveContext) => {
  sessionStorage.setItem(HOST_LIVE_SESSION_STORAGE_KEY, JSON.stringify(ctx));
};

export default function HostLive() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as HostLiveContext | undefined;
  const storedState = useMemo(() => {
    const raw = sessionStorage.getItem(HOST_LIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as HostLiveContext;
    } catch {
      return null;
    }
  }, []);

  const derivedContext = locationState ?? storedState;
  const quizIdFromUrl = params.quizId ? Number(params.quizId) : null;

  const [context] = useState<HostLiveContext | null>(
    derivedContext ??
      (quizIdFromUrl
        ? {
            quizId: quizIdFromUrl,
            roomCode: locationState?.roomCode || storedState?.roomCode || "",
          }
        : null)
  );

  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [status, setStatus] = useState("Đang chờ cập nhật từ học sinh...");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [hasSummarized, setHasSummarized] = useState(false);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (context?.roomCode) {
      persistHostContext(context);
    }
  }, [context]);

  useEffect(() => {
    if (!context) {
      setError("Thiếu thông tin phòng live. Vui lòng quay lại phòng chờ.");
      return;
    }
    const existingConnection = getSharedQuizHubConnection();
    if (!existingConnection) {
      setError(
        "Không tìm thấy kết nối realtime. Vui lòng quay lại phòng chờ để khởi tạo lại."
      );
      return;
    }

    setConnection(existingConnection);
    const handleLeaderboard = (payload: unknown) => {
      const mapped = mapLeaderboardPayload(payload);
      setLeaderboard(mapped);
      setPlayerCount(mapped.length);
      setStatus("Đang diễn ra");
    };

    const handleStudentList = (_names: string[], total: number) => {
      setPlayerCount(total);
    };

    const handleGameEnded = () => {
      setStatus("Quiz đã kết thúc");
      setHasSummarized(true);
      toast.success("Quiz đã kết thúc. Có thể đóng phòng.");
    };

    existingConnection.on("ReceiveLeaderboard", handleLeaderboard);
    existingConnection.on("UpdateStudentList", handleStudentList);
    existingConnection.on("GameEnded", handleGameEnded);

    return () => {
      existingConnection.off("ReceiveLeaderboard", handleLeaderboard);
      existingConnection.off("UpdateStudentList", handleStudentList);
      existingConnection.off("GameEnded", handleGameEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const handleSummarize = async () => {
    if (!connection || !context?.roomCode) return;
    setIsSummarizing(true);
    setReportStatus(null);
    try {
      await connection.invoke("EndAfterComplete", context.roomCode);
      await onlineQuizService.insertOnlineReport(context.roomCode);
      setHasSummarized(true);
      setReportStatus("Đã tổng kết và lưu báo cáo thành công.");
      toast.success("Đã tổng kết và lưu kết quả.");
    } catch (err) {
      console.error(err);
      setReportStatus("Không thể tổng kết. Vui lòng thử lại.");
      toast.error("Không thể tổng kết. Vui lòng thử lại.");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!context) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white text-center px-6">
        <div className="max-w-md space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-300 mx-auto" />
          <p className="text-2xl font-bold">
            Không tìm thấy thông tin phòng live.
          </p>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 relative overflow-hidden text-white">
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute top-16 left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-12 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-black/20 backdrop-blur px-6 py-4 rounded-2xl">
          <div>
            <p className="text-sm text-white/70">Mã PIN</p>
            <p className="text-3xl font-black tracking-widest">
              {context.roomCode || "??????"}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70">Quiz ID</p>
            <p className="text-xl font-semibold">{context.quizId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <p className="text-lg font-semibold">{playerCount} học sinh</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Trạng thái</p>
            <p className="text-lg font-semibold">{status}</p>
          </div>
        </header>

        {error ? (
          <div className="bg-white/10 rounded-3xl p-10 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-yellow-300 mx-auto" />
            <p className="text-xl font-semibold">{error}</p>
            <Button onClick={() => navigate(`/quiz/preview/${context.quizId}`)}>
              Quay lại chi tiết Quiz
            </Button>
          </div>
        ) : (
          <>
            <section className="bg-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-300" />
                <p className="text-lg font-semibold">Bảng xếp hạng trực tiếp</p>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-white/70">
                  Chưa có học sinh gửi đáp án để hiển thị bảng xếp hạng.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-end justify-center gap-4">
                      {[topThree[1], topThree[0], topThree[2]].map(
                        (entry, columnIndex) => {
                          if (!entry) return null;
                          const visualRank =
                            columnIndex === 0 ? 2 : columnIndex === 1 ? 1 : 3;
                          const sizeClass =
                            columnIndex === 1
                              ? "h-48"
                              : columnIndex === 0
                              ? "h-40"
                              : "h-36";
                          const colorClass =
                            columnIndex === 1
                              ? "from-yellow-400 to-amber-500"
                              : columnIndex === 0
                              ? "from-slate-200 to-slate-400"
                              : "from-orange-300 to-orange-500";
                          return (
                            <div
                              key={entry.studentId ?? visualRank}
                              className={`flex-1 flex flex-col items-center`}
                            >
                              <div
                                className={`w-14 h-14 rounded-full bg-white text-purple-700 font-black flex items-center justify-center shadow-lg`}
                              >
                                {`#${entry.rank}`}
                              </div>
                              <div
                                className={`mt-3 w-full rounded-3xl bg-gradient-to-t ${colorClass} ${sizeClass} flex flex-col justify-end text-purple-900 shadow-xl`}
                              >
                                <div className="bg-white/80 rounded-3xl p-3 text-center space-y-1">
                                  <p className="text-sm font-semibold text-purple-500">
                                    Top {visualRank}
                                  </p>
                                  <p className="text-lg font-bold text-purple-900">
                                    {entry.nickname}
                                  </p>
                                  <p className="text-sm text-purple-600">
                                    {entry.score} điểm
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                    {leaderboard.length > 3 && (
                      <div className="space-y-3 max-h-72 overflow-auto pr-1 custom-scroll">
                        {leaderboard.slice(3).map((entry, index) => (
                          <div
                            key={entry.studentId ?? `list-${index}`}
                            className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-white/80">
                                #{entry.rank}
                              </span>
                              <div>
                                <p className="font-semibold">
                                  {entry.nickname}
                                </p>
                                <p className="text-sm text-white/70">
                                  {entry.score} điểm
                                </p>
                              </div>
                            </div>
                            <p className="text-xl font-black">{entry.score}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>

            {hasSummarized ? (
              <div className="bg-white/10 rounded-3xl p-6 space-y-4">
                <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl px-4 py-3 text-white">
                  Đã tổng kết và lưu kết quả. Có thể rời trang này an toàn.
                </div>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-white text-purple-700 hover:bg-white/90"
                >
                  Về trang chủ
                </Button>
                {reportStatus && (
                  <p className="text-sm text-white/80">{reportStatus}</p>
                )}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="bg-white/10 rounded-3xl p-6 text-white/80">
                Chờ học sinh hoàn thành câu đầu tiên để có thể tổng kết.
              </div>
            ) : (
              <div className="bg-white/10 rounded-3xl p-6 flex flex-col gap-3 text-white">
                <p>Đã nhận dữ liệu từ học sinh. Có thể tổng kết khi cần.</p>
                <Button
                  onClick={handleSummarize}
                  disabled={isSummarizing || !connection}
                  className="px-6 py-4 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tổng kết...
                    </>
                  ) : (
                    "Tổng kết & lưu kết quả"
                  )}
                </Button>
                {reportStatus && (
                  <p className="text-sm text-white/80">{reportStatus}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
