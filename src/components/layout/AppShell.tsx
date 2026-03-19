import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomBar from './BottomBar';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useMIDIInit } from '../../hooks/useMIDIInit';
import { useMIDI } from '../../hooks/useMIDI';
import { useKeyboardStore } from '../../store/keyboardStore';
import { useSettingsStore } from '../../store/settingsStore';
import MIDIConnectionManager from '../midi/MIDIConnectionManager';
import { CalibrationWizard } from '../calibration/CalibrationWizard';

import { useLayout } from '../../hooks/useLayout';

export default function AppShell() {
  const layout = useLayout();
  useKeyboardShortcuts();
  useMIDIInit();
  const { sendAllNotesOff } = useMIDI();
  const clearActiveKeys = useKeyboardStore((state) => state.clearActiveKeys);
  const isCalibrated = useSettingsStore((state) => state.isCalibrated);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Show wizard on first launch if not calibrated
    if (!isCalibrated) {
      setShowWizard(true);
    }
  }, [isCalibrated]);

  useEffect(() => {
    const handleLayoutChange = () => {
      sendAllNotesOff();
      clearActiveKeys();
    };

    window.addEventListener('orientationchange', handleLayoutChange);
    window.addEventListener('resize', handleLayoutChange);

    return () => {
      window.removeEventListener('orientationchange', handleLayoutChange);
      window.removeEventListener('resize', handleLayoutChange);
    };
  }, [sendAllNotesOff, clearActiveKeys]);
  
  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#050505] text-[#f0f0f0] overflow-hidden fixed top-0 left-0">
      <MIDIConnectionManager />
      <Header />
      <main className="flex-1 relative flex flex-col min-h-0 min-w-0 overflow-hidden">
        <Outlet />
      </main>
      <BottomBar />
      {showWizard && <CalibrationWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}
