// 1) Weight based on pitch height (low / middle / high)
export function calcPitchWeight(pitch: number): number {
  const midPitch = 60;   // C4
  const rangeWidth = 24; // C2–C6

  if (Math.abs(pitch - midPitch) < rangeWidth) {
    return 1.05; // central range slightly stronger
  } else {
    return 0.85; // very low or very high slightly softer
  }
}

// 2) Weight based on phrase position + direction
export function calcPhraseWeight(
  currentIdx: number,
  totalNotes: number,
  pitches: number[]
): number {
  let w = 1.0;

  // a) Start / middle / end of phrase
  if (currentIdx === 0) {
    w *= 1.10; // first note stronger
  } else if (currentIdx === totalNotes - 1) {
    w *= 0.90; // last note softer
  }

  // b) Ascending / descending direction
  if (currentIdx < totalNotes - 1) {
    const diff = pitches[currentIdx + 1] - pitches[currentIdx];
    if (diff > 2) {
      w *= 1.03; // ascending → slightly stronger
    } else if (diff < -2) {
      w *= 0.97; // descending → slightly softer
    }
  }

  return w;
}

/**
 * حساب الـvariation الخفيفة بناءًا على سياق الجملة والـduration
 * mini-variation = 0.98 → 1.02
 */
export function calcSubtleVariation(
  baseVelocity: number,
  avgVelocityInPhrase: number,
  noteDurationMs: number
): number {
  let varWeight = 1.0;

  // لو velocity متوسطة عالية شوية، نخلي الـnote الحالي يهبط شوية (تخفيف الضغط)
  if (avgVelocityInPhrase > 90) {
    varWeight *= 0.99;
  }

  // لو النوتة طويلة (hold) نخلي الـvelocity في النص أو النهاية يبقى أنعم بسيط
  if (noteDurationMs > 1000) {
    varWeight = 0.98;
  }

  // لو النوتة قصيرة جدًا (staccato) نخليها تكون شوية أكثر دقة في القوة
  if (noteDurationMs < 200) {
    varWeight *= 1.01;
  }

  return varWeight;
}

/**
 * @param baseVelocity: velocity من الـcontroller (0–127)
 * @param pitch: MIDI note number (0–127)
 * @param currentIdx: index في الجملة
 * @param totalNotes: عدد النوتات في الجملة
 * @param pitches: array of all pitches in the phrase
 * @param noteDurationMs: مدة النوتة بالـms (مثلاً من attack إلى release)
 * @param avgVelocityInPhrase: متوسط velocity للجملة (ممكن حسابه مسبقًا)
 */
export function calcNoteVelocity(
  baseVelocity: number,
  pitch: number,
  currentIdx: number,
  totalNotes: number,
  pitches: number[],
  noteDurationMs: number,
  avgVelocityInPhrase: number
): number {
  const wPitch = calcPitchWeight(pitch);
  const wPhrase = calcPhraseWeight(currentIdx, totalNotes, pitches);
  const wVariation = calcSubtleVariation(baseVelocity, avgVelocityInPhrase, noteDurationMs);

  // Blend: 70% phrase, 30% pitch, variation خفيفة
  const alpha = 0.7;
  const weight = (alpha * wPhrase + (1 - alpha) * wPitch) * wVariation;

  let finalVel = baseVelocity * weight;
  finalVel = Math.max(40, Math.min(110, finalVel));
  return Math.round(finalVel);
}

// 4) Fallback when only one note is available (no phrase context)
export function calcVelocitySimple(baseVelocity: number, pitch: number): number {
  const w = calcPitchWeight(pitch);
  let finalVel = baseVelocity * w;
  finalVel = Math.max(40, Math.min(110, finalVel));
  return Math.round(finalVel);
}
