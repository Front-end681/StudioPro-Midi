import React, { useState, useRef } from 'react';
import { useMIDI } from '../../hooks/useMIDI';
import { useResponsive } from '../../hooks/useResponsive';

export default function PitchBendWheel() {
  const [value, setValue] = useState(0); // -1 to 1, 0 is center
  const [isActive, setIsActive] = useState(false);
  const { sendPitchBend } = useMIDI();
  const stripRef = useRef<HTMLDivElement>(null);
  const { isMobile, isPortrait, isTablet } = useResponsive();

  // Hide on mobile portrait
  if (isMobile && isPortrait) return null;

  const updatePitchBend = (v: number) => {
    const clamped = Math.max(-1, Math.min(1, v));
    setValue(clamped);
    
    // MIDI 14-bit pitch bend: 0 to 16383, center 8192
    // Map -1..1 to 0..16383
    const normalizedValue = (clamped + 1) / 2;
    const midiValue = Math.round(normalizedValue * 16383);
    const lsb = midiValue & 0x7F;
    const msb = (midiValue >> 7) & 0x7F;
    sendPitchBend(lsb, msb);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsActive(true);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive || !stripRef.current) return;
    const rect = stripRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const normalized = 1 - (y / rect.height); // 0 to 1
    const bendVal = (normalized * 2) - 1; // -1 to 1
    updatePitchBend(bendVal);
  };

  const handlePointerUp = () => {
    setIsActive(false);
    // Spring back to center (0)
    const startValue = value;
    const startTime = performance.now();
    const duration = 150;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      const currentValue = startValue + (0 - startValue) * easeProgress;
      updatePitchBend(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        updatePitchBend(0);
      }
    };

    requestAnimationFrame(animate);
  };

  const getIndicatorTop = () => {
    if (!stripRef.current) return 0;
    const stripHeight = stripRef.current.clientHeight;
    const indicatorHeight = isMobile ? 16 : 20;
    // Formula: ((1 - (bendValue + 1) / 2) * (stripHeight - indicatorHeight))
    return ((1 - (value + 1) / 2) * (stripHeight - indicatorHeight));
  };

  const widthClass = isMobile ? 'w-8' : isTablet ? 'w-10' : 'w-11';

  return (
    <div 
      className={`${widthClass} h-full bg-[#1a1a1a] border-r border-[#2e2e2e] relative flex flex-col items-center py-2 cursor-ns-resize touch-none select-none transition-all duration-300`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <span className="text-[9px] sm:text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1 sm:mb-2">Bend</span>
      
      <div ref={stripRef} className="flex-1 w-full relative flex justify-center">
        {/* Track and Ticks */}
        <div className="absolute inset-y-0 w-[1px] bg-[#2e2e2e]" />
        
        {/* Top Tick */}
        <div className="absolute top-0 w-2 sm:w-3 h-[1px] bg-[#333]" />
        
        {/* Center Line (Visual Reference) */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/15 z-0" />
        
        {/* Bottom Tick */}
        <div className="absolute bottom-0 w-2 sm:w-3 h-[1px] bg-[#333]" />

        {/* Draggable Indicator */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 ${isMobile ? 'w-5 h-4' : 'w-7 h-5'} bg-[#1D9E75] rounded shadow-[0_0_10px_rgba(29,158,117,0.3)] flex flex-col items-center justify-center gap-0.5 z-10`}
          style={{ 
            top: `${getIndicatorTop()}px`,
            backgroundColor: 'var(--accent)',
          }}
        >
          <div className="w-3 sm:w-4 h-[1px] bg-white/40" />
          <div className="w-3 sm:w-4 h-[1px] bg-white/40" />
        </div>
      </div>
    </div>
  );
}
