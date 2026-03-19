import { create } from 'zustand';

interface KeyboardState {
  baseOctave: number;
  numOctaves: number;
  activeKeys: Map<number, number>; // noteNumber -> velocity
  pressStartTimes: Map<number, number>; // noteNumber -> timestamp
  lastNote: number | null;
  lastVelocity: number;
  isSustainOn: boolean;
  sustainedKeys: Set<number>;
  
  setBaseOctave: (octave: number) => void;
  setNumOctaves: (num: number) => void;
  setNotePressed: (note: number, velocity: number) => void;
  setNoteReleased: (note: number, velocity?: number) => void;
  setPressStartTime: (note: number, time: number) => void;
  setSustain: (on: boolean) => void;
  setLastVelocity: (velocity: number) => void;
  clearActiveKeys: () => void;
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
  baseOctave: 4,
  numOctaves: 3,
  activeKeys: new Map(),
  pressStartTimes: new Map(),
  lastNote: null,
  lastVelocity: 0,
  isSustainOn: false,
  sustainedKeys: new Set(),

  setBaseOctave: (octave) => set({ baseOctave: octave }),
  setNumOctaves: (num) => set({ numOctaves: num }),
  
  setNotePressed: (note, velocity) => set((state) => {
    const newActiveKeys = new Map(state.activeKeys);
    newActiveKeys.set(note, velocity);
    const newPressStartTimes = new Map(state.pressStartTimes);
    newPressStartTimes.set(note, performance.now());
    return { 
      activeKeys: newActiveKeys,
      pressStartTimes: newPressStartTimes,
      lastNote: note,
      lastVelocity: velocity
    };
  }),

  setNoteReleased: (note, velocity?: number) => set((state) => {
    const newActiveKeys = new Map(state.activeKeys);
    const newPressStartTimes = new Map(state.pressStartTimes);
    newPressStartTimes.delete(note);

    if (state.isSustainOn) {
      const newSustained = new Set(state.sustainedKeys);
      newSustained.add(note);
      return { 
        sustainedKeys: newSustained, 
        pressStartTimes: newPressStartTimes,
        lastVelocity: velocity !== undefined ? velocity : state.lastVelocity 
      };
    }
    newActiveKeys.delete(note);
    return { 
      activeKeys: newActiveKeys, 
      pressStartTimes: newPressStartTimes,
      lastVelocity: velocity !== undefined ? velocity : state.lastVelocity
    };
  }),

  setPressStartTime: (note, time) => set((state) => {
    const newPressStartTimes = new Map(state.pressStartTimes);
    newPressStartTimes.set(note, time);
    return { pressStartTimes: newPressStartTimes };
  }),

  setSustain: (on) => set((state) => {
    if (!on) {
      const newActiveKeys = new Map(state.activeKeys);
      state.sustainedKeys.forEach(note => {
        newActiveKeys.delete(note);
      });
      return { isSustainOn: false, sustainedKeys: new Set(), activeKeys: newActiveKeys };
    }
    return { isSustainOn: true };
  }),

  setLastVelocity: (velocity) => set({ lastVelocity: velocity }),

  clearActiveKeys: () => set({ 
    activeKeys: new Map(), 
    pressStartTimes: new Map(), 
    lastNote: null, 
    lastVelocity: 0,
    sustainedKeys: new Set()
  }),
}));
