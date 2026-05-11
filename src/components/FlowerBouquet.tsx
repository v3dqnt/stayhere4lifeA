'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import anime from 'animejs';

const FLOWER_TYPES = [
  { id: 'rose', name: 'Midnight Rose', color: '#e11d48', src: '/rose.png' },
  { id: 'lily', name: 'Celestial Lily', color: '#f0f9ff', src: '/lily.png' },
  { id: 'tulip', name: 'Golden Tulip', color: '#fbbf24', src: '/tulip.png' },
  { id: 'lavender', name: 'Lavender Sprite', color: '#a78bfa', src: '/lavender.png' },
  { id: 'leaf', name: 'Silver Eucalyptus', color: '#94a3b8', src: '/leaf.png' },
];

interface FlowerInstance {
  id: number;
  type: typeof FLOWER_TYPES[0];
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
}

export default function FlowerBouquet({ onClose }: { onClose: () => void }) {
  const [bouquet, setBouquet] = useState<FlowerInstance[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const addFlower = (type: typeof FLOWER_TYPES[0]) => {
    if (isDone) return;
    // Limit to 15 flowers to keep it elegant
    if (bouquet.length >= 15) return;
    
    const newFlower: FlowerInstance = {
      id: Date.now(),
      type,
      // Increased range to reduce overlap
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 180 - 40,
      rotation: (Math.random() - 0.5) * 60,
      scale: 0.65 + Math.random() * 0.25, // Slightly smaller to help with overlap
      delay: Math.random() * 500,
    };
    setBouquet([...bouquet, newFlower]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: 'var(--background)', // Use app theme background
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: 'var(--foreground)',
      }}
    >
      {/* Editorial Noise & Texture */}
      <div className="noise-overlay" style={{ opacity: 0.08 }} />
      <div className="vintage-vignette" />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', maxWidth: '1200px', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {!isDone ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>
                  Secret Archive · Garden
                </p>
                <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--foreground)', lineHeight: 1.1 }}>
                  Pick your <span className="editorial-italic">favourites</span>
                </h2>
              </div>

              {/* Selection HUD — Cuter & Fancier */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {FLOWER_TYPES.map(f => (
                  <motion.button
                    key={f.id}
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addFlower(f)}
                    style={{
                      background: 'var(--glass)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid var(--border)',
                      padding: '1.2rem 1rem',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.8rem',
                      width: '120px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={f.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `drop-shadow(0 4px 8px ${f.color}44)` }} />
                    </div>
                    <span style={{ fontFamily: 'var(--sans)', fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--foreground)', opacity: 0.8 }}>{f.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Builder Workspace */}
              <div ref={containerRef} style={{ 
                width: '450px', 
                height: '450px', 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '1rem 0'
              }}>
                {/* Decorative Frame */}
                <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--border)', borderRadius: '50%', opacity: 0.3 }} />
                <div style={{ position: 'absolute', inset: '40px', border: '1px dashed var(--border)', borderRadius: '50%', opacity: 0.1 }} />

                <AnimatePresence>
                  {bouquet.map((f) => (
                    <motion.div
                      key={f.id}
                      initial={{ scale: 0, opacity: 0, y: 100 }}
                      animate={{ scale: f.scale, opacity: 1, y: f.y, x: f.x, rotate: f.rotation }}
                      style={{ position: 'absolute', pointerEvents: 'none', zIndex: 10 }}
                    >
                      <img 
                        src={f.type.src} 
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' 
                        }} 
                      />
                      {/* Stem */}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '-20px', 
                        left: '50%', 
                        width: '1px', 
                        height: '140px', 
                        background: 'linear-gradient(to top, transparent, #2d5a27)',
                        transform: 'translateX(-50%)',
                        zIndex: -1,
                        opacity: 0.4
                      }} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {bouquet.length === 0 && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.2rem' }}
                    >
                        Your bouquet will bloom here
                    </motion.p>
                )}
              </div>

              <div style={{ height: '60px' }}>
                <AnimatePresence>
                    {bouquet.length > 3 && (
                        <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsDone(true)}
                        style={{
                            background: 'var(--foreground)',
                            color: 'var(--background)',
                            border: 'none',
                            padding: '0.8rem 3rem',
                            borderRadius: '100px',
                            fontFamily: 'var(--serif)',
                            fontSize: '1.2rem',
                            fontStyle: 'italic',
                            cursor: 'pointer',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                        >
                        Wrap & Give →
                        </motion.button>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="finale"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', cursor: !isRevealed ? 'pointer' : 'default' }}
              onClick={() => !isRevealed && setIsRevealed(true)}
            >
               <div style={{ position: 'relative', width: '500px', height: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 
                 {/* The Wrapping Paper Cone — MOVED UP */}
                 <motion.img 
                   initial={{ opacity: 0, y: 80, scale: 0.9 }}
                   animate={{ 
                     opacity: isRevealed ? 0 : 1, 
                     y: isRevealed ? 100 : 0,
                     scale: isRevealed ? 0.8 : 1 
                   }}
                   transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                   src="/wrap.png"
                   style={{ 
                     position: 'absolute', 
                     top: '180px', 
                     width: '400px', 
                     zIndex: 5,
                     filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.4))'
                   }}
                 />

                 {/* Final Bouquet — BUNCHE TIGHTLY INSIDE THE WRAP */}
                 <div style={{ position: 'absolute', top: '220px', width: '100%', height: '200px', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
                    {bouquet.map((f, i) => (
                        <motion.div
                        key={f.id}
                        initial={{ opacity: 0, scale: 0, y: 200 }}
                        animate={{ 
                            opacity: isRevealed ? 0 : 1,
                            scale: isRevealed ? 2 : [f.scale * 1.2, f.scale * 1.25, f.scale * 1.2],
                            y: isRevealed ? -600 : (f.y * 0.4) - 70, // Jump up when revealed
                            x: isRevealed ? (f.x * 2) : f.x * 0.7 
                        }}
                        transition={{ 
                            opacity: { delay: isRevealed ? 0 : 1.2 + i * 0.1, duration: 0.8 },
                            y: { delay: isRevealed ? i * 0.05 : 1.2 + i * 0.1, duration: isRevealed ? 1.5 : 1.5, ease: [0.16, 1, 0.3, 1] },
                            scale: { duration: isRevealed ? 1.5 : 4, repeat: isRevealed ? 0 : Infinity, delay: i * 0.2 }
                        }}
                        style={{ 
                            position: 'absolute', 
                            rotate: f.rotation,
                        }}
                        >
                        <img 
                            src={f.type.src} 
                            style={{ 
                            width: '140px', 
                            height: '140px', 
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))'
                            }} 
                        />
                        </motion.div>
                    ))}
                 </div>
                 
                 {/* Hint to click — Static & Highly Visible */}
                 {!isRevealed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        style={{ 
                            position: 'absolute', 
                            bottom: '80px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '0.8rem',
                            zIndex: 40,
                            pointerEvents: 'none'
                        }}
                    >
                        <span style={{ 
                            fontFamily: 'var(--sans)', 
                            fontSize: '0.8rem', 
                            letterSpacing: '0.4em', 
                            textTransform: 'uppercase', 
                            color: 'var(--accent)',
                            fontWeight: 600,
                            textShadow: '0 0 20px rgba(var(--accent-rgb), 0.3)'
                        }}>
                            Touch the bouquet to open
                        </span>
                        <div style={{ width: '1px', height: '30px', background: 'var(--accent)', opacity: 0.5 }} />
                    </motion.div>
                 )}
                 
                 {/* Message over the bouquet — REVEALED ON CLICK */}
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, pointerEvents: 'none' }}>
                    <AnimatePresence>
                        {isRevealed && (
                            <motion.div
                                initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                style={{ 
                                background: 'rgba(var(--background-rgb), 0.4)', 
                                backdropFilter: 'blur(20px)', 
                                padding: '2.5rem 3.5rem', 
                                borderRadius: '28px', 
                                border: '1px solid var(--border)',
                                textAlign: 'center',
                                boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
                                maxWidth: '450px'
                                }}
                            >
                                <h3 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '2.8rem', marginBottom: '1.2rem', color: 'var(--foreground)' }}>
                                    For my honey
                                </h3>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 2 }}
                                    style={{ 
                                        fontFamily: 'var(--serif)', 
                                        fontSize: '1.15rem', // Increased as requested
                                        opacity: 0.9, 
                                        lineHeight: 1.7, 
                                        color: 'var(--foreground)',
                                        fontStyle: 'italic',
                                        textAlign: 'left'
                                    }}
                                >
                                    Aaliya, there’s something about your beauty that feels almost unreal… not just the way you look, but the way your presence changes everything around you, like the world softens just to match you. Honey, you carry this effortless grace that I can’t quite explain, and sweetu, every time I see you, it feels like I’m witnessing something rare, something I don’t ever want to lose sight of.
                                    <br /><br />
                                    And somewhere between all those quiet moments and the way you understand me without trying too hard, I've realized something simple but overwhelming… I absolutely adore you.
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
               </div>

               <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    padding: '0.8rem 2.5rem',
                    borderRadius: '100px',
                    fontFamily: 'var(--sans)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    marginTop: '2rem'
                  }}
                >
                  Return to Sanctuary
                </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back button (always visible) */}
      {!isDone && (
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '3rem', right: '4vw', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.5 }}
          >
            Exit Garden [×]
          </button>
      )}
    </motion.div>
  );
}
