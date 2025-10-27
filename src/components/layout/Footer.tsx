import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-0 mt-auto border-t border-secondary-200 bg-secondary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo & Description */}
          <div className="md:col-span-1">
            <Logo size="md" />
            <p className="text-sm text-secondary-700 mt-3">
              EduQuiz là nền tảng học tập tương tác giúp học sinh và giáo viên
              tạo, chia sẻ, và tham gia các bài quiz một cách thú vị.
            </p>
            <p className="text-xs text-secondary-500 mt-4">
              © {new Date().getFullYear()} EduQuiz. All rights reserved.
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h4 className="font-semibold text-secondary-900 mb-3">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/login"
                  className="text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/register"
                  className="text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-semibold text-secondary-900 mb-3">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-secondary-700">
              <li>Email: support@eduquiz.vn</li>
              <li>Hotline: 0123 456 789</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
