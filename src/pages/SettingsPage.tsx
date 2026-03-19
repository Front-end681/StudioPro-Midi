import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useKeyboardStore } from '../store/keyboardStore';
import { useMidiStore } from '../store/midiStore';
import { useTouchVelocity } from '../hooks/useTouchVelocity';
import { useLayout } from '../hooks/useLayout';
import ConnectionSection from '../components/settings/ConnectionSection';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Smartphone, MousePointer, Zap, RefreshCw } from 'lucide-react';

import { FreqCurveDisplay } from '../components/controls/FreqCurveDisplay';
import { getFreqFactor } from '../utils/frequencyWeight';
import { adaptiveCalibrator } from '../utils/adaptiveCalibrator';

import { useAudio } from '../hooks/useAudio';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const { setNumOctaves } = useKeyboardStore();
  const { deviceCapabilities } = useMidiStore();
  const { calculateVelocity } = useTouchVelocity();
  const layout = useLayout();
  const { isLoaded: audioLoaded } = useAudio();

  const [testVelocities, setTestVelocities] = useState<{v: number, raw: number, note: number, type: string}[]>([]);
  const [calibrationProfile, setCalibrationProfile] = useState(adaptiveCalibrator.getProfile());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleTestPress = (e: React.PointerEvent, note: number) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // We need a dummy element for calculateVelocity
    const dummyElement = e.currentTarget as HTMLElement;
    const finalVelocity = calculateVelocity(e.nativeEvent, dummyElement, note);
    
    // Update calibration profile display
    setCalibrationProfile(adaptiveCalibrator.getProfile());
    
    // To get raw velocity, we'd need to re-run parts of the engine or modify it.
    // For the UI display, let's calculate raw by reversing the freq compensation
    const factor = getFreqFactor(note);
    const amount = settings.freqCompensationEnabled ? settings.freqCompensationAmount : 0;
    const blended = 1.0 + (factor - 1.0) * amount;
    const rawVelocity = Math.round(finalVelocity / blended);
    
    let type = 'Speed';
    if (e.pointerType === 'touch') {
      if (e.pressure > 0 && e.pressure !== 0.5) type = 'Pressure';
      else if (e.width > 1 || e.height > 1) type = 'Area';
    }

    setTestVelocities(prev => [{v: finalVelocity, raw: rawVelocity, note, type}, ...prev].slice(0, 4));
  };

  const presets = {
    precise: { curve: 0.5, min: 0.01, max: 0.8 },
    natural: { curve: 0.65, min: 0.02, max: 1.2 },
    expressive: { curve: 0.85, min: 0.05, max: 1.8 },
  };

  const applyPreset = (name: 'precise' | 'natural' | 'expressive') => {
    const p = presets[name];
    updateSetting('velocityPreset', name);
    updateSetting('velocitySensitivity', p.curve);
    updateSetting('minSpeed', p.min);
    updateSetting('maxSpeed', p.max);
  };

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
          <div className={`flex ${layout.isPhone ? 'flex-col gap-4' : 'items-center justify-between'}`}>
            <h2 className="font-medium tracking-[0.08em] uppercase text-[#666]" style={{ fontSize: 'var(--font-xs)' }}>Playing Style</h2>
            <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#2e2e2e]">
              {['precise', 'natural', 'expressive'].map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p as any)}
                  className={`flex-1 px-4 py-2 font-black capitalize rounded-lg transition-all ${settings.velocityPreset === p ? 'bg-[#1D9E75] text-black shadow-lg' : 'text-[#666] hover:text-[#f0f0f0]'}`}
                  style={{ fontSize: 'var(--font-xs)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-40 sm:h-48 bg-[#0A0A0A] rounded-xl border border-[#2e2e2e] overflow-hidden relative">
            <FreqCurveDisplay amount={settings.velocitySensitivity} />
            <div className="absolute top-4 left-4 font-bold text-[#444] uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Response Curve</div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                <span className="text-[#666]">Sensitivity (Curve)</span>
                <span className="text-[#1D9E75]">{settings.velocitySensitivity.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.3" max="2.0" step="0.05" value={settings.velocitySensitivity}
                onChange={(e) => {
                  updateSetting('velocitySensitivity', parseFloat(e.target.value));
                  updateSetting('velocityPreset', 'custom');
                }}
                className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                  <span className="text-[#666]">Min Threshold</span>
                  <span className="text-[#1D9E75]">{settings.minSpeed.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.01" max="0.2" step="0.01" value={settings.minSpeed}
                  onChange={(e) => {
                    updateSetting('minSpeed', parseFloat(e.target.value));
                    updateSetting('velocityPreset', 'custom');
                  }}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                  <span className="text-[#666]">Max Threshold</span>
                  <span className="text-[#1D9E75]">{settings.maxSpeed.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0.5" max="3.0" step="0.1" value={settings.maxSpeed}
                  onChange={(e) => {
                    updateSetting('maxSpeed', parseFloat(e.target.value));
                    updateSetting('velocityPreset', 'custom');
                  }}
                  className="w-full h-1.5 bg-[#0A0A0A] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                  <span className="text-[#666]">Output Min</span>
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
                  <span className="text-[#666]">Output Max</span>
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

          {/* Melodic Intelligence */}
          <div className="pt-8 border-t border-[#2e2e2e] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Melodic Intelligence</h3>
                <p className="text-[#666] mt-1" style={{ fontSize: 'var(--font-xs)' }}>Natural crescendo on scales and runs</p>
              </div>
              <button 
                onClick={() => updateSetting('melodicIntelligenceEnabled', !settings.melodicIntelligenceEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.melodicIntelligenceEnabled ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.melodicIntelligenceEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {settings.melodicIntelligenceEnabled && (
              <div className="space-y-4">
                <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#2e2e2e]">
                  {['subtle', 'natural', 'expressive'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateSetting('melodicStrength', s as any)}
                      className={`flex-1 py-2 font-black capitalize rounded-lg transition-all ${settings.melodicStrength === s ? 'bg-[#1D9E75] text-black shadow-lg' : 'text-[#666] hover:text-[#f0f0f0]'}`}
                      style={{ fontSize: 'var(--font-xs)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[#444] italic" style={{ fontSize: 'var(--font-xs)' }}>
                  {settings.melodicStrength === 'subtle' && "Barely noticeable musical correction."}
                  {settings.melodicStrength === 'natural' && "Standard musical phrasing (±20 velocity)."}
                  {settings.melodicStrength === 'expressive' && "Dramatic crescendo/diminuendo (±35 velocity)."}
                </p>
              </div>
            )}
          </div>

          {/* Hardware Monitor (Inside Velocity Section) */}
          <div className="pt-8 border-t border-[#2e2e2e] space-y-6">
            <h3 className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Hardware Capabilities</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${deviceCapabilities.touchInput ? 'bg-[#1D9E75]/5 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#0A0A0A] border-[#2e2e2e] text-[#444]'}`}>
                <Smartphone size={18} />
                <span className="font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Touch</span>
              </div>
              <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${settings.pressureMode === 'pen' ? 'bg-[#1D9E75]/5 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#0A0A0A] border-[#2e2e2e] text-[#444]'}`}>
                <Zap size={18} />
                <span className="font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Pressure</span>
              </div>
              <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${settings.pressureMode === 'area' ? 'bg-[#1D9E75]/5 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#0A0A0A] border-[#2e2e2e] text-[#444]'}`}>
                <MousePointer size={18} />
                <span className="font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Area</span>
              </div>
            </div>

            <div className="p-4 bg-[#0A0A0A] rounded-xl border border-[#2e2e2e]">
              <div className="flex items-center justify-between">
                <span className="text-[#666] font-bold uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>Active Method</span>
                <span className="text-[#1D9E75] font-black uppercase" style={{ fontSize: 'var(--font-xs)' }}>
                  {settings.pressureMode === 'pen' && "S Pen Real Pressure ⭐"}
                  {settings.pressureMode === 'area' && "Contact Area + Duration"}
                  {settings.pressureMode === 'duration' && "Tap Speed/Duration"}
                </span>
              </div>
            </div>

            {/* Finger Pressure Calibration */}
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[#f0f0f0]" style={{ fontSize: 'var(--font-xs)' }}>Finger Pressure Calibration</h4>
                <button 
                  onClick={() => {
                    updateSetting('minContactArea', 100);
                    updateSetting('maxContactArea', 1200);
                  }}
                  className="text-[#666] hover:text-[#1D9E75] font-bold uppercase tracking-widest"
                  style={{ fontSize: '10px' }}
                >
                  Reset
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="h-24 bg-[#0A0A0A] border-2 border-dashed border-[#2e2e2e] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#1D9E75]/50 transition-colors cursor-pointer active:bg-[#1D9E75]/5"
                  onPointerDown={(e) => {
                    if (e.pointerType === 'touch') {
                      const area = e.width * e.height;
                      if (area > 1) updateSetting('minContactArea', Math.round(area));
                    }
                  }}
                >
                  <span className="text-[#444] font-black uppercase text-center px-2" style={{ fontSize: '10px' }}>Press LIGHTLY here</span>
                  <span className="text-[#1D9E75] font-mono text-xs">{settings.minContactArea}</span>
                </div>
                <div 
                  className="h-24 bg-[#0A0A0A] border-2 border-dashed border-[#2e2e2e] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#1D9E75]/50 transition-colors cursor-pointer active:bg-[#1D9E75]/5"
                  onPointerDown={(e) => {
                    if (e.pointerType === 'touch') {
                      const area = e.width * e.height;
                      if (area > 1) updateSetting('maxContactArea', Math.round(area));
                    }
                  }}
                >
                  <span className="text-[#444] font-black uppercase text-center px-2" style={{ fontSize: '10px' }}>Press HARD here</span>
                  <span className="text-[#1D9E75] font-mono text-xs">{settings.maxContactArea}</span>
                </div>
              </div>
              <p className="text-[#444] italic text-center" style={{ fontSize: 'var(--font-xs)' }}>
                Range: {settings.minContactArea} → {settings.maxContactArea} sq units
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#2e2e2e]">
              <div className="flex items-center justify-between">
                <span className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Adaptive Learning</span>
                <button 
                  onClick={() => updateSetting('adaptiveEnabled', !settings.adaptiveEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.adaptiveEnabled ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.adaptiveEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              
              {settings.adaptiveEnabled && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between font-black uppercase tracking-widest" style={{ fontSize: 'var(--font-xs)' }}>
                    <span className="text-[#1D9E75]">Profile Progress</span>
                    <span className="text-[#666]">{Math.round(calibrationProfile.progress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#1D9E75] shadow-[0_0_10px_rgba(29,158,117,0.5)] transition-all duration-500"
                      style={{ width: `${calibrationProfile.progress}%` }}
                    />
                  </div>
                </div>
              )}
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
              <span className="font-normal text-[#f0f0f0]" style={{ fontSize: 'var(--font-sm)' }}>Internal Synth</span>
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
