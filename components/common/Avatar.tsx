
import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-36 w-36',
  };

  return (
    <img
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700`}
      src={src}
      alt={alt}
    />
  );
};

export default Avatar;
