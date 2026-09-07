import React from 'react';
import Link from 'next/link';

export const Logo: React.FC<{ className?: string; isLight?: boolean; iconOnly?: boolean }> = ({
  className = 'h-10',
  isLight = false,
  iconOnly = false,
}) => {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 group transition-transform ${className}`}>
      {iconOnly ? (
        <img
          src="/icono.svg"
          alt="Quisqueya Talent"
          className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
        />
      ) : (
        <img
          src="/logo.svg"
          alt="Quisqueya Talent"
          className={`h-11 w-auto object-contain group-hover:scale-102 transition-transform ${
            isLight ? 'brightness-0 invert' : ''
          }`}
        />
      )}
    </Link>
  );
};

export default Logo;
