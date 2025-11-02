
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const sizeStyles = {
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-4',
    };
    return (
        <div className={`animate-spin rounded-full border-gray-700 border-t-pink-500 ${sizeStyles[size]}`}></div>
    );
};

export default Spinner;
