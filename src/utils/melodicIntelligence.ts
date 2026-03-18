interface NoteEvent {
  note: number       // MIDI note number
  velocity: number   // actual played velocity
  time: number       // performance.now()
}

class MelodicIntelligence {
  
  private history: NoteEvent[] = []
  private readonly WINDOW = 6    // look at last 6 notes
  private readonly MAX_TIME = 3000  // ms — reset if gap > 3s
  
  analyze(
    currentNote: number,
    baseVelocity: number,
    strength: 'subtle' | 'natural' | 'expressive' = 'natural'
  ): number {
    
    const now = performance.now()
    
    // Clean old history
    this.history = this.history.filter(
      e => now - e.time < this.MAX_TIME
    )
    
    // Need at least 2 notes to detect pattern
    if (this.history.length < 2) {
      return baseVelocity
    }
    
    // ── DETECT DIRECTION ─────────────────────────────
    
    const recent = this.history.slice(-this.WINDOW)
    
    // Count ascending vs descending intervals
    let ascending = 0
    let descending = 0
    let stepwise = 0  // conjunct motion (±1-2 semitones)
    
    for (let i = 1; i < recent.length; i++) {
      const interval = recent[i].note - recent[i-1].note
      
      if (interval > 0) ascending++
      else if (interval < 0) descending++
      
      // Stepwise motion = more likely a scale/melody
      if (Math.abs(interval) <= 2) stepwise++
    }
    
    const total = recent.length - 1
    const ascendingRatio = ascending / total
    const descendingRatio = descending / total
    const stepwiseRatio = stepwise / total
    
    // Only apply if motion is clear and stepwise
    // (scales/melodies move by steps, not jumps)
    const isAscending = ascendingRatio >= 0.7 && 
                        stepwiseRatio >= 0.5
    const isDescending = descendingRatio >= 0.7 && 
                         stepwiseRatio >= 0.5
    
    if (!isAscending && !isDescending) {
      return baseVelocity  // no clear pattern
    }
    
    // ── DETECT MOMENTUM ──────────────────────────────
    
    // How far are we into the scale run?
    // More notes in same direction = stronger effect
    let consecutiveCount = 0
    for (let i = recent.length - 1; i >= 1; i--) {
      const interval = recent[i].note - recent[i-1].note
      if (isAscending && interval > 0) consecutiveCount++
      else if (isDescending && interval < 0) consecutiveCount++
      else break
    }
    
    // Momentum: 1 note = weak, 4+ notes = strong
    const momentum = Math.min(consecutiveCount / 4, 1.0)
    
    // ── DETECT VELOCITY TREND ────────────────────────
    
    // Is the player already doing crescendo/diminuendo?
    const velocities = recent.map(e => e.velocity)
    const velTrend = velocities[velocities.length-1] - 
                     velocities[0]
    
    // If player is already adding expression,
    // reduce our adjustment (don't double it)
    const playerAlreadyExpressive = Math.abs(velTrend) > 15
    const expressiveReduction = playerAlreadyExpressive 
      ? 0.3 : 1.0
    
    // ── CALCULATE ADJUSTMENT ─────────────────────────
    
    const maxAdjustValue = strength === 'subtle' ? 10 : strength === 'natural' ? 20 : 35;
    
    const maxAdjust = maxAdjustValue * 
                      momentum * 
                      expressiveReduction
    
    let adjustment = 0
    
    if (isAscending) {
      // Natural crescendo: boost velocity
      adjustment = +Math.round(maxAdjust)
    } else if (isDescending) {
      // Natural diminuendo: reduce velocity
      adjustment = -Math.round(maxAdjust)
    }
    
    // ── APPLY AND CLAMP ───────────────────────────────
    
    const result = baseVelocity + adjustment
    return Math.max(1, Math.min(127, result))
  }
  
  record(note: number, velocity: number): void {
    this.history.push({
      note,
      velocity,
      time: performance.now()
    })
    // Keep only last WINDOW notes
    if (this.history.length > this.WINDOW + 2) {
      this.history.shift()
    }
  }
  
  reset(): void {
    this.history = []
  }
}

export const melodicIntelligence = new MelodicIntelligence()
