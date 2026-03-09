import React from 'react';
import { cn } from '@/utils/cn';

interface Input8bitProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input8bit: React.FC<Input8bitProps> = ({
  label,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-pixel text-[8px] text-retro-text-dim uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={cn(
          'font-pixel text-[10px] bg-retro-bg text-retro-gold',
          'border-2 border-retro-border',
          'px-2 py-1.5 outline-none',
          'shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.5)]',
          'focus:border-retro-gold focus:shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.5),0_0_6px_rgba(255,215,0,0.3)]',
          'placeholder:text-retro-text-dim/50',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          className
        )}
        {...props}
      />
    </div>
  );
};
