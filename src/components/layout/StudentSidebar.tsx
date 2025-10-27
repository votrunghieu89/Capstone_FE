import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  History, 
  LogOut, 
  Settings,
  BookOpen,
  User
} from 'lucide-react';
import { Button } from '../common/Button';
import { storage } from '../../libs/storage';

export const StudentSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = storage.getUser();

  const menuItems = [
    {
      name: 'Trang chủ',
      path: '/student',
      icon: Home,
    },
    {
      name: 'Lớp học',
      path: '/student/classes',
      icon: Users,
    },
    {
      name: 'Lịch sử',
      path: '/student/history',
      icon: History,
    },
  ];

  const handleLogout = () => {
    storage.clearAuth();
    navigate('/auth/login');
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-secondary-900">QuizMaster</h2>
            <p className="text-xs text-secondary-500">Học sinh</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-900">{user?.name || 'Học sinh'}</p>
            <p className="text-xs text-secondary-500">{user?.email || 'student@example.com'}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => navigate('/profile')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-error-600 hover:text-error-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
};
