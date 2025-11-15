import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-success-50 border-success-500 text-success-800",
    error: "bg-error-50 border-error-500 text-error-800",
    info: "bg-primary-50 border-primary-500 text-primary-800",
    warning: "bg-warning-50 border-warning-500 text-warning-800",
  };

  return (
    <div className={`relative animate-slide-in-right`} style={{ zIndex: 10000 }}>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-2xl backdrop-blur-sm min-w-[300px] max-w-[500px] ${styles[type]}`}
        style={{ 
          zIndex: 10000,
          position: 'relative',
          backgroundColor: type === 'error' ? '#fee2e2' : type === 'success' ? '#d1fae5' : type === 'warning' ? '#fef3c7' : '#dbeafe'
        }}
      >
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="font-medium flex-1 break-words">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Đóng thông báo"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container để quản lý nhiều toast
interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;
  
  const container = document.body;
  
  return createPortal(
    <div 
      className="fixed top-4 right-4 space-y-2 pointer-events-none" 
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        maxWidth: '500px',
        width: 'auto'
      }}
    >
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          style={{ 
            animationDelay: `${index * 100}ms`,
            zIndex: 99999 + index
          }}
          className="pointer-events-auto"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>,
    container
  );
};

// Hook để sử dụng toast
export const useToast = () => {
  const [toasts, setToasts] = React.useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);

  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    console.log("🔔 showToast called:", { id, message, type });
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }];
      console.log("🔔 New toasts array:", newToasts);
      return newToasts;
    });
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    success: React.useCallback((message: string) => showToast(message, "success"), [showToast]),
    error: React.useCallback((message: string) => showToast(message, "error"), [showToast]),
    info: React.useCallback((message: string) => showToast(message, "info"), [showToast]),
    warning: React.useCallback((message: string) => showToast(message, "warning"), [showToast]),
  };
};
