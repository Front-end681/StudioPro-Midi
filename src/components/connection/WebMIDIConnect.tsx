import React from 'react';
import { Activity, RefreshCw, AlertCircle } from 'lucide-react';
import { useMidiStore } from '../../store/midiStore';

export const WebMIDIConnect: React.FC = () => {
  const { 
    midiOutputs, 
    selectedOutput, 
    setSelectedOutput, 
    setConnectionMode,
    setMidiOutputs
  } = useMidiStore();

  const handleRefreshMIDI = async () => {
    try {
      const access = await navigator.requestMIDIAccess();
      const outputs = Array.from(access.outputs.values());
      setMidiOutputs(outputs as any);
    } catch (err) {
      console.error('MIDI access denied', err);
    }
  };

  const isWebMIDISupported = !!navigator.requestMIDIAccess;

  return (
    <div className="space-y-4">
      {!isWebMIDISupported ? (
        <div className="bg-[#E24B4A]/10 border border-[#E24B4A]/30 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="text-[#E24B4A] flex-shrink-0" size={20} />
          <div>
            <p className="font-bold text-[#E24B4A]" style={{ fontSize: 'var(--font-sm)' }}>Web MIDI not supported</p>
            <p className="text-[#E24B4A]/80 mt-1" style={{ fontSize: 'var(--font-xs)' }}>Web MIDI is not supported in this browser. Please use Chrome or Edge.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="uppercase tracking-[0.2em] text-[#888] font-bold" style={{ fontSize: 'var(--font-xs)' }}>Detected Outputs</h2>
          </div>
          
          {midiOutputs.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-12 text-center space-y-4">
              <Activity size={32} className="mx-auto text-[#2e2e2e]" />
              <div className="space-y-1">
                <p className="text-[#888]" style={{ fontSize: 'var(--font-sm)' }}>No MIDI outputs detected.</p>
                <p className="text-[#444]" style={{ fontSize: 'var(--font-xs)' }}>Connect a MIDI device and click Refresh.</p>
                <p className="text-[#1D9E75] mt-4 font-bold" style={{ fontSize: 'var(--font-xs)' }}>
                  Note: USB MIDI devices should appear here automatically. If not, check your cable or try the "USB" tab for advanced connection.
                </p>
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
                      <div className="font-medium" style={{ fontSize: 'var(--font-sm)' }}>{output.name}</div>
                      <div className="text-[#888] uppercase tracking-wider" style={{ fontSize: 'var(--font-xs)' }}>{output.manufacturer || 'Generic Manufacturer'}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedOutput(output);
                      setConnectionMode('webmidi');
                    }}
                    className={`px-4 py-1.5 font-bold uppercase tracking-wider rounded-lg transition-all ${selectedOutput?.id === output.id ? 'bg-[#1D9E75] text-white' : 'bg-[#242424] text-[#888] hover:text-white border border-[#2e2e2e]'}`}
                    style={{ fontSize: 'var(--font-xs)' }}
                  >
                    {selectedOutput?.id === output.id ? 'Active' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button 
            onClick={handleRefreshMIDI}
            className="w-full py-3 bg-[#242424] hover:bg-[#2e2e2e] border border-[#2e2e2e] rounded-xl font-bold uppercase tracking-widest text-[#888] hover:text-white transition-all flex items-center justify-center gap-2"
            style={{ fontSize: 'var(--font-xs)' }}
          >
            <RefreshCw size={14} />
            Refresh Device List
          </button>
        </>
      )}
    </div>
  );
};
