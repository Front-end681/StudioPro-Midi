import PianoKeyboard from '../components/keyboard/PianoKeyboard';
import ControlsBar from '../components/layout/ControlsBar';
import PitchBendWheel from '../components/controls/PitchBendWheel';
import HorizontalBendStrip from '../components/controls/HorizontalBendStrip';
import { useLayout } from '../hooks/useLayout';

export default function KeyboardPage() {
  const layout = useLayout();

  return (
    <div className="keyboard-page flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
      <ControlsBar />

      {/* Keyboard Area */}
      <div className="keyboard-area flex-1 relative overflow-hidden bg-[#050505] min-h-0 min-w-0 p-0">
        <div className="keyboard-inner" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'stretch',
          height: '100%',
          overflow: 'hidden'
        }}>
          {layout.showBendStrip && <PitchBendWheel />}
          
          <div className="flex-1 relative overflow-hidden flex flex-col items-stretch min-w-0 h-full">
            {layout.showBendHorizontal && <HorizontalBendStrip />}
            <PianoKeyboard />
          </div>
        </div>
      </div>
    </div>
  );
}
