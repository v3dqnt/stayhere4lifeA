'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MEMORIES = [
  {
    id: '01',
    keyword: 'SPARK',
    title: 'THE FIRST SPARK',
    story: "It was a Tuesday that didn't know it was special yet. You were just there.",
    image: '/aaliya.png',
    pos: { x: 0, y: 0 },
    aspect: '9/16',
    width: '480px'
  },
  {
    id: '02',
    keyword: 'STEADY',
    title: 'SILENT COMFORT',
    story: "You are a quiet, steady frequency that makes the noise of everything else fade.",
    image: '/aaliya 2.jpeg',
    pos: { x: 1200, y: -600 },
    aspect: '16/10',
    width: '720px'
  },
  {
    id: '03',
    keyword: 'FRAME',
    title: 'THE ARCHIVE',
    story: "Every laugh and small gesture of yours is now a permanent frame in my mind.",
    image: '/aaliya 3.jpg',
    pos: { x: -1400, y: 400 },
    aspect: '16/10',
    width: '720px'
  },
  {
    id: '04',
    keyword: 'MAGIC',
    title: 'ORDINARY MAGIC',
    story: "Even coffee runs feel like a cinematic sequence when you're there.",
    image: '/aaliya 4.jpeg',
    pos: { x: 400, y: 1500 },
    aspect: '9/16',
    width: '480px'
  },
  {
    id: '05',
    keyword: 'ETHEREAL',
    title: 'SOFT LIGHT',
    story: "There's a specific kind of light that only seems to find you in the crowd.",
    image: '/aaliya v1.mp4',
    pos: { x: -3200, y: -2400 },
    aspect: '9/16',
    width: '480px'
  },
  {
    id: '06',
    keyword: 'RHYTHM',
    title: 'INTERNAL PACE',
    story: "I like how you move through the world. No rush, just pure intent.",
    image: '/aaliya v2.mp4',
    pos: { x: 4800, y: 1200 },
    aspect: '9/16',
    width: '480px',
    rotate: -90
  },
  {
    id: '07',
    keyword: 'TIMELESS',
    title: 'FOREVER MOMENT',
    story: "Some moments deserve to be paused, framed, and looked at forever.",
    image: '/aal9.jpeg',
    pos: { x: -5400, y: -4800 },
    aspect: '16/10',
    width: '760px'
  },
  {
    id: '08',
    keyword: 'HOME',
    title: 'A FINER PLACE',
    story: "Being around you feels like coming exactly where I was meant to be.",
    image: '/aal10.jpeg',
    pos: { x: 3600, y: -6200 },
    aspect: '9/16',
    width: '500px'
  },
  {
    id: '09',
    keyword: 'ECHO',
    title: 'LINGERING SILENCE',
    story: "Even after you leave the room, your energy stays tucked in the corners.",
    image: '/aal11.jpeg',
    pos: { x: 8000, y: -2000 },
    aspect: '16/10',
    width: '800px'
  },
  {
    id: '10',
    keyword: 'GLOW',
    title: 'RADIANT TRACE',
    story: "You leave a trail of better moods behind you everywhere you go.",
    image: '/aal12.jpeg',
    pos: { x: 6000, y: 4000 },
    aspect: '9/16',
    width: '480px'
  },
  {
    id: '11',
    keyword: 'ROOTED',
    title: 'DEEP GROUND',
    story: "There is an honesty in your laugh that I keep coming back to.",
    image: '/aal13.jpeg',
    pos: { x: -2000, y: 8500 },
    aspect: '16/10',
    width: '840px'
  },
  {
    id: '12',
    keyword: 'ALWAYS',
    title: 'THE FINAL FRAME',
    story: "This archive isn't finished. It's just getting its first few chapters.",
    image: '/aal14.jpeg',
    pos: { x: -8500, y: 5500 },
    aspect: '9/16',
    width: '520px'
  },
  {
    id: '13',
    keyword: 'ESSENCE',
    title: 'PURE SPIRIT',
    story: "Sometimes you don't even have to say anything. You just exist, and it's enough.",
    image: '/aal15.jpeg',
    pos: { x: -10000, y: -2000 },
    aspect: '9/16',
    width: '480px'
  }
];

