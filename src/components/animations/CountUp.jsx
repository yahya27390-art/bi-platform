import React, { useEffect, useState } from 'react';

/**
 * CountUp (React Bits Pro Inspired)
 * Smooth numeric counter animation with easing and custom formatters.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1.2,
  separator = ',',
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * easeProgress;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [to, from, duration]);

  const formatted = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className={`tabular-nums font-bold ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
