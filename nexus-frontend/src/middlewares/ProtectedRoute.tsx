import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../shared/hooks/useApp';
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

  useEffect(() => {
    if (!operator?.username) return;
    let active = true;

    const checkStatus = async () => {
      try {
        const updated = await fetchAuthStatus(operator.username!);
        if (!active) return;
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
    };

    void checkStatus();
    const timer = window.setInterval(checkStatus, 20000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [operator?.username, operator?.status, navigate, setOperator]);

  if (!operator) return <Navigate to="/" replace />;
  if (statusPath) return <Navigate to={statusPath} replace />;
  const required = ROLE_MAP[role];
  if (required && operator.role !== required) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
