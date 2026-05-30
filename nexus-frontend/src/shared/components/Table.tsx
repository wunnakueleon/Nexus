import React from 'react';

type TableHeader = string | { label: string; align?: 'left' | 'right'; w?: string };

interface TableProps {
  headers: TableHeader[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => (
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-line">
        {headers.map((h, i) => {
          const label = typeof h === 'string' ? h : h.label;
          const align = typeof h === 'string' ? 'left' : (h.align ?? 'left');
          const w = typeof h === 'string' ? undefined : h.w;
          return (
            <th
              key={i}
              className={`text-[12px]/[1.45] font-medium text-fg-secondary nx-uppercase py-2.5 px-3 ${align === 'right' ? 'text-right' : 'text-left'}`}
              style={w ? { width: w } : undefined}
            >
              {label}
            </th>
          );
        })}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  mono?: boolean;
  align?: 'left' | 'right';
}

export const Td: React.FC<TdProps> = ({ children, className = '', mono = false, align = 'left', ...rest }) => (
  <td
    className={`py-2.5 px-3 text-sm ${align === 'right' ? 'text-right' : ''} ${mono ? 'font-mono' : ''} ${className}`}
    {...rest}
  >
    {children}
  </td>
);
