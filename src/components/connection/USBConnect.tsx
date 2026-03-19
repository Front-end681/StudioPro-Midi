import React from 'react';
import { Usb, Power, Info, AlertCircle } from 'lucide-react';
import { useMidiStore } from '../../store/midiStore';
import { useWebUSB } from '../../hooks/useWebUSB';
import { ConnectionBadge } from './ConnectionBadge';

interface USBConnectProps {
  onShowInfo: () => void;
}

export const USBConnect: React.FC<USBConnectProps> = ({ onShowInfo }) => {
  const { usbStatus, usbDeviceName, usbError } = useMidiStore();
  const { connectUSB, disconnectUSB } = useWebUSB();

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2e2e2e] p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            usbStatus === 'connected' ? 'bg-[#1D9E75]/20 text-[#1D9E75]' :
            usbStatus === 'connecting' ? 'bg-[#EF9F27]/20 text-[#EF9F27]' :
            'bg-[#242424] text-[#666]'
          }`}>
            <Usb size={20} />
          </div>
          <div>
            <div className="font-bold text-white" style={{ fontSize: 'var(--font-sm)' }}>USB MIDI Interface</div>
            <div className="text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Direct hardware connection</div>
          </div>
        </div>
        <ConnectionBadge status={usbStatus} />
      </div>

      {usbStatus === 'connected' && usbDeviceName && (
        <div className="p-3 rounded-xl bg-[#1D9E75]/5 border border-[#1D9E75]/10">
          <p className="text-[10px] text-[#1D9E75]/80 mb-1 font-bold uppercase tracking-wider">Active Device</p>
          <p className="text-sm text-white font-mono">{usbDeviceName}</p>
        </div>
      )}

      {usbError && (
        <div className="p-3 rounded-xl bg-[#E24B4A]/10 border border-[#E24B4A]/20 flex items-start gap-3">
          <AlertCircle size={16} className="text-[#E24B4A] mt-0.5 shrink-0" />
          <p className="text-xs text-[#E24B4A] leading-relaxed">{usbError}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {usbStatus === 'connected' ? (
          <button
            onClick={disconnectUSB}
            className="flex-1 py-3 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold transition-all border border-[#2e2e2e] flex items-center justify-center gap-2"
          >
            <Power size={16} />
            Disconnect Device
          </button>
        ) : (
          <button
            onClick={connectUSB}
            disabled={usbStatus === 'connecting' || usbStatus === 'not_supported'}
            className="flex-1 py-3 rounded-xl bg-[#1D9E75] hover:bg-[#1D9E75]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-[#1D9E75]/20 flex items-center justify-center gap-2"
          >
            <Usb size={16} />
            {usbStatus === 'connecting' ? 'Connecting...' : 'Connect USB Device'}
          </button>
        )}
        <button
          onClick={onShowInfo}
          className="p-3 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-[#666] transition-all border border-[#2e2e2e]"
        >
          <Info size={20} />
        </button>
      </div>
    </div>
  );
};
