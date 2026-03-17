import PianoKeyboard from '../components/keyboard/PianoKeyboard';
import ControlsBar from '../components/layout/ControlsBar';
import PitchBendWheel from '../components/controls/PitchBendWheel';
import HorizontalBendStrip from '../components/controls/HorizontalBendStrip';
import { useLayout } from '../hooks/useLayout';

export default function KeyboardPage() {
  const layout = useLayout();

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
      <ControlsBar />

      {/* Keyboard Area */}
      <div className="flex-1 flex relative overflow-hidden bg-[#050505] min-h-0 min-w-0">
        {layout.showBendStrip && <PitchBendWheel />}
        
        <div className="flex-1 relative overflow-hidden flex flex-col min-w-0 h-full">
          {layout.showBendHorizontal && <HorizontalBendStrip />}
          <PianoKeyboard />
        </div>
      </div>
    </div>
  );
}
