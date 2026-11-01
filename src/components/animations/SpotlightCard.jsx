import React, { useRef, useState } from 'react';

/**
 * SpotlightCard (React Bits Pro Inspired)
 * Interactive card with mouse-tracking radial gradient spotlight and border illumination.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(59, 130, 246, 0.15)',
  borderColor = 'rgba(59, 130, 246, 0.4)',
  ...props
}) {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`
        }}
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity,
          border: `1.5px solid ${borderColor}`,
          maskImage: `radial-gradient(250px circle at ${position.x}px ${position.y}px, black 30%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(250px circle at ${position.x}px ${position.y}px, black 30%, transparent 100%)`
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
