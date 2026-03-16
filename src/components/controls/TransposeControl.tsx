import { useSettingsStore } from '../../store/settingsStore';
import { useResponsive } from '../../hooks/useResponsive';
import { Minus, Plus } from 'lucide-react';

export default function TransposeControl() {
  const transpose = useSettingsStore((state) => state.transpose);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const { isMobile, isTablet, isPortrait, isLandscape } = useResponsive();

  const handleDown = () => updateSetting('transpose', Math.max(-12, transpose - 1));
  const handleUp = () => updateSetting('transpose', Math.min(12, transpose + 1));
  const handleReset = () => updateSetting('transpose', 0);

  const isCompact = (isMobile && isLandscape) || (isTablet && isPortrait);
  const isMinimal = isMobile && isLandscape;

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-[#242424] p-0.5 sm:p-1 rounded-lg border border-[#2e2e2e]">
      <button 
        onClick={handleDown}
        className="p-1 sm:p-1.5 hover:bg-[#2e2e2e] rounded transition-colors text-[#888] hover:text-[#f0f0f0] min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <Minus size={isMinimal ? 12 : 14} />
      </button>
      <div 
        className={`px-1 sm:px-2 flex flex-col items-center cursor-pointer select-none ${isMinimal ? 'min-w-[24px]' : isCompact ? 'min-w-[48px]' : 'min-w-[80px]'}`}
        onDoubleClick={handleReset}
      >
        {!isMinimal && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#888] font-bold">
            {isCompact ? 'Trans' : 'Transpose'}
          </span>
        )}
        <span className="text-xs font-mono font-bold">
          {transpose >= 0 ? `+${transpose}` : transpose}
        </span>
      </div>
      <button 
        onClick={handleUp}
        className="p-1 sm:p-1.5 hover:bg-[#2e2e2e] rounded transition-colors text-[#888] hover:text-[#f0f0f0] min-w-[32px] min-h-[32px] flex items-center justify-center"
      >
        <Plus size={isMinimal ? 12 : 14} />
      </button>
    </div>
  );
}
