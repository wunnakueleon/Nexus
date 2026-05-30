import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import type { OperatorState, SidebarItem } from '../types/shared.types';
import { ROLES } from '../utils/roles';
import Sidebar from './Sidebar';
import Icon from './Icon';

interface ShellInnerProps {
  operator: OperatorState;
}

const ShellInner: React.FC<ShellInnerProps> = ({ operator }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = ROLES.find(r => r.id === operator.role)!;
  const items: SidebarItem[] = Object.entries(role.map())
    .filter(([, s]) => !s.hidden)
    .map(([id, s]) => ({ id, label: s.label, icon: s.icon, path: s.path, end: s.end }));

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        feature={role.feature}
        featureIcon={role.icon}
        basePath={role.basePath}
        items={items}
        worldId={operator.worldId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 md:ml-60 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-line bg-bg-secondary sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-fg-secondary hover:text-fg p-1 rounded"
            aria-label="Open menu"
          >
            <Icon name="list" size={20} />
          </button>
          <span className="text-sm font-semibold text-fg nx-uppercase tracking-wide">
            {role.feature}
          </span>
          {operator.worldId && (
            <span className="ml-auto text-xs font-mono text-fg-muted">
              {operator.worldId}
            </span>
          )}
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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