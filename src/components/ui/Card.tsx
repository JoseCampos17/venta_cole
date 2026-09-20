import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export function Card({ children, hoverEffect = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-pink-100/80 shadow-sm p-4 sm:p-6 transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:border-pink-200 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
