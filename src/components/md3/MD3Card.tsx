import React from 'react';
import clsx from 'clsx';

interface MD3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: React.ReactNode;
  className?: string;
}

export const MD3Card: React.FC<MD3CardProps> = ({
  variant = 'elevated',
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    elevated: 'bg-[var(--md-sys-color-surface-container-low)] shadow-sm hover:shadow-md transition-shadow border-0',
    filled: 'bg-[var(--md-sys-color-surface-container-highest)] border-0',
    outlined: 'bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]',
  };

  return (
    <div
      className={clsx(
        'rounded-[var(--md-sys-shape-corner-large)] p-6 transition-all duration-200 text-[var(--md-sys-color-on-surface)]',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
