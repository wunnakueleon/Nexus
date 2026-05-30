import React from 'react';

const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const };

const PATHS: Record<string, React.ReactNode> = {
  resource:  <g {...p}><path d="M3 8h7M7 4l-4 4 4 4M21 16h-7M17 12l4 4-4 4"/></g>,
  cargo:     <g {...p}><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/></g>,
  market:    <g {...p}><path d="M4 9h16l-1 11H5L4 9zM8 9V6a4 4 0 018 0v3"/></g>,
  admin:     <g {...p}><path d="M12 3l8 3v6c0 4-3.5 7-8 9-4.5-2-8-5-8-9V6l8-3z"/></g>,
  overview:  <g {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></g>,
  list:      <g {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></g>,
  code:      <g {...p}><path d="M8 6l-5 6 5 6M16 6l5 6-5 6"/></g>,
  users:     <g {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M17 7a3 3 0 010 6M21 20c0-2-1-4-3-4.5"/></g>,
  globe:     <g {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></g>,
  route:     <g {...p}><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 6h6a4 4 0 010 8H8a4 4 0 000 8"/></g>,
  plus:      <g {...p}><path d="M12 5v14M5 12h14"/></g>,
  edit:      <g {...p}><path d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4"/></g>,
  add:       <g {...p}><path d="M12 5v14M5 12h14"/></g>,
  search:    <g {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></g>,
  x:         <g {...p}><path d="M6 6l12 12M18 6L6 18"/></g>,
  check:     <g {...p}><path d="M5 12l5 5 9-11"/></g>,
  flag:      <g {...p}><path d="M5 21V4M5 4h13l-3 4 3 4H5"/></g>,
  trash:     <g {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></g>,
  arrow:     <g {...p}><path d="M5 12h14M13 6l6 6-6 6"/></g>,
  chevron:   <g {...p}><path d="M9 6l6 6-6 6"/></g>,
  down:      <g {...p}><path d="M6 9l6 6 6-6"/></g>,
  box:       <g {...p}><rect x="4" y="4" width="16" height="16"/></g>,
  copy:      <g {...p}><rect x="9" y="9" width="10" height="12" rx="1.5"/><path d="M5 15V5h10"/><path d="M5 5l4-4"/></g>,
  power:     <g {...p}><path d="M12 4v8M7 7a7 7 0 1010 0"/></g>,
  tools:     <g {...p}><path d="M14 6a3 3 0 00-4 4l-6 6 2 2 6-6a3 3 0 004-4l-2 2-2-2 2-2z"/></g>,
  food:      <g {...p}><path d="M6 3v8a3 3 0 006 0V3M9 3v18M18 3c-1.5 1-2 3-2 6s.5 5 2 6M18 3v18"/></g>,
  tech:      <g {...p}><rect x="6" y="6" width="12" height="12"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></g>,
  materials: <g {...p}><path d="M3 9l9-5 9 5-9 5-9-5zM3 15l9 5 9-5"/></g>,
  medicine:  <g {...p}><rect x="4" y="9" width="16" height="6" rx="3"/><path d="M12 9v6M9 12h6"/></g>,
  art:       <g {...p}><circle cx="12" cy="12" r="8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/></g>,
  crafts:    <g {...p}><path d="M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1 3-6z"/></g>,
  clothing:  <g {...p}><path d="M8 3l4 3 4-3 4 4-3 3v11H7V10L4 7l4-4z"/></g>,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    {PATHS[name] ?? PATHS.box}
  </svg>
);

export default Icon;
