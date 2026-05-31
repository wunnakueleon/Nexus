import { useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import type { SocketEvent } from '../realtime/events';

/**
 * Subscribe to one or more socket events and run `handler` when any of them
 * fires. Designed for the "refetch on change" pattern: pass a page's fetch
 * function and the events that should trigger it.
 *
 * Cleanup & leak-safety:
 *  - Listeners are removed on unmount and whenever the socket or event set
 *    changes, so a component never accumulates duplicate handlers.
 *  - The latest `handler` is read through a ref, so callers may pass an inline
 *    function without forcing a re-subscribe (and without stale closures).
 */
export function useSocketEvent(
  events: SocketEvent | SocketEvent[],
  handler: (payload?: unknown) => void,
): void {
  const socket = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  // Stabilise the dependency: join the (small, fixed) event list into a key so
  // the effect re-runs only when the actual set of events changes.
  const eventList = Array.isArray(events) ? events : [events];
  const eventsKey = eventList.join('|');

  useEffect(() => {
    if (!socket) return;

    const listener = (payload?: unknown) => handlerRef.current(payload);
    const names = eventsKey.split('|');
    names.forEach(name => socket.on(name, listener));

    return () => {
      names.forEach(name => socket.off(name, listener));
    };
  }, [socket, eventsKey]);
}
