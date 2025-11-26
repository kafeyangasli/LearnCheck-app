
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', size = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-50 dark:hover:text-slate-50 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md text-base'
  };

  return (
    <button className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props} />
  );
};

export default Button;
