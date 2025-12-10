// src/components/common/Tabs.tsx

import React, { createContext, useContext, useState } from 'react';

// === 1. TẠO CONTEXT CHO TABS ===
interface TabsContextType {
  activeValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    // Thông báo lỗi nếu TabsTrigger được sử dụng ngoài Tabs chính
    throw new Error('TabsTrigger and TabsList must be used within a Tabs component.');
  }
  return context;
};

// === 2. INTERFACES ===
interface TabsProps {
  value: string; // Giá trị đang được chọn (active tab)
  onValueChange: (value: string) => void; // Hàm thay đổi giá trị
  className?: string;
  children: React.ReactNode;
}

interface TabContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// === 3. TABS CONTAINER (Provider) ===
export function Tabs({ children, value, onValueChange, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeValue: value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// === 4. TABS LIST (Danh sách các nút Trigger) ===
export function TabsList({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex border-b border-gray-200 space-x-2 ${className}`}>
      {children}
    </div>
  );
}

// === 5. TABS TRIGGER (Nút bấm) ===
// 🛑 ĐÃ SỬA LỖI TS(2741) VÌ KHÔNG CẦN TRUYỀN onClick RỜI NỮA 🛑
export function TabsTrigger({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) {
  const { activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;
  
  return (
    <button
      // Gọi hàm từ Context
      onClick={() => onValueChange(value)} 
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
}

// === 6. TABS CONTENT (Nội dung) ===
// 🛑 ĐÃ SỬA LỖI THIẾU EXPORT TRONG BƯỚC TRƯỚC 🛑
export function TabsContent({ value, children, className }: TabContentProps) {
  const { activeValue } = useTabsContext();
  
  return activeValue === value ? <div className={`pt-4 ${className}`}>{children}</div> : null;
}