import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'rank'; // Bạn có thể thêm nhiều variant khác
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  
  let baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variantClasses = {
    'default': 'bg-blue-100 text-blue-800',
    'secondary': 'bg-gray-100 text-gray-800',
    'rank': 'bg-yellow-500 text-white shadow-md' // Dùng cho Rank #1, như trong Participants Tab
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}