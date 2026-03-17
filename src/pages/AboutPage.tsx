import { Link } from 'react-router-dom';
import { useLayout } from '../hooks/useLayout';
import { ArrowLeft, Download, Keyboard, Music, Zap } from 'lucide-react';

export default function AboutPage() {
  const layout = useLayout();
  const keyboardShortcuts = [
    { key: 'A, S, D, F, G, H, J, K, L', action: 'White Keys (C, D, E...)' },
    { key: 'W, E, T, Y, U, O, P', action: 'Black Keys (C#, D#, F#...)' },
    { key: 'Z / X', action: 'Octave Down / Up' },
    { key: 'Space', action: 'Sustain Pedal' },
    { key: 'Esc', action: 'Panic (All Notes Off)' },
  ];

  const midiNotes = [
    { octave: 'C0 - C1', range: '12 - 24' },
    { octave: 'C2 - C3', range: '36 - 48' },
    { octave: 'C4 (Middle C)', range: '60' },
    { octave: 'C5 - C6', range: '72 - 84' },
    { octave: 'C7 - C8', range: '96 - 108' },
  ];

  const handleDownloadServer = () => {
    const link = document.createElement('a');
    link.href = '/server.js';
    link.download = 'server.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar" style={{ padding: layout.isPhone ? '1rem' : '2rem' }}>
      <div className="max-w-3xl mx-auto pb-24">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/settings" className="p-2.5 bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-colors text-[#666] hover:text-[#1D9E75] border border-[#2e2e2e]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-black tracking-tighter uppercase italic text-white" style={{ fontSize: 'var(--font-xl)' }}>About StudioPro</h1>
        </div>

        <div className="space-y-10">
          {/* APP INFO */}
          <section className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center shadow-lg shadow-[#1D9E75]/20">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold" style={{ fontSize: 'var(--font-lg)' }}>StudioPro MIDI</h2>
                <p className="text-[#888] mb-4" style={{ fontSize: 'var(--font-xs)' }}>Version 1.0.0 (Stable)</p>
                <p className="text-[#ccc] leading-relaxed" style={{ fontSize: 'var(--font-sm)' }}>
                  A professional-grade MIDI controller PWA designed for low-latency performance. 
                  Connect via Web MIDI, USB, or WiFi to control your favorite DAWs and hardware synths.
                </p>
              </div>
            </div>
          </section>

          {/* KEYBOARD SHORTCUTS */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Keyboard size={16} className="text-[#1D9E75]" />
              <h2 className="uppercase tracking-[0.2em] text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Keyboard Shortcuts</h2>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2e2e2e] bg-[#242424]">
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>Key</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2e2e]">
                  {keyboardShortcuts.map((item, i) => (
                    <tr key={i} className="hover:bg-[#242424] transition-colors">
                      <td className="px-6 py-4 font-mono text-[#1D9E75]" style={{ fontSize: 'var(--font-sm)' }}>{item.key}</td>
                      <td className="px-6 py-4 text-[#ccc]" style={{ fontSize: 'var(--font-sm)' }}>{item.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* MIDI REFERENCE */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Music size={16} className="text-[#1D9E75]" />
              <h2 className="uppercase tracking-[0.2em] text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>MIDI Note Reference</h2>
            </div>
            <div className={`grid ${layout.isPhone ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2e2e2e] bg-[#242424]">
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>Octave</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[#888]" style={{ fontSize: 'var(--font-xs)' }}>MIDI #</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2e2e2e]">
                    {midiNotes.map((item, i) => (
                      <tr key={i} className="hover:bg-[#242424] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#ccc]" style={{ fontSize: 'var(--font-sm)' }}>{item.octave}</td>
                        <td className="px-6 py-4 font-mono text-[#1D9E75]" style={{ fontSize: 'var(--font-sm)' }}>{item.range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6">
                <h3 className="font-bold mb-4" style={{ fontSize: 'var(--font-sm)' }}>Touch Velocity</h3>
                <p className="text-[#888] mb-6 leading-relaxed" style={{ fontSize: 'var(--font-xs)' }}>
                  Velocity is calculated based on touch duration. A quick tap produces high velocity, 
                  while a long press results in lower velocity.
                </p>
                <div className="relative h-24 bg-[#242424] rounded-lg border border-[#2e2e2e] flex items-end px-4 pb-2 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-[#1D9E75] rounded-t-sm opacity-40"
                      style={{ height: `${(i + 1) * 8}%`, opacity: 0.2 + (i * 0.05) }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-bold uppercase tracking-widest text-[#888] -rotate-6" style={{ fontSize: 'var(--font-xs)' }}>Velocity Curve</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 font-bold text-[#666] uppercase" style={{ fontSize: 'var(--font-xs)' }}>
                  <span>Long Press (Soft)</span>
                  <span>Quick Tap (Hard)</span>
                </div>
              </div>
            </div>
          </section>

          {/* COMPANION SERVER */}
          <section className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-6 border-l-4 border-l-[#1D9E75]">
            <div className={`flex ${layout.isPhone ? 'flex-col gap-6' : 'items-center justify-between gap-6'}`}>
              <div>
                <h2 className="font-bold mb-1" style={{ fontSize: 'var(--font-lg)' }}>WiFi Companion Server</h2>
                <p className="text-[#888]" style={{ fontSize: 'var(--font-sm)' }}>
                  Download the Node.js bridge to enable WiFi MIDI on your computer.
                </p>
              </div>
              <button 
                onClick={handleDownloadServer}
                className="flex items-center gap-2 px-6 py-3 bg-[#1D9E75] hover:bg-[#168a65] text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-[#1D9E75]/20 shrink-0"
                style={{ fontSize: 'var(--font-sm)' }}
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
          </section>

          <div className="text-center pt-4">
            <p className="uppercase tracking-[0.3em] text-[#444]" style={{ fontSize: 'var(--font-xs)' }}>
              Made with Passion for Musicians
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
