import React from 'react';

interface LogoProps {
  className?: string;
  showFallbackText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12 w-12", showFallbackText = true }) => {
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className={`${className} bg-fss-green rounded-full flex items-center justify-center text-white font-bold border-2 border-fss-yellow shadow-sm overflow-hidden`}>
        {showFallbackText ? <span className="text-[0.6rem] sm:text-xs">FSS</span> : null}
      </div>
    );
  }

  return (
    <img 
      src="/logo.png" 
      alt="Logo FSS" 
      className={`${className} object-contain`}
      onError={() => setError(true)}
    />
  );
};