import { useSettingsStore } from '../../store/settingsStore';
import { useLayout } from '../../hooks/useLayout';
import OctaveControl from '../keyboard/OctaveControl';
import TransposeControl from '../controls/TransposeControl';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ControlsBar() {
  const layout = useLayout();
  const midiChannel = useSettingsStore((state) => state.midiChannel);
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  const handleChannelChange = (ch: number) => {
    updateSetting('midiChannel', ch);
  };

  const ChannelSelector = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <div 
      className={`flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#2e2e2e] ${fullWidth ? 'w-full' : 'flex-1'}`}
      style={{ height: `${layout.controlsH * 0.7}px` }}
    >
      {[1, 2, 3, 4].map((ch) => (
        <button 
          key={ch}
          onClick={() => handleChannelChange(ch)}
          className={`flex-1 h-full flex items-center justify-center font-black rounded-lg transition-all`}
          style={{ 
            fontSize: 'var(--font-xs)',
            backgroundColor: ch === midiChannel ? '#1D9E75' : 'transparent',
            color: ch === midiChannel ? 'black' : '#666',
            boxShadow: ch === midiChannel ? '0 0 15px rgba(29,158,117,0.3)' : 'none'
          }}
        >
          {layout.isPhone && !layout.isLandscape ? `CH ${ch}` : ch}
        </button>
      ))}
    </div>
  );

  if (layout.controlsRows === 2) {
    return (
      <div 
        className="bg-[#0A0A0A] flex flex-col border-b border-[#141414] shrink-0 overflow-hidden"
        style={{ height: `${layout.controlsH}px` }}
      >
        <div className="flex-1 flex items-center px-4" style={{ gap: `${layout.vw * 0.01}px` }}>
          <OctaveControl compact />
          <TransposeControl labelHidden />
          <div className="flex-1" />
          <Link 
            to="/settings" 
            className="flex items-center justify-center bg-[#141414] border border-[#2e2e2e] rounded-xl text-[#666] hover:text-[#1D9E75] transition-colors"
            style={{ width: `${layout.controlsH * 0.4}px`, height: `${layout.controlsH * 0.4}px` }}
          >
            <Settings size={16} />
          </Link>
        </div>
        <div className="flex items-center px-4 pb-2">
          <ChannelSelector fullWidth />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-[#0A0A0A] flex items-center border-b border-[#141414] shrink-0 overflow-hidden"
      style={{ 
        height: `${layout.controlsH}px`,
        padding: `0 ${layout.vw * 0.02}px`,
        gap: `${layout.vw * 0.01}px`
      }}
    >
      <div className="flex items-center gap-2 bg-[#141414] p-1 rounded-xl border border-[#2e2e2e]"
        style={{ height: `${layout.controlsH * 0.7}px` }}
      >
        <OctaveControl compact={layout.isPhone} />
        <div className="w-[1px] h-full bg-[#2e2e2e]" />
        <TransposeControl labelHidden={!layout.isDesktop} />
      </div>

      <ChannelSelector />

      {layout.isPhone && layout.isLandscape && (
        <Link 
          to="/settings" 
          className="flex items-center justify-center bg-[#141414] border border-[#2e2e2e] rounded-xl text-[#666] hover:text-[#1D9E75] transition-colors"
          style={{ width: `${layout.controlsH * 0.8}px`, height: `${layout.controlsH * 0.8}px` }}
        >
          <Settings size={18} />
        </Link>
      )}
    </div>
  );
}
