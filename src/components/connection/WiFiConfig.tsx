import React from 'react';
import { Wifi, Power, Info, RefreshCw } from 'lucide-react';
import { useMidiStore } from '../../store/midiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ConnectionBadge } from './ConnectionBadge';

interface WiFiConfigProps {
  onShowInfo: () => void;
}

export const WiFiConfig: React.FC<WiFiConfigProps> = ({ onShowInfo }) => {
  const { wifiStatus, wifiRetryCount } = useMidiStore();
  const { wifiIP, wifiPort, autoReconnect, updateSetting } = useSettingsStore();
  const { connect, disconnect } = useWebSocket();

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2e2e2e] p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            wifiStatus === 'connected' ? 'bg-[#1D9E75]/20 text-[#1D9E75]' :
            wifiStatus === 'connecting' ? 'bg-[#EF9F27]/20 text-[#EF9F27]' :
            'bg-[#242424] text-[#666]'
          }`}>
            <Wifi size={20} />
          </div>
          <div>
            <div className="font-bold text-white" style={{ fontSize: 'var(--font-sm)' }}>WiFi MIDI Bridge</div>
            <div className="text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Connect to StudioPro Server</div>
          </div>
        </div>
        <ConnectionBadge status={wifiStatus} retryCount={wifiRetryCount} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#666] uppercase tracking-wider ml-1">Server IP</label>
          <input
            type="text"
            value={wifiIP}
            onChange={(e) => updateSetting('wifiIP', e.target.value)}
            placeholder="192.168.1.X"
            className="w-full bg-black/40 border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#1D9E75]/50 transition-all font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#666] uppercase tracking-wider ml-1">Port</label>
          <input
            type="number"
            value={wifiPort}
            onChange={(e) => updateSetting('wifiPort', parseInt(e.target.value))}
            placeholder="3001"
            className="w-full bg-black/40 border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#1D9E75]/50 transition-all font-mono"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-[#242424] border border-[#2e2e2e]">
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-[#666]" />
          <span className="text-xs text-[#888]">Auto-Reconnect</span>
        </div>
        <button
          onClick={() => updateSetting('autoReconnect', !autoReconnect)}
          className={`w-10 h-5 rounded-full transition-all relative ${
            autoReconnect ? 'bg-[#1D9E75]' : 'bg-[#444]'
          }`}
        >
          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${
            autoReconnect ? 'left-6' : 'left-1'
          }`} />
        </button>
      </div>

      <div className="flex gap-3">
        {wifiStatus === 'connected' ? (
          <button
            onClick={disconnect}
            className="flex-1 py-3 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-white text-xs font-bold transition-all border border-[#2e2e2e] flex items-center justify-center gap-2"
          >
            <Power size={16} />
            Disconnect
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={wifiStatus === 'connecting'}
            className="flex-1 py-3 rounded-xl bg-[#1D9E75] hover:bg-[#1D9E75]/90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-[#1D9E75]/20 flex items-center justify-center gap-2"
          >
            <Wifi size={16} />
            {wifiStatus === 'connecting' ? 'Connecting...' : 'Connect to Server'}
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
