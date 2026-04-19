'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

/* ── Real media catalog — no placeholders ───────────────────────────────── */
type Item = {
  src: string; isVideo: boolean;
  finalX: number; finalY: number; rot: number; w: number; h: number;
};

const ITEMS: Item[] = [
  { src: '/aaliya.png',     isVideo: false, finalX: -820, finalY: -240, rot: -6,  w: 190, h: 252 },
  { src: '/aaliya 2.jpeg',  isVideo: false, finalX:  710, finalY: -210, rot:  8,  w: 180, h: 240 },
  { src: '/aaliya 3.jpg',   isVideo: false, finalX: -660, finalY:  190, rot:  5,  w: 162, h: 214 },
  { src: '/aaliya 4.jpeg',  isVideo: false, finalX:  760, finalY:  140, rot: -6,  w: 165, h: 220 },
  { src: '/aal 5.jpeg',     isVideo: false, finalX: -220, finalY: -345, rot:  4,  w: 168, h: 224 },
  { src: '/aal6.jpeg',      isVideo: false, finalX:   80, finalY: -365, rot: -5,  w: 162, h: 215 },
  { src: '/aal 7.jpeg',     isVideo: false, finalX:  345, finalY: -305, rot:  3,  w: 160, h: 212 },
  { src: '/aal 8.jpeg',     isVideo: false, finalX: -805, finalY:   25, rot: -3,  w: 152, h: 202 },
  { src: '/aal9.jpeg',      isVideo: false, finalX:  825, finalY:  -50, rot:  4,  w: 150, h: 200 },
  { src: '/aal10.jpeg',     isVideo: false, finalX: -305, finalY:  315, rot: -7,  w: 162, h: 216 },
  { src: '/aal11.jpeg',     isVideo: false, finalX:  -45, finalY:  335, rot:  5,  w: 156, h: 208 },
  { src: '/aal12.jpeg',     isVideo: false, finalX:  265, finalY:  305, rot: -4,  w: 160, h: 212 },
  { src: '/aal13.jpeg',     isVideo: false, finalX: -105, finalY: -185, rot:  3,  w: 155, h: 206 },
  { src: '/aaliya v1.mp4',  isVideo: true,  finalX: -515, finalY:  -80, rot: -5,  w: 190, h: 252 },
  { src: '/aal v3.mp4',     isVideo: true,  finalX:  545, finalY:  225, rot:  6,  w: 190, h: 252 },
];

