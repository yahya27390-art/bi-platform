import React from 'react';

/**
 * ShinyText (React Bits Pro Inspired)
 * Shimmering luxury metallic light pass animation over text.
 */
export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = '',
  shimmerColor = '#ffffff'
}) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent font-semibold transition-all ${
        disabled ? 'text-slate-900' : ''
      } ${className}`}
      style={{
        backgroundImage: disabled
          ? 'none'
          : `linear-gradient(120deg, currentColor 0%, currentColor 38%, ${shimmerColor} 50%, currentColor 62%, currentColor 100%)`,
        backgroundSize: '200% 100%',
        animation: disabled ? 'none' : `shiny-text ${animationDuration} linear infinite`,
        WebkitBackgroundClip: 'text'
      }}
    >
      <style>{`
        @keyframes shiny-text {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
      {text}
    </span>
  );
}
