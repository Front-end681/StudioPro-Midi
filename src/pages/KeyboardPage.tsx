import PianoKeyboard from '../components/keyboard/PianoKeyboard';
import ControlsBar from '../components/layout/ControlsBar';
import PitchBendWheel from '../components/controls/PitchBendWheel';

export default function KeyboardPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ControlsBar />

      {/* Keyboard Area */}
      <div 
        className="flex flex-1 relative overflow-hidden bg-[#0f0f0f] min-h-0"
      >
        <PitchBendWheel />
        <div className="flex-1 relative overflow-hidden h-full flex flex-col">
          <PianoKeyboard />
        </div>
      </div>
    </div>
  );
}