export default function FireworksFinale() {
  const [isActive, setIsActive] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(true);
  const overlayRef        = useRef<HTMLDivElement>(null);
  const ballRef           = useRef<HTMLDivElement>(null);
  const explosionRef      = useRef<HTMLDivElement>(null);
  const textRef           = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const finaleAudioRef    = useRef<HTMLAudioElement | null>(null);
  const triggeredRef      = useRef(false);

  const startFireworks = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setIsActive(true);

    // Stop all other audio
    window.dispatchEvent(new CustomEvent('fireworks:start'));

    // Start Sign of the Times at the climax
    const audio = new Audio('/Harry Styles - Sign of the Times (Official Video).mp3');
    audio.currentTime = 74;
    audio.volume = 1.0;
    audio.play().catch(console.error);
    finaleAudioRef.current = audio;

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  /* Listen for terminal FIREWORKS command → fireworks:launch */
  useEffect(() => {
    const handler = () => startFireworks();
    window.addEventListener('fireworks:launch', handler);
    return () => window.removeEventListener('fireworks:launch', handler);
  }, [startFireworks]);

  /* Main animation effect */
  useEffect(() => {
    if (!isActive) {
      finaleAudioRef.current?.pause();
      finaleAudioRef.current = null;
      return;
    }

    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      /* ── INITIAL STATE ──────────────────────────────────────────────── */
      gsap.set('.finale-card', {
        x: () => (Math.random() - 0.5) * window.innerWidth * 2.6,
        y: () => (Math.random() - 0.5) * window.innerHeight * 2.6,
        opacity: 0, scale: 0.35,
        rotate: () => (Math.random() - 0.5) * 100,
      });
      gsap.set('.bg-star', {
        x: () => (Math.random() - 0.5) * window.innerWidth * 2,
        y: () => (Math.random() - 0.5) * window.innerHeight * 2,
        opacity: 0, scale: () => 0.5 + Math.random() * 2,
      });
      gsap.set('.nebula-cloud', {
        x: () => (Math.random() - 0.5) * window.innerWidth,
        y: () => (Math.random() - 0.5) * window.innerHeight,
        opacity: 0, scale: () => 0.4 + Math.random(),
      });

      /* ── PHASE A: AWAKENING — cards fly from far to center ──────────── */
      tl.set(overlayRef.current, { opacity: 1 })
        .to('.bg-star', {
          opacity: () => 0.3 + Math.random() * 0.7,
          duration: 2, stagger: { amount: 1.2 }, ease: 'power2.out',
        })
        .to('.nebula-cloud', {
          opacity: () => 0.05 + Math.random() * 0.12,
          duration: 3, stagger: { amount: 1 }, ease: 'power1.out',
        }, '<')
        .to('.finale-card', {
          x: 0, y: 0, opacity: 1, scale: 1,
          rotate: () => (Math.random() - 0.5) * 18,
          duration: 2, stagger: 0.045, ease: 'power3.out',
        }, '<0.3');

      /* ── PHASE B: SWIRL TO SINGULARITY ──────────────────────────────── */
      tl.to('.finale-card', {
        x: 0, y: 0, scale: 0.012, opacity: 0.7,
        rotate: '+=1440',
        duration: 2.8,
        stagger: { amount: 1.2, from: 'random' },
        ease: 'power2.inOut',
      }, '+=0.2')
      .to('.bg-star',      { x: 0, y: 0, opacity: 0, duration: 2.2, ease: 'power2.in' }, '<')
      .to('.nebula-cloud', { x: 0, y: 0, scale: 0.1, opacity: 0, duration: 2.8, ease: 'power2.in' }, '<')
      .to(cardsContainerRef.current, { rotate: 1080, duration: 2.8, ease: 'power2.in' }, '<');

      /* ── PHASE C: EXPLOSION ─────────────────────────────────────────── */
      tl.to(ballRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: 'expo.out' }, '-=0.3')
        .to(ballRef.current, {
          boxShadow: '0 0 280px 130px #fff, 0 0 560px 260px #ff3300',
          filter: 'brightness(8)', scale: 2.2, duration: 0.8, ease: 'power4.in',
        })
        .to(ballRef.current,   { scale: 100, opacity: 0, duration: 0.16, ease: 'power4.in' })
        .to(overlayRef.current, { backgroundColor: '#ff1a00', duration: 0.04 }, '<')
        .to(explosionRef.current, { scale: 50, opacity: 1, duration: 0.6, ease: 'power4.out' }, '<')
        .to(overlayRef.current, {
          background: 'radial-gradient(circle at center, #1a0000 0%, #000000 100%)',
          duration: 1.5,
        })
        .to(explosionRef.current, { opacity: 0, duration: 1 }, '-=0.8');

      /* ── PHASE D: TEXT REVEAL ───────────────────────────────────────── */
      tl.set(cardsContainerRef.current, { rotate: 0 });

      // Delete cards from DOM exactly when explosion ends (no fade — hard cut)
      tl.call(() => setCardsVisible(false))
      // Stars burst outward from the explosion epicentre
      .to('.phm-particle', {
        opacity: (i: number) => (i % 3 === 0 ? 0.95 : 0.5),
        scale: 'random(0.6, 4)',
        x: () => (Math.random() - 0.5) * window.innerWidth * 1.8,
        y: () => (Math.random() - 0.5) * window.innerHeight * 1.8,
        duration: 9, stagger: { amount: 0.6, from: 'center' }, ease: 'power2.out',
      })
      // Text fades in on clean dark canvas (stars already filling the bg)
      .to(textRef.current, {
        opacity: 1, y: 0, scale: 1, duration: 2.2, ease: 'power2.out',
      }, '<0.4');

    }, overlayRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [isActive]);

  const handleClose = () => {
    triggeredRef.current = false;
    setCardsVisible(true);
    setIsActive(false);
  };

  return (
    <>
      {/* ── Footer trigger ─────────────────────────────────────────────── */}
      <footer style={{
        minHeight: '40vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)',
        borderTop: '1px solid var(--border)',
        padding: '4rem 0', position: 'relative', zIndex: 5,
      }}>
        <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, var(--accent), transparent)', marginBottom: '2rem' }} />
        {!isActive && (
          <button
            onClick={startFireworks}
            style={{
              background: 'none', border: '1px solid var(--accent)',
              color: 'var(--accent)', padding: '1.2rem 3.5rem',
              borderRadius: '100px', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: '0.72rem',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              transition: 'all 0.4s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--background)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--accent)'; }}
          >
            Let's Have Some Fireworks, Shall We?
          </button>
        )}
        <p className="editorial-sub" style={{ marginTop: '2rem', opacity: 0.3, letterSpacing: '0.5em' }}>
          END OF VOLUME I
        </p>
      </footer>

      {/* ── Full-screen overlay ─────────────────────────────────────────── */}
      {isActive && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', opacity: 0,
          }}
        >
          {/* Ambient nebula background */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(circle at 50% 50%, rgba(51,0,0,1) 0%, #000 100%),
              radial-gradient(circle at 78% 22%, rgba(255,0,0,0.1) 0%, transparent 40%),
              radial-gradient(circle at 22% 78%, rgba(255,60,0,0.08) 0%, transparent 40%)
            `,
          }} />

          {/* Nebula clouds */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`nc-${i}`} className="nebula-cloud" style={{
              position: 'absolute', width: '580px', height: '580px',
              background: i % 2 === 0 ? 'rgba(255,20,0,0.1)' : 'rgba(100,0,0,0.14)',
              filter: 'blur(140px)', borderRadius: '50%', pointerEvents: 'none',
              left: '50%', top: '50%', marginLeft: '-290px', marginTop: '-290px',
            }} />
          ))}

          {/* Background stars */}
          {Array.from({ length: 280 }).map((_, i) => (
            <div key={`s-${i}`} className="bg-star" style={{
              position: 'absolute',
              width:  i % 15 === 0 ? '60px' : i % 5 === 0 ? '4px' : '1.5px',
              height: i % 15 === 0 ? '60px' : i % 5 === 0 ? '4px' : '1.5px',
              background: i % 15 === 0 ? 'rgba(255,20,0,0.15)' : '#fff',
              borderRadius: '50%',
              filter: i % 15 === 0 ? 'blur(20px)' : 'none',
              boxShadow: i % 5 === 0 ? '0 0 12px rgba(255,50,0,0.8)' : 'none',
              opacity: 0, pointerEvents: 'none', left: '50%', top: '50%',
            }} />
          ))}

          {/* ── Media cards container ─────────────────────────────────── */}
          {cardsVisible && (
            <div ref={cardsContainerRef} style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {ITEMS.map((item, i) => (
                <div key={i} className="finale-card" style={{
                  position: 'absolute',
                  width: `${item.w}px`, height: `${item.h}px`,
                  borderRadius: '3px', overflow: 'hidden',
                  boxShadow: '0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,60,60,0.18)',
                  left: `calc(50% - ${item.w / 2}px)`,
                  top:  `calc(50% - ${item.h / 2}px)`,
                }}>
                  {item.isVideo ? (
                    <video src={item.src} autoPlay muted loop playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <img src={item.src} alt="" draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Singularity ball */}
          <div ref={ballRef} style={{
            position: 'absolute',
            width: '40px', height: '40px', background: '#fff', borderRadius: '50%',
            boxShadow: '0 0 120px 60px #fff, 0 0 300px 150px #ff2200, 0 0 600px 300px rgba(255,50,0,0.4)',
            opacity: 0, scale: 0, zIndex: 100,
            left: 'calc(50% - 20px)', top: 'calc(50% - 20px)',
          }} />

          {/* Explosion halo */}
          <div ref={explosionRef} style={{
            position: 'absolute',
            width: '40vh', height: '40vh',
            background: 'radial-gradient(circle, #fff 0%, #ff1a1a 40%, #5e0000 70%, transparent 100%)',
            borderRadius: '50%', opacity: 0, scale: 0, zIndex: 95, pointerEvents: 'none',
            left: 'calc(50% - 20vh)', top: 'calc(50% - 20vh)',
          }} />

          {/* Text reveal — sits above cards */}
          <div ref={textRef} style={{
            position: 'absolute', zIndex: 250, textAlign: 'center',
            opacity: 0, transform: 'translateY(80px) scale(0.95)',
            width: '100%', left: 0, top: '50%', marginTop: '-180px',
            pointerEvents: 'none',
          }}>
            <p className="editorial-sub" style={{
              marginBottom: '1.5rem', opacity: 0.85,
              letterSpacing: '0.6em', color: '#ffaaaa',
            }}>
              A GIFT FROM THE STARS
            </p>
            <h2 className="editorial-title" style={{
              fontSize: 'clamp(3.5rem, 14vw, 11rem)',
              lineHeight: 0.85, marginBottom: '2rem',
              color: '#fff', textShadow: '0 0 40px rgba(255,0,0,0.6), 0 0 80px rgba(255,0,0,0.3)',
            }}>
              Happy Birthday,<br />
              <span className="editorial-italic" style={{ color: '#ff3333' }}>Aaliya</span>
            </h2>
            <div style={{
              width: '120px', height: '1px',
              background: 'linear-gradient(to right, transparent, #ff3333, transparent)',
              margin: '2.5rem auto', opacity: 0.8,
            }} />
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--sans)', letterSpacing: '0.3em',
                fontSize: '0.65rem', textTransform: 'uppercase',
                cursor: 'pointer', padding: '0.8rem 2.2rem',
                borderRadius: '100px', backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease', pointerEvents: 'auto',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              ← Re-enter the Archive
            </button>
          </div>

          {/* Post-explosion bokeh particles */}
          {Array.from({ length: 220 }).map((_, i) => (
            <div key={`p-${i}`} className="phm-particle" style={{
              position: 'absolute',
              width:  i % 20 === 0 ? '100px' : i % 8 === 0 ? '7px' : '2px',
              height: i % 20 === 0 ? '100px' : i % 8 === 0 ? '7px' : '2px',
              background: i % 12 === 0 ? 'rgba(255,40,0,0.4)' : i % 5 === 0 ? '#ff4d00' : '#fff',
              boxShadow: i % 8 === 0 ? '0 0 18px rgba(255,30,0,0.8)' : 'none',
              filter: i % 20 === 0 ? 'blur(40px)' : 'none',
              borderRadius: '50%', opacity: 0,
              zIndex: i % 2 === 0 ? 105 : 90,
              pointerEvents: 'none', left: '50%', top: '50%',
            }} />
          ))}

          {/* ── POST-PROCESSING STACK ──────────────────────────────────── */}
          {/* P1: Deep vignette */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 400, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 75% at 50% 50%, transparent 25%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.9) 100%)' }} />
          {/* P2: Film grain — animated */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 401, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat', backgroundSize: '280px 280px',
            opacity: 0.055, mixBlendMode: 'overlay',
            animation: 'fwGrain 0.1s steps(1) infinite',
          }} />
          {/* P3: Red chromatic fringe — top-left */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 402, pointerEvents: 'none',
            background: 'linear-gradient(to bottom right, rgba(255,15,15,0.04) 0%, transparent 45%)',
            mixBlendMode: 'screen', transform: 'translate(-1.5px, 0)',
          }} />
          {/* P4: Blue chromatic fringe — bottom-right */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 402, pointerEvents: 'none',
            background: 'linear-gradient(to top left, rgba(15,15,255,0.028) 0%, transparent 45%)',
            mixBlendMode: 'screen', transform: 'translate(1.5px, 0)',
          }} />
          {/* P5: Warm color burn tint */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 403, pointerEvents: 'none',
            background: 'rgba(255,10,0,0.04)', mixBlendMode: 'color-burn' }} />

          <style>{`
            @keyframes fwGrain {
              0%  { background-position:   0%   0%; }
              20% { background-position:  35%  15%; }
              40% { background-position:  75%  55%; }
              60% { background-position:  15%  80%; }
              80% { background-position:  55%  30%; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
