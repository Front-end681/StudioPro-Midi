import { useState } from 'react';
import { useMidiStore } from '../store/midiStore';
import { useSettingsStore } from '../store/settingsStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useWebUSB } from '../hooks/useWebUSB';
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
    <div className="p-6 max-w-2xl mx-auto h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 hover:bg-[#242424] rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Connection</h1>
      </div>

      <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-[#2e2e2e] mb-8">
        <button 
          onClick={() => handleTabChange('midi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'midi' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
        >
          <Activity size={14} />
          Web MIDI
        </button>
        <button 
          onClick={() => handleTabChange('usb')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'usb' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
        >
          <Usb size={14} />
          USB
        </button>
        <button 
          onClick={() => handleTabChange('wifi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'wifi' ? 'bg-[#242424] text-[#1D9E75] shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
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
                  <p className="text-sm font-bold text-[#E24B4A]">Web MIDI not supported</p>
                  <p className="text-xs text-[#E24B4A]/80 mt-1">Web MIDI is not supported in this browser. Please use Chrome or Edge.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold">Detected Outputs</h2>
                </div>
                
                {midiOutputs.length === 0 ? (
                  <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-12 text-center space-y-4">
                    <Activity size={32} className="mx-auto text-[#2e2e2e]" />
                    <div className="space-y-1">
                      <p className="text-sm text-[#888]">No MIDI outputs detected.</p>
                      <p className="text-xs text-[#444]">Connect a MIDI device and click Refresh.</p>
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
                            <div className="text-sm font-medium">{output.name}</div>
                            <div className="text-[10px] text-[#888] uppercase tracking-wider">{output.manufacturer || 'Generic Manufacturer'}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedOutput(output);
                            setConnectionMode('webmidi');
                          }}
                          className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${selectedOutput?.id === output.id ? 'bg-[#1D9E75] text-white' : 'bg-[#242424] text-[#888] hover:text-white border border-[#2e2e2e]'}`}
                        >
                          {selectedOutput?.id === output.id ? 'Active' : 'Select'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={handleRefreshMIDI}
                  className="w-full py-3 bg-[#242424] hover:bg-[#2e2e2e] border border-[#2e2e2e] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#888] hover:text-white transition-all flex items-center justify-center gap-2"
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
                    <p className="text-lg font-bold">{usbDevice.productName || 'USB MIDI Device'}</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <div className="text-[10px] text-[#888] uppercase tracking-widest">VID: <span className="text-[#f0f0f0]">{usbDevice.vendorId}</span></div>
                      <div className="text-[10px] text-[#888] uppercase tracking-widest">PID: <span className="text-[#f0f0f0]">{usbDevice.productId}</span></div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#1D9E75]/20 rounded-full border border-[#1D9E75]/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                      <span className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-widest">Connected</span>
                    </div>
                  </div>
                  <button 
                    onClick={disconnectUSB}
                    className="px-8 py-3 bg-[#E24B4A]/10 border border-[#E24B4A]/30 text-[#E24B4A] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E24B4A]/20 transition-all"
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
                    <p className="text-sm font-bold">No USB Device Connected</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2e2e2e] rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#888]" />
                      <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Not Connected</span>
                    </div>
                  </div>
                  
                  {usbError && (
                    <div className="flex items-center gap-2 justify-center text-[#E24B4A] text-xs bg-[#E24B4A]/10 p-3 rounded-lg border border-[#E24B4A]/20">
                      <AlertCircle size={14} />
                      <span>{usbError}</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      connectUSB();
                      setConnectionMode('usb');
                    }}
                    className="w-full py-4 bg-[#1D9E75] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(29,158,117,0.2)] active:scale-95 transition-all"
                  >
                    Connect USB Device
                  </button>
                </>
              )}
            </div>
            
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6 flex items-start gap-4">
              <AlertCircle className="text-[#888] flex-shrink-0" size={18} />
              <p className="text-xs text-[#888] leading-relaxed">
                Requires Chrome or Edge browser. Connect a class-compliant USB-MIDI device via USB.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'wifi' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Server IP</label>
                  <input 
                    type="text" value={wifiIP} placeholder="192.168.1.100"
                    onChange={(e) => updateSetting('wifiIP', e.target.value)}
                    className="w-full bg-[#242424] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#1D9E75] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Port</label>
                  <input 
                    type="number" value={wifiPort}
                    onChange={(e) => updateSetting('wifiPort', parseInt(e.target.value))}
                    className="w-full bg-[#242424] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#1D9E75] transition-colors"
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0f0f0]">
                    {wifiStatus === 'connected' ? 'Connected' : 
                     wifiStatus === 'connecting' ? `Connecting... (Retry ${wifiRetryCount}/5)` : 
                     wifiStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#888] uppercase font-bold">Auto-Reconnect</span>
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
                    className="flex-1 py-3.5 bg-[#E24B4A]/10 border border-[#E24B4A]/30 text-[#E24B4A] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E24B4A]/20 transition-all"
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
                    className="flex-1 py-3.5 bg-[#1D9E75] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(29,158,117,0.2)] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {wifiStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2e2e2e] bg-[#242424]/50">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#f0f0f0] font-bold">Setup Instructions</h3>
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
                    <li key={i} className="flex gap-3 text-xs text-[#888]">
                      <span className="text-[#1D9E75] font-bold">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="pt-4 border-t border-[#2e2e2e]">
                  <p className="text-[10px] text-[#444] uppercase font-bold mb-1">Your computer's IP address:</p>
                  <p className="text-xs text-[#888]">Check Settings &gt; WiFi on your computer to find it.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Stats */}
      <div className="mt-12 pt-8 border-t border-[#2e2e2e] grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Active Mode</span>
          <span className="text-xs font-mono text-[#1D9E75] font-bold uppercase">
            {connectionMode === 'webmidi' ? 'Web MIDI' : connectionMode.toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Messages Sent</span>
          <span className="text-xs font-mono">{messagesSent}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Last Device</span>
          <span className="text-xs font-mono truncate">
            {connectionMode === 'webmidi' ? selectedOutput?.name || 'None' :
             connectionMode === 'usb' ? usbDevice?.productName || 'None' :
             connectionMode === 'wifi' ? wifiIP || 'None' : 'None'}
          </span>
        </div>
      </div>
    </div>
  );
}
