import { useSettingsStore } from '../../store/settingsStore';
import { Minus, Plus } from 'lucide-react';

export default function TransposeControl() {
  const transpose = useSettingsStore((state) => state.transpose);
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  const handleDown = () => updateSetting('transpose', Math.max(-12, transpose - 1));
  const handleUp = () => updateSetting('transpose', Math.min(12, transpose + 1));
  const handleReset = () => updateSetting('transpose', 0);

  return (
    <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
      <button 
        onClick={handleDown}
        className="p-1.5 hover:bg-[#2e2e2e] rounded transition-colors text-[#888] hover:text-[#f0f0f0]"
      >
        <Minus size={14} />
      </button>
      <div 
        className="px-2 flex flex-col items-center min-w-[80px] cursor-pointer select-none"
        onDoubleClick={handleReset}
      >
        <span className="text-[9px] uppercase tracking-widest text-[#888] font-bold">Transpose</span>
        <span className="text-xs font-mono font-bold">
          {transpose >= 0 ? `+${transpose}` : transpose}
        </span>
      </div>
      <button 
        onClick={handleUp}
        className="p-1.5 hover:bg-[#2e2e2e] rounded transition-colors text-[#888] hover:text-[#f0f0f0]"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
