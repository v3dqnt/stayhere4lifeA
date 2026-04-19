'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function HeartAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heartRef.current || !ringsRef.current) return;

    // 1. Staggered Stroke Draw
    const paths = heartRef.current.querySelectorAll('path');
    anime({
      targets: paths,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutQuart',
      duration: 2000,
      delay: (el, i) => i * 250,
    });

    // 2. Main Pulse
    anime({
      targets: heartRef.current,
      scale: [0.98, 1.05],
      opacity: [0.8, 1],
      duration: 1500,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });

    // 3. Rippling Auras (Concentric Rings)
    const createRing = () => {
      const ring = document.createElement('div');
      ring.className = 'heart-ring';
      ring.style.cssText = `
        position: absolute;
        width: 120px;
        height: 120px;
        border: 1px solid var(--accent);
        border-radius: 50%;
        opacity: 0.5;
        pointer-events: none;
      `;
      ringsRef.current?.appendChild(ring);

      anime({
        targets: ring,
        scale: [1, 3],
        opacity: [0.5, 0],
        duration: 3000,
        easing: 'easeOutExpo',
        complete: () => ring.remove()
      });
    };

    const ringInterval = setInterval(createRing, 1000);

    return () => clearInterval(ringInterval);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Container for ripples */}
      <div ref={ringsRef} style={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
      
      <svg
        ref={heartRef}
        width="160"
        height="160"
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feFlood floodColor="#38bdf8" floodOpacity="0.8" result="glowColor" />
            <feComposite in="glowColor" in2="glow" operator="in" result="coloredGlow" />
            <feMerge>
              <feMergeNode in="coloredGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#38bdf8"
          filter="url(#glow)"
        />
      </svg>
      
      {/* Core Glow */}
      <div style={{ 
        position: 'absolute', 
        width: '200px', 
        height: '200px', 
        background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', 
        filter: 'blur(40px)',
        zIndex: 1 
      }} />
    </div>
  );
}
