import React, { useState } from 'react';
import { useMidiStore } from '../../store/midiStore';
import { 
  Usb, 
  Wifi, 
  AlertCircle, 
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { USBConnect } from '../connection/USBConnect';
import { WiFiConfig } from '../connection/WiFiConfig';
import { ConnectionModals } from '../connection/ConnectionModals';
import { PanicButton } from '../connection/PanicButton';

export default function ConnectionSection() {
  const { 
    connectionMode,
    setConnectionMode
  } = useMidiStore();
  
  const [isUsbModalOpen, setIsUsbModalOpen] = useState(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium tracking-[0.08em] uppercase text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Connection</h2>
        <PanicButton />
      </div>
      
      {/* Connection Mode Selector */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'webmidi', icon: <Globe size={18} />, label: 'Web MIDI' },
          { id: 'usb', icon: <Usb size={18} />, label: 'USB MIDI' },
          { id: 'wifi', icon: <Wifi size={18} />, label: 'WiFi MIDI' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setConnectionMode(mode.id as any)}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              connectionMode === mode.id
                ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
                : 'border-[#2e2e2e] bg-[#1a1a1a] text-[#666] hover:border-[#444]'
            }`}
          >
            {mode.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{mode.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {connectionMode === 'usb' && (
          <motion.div
            key="usb-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <USBConnect onShowInfo={() => setIsUsbModalOpen(true)} />
          </motion.div>
        )}

        {connectionMode === 'wifi' && (
          <motion.div
            key="wifi-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WiFiConfig onShowInfo={() => setIsWifiModalOpen(true)} />
          </motion.div>
        )}

        {connectionMode === 'webmidi' && (
          <motion.div
            key="webmidi-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-[#1D9E75] mt-0.5 shrink-0" />
            <p className="text-xs text-[#888] leading-relaxed">
              Standard Web MIDI is active. StudioPro will automatically detect and connect to available MIDI output ports on your system.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ConnectionModals 
        usbOpen={isUsbModalOpen}
        wifiOpen={isWifiModalOpen}
        onUsbClose={() => setIsUsbModalOpen(false)}
        onWifiClose={() => setIsWifiModalOpen(false)}
      />
    </section>
  );
}
