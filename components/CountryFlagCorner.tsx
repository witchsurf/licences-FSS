import React from 'react';

interface CountryFlagCornerProps {
  country?: string | null;
  flagUrl?: string | null;
  className?: string;
}

export const CountryFlagCorner: React.FC<CountryFlagCornerProps> = ({
  country,
  flagUrl,
  className = "absolute left-0 top-0 z-20 h-[35mm] w-[35mm]"
}) => {
  // If custom flag image is provided, render it clipped to the corner triangle
  if (flagUrl) {
    return (
      <div 
        className={`${className} overflow-hidden`} 
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      >
        <img 
          src={flagUrl} 
          alt="Drapeau de l'organisation" 
          className="w-full h-full object-cover scale-110" 
        />
      </div>
    );
  }

  const normalized = (country || 'SN').trim().toUpperCase();

  // 1. SÉNÉGAL (Défaut)
  if (normalized === 'SN' || normalized === 'SÉNÉGAL' || normalized === 'SENEGAL') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau du Sénégal">
        <polygon points="0,0 58,0 0,58" fill="#00853F" />
        <polygon points="58,0 96,0 0,96 0,58" fill="#FCD116" />
        <polygon points="96,0 140,0 0,140 0,96" fill="#E31B23" />
        <text x="26" y="50" fill="#00853F" fontSize="25">★</text>
      </svg>
    );
  }

  // 2. FRANCE
  if (normalized === 'FR' || normalized === 'FRANCE') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau de la France">
        <polygon points="0,0 58,0 0,58" fill="#002395" />
        <polygon points="58,0 96,0 0,96 0,58" fill="#FFFFFF" />
        <polygon points="96,0 140,0 0,140 0,96" fill="#ED2939" />
      </svg>
    );
  }

  // 3. CÔTE D'IVOIRE
  if (normalized === 'CI' || normalized === "CÔTE D'IVOIRE" || normalized === "COTE D'IVOIRE") {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau de la Côte d'Ivoire">
        <polygon points="0,0 58,0 0,58" fill="#F77F00" />
        <polygon points="58,0 96,0 0,96 0,58" fill="#FFFFFF" />
        <polygon points="96,0 140,0 0,140 0,96" fill="#009E60" />
      </svg>
    );
  }

  // 4. MAROC
  if (normalized === 'MA' || normalized === 'MAROC') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau du Maroc">
        <polygon points="0,0 140,0 0,140" fill="#C1272D" />
        <polygon 
          points="35,22 43,45 22,31 48,31 27,45" 
          fill="none" 
          stroke="#006233" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />
      </svg>
    );
  }

  // 5. TAHITI / POLYNÉSIE FRANÇAISE
  if (normalized === 'PF' || normalized.includes('TAHITI') || normalized.includes('POLYNESIE')) {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau de Tahiti">
        <polygon points="0,0 45,0 0,45" fill="#E00000" />
        <polygon points="45,0 100,0 0,100 0,45" fill="#FFFFFF" />
        <polygon points="100,0 140,0 0,140 0,100" fill="#E00000" />
        <circle cx="36" cy="36" r="12" fill="#F77F00" opacity="0.9" />
      </svg>
    );
  }

  // 6. ESPAGNE
  if (normalized === 'ES' || normalized === 'ESPAGNE') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau de l'Espagne">
        <polygon points="0,0 42,0 0,42" fill="#AA151B" />
        <polygon points="42,0 100,0 0,100 0,42" fill="#F1BF00" />
        <polygon points="100,0 140,0 0,140 0,100" fill="#AA151B" />
      </svg>
    );
  }

  // 7. PORTUGAL
  if (normalized === 'PT' || normalized === 'PORTUGAL') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau du Portugal">
        <polygon points="0,0 60,0 0,60" fill="#006600" />
        <polygon points="60,0 140,0 0,140 0,60" fill="#FF0000" />
        <circle cx="42" cy="42" r="11" fill="#FFCC00" stroke="#000" strokeWidth="1" />
      </svg>
    );
  }

  // 8. BRÉSIL
  if (normalized === 'BR' || normalized === 'BRÉSIL' || normalized === 'BRESIL') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau du Brésil">
        <polygon points="0,0 140,0 0,140" fill="#009C3B" />
        <polygon points="35,15 65,35 35,55 5,35" fill="#FFDF00" />
        <circle cx="35" cy="35" r="10" fill="#002776" />
      </svg>
    );
  }

  // 9. CAP-VERT
  if (normalized === 'CV' || normalized === 'CAP-VERT' || normalized === 'CAP VERT') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau du Cap-Vert">
        <polygon points="0,0 140,0 0,140" fill="#003893" />
        <polygon points="45,0 75,0 0,75 0,45" fill="#FFFFFF" />
        <polygon points="52,0 68,0 0,68 0,52" fill="#CF142B" />
      </svg>
    );
  }

  // 10. ÉTATS-UNIS
  if (normalized === 'US' || normalized === 'USA' || normalized === 'ÉTATS-UNIS') {
    return (
      <svg viewBox="0 0 140 140" className={className} aria-label="Drapeau des États-Unis">
        <polygon points="0,0 140,0 0,140" fill="#B22234" />
        <polygon points="0,0 70,0 0,70" fill="#3C3B6E" />
        <text x="18" y="32" fill="#FFFFFF" fontSize="16">★</text>
      </svg>
    );
  }

  // Generic fallback: Fallback to SVG flag via flagcdn or high-res flag representation
  const countryCodeLower = normalized.length === 2 ? normalized.toLowerCase() : 'sn';
  return (
    <div 
      className={`${className} overflow-hidden bg-slate-200`} 
      style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
    >
      <img 
        src={`https://flagcdn.com/w160/${countryCodeLower}.png`} 
        alt={`Drapeau ${normalized}`} 
        className="w-full h-full object-cover scale-125 -translate-x-1 -translate-y-1"
        onError={(e) => {
          // If offline or image failed to load, fallback to neutral geometric corner
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );
};
