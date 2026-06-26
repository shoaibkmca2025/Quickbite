import { io, Socket } from 'socket.io-client';
import { api } from './api';
import { tokenStore } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(api.baseUrl, {
    auth: { token: tokenStore.get() },
    transports: ['websocket'],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
