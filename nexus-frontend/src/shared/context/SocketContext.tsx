import React, { createContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useApp } from '../hooks/useApp';
import { ROLE_LABEL_TO_ENUM } from '../realtime/events';

/**
 * Holds the single shared Socket.IO connection for the authenticated session.
 * Null whenever no operator is signed in (the landing/auth pages need no socket).
 */
export const SocketContext = createContext<Socket | null>(null);

// The socket server shares the REST origin (Express + Socket.IO on one port).
const SOCKET_URL = import.meta.env.VITE_API_URL as string;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { operator } = useApp();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Identify by role enum + username so the server can place us in the right
  // rooms. Re-run only when identity actually changes to avoid churn.
  const role = operator ? ROLE_LABEL_TO_ENUM[operator.role] ?? '' : '';
  const username = operator?.username ?? '';

  useEffect(() => {
    // No operator → ensure there is no live connection.
    if (!username) {
      setSocket(null);
      return;
    }

    const connection = io(SOCKET_URL, {
      withCredentials: true,
      auth: { role, username },
      // A single multiplexed connection per tab; reconnects automatically.
      transports: ['websocket', 'polling'],
    });

    setSocket(connection);

    // One place to tear down: disconnect removes every server-side listener and
    // room membership for this socket, preventing leaks across logins.
    return () => {
      connection.removeAllListeners();
      connection.disconnect();
    };
    // Reconnect only when the identity changes (login, logout, role switch).
  }, [role, username]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
