import React from 'react';

interface LoadingStateProps {
  text?: string;
}

// Mirrors EmptyState's centered layout so loading → loaded → empty transitions
// don't shift the page. An amber-tipped ring spins against the muted line color.
const LoadingState: React.FC<LoadingStateProps> = ({ text = 'Loading…' }) => (
  <div
    className="flex flex-col items-center justify-center text-center py-16 px-6"
    role="status"
    aria-live="polite"
  >
    <span className="w-7 h-7 rounded-full border-2 border-line border-t-amber animate-spin mb-3" />
    <div className="text-sm text-fg-secondary">{text}</div>
  </div>
);

export default LoadingState;
