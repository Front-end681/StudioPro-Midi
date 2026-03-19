import { Link } from 'react-router-dom';
import { useMidiStore } from '../../store/midiStore';
import { useLayout } from '../../hooks/useLayout';
import { Settings, Share2, Zap } from 'lucide-react';

export default function Header() {
  const connectionMode = useMidiStore((state) => state.connectionMode);
  const connectionStatus = useMidiStore((state) => state.connectionStatus);
  const wifiStatus = useMidiStore((state) => state.wifiStatus);
  const usbDevice = useMidiStore((state) => state.usbDevice);

  const layout = useLayout();

  const getStatusBadge = () => {
    let label = 'Web MIDI';
    let color = '#1D9E75'; // green
    let isActive = true;

    if (connectionMode === 'webmidi') {
      if (connectionStatus === 'connected') {
        label = 'Web MIDI';
        color = '#1D9E75';
        isActive = true;
      } else if (connectionStatus === 'no-devices') {
        label = 'No Devices';
        color = '#EF9F27'; // yellow
        isActive = false;
      } else if (connectionStatus === 'error') {
        label = 'Error';
        color = '#E24B4A'; // red
        isActive = false;
      } else {
        label = 'Not Connected';
        color = '#444'; // gray
        isActive = false;
      }
    } else if (connectionMode === 'wifi') {
      label = 'WiFi MIDI';
      isActive = wifiStatus === 'connected';
      color = isActive ? '#1D9E75' : '#444';
    } else if (connectionMode === 'usb') {
      label = 'USB MIDI';
      isActive = !!usbDevice;
      color = isActive ? '#1D9E75' : '#444';
    }
    
    return (
      <div className={`flex items-center gap-2 ${!layout.isPhone ? 'px-3 py-1 rounded-full border' : ''}`} 
           style={{ 
             backgroundColor: !layout.isPhone ? `${color}10` : 'transparent',
             borderColor: !layout.isPhone ? `${color}30` : 'transparent',
             color: color
           }}>
        <div 
          className="rounded-full" 
          style={{ 
            width: '8px', 
            height: '8px',
            backgroundColor: color,
            boxShadow: isActive ? `0 0 8px ${color}80` : 'none'
          }}
        />
        {!layout.isPhone && <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>}
      </div>
    );
  };

  return (
    <header 
      className="flex items-center justify-between bg-[#0A0A0A] z-50 border-b border-[#141414] shrink-0 overflow-hidden"
      style={{ 
        height: `${layout.headerH}px`,
        padding: `0 ${layout.vw * 0.02}px`
      }}
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span style={{ 
            fontSize: 'clamp(12px, 2vw, 18px)',
            fontWeight: 700,
            color: '#1D9E75',
            whiteSpace: 'nowrap'
          }}>
            StudioPro MIDI
          </span>
        </Link>
        {!layout.isPhone && <div className="h-4 w-[1px] bg-[#2e2e2e]" />}
        {getStatusBadge()}
      </div>

      <div className="flex items-center gap-2">
        {layout.showRangeInHeader && (
          <div className="flex items-center px-3 py-1 bg-[#141414] border border-[#2e2e2e] rounded-lg mr-2">
            <span className="text-[10px] font-black text-[#666] uppercase tracking-widest">Range C4-B6</span>
          </div>
        )}
        
        {!layout.isPhone && (
          <button className="p-2 hover:bg-[#141414] rounded-xl transition-colors text-[#666] hover:text-[#1D9E75]">
            <Share2 size={20} />
          </button>
        )}
        
        <Link to="/settings" className="p-2 hover:bg-[#141414] rounded-xl transition-colors text-[#666] hover:text-[#1D9E75]">
          <Settings size={layout.isPhone ? 16 : 20} />
        </Link>
        
        <button className="bg-[#141414] border border-[#2e2e2e] rounded-xl flex items-center justify-center text-[#1D9E75] shadow-[0_0_20px_rgba(29,158,117,0.2)] hover:bg-[#1a1a1a] transition-all active:scale-95"
          style={{ 
            width: layout.isPhone ? '32px' : '40px',
            height: layout.isPhone ? '32px' : '40px'
          }}
        >
          <Zap size={layout.isPhone ? 14 : 18} fill="currentColor" />
        </button>
      </div>
    </header>
  );
}
