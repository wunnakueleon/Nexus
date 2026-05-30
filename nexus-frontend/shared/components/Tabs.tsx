import React from 'react';

type TabItem = string | { id: string; label: string; count?: number };

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange }) => (
  <div className="flex items-center gap-1 border-b border-line">
    {tabs.map(t => {
      const id = typeof t === 'string' ? t : t.id;
      const label = typeof t === 'string' ? t : t.label;
      const count = typeof t === 'string' ? undefined : t.count;
      const on = active === id;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative text-xs font-semibold nx-uppercase px-4 py-2.5 -mb-px transition-colors ${on ? 'text-fg' : 'text-fg-muted hover:text-fg-secondary'}`}
        >
          {label}
          {count != null && <span className="ml-2 font-mono text-[11px]/[1.45] text-fg-muted">{count}</span>}
          {on && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-amber" />}
        </button>
      );
    })}
  </div>
);

export default Tabs;
