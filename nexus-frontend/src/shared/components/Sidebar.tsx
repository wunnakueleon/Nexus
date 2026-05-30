import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import type { SidebarItem } from '../types/shared.types';
import Button from './Button';
import Icon from './Icon';
import WorldBadge from './WorldBadge';
import Wordmark from './Wordmark';

interface SidebarProps {
  feature: string;
  featureIcon: string;
  basePath: string;
  items: SidebarItem[];
  worldId?: string | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  feature, featureIcon, basePath, items, worldId,
  isOpen = false, onClose,
}) => {
  const { operator, setOperator } = useApp();
  const navigate = useNavigate();
  if (!operator) return null;

  const handleSignOut = () => {
    setOperator(null);
    navigate('/', { replace: true });
  };

  return (
    <aside
      className={`
        w-60 shrink-0 bg-bg-secondary border-r border-line flex flex-col
        fixed inset-y-0 left-0 z-30
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="px-5 py-5 border-b border-line flex items-center justify-between">
        <Wordmark />
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden text-fg-secondary hover:text-fg p-1 rounded"
          aria-label="Close menu"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      {/* Feature + world */}
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-center gap-2 text-amber">
          <Icon name={featureIcon} size={16} />
          <span className="text-[12px]/[1.45] font-semibold nx-uppercase tracking-wide">{feature}</span>
        </div>
        {worldId && (
          <div className="mt-2">
            <WorldBadge worldId={worldId} size="sm" />
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {items.map(item => (
          <NavLink
            key={item.id}
            to={`${basePath}/${item.path}`}
            end={item.end ?? false}
            onClick={onClose}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-5 py-2.5 text-[12px]/[1.45] font-medium nx-uppercase transition-colors relative ${
                isActive
                  ? 'text-fg bg-bg-tertiary'
                  : 'text-fg-secondary hover:text-fg hover:bg-bg-tertiary/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber" />}
                <Icon name={item.icon} size={16} className={isActive ? 'text-amber' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-line">
        <div className="text-[12px]/[1.45] font-semibold text-fg">{operator.name}</div>
        <div className="text-[11px]/[1.45] text-fg-muted font-mono mb-3">{operator.role}</div>
        <Button size="sm" variant="outline" className="w-full" icon="power" onClick={handleSignOut}>
          Switch Operator
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
