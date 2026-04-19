'use client';

import React from 'react';

interface KineticLayerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function KineticLayer({ children, className = '', style }: KineticLayerProps) {
  return (
    <div className={`camera-layer ${className}`} style={style}>
      <div className="layer-content">
        {children}
      </div>
    </div>
  );
}
