import React from 'react';

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-[1.5rem] border border-outline/15 bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(27,28,25,0.04)] ${className}`}>{children}</div>
  );
};

export default Card;
