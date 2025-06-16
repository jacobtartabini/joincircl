
import React from 'react';

interface CirclLogoProps {
  className?: string;
  size?: number;
}

export function CirclLogo({ className = "", size = 24 }: CirclLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/lovable-uploads/e0b916e1-edb9-4534-8e4d-8ca57e37d18b.png"
        alt="Circl Logo"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
}
