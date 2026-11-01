import React, { useEffect, useRef } from 'react';

/**
 * AntigravityCanvas
 * Inspired by davidpelayo/antigravity-animation
 * GPU-accelerated canvas animation replicating weightless, floating geometric shapes with depth & interactive physics.
 *
 * @param {Object} props
 * @param {number} [props.particleCount=40] - Number of floating particles
 * @param {number} [props.speedFactor=0.8] - Speed multiplier
 * @param {string[]} [props.colors] - Array of hex colors for shapes
 * @param {'mixed'|'circle'|'square'|'triangle'} [props.shape='mixed'] - Shape type
 * @param {number} [props.gravity=-0.05] - Negative for antigravity (floating up), positive for down
 * @param {number} [props.interactionRadius=140] - Mouse repel radius in px
 * @param {number} [props.friction=0.97] - Air resistance
 * @param {string} [props.className=''] - Additional canvas CSS classes
 * @param {React.CSSProperties} [props.style] - Inline styles
 */
export default function AntigravityCanvas({
  particleCount = 40,
  speedFactor = 0.8,
  colors = ['#2563EB', '#38BDF8', '#10B981', '#F59E0B', '#6366F1', '#E2E8F0'],
  shape = 'mixed',
  gravity = -0.05,
  interactionRadius = 140,
  friction = 0.97,
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    });
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight);

    // High-performance Sprite Cache (pre-renders shapes to offscreen canvases)
    const spriteCache = new Map();

    const getSprite = (color, shapeType) => {
      const key = `${color}-${shapeType}`;
      if (spriteCache.has(key)) return spriteCache.get(key);

      const size = 64;
      const center = size / 2;
      const drawSize = 28;

      const offscreen = document.createElement('canvas');
      offscreen.width = size;
      offscreen.height = size;
      const oCtx = offscreen.getContext('2d');
      if (!oCtx) return null;

      oCtx.shadowColor = 'rgba(0,0,0,0.08)';
      oCtx.shadowBlur = 12;
      oCtx.shadowOffsetX = 3;
      oCtx.shadowOffsetY = 3;
      oCtx.fillStyle = color;

      oCtx.translate(center, center);
      oCtx.beginPath();
      if (shapeType === 0) {
        // Circle
        oCtx.arc(0, 0, drawSize / 2, 0, Math.PI * 2);
      } else if (shapeType === 1) {
        // Square
        oCtx.rect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);
      } else if (shapeType === 2) {
        // Triangle
        oCtx.moveTo(0, -drawSize / 2);
        oCtx.lineTo(drawSize / 2, drawSize / 2);
        oCtx.lineTo(-drawSize / 2, drawSize / 2);
        oCtx.closePath();
      }
      oCtx.fill();

      spriteCache.set(key, offscreen);
      return offscreen;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.init(true);
      }

      init(randomY = false) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : height + 40;
        this.size = Math.random() * 14 + 8;
        this.vx = (Math.random() - 0.5) * 1.5 * speedFactor;
        this.vy = (Math.random() - 0.5) * 1.5 * speedFactor;

        if (gravity < 0) {
          this.vy -= Math.random() * 1.2 * Math.abs(gravity);
        } else {
          this.y = randomY ? Math.random() * height : -40;
        }

        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;

        if (shape === 'circle') this.type = 0;
        else if (shape === 'square') this.type = 1;
        else if (shape === 'triangle') this.type = 2;
        else this.type = Math.floor(Math.random() * 3);

        this.depth = Math.random() * 0.8 + 0.6; // 3D depth scale
        this.sprite = getSprite(this.color, this.type);
      }

      update(mX, mY) {
        this.vy += gravity * 0.05 * this.depth;
        this.x += this.vx * this.depth;
        this.y += this.vy * this.depth;
        this.rotation += this.rotationSpeed;

        const dx = this.x - mX;
        const dy = this.y - mY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < interactionRadius) {
          const force = (interactionRadius - dist) / interactionRadius;
          const angle = Math.atan2(dy, dx);
          const push = force * 3.5;
          this.vx += Math.cos(angle) * push;
          this.vy += Math.sin(angle) * push;
        }

        this.vx *= friction;
        this.vy *= friction;

        if (this.x < -40) this.x = width + 40;
        if (this.x > width + 40) this.x = -40;

        if (gravity < 0) {
          if (this.y < -50) this.init(false);
        } else {
          if (this.y > height + 50) this.init(false);
        }
      }

      draw() {
        if (!this.sprite) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        const scale = (this.size / 28) * this.depth;
        ctx.scale(scale, scale);
        ctx.drawImage(this.sprite, -32, -32, 64, 64);
        ctx.restore();
      }
    }

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = -9999;
    let mouseY = -9999;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        mouseY = e.touches[0].clientY - rect.top;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouseX, mouseY);
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, speedFactor, colors, shape, gravity, interactionRadius, friction]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ width: '100%', height: '100%', zIndex: 0, ...style }}
    />
  );
}
