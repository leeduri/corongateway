
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
    ghost: 'bg-transparent text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
