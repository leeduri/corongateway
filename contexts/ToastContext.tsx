import React, { createContext, useState, useContext, useCallback } from 'react';
import Toast from '../components/common/Toast';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Corresponds to the animation duration

    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} isVisible={isVisible} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
