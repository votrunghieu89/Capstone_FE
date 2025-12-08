import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { router } from "./libs/router";
import { queryClient } from "./libs/queryClient";
import "./index.css";
import { useNotificationHub } from "./hooks/useNotificationHub";
import { tokenRefreshService } from "./libs/tokenRefreshService";
import { storage } from "./libs/storage";

function App() {
  useNotificationHub();

  // Khởi động auto-refresh token service
  useEffect(() => {
    // Chỉ start nếu user đã login
    const user = storage.getUser();
    const token = storage.getToken();

    if (user && token) {
      tokenRefreshService.start();
    }

    // Cleanup khi unmount
    return () => {
      tokenRefreshService.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
