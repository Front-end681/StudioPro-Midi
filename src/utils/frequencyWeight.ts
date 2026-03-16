// Compensation table (Fletcher-Munson inspired)
export const FREQ_TABLE = [
  { note: 0,   factor: 1.40 },  // C-1  extreme bass
  { note: 12,  factor: 1.35 },  // C0
  { note: 24,  factor: 1.28 },  // C1   low bass
  { note: 36,  factor: 1.18 },  // C2   bass
  { note: 48,  factor: 1.08 },  // C3   low mid
  { note: 60,  factor: 1.00 },  // C4   reference (no change)
  { note: 69,  factor: 0.96 },  // A4   concert pitch
  { note: 72,  factor: 0.92 },  // C5   upper mid
  { note: 84,  factor: 0.85 },  // C6   high
  { note: 96,  factor: 0.76 },  // C7   very high
  { note: 108, factor: 0.68 },  // C8   extreme high
  { note: 120, factor: 0.60 },  // C9
];

export function getFreqFactor(midiNote: number): number {
  // interpolate between table entries
  for (let i = 0; i < FREQ_TABLE.length - 1; i++) {
    if (midiNote >= FREQ_TABLE[i].note && 
        midiNote <= FREQ_TABLE[i+1].note) {
      const t = (midiNote - FREQ_TABLE[i].note) / 
                (FREQ_TABLE[i+1].note - FREQ_TABLE[i].note);
      return FREQ_TABLE[i].factor + 
             t * (FREQ_TABLE[i+1].factor - FREQ_TABLE[i].factor);
    }
  }
  
  // Handle out of bounds
  if (midiNote < FREQ_TABLE[0].note) return FREQ_TABLE[0].factor;
  if (midiNote > FREQ_TABLE[FREQ_TABLE.length - 1].note) return FREQ_TABLE[FREQ_TABLE.length - 1].factor;
  
  return 1.0;
}

export function applyFreqCompensation(
  velocity: number,
  midiNote: number,
  amount: number  // 0.0–1.0 from settings
): number {
  if (amount === 0) return velocity;
  
  const factor = getFreqFactor(midiNote);
  const blended = 1.0 + (factor - 1.0) * amount;
  
  return Math.max(1, Math.min(127, 
    Math.round(velocity * blended)
  ));
}
