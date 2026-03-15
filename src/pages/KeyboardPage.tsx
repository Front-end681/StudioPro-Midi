import PianoKeyboard from '../components/keyboard/PianoKeyboard';
import OctaveControl from '../components/keyboard/OctaveControl';
import TransposeControl from '../components/controls/TransposeControl';
import PitchBendWheel from '../components/controls/PitchBendWheel';
import { Settings, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function KeyboardPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Controls Bar */}
      <div className="h-[52px] border-b border-[#2e2e2e] bg-[#1a1a1a] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <OctaveControl />
          <TransposeControl />
          
          <div className="h-8 w-[1px] bg-[#2e2e2e] mx-2" />
          
          <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
            {[1, 2, 3, 4].map((ch) => (
              <button 
                key={ch}
                className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${ch === 1 ? 'bg-[#1D9E75] text-white' : 'text-[#888] hover:text-[#f0f0f0]'}`}
              >
                CH {ch}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-[#242424] rounded-full transition-colors text-[#888] hover:text-[#f0f0f0]">
            <Share2 size={18} />
          </button>
          <Link to="/settings" className="p-2 hover:bg-[#242424] rounded-full transition-colors text-[#888] hover:text-[#f0f0f0]">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* Keyboard Area */}
      <div 
        className="flex flex-1 relative overflow-hidden bg-[#0f0f0f] min-h-0"
      >
        <PitchBendWheel />
        <div className="flex-1 relative overflow-hidden h-full">
          <PianoKeyboard />
        </div>
      </div>
    </div>
  );
}
