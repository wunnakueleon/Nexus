import React from 'react';

interface WordmarkProps {
  size?: 'md' | 'lg';
}

const Wordmark: React.FC<WordmarkProps> = ({ size = 'md' }) => {
  const big = size === 'lg';
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`relative ${big ? 'w-9 h-9' : 'w-7 h-7'} border border-amber flex items-center justify-center`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}
      >
        <span className="w-2 h-2 bg-amber" />
      </div>
      <div className="leading-none">
        <div className={`${big ? 'text-2xl' : 'text-lg'} font-bold tracking-[0.22em] text-fg`}>NEXUS</div>
        {big && (
          <div className="text-[10px]/[1.45] font-mono text-fg-muted tracking-[0.18em] mt-1 nx-uppercase">
            Neutral Inter-Galactic Platform
          </div>
        )}
      </div>
    </div>
  );
};

export default Wordmark;
