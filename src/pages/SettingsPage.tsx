import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useKeyboardStore } from '../store/keyboardStore';
import { useLayout } from '../hooks/useLayout';
import ConnectionSection from '../components/settings/ConnectionSection';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';

import { useAudio } from '../hooks/useAudio';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const { setNumOctaves } = useKeyboardStore();
  const layout = useLayout();
  const { isLoaded: audioLoaded } = useAudio();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const accentColors = [
    { name: 'Teal', value: '#1D9E75' },
    { name: 'Amber', value: '#EF9F27' },
    { name: 'Blue', value: '#378ADD' },
    { name: 'Coral', value: '#D85A30' },
    { name: 'Purple', value: '#7F77DD' },
  ];

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="settings-page flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#050505] no-scrollbar">
      <style>
        {`
          .settings-page * {
            font-size: max(var(--font-md), 13px) !important;
          }
          .settings-page h2, .settings-page .section-label {
            font-size: 13px !important;
          }
          .settings-page .setting-label {
            font-size: 13px !important;
          }
          .settings-page .segmented-option {
            font-size: 13px !important;
          }
          .settings-page .toggle-label {
            font-size: 13px !important;
          }
          .settings-page .slider-label {
            font-size: 13px !important;
          }
          .settings-page .value-display {
            font-size: 13px !important;
          }
        `}
      </style>
      <div className="max-w-3xl mx-auto pb-24 space-y-8 sm:space-y-12" style={{ padding: layout.isPhone ? '1rem' : '2rem 3rem' }}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2.5 bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-colors text-[#666] hover:text-[#1D9E75] border border-[#2e2e2e]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-black tracking-tighter uppercase italic text-white" style={{ fontSize: 'var(--font-xl)' }}>Settings</h1>
            <p className="text-[#666] font-bold uppercase tracking-[0.2em]" style={{ fontSize: 'var(--font-xs)' }}>Application Configuration</p>
          </div>
        </div>

        {/* 1. KEYBOARD */}
        <section className="bg-[#141414] rounded-2xl border border-[#2e2e2e] p-5 sm:p-8 space-y-6">
          <h2 className="font-medium tracking-[0.08em] uppercase text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Keyboard Layout</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Octaves</span>
              <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#2e2e2e]">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      updateSetting('numOctaves', n);
                      setNumOctaves(n);
                    }}
                    className={`px-4 py-2 font-black rounded-lg transition-all ${settings.numOctaves === n ? 'bg-[#1D9E75] text-black shadow-lg' : 'text-[#666] hover:text-[#f0f0f0]'}`}
                    style={{ fontSize: 'var(--font-xs)' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Key Width</span>
              <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#2e2e2e]">
                {['narrow', 'normal', 'wide'].map((w) => (
                  <button
                    key={w}
                    onClick={() => updateSetting('keyWidth', w as any)}
                    className={`px-3 py-2 font-black rounded-lg transition-all capitalize ${settings.keyWidth === w ? 'bg-[#1D9E75] text-black shadow-lg' : 'text-[#666] hover:text-[#f0f0f0]'}`}
                    style={{ fontSize: 'var(--font-xs)' }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Show Note Labels</span>
              <button 
                onClick={() => updateSetting('showNoteLabels', !settings.showNoteLabels)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.showNoteLabels ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.showNoteLabels ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* 2. VELOCITY ENGINE */}
        <section className="bg-[#141414] rounded-2xl border border-[#2e2e2e] p-5 sm:p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="font-medium tracking-[0.08em] uppercase text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Musical Style</h2>
            <p className="text-[#444] italic" style={{ fontSize: 'var(--font-xs)' }}>The engine adapts velocity rules to your playing style</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0A0A0A] p-1.5 rounded-2xl border border-[#2e2e2e]">
            {(['classical', 'jazz', 'pop', 'free'] as const).map((style) => (
              <button
                key={style}
                onClick={() => updateSetting('musicalStyle', style)}
                className={`py-3 font-black capitalize rounded-xl transition-all ${settings.musicalStyle === style ? 'bg-[#1D9E75] text-black shadow-lg' : 'text-[#666] hover:text-[#f0f0f0]'}`}
                style={{ fontSize: 'var(--font-xs)' }}
              >
                {style}
              </button>
            ))}
          </div>

          <div className="space-y-6 pt-4 border-t border-[#2e2e2e]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Stability Filter</h3>
                <p className="text-[#666] mt-1" style={{ fontSize: 'var(--font-xs)' }}>Prevents accidental velocity jumps</p>
              </div>
              <button 
                onClick={() => updateSetting('stabilityFilterEnabled', !settings.stabilityFilterEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.stabilityFilterEnabled ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.stabilityFilterEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2e2e2e] space-y-6">
            <h3 className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Output Range</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                  <span className="text-[#666]">Softest (Min)</span>
                  <span className="text-[#1D9E75]">{settings.minVelocity}</span>
                </div>
                <input 
                  type="range" min="1" max="64" value={settings.minVelocity}
                  onChange={(e) => updateSetting('minVelocity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                  <span className="text-[#666]">Loudest (Max)</span>
                  <span className="text-[#1D9E75]">{settings.maxVelocity}</span>
                </div>
                <input 
                  type="range" min="64" max="127" value={settings.maxVelocity}
                  onChange={(e) => updateSetting('maxVelocity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                />
              </div>
            </div>
          </div>

          {/* Engine Info */}
          <div className="pt-8 border-t border-[#2e2e2e] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#666] font-bold uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Engine Status</span>
              <span className="text-[#1D9E75] font-black uppercase" style={{ fontSize: 'var(--font-xs)' }}>
                Music-Aware Active
              </span>
            </div>
          </div>
        </section>

        {/* 3. MIDI */}
        <section className="bg-[#141414] rounded-2xl border border-[#2e2e2e] p-5 sm:p-8 space-y-6">
          <h2 className="font-medium tracking-[0.08em] uppercase text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>MIDI Configuration</h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Output Channel</div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(ch => (
                  <button
                    key={ch}
                    onClick={() => updateSetting('midiChannel', ch)}
                    className={`py-3 font-black rounded-lg border transition-all ${settings.midiChannel === ch ? 'bg-[#1D9E75] text-black border-[#1D9E75] shadow-[0_0_15px_rgba(29,158,117,0.2)]' : 'bg-[#0A0A0A] border-[#2e2e2e] text-[#666] hover:text-white'}`}
                    style={{ fontSize: 'var(--font-xs)' }}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2e2e2e]">
              <div>
                <div className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Transpose</div>
                <div className="font-black text-white mt-1" style={{ fontSize: 'var(--font-xs)' }}>{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose} Semitones</div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateSetting('transpose', Math.max(-12, settings.transpose - 1))}
                  className="w-10 h-10 bg-[#0A0A0A] border border-[#2e2e2e] rounded-xl flex items-center justify-center text-lg font-black hover:bg-[#242424] transition-colors text-white"
                >
                  -
                </button>
                <button 
                  onClick={() => updateSetting('transpose', Math.min(12, settings.transpose + 1))}
                  className="w-10 h-10 bg-[#0A0A0A] border border-[#2e2e2e] rounded-xl flex items-center justify-center text-lg font-black hover:bg-[#242424] transition-colors text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CONNECTION */}
        <ConnectionSection />

        {/* 5. AUDIO */}
        <section className="bg-[#141414] rounded-2xl border border-[#2e2e2e] p-5 sm:p-8 space-y-6">
          <h2 className="font-medium tracking-[0.08em] uppercase text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Audio Engine</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Local Control</span>
                <p className="text-[#666] mt-1" style={{ fontSize: 'var(--font-xs)' }}>Turn off to mute internal sound when using external software</p>
              </div>
              <button 
                onClick={() => updateSetting('audioEnabled', !settings.audioEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.audioEnabled ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.audioEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                <span className="text-[#666]">Master Volume</span>
                <span className="text-[#1D9E75]">{settings.volume}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={settings.volume}
                onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
              />
            </div>
          </div>
        </section>

        {/* 6. APPEARANCE */}
        <section className="bg-[#141414] rounded-2xl border border-[#2e2e2e] p-5 sm:p-8 space-y-6">
          <h2 className="font-medium tracking-[0.08em] uppercase text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Appearance</h2>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  updateSetting('accentColor', color.value);
                  document.documentElement.style.setProperty('--accent', color.value);
                  document.documentElement.style.setProperty('--white-key-pressed', color.value);
                }}
                className="w-10 h-10 rounded-xl border border-[#2e2e2e] flex items-center justify-center transition-all active:scale-90 hover:scale-110"
                style={{ backgroundColor: color.value }}
              >
                {settings.accentColor === color.value && <Check size={18} className="text-white" />}
              </button>
            ))}
          </div>
        </section>

        {/* 7. SYSTEM */}
        <section className="bg-[#141414] rounded-2xl border border-[#2e2e2e] p-5 sm:p-8">
          <div className={`flex ${layout.isPhone ? 'flex-col gap-4' : 'items-center justify-between'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center text-[#1D9E75]">
                <RefreshCw size={20} />
              </div>
              <div>
                <div className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>System Reset</div>
                <div className="font-black text-white" style={{ fontSize: 'var(--font-xs)' }}>Restore Factory Defaults</div>
              </div>
            </div>
            
            {!showResetConfirm ? (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="px-6 py-3 bg-[#E24B4A]/10 text-[#E24B4A] border border-[#E24B4A]/30 rounded-xl font-black uppercase tracking-widest hover:bg-[#E24B4A] hover:text-white transition-all"
                style={{ fontSize: 'var(--font-xs)' }}
              >
                Reset
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-3 bg-[#141414] text-[#666] rounded-xl font-black uppercase tracking-widest"
                  style={{ fontSize: 'var(--font-xs)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReset}
                  className="px-4 py-3 bg-[#E24B4A] text-white rounded-xl font-black uppercase tracking-widest"
                  style={{ fontSize: 'var(--font-xs)' }}
                >
                  Confirm Reset
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
