interface NoteEvent {
  note: number;
  velocity: number;
  time: number;
}

export type MusicalStyle = 'classical' | 'jazz' | 'pop' | 'free';

class MusicAwareVelocityEngine {
  private noteHistory: NoteEvent[] = [];
  private baseVelocity = 72; // mf — always the anchor
  private readonly WINDOW = 8;
  private style: MusicalStyle = 'free';

  setStyle(style: MusicalStyle) {
    this.style = style;
  }

  calculateVelocity(midiNote: number, timestamp: number): number {
    const history = this.noteHistory.slice(-this.WINDOW);
    let velocity = this.baseVelocity;

    // ── RULE 1: Direction ──────────────────────────
    if (history.length >= 2) {
      const direction = this.getDirection(history);
      const stepCount = this.getConsecutiveSteps(history);

      if (direction === 'ascending') {
        velocity += Math.min(stepCount * 6, 20);
      } else if (direction === 'descending') {
        velocity -= Math.min(stepCount * 5, 18);
      }
    }

    // ── RULE 2: Position ───────────────────────────
    if (history.length >= 4) {
      const recentNotes = history.map((e) => e.note);
      const maxNote = Math.max(...recentNotes);
      const minNote = Math.min(...recentNotes);

      if (midiNote >= maxNote) {
        velocity += 15; // peak note emphasis
      } else if (midiNote <= minNote) {
        velocity -= 8; // valley note reduction
      }

      // Leap detection
      if (history.length > 0) {
        const lastNote = history[history.length - 1].note;
        const interval = Math.abs(midiNote - lastNote);
        if (interval > 5) {
          velocity += 10; // post-leap emphasis
        }
      }
    }

    // ── RULE 3: Rhythm ─────────────────────────────
    if (history.length > 0) {
      const lastTime = history[history.length - 1].time;
      const gap = timestamp - lastTime;

      if (gap < 200) {
        // Fast passage — normalize toward center
        velocity = Math.round(velocity * 0.7 + 72 * 0.3);
      } else if (gap > 1500) {
        // New phrase — reset context
        this.baseVelocity = 72;
        velocity = 72;
      }
    }

    // ── RULE 4: Harmonic Weight ────────────────────
    const noteInOctave = midiNote % 12;
    const strongDegrees = [0, 4, 7]; // C E G (in C context)
    const weakDegrees = [2, 5, 9, 11]; // D F A B (in C context)

    if (strongDegrees.includes(noteInOctave)) {
      velocity += 8;
    } else if (weakDegrees.includes(noteInOctave)) {
      velocity -= 5;
    }

    // ── RULE 5: Phrase Shape ───────────────────────
    const phraseShape = this.detectPhraseShape(history);
    if (phraseShape === 'arch') {
      // Crescendo to middle, decrescendo to end
      const midPoint = Math.floor(history.length / 2);
      const pos = history.length;
      if (pos <= midPoint) velocity += 10;
      else velocity -= 10;
    } else if (phraseShape === 'wave') {
      // Gentle oscillation
      velocity += (history.length % 2 === 0) ? 5 : -5;
    } else if (phraseShape === 'sequence') {
      // Repetitive patterns — maintain consistency
      if (history.length > 0) {
        velocity = history[history.length - 1].velocity;
      }
    }

    // ── STYLE OVERRIDES ───────────────────────────
    switch (this.style) {
      case 'classical':
        // Conservative range (30-100)
        velocity = Math.max(30, Math.min(100, velocity));
        break;
      case 'jazz':
        // Wider range (20-115), more chromatic emphasis
        velocity = Math.max(20, Math.min(115, velocity));
        break;
      case 'pop':
        // Moderate range (45-100), consistent fast passages
        velocity = Math.max(45, Math.min(100, velocity));
        break;
      case 'free':
        // Maximum range (15-115)
        velocity = Math.max(15, Math.min(115, velocity));
        break;
    }

    // ── STABILITY: no wild jumps ───────────────────
    if (history.length > 0) {
      const lastVel = history[history.length - 1].velocity;
      const diff = velocity - lastVel;
      if (Math.abs(diff) > 30) {
        velocity = lastVel + (diff > 0 ? 30 : -30);
      }
    }

    // ── CLAMP ──────────────────────────────────────
    velocity = Math.max(1, Math.min(127, velocity));

    // Record this note
    this.noteHistory.push({
      note: midiNote,
      velocity,
      time: timestamp,
    });
    if (this.noteHistory.length > this.WINDOW + 2) {
      this.noteHistory.shift();
    }

    return Math.round(velocity);
  }

  private getDirection(history: NoteEvent[]): 'ascending' | 'descending' | 'mixed' {
    const last4 = history.slice(-4);
    let up = 0,
      down = 0;
    for (let i = 1; i < last4.length; i++) {
      if (last4[i].note > last4[i - 1].note) up++;
      else if (last4[i].note < last4[i - 1].note) down++;
    }
    if (up >= 2 && up > down) return 'ascending';
    if (down >= 2 && down > up) return 'descending';
    return 'mixed';
  }

  private getConsecutiveSteps(history: NoteEvent[]): number {
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    const direction = last.note > prev.note ? 1 : -1;

    let count = 1;
    for (let i = history.length - 2; i >= 1; i--) {
      const d = history[i].note > history[i - 1].note ? 1 : -1;
      if (d === direction) count++;
      else break;
    }
    return count;
  }

  private detectPhraseShape(history: NoteEvent[]): 'arch' | 'wave' | 'sequence' | 'none' {
    if (history.length < 4) return 'none';

    const notes = history.map(h => h.note);
    const intervals = [];
    for (let i = 1; i < notes.length; i++) {
      intervals.push(notes[i] - notes[i - 1]);
    }

    // 1. Sequence (Repetitive patterns)
    if (intervals.length >= 4) {
      const lastTwo = intervals.slice(-2);
      const prevTwo = intervals.slice(-4, -2);
      if (lastTwo[0] === prevTwo[0] && lastTwo[1] === prevTwo[1]) return 'sequence';
    }

    // 2. Wave (Oscillation)
    let oscillationCount = 0;
    for (let i = 1; i < intervals.length; i++) {
      if ((intervals[i] > 0 && intervals[i - 1] < 0) || (intervals[i] < 0 && intervals[i - 1] > 0)) {
        oscillationCount++;
      }
    }
    if (oscillationCount >= 3) return 'wave';

    // 3. Arch (Ascending then Descending)
    const maxVal = Math.max(...notes);
    const maxIdx = notes.indexOf(maxVal);
    
    if (maxIdx > 0 && maxIdx < notes.length - 1) {
      let ascending = true;
      for (let i = 1; i <= maxIdx; i++) {
        if (notes[i] < notes[i - 1]) ascending = false;
      }
      let descending = true;
      for (let i = maxIdx + 1; i < notes.length; i++) {
        if (notes[i] > notes[i - 1]) descending = false;
      }
      if (ascending && descending) return 'arch';
    }

    return 'none';
  }

  reset(): void {
    this.noteHistory = [];
    this.baseVelocity = 72;
  }
}

export const musicAwareEngine = new MusicAwareVelocityEngine();
