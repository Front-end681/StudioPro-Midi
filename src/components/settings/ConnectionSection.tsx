import React, { useState } from 'react';
import { useMidiStore } from '../../store/midiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useWebUSB } from '../../hooks/useWebUSB';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useLayout } from '../../hooks/useLayout';
import { Usb, Wifi, HelpCircle, X, Download, Copy, Check, ExternalLink } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, icon, children }) => {
  const layout = useLayout();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl w-full max-w-[480px] ${layout.isPhone ? 'max-h-[95vh]' : 'max-h-[90vh]'} overflow-y-auto no-scrollbar shadow-2xl relative animate-in zoom-in-95 duration-200`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-[#242424] rounded-full transition-colors text-[#888] hover:text-[#f0f0f0] z-10"
        >
          <X size={20} />
        </button>

        <div className={`${layout.isPhone ? 'p-6' : 'p-8'}`}>
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75]">
              {icon}
            </div>
            <h2 className="font-bold" style={{ fontSize: 'var(--font-lg)' }}>{title}</h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ command: string }> = ({ command }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg p-3 pr-12 font-mono text-[#1D9E75] relative group mb-3 break-all" style={{ fontSize: 'var(--font-xs)' }}>
      {command}
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 hover:bg-[#242424] rounded-md transition-colors text-[#666] hover:text-[#1D9E75]"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {copied && (
        <span className="absolute -top-8 right-0 bg-[#1D9E75] text-white text-[10px] px-2 py-1 rounded animate-in fade-in slide-in-from-bottom-1">
          Copied!
        </span>
      )}
    </div>
  );
};

export default function ConnectionSection() {
  const { 
    wifiStatus, usbDevice, usbError, connectionMode,
    setConnectionMode
  } = useMidiStore();
  
  const { wifiIP, wifiPort, updateSetting } = useSettingsStore();
  const { connectUSB } = useWebUSB();
  const { connect: connectWifi, disconnect: disconnectWifi } = useWebSocket();
  const layout = useLayout();

  const [isUsbModalOpen, setIsUsbModalOpen] = useState(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);

  const handleConnectUsb = async () => {
    await connectUSB();
    setConnectionMode('usb');
  };

  const handleConnectWifi = () => {
    connectWifi();
    setConnectionMode('wifi');
  };

  const handleDisconnectWifi = () => {
    disconnectWifi();
    setConnectionMode('webmidi');
  };

  const downloadServerJs = () => {
    const serverJsContent = `
// StudioPro MIDI — WiFi Bridge Server
// Requirements: npm install ws midi
// Run: node server.js

const WebSocket = require('ws')
const midi = require('midi')

const output = new midi.Output()
const portCount = output.getPortCount()

console.log('Available MIDI ports:')
for (let i = 0; i < portCount; i++) {
  console.log('  ' + i + ': ' + output.getPortName(i))
}

output.openVirtualPort('StudioPro MIDI')
console.log('Virtual MIDI port opened: StudioPro MIDI')

const wss = new WebSocket.Server({ port: 3001 })
console.log('WebSocket server running on port 3001')
console.log('Waiting for app to connect...')

wss.on('connection', (ws) => {
  console.log('App connected!')
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data)
      
      if (msg.type === 'noteOn') {
        output.sendMessage([
          0x90 + (msg.channel - 1), 
          msg.note, 
          msg.velocity
        ])
      }
      else if (msg.type === 'noteOff') {
        output.sendMessage([
          0x80 + (msg.channel - 1), 
          msg.note, 
          0
        ])
      }
      else if (msg.type === 'cc') {
        output.sendMessage([
          0xB0 + (msg.channel - 1), 
          msg.controller, 
          msg.value
        ])
      }
      else if (msg.type === 'pitchBend') {
        output.sendMessage([
          0xE0 + (msg.channel - 1), 
          msg.lsb, 
          msg.msb
        ])
      }
      else if (msg.type === 'allNotesOff') {
        for (let ch = 0; ch < 16; ch++) {
          output.sendMessage([0xB0 + ch, 123, 0])
        }
      }
    } catch (e) {
      console.error('Invalid message:', e.message)
    }
  })
  
  ws.on('close', () => {
    console.log('App disconnected')
  })
})
`;
    const blob = new Blob([serverJsContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <h2 className="font-medium tracking-[0.08em] uppercase text-[#666] mb-4" style={{ fontSize: 'var(--font-xs)' }}>Connection</h2>
      <div className={`grid ${layout.isPhone ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
        {/* USB CARD */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-5 flex flex-col justify-between group relative">
          <button 
            onClick={() => setIsUsbModalOpen(true)}
            className="absolute top-4 right-4 p-1.5 text-[#444] hover:text-[#1D9E75] transition-colors"
          >
            <HelpCircle size={18} />
          </button>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#242424] border border-[#2e2e2e] flex items-center justify-center text-[#888] group-hover:text-[#1D9E75] transition-colors">
              <Usb size={20} />
            </div>
            <div>
              <div className="font-bold" style={{ fontSize: 'var(--font-sm)' }}>USB MIDI</div>
              <div className="text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Connect via USB cable</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${usbDevice ? 'bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20' : 'bg-[#242424] text-[#666] border border-[#2e2e2e]'}`} style={{ fontSize: 'var(--font-xs)' }}>
              {usbDevice ? 'Connected' : 'Not Connected'}
            </div>
          </div>
        </div>

        {/* WIFI CARD */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-5 flex flex-col justify-between group relative">
          <button 
            onClick={() => setIsWifiModalOpen(true)}
            className="absolute top-4 right-4 p-1.5 text-[#444] hover:text-[#1D9E75] transition-colors"
          >
            <HelpCircle size={18} />
          </button>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#242424] border border-[#2e2e2e] flex items-center justify-center text-[#888] group-hover:text-[#1D9E75] transition-colors">
              <Wifi size={20} />
            </div>
            <div>
              <div className="font-bold" style={{ fontSize: 'var(--font-sm)' }}>WiFi MIDI</div>
              <div className="text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Connect over your local network</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                wifiStatus === 'connected' ? 'bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20' : 
                wifiStatus === 'connecting' ? 'bg-[#EF9F27]/10 text-[#EF9F27] border border-[#EF9F27]/20 animate-pulse' :
                wifiStatus === 'error' ? 'bg-[#E24B4A]/10 text-[#E24B4A] border border-[#E24B4A]/20' :
                'bg-[#242424] text-[#666] border border-[#2e2e2e]'
              }`} style={{ fontSize: 'var(--font-xs)' }}>
                {wifiStatus === 'connected' && <div className="w-1 h-1 rounded-full bg-[#1D9E75]" />}
                {wifiStatus === 'connected' ? 'Connected' : 
                 wifiStatus === 'connecting' ? 'Connecting...' : 
                 wifiStatus === 'error' ? 'Error' : 'Not Connected'}
              </div>
              {wifiStatus === 'connected' && (
                <div className="font-mono text-[#666] ml-1" style={{ fontSize: 'var(--font-xs)' }}>{wifiIP}:{wifiPort}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* USB MODAL */}
      <Modal 
        isOpen={isUsbModalOpen} 
        onClose={() => setIsUsbModalOpen(false)} 
        title="How to connect via USB"
        icon={<Usb size={20} />}
      >
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Requirements</h3>
            <ul className="space-y-2 text-[#888]" style={{ fontSize: 'var(--font-sm)' }}>
              <li className="flex items-center gap-2">• Chrome or Edge browser only</li>
              <li className="flex items-center gap-2">• Class-compliant USB-MIDI device</li>
              <li className="flex items-center gap-2">• HTTPS or localhost</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Steps</h3>
            <div className="space-y-4">
              {[
                "Connect your USB-MIDI device to your computer",
                "Click \"Connect USB Device\" button below",
                "A browser popup will appear — select your device from the list",
                "Click \"Connect\" in the popup",
                "The status will change to green \"Connected\""
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#242424] border border-[#2e2e2e] flex items-center justify-center font-bold text-[#1D9E75] shrink-0" style={{ fontSize: 'var(--font-xs)' }}>
                    {i + 1}
                  </div>
                  <p className="text-[#f0f0f0] leading-relaxed" style={{ fontSize: 'var(--font-sm)' }}>{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Common Devices</h3>
            <ul className="space-y-2 text-[#888]" style={{ fontSize: 'var(--font-sm)' }}>
              <li>• MIDI keyboards (Roland, Yamaha, Korg...)</li>
              <li>• MIDI interfaces (Focusrite, M-Audio...)</li>
              <li>• Any USB-MIDI class-compliant device</li>
            </ul>
          </section>

          <div className="p-4 bg-[#E24B4A]/5 border border-[#E24B4A]/20 rounded-xl">
            <div className="font-bold text-[#E24B4A] uppercase tracking-widest mb-1 flex items-center gap-2" style={{ fontSize: 'var(--font-xs)' }}>
              ⚠️ Not working?
            </div>
            <p className="text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>Make sure you're using Chrome or Edge. Firefox does not support WebUSB.</p>
          </div>

          {usbError && (
            <div className="p-3 bg-[#E24B4A]/10 border border-[#E24B4A]/20 rounded-lg text-[#E24B4A]" style={{ fontSize: 'var(--font-xs)' }}>
              {usbError}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleConnectUsb}
              className="flex-1 bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#1D9E75]/20"
              style={{ fontSize: 'var(--font-sm)' }}
            >
              Connect USB Device
            </button>
            <button 
              onClick={() => setIsUsbModalOpen(false)}
              className="px-6 py-3 border border-[#2e2e2e] text-[#888] font-bold rounded-xl hover:bg-[#242424] transition-all"
              style={{ fontSize: 'var(--font-sm)' }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* WIFI MODAL */}
      <Modal 
        isOpen={isWifiModalOpen} 
        onClose={() => setIsWifiModalOpen(false)} 
        title="How to connect via WiFi"
        icon={<Wifi size={20} />}
      >
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>How it works</h3>
            <p className="text-[#888] leading-relaxed" style={{ fontSize: 'var(--font-sm)' }}>
              Your device sends MIDI over WiFi to a small server running on your computer. The server forwards MIDI to your DAW.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Step 1 — Install Node.js</h3>
            <div className="flex items-center justify-between bg-[#242424] p-3 rounded-xl border border-[#2e2e2e]">
              <div className="text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Download from: nodejs.org</div>
              <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-[#1D9E75] hover:underline">
                <ExternalLink size={16} />
              </a>
            </div>
            <p className="text-[#666] mt-2" style={{ fontSize: 'var(--font-xs)' }}>(one-time setup)</p>
          </section>

          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Step 2 — Get server.js</h3>
            <button 
              onClick={downloadServerJs}
              className="w-full flex items-center justify-center gap-2 bg-[#242424] hover:bg-[#2e2e2e] border border-[#2e2e2e] text-[#f0f0f0] font-bold py-3 rounded-xl transition-all"
              style={{ fontSize: 'var(--font-sm)' }}
            >
              <Download size={18} />
              Download server.js
            </button>
          </section>

          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Step 3 — Run the server</h3>
            <p className="text-[#888] mb-3" style={{ fontSize: 'var(--font-sm)' }}>Open Terminal and run:</p>
            <CodeBlock command="npm install ws midi" />
            <CodeBlock command="node server.js" />
          </section>

          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Step 4 — Find your computer's IP</h3>
            <div className="space-y-2 text-[#888]" style={{ fontSize: 'var(--font-sm)' }}>
              <p><span className="text-[#f0f0f0] font-medium">Windows:</span> run "ipconfig" in CMD</p>
              <p><span className="text-[#f0f0f0] font-medium">Mac/Linux:</span> run "ifconfig" in Terminal</p>
              <p>Look for: <span className="text-[#1D9E75] font-mono">192.168.x.x</span></p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-[#666] uppercase tracking-widest mb-3" style={{ fontSize: 'var(--font-xs)' }}>Step 5 — Connect</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="col-span-2 space-y-2">
              <label className="font-bold text-[#666] uppercase tracking-widest ml-1" style={{ fontSize: 'var(--font-xs)' }}>IP Address</label>
              <input 
                type="text" value={wifiIP} onChange={(e) => updateSetting('wifiIP', e.target.value)}
                placeholder="192.168.1.100"
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-[#f0f0f0] focus:border-[#1D9E75] outline-none"
                style={{ fontSize: 'var(--font-sm)' }}
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-[#666] uppercase tracking-widest ml-1" style={{ fontSize: 'var(--font-xs)' }}>Port</label>
              <input 
                type="text" value={wifiPort} onChange={(e) => updateSetting('wifiPort', e.target.value)}
                placeholder="3001"
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-[#f0f0f0] focus:border-[#1D9E75] outline-none"
                style={{ fontSize: 'var(--font-sm)' }}
              />
            </div>
          </div>

            <div className="flex gap-3">
              {wifiStatus === 'connected' ? (
                <button 
                  onClick={handleDisconnectWifi}
                  className="flex-1 border border-[#E24B4A]/30 text-[#E24B4A] font-bold py-3 rounded-xl hover:bg-[#E24B4A]/10 transition-all"
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  Disconnect
                </button>
              ) : (
                <button 
                  onClick={handleConnectWifi}
                  className="flex-1 bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#1D9E75]/20"
                  style={{ fontSize: 'var(--font-sm)' }}
                >
                  Connect
                </button>
              )}
              <button 
                onClick={() => setIsWifiModalOpen(false)}
                className="px-6 py-3 border border-[#2e2e2e] text-[#888] font-bold rounded-xl hover:bg-[#242424] transition-all"
                style={{ fontSize: 'var(--font-sm)' }}
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 font-bold uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
              <span className="text-[#666]">Status:</span>
              <div className={`w-2 h-2 rounded-full ${
                wifiStatus === 'connected' ? 'bg-[#1D9E75]' : 
                wifiStatus === 'connecting' ? 'bg-[#EF9F27] animate-pulse' :
                wifiStatus === 'error' ? 'bg-[#E24B4A]' : 'bg-[#444]'
              }`} />
              <span className={
                wifiStatus === 'connected' ? 'text-[#1D9E75]' : 
                wifiStatus === 'connecting' ? 'text-[#EF9F27]' :
                wifiStatus === 'error' ? 'text-[#E24B4A]' : 'text-[#666]'
              }>
                {wifiStatus === 'connected' ? 'Connected' : 
                 wifiStatus === 'connecting' ? 'Connecting...' : 
                 wifiStatus === 'error' ? 'Error' : 'Not Connected'}
              </span>
            </div>
          </section>

          <div className="p-4 bg-[#EF9F27]/5 border border-[#EF9F27]/20 rounded-xl">
            <div className="font-bold text-[#EF9F27] uppercase tracking-widest mb-1 flex items-center gap-2" style={{ fontSize: 'var(--font-xs)' }}>
              ⚠️ Network Tip
            </div>
            <p className="text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>Both devices must be on the same WiFi network for the connection to work.</p>
          </div>
        </div>
      </Modal>
    </section>
  );
}
