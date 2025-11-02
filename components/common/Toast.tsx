import React from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white font-semibold py-2 px-4 rounded-full shadow-lg animate-toast">
        {message}
      </div>
    </div>
  );
};

export default Toast;
