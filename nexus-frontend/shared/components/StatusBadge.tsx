import React from 'react';
import { STATUS_MAP } from '../utils/constants';

interface StatusBadgeProps {
  status: string;
  pulse?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulse = false, className = '' }) => {
  const c = STATUS_MAP[status] ?? { t: '#8A95A5', b: '#1C2129' };
  return (
    <span
      className={`inline-flex items-center rounded text-[11px]/[1.45] font-semibold nx-uppercase px-2 py-0.5 whitespace-nowrap ${pulse ? 'animate-pulse-crit' : ''} ${className}`}
      style={{ color: c.t, background: c.b }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
