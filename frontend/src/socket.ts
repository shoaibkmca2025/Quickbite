import { io, Socket } from 'socket.io-client';
import { API_URL, tokenStore } from './api';

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const token = await tokenStore.get();
  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
