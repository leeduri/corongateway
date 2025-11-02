
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
      <input
        ref={ref}
        className="w-full px-3 py-2 bg-transparent border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
