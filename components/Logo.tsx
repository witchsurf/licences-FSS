import React from 'react';

interface LogoProps {
  className?: string;
  showFallbackText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12 w-12", showFallbackText = true }) => {
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className={`${className} bg-fss-green rounded-full flex items-center justify-center text-white font-black border-2 border-fss-yellow shadow-[0_4px_12px_rgba(0,133,63,0.3)] overflow-hidden scale-100 active:scale-95 transition-all`}>
        {showFallbackText ? <span className="text-[0.6rem] sm:text-xs tracking-tighter">FSS</span> : null}
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Logo FSS"
      className={`${className} object-contain hover:scale-105 transition-all cursor-pointer drop-shadow-md`}
      onError={() => setError(true)}
    />
  );
};