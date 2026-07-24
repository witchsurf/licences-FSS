import React, { useLayoutEffect, useRef, useState } from 'react';

interface AutoFitTextProps {
  children: string;
  className?: string;
  maxFontSize: number;
  minFontSize: number;
}

export const calculateFittedFontSize = (
  availableWidth: number,
  contentWidth: number,
  maxFontSize: number,
  minFontSize: number,
) => {
  if (availableWidth <= 0 || contentWidth <= availableWidth) {
    return maxFontSize;
  }

  return Math.max(
    minFontSize,
    Math.min(maxFontSize, maxFontSize * (availableWidth / contentWidth)),
  );
};

export const AutoFitText: React.FC<AutoFitTextProps> = ({
  children,
  className = '',
  maxFontSize,
  minFontSize,
}) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const fit = () => {
      // Measure from the maximum size every time so growing containers can
      // restore the preferred font size.
      element.style.fontSize = `${maxFontSize}px`;
      const fittedSize = calculateFittedFontSize(
        element.clientWidth,
        element.scrollWidth,
        maxFontSize,
        minFontSize,
      );
      element.style.fontSize = `${fittedSize}px`;
      setFontSize(fittedSize);
    };

    fit();

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(element.parentElement ?? element);
    return () => resizeObserver.disconnect();
  }, [children, maxFontSize, minFontSize]);

  return (
    <p
      ref={textRef}
      className={`min-w-0 overflow-hidden whitespace-nowrap ${className}`}
      style={{ fontSize: `${fontSize}px` }}
      title={children}
    >
      {children}
    </p>
  );
};
