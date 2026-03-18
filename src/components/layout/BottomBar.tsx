import { useKeyboardStore } from '../../store/keyboardStore';
import { RefreshCw } from 'lucide-react';
import { useMIDI } from '../../hooks/useMIDI';
import { useLayout } from '../../hooks/useLayout';

export default function BottomBar() {
  const lastNote = useKeyboardStore((state) => state.lastNote);
  const lastVelocity = useKeyboardStore((state) => state.lastVelocity);
  const isSustainOn = useKeyboardStore((state) => state.isSustainOn);
  const setSustain = useKeyboardStore((state) => state.setSustain);
  const clearActiveKeys = useKeyboardStore((state) => state.clearActiveKeys);
  const { sendControlChange, sendAllNotesOff } = useMIDI();
  const layout = useLayout();

  const handleReset = () => {
    sendAllNotesOff();
    clearActiveKeys();
  };

  const toggleSustain = () => {
    const newState = !isSustainOn;
    setSustain(newState);
    sendControlChange(64, newState ? 127 : 0);
  };

  const getNoteName = (midi: number | null) => {
    if (midi === null) return '---';
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const name = names[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  };

  const NoteDisplay = () => (
    <div className="flex flex-col">
      {!layout.isPhone && <span className="text-[9px] uppercase tracking-[0.2em] text-[#666] font-black mb-1">Note</span>}
      <div className="flex items-baseline gap-2">
        <span className="font-black text-white tracking-tighter" style={{ fontSize: layout.isPhone ? '1.2rem' : '1.5rem' }}>{getNoteName(lastNote)}</span>
      </div>
    </div>
  );

  const VelocityDisplay = () => (
    <div className="flex flex-col">
      {!layout.isPhone && <span className="text-[9px] uppercase tracking-[0.2em] text-[#666] font-black mb-1">Vel</span>}
      <div className="flex items-baseline gap-2">
        <span className="font-black text-white tracking-tighter" style={{ fontSize: layout.isPhone ? '1.2rem' : '1.5rem' }}>{lastVelocity || '0'}</span>
      </div>
    </div>
  );

  const IntensityBar = () => (
    <div className="flex-1 flex flex-col justify-center">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#666] font-black">
          {layout.isPhone ? 'INT' : 'Intensity'}
        </span>
        <span className="text-[10px] font-black text-[#1D9E75] tracking-widest">{Math.round((lastVelocity / 127) * 100)}%</span>
      </div>
      <div className="h-2 bg-[#141414] rounded-full overflow-hidden border border-[#2e2e2e]">
        <div 
          className="h-full bg-[#1D9E75] shadow-[0_0_15px_rgba(29,158,117,0.6)] transition-all duration-100 ease-out"
          style={{ width: `${(lastVelocity / 127) * 100}%` }}
        />
      </div>
    </div>
  );

  if (layout.bottomRows === 2) {
    return (
      <footer 
        className="bg-[#050505] flex flex-col border-t border-[#141414] shrink-0"
        style={{ height: `${layout.bottomH}px`, padding: `0 ${layout.vw * 0.015}px` }}
      >
        <div className="flex-1 flex items-center gap-4">
          <NoteDisplay />
          <VelocityDisplay />
          <IntensityBar />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <button 
            onClick={toggleSustain}
            className={`flex-1 rounded-lg font-black uppercase tracking-widest transition-all ${isSustainOn ? 'bg-[#1D9E75] text-black shadow-[0_0_15px_rgba(29,158,117,0.3)]' : 'bg-[#141414] text-[#666] border border-[#2e2e2e]'}`}
            style={{ height: `${layout.bottomH * 0.35}px`, fontSize: 'var(--font-xs)' }}
          >
            Sustain
          </button>
          <button 
            onClick={handleReset}
            className="flex-1 bg-[#141414] border border-[#1D9E75]/30 text-[#1D9E75] rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ height: `${layout.bottomH * 0.35}px`, fontSize: 'var(--font-xs)' }}
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer 
      className="bg-[#050505] flex items-center border-t border-[#141414] shrink-0"
      style={{ 
        height: `${layout.bottomH}px`, 
        padding: `0 ${layout.vw * 0.015}px`,
        gap: `${layout.vw * 0.04}px`
      }}
    >
      <NoteDisplay />
      <VelocityDisplay />
      <IntensityBar />

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleSustain}
          className={`rounded-lg font-black uppercase tracking-widest transition-all ${isSustainOn ? 'bg-[#1D9E75] text-black shadow-[0_0_15px_rgba(29,158,117,0.3)]' : 'bg-[#141414] text-[#666] border border-[#2e2e2e]'}`}
          style={{ 
            height: `${layout.bottomH * 0.6}px`, 
            padding: '0 1.5rem',
            fontSize: 'var(--font-xs)' 
          }}
        >
          {layout.isPhone ? 'Sus' : 'Sustain'}
        </button>

        <button 
          onClick={handleReset}
          className="bg-[#141414] border border-[#1D9E75]/30 hover:border-[#1D9E75] text-[#1D9E75] rounded-lg transition-all flex items-center justify-center group"
          style={{ 
            height: `${layout.bottomH * 0.6}px`,
            width: layout.isPhone ? `${layout.bottomH * 0.6}px` : 'auto',
            padding: layout.isPhone ? '0' : '0 1.5rem',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={14} className="group-active:rotate-180 transition-transform" />
          {!layout.isPhone && <span className="font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Reset</span>}
        </button>
      </div>
    </footer>
  );
}
