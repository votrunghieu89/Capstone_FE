import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Copy,
  Play,
  QrCode,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import {
  buildQuizHubCandidates,
  createQuizHubConnection,
  setSharedQuizHubConnection,
} from "../../../libs/quizHub";
import { HubConnectionState } from "@microsoft/signalr";
import type { HubConnection } from "@microsoft/signalr";
import { storage } from "../../../libs/storage";
import { quizService } from "../../../services/quizService";
import { onlineQuizService } from "../../../services/onlineQuizService";
import toast from "react-hot-toast";
import {
  ONLINE_SESSION_STORAGE_KEY,
  OnlineSessionContext,
} from "../../../types/realtime";

interface LobbyLocationState {
  isHost?: boolean;
  from?: string;
  quizId?: number;
  quizTitle?: string;
  totalQuestions?: number;
  nickname?: string;
}

interface PlayerItem {
  id: string;
  nickname: string;
}

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const persistOnlineSession = (ctx: OnlineSessionContext) => {
  sessionStorage.setItem(ONLINE_SESSION_STORAGE_KEY, JSON.stringify(ctx));
};

export default function HostLobby() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = useMemo(
    () => (location.state as LobbyLocationState) || {},
    [location.state]
  );

  const connectionRef = useRef<HubConnection | null>(null);
  const studentIdRef = useRef<string | null>(null);
  const hasStartedRef = useRef(false);
  const preserveConnectionRef = useRef(false);

  const sessionId = params.sessionId || params.quizId || "UNKNOWN";

  const currentUser = storage.getUser();
  const teacherId = useMemo(
    () => parseNumber(currentUser?.accountId ?? currentUser?.id ?? null),
    [currentUser]
  );
  const nicknameFromState = (locationState.nickname || "").trim();
  const fallbackNickname = currentUser?.fullName || currentUser?.userName;

  const isTeacherRoute = location.pathname.startsWith("/host/lobby");
  const derivedIsHost =
    locationState.isHost === true ||
    (currentUser?.role === "Teacher" && isTeacherRoute);
  const [isHost] = useState(derivedIsHost);

  const [pinCode, setPinCode] = useState(
    isHost ? "" : sessionId !== "UNKNOWN" ? sessionId : ""
  );
  const roomCodeRef = useRef<string | null>(pinCode || null);
  useEffect(() => {
    roomCodeRef.current = pinCode || null;
  }, [pinCode]);
  const [quizTitle, setQuizTitle] = useState(
    locationState.quizTitle || "Đang chuẩn bị Quiz..."
  );
  const [totalQuestions, setTotalQuestions] = useState<number | null>(
    locationState.totalQuestions ?? null
  );
  const [quizId] = useState<number | null>(
    locationState.quizId ?? (isHost ? parseNumber(params.quizId) : null)
  );
  const roomQuizIdRef = useRef<number | null>(quizId);
  const studentNameRef = useRef<string | null>(
    nicknameFromState || fallbackNickname || null
  );

  useEffect(() => {
    if (quizId) {
      roomQuizIdRef.current = quizId;
    }
  }, [quizId]);

  useEffect(() => {
    if (nicknameFromState) {
      studentNameRef.current = nicknameFromState;
    } else if (fallbackNickname) {
      studentNameRef.current = fallbackNickname;
    }
  }, [nicknameFromState, fallbackNickname]);

  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [playerCount, setPlayerCount] = useState(0);

  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    isHost ? "Đang khởi tạo phòng..." : "Đang chờ kết nối tới phòng..."
  );
  const hubCandidates = useMemo(() => buildQuizHubCandidates(), []);

  const ensureQuizMetadata = async () => {
    if (!quizId || (quizTitle && totalQuestions)) return;
    try {
      const detail = await quizService.getQuizDetailHP(quizId);
      setQuizTitle(detail.title);
      setTotalQuestions(detail.totalQuestions ?? detail?.totalQuestions ?? 0);
    } catch (error) {
      toast.error("Không thể tải thông tin quiz cho phòng live");
    }
  };

  useEffect(() => {
    ensureQuizMetadata();
  }, [quizId]);

  useEffect(() => {
    let isMounted = true;

    const handleUpdateStudentList = (names: string[] = [], total = 0) => {
      if (!isMounted) return;
      setPlayers(
        names.map((nickname, index) => ({
          id: `${index}-${nickname}`,
          nickname,
        }))
      );
      setPlayerCount(total);
    };

    const handleEndBeforeStart = (message?: string) => {
      if (!isMounted) return;
      toast.error(message || "Phòng đã bị giáo viên đóng");
      navigate(locationState.from || "/");
    };

    const handleEndClick = () => {
      if (!isMounted) return;
      toast("Phòng đã kết thúc");
      navigate(locationState.from || "/");
    };

    const handleGameEnded = () => {
      if (!isMounted) return;
      toast.success("Quiz đã kết thúc");
    };

    const handleGameStarted = (incomingQuizId?: number) => {
      if (!isMounted) return;
      hasStartedRef.current = true;
      const effectiveQuizId =
        incomingQuizId ?? roomQuizIdRef.current ?? quizId ?? null;
      if (!effectiveQuizId) {
        toast.error("Không xác định được quiz để bắt đầu");
        return;
      }
      roomQuizIdRef.current = effectiveQuizId;
      toast.success("Quiz đã bắt đầu");
      if (isHost) {
        return;
      } else {
        const roomCode = roomCodeRef.current || sessionId;
        const studentId = studentIdRef.current;
        const studentName =
          studentNameRef.current ||
          nicknameFromState ||
          fallbackNickname ||
          "Bạn";
        if (!roomCode || !studentId) {
          toast.error("Thiếu thông tin học sinh hoặc phòng");
          return;
        }
        preserveConnectionRef.current = true;
        const context: OnlineSessionContext = {
          mode: "online",
          roomCode,
          quizId: effectiveQuizId,
          studentId,
          studentName,
        };
        persistOnlineSession(context);
        navigate(`/play/live/${roomCode}`, {
          state: context,
        });
      }
    };

    const attachHandlers = (conn: HubConnection) => {
      conn.on("UpdateStudentList", handleUpdateStudentList);
      conn.on("EndBeforeStartGame", handleEndBeforeStart);
      conn.on("EndClick", handleEndClick);
      conn.on("GameEnded", handleGameEnded);
      conn.on("GameStarted", handleGameStarted);
  };

    const detachHandlers = (conn: HubConnection) => {
      conn.off("UpdateStudentList", handleUpdateStudentList);
      conn.off("EndBeforeStartGame", handleEndBeforeStart);
      conn.off("EndClick", handleEndClick);
      conn.off("GameEnded", handleGameEnded);
      conn.off("GameStarted", handleGameStarted);
    };

    const connectSequentially = async () => {
      preserveConnectionRef.current = false;
      setIsConnecting(true);
      let activeConnection: HubConnection | null = null;
      let lastError: unknown = null;

      for (const base of hubCandidates) {
        if (!isMounted) return;
        const trial = createQuizHubConnection(base);
        attachHandlers(trial);
        try {
          await trial.start();
          activeConnection = trial;
          connectionRef.current = trial;
          setSharedQuizHubConnection(trial);
          break;
        } catch (error) {
          lastError = error;
          detachHandlers(trial);
          await trial.stop().catch(() => undefined);
        }
      }

      if (!activeConnection) {
        if (!isMounted) return;
        setStatusMessage("Không thể kết nối realtime. Kiểm tra Backend/HTTPS");
        toast.error("Không thể kết nối realtime. Kiểm tra Backend/HTTPS");
        setIsConnecting(false);
        return;
      }

      try {
        if (isHost) {
          if (!quizId || !teacherId) {
            setStatusMessage("Thiếu thông tin quiz hoặc giáo viên");
            toast.error("Không có đủ dữ liệu để tạo phòng");
            return;
          }
          const total = totalQuestions ?? 0;
          const newPin = await activeConnection.invoke<string>(
            "CreateRoom",
            quizId,
            teacherId,
            total
          );
          roomCodeRef.current = newPin;
          setPinCode(newPin);
          setStatusMessage("Đã tạo phòng, chia sẻ PIN cho học sinh");
        } else {
          const nickname = nicknameFromState || fallbackNickname;
          if (!nickname?.trim()) {
            setStatusMessage("Vui lòng nhập tên hiển thị khi tham gia");
            return;
          }
          if (!sessionId || sessionId === "UNKNOWN") {
            setStatusMessage("Không tìm thấy PIN phòng");
            return;
          }
          const joinResult = await activeConnection.invoke<string>(
            "JoinRoom",
            sessionId,
            nickname.trim(),
            totalQuestions ?? 0
          );
          if (!joinResult) {
            setStatusMessage("Không tìm thấy phòng với mã PIN này.");
            toast.error("Không thể tìm thấy phòng. Vui lòng kiểm tra lại PIN.");
            await activeConnection.stop().catch(() => undefined);
            connectionRef.current = null;
            setSharedQuizHubConnection(null);
            navigate("/play/join", { replace: true });
            return;
          }
          const parsed = JSON.parse(joinResult);
          if (parsed?.studentId) {
            studentIdRef.current = parsed.studentId;
          }
          if (parsed?.roomCode) {
            roomCodeRef.current = parsed.roomCode;
            setPinCode(parsed.roomCode);
          }
          if (parsed?.quizId) {
            roomQuizIdRef.current = Number(parsed.quizId);
          }
          if (nickname.trim()) {
            studentNameRef.current = nickname.trim();
          }
          setStatusMessage("Đang chờ giáo viên bắt đầu...");
        }
      } catch (error: any) {
        toast.error(
          error?.message ||
            "Không thể khởi tạo/ tham gia phòng. Kiểm tra Backend."
        );
        setStatusMessage(
          error?.message ||
            "Không thể khởi tạo/ tham gia phòng. Kiểm tra Backend."
        );
      } finally {
        if (isMounted) {
          setIsConnecting(false);
        }
      }
    };

    connectSequentially();

    return () => {
      isMounted = false;
      const existing = connectionRef.current;
      if (existing) {
        detachHandlers(existing);
        if (preserveConnectionRef.current) {
          setSharedQuizHubConnection(existing);
        } else {
          existing.stop().catch(() => undefined);
          setSharedQuizHubConnection(null);
        }
        connectionRef.current = null;
      }
    };
  }, [
    hubCandidates,
    isHost,
    quizId,
    teacherId,
    sessionId,
    totalQuestions,
    nicknameFromState,
    fallbackNickname,
    locationState.from,
    navigate,
    roomCodeRef,
  ]);

  const handleStartQuiz = async () => {
    const connection = connectionRef.current;
    if (!connection || !pinCode || !quizId) {
      toast.error("Thiếu thông tin phòng hoặc quiz");
      return;
    }
    try {
      await onlineQuizService.cacheQuizQuestions(quizId);
    } catch (error) {
    }
    try {
      preserveConnectionRef.current = true;
      const result = await connection.invoke<string>("StartGame", pinCode);
      hasStartedRef.current = true;
      toast.success("Đã bắt đầu quiz");
      if (result) {
        const parsed = JSON.parse(result);
        const effectiveQuizId = parsed?.quizId ?? quizId;
        roomQuizIdRef.current = effectiveQuizId;
        navigate(`/host/live/${effectiveQuizId}`, {
          state: { roomCode: pinCode, quizId: effectiveQuizId },
        });
      }
    } catch (error) {
      toast.error("Không thể bắt đầu quiz. Vui lòng thử lại");
    }
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExitLobby = () => {
    const redirectPath =
      locationState.from ||
      (isHost && quizId ? `/quiz/preview/${quizId}` : "/");

    const connection = connectionRef.current;
    const canInvoke =
      connection &&
      connection.state === HubConnectionState.Connected &&
      pinCode;

    if (canInvoke) {
      (async () => {
        try {
          if (isHost) {
            const method = hasStartedRef.current
              ? "EndClick"
              : "EndBeforeStartGame";
            await connection!.invoke(method, pinCode);
          } else if (studentIdRef.current) {
            await connection!.invoke(
              "LeaveRoom",
              pinCode,
              studentIdRef.current
            );
          }
        } catch (error) {
        }
      })();
    }

    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-4 bg-black/10 backdrop-blur-sm">
        <button
          onClick={handleExitLobby}
          className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Thoát
        </button>
        <div className="text-white font-bold text-xl">{quizTitle}</div>
        <div />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section with PIN */}
          <div className="text-center mb-12">
            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
                EduQuiz
              </h1>
            </div>

            {/* PIN Display Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-6 max-w-4xl mx-auto border-4 border-white">
              <div className="mb-4">
                <p className="text-gray-700 text-xl font-semibold mb-2">
                  Mã PIN trò chơi:
                </p>
              </div>

              {/* Large PIN Display */}
              <div className="bg-white rounded-2xl py-8 px-8 mb-6 border-2 border-gray-200">
                <div className="text-7xl md:text-8xl font-black text-gray-900 tracking-wider">
                  {pinCode || "------"}
                </div>
              </div>

              {/* Action Buttons - Only show for host */}
              {isHost && (
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={handleCopyPin}
                    disabled={!pinCode}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-6 py-3 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Đã sao chép!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Sao chép PIN
                      </>
                    )}
                  </Button>
                  <button
                    onClick={() => setShowQR(true)}
                    disabled={!pinCode}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <QrCode className="w-5 h-5" />
                    QR Code
                  </button>
                </div>
              )}
            </div>

            {/* Participant Count & Start Button */}
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl px-8 py-5 shadow-xl max-w-4xl mx-auto mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-7 h-7 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {playerCount} người tham gia
                </span>
              </div>
              {isHost ? (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0 flex items-center gap-2"
                  onClick={handleStartQuiz}
                  disabled={!pinCode || isConnecting || playerCount === 0}
                >
                  <Play className="w-6 h-6" />
                  Bắt đầu
                </Button>
              ) : (
                <div className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl font-semibold">
                  Chờ giáo viên bắt đầu...
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl px-8 py-4 max-w-2xl mx-auto mb-8">
              <p className="text-white text-2xl font-bold">{statusMessage}</p>
            </div>
          </div>

          {/* Players Grid */}
          {players.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {player.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">
                          {player.nickname}
                        </p>
                      </div>
                    </div>
                    {isHost && (
                      <span className="text-xs text-purple-400">
                        Đã tham gia
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title="QR Code tham gia"
      >
        <div className="text-center py-6">
          <div className="inline-block p-6 bg-gray-100 rounded-2xl mb-4">
            {/* QR Code using Google Charts API */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
                pinCode || ""
              )}`}
              alt="QR Code"
              className="w-64 h-64 rounded-xl"
            />
          </div>
          <p className="text-gray-600 mb-2">Quét mã để nhận PIN</p>
          <p className="text-2xl font-bold text-gray-900">
            PIN: {pinCode || "------"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hoặc truy cập: {window.location.origin}/play/join
          </p>
        </div>
      </Modal>

      {/* Add CSS animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
