import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { Users, Trophy, Activity, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import {
  HOST_LIVE_SESSION_STORAGE_KEY,
  HostLiveContext,
  LeaderboardEntry,
} from "../../../types/realtime";
import { getSharedQuizHubConnection } from "../../../libs/quizHub";
import type { HubConnection } from "@microsoft/signalr";

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
  const [isStopping, setIsStopping] = useState(false);
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

  const handleStopRoom = async () => {
    if (!connection || !context) return;
    if (!context.roomCode) {
      toast.error("Không tìm thấy mã phòng.");
      return;
    }
    if (
      !window.confirm(
        "Thao tác này sẽ đóng phòng ngay lập tức và xóa dữ liệu live. Bạn chắc chắn chứ?"
      )
    ) {
      return;
    }
    setIsStopping(true);
    try {
      await connection.invoke("EndClick", context.roomCode);
      toast.success("Đã đóng phòng.");
      navigate(`/quiz/preview/${context.quizId}`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể đóng phòng. Vui lòng thử lại.");
    } finally {
      setIsStopping(false);
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
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-emerald-300" />
                  <p className="text-lg font-semibold">
                    Dòng thời gian và hành động
                  </p>
                </div>
                <p className="text-sm text-white/80">
                  Thống kê realtime được lấy trực tiếp từ SignalR
                  `ReceiveLeaderboard`.
                </p>
                <div className="space-y-3 max-h-60 overflow-auto pr-1 custom-scroll">
                  {leaderboard.length === 0 ? (
                    <p className="text-white/70">
                      Chưa có học sinh gửi đáp án.
                    </p>
                  ) : (
                    leaderboard.map((entry) => (
                      <div
                        key={entry.studentId}
                        className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold">{entry.nickname}</p>
                          <p className="text-sm text-white/70">
                            Rank #{entry.rank}
                          </p>
                        </div>
                        <p className="text-2xl font-black">{entry.score}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  <p className="text-lg font-semibold">Top bảng xếp hạng</p>
                </div>
                {topThree.length === 0 ? (
                  <p className="text-white/70">Chưa có dữ liệu để xếp hạng.</p>
                ) : (
                  <div className="space-y-3">
                    {topThree.map((entry, index) => (
                      <div
                        key={entry.studentId ?? index}
                        className="bg-white/15 rounded-2xl px-4 py-3 flex items-center gap-4"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-yellow-300 text-yellow-900"
                              : index === 1
                              ? "bg-gray-300 text-gray-900"
                              : "bg-orange-300 text-orange-900"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{entry.nickname}</p>
                          <p className="text-sm text-white/70">
                            {entry.score} điểm
                          </p>
                        </div>
                        <p className="text-lg font-bold">#{entry.rank}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white/10 rounded-3xl p-6 space-y-4">
              <p className="text-lg font-semibold">Hành động</p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={handleStopRoom}
                  disabled={isStopping || !connection}
                  className="px-6 py-4 font-semibold"
                >
                  {isStopping ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang đóng phòng...
                    </>
                  ) : (
                    "Dừng & xóa phòng"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => navigate(`/quiz/preview/${context.quizId}`)}
                >
                  Thoát về quiz
                </Button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
