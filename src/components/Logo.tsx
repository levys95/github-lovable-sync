import React, { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
  srcOverride?: string;
}

// Centralized logo component. If you update the logo file, change SRC below
// or pass srcOverride to override at runtime.
const SRC = "/lovable-uploads/f49dc73c-6cdf-40f2-8469-c10cb8d64b09.png";

export const Logo: React.FC<LogoProps> = ({ className, alt = 'Logo SFDE', srcOverride }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const v = String(Math.floor(Date.now() / 1000));

    const tryPreferred = async () => {
      try {
        // Prefer a canonical logo path if present
        const preferred = `/lovable-uploads/logo.png?v=${v}`;
        const res = await fetch(preferred, { method: 'HEAD', cache: 'no-cache' });
        if (active && res.ok) {
          setResolvedSrc(preferred);
          return;
        }
      } catch {}
      if (active) {
        setResolvedSrc(`${srcOverride || SRC}?v=${v}`);
      }
    };

    tryPreferred();
    return () => { active = false; };
  }, [srcOverride]);

  if (!resolvedSrc) return null;
  return <img src={resolvedSrc} alt={alt} className={className} />;
};
