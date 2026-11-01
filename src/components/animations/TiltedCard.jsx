import React, { useRef, useState } from 'react';

/**
 * TiltedCard (React Bits Pro Inspired)
 * 3D card tilt effect following mouse perspective with glare.
 */
export default function TiltedCard({
  children,
  className = '',
  maxRotation = 12,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  ...props
}) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -maxRotation;
    const rotY = ((x - centerX) / centerX) * maxRotation;

    setRotateX(rotX);
    setRotateY(rotY);

    if (glare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.25
      });
    }
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    if (glare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full transition-transform"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${rotateX || rotateY ? scale : 1})`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out'
        }}
        className={`relative overflow-hidden rounded-2xl bg-white shadow-sm ${className}`}
        {...props}
      >
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: glarePosition.opacity,
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
              zIndex: 20
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
