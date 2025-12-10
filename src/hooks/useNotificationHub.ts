import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import toast from "react-hot-toast";
import { storage } from "../libs/storage";

const normalizeBaseUrl = (value?: string): string | null => {
  if (!value?.trim()) return null;
  return value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "")
    .replace(/\/+$/, "");
};

const buildHubCandidates = (): string[] => {
  const candidates = new Set<string>();
  const explicit = normalizeBaseUrl(
    import.meta.env.VITE_SIGNALR_BASE_URL as string | undefined
  );
  const fallback = normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL as string | undefined
  );

  if (explicit) candidates.add(explicit);
  if (fallback) candidates.add(fallback);

  [
    "https://localhost:7126",
    "http://localhost:7126",
    "https://localhost:5119",
    "http://localhost:5119",
  ].forEach((url) => candidates.add(url));

  return Array.from(candidates);
};

const parseAccountId = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const emitNotificationEvent = (message: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("notification:received", {
      detail: { message },
    })
  );
};

export const useNotificationHub = () => {
  const connectionRef = useRef<HubConnection | null>(null);
  const accountRef = useRef<number | null>(null);
  const hubUrlRef = useRef<string | null>(null);

  const hubCandidates = useMemo(() => buildHubCandidates(), []);

  const stopConnection = useCallback(async () => {
    if (!connectionRef.current) return;

    try {
      await connectionRef.current.stop();
    } catch (error) {
    } finally {
      connectionRef.current = null;
      accountRef.current = null;
    }
    hubUrlRef.current = null;
  }, []);

  const setupConnection = useCallback(async () => {
    const user = storage.getUser();
    const token = storage.getToken();
    const accountId =
      parseAccountId(user?.accountId) ??
      parseAccountId(user?.id ?? user?.userId);

    if (!accountId || !token) {
      await stopConnection();
      return;
    }

    if (
      connectionRef.current &&
      connectionRef.current.state === HubConnectionState.Connected &&
      accountRef.current === accountId
    ) {
      return;
    }

    await stopConnection();

    let lastError: unknown = null;

    for (const baseUrl of hubCandidates) {
      const hubUrl = `${baseUrl}/NotificationHub`;
      const connection = new HubConnectionBuilder()
        .withUrl(`${hubUrl}?AccountId=${accountId}`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("GroupNotification", (message: string) => {
        const safeMessage = message?.trim()
          ? message
          : "Bạn có thông báo mới từ lớp học";
        toast.success(safeMessage);
        emitNotificationEvent(safeMessage);
      });

      connection.onclose((error) => {});

      connection.onreconnected(() => {
        toast.success("Đã kết nối lại thông báo realtime");
      });

      try {
        await connection.start();
        connectionRef.current = connection;
        accountRef.current = accountId;
        hubUrlRef.current = hubUrl;
        return;
      } catch (error) {
        lastError = error;
        await connection.stop().catch(() => {});
      }
    }

    toast.error("Không thể kết nối thông báo realtime");
  }, [stopConnection, hubCandidates]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setupConnection();

    const handleUserUpdate = () => {
      setupConnection();
    };

    const handleLogout = () => {
      stopConnection();
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("auth:logout", handleLogout);
      stopConnection();
    };
  }, [setupConnection, stopConnection]);
};
