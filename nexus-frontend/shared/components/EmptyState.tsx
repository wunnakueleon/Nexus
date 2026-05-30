import React from 'react';
import Icon from './Icon';

interface EmptyStateProps {
  icon?: string;
  text: string;
  sub?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'box', text, sub }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="w-12 h-12 flex items-center justify-center border border-line rounded text-fg-muted mb-3">
      <Icon name={icon} size={22} />
    </div>
    <div className="text-sm text-fg-secondary">{text}</div>
    {sub && <div className="text-xs text-fg-muted mt-1 font-mono">{sub}</div>}
  </div>
);

export default EmptyState;
