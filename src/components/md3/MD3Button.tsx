import React from 'react';
import clsx from 'clsx';

interface MD3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const MD3Button: React.FC<MD3ButtonProps> = ({
  variant = 'filled',
  children,
  className,
  icon,
  ...props
}) => {
  const variantStyles = {
    filled: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-md active:opacity-90',
    outlined: 'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10',
    text: 'text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10',
    elevated: 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] shadow-sm hover:shadow-md',
    tonal: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:shadow-sm',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
        'rounded-[var(--md-sys-shape-corner-full)] px-6 py-2.5 text-sm',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};
