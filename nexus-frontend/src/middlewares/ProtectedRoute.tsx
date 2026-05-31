import { useCallback, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../shared/hooks/useApp';
import { useSocketEvent } from '../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../shared/realtime/events';
import { fetchAuthStatus } from '../modules/auth/apis/auth.api';

const ROLE_MAP: Record<string, string> = {
  admin:               'Admin',
  resource_manager:    'Resource Manager',
  transit_officer:     'Transit Officer',
  commercial_citizen:  'Commercial Citizen',
};

const ProtectedRoute = ({ role }: { role: string }) => {
  const { operator, setOperator } = useApp();
  const navigate = useNavigate();
  const statusPath = operator?.status === 'pending'
    ? '/pending-approval'
    : operator?.status === 'rejected'
      ? '/account-rejected'
      : operator?.status === 'revoked'
        ? '/access-revoked'
        : null;

  const checkStatus = useCallback(async () => {
    if (!operator?.username) return;
    try {
      const updated = await fetchAuthStatus(operator.username);
      if (updated.status !== operator.status) {
        setOperator(prev => (prev ? { ...prev, status: updated.status } : prev));
        if (updated.status !== 'active') {
          const nextPath = updated.status === 'pending'
            ? '/pending-approval'
            : updated.status === 'rejected'
              ? '/account-rejected'
              : '/access-revoked';
          navigate(nextPath, { replace: true });
        }
      }
    } catch {
      // Ignore status check failures to avoid blocking navigation.
    }
  }, [operator?.username, operator?.status, navigate, setOperator]);

  // Real-time: the moment an admin revokes/reinstates this account, the server
  // pushes auth:status to our personal room and we react instantly. The 20s
  // interval below stays as a fallback in case a socket message is missed.
  useSocketEvent(SOCKET_EVENTS.AuthStatusChanged, () => { void checkStatus(); });

  useEffect(() => {
    if (!operator?.username) return;
    void checkStatus();
    const timer = window.setInterval(() => { void checkStatus(); }, 20000);
    return () => window.clearInterval(timer);
  }, [operator?.username, checkStatus]);

  if (!operator) return <Navigate to="/" replace />;
  if (statusPath) return <Navigate to={statusPath} replace />;
  const required = ROLE_MAP[role];
  if (required && operator.role !== required) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
