import { useState } from 'react';
import { useMidiStore } from '../store/midiStore';
import { useLayout } from '../hooks/useLayout';
import { useSettingsStore } from '../store/settingsStore';
import { Link } from 'react-router-dom';
import { ArrowLeft, Usb, Wifi, Activity, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { USBConnect } from '../components/connection/USBConnect';
import { WiFiConfig } from '../components/connection/WiFiConfig';
import { WebMIDIConnect } from '../components/connection/WebMIDIConnect';
import { ConnectionModals } from '../components/connection/ConnectionModals';
import { PanicButton } from '../components/connection/PanicButton';

export default function ConnectionPage() {
  const [activeTab, setActiveTab] = useState<'midi' | 'usb' | 'wifi'>('midi');
  const { 
    selectedOutput, messagesSent,
    connectionMode,
    usbDevice
  } = useMidiStore();
  
  const { wifiIP, audioEnabled, updateSetting } = useSettingsStore();
  const layout = useLayout();
  const [isUsbModalOpen, setIsUsbModalOpen] = useState(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar" style={{ padding: layout.isPhone ? '1rem' : '2rem' }}>
      <div className="max-w-2xl mx-auto pb-24">
        {isIOS && (
          <div className="bg-[#EF9F27]/10 border border-[#EF9F27]/30 rounded-xl p-4 mb-6 flex items-start gap-4">
            <AlertCircle className="text-[#EF9F27] flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-[#EF9F27]" style={{ fontSize: 'var(--font-sm)' }}>iOS Limitation</p>
              <p className="text-[#EF9F27]/80 mt-1" style={{ fontSize: 'var(--font-xs)' }}>
                Web MIDI and WebUSB are not supported on iOS browsers. Please use a desktop computer or an Android device for hardware connection.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2.5 bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-colors text-[#666] hover:text-[#1D9E75] border border-[#2e2e2e]">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-black tracking-tighter uppercase italic text-white" style={{ fontSize: 'var(--font-xl)' }}>Connection</h1>
          </div>
          <PanicButton />
        </div>

        <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-[#2e2e2e] mb-8 overflow-hidden">
          <button 
            onClick={() => setActiveTab('midi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'midi' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <Activity size={14} />
            Web MIDI
          </button>
          <button 
            onClick={() => setActiveTab('usb')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'usb' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <Usb size={14} />
            USB
          </button>
          <button 
            onClick={() => setActiveTab('wifi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'wifi' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <Wifi size={14} />
            WiFi
          </button>
        </div>

        <div className="space-y-6 min-h-[300px]">
          {activeTab === 'midi' && (
            <WebMIDIConnect />
          )}

          {activeTab === 'usb' && (
            <USBConnect onShowInfo={() => setIsUsbModalOpen(true)} />
          )}

          {activeTab === 'wifi' && (
            <WiFiConfig onShowInfo={() => setIsWifiModalOpen(true)} />
          )}
        </div>

        {/* Local Control Toggle */}
        <div className="mt-8 p-4 bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${audioEnabled ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-red-500/10 text-red-500'}`}>
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </div>
            <div>
              <p className="font-bold text-white" style={{ fontSize: 'var(--font-sm)' }}>Local Control</p>
              <p className="text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>
                {audioEnabled ? 'Internal sound is ON' : 'Internal sound is MUTED (MIDI Only)'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => updateSetting('audioEnabled', !audioEnabled)}
            className={`w-12 h-6 rounded-full relative transition-all ${audioEnabled ? 'bg-[#1D9E75]' : 'bg-[#444]'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${audioEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Connection Stats */}
        <div className="mt-12 pt-8 border-t border-[#2e2e2e] grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="uppercase tracking-widest text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Active Mode</span>
            <span className="font-mono text-[#1D9E75] font-bold uppercase" style={{ fontSize: 'var(--font-xs)' }}>
              {connectionMode === 'webmidi' ? 'Web MIDI' : connectionMode.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="uppercase tracking-widest text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Messages Sent</span>
            <span className="font-mono" style={{ fontSize: 'var(--font-xs)' }}>{messagesSent}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="uppercase tracking-widest text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Last Device</span>
            <span className="font-mono truncate" style={{ fontSize: 'var(--font-xs)' }}>
              {connectionMode === 'webmidi' ? selectedOutput?.name || 'None' :
               connectionMode === 'usb' ? usbDevice?.productName || 'None' :
               connectionMode === 'wifi' ? wifiIP || 'None' : 'None'}
            </span>
          </div>
        </div>

        <div className="mt-12 bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6">
          <h3 className="uppercase tracking-[0.2em] text-[#f0f0f0] font-bold mb-4" style={{ fontSize: 'var(--font-xs)' }}>Troubleshooting</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <AlertCircle size={14} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
              <p className="text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>
                <span className="text-[#f0f0f0] font-bold">Device not showing?</span> Try unplugging and replugging your MIDI device, then click "Refresh Device List".
              </p>
            </div>
            <div className="flex gap-3">
              <AlertCircle size={14} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
              <p className="text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>
                <span className="text-[#f0f0f0] font-bold">"Not Connected" status?</span> Make sure you click the "Connect" button and select your device in the browser popup.
              </p>
            </div>
            <div className="flex gap-3">
              <AlertCircle size={14} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
              <p className="text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>
                <span className="text-[#f0f0f0] font-bold">Browser Support:</span> Use Google Chrome or Microsoft Edge. Safari and Firefox have limited support for MIDI/USB.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConnectionModals 
        usbOpen={isUsbModalOpen}
        wifiOpen={isWifiModalOpen}
        onUsbClose={() => setIsUsbModalOpen(false)}
        onWifiClose={() => setIsWifiModalOpen(false)}
      />
    </div>
  );
}
