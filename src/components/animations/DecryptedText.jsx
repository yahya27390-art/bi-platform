import React, { useEffect, useState, useRef } from 'react';

/**
 * DecryptedText (React Bits Pro Inspired)
 * Matrix / Cyber decryption text effect revealing characters sequentially.
 */
export default function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:;?><',
  className = '',
  revealDirection = 'start', // 'start' | 'end' | 'center'
  animateOn = 'hover', // 'hover' | 'view'
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  const triggerAnimation = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText((_) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }
      iteration += 1 / maxIterations;
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view') {
      triggerAnimation();
    }
    return () => clearInterval(intervalRef.current);
  }, [text, animateOn]);

  const handleMouseEnter = () => {
    if (animateOn === 'hover') {
      setIsHovering(true);
      triggerAnimation();
    }
  };

  const handleMouseLeave = () => {
    if (animateOn === 'hover') {
      setIsHovering(false);
      clearInterval(intervalRef.current);
      setDisplayText(text);
    }
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block font-mono ${className}`}
      {...props}
    >
      {displayText}
    </span>
  );
}
