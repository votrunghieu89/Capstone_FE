import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Copy,
  Play,
  Settings,
  QrCode,
  UserX,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";

interface Player {
  id: string;
  nickname: string;
  socketId: string;
  joinedAt: string;
  isReady: boolean;
}

export default function HostLobby() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get sessionId from URL params (can be 'quizId' or 'sessionId' depending on route)
  const sessionId = params.sessionId || params.quizId || "UNKNOWN";

  // Generate random 6 digit PIN code (numbers only)
  const [pinCode] = useState(() => {
    // Generate random 6 digit number (100000 - 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
  });

  console.log("HostLobby - sessionId:", sessionId, "PIN:", pinCode);

  // Detect if current user is host or player
  // Method 1: Check location state (passed from Preview when clicking "Tổ chức Live")
  const isHostFromState = location.state?.isHost === true;

  // Method 2: Check user role from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isHostFromRole = user?.role === "Teacher" || user?.role === "Admin";

  // isHost is TRUE if either condition is met
  const isHost = isHostFromState || isHostFromRole;

  console.log(
    "isHostFromState:",
    isHostFromState,
    "isHostFromRole:",
    isHostFromRole,
    "Final isHost:",
    isHost
  );

  // TODO: Fetch quiz data from API using sessionId
  // const { data: quizData } = useQuery(['quiz', sessionId], () => fetchQuiz(sessionId));
  const [quizTitle] = useState("Kiểm tra Toán học lớp 10"); // Mock - sẽ lấy từ API

  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      nickname: "Nguyễn Văn Anh",
      socketId: "socket1",
      joinedAt: "2024-10-04T10:00:00",
      isReady: true,
    },
    {
      id: "2",
      nickname: "Trần Thị Bình",
      socketId: "socket2",
      joinedAt: "2024-10-04T10:00:15",
      isReady: true,
    },
    {
      id: "3",
      nickname: "Lê Minh Cường",
      socketId: "socket3",
      joinedAt: "2024-10-04T10:00:30",
      isReady: true,
    },
    {
      id: "4",
      nickname: "Phạm Hồng Đào",
      socketId: "socket4",
      joinedAt: "2024-10-04T10:00:45",
      isReady: true,
    },
    {
      id: "5",
      nickname: "Hoàng Văn Em",
      socketId: "socket5",
      joinedAt: "2024-10-04T10:01:00",
      isReady: true,
    },
    {
      id: "6",
      nickname: "Võ Thị Phương",
      socketId: "socket6",
      joinedAt: "2024-10-04T10:01:15",
      isReady: true,
    },
    {
      id: "7",
      nickname: "Đặng Quốc Gia",
      socketId: "socket7",
      joinedAt: "2024-10-04T10:01:30",
      isReady: false,
    },
    {
      id: "8",
      nickname: "Bùi Thị Hoa",
      socketId: "socket8",
      joinedAt: "2024-10-04T10:01:45",
      isReady: true,
    },
    {
      id: "9",
      nickname: "Dương Văn Ích",
      socketId: "socket9",
      joinedAt: "2024-10-04T10:02:00",
      isReady: true,
    },
    {
      id: "10",
      nickname: "Mai Thị Kim",
      socketId: "socket10",
      joinedAt: "2024-10-04T10:02:15",
      isReady: true,
    },
    {
      id: "11",
      nickname: "Trương Văn Long",
      socketId: "socket11",
      joinedAt: "2024-10-04T10:02:30",
      isReady: true,
    },
    {
      id: "12",
      nickname: "Lý Thị Minh",
      socketId: "socket12",
      joinedAt: "2024-10-04T10:02:45",
      isReady: false,
    },
    {
      id: "13",
      nickname: "Phan Văn Nam",
      socketId: "socket13",
      joinedAt: "2024-10-04T10:03:00",
      isReady: true,
    },
    {
      id: "14",
      nickname: "Hồ Thị Oanh",
      socketId: "socket14",
      joinedAt: "2024-10-04T10:03:15",
      isReady: true,
    },
    {
      id: "15",
      nickname: "Đinh Văn Phúc",
      socketId: "socket15",
      joinedAt: "2024-10-04T10:03:30",
      isReady: true,
    },
    {
      id: "16",
      nickname: "Chu Thị Quỳnh",
      socketId: "socket16",
      joinedAt: "2024-10-04T10:03:45",
      isReady: true,
    },
    {
      id: "17",
      nickname: "Vũ Văn Rồng",
      socketId: "socket17",
      joinedAt: "2024-10-04T10:04:00",
      isReady: true,
    },
    {
      id: "18",
      nickname: "Đỗ Thị Sương",
      socketId: "socket18",
      joinedAt: "2024-10-04T10:04:15",
      isReady: false,
    },
    {
      id: "19",
      nickname: "Ngô Văn Tài",
      socketId: "socket19",
      joinedAt: "2024-10-04T10:04:30",
      isReady: true,
    },
    {
      id: "20",
      nickname: "Lâm Thị Uyên",
      socketId: "socket20",
      joinedAt: "2024-10-04T10:04:45",
      isReady: true,
    },
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartQuiz = () => {
    console.log("Starting quiz...");
    // Navigate to host live page (only host can start)
    navigate(`/host/live/${sessionId}`);
  };

  const handleKickPlayer = (playerId: string) => {
    console.log("Kicking player:", playerId);
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Thoát
        </button>
        <div className="text-white font-bold text-xl">{quizTitle}</div>
        {isHost && (
          <button
            onClick={() => setShowSettings(true)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        )}
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
                  {pinCode}
                </div>
              </div>

              {/* Action Buttons - Only show for host */}
              {isHost && (
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={handleCopyPin}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-6 py-3 text-base font-semibold"
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
                    className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
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
                  {players.length} người tham gia
                </span>
              </div>
              {isHost ? (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0 flex items-center gap-2"
                  onClick={handleStartQuiz}
                  disabled={players.length === 0}
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
              <p className="text-white text-2xl font-bold">
                {isHost
                  ? "Đang chờ người tham gia"
                  : "Đang chờ giáo viên bắt đầu quiz..."}
              </p>
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
                        <p className="text-xs text-gray-500">
                          {new Date(player.joinedAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    {isHost && (
                      <button
                        onClick={() => handleKickPlayer(player.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Cài đặt trò chơi"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              Thời gian mỗi câu (giây)
            </label>
            <input
              type="number"
              className="input"
              defaultValue={20}
              min={10}
              max={300}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                defaultChecked
              />
              <span className="ml-2 text-sm text-secondary-600">
                Hiển thị điểm sau mỗi câu
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

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
                pinCode
              )}`}
              alt="QR Code"
              className="w-64 h-64 rounded-xl"
            />
          </div>
          <p className="text-gray-600 mb-2">Quét mã để nhận PIN</p>
          <p className="text-2xl font-bold text-gray-900">PIN: {pinCode}</p>
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
