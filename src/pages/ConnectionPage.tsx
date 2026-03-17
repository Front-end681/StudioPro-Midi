import { useState } from 'react';
import { useMidiStore } from '../store/midiStore';
import { useSettingsStore } from '../store/settingsStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useWebUSB } from '../hooks/useWebUSB';
import { useLayout } from '../hooks/useLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Usb, Wifi, Activity, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function ConnectionPage() {
  const [activeTab, setActiveTab] = useState<'midi' | 'usb' | 'wifi'>('midi');
  const { 
    midiOutputs, selectedOutput, setSelectedOutput, messagesSent,
    wifiStatus, wifiRetryCount,
    usbDevice, usbError,
    connectionMode, setConnectionMode,
    setMidiOutputs
  } = useMidiStore();
  
  const { wifiIP, wifiPort, autoReconnect, updateSetting } = useSettingsStore();
  const { connect: connectWiFi, disconnect: disconnectWiFi } = useWebSocket();
  const { connectUSB, disconnectUSB } = useWebUSB();
  const layout = useLayout();

  const handleRefreshMIDI = async () => {
    try {
      const access = await navigator.requestMIDIAccess();
      const outputs = Array.from(access.outputs.values());
      setMidiOutputs(outputs as any);
    } catch (err) {
      console.error('MIDI access denied', err);
    }
  };

  const handleTabChange = (tab: 'midi' | 'usb' | 'wifi') => {
    setActiveTab(tab);
  };

  const isWebMIDISupported = !!navigator.requestMIDIAccess;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar" style={{ padding: layout.isPhone ? '1rem' : '2rem' }}>
      <div className="max-w-2xl mx-auto pb-24">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2.5 bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-colors text-[#666] hover:text-[#1D9E75] border border-[#2e2e2e]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-black tracking-tighter uppercase italic text-white" style={{ fontSize: 'var(--font-xl)' }}>Connection</h1>
        </div>

        <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-[#2e2e2e] mb-8">
          <button 
            onClick={() => handleTabChange('midi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'midi' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <Activity size={14} />
            Web MIDI
          </button>
          <button 
            onClick={() => handleTabChange('usb')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'usb' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <Usb size={14} />
            USB
          </button>
          <button 
            onClick={() => handleTabChange('wifi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'wifi' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <Wifi size={14} />
            WiFi
          </button>
        </div>

        <div className="space-y-6 min-h-[300px]">
          {activeTab === 'midi' && (
            <div className="space-y-4">
              {!isWebMIDISupported ? (
                <div className="bg-[#E24B4A]/10 border border-[#E24B4A]/30 rounded-xl p-6 flex items-start gap-4">
                  <AlertCircle className="text-[#E24B4A] flex-shrink-0" size={20} />
                  <div>
                    <p className="font-bold text-[#E24B4A]" style={{ fontSize: 'var(--font-sm)' }}>Web MIDI not supported</p>
                    <p className="text-[#E24B4A]/80 mt-1" style={{ fontSize: 'var(--font-xs)' }}>Web MIDI is not supported in this browser. Please use Chrome or Edge.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="uppercase tracking-[0.2em] text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Detected Outputs</h2>
                  </div>
                  
                  {midiOutputs.length === 0 ? (
                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-12 text-center space-y-4">
                      <Activity size={32} className="mx-auto text-[#2e2e2e]" />
                      <div className="space-y-1">
                        <p className="text-[#888]" style={{ fontSize: 'var(--font-sm)' }}>No MIDI outputs detected.</p>
                        <p className="text-[#444]" style={{ fontSize: 'var(--font-xs)' }}>Connect a MIDI device and click Refresh.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {midiOutputs.map((output) => (
                        <div 
                          key={output.id}
                          className={`bg-[#1a1a1a] rounded-xl border p-4 flex items-center justify-between transition-all ${selectedOutput?.id === output.id ? 'border-[#1D9E75] bg-[#1D9E75]/5' : 'border-[#2e2e2e]'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${selectedOutput?.id === output.id ? 'bg-[#1D9E75]' : 'bg-[#444]'}`} />
                            <div>
                              <div className="font-medium" style={{ fontSize: 'var(--font-sm)' }}>{output.name}</div>
                              <div className="text-[#888] uppercase tracking-wider" style={{ fontSize: 'var(--font-xs)' }}>{output.manufacturer || 'Generic Manufacturer'}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedOutput(output);
                              setConnectionMode('webmidi');
                            }}
                            className={`px-4 py-1.5 font-bold uppercase tracking-wider rounded-lg transition-all ${selectedOutput?.id === output.id ? 'bg-[#1D9E75] text-white' : 'bg-[#242424] text-[#888] hover:text-white border border-[#2e2e2e]'}`}
                            style={{ fontSize: 'var(--font-xs)' }}
                          >
                            {selectedOutput?.id === output.id ? 'Active' : 'Select'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleRefreshMIDI}
                    className="w-full py-3 bg-[#242424] hover:bg-[#2e2e2e] border border-[#2e2e2e] rounded-xl font-bold uppercase tracking-widest text-[#888] hover:text-white transition-all flex items-center justify-center gap-2"
                    style={{ fontSize: 'var(--font-xs)' }}
                  >
                    <RefreshCw size={14} />
                    Refresh Device List
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'usb' && (
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-12 text-center space-y-6">
                {usbDevice ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto border border-[#1D9E75]/30">
                      <Usb size={32} className="text-[#1D9E75]" />
                    </div>
                    <div>
                      <p className="font-bold" style={{ fontSize: 'var(--font-lg)' }}>{usbDevice.productName || 'USB MIDI Device'}</p>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <div className="text-[#888] uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>VID: <span className="text-[#f0f0f0]">{usbDevice.vendorId}</span></div>
                        <div className="text-[#888] uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>PID: <span className="text-[#f0f0f0]">{usbDevice.productId}</span></div>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#1D9E75]/20 rounded-full border border-[#1D9E75]/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                        <span className="font-bold text-[#1D9E75] uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Connected</span>
                      </div>
                    </div>
                    <button 
                      onClick={disconnectUSB}
                      className="px-8 py-3 bg-[#E24B4A]/10 border border-[#E24B4A]/30 text-[#E24B4A] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E24B4A]/20 transition-all"
                      style={{ fontSize: 'var(--font-xs)' }}
                    >
                      Disconnect Device
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-[#242424] rounded-full flex items-center justify-center mx-auto border border-[#2e2e2e]">
                      <Usb size={32} className="text-[#444]" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold" style={{ fontSize: 'var(--font-sm)' }}>No USB Device Connected</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2e2e2e] rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#888]" />
                        <span className="font-bold text-[#888] uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Not Connected</span>
                      </div>
                    </div>
                    
                    {usbError && (
                      <div className="flex items-center gap-2 justify-center text-[#E24B4A] bg-[#E24B4A]/10 p-3 rounded-lg border border-[#E24B4A]/20" style={{ fontSize: 'var(--font-xs)' }}>
                        <AlertCircle size={14} />
                        <span>{usbError}</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        connectUSB();
                        setConnectionMode('usb');
                      }}
                      className="w-full py-4 bg-[#1D9E75] text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(29,158,117,0.2)] active:scale-95 transition-all"
                      style={{ fontSize: 'var(--font-xs)' }}
                    >
                      Connect USB Device
                    </button>
                  </>
                )}
              </div>
              
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6 flex items-start gap-4">
                <AlertCircle className="text-[#888] flex-shrink-0" size={18} />
                <p className="text-[#888] leading-relaxed" style={{ fontSize: 'var(--font-xs)' }}>
                  Requires Chrome or Edge browser. Connect a class-compliant USB-MIDI device via USB.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'wifi' && (
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6 space-y-6">
                <div className={`grid ${layout.isPhone ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <div className="space-y-2">
                    <label className="uppercase tracking-widest text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Server IP</label>
                    <input 
                      type="text" value={wifiIP} placeholder="192.168.1.100"
                      onChange={(e) => updateSetting('wifiIP', e.target.value)}
                      className="w-full bg-[#242424] border border-[#2e2e2e] rounded-lg px-4 py-2.5 font-mono focus:outline-none focus:border-[#1D9E75] transition-colors"
                      style={{ fontSize: 'var(--font-sm)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="uppercase tracking-widest text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Port</label>
                    <input 
                      type="number" value={wifiPort}
                      onChange={(e) => updateSetting('wifiPort', parseInt(e.target.value))}
                      className="w-full bg-[#242424] border border-[#2e2e2e] rounded-lg px-4 py-2.5 font-mono focus:outline-none focus:border-[#1D9E75] transition-colors"
                      style={{ fontSize: 'var(--font-sm)' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#242424] rounded-lg border border-[#2e2e2e]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      wifiStatus === 'connected' ? 'bg-[#1D9E75]' : 
                      wifiStatus === 'connecting' ? 'bg-[#EF9F27] animate-pulse' : 
                      wifiStatus === 'error' ? 'bg-[#E24B4A]' : 'bg-[#444]'
                    }`} />
                    <span className="font-bold uppercase tracking-widest text-[#f0f0f0]" style={{ fontSize: 'var(--font-xs)' }}>
                      {wifiStatus === 'connected' ? 'Connected' : 
                       wifiStatus === 'connecting' ? `Connecting... (Retry ${wifiRetryCount}/5)` : 
                       wifiStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#888] uppercase font-bold" style={{ fontSize: 'var(--font-xs)' }}>Auto-Reconnect</span>
                    <button 
                      onClick={() => updateSetting('autoReconnect', !autoReconnect)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${autoReconnect ? 'bg-[#1D9E75]' : 'bg-[#333]'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoReconnect ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  {wifiStatus === 'connected' ? (
                    <button 
                      onClick={disconnectWiFi}
                      className="flex-1 py-3.5 bg-[#E24B4A]/10 border border-[#E24B4A]/30 text-[#E24B4A] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E24B4A]/20 transition-all"
                      style={{ fontSize: 'var(--font-xs)' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        connectWiFi();
                        setConnectionMode('wifi');
                      }}
                      disabled={wifiStatus === 'connecting'}
                      className="flex-1 py-3.5 bg-[#1D9E75] text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(29,158,117,0.2)] active:scale-95 transition-all disabled:opacity-50"
                      style={{ fontSize: 'var(--font-xs)' }}
                    >
                      {wifiStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2e2e2e] bg-[#242424]/50">
                  <h3 className="uppercase tracking-[0.2em] text-[#f0f0f0] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Setup Instructions</h3>
                </div>
                <div className="p-6 space-y-4">
                  <ol className="space-y-3">
                    {[
                      'Install Node.js on your computer',
                      'Run: npm install ws midi',
                      'Run: node server.js',
                      'Enter your computer\'s IP above',
                      'Click Connect'
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>
                        <span className="text-[#1D9E75] font-bold">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="pt-4 border-t border-[#2e2e2e]">
                    <p className="text-[#444] uppercase font-bold mb-1" style={{ fontSize: 'var(--font-xs)' }}>Your computer's IP address:</p>
                    <p className="text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>Check Settings &gt; WiFi on your computer to find it.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
      </div>
    </div>
  );
}
