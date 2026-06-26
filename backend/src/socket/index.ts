import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { SOCKET_EVENTS } from '../utils/constants';

let io: Server | null = null;

interface AuthedSocket extends Socket {
  user?: JwtPayload;
}

/** Room helpers — keep names consistent between server emitters and clients. */
export const rooms = {
  user: (id: string) => `user:${id}`,
  restaurant: (id: string) => `restaurant:${id}`,
  rider: (id: string) => `rider:${id}`,
  order: (id: string) => `order:${id}`,
  admin: () => 'admin',
};

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: { origin: env.clientOrigins.includes('*') ? '*' : env.clientOrigins },
  });

  // Optional auth via handshake token; unauthenticated sockets can still track public order rooms.
  io.use((socket: AuthedSocket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers.authorization?.replace('Bearer ', '') ?? undefined);
    if (token) {
      try {
        socket.user = verifyAccessToken(token);
      } catch {
        /* allow as anonymous tracker */
      }
    }
    next();
  });

  io.on('connection', (socket: AuthedSocket) => {
    // Auto-join personal rooms based on token.
    if (socket.user) {
      const { sub, role, restaurantId } = socket.user;
      socket.join(rooms.user(sub));
      if (role === 'restaurant' && restaurantId) socket.join(rooms.restaurant(restaurantId));
      if (role === 'rider') socket.join(rooms.rider(sub));
      if (role === 'admin') socket.join(rooms.admin());
    }

    // Explicit room joins (e.g. customer tracking a specific order).
    socket.on(SOCKET_EVENTS.JOIN, (payload: { room?: string; orderId?: string }) => {
      if (payload?.orderId) socket.join(rooms.order(payload.orderId));
      if (payload?.room) socket.join(payload.room);
    });

    // Rider streams location updates while delivering.
    socket.on(SOCKET_EVENTS.RIDER_LOCATION, (payload: { orderId: string; lat: number; lng: number }) => {
      if (!payload?.orderId) return;
      io?.to(rooms.order(payload.orderId)).emit(SOCKET_EVENTS.RIDER_LOCATION, payload);
    });

    socket.on('disconnect', () => {
      /* no-op; socket.io handles room cleanup */
    });
  });

  logger.info('Socket.IO initialised');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialised. Call initSocket() first.');
  return io;
}
