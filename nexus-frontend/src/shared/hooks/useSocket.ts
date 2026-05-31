import { useContext } from 'react';
import type { Socket } from 'socket.io-client';
import { SocketContext } from '../context/SocketContext';

/**
 * Access the shared Socket.IO connection. Returns null when no operator is
 * signed in (the provider tears the socket down on logout).
 */
export const useSocket = (): Socket | null => useContext(SocketContext);
