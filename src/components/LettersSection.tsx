'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LETTERS = [
  {
    id: 1,
    sender: "Ethereal Echoes",
    preview: "A note on the first time we met...",
    content: "It isn't just that you're here—it's that you're here so completely. You have this way of being present that turns a simple conversation into a lifelong memory. I hope these frames do justice to that feeling.",
    rotation: -4,
    sealImage: '/seal_portrait_1_1776103499711.png'
  },
  {
    id: 2,
    sender: "Quiet Observations",
    preview: "Something I noticed about you...",
    content: "There's a specific kind of light you bring into a room. It's not loud or flashy; it's steady, like the blue of the sky just before sunset. It's the kind of light that makes everything else feel possible.",
    rotation: 6,
    sealImage: '/seal_portrait_2_1776103518653.png'
  },
  {
    id: 3,
    sender: "Final Regards",
    preview: "Before this archive closes...",
    content: "The best stories aren't the ones with the most pages, but the ones with the most meaning. You've taught me more about grace and humor in our short time than most people do in a decade. Keep shining, Aaliya.",
    rotation: -2,
    sealImage: '/seal_portrait_3_1776103536992.png'
  }
];

export default function LettersSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const ctx = gsap.context(() => {
      gsap.from('.letter-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.5,
        },
        y: 150,
        rotate: 15,
        opacity: 0,
        stagger: 0.3,
        ease: 'power3.out'
      });

      // Floating animation for decorative items
      gsap.to('.floating-item', {
        y: 'random(-20, 20)',
        x: 'random(-10, 10)',
        rotation: 'random(-15, 15)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          amount: 2,
          from: 'random'
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="letters-section-wrapper">
      <section 
        ref={containerRef}
        style={{
          minHeight: '140vh',
          padding: '20vh 5vw',
          background: 'var(--background)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* ── Background Decorative Elements ─────────────────────────────── */}
        <div className="bg-decorations" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {/* Architectural Lines */}
          <div style={{ position: 'absolute', top: '20%', left: '5%', width: '40%', height: '1px', background: 'var(--accent)', opacity: 0.08, transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '30%', height: '1px', background: 'var(--accent)', opacity: 0.08, transform: 'rotate(10deg)' }} />
          
          {isMounted && (
            <>
              {/* Floating Stars */}
              {[...Array(6)].map((_, i) => (
                <div key={`star-${i}`} className="floating-item" style={{
                  position: 'absolute',
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 90 + 5}%`,
                  opacity: 0.15,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)">
                    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                  </svg>
                </div>
              ))}

              {/* Floating Hearts */}
              {[...Array(4)].map((_, i) => (
                <div key={`heart-${i}`} className="floating-item" style={{
                  position: 'absolute',
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 90 + 5}%`,
                  opacity: 0.12,
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--accent)">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              ))}
            </>
          )}

          {/* Decorative Seals/Patterns */}
          <div style={{ position: 'absolute', top: '10%', right: '10%', opacity: 0.04, transform: 'rotate(15deg)' }}>
            <svg width="400" height="400" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" stroke="var(--accent)" fill="none" strokeWidth="0.5" strokeDasharray="2,2" />
               <circle cx="50" cy="50" r="35" stroke="var(--accent)" fill="none" strokeWidth="0.2" />
            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '4rem', zIndex: 10 }}>
          <p className="editorial-sub" style={{ marginBottom: '1.2rem', color: 'var(--accent)', fontWeight: 600, transition: 'color 0.8s ease' }}>PRIVATE CORRESPONDENCE</p>
          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', transition: 'color 0.8s ease' }}>
            The <span className="editorial-italic">Mailbox</span>
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6rem',
          width: '100%',
          maxWidth: '1400px',
          zIndex: 10
        }}>
          {LETTERS.map((letter) => (
            <div 
              key={letter.id}
              className="letter-card"
              onClick={() => setOpenId(openId === letter.id ? null : letter.id)}
              style={{
                width: '320px',
                height: '450px',
                position: 'relative',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
                transform: `rotate(${letter.rotation}deg) scale(${openId === letter.id ? 1.05 : 1})`,
              }}
            >
              {/* The Envelope - Classic Vertical Letter Shape */}
              <div style={{
                width: '100%',
                height: '100%',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                boxShadow: openId === letter.id 
                  ? 'var(--card-shadow)' 
                  : '0 20px 60px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                padding: '2.5rem',
                zIndex: 5,
                position: 'relative',
                transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
                transform: openId === letter.id ? 'translateY(180px) rotateX(-15deg)' : 'none',
                overflow: 'hidden'
              }}>
                {/* Envelope Flap Detail */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '40%',
                  background: 'var(--header-bg)',
                  clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
                  opacity: 0.5,
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.8s ease'
                }} />

                {/* Circular Wax-Style Photo Seal */}
                <div style={{
                  position: 'absolute', top: '25%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '64px', height: '64px',
                  borderRadius: '50%',
                  background: 'white',
                  border: '3px solid #f8fafc',
                  boxShadow: '0 8px 20px rgba(56, 189, 248, 0.3)',
                  zIndex: 6,
                  overflow: 'hidden',
                  transition: 'all 0.5s ease'
                }}>
                  <img 
                    src={letter.sealImage} 
                    alt="sender"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.2)' }}
                  />
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: '0.6rem', letterSpacing: '0.2rem', color: 'var(--accent)', fontWeight: 800, marginBottom: '0.8rem', transition: 'color 0.8s ease' }}>
                    EXPEDITION_NO_{letter.id}
                  </p>
                  <div style={{ width: '40px', height: '1px', background: 'var(--accent)', opacity: 0.3, marginBottom: '1.2rem', transition: 'background 0.8s ease' }} />
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--foreground)', opacity: 0.6, lineHeight: 1.4, transition: 'color 0.8s ease' }}>
                    {letter.preview}
                  </p>
                </div>
              </div>

              {/* The Actual Letter Paper (Slides Out) */}
              <div style={{
                position: 'absolute',
                top: '5%', left: '15px', right: '15px',
                height: '90%',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                padding: '3rem 2.5rem',
                boxShadow: '0 5px 25px rgba(0,0,0,0.03)',
                zIndex: openId === letter.id ? 10 : 1,
                opacity: openId === letter.id ? 1 : 0,
                transform: openId === letter.id ? 'translateY(-230px) scale(1.02)' : 'translateY(0)',
                transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.8s ease',
                pointerEvents: openId === letter.id ? 'auto' : 'none',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                 {/* Paper texture detail */}
                 <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '20px 20px', transition: 'opacity 0.8s ease' }} />
                 
                 <div style={{ 
                  fontFamily: 'var(--serif)', 
                  fontSize: '1.05rem', 
                  lineHeight: 1.9, 
                  color: 'var(--foreground)',
                  position: 'relative',
                  transition: 'color 0.8s ease'
                }}>
                  {letter.content}
                </div>
                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                   <div style={{ width: '30px', height: '1px', background: 'var(--accent)', opacity: 0.4 }} />
                   <span style={{ fontFamily: 'var(--sans)', fontSize: '0.6rem', letterSpacing: '0.2rem', color: 'var(--accent)', fontWeight: 700 }}>VERIFIED_SENDER</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Final Line */}
        <div style={{
          marginTop: '8rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 0.3
        }}>
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
           </svg>
        </div>
      </section>
    </div>
  );
}
