import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { storage } from "./storage";

const normalizeBaseUrl = (value?: string): string | null => {
  if (!value?.trim()) return null;
  return value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "")
    .replace(/\/+$/, "");
};

export const buildQuizHubCandidates = (): string[] => {
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

export const createQuizHubConnection = (baseUrl: string): HubConnection => {
  if (!baseUrl) {
    throw new Error("Thiếu base URL để kết nối QuizHub");
  }

  const token = storage.getToken();
  const hubUrl = `${baseUrl.replace(/\/+$/, "")}/QuizHub`;

  const options = token ? { accessTokenFactory: () => token } : {};
const builder = new HubConnectionBuilder()
  .withUrl(hubUrl, options)
  .withAutomaticReconnect()
  .withServerTimeout(60_000)
  .withKeepAliveInterval(15_000)
  .configureLogging(LogLevel.Information);

  return builder.build();
};

let sharedConnection: HubConnection | null = null;

export const setSharedQuizHubConnection = (conn: HubConnection | null) => {
  sharedConnection = conn;
};

export const getSharedQuizHubConnection = (): HubConnection | null => {
  return sharedConnection;
};

