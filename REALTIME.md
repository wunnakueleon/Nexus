# Real-Time Updates (Socket.IO)

Nexus now pushes updates to clients so dynamic lists, queues, dashboards and
status pages stay current **without a manual refresh**. Static/informational
pages are intentionally left alone.

## How it works (architecture)

```
REST mutation (controller)  ──emit──►  Socket.IO room  ──signal──►  page listener  ──►  page's existing refetch
```

1. A user performs an action through the **existing REST API** (unchanged).
2. After the DB write succeeds, the controller emits a tiny **signal event**
   (e.g. `trade:updated`) to the relevant **room**.
3. Clients in that room receive the event and call the page's **existing fetch
   function** to re-pull the authoritative list from REST.

We deliberately push *signals, not data*. The REST response stays the single
source of truth, so there are no client-side merge/ordering bugs, payloads are
tiny, and traffic is far lower than polling (an event fires only when something
actually changed). Existing functionality is untouched — the socket layer is
purely additive.

### Identity & rooms

There is no JWT layer yet (auth is a dev stub), so on connect the client sends
its `role` and `username` in the Socket.IO handshake `auth`. The server places
each socket in:

- `role:<role>` — e.g. `role:admin`, `role:resource_manager` (topic room for a role's pages)
- `user:<username>` — personal room for account-status notifications

Authorization of the underlying data still happens on the REST endpoints; rooms
only gate which non-sensitive "something changed, refetch" signals a client hears.
Views already filter by world/user client-side, so a single role-wide signal is
sufficient and avoids fragile numeric-world-id routing.

### Event naming conventions

- Rooms: `<scope>:<id>` — `role:admin`, `user:dsarraf`
- Events: `<domain>:<action>` — `approval:created`, `trade:updated`, `auth:status`

Contract is defined once on each side and kept in sync:
- Backend: `nexus-backend/src/realtime/events.ts`
- Frontend: `nexus-frontend/src/shared/realtime/events.ts`

### Events

| Event              | Emitted to                              | Emitted when                                              |
|--------------------|------------------------------------------|-----------------------------------------------------------|
| `approval:created` | `role:admin`                             | a new signup enters the pending queue                     |
| `approval:updated` | `role:admin`                             | a pending request is approved/rejected                    |
| `user:updated`     | `role:admin`                             | a directory user is created/revoked/reinstated            |
| `code:updated`     | `role:admin`                             | an access code is generated or expired                    |
| `world:updated`    | `role:admin`                             | a world is edited, or a world request is created/resolved |
| `resource:updated` | `role:resource_manager`                  | a world's stock levels change                             |
| `trade:updated`    | `role:resource_manager` + `role:admin`   | a trade request is created/accepted/declined/cancelled/fulfilled |
| `shipment:updated` | `role:transit_officer` + `role:admin`    | a shipment is created/advanced/delivered/cancelled/flagged|
| `listing:updated`  | `role:commercial_citizen` + `role:admin` | a listing is posted/edited/removed or changes trade status|
| `offer:updated`    | `role:commercial_citizen`                | a trade offer is created/accepted/declined/withdrawn      |
| `auth:status`      | `user:<username>`                        | this account is approved/rejected/revoked/reinstated      |

(`*:updated` events are mirrored to `role:admin` where the Platform Overview
dashboard aggregates that domain's count.)

## Frontend usage

```tsx
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';

useSocketEvent(SOCKET_EVENTS.TradeUpdated, () => void fetchAll());
```

`useSocketEvent(events, handler)` subscribes on mount and **removes the listener
on unmount / when the event set or socket changes** — preventing duplicate
handlers and memory leaks. The handler is read through a ref, so inline
functions don't force a re-subscribe. The shared connection lives in
`SocketProvider` (`shared/context/SocketContext.tsx`) and is opened on login /
closed on logout (`connection.disconnect()` tears down every server-side
listener and room membership).

Pages refetch *quietly* on socket events (no loading spinner flash) via a
`silent` flag on their existing load function.

---

## Pages reviewed

### ✅ Converted to real-time

| Page / component                | Events listened                                                            |
|---------------------------------|----------------------------------------------------------------------------|
| Admin · Approval Queue          | `approval:created`, `approval:updated`, `user:updated`                     |
| Admin · User Directory          | `user:updated`, `approval:updated`, `world:updated`                        |
| Admin · Code Generation         | `code:updated`, `world:updated`                                            |
| Admin · World Management         | `world:updated`                                                           |
| Admin · Platform Overview        | approval/user/code/world/trade/shipment/listing updates (dashboard)       |
| Resource · Trade Dashboard       | `trade:updated`                                                           |
| Resource · Resource Overview     | `resource:updated`                                                        |
| Cargo · Shipment Board           | `shipment:updated`                                                        |
| Cargo · Shipment Detail          | `shipment:updated`                                                        |
| Cargo · Route Overview           | `shipment:updated`                                                        |
| Marketplace · Browse             | `listing:updated`                                                         |
| Marketplace · Listing Detail     | `listing:updated`                                                         |
| Marketplace · My Items           | `listing:updated`, `offer:updated`                                        |
| Marketplace · My Trades          | `offer:updated`                                                           |
| Pending Approval page            | `auth:status` (instant approve/reject → routes onward)                    |
| ProtectedRoute (all auth routes) | `auth:status` (instant revoke/reinstate; 20s poll kept as fallback)       |

**Why:** these show shared/multi-user data — queues, request statuses,
histories, dashboards, boards and tables — that another operator can change
while you are looking at it. Previously a manual refresh was required.

### ❌ Intentionally excluded

| Page                                   | Reason                                                            |
|----------------------------------------|------------------------------------------------------------------|
| Home / landing (`HomePage`)            | Static marketing/entry page; no live data.                       |
| Sign In / Sign Up                      | One-shot forms; nothing to keep in sync.                         |
| Rejected / Revoked pages               | Terminal status pages; no further updates expected.              |
| Post Item / Create Shipment / Request Trade / Trade Offer (form pages) | Write-only forms; they navigate to a list (which is live) on submit. |

These display static or single-use content, so a real-time subscription would
add connections and traffic without any benefit.

## Files added / changed

**Backend (added):** `src/realtime/events.ts`, `src/realtime/io.ts`
**Backend (changed):** `src/index.ts` (HTTP server + Socket.IO init) and the
auth / admin / resource-exchange / cargo-logistics / commercial-marketplace
controllers (emit after each mutation). `approval.model.ts` now returns the
applicant `username` so the server can target their personal room.

**Frontend (added):** `src/shared/realtime/events.ts`,
`src/shared/context/SocketContext.tsx`, `src/shared/hooks/useSocket.ts`,
`src/shared/hooks/useSocketEvent.ts`
**Frontend (changed):** `App.tsx` (mount `SocketProvider`), `ProtectedRoute.tsx`,
the auth forms + pending page, and the live pages listed above.

## Database / API changes

No schema changes. No breaking API changes. One additive field: the approval
resolve response now includes `username` (ignored by existing callers).
