
import React from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
}

// Logo principal SFDE - Société Française de Déchets Électroniques
const LOGO_SRC = "/lovable-uploads/f66bb25b-4690-4ec2-9e18-ee73dd1da2cc.png";

export const Logo: React.FC<LogoProps> = ({ className, alt = 'SFDE - Société Française de Déchets Électroniques' }) => {
  return <img src={LOGO_SRC} alt={alt} className={className} />;
};
