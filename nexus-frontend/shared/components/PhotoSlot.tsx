import React from 'react';
import Icon from './Icon';

interface PhotoSlotProps {
  icon?: string;
  label?: string;
  className?: string;
  aspect?: string;
}

const PhotoSlot: React.FC<PhotoSlotProps> = ({ icon = 'box', label, className = '', aspect = 'aspect-square' }) => (
  <div className={`relative ${aspect} bg-bg-input border border-line rounded overflow-hidden flex flex-col items-center justify-center ${className}`}>
    <div
      className="absolute inset-0 opacity-50"
      style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1C2129 0, #1C2129 1px, transparent 1px, transparent 9px)' }}
    />
    <Icon name={icon} size={28} className="text-fg-muted relative z-10" />
    {label && <div className="text-[10px]/[1.45] text-fg-muted font-mono mt-2 relative z-10 nx-uppercase">{label}</div>}
  </div>
);

export default PhotoSlot;
