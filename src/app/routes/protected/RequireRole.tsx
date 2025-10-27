import React from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '../../../libs/storage';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: string[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ children, roles }) => {
  const user = storage.getUser();
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!roles.includes(user.role)) {
    const roleHome: Record<string, string> = {
      Admin: '/admin',
      Teacher: '/teacher',
      Student: '/student',
    };
    const fallback = roleHome[user.role] || '/';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
