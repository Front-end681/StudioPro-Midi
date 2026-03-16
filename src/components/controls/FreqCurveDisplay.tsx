import React from 'react';
import { FREQ_TABLE } from '../../utils/frequencyWeight';

interface FreqCurveDisplayProps {
  amount: number;
}

export const FreqCurveDisplay: React.FC<FreqCurveDisplayProps> = ({ amount }) => {
  const width = 300;
  const height = 100;
  const padding = 20;
  
  const points = FREQ_TABLE.map((entry) => {
    const x = (entry.note / 127) * (width - 2 * padding) + padding;
    // factor 1.0 is middle (height/2)
    // factor 1.4 is top
    // factor 0.6 is bottom
    const factor = 1.0 + (entry.factor - 1.0) * amount;
    const y = height / 2 - (factor - 1.0) * (height / 0.8) * 0.5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mt-4 bg-[#0f0f0f] rounded-xl p-4 border border-[#2e2e2e]">
      <div className="flex justify-between text-[9px] text-[#666] uppercase tracking-widest mb-2">
        <span>Bass boost ↑</span>
        <span>Treble reduce ↓</span>
      </div>
      
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Reference line */}
        <line 
          x1={padding} y1={height/2} 
          x2={width-padding} y2={height/2} 
          stroke="#2e2e2e" strokeDasharray="4 4" 
        />
        
        {/* Curve */}
        <polyline
          fill="none"
          stroke="#1D9E75"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="transition-all duration-300"
        />
        
        {/* Note markers */}
        {[24, 48, 60, 72, 96].map(note => {
          const x = (note / 127) * (width - 2 * padding) + padding;
          return (
            <g key={note}>
              <line x1={x} y1={height/2 - 5} x2={x} y2={height/2 + 5} stroke="#444" />
              <text x={x} y={height - 5} textAnchor="middle" fontSize="8" fill="#444">
                C{Math.floor(note/12 - 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
