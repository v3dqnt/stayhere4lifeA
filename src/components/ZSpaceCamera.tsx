'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ZSpaceCamera({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layerEls = containerRef.current?.querySelectorAll('.camera-layer');
    if (!layerEls || layerEls.length === 0) return;
    const layers = Array.from(layerEls) as HTMLElement[];

    // All layers start hidden & tiny
    layers.forEach((layer, i) => {
      gsap.set(layer, { scale: 0.15, opacity: 0, zIndex: layers.length - i });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${window.innerHeight * layers.length * 2}`, // More scroll for "flow"
        pin: true,
        scrub: 2.2,        // More cinematic wait
        anticipatePin: 1,
      },
    });

    // Sub-animation: Flowy Camera Float
    gsap.to('.z-wrapper', {
      x: 'random(-15, 15)',
      y: 'random(-15, 15)',
      rotateZ: 'random(-1, 1)',
      duration: 5, // Slower float
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    layers.forEach((layer, i) => {
      const isLast = i === layers.length - 1;

      // Flowing in from deep
      tl.to(layer, {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const blur = (1 - progress) * 20;
          gsap.set(layer, { filter: `blur(${blur}px)` });
        }
      }, i === 0 ? 0 : '-=1.2');

      tl.to(layer, { duration: 0.8 }); // Pause

      tl.to(layer, {
        scale: 2.5, 
        opacity: 0,
        y: -150, // Flow upwards
        duration: 1.5,
        ease: 'power2.in',
        onUpdate: function() {
          const progress = this.progress();
          const blur = progress * 30;
          gsap.set(layer, { filter: `blur(${blur}px)` });
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="z-container">
      <div className="z-wrapper">
        {children}
      </div>
    </div>
  );
}
