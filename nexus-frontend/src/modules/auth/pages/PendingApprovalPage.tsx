import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card';
import Wordmark from '../../../shared/components/Wordmark';
import { useApp } from '../../../shared/hooks/useApp';
import { useSocketEvent } from '../../../shared/hooks/useSocketEvent';
import { SOCKET_EVENTS } from '../../../shared/realtime/events';
import { fetchAuthStatus } from '../apis/auth.api';
import type { AuthResponse } from '../types/auth.types';

const ROLE_LABELS: Record<AuthResponse['role'], string> = {
  admin: 'Admin',
  resource_manager: 'Resource Manager',
  transit_officer: 'Transit Officer',
  commercial_citizen: 'Commercial Citizen',
};

const ROLE_PATHS: Record<AuthResponse['role'], string> = {
  admin: '/admin/approval-queue',
  resource_manager: '/resource-exchange/overview',
  transit_officer: '/cargo-logistics/shipments',
  commercial_citizen: '/commercial-marketplace/browse',
};

const WORLD_NAME_TO_ID: Record<string, string> = {
  GloriaVenus: 'GLV',
  NanPtune: 'NPT',
  MinUranus: 'MNU',
  WunnaMars: 'WNM',
};

const PendingApprovalPage = () => {
  const { operator, setOperator } = useApp();
  const navigate = useNavigate();

  // The admin council just acted on this account — confirm the new status from
  // the server, refresh the session, and route the operator onward instantly.
  const handleStatusChange = useCallback(async () => {
    if (!operator?.username) return;
    try {
      const response = await fetchAuthStatus(operator.username);
      const worldId = response.worldName ? WORLD_NAME_TO_ID[response.worldName] ?? null : null;
      setOperator({
        role: ROLE_LABELS[response.role],
        worldId,
        name: response.name,
        username: operator.username,
        status: response.status,
      });

      if (response.status === 'active') navigate(ROLE_PATHS[response.role], { replace: true });
      else if (response.status === 'rejected') navigate('/account-rejected', { replace: true });
      else if (response.status === 'revoked') navigate('/access-revoked', { replace: true });
    } catch {
      // Stay on the pending page if the status check fails.
    }
  }, [operator?.username, setOperator, navigate]);

  useSocketEvent(SOCKET_EVENTS.AuthStatusChanged, handleStatusChange);

  return (
    <div className="min-h-screen bg-bg nx-grid flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Wordmark size="lg" />

        <Card className="w-full p-6 sm:p-7 text-center">
          <div className="text-sm font-semibold text-amber nx-uppercase mb-3">Approval Pending</div>
          <p className="text-sm text-fg-secondary">
            Your account is awaiting approval from the admin council. You will receive access once your request is reviewed.
          </p>
        </Card>

        <Link to="/signin" className="text-xs font-mono text-fg-muted hover:text-amber transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
