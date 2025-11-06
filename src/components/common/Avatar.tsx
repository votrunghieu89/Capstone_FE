import React from 'react';

// === AVATAR CONTAINER ===
export const Avatar: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

// === AVATAR IMAGE ===
export const AvatarImage: React.FC<{ src?: string; alt?: string; className?: string }> = ({ src, alt, className }) => (
  <img 
    src={src} 
    alt={alt} 
    className={`aspect-square h-full w-full object-cover ${className}`}
  />
);

// === AVATAR FALLBACK (Chữ cái thay thế) ===
export const AvatarFallback: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-sm font-medium ${className}`}>
    {children}
  </div>
);