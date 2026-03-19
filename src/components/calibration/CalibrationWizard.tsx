import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore } from '../../store/settingsStore';
import { Zap, Music, Heart, CheckCircle2, X, MousePointer2 } from 'lucide-react';

interface CalibrationStep {
  title: string;
  description: string;
  arabicTitle: string;
  arabicDescription: string;
  icon: React.ReactNode;
  color: string;
}

const STEPS: CalibrationStep[] = [
  {
    title: "Your softest touch",
    arabicTitle: "أهدى ضغطة ممكنة",
    description: "Touch the key as lightly as possible, like touching something sleeping.",
    arabicDescription: "اضغط المفتاح ده بأهدى ضغطة ممكنة، زي ما بتلمس حاجة نايمة.",
    icon: <Heart className="w-8 h-8" />,
    color: "text-blue-400",
  },
  {
    title: "Your hardest touch",
    arabicTitle: "أقوى ضغطة ممكنة",
    description: "Press as hard as you can, like knocking on a table.",
    arabicDescription: "دلوقتي اضغط بأقوى ضغطة ممكنة، زي ما بتدق على الطاولة.",
    icon: <Zap className="w-8 h-8" />,
    color: "text-red-400",
  },
  {
    title: "Your normal touch",
    arabicTitle: "بشكل طبيعي عادي",
    description: "Press naturally, the way you actually play.",
    arabicDescription: "اضغط بشكل طبيعي عادي، زي ما بتعزف فعلاً.",
    icon: <Music className="w-8 h-8" />,
    color: "text-emerald-400",
  }
];

export const CalibrationWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const updateSetting = useSettingsStore(state => state.updateSetting);
  const [currentStep, setCurrentStep] = useState(0);
  const [taps, setTaps] = useState<number[]>([]);
  const [stepResults, setStepResults] = useState<number[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  
  const pressStartTime = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    pressStartTime.current = performance.now();
    setIsPressing(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (pressStartTime.current === null) return;
    
    const duration = performance.now() - pressStartTime.current;
    pressStartTime.current = null;
    setIsPressing(false);

    const newTaps = [...taps, duration];
    if (newTaps.length < 5) {
      setTaps(newTaps);
    } else {
      // Step complete
      const average = newTaps.reduce((a, b) => a + b, 0) / 5;
      const newResults = [...stepResults, average];
      setStepResults(newResults);
      
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
        setTaps([]);
      } else {
        // All steps complete
        finishCalibration(newResults);
      }
    }
  };

  const finishCalibration = (results: number[]) => {
    updateSetting('softDuration', results[0]);
    updateSetting('hardDuration', results[1]);
    updateSetting('normalDuration', results[2]);
    updateSetting('isCalibrated', true);
    onClose();
  };

  const skipCalibration = () => {
    updateSetting('isCalibrated', true);
    onClose();
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-white/5">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-2xl bg-white/5 ${step.color}`}>
              {step.icon}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{step.title}</h2>
          <h3 className="text-xl font-medium text-white/90 mb-2" dir="rtl">{step.arabicTitle}</h3>
          <p className="text-zinc-400 text-sm px-4">{step.description}</p>
          <p className="text-zinc-500 text-sm px-4 mt-1" dir="rtl">{step.arabicDescription}</p>
        </div>

        {/* Main Interaction Area */}
        <div className="p-8 flex flex-col items-center">
          <motion.button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              if (isPressing) {
                setIsPressing(false);
                pressStartTime.current = null;
              }
            }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2
              transition-colors duration-200 select-none touch-none
              ${isPressing ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}
              border-4 ${isPressing ? 'border-white/40' : 'border-white/10'}
            `}
          >
            <MousePointer2 className={`w-10 h-10 ${isPressing ? 'text-white' : 'text-white/40'}`} />
            <span className="font-bold text-white/60 uppercase tracking-widest text-xs">
              {isPressing ? 'Release!' : 'Press Here'}
            </span>
            <span className="font-bold text-white/80 text-sm" dir="rtl">
              اضغط هنا
            </span>
          </motion.button>

          {/* Progress Dots */}
          <div className="mt-8 flex gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < taps.length ? 1.2 : 1,
                  backgroundColor: i < taps.length ? '#1D9E75' : 'rgba(255,255,255,0.1)'
                }}
                className="w-4 h-4 rounded-full border border-white/10"
              />
            ))}
          </div>
          <p className="mt-4 text-zinc-500 text-sm font-medium">
            Tap 5 times • اضغط 5 مرات
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 flex items-center justify-between">
          <div className="flex gap-1">
            {[0, 1, 2].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 w-8 rounded-full transition-colors ${s <= currentStep ? 'bg-emerald-500' : 'bg-white/10'}`} 
              />
            ))}
          </div>
          <button 
            onClick={skipCalibration}
            className="text-zinc-500 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Skip • تخطي
          </button>
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};
