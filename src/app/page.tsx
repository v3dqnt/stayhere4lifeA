'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ZSpaceCamera from '@/components/ZSpaceCamera';
import KineticLayer from '@/components/KineticLayer';
import HeartAnimation from '@/components/HeartAnimation';
import MusicSelector from '@/components/MusicSelector';
import MemoryGallery from '@/components/MemoryGallery';
import LettersSection from '@/components/LettersSection';
import FireworksFinale from '@/components/FireworksFinale';
import IkaGlobe from '@/components/IkaGlobe';

import Preloader from '@/components/Preloader';


export default function Home() {
  const narrativeRef = useRef<HTMLDivElement>(null);
  const [showIkaGlobe, setShowIkaGlobe] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Force scroll to top on reload to start with iPod
    window.scrollTo(0, 0);
    // Also handle cases where browser tries to restore scroll
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, []);

  const handleProceed = () => {
    narrativeRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIkaGlobe = () => {
    setShowIkaGlobe(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseGlobe = () => {
    setShowIkaGlobe(false);
    document.body.style.overflow = '';
  };

  return (
    <main>
      <AnimatePresence>
        {!isReady && (
          <Preloader key="preloader" onComplete={() => setIsReady(true)} />
        )}
      </AnimatePresence>

      {isReady && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          {!showIkaGlobe ? (
            <div key="main-page-content">
              {/* ─── Section 1: iPod Music Selector ─── */}
              <MusicSelector onProceed={handleProceed} onIkaGlobe={handleIkaGlobe} />

              {/* ─── Section 2: Kinetic Z-Space Narrative ─── */}
              <div ref={narrativeRef}>
                <ZSpaceCamera>
                  <KineticLayer>
                    <div style={{ textAlign: 'center' }}>
                      <p className="editorial-sub" style={{ marginBottom: '2rem' }}>Volume I</p>
                      <h1 className="editorial-title">
                        Hey! <span className="editorial-italic">Aaliya</span>
                      </h1>
                      <p className="editorial-sub" style={{ marginTop: '2rem', opacity: 0.5 }}>
                        A Personal Archive
                      </p>
                    </div>
                  </KineticLayer>

                  <KineticLayer>
                    <div style={{ maxWidth: '800px', padding: '0 2rem', textAlign: 'center' }}>
                      <h2 className="editorial-title" style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)', lineHeight: 1.3 }}>
                        Today's about <span className="editorial-italic">you</span>—but honestly, you deserve appreciation way more than just one day.
                      </h2>
                    </div>
                  </KineticLayer>

                  <KineticLayer>
                    <div style={{ maxWidth: '750px', padding: '0 2rem', textAlign: 'center' }}>
                      <p className="editorial-title" style={{ fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', lineHeight: 1.5 }}>
                        It's strange how someone can become a part of your <span className="editorial-italic">thoughts</span> without asking. But you did—and now even ordinary days carry a hint of you.
                      </p>
                    </div>
                  </KineticLayer>

                  <KineticLayer>
                    <div style={{ maxWidth: '750px', padding: '0 2rem', textAlign: 'center' }}>
                      <p className="editorial-title" style={{ fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', lineHeight: 1.5 }}>
                        You have this natural way of making people feel comfortable and <span className="editorial-italic">happy</span> without even trying. It's rare, and it's something that makes you <span className="editorial-italic">unforgettable</span> in the best way.
                      </p>
                    </div>
                  </KineticLayer>

                  <KineticLayer>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        width: '1px', height: '80px',
                        background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)',
                        marginBottom: '2.5rem',
                      }} />
                      <p className="editorial-sub" style={{ marginBottom: '1rem', opacity: 0.6 }}>A few frames worth keeping</p>
                      <h2 className="editorial-title" style={{ fontSize: 'clamp(2rem, 8vw, 6.5rem)', color: 'var(--foreground)' }}>
                        A <span className="editorial-italic">memory lane</span>
                      </h2>
                      <div style={{
                        width: '1px', height: '80px',
                        background: 'linear-gradient(to bottom, var(--accent), transparent)',
                        marginTop: '2.5rem',
                      }} />
                      <p className="editorial-sub" style={{ opacity: 0.4, marginTop: '2.5rem' }}>scroll to enter →</p>
                    </div>
                  </KineticLayer>
                </ZSpaceCamera>
              </div>

              {/* ─── Section 4: Horizontal Memory Gallery ─── */}
              <MemoryGallery />

              <LettersSection />

              <FireworksFinale />
            </div>
          ) : (
            <IkaGlobe key="ika-globe-view" onClose={handleCloseGlobe} />
          )}
        </motion.div>
      )}
    </main>
  );
}
