import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../../../components/common/Button';
import { Spinner } from '../../../components/common/Spinner';
import { adminApi, AuditLog, AccountByRole } from '../../../libs/api/adminApi';
import { storage } from '../../../libs/storage';
import { Activity, Plus, Settings, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminAuditLogs() {
  const navigate = useNavigate();
  const user = storage.getUser();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accountMap, setAccountMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchAccountsForMapping = async () => {
      try {
        const allAccounts: AccountByRole[] = [];
        for (let page = 1; page <= 10; page++) {
          const accounts = await adminApi.getAllAccounts(page, 10);
          allAccounts.push(...accounts);
          if (accounts.length < 10) break;
        }
        
        const map = new Map<number, string>();
        allAccounts.forEach(acc => {
          map.set(acc.accountId, acc.email);
        });
        setAccountMap(map);
      } catch (err) {
        console.warn("⚠️ Không thể lấy danh sách accounts để map email:", err);
      }
    };

    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const logs = await adminApi.getAuditLogs(currentPage, pageSize);
        setAuditLogs(logs);
        setTotalRecords(logs.length); // Tạm thời dùng length, BE chưa trả về totalRecords
      } catch (err: any) {
        console.error("Error fetching audit logs:", err);
        setError("Không thể tải log hoạt động");
        if (err.response) {
          console.error("⚠️ BE Response Error:", err.response.status, err.response.data);
        } else if (err.code === "ERR_NETWORK") {
          console.error("⚠️ BE Network Error: Backend có thể không chạy hoặc endpoint /api/Audit/audit-logs không tồn tại");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsForMapping();
    fetchAuditLogs();
  }, [currentPage, pageSize]);

  const handleLogout = () => {
    storage.clearAuth();
    navigate('/auth/login');
  };

  const goDashboard = () => navigate('/admin');

  const getIcon = (action: string) => {
    if (action?.toLowerCase().includes('create') || action?.toLowerCase().includes('tạo')) {
      return Plus;
    } else if (action?.toLowerCase().includes('update') || action?.toLowerCase().includes('cập nhật')) {
      return Settings;
    } else if (action?.toLowerCase().includes('view') || action?.toLowerCase().includes('xem')) {
      return Eye;
    }
    return Activity;
  };

  const formatDescription = (log: AuditLog) => {
    const userEmail = accountMap.get(log.accountId) || `Account ID: ${log.accountId}`;
    let displayDescription = log.description || log.action || 'Hoạt động không có mô tả';
    
    if (log.description && log.description.includes(`account with ID:${log.accountId}`)) {
      displayDescription = displayDescription.replace(
        `account with ID:${log.accountId}`,
        userEmail
      );
    } else if (log.description && log.description.includes(`by account with ID:${log.accountId}`)) {
      displayDescription = displayDescription.replace(
        `by account with ID:${log.accountId}`,
        `bởi ${userEmail}`
      );
    }
    
    return displayDescription;
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Admin Navbar */}
      <div className="bg-white border-b border-secondary-200">
        <div className="px-6 py-3 flex items-center justify-between">
          <button onClick={goDashboard} className="flex items-center gap-2 cursor-pointer" title="Về Dashboard">
            <div className="w-8 h-8 rounded-lg bg-error-100 flex items-center justify-center">
              <span className="text-error-600 font-bold">A</span>
            </div>
            <span className="text-base font-semibold text-secondary-900">Tất cả hoạt động</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-secondary-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-secondary-500">{user?.email || 'admin@example.com'}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-error-600" onClick={handleLogout}>Đăng xuất</Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <Button variant="outline" className="btn-outline" onClick={goDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Trở về Dashboard
          </Button>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900">Tất cả hoạt động</h3>
            <p className="text-sm text-secondary-600">Xem toàn bộ log hoạt động trong hệ thống</p>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
                <span className="ml-3 text-secondary-600">Đang tải log...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-error-600 mb-2">⚠️ {error}</p>
                <p className="text-xs text-secondary-500">Vui lòng kiểm tra console để xem chi tiết lỗi BE</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-secondary-600 mb-2">⚠️ Không có log hoạt động</p>
                <p className="text-xs text-secondary-500">BE có thể trả về mảng rỗng hoặc endpoint chưa sẵn sàng</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {auditLogs.map((log, idx) => {
                    const Icon = getIcon(log.action);
                    const displayDescription = formatDescription(log);

                    return (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-secondary-900 text-sm font-medium">
                              {displayDescription}
                            </div>
                            <div className="text-secondary-500 text-xs mt-1">
                              {log.creatAt ? new Date(log.creatAt).toLocaleString('vi-VN') : 'Không có thời gian'}
                              {log.ipAddress && ` • IP: ${log.ipAddress}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                  <div className="text-sm text-secondary-700">
                    Trang {currentPage} / {totalPages > 0 ? totalPages : 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={auditLogs.length < pageSize || loading}
                    >
                      Sau <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

