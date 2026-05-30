import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import type { OperatorState, SidebarItem } from '../types/shared.types';
import { ROLES } from '../utils/roles';
import Sidebar from './Sidebar';

interface ShellInnerProps {
  operator: OperatorState;
}

const ShellInner: React.FC<ShellInnerProps> = ({ operator }) => {
  const role = ROLES.find(r => r.id === operator.role)!;
  const items: SidebarItem[] = Object.entries(role.map())
    .filter(([, s]) => !s.hidden)
    .map(([id, s]) => ({ id, label: s.label, icon: s.icon, path: s.path, end: s.end }));

  return (
    <div className="flex min-h-screen">
      <Sidebar
        feature={role.feature}
        featureIcon={role.icon}
        basePath={role.basePath}
        items={items}
        worldId={operator.worldId}
      />
      <main className="flex-1 ml-60 min-w-0">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const Shell: React.FC = () => {
  const { operator } = useApp();
  if (!operator) return <Navigate to="/" replace />;
  return <ShellInner operator={operator} />;
};

export default Shell;
