import React, { useState, useRef } from 'react';
import { useMIDI } from '../../hooks/useMIDI';
import { useLayout } from '../../hooks/useLayout';

export default function HorizontalBendStrip() {
  const [value, setValue] = useState(0); // -1 to 1
  const [isActive, setIsActive] = useState(false);
  const { sendPitchBend } = useMIDI();
  const stripRef = useRef<HTMLDivElement>(null);
  const layout = useLayout();

  if (!layout.showBendHorizontal) return null;

  const updatePitchBend = (v: number) => {
    const clamped = Math.max(-1, Math.min(1, v));
    setValue(clamped);
    
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
    const x = e.clientX - rect.left;
    const normalized = x / rect.width; // 0 to 1
    const bendVal = (normalized * 2) - 1; // -1 to 1
    updatePitchBend(bendVal);
  };

  const handlePointerUp = () => {
    setIsActive(false);
    const startValue = value;
    const startTime = performance.now();
    const duration = 150;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
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

  return (
    <div 
      ref={stripRef}
      className="w-full bg-[#0A0A0A] border-b border-[#141414] relative flex items-center px-4 cursor-ew-resize touch-none select-none bend-strip"
      style={{ height: '24px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="absolute inset-x-0 h-[1px] bg-[#2e2e2e]" />
      <div className="absolute left-1/2 -translate-x-1/2 h-full w-[1px] bg-white/10" />
      
      <div 
        className="absolute w-8 h-4 bg-[#1D9E75] rounded shadow-[0_0_10px_rgba(29,158,117,0.3)] flex items-center justify-center gap-0.5 z-10"
        style={{ 
          left: `calc(${(value + 1) / 2 * 100}% - 16px)`,
        }}
      >
        <div className="h-3 w-[1px] bg-black/40" />
        <div className="h-3 w-[1px] bg-black/40" />
      </div>
      
      <span className="absolute left-2 font-black text-[#666] uppercase tracking-[0.2em] pointer-events-none" style={{ fontSize: 'var(--font-xs)' }}>Bend</span>
    </div>
  );
}