type Sticker = {
  id: number;
  type: 'butterfly' | 'star' | 'circle' | 'heart' | 'camera' | 'music';
  top: string;
  left: string;
  scale: number;
};

export default function MemoryGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Increase particle density and focus on themed stickers
    const newStickers: Sticker[] = Array.from({ length: 180 }).map((_, i) => ({
      id: i,
      type: (['star', 'heart', 'butterfly', 'camera', 'music', 'circle'] as const)[i % 6],
      top: `${Math.random() * 900 - 450}%`,
      left: `${Math.random() * 900 - 450}%`,
      scale: 0.2 + Math.random() * 1.6,
    }));
    setStickers(newStickers);
  }, []);

  useEffect(() => {
    if (!mounted || stickers.length === 0) return;

    const ctx = gsap.context(() => {
      // Twinkle animation for stars
      gsap.to('.sticker-star', {
        opacity: 0.2,
        duration: 'random(0.5, 2)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { amount: 3, from: 'random' }
      });

      const frames = gsap.utils.toArray('.mograph-frame') as HTMLElement[];
      const butterflyEls = gsap.utils.toArray('.butterfly') as HTMLElement[];
      
      gsap.fromTo('.lead-in-line', {
        strokeDashoffset: 1200,
        opacity: 0,
      }, {
        strokeDashoffset: 0,
        opacity: 0.6,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 95%',
          end: 'top 10%',
          scrub: 1.5,
        },
        stagger: 0.2,
        ease: 'none'
      });

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${window.innerHeight * frames.length * 4}`,
          pin: true,
          scrub: 2,
        }
      });

      butterflyEls.forEach((b) => {
        gsap.to(b, {
          x: 'random(-60, 60)',
          y: 'random(-60, 60)',
          rotate: 'random(-30, 30)',
          duration: 'random(4, 9)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });

      frames.forEach((frame, i) => {
        const mem = MEMORIES[i];
        const content = frame.querySelector('.frame-content');
        const media = frame.querySelector('.frame-media');
        const bgText = frame.querySelector('.bg-keyword');
        
        gsap.set(content, { opacity: 0, x: i % 2 === 0 ? 50 : -50, rotate: i % 2 === 0 ? 3 : -3 });
        gsap.set(media, { opacity: 0, scale: 0.9, y: 100, rotate: i % 2 === 0 ? -5 : 5 });
        gsap.set(bgText, { opacity: 0, scale: 1.2, x: i % 2 === 0 ? -100 : 100 });

        const start = i * 3.5;

        mainTl
          .to(cameraRef.current, {
            x: -mem.pos.x,
            y: -mem.pos.y,
            rotate: i % 2 === 0 ? -1.5 : 1.5,
            duration: 3,
            ease: 'sine.inOut'
          }, start)
          .to(bgText, { opacity: 0.06, x: 0, scale: 1, duration: 2.5, ease: 'power2.out' }, start + 0.5)
          .to(media, { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 2, ease: 'power3.out' }, start + 0.8)
          .to(content, { opacity: 1, x: 0, rotate: 0, duration: 1.5, ease: 'power2.out' }, start + 1.5)
          .to({}, { duration: 2 });

        if (i < frames.length - 1) {
          mainTl.to([media, content, bgText], { 
            opacity: 0, 
            y: -80, 
            x: i % 2 === 0 ? 40 : -40,
            duration: 1.5, 
            ease: 'power2.in' 
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [stickers]);

  return (
    <div className="memory-gallery-container">
      <section 
        ref={containerRef} 
        className="memory-gallery-root"
        style={{ 
          height: '100vh', width: '100vw', background: 'var(--background)',
          overflow: 'hidden', position: 'relative'
        }}
      >
        {mounted && (
          <div ref={cameraRef} style={{ width: '100%', height: '100%', position: 'relative', transformOrigin: 'center center' }}>
            
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, overflow: 'visible' }}>
              <path className="lead-in-line" d="M-100,200 Q400,-100 800,200 T1800,200" stroke="var(--accent)" fill="none" strokeWidth="1" strokeDasharray="1200" />
              <path className="lead-in-line" d="M-200,600 Q600,1000 1200,600 T2400,600" stroke="var(--accent)" fill="none" strokeWidth="0.5" strokeDasharray="1200" />
              <path className="lead-in-line" d="M100,-100 C400,500 800,0 1200,500" stroke="var(--accent)" fill="none" strokeWidth="1.5" strokeDasharray="1200" opacity="0.3" />
              <path className="lead-in-line" d="M300,-400 Q800,200 300,800 T-300,1800" stroke="var(--accent)" fill="none" strokeWidth="0.8" strokeDasharray="1500" opacity="0.4" />
              <path className="lead-in-line" d="M1500,100 C1000,400 500,-200 0,300" stroke="var(--accent)" fill="none" strokeWidth="1.2" strokeDasharray="1500" opacity="0.2" />
            </svg>

          <svg style={{ position: 'absolute', inset: '-150%', width: '400%', height: '400%', pointerEvents: 'none', opacity: 0.15 }}>
             {MEMORIES.map((m, i) => i < MEMORIES.length - 1 && (
               <path 
                 key={`line-${i}`}
                 d={`M${m.pos.x + window.innerWidth/2},${m.pos.y + window.innerHeight/2} 
                    C${m.pos.x + 800},${m.pos.y - 400} 
                    ${MEMORIES[i+1].pos.x - 800},${MEMORIES[i+1].pos.y + 400} 
                    ${MEMORIES[i+1].pos.x + window.innerWidth/2},${MEMORIES[i+1].pos.y + window.innerHeight/2}`} 
                 stroke="var(--accent)" fill="none" strokeWidth="1.5" strokeDasharray="5,15" 
               />
             ))}
          </svg>

          {/* Additional Decorative Elements for Placeholders */}
          {MEMORIES.map((m, i) => {
            if (i < 5) return null; // Don't change anything abt aaliya 1,2,3,4 frames
            
            return (
              <div key={`decor-${i}`} style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(-50%, -50%) translate(${m.pos.x}px, ${m.pos.y}px)`,
                pointerEvents: 'none',
                zIndex: 0,
                width: '100vw',
                height: '100vh'
              }}>
                {/* Flowy Narrative Lines */}
                <svg 
                  width="1400" height="800" viewBox="0 0 1400 800"
                  style={{
                    position: 'absolute',
                    left: '-700px', top: '-400px',
                    opacity: 0.12
                  }}
                >
                  <path d="M0,400 Q350,100 700,400 T1400,400" stroke="var(--accent)" fill="none" strokeWidth="0.8" strokeDasharray="10,20" />
                  <path d="M0,200 C400,800 1000,0 1400,600" stroke="var(--accent)" fill="none" strokeWidth="0.5" opacity="0.5" />
                </svg>

                {/* Decorative Hearts and Butterflies */}
                {Array.from({ length: 6 }).map((_, n) => (
                  <div key={`heart-btk-${n}`} style={{
                    position: 'absolute',
                    left: `${(n * 25) % 80 - 40}%`,
                    top: `${(n * 19) % 80 - 40}%`,
                    opacity: 0.2,
                    transform: `scale(${0.3 + Math.random()})`
                  }}>
                    {n % 2 === 0 ? (
                      <svg width="60" height="60" viewBox="0 0 24 24">
                        <path d="M12 21.6s-9-4.8-9-10.8c0-3.31 2.69-6 6-6 1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.31 0 6 2.69 6 6 0 6-9 10.8-9 10.8z" fill="var(--accent)" />
                      </svg>
                    ) : (
                      <svg width="80" height="80" viewBox="0 0 100 100" className="butterfly">
                        <path d="M50,50 C30,20 10,40 50,50 C10,60 30,80 50,50 C70,80 90,60 50,50 C90,40 70,20 50,50" fill="var(--accent)" />
                      </svg>
                    )}
                  </div>
                ))}

                {/* Architectural Grid Segment */}
                <div style={{
                  position: 'absolute',
                  inset: '-500px',
                  backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`,
                  backgroundSize: '100px 100px',
                  opacity: 0.03,
                  maskImage: 'radial-gradient(circle, black 0%, transparent 80%)'
                }} />

                {/* Technical Data Fragments */}
                {Array.from({ length: 12 }).map((_, k) => (
                  <div key={`data-${k}`} style={{
                    position: 'absolute',
                    left: `${(k * 17) % 100}%`,
                    top: `${(k * 23) % 100}%`,
                    fontFamily: 'var(--sans)',
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    color: 'var(--accent)',
                    opacity: 0.15,
                    transform: `rotate(${k % 2 === 0 ? 90 : 0}deg)`
                  }}>
                    {k % 3 === 0 ? 'COORD: 45.2N / 12.8W' : k % 3 === 1 ? 'FILE_ID: 0x' + (i*k).toString(16).toUpperCase() : 'STATUS: ARCHIVED'}
                  </div>
                ))}

                {/* Big North Stars */}
                {[1, 2, 3].map((s) => (
                  <svg 
                    key={`star-decor-${s}`}
                    width="400" height="400" viewBox="0 0 100 100" 
                    style={{ 
                      position: 'absolute', 
                      left: s === 1 ? '-600px' : s === 2 ? '400px' : '-200px',
                      top: s === 1 ? '-400px' : s === 2 ? '200px' : '500px',
                      opacity: 0.08,
                      filter: 'blur(1px)',
                      transform: `scale(${0.5 + Math.random()})`
                    }}
                  >
                    <path d="M50,0 L52,48 L100,50 L52,52 L50,100 L48,52 L0,50 L48,48 Z" fill="var(--accent)" />
                  </svg>
                ))}

                {/* Complex Orbit Lines */}
                <svg 
                  width="1200" height="1200" viewBox="0 0 400 400"
                  style={{
                    position: 'absolute',
                    left: '-600px', top: '-600px',
                    opacity: 0.06
                  }}
                >
                  <circle cx="200" cy="200" r="160" stroke="var(--accent)" fill="none" strokeWidth="0.5" strokeDasharray="2,10" />
                  <circle cx="200" cy="200" r="240" stroke="var(--accent)" fill="none" strokeWidth="0.2" />
                  <path d="M0,200 Q200,400 400,200" stroke="var(--accent)" fill="none" strokeWidth="0.1" />
                  <path d="M200,0 Q400,200 200,400" stroke="var(--accent)" fill="none" strokeWidth="0.1" />
                </svg>

                {/* Large Atmospheric Glows */}
                <div style={{
                  position: 'absolute',
                  width: '1200px', height: '1200px',
                  background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(255,50,50,0.03)' : 'rgba(50,50,255,0.03)'} 0%, transparent 60%)`,
                  left: '-600px', top: '-600px',
                  borderRadius: '50%',
                  filter: 'blur(60px)'
                }} />
              </div>
            );
          })}

          {stickers.map((s) => (
            <div 
              key={`stk-${s.id}`} 
              className={s.type === 'star' ? 'sticker-star' : 'butterfly'} 
              style={{
                position: 'absolute', top: s.top, left: s.left,
                zIndex: 20, pointerEvents: 'none', transform: `scale(${s.scale})`,
                opacity: s.type === 'star' ? 0.8 : 0.4,
                filter: s.type === 'star' ? 'drop-shadow(0 0 5px var(--accent))' : 'none'
              }}
            >
              {s.type === 'butterfly' && (
                <svg width="40" height="40" viewBox="0 0 100 100">
                  <path d="M50,50 C30,20 10,40 50,50 C10,60 30,80 50,50 C70,80 90,60 50,50 C90,40 70,20 50,50" fill="var(--accent)" />
                </svg>
              )}
              {s.type === 'heart' && (
                <svg width="34" height="34" viewBox="0 0 24 24">
                  <path d="M12 21.6s-9-4.8-9-10.8c0-3.31 2.69-6 6-6 1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.31 0 6 2.69 6 6 0 6-9 10.8-9 10.8z" fill="var(--accent)" opacity="0.3" />
                </svg>
              )}
              {s.type === 'star' && (
                <svg width="20" height="20" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="2" fill="white" />
                  <path d="M50,0 L60,40 L100,50 L60,60 L50,100 L40,60 L0,50 L40,40 Z" fill="var(--accent)" />
                </svg>
              )}
              {s.type === 'camera' && (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--accent)" opacity="0.4">
                  <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
                  <path d="M9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
              )}
              {s.type === 'music' && (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent)" opacity="0.4">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              )}
              {s.type === 'circle' && (
                <svg width="10" height="10" viewBox="0 0 100 100" opacity="0.2">
                  <circle cx="50" cy="50" r="50" fill="var(--accent)" />
                </svg>
              )}
            </div>
          ))}

          {MEMORIES.map((mem, i) => (
            <div 
              key={mem.id}
              className="mograph-frame"
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(-50%, -50%) translate(${mem.pos.x}px, ${mem.pos.y}px)`,
                width: '80vw', height: '80vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <div className="bg-keyword" style={{
                position: 'absolute', zIndex: 1,
                fontFamily: 'var(--serif)', fontSize: '20vw', fontWeight: 900,
                color: 'var(--accent)', pointerEvents: 'none', userSelect: 'none',
                filter: 'blur(1px)'
              }}>
                {mem.keyword}
              </div>

              <div className="frame-media" style={{
                width: mem.width, aspectRatio: mem.aspect,
                background: 'var(--card-bg)', 
                borderRadius: '16px', zIndex: 5,
                boxShadow: 'var(--card-shadow)',
                overflow: 'hidden', border: '1px solid var(--border)',
                position: 'relative',
                transition: 'background 0.8s ease, box-shadow 0.8s ease'
              }}>
                <div style={{
                  height: '34px', background: 'var(--header-bg)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px',
                  position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 2,
                  transition: 'background 0.8s ease'
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                </div>
                <div style={{ padding: '44px 10px 10px 10px', height: '100%' }}>
                  <div style={{ 
                    flex: 1, 
                    height: '100%', 
                    background: 'var(--card-bg)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'background 0.8s ease'
                  }}>
                    {mem.image.endsWith('.mp4') ? (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        <video 
                          src={mem.image}
                          autoPlay 
                          muted 
                          loop 
                          playsInline
                          style={{ 
                            width: (mem as {rotate?: number}).rotate ? '170%' : '100%', 
                            height: (mem as {rotate?: number}).rotate ? '170%' : '100%', 
                            objectFit: 'cover',
                            transform: (mem as {rotate?: number}).rotate ? `rotate(${(mem as {rotate?: number}).rotate}deg)` : 'none',
                            filter: 'contrast(1.1) saturate(1.1) brightness(1.05)'
                          }}
                        />
                      </div>
                    ) : (
                      <img 
                        src={mem.image} 
                        alt={mem.title}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          filter: 'contrast(1.15) saturate(1.15) brightness(1.05)'
                        }}
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />
                  </div>
                </div>
              </div>

              <div className="frame-content" style={{
                position: 'absolute', right: '5%', top: '60%',
                width: '280px', background: 'var(--card-bg)', padding: '2rem',
                borderRadius: '4px', boxShadow: 'var(--card-shadow)',
                zIndex: 10, border: '1px solid var(--border)',
                transition: 'background 0.8s ease'
              }}>
                <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.4rem', color: 'var(--accent)', marginBottom: '1.2rem', fontWeight: 800, transition: 'color 0.8s ease' }}>{mem.title}</h3>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--foreground)', lineHeight: 1.6, transition: 'color 0.8s ease' }}>{mem.story}</p>
              </div>
            </div>
          ))}
          </div>
        )}
      </section>
    </div>
  );
}
