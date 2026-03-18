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

  const getTransposeColor = () => {
    if (transpose === 0) return '#888';
    if (transpose > 0) return '#1D9E75';
    return '#EF9F27';
  };

  return (
    <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-[#2e2e2e]">
      <button 
        onClick={handleDown}
        className="hover:bg-[#141414] rounded-lg transition-colors text-[#666] hover:text-[#1D9E75] min-w-[32px] min-h-[32px] flex items-center justify-center"
        style={{ fontSize: '14px', padding: '0 6px' }}
      >
        <Minus size={14} />
      </button>
      
      <div 
        className="flex items-center justify-center cursor-pointer select-none"
        style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          minWidth: '28px', 
          textAlign: 'center',
          color: getTransposeColor()
        }}
        onDoubleClick={handleReset}
      >
        {transpose >= 0 ? `+${transpose}` : transpose}
      </div>

      <button 
        onClick={handleUp}
        className="hover:bg-[#141414] rounded-lg transition-colors text-[#666] hover:text-[#1D9E75] min-w-[32px] min-h-[32px] flex items-center justify-center"
        style={{ fontSize: '14px', padding: '0 6px' }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
