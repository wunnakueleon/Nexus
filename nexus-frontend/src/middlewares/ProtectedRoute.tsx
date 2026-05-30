import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../shared/hooks/useApp';

const ROLE_MAP: Record<string, string> = {
  admin:               'Admin',
  resource_manager:    'Resource Manager',
  transit_officer:     'Transit Officer',
  commercial_citizen:  'Commercial Citizen',
};

const ProtectedRoute = ({ role }: { role: string }) => {
  const { operator } = useApp();
  if (!operator) return <Navigate to="/" replace />;
  const required = ROLE_MAP[role];
  if (required && operator.role !== required) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
