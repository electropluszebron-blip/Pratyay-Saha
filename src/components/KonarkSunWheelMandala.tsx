import React, { useId } from 'react';

interface KonarkSunWheelMandalaProps {
  size?: number;
  className?: string;
  isDark?: boolean;
  opacity?: number;
  showBindu?: boolean;
}

export const KonarkSunWheelMandala: React.FC<KonarkSunWheelMandalaProps> = ({
  size = 500,
  className = '',
  isDark = false,
  opacity = 0.85,
  showBindu = true,
}) => {
  const uniqueId = useId().replace(/[:]/g, '');
  const goldPrimary = isDark ? '#F5C84C' : '#C88A2C';
  const goldLight = isDark ? '#FFE58F' : '#E5A93C';
  const terracottaRed = isDark ? '#D85A2A' : '#B93826';
  const deepGold = isDark ? '#8A6715' : '#8B5A2B';

  const gradOuterId = `goldGradOuter_${uniqueId}`;
  const gradSpokeId = `goldGradSpoke_${uniqueId}`;

  return (
    <div 
      className={`relative flex items-center justify-center select-none pointer-events-none max-w-[95vw] max-h-[95vw] will-change-transform ${className}`}
      style={{ 
        width: size, 
        height: size, 
        maxWidth: '95vw', 
        maxHeight: '95vw', 
        opacity,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Radiant Cosmic Bindu Pulse Glowing Core */}
      {showBindu && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-r from-[#E5A93C]/40 via-[#B93826]/30 to-[#F5C84C]/40 blur-xl animate-bindu-pulse will-change-transform" />
        </div>
      )}

      {/* TIER 1: Outer 24-Petal Sacred Lotus & Bishnupur Terracotta Beaded Rim (Clockwise Slow) */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 w-full h-full animate-mandala-cw-slow will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        <defs>
          <linearGradient id={gradOuterId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={goldLight} stopOpacity="0.9" />
            <stop offset="50%" stopColor={goldPrimary} stopOpacity="0.75" />
            <stop offset="100%" stopColor={terracottaRed} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Outer Beaded Boundary Ring */}
        <circle cx="250" cy="250" r="240" fill="none" stroke={`url(#${gradOuterId})`} strokeWidth="2" strokeDasharray="4,5" />
        <circle cx="250" cy="250" r="232" fill="none" stroke={goldPrimary} strokeWidth="1.5" strokeOpacity="0.8" />
        <circle cx="250" cy="250" r="218" fill="none" stroke={goldLight} strokeWidth="1" strokeDasharray="2,3" />

        {/* 24-Petal Sacred Lotus Border (Bishnupur Terracotta Pattern) */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <g key={`petal-24-${i}`} transform={`rotate(${angle} 250 250)`}>
              {/* Outer Lotus Arc */}
              <path
                d="M 240 18 Q 250 6 260 18 Q 266 32 250 36 Q 234 32 240 18 Z"
                fill="none"
                stroke={goldLight}
                strokeWidth="1.6"
                strokeOpacity="0.9"
              />
              <circle cx="250" cy="22" r="2.5" fill={terracottaRed} />
              <line x1="250" y1="36" x2="250" y2="48" stroke={goldPrimary} strokeWidth="1.2" strokeOpacity="0.7" />
            </g>
          );
        })}

        {/* 24 Outer Sun Flare Dots */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24 + 7.5;
          return (
            <circle
              key={`dot-24-${i}`}
              cx="250"
              cy="236"
              r="2"
              fill={goldLight}
              transform={`rotate(${angle} 250 250)`}
            />
          );
        })}
      </svg>

      {/* TIER 2: Middle Konark Sun Wheel with 8 Major Spokes + 8 Minor Spoke Medallions */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 w-full h-full animate-mandala-ccw-slower will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        <defs>
          <linearGradient id={gradSpokeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={goldLight} />
            <stop offset="50%" stopColor={goldPrimary} />
            <stop offset="100%" stopColor={deepGold} />
          </linearGradient>
        </defs>

        {/* Konark Intermediate Rim */}
        <circle cx="250" cy="250" r="185" fill="none" stroke={`url(#${gradSpokeId})`} strokeWidth="2.5" />
        <circle cx="250" cy="250" r="175" fill="none" stroke={goldPrimary} strokeWidth="1" strokeDasharray="3,4" />
        <circle cx="250" cy="250" r="120" fill="none" stroke={goldLight} strokeWidth="1.5" />

        {/* 8 Major Konark Celestial Spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <g key={`major-spoke-${i}`} transform={`rotate(${angle} 250 250)`}>
              {/* Spoke Shaft */}
              <line x1="247" y1="120" x2="247" y2="185" stroke={`url(#${gradSpokeId})`} strokeWidth="1.5" />
              <line x1="253" y1="120" x2="253" y2="185" stroke={`url(#${gradSpokeId})`} strokeWidth="1.5" />
              <line x1="250" y1="120" x2="250" y2="185" stroke={goldLight} strokeWidth="1" strokeDasharray="4,2" />

              {/* Spoke Carved Medallion */}
              <circle cx="250" cy="152" r="10" fill={isDark ? '#1C1612' : '#FDFBF7'} stroke={goldPrimary} strokeWidth="1.5" />
              <circle cx="250" cy="152" r="6" fill="none" stroke={terracottaRed} strokeWidth="1.2" />
              <circle cx="250" cy="152" r="2.5" fill={goldLight} />
            </g>
          );
        })}

        {/* 8 Minor Solar Ray Spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8 + 22.5;
          return (
            <g key={`minor-spoke-${i}`} transform={`rotate(${angle} 250 250)`}>
              <line x1="250" y1="124" x2="250" y2="182" stroke={goldPrimary} strokeWidth="2" strokeOpacity="0.85" />
              {/* Diamond Finial */}
              <path
                d="M 250 146 L 253 152 L 250 158 L 247 152 Z"
                fill={goldLight}
                stroke={terracottaRed}
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </svg>

      {/* TIER 3: Inner 16-Petal Sacred Lotus & Cosmic Concentric Geometry (Clockwise Medium) */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 w-full h-full animate-mandala-cw-medium will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* 16-Petal Sacred Inner Lotus */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={`petal-16-${i}`} transform={`rotate(${angle} 250 250)`}>
              <path
                d="M 244 148 Q 250 134 256 148 Q 254 168 250 174 Q 246 168 244 148 Z"
                fill={isDark ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.2)'}
                stroke={goldLight}
                strokeWidth="1.4"
              />
              <circle cx="250" cy="142" r="2" fill={terracottaRed} />
            </g>
          );
        })}

        {/* Concentric Geometric Inner Core Rings */}
        <circle cx="250" cy="250" r="75" fill="none" stroke={goldLight} strokeWidth="1.8" />
        <circle cx="250" cy="250" r="62" fill="none" stroke={goldPrimary} strokeWidth="1" strokeDasharray="2,3" />
        <circle cx="250" cy="250" r="48" fill="none" stroke={terracottaRed} strokeWidth="1.5" />
        <circle cx="250" cy="250" r="32" fill="none" stroke={goldLight} strokeWidth="1.8" />

        {/* 8 Geometric Core Star Rays */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <line
              key={`core-ray-${i}`}
              x1="250"
              y1="220"
              x2="250"
              y2="204"
              stroke={goldLight}
              strokeWidth="1.5"
              transform={`rotate(${angle} 250 250)`}
            />
          );
        })}
      </svg>

      {/* CORE: Radiant Cosmic Bindu Pulse (Center Focal Energy Point) */}
      <div className="relative z-10 animate-bindu-pulse flex items-center justify-center will-change-transform" style={{ transform: 'translateZ(0)' }}>
        <div 
          className="w-12 h-12 rounded-full border-2 border-[#FFE58F] flex items-center justify-center shadow-lg"
          style={{
            background: `radial-gradient(circle, #FFF4D0 0%, ${goldLight} 50%, ${terracottaRed} 100%)`,
            boxShadow: `0 0 24px ${goldLight}, 0 0 45px ${terracottaRed}80`
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-md animate-ping opacity-75" />
          <div className="absolute w-3 h-3 rounded-full bg-[#8B2213] border border-white" />
        </div>
      </div>
    </div>
  );
};
