import React from 'react';
import Icon from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, footer, width = 'max-w-md' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
    <div className="absolute inset-0 bg-black/70" />
    <div
      className={`relative w-full ${width} bg-bg-secondary border border-line-hover rounded`}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
        <h3 className="text-sm font-semibold text-fg nx-uppercase">{title}</h3>
        <button onClick={onClose} className="text-fg-muted hover:text-fg">
          <Icon name="x" size={16} />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-line">
          {footer}
        </div>
      )}
    </div>
  </div>
);

export default Modal;
