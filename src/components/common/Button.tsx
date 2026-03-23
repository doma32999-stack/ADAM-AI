import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps) {
  const {
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...rest
  } = props;

  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
    outline: 'border border-gray-700 text-white hover:bg-gray-900',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || (props as any).disabled}
      {...rest}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
}
