'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ASSETS = [
  // Music
  '/Anna%20Karenina.mp3',
  "/Hold%20On,%20We're%20Going%20Home%20(feat.%20Majid%20Jordan).mp3",
  '/Lana%20Del%20Rey%20-%20A&W%20(Audio).mp3',
  '/The%20Weeknd%20-%20Wicked%20Games%20(Official%20Video%20-%20Explicit).mp3',
  '/Harry%20Styles%20-%20Sign%20of%20the%20Times%20(Official%20Video).mp3',
  "/Don't%20Let%20Me%20Go%20-%20Cigarettes%20After%20Sex.mp3",
  '/Passionfruit.mp3',
  
  // Images (Covers)
  '/Anna%20Karenina%20Cover.png',
  "/hold%20on%20we're%20going%20home%20cover.jpg",
  '/a&w.png',
  '/Wicked%20Games.jpg',
  '/Passionfruit.png',
  '/rose.png',
  '/lily.png',
  '/tulip.png',
  '/lavender.png',
  '/leaf.png',
  '/wrap.png',
  
  // Images (Memories)
  '/aaliya.png',
  '/aaliya%202.jpeg',
  '/aaliya%203.jpg',
  '/aaliya%204.jpeg',
  '/aal9.jpeg',
  '/aal10.jpeg',
  '/aal11.jpeg',
  '/aal12.jpeg',
  '/aal13.jpeg',
  '/aal14.jpeg',
  '/aal15.jpeg',
  '/aal%205.jpeg',
  '/aal6.jpeg',
  '/aal%207.jpeg',
  '/aal%208.jpeg',
  '/EARTH.png',
  '/MOONSURFACE.png',
  '/NIGHTSKY.png',
  '/lunar_earth.png',
  '/lunar_sky.png',
  '/lunar_terrain.png',
  '/lunar_earthrise.png',
  '/beach.png',
  
  // Videos
  '/aaliya%20v1.mp4',
  '/aaliya%20v2.mp4',
  '/aal%20v3.mp4',
  
  // Models
  '/scifi_cartoon_rocket.obj',

  // Remote Textures
  'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg',
  'https://threejs.org/examples/textures/planets/moon_1024.jpg'
];

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing Archive...');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let loaded = 0;
    const total = ASSETS.length;

    const increment = (url: string) => {
      loaded++;
      const p = Math.floor((loaded / total) * 100);
      setProgress(p);
      
      // Extract filename for status
      const filename = url.split('/').pop()?.split('?')[0] || url;
      setStatus(`Loading: ${decodeURIComponent(filename)}`);

      if (loaded === total) {
        setTimeout(() => {
          setStatus('Archive Ready.');
          setIsFinished(true);
        }, 800);
      }
    };

    ASSETS.forEach(url => {
      const ext = url.split('.').pop()?.toLowerCase();

      if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
        // Use Fetch + Response.blob() for more reliable caching of large media
        fetch(url)
          .then(res => res.blob())
          .then(() => increment(url))
          .catch(() => increment(url));
      } else if (['mp4', 'webm'].includes(ext || '')) {
        // Videos can be large, fetch them to ensure cache
        fetch(url)
          .then(res => res.blob())
          .then(() => increment(url))
          .catch(() => increment(url));
      } else if (['obj'].includes(ext || '')) {
        fetch(url)
          .then(res => res.text())
          .then(() => increment(url))
          .catch(() => increment(url));
      } else {
        const img = new Image();
        img.src = url;
        img.onload = () => increment(url);
        img.onerror = () => increment(url);
      }
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,50,50,0.05) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '300px' }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '0.65rem',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '2rem'
          }}
        >
          {status}
        </motion.p>

        {/* Progress Bar Container */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              background: 'var(--accent, #fff)',
              boxShadow: '0 0 15px var(--accent)'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ 
                fontFamily: 'var(--sans)', 
                fontSize: '0.6rem', 
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.1em'
            }}>
                {progress}%
            </span>
            <span style={{ 
                fontFamily: 'var(--sans)', 
                fontSize: '0.6rem', 
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.1em'
            }}>
                COORD: 45.2N / 12.8W
            </span>
        </div>

        <AnimatePresence>
          {isFinished && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onComplete}
              style={{
                marginTop: '4rem',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                padding: '0.8rem 3rem',
                borderRadius: '100px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Enter Sanctuary —
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Poetic Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 1 }}
        style={{
          position: 'absolute',
          bottom: '4rem',
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: '0.9rem',
          color: '#fff',
          maxWidth: '240px',
          textAlign: 'center',
          lineHeight: 1.6
        }}
      >
        "Wait for a moment, as we gather the pieces of a story still being written."
      </motion.p>
    </motion.div>
  );
}
