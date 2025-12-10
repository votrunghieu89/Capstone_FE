import { io, Socket } from "socket.io-client";

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(url?: string): Socket {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const socketUrl =
      url ||
      (import.meta as any).env?.VITE_SOCKET_URL ||
      "http://localhost:5000";

    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {});

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Host events
  onHostEvents() {
    if (!this.socket) return;

    this.socket.on("room:created", (data) => {});

    this.socket.on("room:join", (data) => {});

    this.socket.on("room:leave", (data) => {});

    this.socket.on("answer:submit", (data) => {});
  }

  // Player events
  onPlayerEvents() {
    if (!this.socket) return;

    this.socket.on("question:start", (data) => {});

    this.socket.on("question:end", (data) => {});

    this.socket.on("score:update", (data) => {});

    this.socket.on("leaderboard:update", (data) => {});

    this.socket.on("room:end", (data) => {});
  }

  // Emit events
  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketManager = new SocketManager();
