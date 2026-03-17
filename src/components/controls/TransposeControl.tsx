import { useSettingsStore } from '../../store/settingsStore';
import { useLayout } from '../../hooks/useLayout';
import { Minus, Plus } from 'lucide-react';

interface TransposeControlProps {
  labelHidden?: boolean;
}

export default function TransposeControl({ labelHidden = false }: TransposeControlProps) {
  const transpose = useSettingsStore((state) => state.transpose);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const layout = useLayout();

  const handleDown = () => updateSetting('transpose', Math.max(-12, transpose - 1));
  const handleUp = () => updateSetting('transpose', Math.min(12, transpose + 1));
  const handleReset = () => updateSetting('transpose', 0);

  const showLabel = !labelHidden && (!layout.isPhone || layout.isLandscape);

  return (
    <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-[#2e2e2e]">
      <button 
        onClick={handleDown}
        className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors text-[#666] hover:text-[#1D9E75] min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <Minus size={14} />
      </button>
      <div 
        className={`px-2 flex flex-col items-center cursor-pointer select-none ${showLabel ? 'min-w-[80px]' : 'min-w-[40px]'}`}
        onDoubleClick={handleReset}
      >
        {showLabel && (
          <span className="uppercase tracking-widest text-[#666] font-black" style={{ fontSize: 'var(--font-xs)' }}>
            TRANSPOSE
          </span>
        )}
        <span className="font-mono font-black text-[#1D9E75]" style={{ fontSize: 'var(--font-sm)' }}>
          {transpose >= 0 ? `+${transpose}` : transpose}
        </span>
      </div>
      <button 
        onClick={handleUp}
        className="p-1.5 hover:bg-[#141414] rounded-lg transition-colors text-[#666] hover:text-[#1D9E75] min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
