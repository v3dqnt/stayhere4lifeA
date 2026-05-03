'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LETTERS = [
  {
    id: 2,
    sender: "Ashwini",
    preview: "They say friends are family you chose...",
    content: "TO ALLYYYYYYYYYYY 💝,\n\nThey say friends are family you chose. And im really grateful that you are the part of that chosen family🥰. Im really grateful for friend like you who is fun to talk to and doing random questionable things walking down the hallway😜. I remember how we met for the first time in 9th and we both didnt like each other🙄. But as we got to know each other more i think our love for each other really grew over the years😜. We have had a lot of fights💜 but end up talking again cause no matter how much we fight lm not leaving you ever🤸♀️! Ally is my most trustworthy best friend and my biggest secret keeper. I trust you so so much. Am so grateful that in a generation where poeple barely care about each other i ended up with most amazing friends ever👭. HAPPY BIRRHDAY🥳 TO ALLY! Enjoy your day and KEEP DROPPING ALL THAT GLITTER GORGEOUS!😝💝🥰",
    rotation: 6,
  },
  {
    id: 3,
    sender: "Kanak",
    preview: "Happiest birthday to you...",
    content: "Dear ally,\n\nYou've been a great friend or should I say family to me you're gorgeous you're pretty you're confident you're so nice and don't let anyone take that away from you ever be yourself enjoy everybit of life don't let some failed lab experiment let down your confidence I love these things about you cheers to one more year added to this best life you're going to live ahead... Don't worry about the future or career you're smart just do your best and you'll make it of course I love you so much and I wish we keep being friends for as long as I'll live happiest birthday to you dear 🎀💫💕",
    rotation: -2,
  }
];

export default function LettersSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [readingId, setReadingId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (readingId !== null) {
      gsap.fromTo('.dialog-paper', 
        { scaleY: 0, scaleX: 0.8, y: 100, rotationX: -30, opacity: 0, transformOrigin: 'bottom center' },
        { scaleY: 1, scaleX: 1, y: 0, rotationX: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [readingId]);

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

                {/* Read Letter Button instead of Name Pill */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setReadingId(letter.id);
                  }}
                  style={{
                  position: 'absolute', top: '25%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--accent)',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '30px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                  zIndex: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.5s ease',
                  cursor: 'pointer'
                }}>
                  <span style={{
                    fontFamily: 'var(--sans)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.1rem',
                    color: 'var(--accent)',
                    whiteSpace: 'nowrap'
                  }}>
                    READ LETTER
                  </span>
                </button>

                <div style={{ marginTop: 'auto' }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--foreground)', fontWeight: 600, marginBottom: '0.8rem', transition: 'color 0.8s ease' }}>
                    From: <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{letter.sender}</span>
                  </p>
                  <div style={{ width: '40px', height: '1px', background: 'var(--accent)', opacity: 0.3, marginBottom: '1.2rem', transition: 'background 0.8s ease' }} />
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--foreground)', opacity: 0.6, lineHeight: 1.4, transition: 'color 0.8s ease' }}>
                    {letter.preview}
                  </p>
                </div>
              </div>

              {/* The Actual Letter Paper (Slides Out) */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setReadingId(letter.id);
                }}
                style={{
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
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}>
                 {/* Paper texture detail */}
                 <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '20px 20px', transition: 'opacity 0.8s ease' }} />
                 
                 <div style={{ 
                  fontFamily: 'var(--serif)', 
                  fontSize: '0.95rem', 
                  lineHeight: 1.7, 
                  color: 'var(--foreground)',
                  position: 'relative',
                  transition: 'color 0.8s ease',
                  whiteSpace: 'pre-wrap',
                  overflow: 'hidden',
                  maxHeight: '130px',
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
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
                   <span style={{ fontFamily: 'var(--serif)', fontSize: '1rem', fontStyle: 'italic', color: 'var(--accent)', fontWeight: 600 }}>{letter.sender}</span>
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

      {/* Full Screen Letter Reading Dialog */}
      {readingId !== null && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            perspective: '1000px'
          }}
          onClick={() => setReadingId(null)}
        >
          <div 
            className="dialog-paper"
            style={{
              background: 'var(--card-bg)',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '85vh',
              padding: '4rem',
              position: 'relative',
              borderRadius: '2px',
              border: '1px solid var(--border)',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px inset rgba(255,255,255,0.05)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              transformStyle: 'preserve-3d'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Paper texture */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
            
            <button 
              onClick={() => setReadingId(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--foreground)',
                opacity: 0.5,
                padding: '0.5rem',
                fontSize: '1.5rem',
                zIndex: 10,
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
              ✕
            </button>

            <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', position: 'relative' }}>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.75rem', letterSpacing: '0.3rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem' }}>
                PRIVATE CORRESPONDENCE
              </p>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', color: 'var(--foreground)' }}>
                From: <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{LETTERS.find(l => l.id === readingId)?.sender}</span>
              </h3>
            </div>

            <div style={{ 
                fontFamily: 'var(--serif)', 
                fontSize: '1.15rem', 
                lineHeight: 2, 
                color: 'var(--foreground)',
                whiteSpace: 'pre-wrap',
                position: 'relative',
                zIndex: 1
              }}>
                {LETTERS.find(l => l.id === readingId)?.content}
            </div>
            
            <div style={{ marginTop: '4rem', opacity: 0.4, alignSelf: 'center', position: 'relative' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
