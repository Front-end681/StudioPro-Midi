import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomBar from './BottomBar';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useMIDIInit } from '../../hooks/useMIDIInit';
import { useMIDI } from '../../hooks/useMIDI';
import { useKeyboardStore } from '../../store/keyboardStore';
import MIDIConnectionManager from '../midi/MIDIConnectionManager';

export default function AppShell() {
  useKeyboardShortcuts();
  useMIDIInit();
  const { sendAllNotesOff } = useMIDI();
  const clearActiveKeys = useKeyboardStore((state) => state.clearActiveKeys);

  useEffect(() => {
    const handleLayoutChange = () => {
      // Release all notes on orientation or significant resize
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
    <div className="flex flex-col h-[100dvh] bg-[#0f0f0f] text-[#f0f0f0] overflow-hidden">
      <MIDIConnectionManager />
      <Header />
      <main className="flex-1 relative flex flex-col min-h-0">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}
