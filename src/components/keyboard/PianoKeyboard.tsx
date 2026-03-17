import { useState, useEffect } from 'react';
import { useKeyboardStore } from '../../store/keyboardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useMIDI } from '../../hooks/useMIDI';
import { useAudio } from '../../hooks/useAudio';
import { useResponsive } from '../../hooks/useResponsive';
import OctaveGroup from './OctaveGroup';
import { adaptiveCalibrator } from '../../utils/adaptiveCalibrator';
import { motion, AnimatePresence } from 'motion/react';

export default function PianoKeyboard() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const activeKeys = useKeyboardStore((state) => state.activeKeys);
  const setNotePressed = useKeyboardStore((state) => state.setNotePressed);
  const setNoteReleased = useKeyboardStore((state) => state.setNoteReleased);
  
  const showNoteLabels = useSettingsStore((state) => state.showNoteLabels);
  const adaptiveEnabled = useSettingsStore((state) => state.adaptiveEnabled);
  const { sendNoteOn, sendNoteOff } = useMIDI();
  const { playNote, stopNote } = useAudio();
  const { isMobile, isTablet, isPortrait } = useResponsive();

  const [calibrationProgress, setCalibrationProgress] = useState(adaptiveCalibrator.getCalibrationProgress());

  useEffect(() => {
    setCalibrationProgress(adaptiveCalibrator.getCalibrationProgress());
  }, [activeKeys]);

  const handlePress = (note: number, velocity: number) => {
    setNotePressed(note, velocity);
    playNote(note, velocity);
    sendNoteOn(note, velocity);
  };

  const handleRelease = (note: number) => {
    stopNote(note);
    sendNoteOff(note);
    setNoteReleased(note);
  };

  // Determine effective number of octaves based on breakpoint
  const effectiveNumOctaves = (isMobile || (isTablet && isPortrait)) ? 2 : numOctaves;
  const octaves = Array.from({ length: effectiveNumOctaves }, (_, i) => baseOctave + i);

  return (
    <div className="w-full h-full relative overflow-x-auto overflow-y-hidden bg-[#0f0f0f] no-scrollbar">
      {/* Calibration Feedback */}
      {adaptiveEnabled && (
        <>
          <AnimatePresence>
            {calibrationProgress < 100 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-50 border-2 border-amber-500/40 rounded-sm"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {calibrationProgress > 0 && calibrationProgress < 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Learning your touch... {Math.round(calibrationProgress)}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {calibrationProgress === 100 && (
            <div className="absolute top-2 right-2 z-50 group pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-[#1D9E75] shadow-[0_0_8px_rgba(29,158,117,0.5)]" />
              <div className="absolute right-0 top-4 hidden group-hover:block bg-black/90 border border-[#2e2e2e] px-2 py-1 rounded text-[8px] font-bold text-[#1D9E75] whitespace-nowrap uppercase tracking-widest">
                Calibrated to your touch ✓
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex h-full items-stretch min-w-max">
        {octaves.map((octave) => (
          <OctaveGroup
            key={octave}
            octave={octave}
            activeKeys={activeKeys}
            onPress={handlePress}
            onRelease={handleRelease}
            showLabels={showNoteLabels}
          />
        ))}
      </div>
    </div>
  );
}
