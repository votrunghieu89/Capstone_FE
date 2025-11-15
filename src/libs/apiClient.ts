import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "https://localhost:7126/api", // BE đang chạy HTTP
      timeout: 30000, // Tăng timeout lên 30 giây
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Public endpoints that don't need authentication
        const publicEndpoints = [
          "/Auth/login",
          "/Auth/registerStudent",
          "/Auth/registerTeacher",
          "/Auth/send_otp_student",
          "/Auth/send_otp_teacher",
          "/Auth/checkEmail",
          "/Auth/verifyOTP",
          "/Auth/resetPasswordOTP",
          "/Auth/googleLoginStudent",
          "/Auth/googleLoginTeacher",
        ];

        const isPublicEndpoint = publicEndpoints.some((endpoint) =>
          config.url?.includes(endpoint)
        );

        if (!isPublicEndpoint) {
          const token = localStorage.getItem("access_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Request with token:", token.substring(0, 20) + "...");
          } else {
            console.warn("No token found for request:", config.url);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        // Log detailed error information
        if (error.code === "ECONNABORTED") {
          console.error("Request timeout:", error.config?.url);
        } else if (error.code === "ERR_NETWORK") {
          console.error(
            "Network error - Backend may not be running:",
            error.config?.url
          );
        } else if (error.response) {
          console.error(
            "Response error:",
            error.response.status,
            error.config?.url
          );
        }

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          console.log("Got 401, attempting to refresh token...");

          try {
            const refreshToken = localStorage.getItem("refresh_token");
            const userStr = localStorage.getItem("user");

            if (refreshToken && userStr) {
              const user = JSON.parse(userStr);
              const accountId = parseInt(user.id);

              console.log("Refreshing token for accountId:", accountId);

              const response = await this.client.post("/Auth/accessToken", {
                accountId,
                refreshToken,
              });

              const { accessToken } = response.data;
              localStorage.setItem("access_token", accessToken);

              console.log("Token refreshed successfully");

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            } else {
              console.error("No refresh token or user found");
              throw new Error("No refresh token");
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            console.error("Token refresh failed:", refreshError);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");

            // Only redirect if not on public pages
            const publicPaths = [
              "/",
              "/auth/login",
              "/auth/register",
              "/auth/forgot",
              "/browse",
              "/quiz/preview",
            ];
            const currentPath = window.location.pathname;
            const isPublicPage = publicPaths.some((path) =>
              currentPath.startsWith(path)
            );

            if (!isPublicPage) {
              window.location.href = "/auth/login";
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
