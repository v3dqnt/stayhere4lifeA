'use client';

import { useState, useEffect } from 'react';

const TARGET_DATE = new Date('2026-05-16T00:00:00');

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = TARGET_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        setIsLocked(false);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const initialTime = calculateTimeLeft();
    if (initialTime) {
      setTimeLeft(initialTime);
      const timer = setInterval(() => {
        const time = calculateTimeLeft();
        if (time) {
          setTimeLeft(time);
        } else {
          setIsLocked(false);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsLocked(false);
    }
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch
  if (!isLocked) return <>{children}</>;

  return (
    <div className="maintenance-container">
      <div className="ice-background" />
      <div className="overlay" />
      
      <div className="content">
        <p className="sub-title">The Sanctuary is currently</p>
        <h1 className="title">Frozen in Time</h1>
        
        <div className="countdown">
          <div className="time-block">
            <span className="value">{timeLeft.days}</span>
            <span className="label">Days</span>
          </div>
          <div className="time-block">
            <span className="value">{timeLeft.hours}</span>
            <span className="label">Hours</span>
          </div>
          <div className="time-block">
            <span className="value">{timeLeft.minutes}</span>
            <span className="label">Minutes</span>
          </div>
          <div className="time-block">
            <span className="value">{timeLeft.seconds}</span>
            <span className="label">Seconds</span>
          </div>
        </div>
        
        <p className="footer-text">Thawing on May 16th, 12:00 AM</p>
      </div>
    </div>
  );
}
