import React from 'react';
import { FREQ_TABLE } from '../../utils/frequencyWeight';

interface FreqCurveDisplayProps {
  amount: number;
}

export const FreqCurveDisplay: React.FC<FreqCurveDisplayProps> = ({ amount }) => {
  const width = 300;
  const height = 80;
  const centerY = height / 2;
  const scaleFactor = 30;
  
  const points = FREQ_TABLE.map((entry) => {
    const x = (entry.note / 120) * width;
    const factor = entry.factor;
    const y = centerY - ((factor - 1.0) * amount * scaleFactor);
    return { x, y };
  });

  // Generate smooth cubic bezier path
  const generatePath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${cp1x} ${p0.y} ${cp1x} ${p1.y} ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curvePath = generatePath(points);
  const fillPath = `${curvePath} L ${width} ${centerY} L 0 ${centerY} Z`;

  return (
    <div className="mt-4 bg-[#0f0f0f] rounded-xl p-4 border border-[#2e2e2e]">
      <div className="flex justify-between text-[9px] text-[#666] uppercase tracking-widest mb-2">
        <span className="text-amber-500/80">Bass boost ↑</span>
        <span className="text-blue-500/80">Treble reduce ↓</span>
      </div>
      
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <clipPath id="clip-above">
            <rect x="0" y="0" width={width} height={centerY} />
          </clipPath>
          <clipPath id="clip-below">
            <rect x="0" y={centerY} width={width} height={centerY} />
          </clipPath>
        </defs>

        {/* Reference line */}
        <line 
          x1="0" y1={centerY} 
          x2={width} y2={centerY} 
          stroke="#2e2e2e" strokeDasharray="4 4" 
        />
        
        {/* Fills */}
        <path d={fillPath} fill="#f59e0b" fillOpacity="0.2" clipPath="url(#clip-above)" />
        <path d={fillPath} fill="#3b82f6" fillOpacity="0.2" clipPath="url(#clip-below)" />

        {/* Curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="#1D9E75"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
        
        {/* Note markers */}
        {[24, 48, 60, 72, 96, 120].map(note => {
          const x = (note / 120) * width;
          return (
            <g key={note}>
              <line x1={x} y1={centerY - 3} x2={x} y2={centerY + 3} stroke="#444" />
              <text x={x} y={height} textAnchor="middle" fontSize="8" fill="#444">
                C{Math.floor(note/12 - 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
