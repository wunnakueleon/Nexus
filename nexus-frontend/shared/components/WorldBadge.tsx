import React from 'react';
import { useApp } from '../hooks/useApp';

interface WorldBadgeProps {
  worldId: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const WorldBadge: React.FC<WorldBadgeProps> = ({ worldId, size = 'md', dot = true }) => {
  const { worldById } = useApp();
  const w = worldById(worldId);
  const sz = size === 'sm' ? 'text-[10px]/[1.45] px-1.5 py-0.5' : 'text-[11px]/[1.45] px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded font-semibold ${sz}`} style={{ color: w.color, background: w.dim }}>
      {dot && <span className="w-1.5 h-1.5 rounded-sm" style={{ background: w.color }} />}
      {w.name}
    </span>
  );
};

export default WorldBadge;
