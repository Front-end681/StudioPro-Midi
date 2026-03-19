import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { midiSender } from '../../utils/midiSender';
import { motion, AnimatePresence } from 'motion/react';

export const PanicButton: React.FC = () => {
  const [isPanicking, setIsPanicking] = useState(false);

  const handlePanic = () => {
    setIsPanicking(true);
    midiSender.allNotesOff();
    setTimeout(() => setIsPanicking(false), 1000);
  };

  return (
    <button
      onClick={handlePanic}
      disabled={isPanicking}
      className={`relative overflow-hidden px-6 py-3 rounded-xl font-black uppercase tracking-tighter italic transition-all flex items-center gap-2 border ${
        isPanicking 
          ? 'bg-[#E24B4A] border-[#E24B4A] text-white' 
          : 'bg-black/20 border-[#E24B4A]/30 text-[#E24B4A] hover:bg-[#E24B4A]/10'
      }`}
      style={{ fontSize: 'var(--font-sm)' }}
    >
      <AnimatePresence mode="wait">
        {isPanicking ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 size={18} className="animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <AlertTriangle size={18} />
          </motion.div>
        )}
      </AnimatePresence>
      <span>{isPanicking ? 'SILENCING...' : 'PANIC'}</span>
      
      {isPanicking && (
        <motion.div 
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, ease: "linear" }}
        />
      )}
    </button>
  );
};
