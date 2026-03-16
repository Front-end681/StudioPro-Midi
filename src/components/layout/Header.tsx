import { Link } from 'react-router-dom';
import { useKeyboardStore } from '../../store/keyboardStore';
import { useMidiStore } from '../../store/midiStore';
import { useResponsive } from '../../hooks/useResponsive';
import { Activity, Wifi, Usb } from 'lucide-react';

export default function Header() {
  const baseOctave = useKeyboardStore((state) => state.baseOctave);
  const numOctaves = useKeyboardStore((state) => state.numOctaves);
  const lastVelocity = useKeyboardStore((state) => state.lastVelocity);
  
  const connectionMode = useMidiStore((state) => state.connectionMode);
  const wifiStatus = useMidiStore((state) => state.wifiStatus);
  const usbDevice = useMidiStore((state) => state.usbDevice);

  const { isMobile, isTablet, isPortrait, isLandscape } = useResponsive();

  const getStatusBadge = () => {
    const showText = !isMobile || !isPortrait;
    
    if (connectionMode === 'wifi') {
      return (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${wifiStatus === 'connected' ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#242424] border-[#2e2e2e] text-[#888]'}`}>
          <Wifi size={10} className={wifiStatus === 'connected' ? 'animate-pulse' : ''} />
          {showText && <span className="text-[10px] font-bold uppercase tracking-wider">WiFi MIDI</span>}
          {!showText && <div className={`w-1.5 h-1.5 rounded-full ${wifiStatus === 'connected' ? 'bg-[#1D9E75]' : 'bg-[#444]'}`} />}
        </div>
      );
    }
    if (connectionMode === 'usb') {
      return (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${usbDevice ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#242424] border-[#2e2e2e] text-[#888]'}`}>
          <Usb size={10} />
          {showText && <span className="text-[10px] font-bold uppercase tracking-wider">USB MIDI</span>}
          {!showText && <div className={`w-1.5 h-1.5 rounded-full ${usbDevice ? 'bg-[#1D9E75]' : 'bg-[#444]'}`} />}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-[#1D9E75]/10 rounded-md border border-[#1D9E75]/30 text-[#1D9E75]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
        {showText && <span className="text-[10px] font-bold uppercase tracking-wider">Web MIDI</span>}
      </div>
    );
  };

  const headerHeight = (isMobile || (isTablet && isPortrait)) ? 'h-10' : 'h-12';
  const logoText = (isMobile && isPortrait) ? 'SP MIDI' : 'StudioPro MIDI';
  const logoSize = (isMobile || (isTablet && isPortrait)) ? 'text-sm' : 'text-lg';
  const showRange = !isMobile && !(isTablet && isPortrait) && !isLandscape;

  return (
    <header className={`${headerHeight} border-b border-[#2e2e2e] flex items-center justify-between px-4 bg-[#1a1a1a] z-50 transition-all duration-300`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/" className={`${logoSize} font-bold tracking-tight text-[#1D9E75] whitespace-nowrap`}>
          {logoText}
        </Link>
        {getStatusBadge()}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {showRange && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#888] font-medium">Range</span>
            <span className="text-xs font-mono">C{baseOctave} – B{baseOctave + numOctaves - 1}</span>
          </div>
        )}
        
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#2e2e2e] flex items-center justify-center relative">
          <Activity size={14} className={lastVelocity > 0 ? 'text-[#EF9F27]' : 'text-[#444]'} />
          {lastVelocity > 0 && (
            <div 
              className="absolute inset-0 rounded-full bg-[#EF9F27]/20 animate-ping" 
              style={{ animationDuration: '0.5s' }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
