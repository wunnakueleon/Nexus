import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  topStripe?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', topStripe, ...rest }) => (
  <div className={`bg-bg-secondary border border-line rounded relative ${className}`} {...rest}>
    {topStripe && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: topStripe }} />}
    {children}
  </div>
);

export default Card;
