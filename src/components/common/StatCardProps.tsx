// src/components/common/StatCard.tsx

import { LucideIcon } from 'lucide-react';
// KHÔNG IMPORT Card - chỉ dùng div

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export function StatCard({ title, value, icon: Icon, iconColor, iconBgColor }: StatCardProps) {
  return (
    <div className="card p-6"> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}