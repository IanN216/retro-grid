import React from 'react';
import { cn } from '@/utils/cn';

interface Card8bitProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'gold' | 'accent';
}

export const Card8bit: React.FC<Card8bitProps> = ({
  children,
  title,
  className,
  variant = 'default',
}) => {
  const borderColor = {
    default: 'border-retro-border',
    gold: 'border-retro-gold-dark',
    accent: 'border-retro-accent',
  };

  const titleColor = {
    default: 'text-retro-text',
    gold: 'text-retro-gold',
    accent: 'text-retro-accent',
  };

  return (
    <div
      className={cn(
        'bg-retro-panel border-[3px] relative',
        borderColor[variant],
        // Double border effect for retro feel
        'shadow-[inset_0_0_0_2px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.8)]',
        'p-3',
        className
      )}
    >
      {/* Inner border highlight */}
      <div className="absolute inset-[3px] border border-white/5 pointer-events-none" />
      
      {title && (
        <div className="mb-3">
          <h3
            className={cn(
              'font-pixel text-[10px] tracking-wider uppercase',
              titleColor[variant]
            )}
          >
            {'> '}{title}
          </h3>
          <div className={cn('mt-1 h-[2px]', {
            'bg-retro-border': variant === 'default',
            'bg-retro-gold-dark': variant === 'gold',
            'bg-retro-accent': variant === 'accent',
          })} />
        </div>
      )}
      {children}
    </div>
  );
};
