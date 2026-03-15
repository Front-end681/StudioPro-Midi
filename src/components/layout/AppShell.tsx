import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomBar from './BottomBar';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useMIDIInit } from '../../hooks/useMIDIInit';
import MIDIConnectionManager from '../midi/MIDIConnectionManager';

export default function AppShell() {
  useKeyboardShortcuts();
  useMIDIInit();
  
  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-[#f0f0f0]">
      <MIDIConnectionManager />
      <Header />
      <main className="flex-1 relative overflow-y-auto pb-[64px]">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}
