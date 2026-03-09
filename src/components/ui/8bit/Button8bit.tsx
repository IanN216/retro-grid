import React from 'react';
import { cn } from '@/utils/cn';

interface Button8bitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button8bit: React.FC<Button8bitProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const baseStyles = [
    'font-pixel cursor-pointer select-none',
    'transition-all duration-100 active:translate-y-[2px]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
  ];

  const variantStyles = {
    default: [
      'bg-retro-panel text-retro-text',
      'border-2 border-retro-text-dim',
      'shadow-[inset_-2px_-2px_0px_0px_rgba(0,0,0,0.4),inset_2px_2px_0px_0px_rgba(255,255,255,0.1),4px_4px_0px_0px_rgba(0,0,0,0.5)]',
      'hover:bg-retro-card hover:border-retro-text',
      'active:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.4),inset_-1px_-1px_0px_0px_rgba(255,255,255,0.1)]',
    ],
    accent: [
      'bg-retro-accent text-white',
      'border-2 border-[#ff6b80]',
      'shadow-[inset_-2px_-2px_0px_0px_rgba(0,0,0,0.3),inset_2px_2px_0px_0px_rgba(255,255,255,0.2),4px_4px_0px_0px_rgba(0,0,0,0.5)]',
      'hover:bg-[#ff5070]',
      'active:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.4)]',
    ],
    gold: [
      'bg-retro-gold-dark text-retro-bg',
      'border-2 border-retro-gold',
      'shadow-[inset_-2px_-2px_0px_0px_rgba(0,0,0,0.3),inset_2px_2px_0px_0px_rgba(255,255,255,0.3),4px_4px_0px_0px_rgba(0,0,0,0.5)]',
      'hover:bg-retro-gold',
      'active:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.4)]',
    ],
    ghost: [
      'bg-transparent text-retro-text-dim',
      'border-2 border-transparent',
      'hover:text-retro-text hover:border-retro-text-dim hover:bg-retro-panel/50',
    ],
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-[8px]',
    md: 'px-4 py-2 text-[10px]',
    lg: 'px-6 py-3 text-xs',
  };

  return (
    <button
      className={cn(...baseStyles, ...variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
