import React from 'react';
import Icon from '../../../shared/components/Icon';

interface ItemThumbProps {
  icon?: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const ItemThumb: React.FC<ItemThumbProps> = ({ icon = 'box', imageUrl, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-full aspect-square' : 'w-14 h-14';
  const iconSz = size === 'sm' ? 16 : 22;
  return (
    <div className={`${sz} bg-bg-input border border-line rounded flex items-center justify-center shrink-0 relative overflow-hidden`}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1C2129 0, #1C2129 1px, transparent 1px, transparent 8px)' }} />
          <Icon name={icon} size={iconSz} className="text-fg-muted relative z-10" />
        </>
      )}
    </div>
  );
};

export default ItemThumb;
