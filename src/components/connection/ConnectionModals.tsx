import React, { useState } from 'react';
import { Usb, Wifi, X, Copy, Check, AlertCircle, Globe } from 'lucide-react';
import { useLayout } from '../../hooks/useLayout';

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

interface ConnectionModalsProps {
  usbOpen: boolean;
  wifiOpen: boolean;
  onUsbClose: () => void;
  onWifiClose: () => void;
}

export const ConnectionModals: React.FC<ConnectionModalsProps> = ({ 
  usbOpen, 
  wifiOpen, 
  onUsbClose, 
  onWifiClose 
}) => {
  return (
    <>
      {/* USB MODAL */}
      <Modal 
        isOpen={usbOpen} 
        onClose={onUsbClose} 
        title="USB MIDI Setup"
        icon={<Usb size={20} />}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { title: "Connect Hardware", desc: "Plug your MIDI controller into your computer via USB." },
              { title: "Browser Permission", desc: "Click \"Connect USB Device\" and select your device from the browser popup." },
              { title: "Ready to Play", desc: "Once connected, StudioPro will route all MIDI data directly to your hardware." }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center shrink-0 font-bold text-sm">{i + 1}</div>
                <div>
                  <p className="text-sm text-white font-bold">{step.title}</p>
                  <p className="text-xs text-[#888] mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-[#EF9F27]/5 border border-[#EF9F27]/20 flex gap-3">
            <AlertCircle size={20} className="text-[#EF9F27] shrink-0" />
            <p className="text-[11px] text-[#EF9F27]/80 leading-relaxed">
              WebUSB requires a secure connection (HTTPS) and is supported in Chrome, Edge, and Opera.
            </p>
          </div>
          <button
            onClick={onUsbClose}
            className="w-full py-3 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-white text-sm font-bold transition-all"
          >
            Got it
          </button>
        </div>
      </Modal>

      {/* WIFI MODAL */}
      <Modal 
        isOpen={wifiOpen} 
        onClose={onWifiClose} 
        title="WiFi MIDI Bridge Setup"
        icon={<Wifi size={20} />}
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center shrink-0 font-bold text-sm">1</div>
              <div className="flex-1">
                <p className="text-sm text-white font-bold">Install Server Dependencies</p>
                <p className="text-xs text-[#888] mt-1 mb-2">Run this command in your terminal on the target computer:</p>
                <CodeBlock command="npm install ws midi" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center shrink-0 font-bold text-sm">2</div>
              <div className="flex-1">
                <p className="text-sm text-white font-bold">Run Bridge Server</p>
                <p className="text-xs text-[#888] mt-1 mb-2">Start the server using the provided server.js file:</p>
                <CodeBlock command="node server.js" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center shrink-0 font-bold text-sm">3</div>
              <div className="flex-1">
                <p className="text-sm text-white font-bold">Connect App</p>
                <p className="text-xs text-[#888] mt-1">Enter your computer's local IP address and port (default 3001) in the fields above and click Connect.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1D9E75]/5 border border-[#1D9E75]/20">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-[#1D9E75]" />
              <p className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-wider">Pro Tip</p>
            </div>
            <p className="text-[11px] text-[#1D9E75]/80 leading-relaxed">
              Use a virtual MIDI driver like <strong>loopMIDI</strong> (Windows) or <strong>IAC Driver</strong> (macOS) to route WiFi MIDI directly into your DAW.
            </p>
          </div>
          
          <button
            onClick={onWifiClose}
            className="w-full py-3 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-white text-sm font-bold transition-all"
          >
            I'm Ready
          </button>
        </div>
      </Modal>
    </>
  );
};
