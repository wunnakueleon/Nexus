import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { roleRoom, userRoom, type EventName } from "./events";

/**
 * Singleton Socket.IO server. Created once in index.ts via initRealtime() and
 * reused by controllers through the emit* helpers below. Kept module-local so
 * controllers depend only on the thin emit API, never on the server instance.
 */
let io: SocketIOServer | null = null;

interface HandshakeAuth {
  role?: string;
  username?: string;
}

/**
 * Attach a Socket.IO server to the existing HTTP server.
 *
 * Identity comes from the handshake `auth` payload the client sends on connect.
 * There is no JWT layer in this codebase yet (auth is a dev stub), so we trust
 * the client-supplied role/username purely for *room routing* — these rooms only
 * gate which non-sensitive "something changed, refetch" signals a client hears.
 * Authorization for the underlying data still happens on the REST endpoints.
 */
export function initRealtime(server: HttpServer, allowOrigin: string): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: { origin: allowOrigin, credentials: true },
  });

  io.on("connection", (socket: Socket) => {
    const { role, username } = (socket.handshake.auth ?? {}) as HandshakeAuth;

    // Topic room for the operator's role — the bulk of updates flow here.
    if (role) socket.join(roleRoom(role));
    // Personal room for account-status notifications (approval / revoke).
    if (username) socket.join(userRoom(username));

    // Allow a client to re-scope at runtime (e.g. after switching operator)
    // without reconnecting. Idempotent: joining a room twice is a no-op.
    socket.on("realtime:identify", (next: HandshakeAuth) => {
      if (next?.role) socket.join(roleRoom(next.role));
      if (next?.username) socket.join(userRoom(next.username));
    });
  });

  return io;
}

/** Emit an event to a single room. No-ops safely if realtime isn't initialised. */
export function emitTo(room: string, event: EventName, payload?: unknown): void {
  io?.to(room).emit(event, payload ?? null);
}

/** Emit an event to several rooms at once (deduped by Socket.IO). */
export function emitToRooms(rooms: string[], event: EventName, payload?: unknown): void {
  if (!io || rooms.length === 0) return;
  io.to(rooms).emit(event, payload ?? null);
}
