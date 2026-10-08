import React from 'react';
import { KonarkSunWheelMandala } from './KonarkSunWheelMandala';

interface IndianCulturalCanvasProps {
  isDark: boolean;
}

export const IndianCulturalCanvas: React.FC<IndianCulturalCanvasProps> = ({ isDark }) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none transition-colors duration-500 overflow-hidden -z-20 ${
        isDark ? 'bg-[#120E0B]' : 'bg-[#FAF8F5]'
      }`}
    >
      {/* Subtle Alpona Heritage Geometric Motif Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `radial-gradient(${isDark ? '#D4AF37' : '#B93826'} 0.75px, transparent 0.75px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* 1. Top Left Floating Konark Sun Wheel */}
      <div className="absolute -top-28 -left-28 sm:-top-20 sm:-left-20 pointer-events-none">
        <KonarkSunWheelMandala
          size={360}
          isDark={isDark}
          opacity={isDark ? 0.3 : 0.22}
          showBindu={true}
        />
      </div>

      {/* 2. Bottom Right Floating Bishnupur Terracotta Mandala */}
      <div className="absolute -bottom-28 -right-28 sm:-bottom-20 sm:-right-20 pointer-events-none">
        <KonarkSunWheelMandala
          size={380}
          isDark={isDark}
          opacity={isDark ? 0.28 : 0.2}
          showBindu={true}
        />
      </div>
    </div>
  );
};
