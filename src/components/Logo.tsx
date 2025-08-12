import React from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
  srcOverride?: string;
}

// Centralized logo component. If you update the logo file, change SRC below
// or pass srcOverride to override at runtime.
const SRC = "/lovable-uploads/f49dc73c-6cdf-40f2-8469-c10cb8d64b09.png";

export const Logo: React.FC<LogoProps> = ({ className, alt = 'Logo SFDE', srcOverride }) => {
  // Cache-busting per page load to reflect latest logo after replacement
  const v = String(Math.floor(Date.now() / 1000));
  const src = `${srcOverride || SRC}?v=${v}`;
  return <img src={src} alt={alt} className={className} />;
};
