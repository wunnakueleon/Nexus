import React from 'react';

interface PageHeaderProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, sub, actions }) => (
  <div className="flex flex-wrap items-end justify-between mb-6 gap-x-4 gap-y-3">
    <div className="min-w-0">
      <h1 className="text-lg sm:text-xl font-semibold text-fg nx-uppercase tracking-wide">{title}</h1>
      {sub && <p className="text-sm text-fg-secondary mt-1">{sub}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
