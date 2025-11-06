import React from 'react';

// Card dùng Tailwind CSS cơ bản, giả định bạn có class 'shadow-lg' và 'rounded-xl'
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

// Nếu bạn cần CardHeader/CardContent:
export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={`p-4 border-b border-gray-100 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <h4 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h4>
);

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);