import React, { useRef, useState } from 'react';

/**
 * MagnetButton (React Bits Pro Inspired)
 * Physics-based magnetic attraction button pulling towards cursor.
 */
export default function MagnetButton({
  children,
  className = '',
  magnetStrength = 0.35,
  onClick,
  ...props
}) {
  const btnRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (e.clientX - centerX) * magnetStrength;
    const deltaY = (e.clientY - centerY) * magnetStrength;

    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.15s ease-out'
      }}
      className={`relative inline-flex items-center justify-center font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
