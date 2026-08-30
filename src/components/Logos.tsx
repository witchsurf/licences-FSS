import React from 'react';

/**
 * Drapeau du Sénégal en coin biseauté Haut-Gauche :
 * 1. Triangle supérieur-gauche : VERT (#00853F)
 * 2. Bande diagonale centrale : JAUNE (#FDEF42) avec l'ÉTOILE VERTE (#00853F) en son centre
 * 3. Bande diagonale inférieure : ROUGE (#E31B23)
 */
export const SenegalFlagCorner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="cornerClip">
            <polygon points="0,0 200,0 0,200" />
          </clipPath>
        </defs>

        <g clipPath="url(#cornerClip)">
          {/* 1. Bande Rouge (côté extérieur bas) */}
          <polygon
            points="0,150 0,200 200,0 150,0"
            fill="#E31B23"
          />

          {/* 2. Bande Jaune centrale (avec l'étoile verte) */}
          <polygon
            points="0,75 0,150 150,0 75,0"
            fill="#FDEF42"
          />

          {/* 3. Triangle Vert (coin supérieur gauche) */}
          <polygon
            points="0,0 0,75 75,0"
            fill="#00853F"
          />

          {/* Étoile verte à 5 branches centrée DANS la bande jaune */}
          <g transform="translate(56, 56) rotate(-45) scale(0.75)">
            <polygon
              points="0,-18 5.5,-5.5 18,-5.5 8.5,3 12,16 0,8 -12,16 -8.5,3 -18,-5.5 -5.5,-5.5"
              fill="#00853F"
            />
          </g>
        </g>

        {/* Ligne blanche de séparation nette */}
        <line
          x1="0"
          y1="200"
          x2="200"
          y2="0"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
};

/**
 * Texture de vagues filigranes en arrière-plan
 */
export const WaveWatermarkBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-[0.07] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 500"
      preserveAspectRatio="none"
    >
      <path
        d="M-50,80 C150,20 250,140 450,80 C650,20 750,140 950,80"
        fill="none"
        stroke="#0080C8"
        strokeWidth="6"
      />
      <path
        d="M-50,160 C150,100 250,220 450,160 C650,100 750,220 950,160"
        fill="none"
        stroke="#0080C8"
        strokeWidth="6"
      />
      <path
        d="M-50,240 C150,180 250,300 450,240 C650,180 750,300 950,240"
        fill="none"
        stroke="#0080C8"
        strokeWidth="6"
      />
      <path
        d="M-50,320 C150,260 250,380 450,320 C650,260 750,380 950,320"
        fill="none"
        stroke="#0080C8"
        strokeWidth="6"
      />
      <path
        d="M-50,400 C150,340 250,460 450,400 C650,340 750,460 950,400"
        fill="none"
        stroke="#0080C8"
        strokeWidth="6"
      />
    </svg>
  );
};

/**
 * Logo officiel ASC SURF (Confédération Africaine de Surf)
 */
export const AscSurfLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-baseline font-display select-none ${className}`}>
      <span className="text-[#0080C8] text-xl font-bold tracking-tight lowercase">
        asc
      </span>
      <span className="text-[#0080C8] text-xl font-black tracking-normal lowercase">
        surf
      </span>
    </div>
  );
};

/**
 * Logo Officiel Exact FSS (Fédération Sénégalaise de Surf) utilisant le fichier image officiel fourni
 */
export const OfficialFSSLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}>
      <img
        src="/fss-logo-official.jpg"
        alt="Fédération Sénégalaise de Surf"
        className={`w-full h-full object-contain mix-blend-multiply ${imgClassName}`}
      />
    </div>
  );
};

/**
 * Anneaux Olympiques & CNOSS
 */
export const OlympicRingsLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 100 45"
      className={`h-5 w-auto object-contain ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="18" r="13" fill="none" stroke="#0081C8" strokeWidth="2.8" />
      <circle cx="50" cy="18" r="13" fill="none" stroke="#000000" strokeWidth="2.8" />
      <circle cx="84" cy="18" r="13" fill="none" stroke="#EE334E" strokeWidth="2.8" />
      <circle cx="33" cy="27" r="13" fill="none" stroke="#FCB131" strokeWidth="2.8" />
      <circle cx="67" cy="27" r="13" fill="none" stroke="#00A651" strokeWidth="2.8" />
    </svg>
  );
};

/**
 * Logo ISA Surf (International Surfing Association)
 */
export const IsaSurfLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col select-none leading-none ${className}`}>
      <div className="flex items-center">
        <span className="font-black text-[#0080C8] text-xs tracking-tighter lowercase font-sans">isa</span>
        <span className="font-extrabold text-[#0080C8] text-xs tracking-normal lowercase font-sans">surf</span>
      </div>
      <span className="text-[5px] text-slate-500 font-semibold tracking-tight uppercase">International Surfing Association</span>
    </div>
  );
};

/**
 * Cachet Officiel FSS pour le Verso
 */
export const OfficialStampFSS: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none text-[#0080C8]/80 ${className}`}>
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#0080C8]/60 flex flex-col items-center justify-center p-1 transform -rotate-12">
        <span className="text-[5px] font-bold uppercase tracking-wider text-center">FÉDÉRATION SÉNÉGALAISE</span>
        <span className="text-[7px] font-black text-center my-0.5">★ SURF ★</span>
        <span className="text-[4.5px] font-bold tracking-tight text-center">CACHET OFFICIEL</span>
        <span className="text-[5px] font-mono font-bold text-center mt-0.5">2025-2028</span>
      </div>
    </div>
  );
};
