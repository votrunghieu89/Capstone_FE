import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common/Button";

export default function HostResults() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white text-center px-6">
      <div className="max-w-2xl space-y-6">
        <p className="text-3xl font-bold">Kết quả live chưa khả dụng</p>
        <p className="text-white/80">
          Backend chưa cung cấp dữ liệu leaderboard/report cuối cùng. Khi BE hoàn thiện
          InsertOnlineReport & API trả dữ liệu thật, màn này sẽ được bật lại.
        </p>
        <Button onClick={() => navigate("/")}>Về trang chủ</Button>
      </div>
    </div>
  );
}
