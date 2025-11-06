import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(url?: string): Socket {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const socketUrl = url || (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

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

    this.socket.on('room:created', (data) => {
      console.log('Room created:', data);
    });

    this.socket.on('room:join', (data) => {
      console.log('Player joined:', data);
    });

    this.socket.on('room:leave', (data) => {
      console.log('Player left:', data);
    });

    this.socket.on('answer:submit', (data) => {
      console.log('Answer submitted:', data);
    });
  }

  // Player events
  onPlayerEvents() {
    if (!this.socket) return;

    this.socket.on('question:start', (data) => {
      console.log('Question started:', data);
    });

    this.socket.on('question:end', (data) => {
      console.log('Question ended:', data);
    });

    this.socket.on('score:update', (data) => {
      console.log('Score updated:', data);
    });

    this.socket.on('leaderboard:update', (data) => {
      console.log('Leaderboard updated:', data);
    });

    this.socket.on('room:end', (data) => {
      console.log('Room ended:', data);
    });
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
