import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Share2 } from 'lucide-react';
import OctaveControl from '../keyboard/OctaveControl';
import TransposeControl from '../controls/TransposeControl';
import { useResponsive } from '../../hooks/useResponsive';
import { useSettingsStore } from '../../store/settingsStore';
import { useMIDI } from '../../hooks/useMIDI';

export default function ControlsBar() {
  const { isMobile, isPortrait } = useResponsive();
  const midiChannel = useSettingsStore((state) => state.midiChannel);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const { sendPitchBend } = useMIDI();
  const [isBendActive, setIsBendActive] = useState(false);

  const handleChannelChange = (ch: number) => {
    updateSetting('midiChannel', ch);
  };

  const handleBendPress = () => {
    setIsBendActive(true);
    sendPitchBend(0x7F, 0x7F);
  };

  const handleBendRelease = () => {
    setIsBendActive(false);
    sendPitchBend(0x00, 0x40);
  };

  if (isMobile && isPortrait) {
    return (
      <div className="flex flex-col bg-[#1a1a1a] border-b border-[#2e2e2e]">
        {/* Row 1 */}
        <div className="h-9 flex items-center justify-between px-3 border-b border-[#2e2e2e]/50">
          <div className="flex items-center gap-2">
            <OctaveControl />
            <TransposeControl />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onPointerDown={handleBendPress}
              onPointerUp={handleBendRelease}
              onPointerLeave={handleBendRelease}
              className={`h-7 px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${isBendActive ? 'bg-[#1D9E75] text-white' : 'bg-[#242424] text-[#888] border border-[#2e2e2e]'}`}
            >
              Bend
            </button>
            <Link to="/settings" className="p-1.5 hover:bg-[#242424] rounded-full transition-colors text-[#888] hover:text-[#f0f0f0]">
              <Settings size={16} />
            </Link>
          </div>
        </div>
        {/* Row 2 */}
        <div className="h-8 flex items-center px-3 gap-2">
          <span className="text-[9px] font-bold text-[#666] uppercase tracking-widest">CH</span>
          <div className="flex-1 flex items-center gap-1 bg-[#242424] p-0.5 rounded-lg border border-[#2e2e2e]">
            {[1, 2, 3, 4].map((ch) => (
              <button 
                key={ch}
                onClick={() => handleChannelChange(ch)}
                className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${ch === midiChannel ? 'bg-[#1D9E75] text-white' : 'text-[#888] hover:text-[#f0f0f0]'}`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[52px] sm:h-[48px] md:h-[52px] border-b border-[#2e2e2e] bg-[#1a1a1a] flex items-center justify-between px-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <OctaveControl />
        <TransposeControl />
        
        <div className="h-8 w-[1px] bg-[#2e2e2e] mx-1 sm:mx-2" />
        
        <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
          {[1, 2, 3, 4].map((ch) => (
            <button 
              key={ch}
              onClick={() => handleChannelChange(ch)}
              className={`px-2 sm:px-3 py-1 text-[10px] font-bold rounded transition-colors ${ch === midiChannel ? 'bg-[#1D9E75] text-white' : 'text-[#888] hover:text-[#f0f0f0]'}`}
            >
              CH {ch}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="p-2 hover:bg-[#242424] rounded-full transition-colors text-[#888] hover:text-[#f0f0f0]">
          <Share2 size={18} />
        </button>
        <Link to="/settings" className="p-2 hover:bg-[#242424] rounded-full transition-colors text-[#888] hover:text-[#f0f0f0]">
          <Settings size={18} />
        </Link>
      </div>
    </div>
  );
}
