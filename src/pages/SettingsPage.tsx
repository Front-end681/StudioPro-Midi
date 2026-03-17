import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useKeyboardStore } from '../store/keyboardStore';
import { useMidiStore } from '../store/midiStore';
import { useTouchVelocity } from '../hooks/useTouchVelocity';
import { useResponsive } from '../hooks/useResponsive';
import ConnectionSection from '../components/settings/ConnectionSection';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Smartphone, MousePointer, Zap, Sliders, RefreshCw } from 'lucide-react';

import { FreqCurveDisplay } from '../components/controls/FreqCurveDisplay';
import { getFreqFactor } from '../utils/frequencyWeight';
import { adaptiveCalibrator } from '../utils/adaptiveCalibrator';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const { setNumOctaves } = useKeyboardStore();
  const { deviceCapabilities } = useMidiStore();
  const { calculateVelocity } = useTouchVelocity();
  const { isMobile, isPortrait } = useResponsive();

  const [testVelocities, setTestVelocities] = useState<{v: number, raw: number, note: number, type: string}[]>([]);
  const [calibrationProfile, setCalibrationProfile] = useState(adaptiveCalibrator.getProfile());

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
    soft: { curve: 0.5, min: 0.01, max: 0.8 },
    normal: { curve: 0.65, min: 0.02, max: 1.2 },
    hard: { curve: 0.85, min: 0.05, max: 1.8 },
  };

  const applyPreset = (name: 'soft' | 'normal' | 'hard') => {
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

  const containerPadding = isMobile ? 'p-4' : 'p-6';
  const sectionSpacing = isMobile ? 'space-y-6' : 'space-y-10';

  return (
    <div className={`${containerPadding} max-w-2xl mx-auto h-full overflow-y-auto no-scrollbar pb-24`}>
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <Link to="/" className="p-2 hover:bg-[#242424] rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
      </div>
      
      <div className={sectionSpacing}>
        {/* KEYBOARD */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-4">Keyboard</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-4 sm:p-6 space-y-6">
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div>
                <div className="text-sm font-medium">Number of Octaves</div>
                <div className="text-xs text-[#888]">Visible keyboard range</div>
              </div>
              <div className="flex bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      updateSetting('numOctaves', n);
                      setNumOctaves(n);
                    }}
                    className={`flex-1 sm:px-4 py-1.5 text-xs font-bold rounded transition-all ${settings.numOctaves === n ? 'bg-[#1D9E75] text-white shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div>
                <div className="text-sm font-medium">Key Width</div>
                <div className="text-xs text-[#888]">Size of individual keys</div>
              </div>
              <div className="flex bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
                {['narrow', 'normal', 'wide'].map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      updateSetting('keyWidth', w as any);
                      const width = w === 'narrow' ? '36px' : w === 'normal' ? '48px' : '60px';
                      document.documentElement.style.setProperty('--white-key-width', width);
                    }}
                    className={`flex-1 sm:px-3 py-1.5 text-xs font-bold capitalize rounded transition-all ${settings.keyWidth === w ? 'bg-[#1D9E75] text-white shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Show Note Labels</div>
                <div className="text-xs text-[#888]">Display note names on keys</div>
              </div>
              <button 
                onClick={() => updateSetting('showNoteLabels', !settings.showNoteLabels)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.showNoteLabels ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.showNoteLabels ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* VELOCITY */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-4">Velocity Engine</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-4 sm:p-6 space-y-8">
            
            {/* Presets */}
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div>
                <div className="text-sm font-medium">Response Preset</div>
                <div className="text-xs text-[#888]">Pre-calibrated sensitivity</div>
              </div>
              <div className="flex bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
                {['soft', 'normal', 'hard'].map((p) => (
                  <button
                    key={p}
                    onClick={() => applyPreset(p as any)}
                    className={`flex-1 sm:px-3 py-1.5 text-xs font-bold capitalize rounded transition-all ${settings.velocityPreset === p ? 'bg-[#1D9E75] text-white shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Calibration */}
            <div className="space-y-6 pt-4 border-t border-[#2e2e2e]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#888] uppercase tracking-widest">
                <Sliders size={12} />
                Advanced Calibration
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#888]">Sensitivity (Curve)</span>
                  <span>{settings.velocitySensitivity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.3" max="2.0" step="0.05" value={settings.velocitySensitivity}
                  onChange={(e) => {
                    updateSetting('velocitySensitivity', parseFloat(e.target.value));
                    updateSetting('velocityPreset', 'custom');
                  }}
                  className="w-full h-1.5 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                />
              </div>

              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#888]">Min Speed</span>
                    <span>{settings.minSpeed.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" min="0.01" max="0.2" step="0.01" value={settings.minSpeed}
                    onChange={(e) => {
                      updateSetting('minSpeed', parseFloat(e.target.value));
                      updateSetting('velocityPreset', 'custom');
                    }}
                    className="w-full h-1.5 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#888]">Max Speed</span>
                    <span>{settings.maxSpeed.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="3.0" step="0.1" value={settings.maxSpeed}
                    onChange={(e) => {
                      updateSetting('maxSpeed', parseFloat(e.target.value));
                      updateSetting('velocityPreset', 'custom');
                    }}
                    className="w-full h-1.5 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                  />
                </div>
              </div>

              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#888]">Min Vel</span>
                    <span>{settings.minVelocity}</span>
                  </div>
                  <input 
                    type="range" min="1" max="64" value={settings.minVelocity}
                    onChange={(e) => updateSetting('minVelocity', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#888]">Max Vel</span>
                    <span>{settings.maxVelocity}</span>
                  </div>
                  <input 
                    type="range" min="64" max="127" value={settings.maxVelocity}
                    onChange={(e) => updateSetting('maxVelocity', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                  />
                </div>
              </div>
            </div>

            {/* Adaptive Calibration */}
            <div className="pt-8 border-t border-[#2e2e2e]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium">Adaptive Calibration</div>
                  <div className="text-xs text-[#888]">Learns your touch in real-time</div>
                </div>
                <button 
                  onClick={() => updateSetting('adaptiveEnabled', !settings.adaptiveEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.adaptiveEnabled ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.adaptiveEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {settings.adaptiveEnabled && (
                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className={
                        calibrationProfile.progress < 20 ? 'text-[#888]' :
                        calibrationProfile.progress < 60 ? 'text-amber-500' :
                        calibrationProfile.progress < 100 ? 'text-teal-500' : 'text-[#1D9E75]'
                      }>
                        {calibrationProfile.progress < 20 ? 'Warming up...' :
                         calibrationProfile.progress < 60 ? 'Learning your touch...' :
                         calibrationProfile.progress < 100 ? 'Almost calibrated' : 'Fully calibrated ✓'}
                      </span>
                      <span className="text-[#888]">{Math.round(calibrationProfile.progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#242424] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          calibrationProfile.progress < 20 ? 'bg-[#444]' :
                          calibrationProfile.progress < 60 ? 'bg-amber-500' :
                          calibrationProfile.progress < 100 ? 'bg-teal-500' : 'bg-[#1D9E75]'
                        }`}
                        style={{ width: `${calibrationProfile.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2e2e2e] space-y-3">
                    <div className="text-[10px] font-bold text-[#666] uppercase tracking-widest border-b border-[#2e2e2e] pb-2">Your Touch Profile</div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#888]">Softest Press</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[120px] ml-4">
                          <div className="flex-1 h-1 bg-[#242424] rounded-full overflow-hidden">
                            <div className="h-full bg-[#888]" style={{ width: `${calibrationProfile.detectedMin * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-mono w-8 text-right">{Math.round(calibrationProfile.detectedMin * 100)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#888]">Hardest Press</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[120px] ml-4">
                          <div className="flex-1 h-1 bg-[#242424] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1D9E75]" style={{ width: `${calibrationProfile.detectedMax * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-mono w-8 text-right">{Math.round(calibrationProfile.detectedMax * 100)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#888]">Dynamic Range</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[120px] ml-4">
                          <div className="flex-1 h-1 bg-[#242424] rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500" style={{ width: `${calibrationProfile.range * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-mono w-8 text-right">{Math.round(calibrationProfile.range * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2e2e2e]">
                      <span className="text-[9px] text-[#555] font-medium">Samples: {calibrationProfile.sampleCount} / 50</span>
                      <button 
                        onClick={() => {
                          adaptiveCalibrator.reset();
                          setCalibrationProfile(adaptiveCalibrator.getProfile());
                        }}
                        className="text-[9px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-wider transition-colors"
                      >
                        Reset Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Frequency Compensation */}
            <div className="pt-8 border-t border-[#2e2e2e]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium">Frequency Compensation</div>
                  <div className="text-xs text-[#888]">Balance loudness across all notes</div>
                </div>
                <button 
                  onClick={() => updateSetting('freqCompensationEnabled', !settings.freqCompensationEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.freqCompensationEnabled ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.freqCompensationEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {settings.freqCompensationEnabled && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#888]">Amount</span>
                      <span>{Math.round(settings.freqCompensationAmount * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1.0" step="0.05" value={settings.freqCompensationAmount}
                      onChange={(e) => updateSetting('freqCompensationAmount', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                    />
                  </div>
                  
                  <FreqCurveDisplay amount={settings.freqCompensationAmount} />
                </div>
              )}
            </div>

            {/* Device Info */}
            <div className="pt-6 border-t border-[#2e2e2e]">
              <div className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-4">Hardware Capabilities</div>
              <div className="grid grid-cols-3 gap-2">
                <div className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${deviceCapabilities.touchInput ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#242424] border-[#2e2e2e] text-[#444]'}`}>
                  <Smartphone size={16} />
                  <span className="text-[9px] font-bold uppercase">Touch</span>
                </div>
                <div className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${deviceCapabilities.pressure ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#242424] border-[#2e2e2e] text-[#444]'}`}>
                  <Zap size={16} />
                  <span className="text-[9px] font-bold uppercase">Pressure</span>
                </div>
                <div className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${deviceCapabilities.contactArea ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#242424] border-[#2e2e2e] text-[#444]'}`}>
                  <MousePointer size={16} />
                  <span className="text-[9px] font-bold uppercase">Area</span>
                </div>
              </div>
            </div>

            {/* Test Section */}
            <div className="pt-6 border-t border-[#2e2e2e]">
              <div className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-4">Test Velocity</div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[36, 60, 84, 108].map(note => (
                  <div
                    key={note}
                    className="aspect-square bg-[#242424] border border-[#2e2e2e] rounded-xl flex flex-col items-center justify-center active:bg-[#1D9E75]/20 active:border-[#1D9E75] transition-colors cursor-pointer touch-none"
                    onPointerDown={(e) => handleTestPress(e, note)}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#333] mb-1" />
                    <span className="text-[8px] text-[#666] font-bold">C{Math.floor(note/12 - 1)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                {testVelocities.length === 0 ? (
                  <div className="text-center py-4 text-xs text-[#444] italic">Tap the pads above to test</div>
                ) : (
                  testVelocities.map((test, i) => {
                    const factor = getFreqFactor(test.note);
                    const amount = settings.freqCompensationEnabled ? settings.freqCompensationAmount : 0;
                    const blended = 1.0 + (factor - 1.0) * amount;
                    const diff = Math.round((blended - 1.0) * 100);
                    const diffText = diff === 0 ? '' : diff > 0 ? ` (+${diff}%)` : ` (${diff}%)`;
                    const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][test.note % 12] + (Math.floor(test.note / 12) - 1);

                    return (
                      <div key={i} className="flex flex-col bg-[#242424] px-4 py-3 rounded-lg border border-[#2e2e2e] animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                            <span className="text-xs font-mono font-bold">Raw:{test.raw} → Final:{test.v}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest">via {test.type}</span>
                        </div>
                        <div className="text-[10px] text-[#666] font-medium ml-4">
                          {noteName} note compensation: {diffText || 'None'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MIDI */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-4">MIDI</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-4 sm:p-6 space-y-6">
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div>
                <div className="text-sm font-medium">MIDI Channel</div>
                <div className="text-xs text-[#888]">Channel for outgoing messages</div>
              </div>
              <select 
                value={settings.midiChannel}
                onChange={(e) => updateSetting('midiChannel', parseInt(e.target.value))}
                className="bg-[#242424] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#1D9E75]"
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map(ch => (
                  <option key={ch} value={ch}>Channel {ch}</option>
                ))}
              </select>
            </div>

            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div>
                <div className="text-sm font-medium">Transpose</div>
                <div className="text-xs text-[#888]">Shift pitch in semitones</div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateSetting('transpose', Math.max(-12, settings.transpose - 1))}
                  className="w-8 h-8 bg-[#242424] border border-[#2e2e2e] rounded-lg flex items-center justify-center text-sm font-bold hover:bg-[#2e2e2e]"
                >
                  -
                </button>
                <span className="text-sm font-mono font-bold w-8 text-center">{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose}</span>
                <button 
                  onClick={() => updateSetting('transpose', Math.min(12, settings.transpose + 1))}
                  className="w-8 h-8 bg-[#242424] border border-[#2e2e2e] rounded-lg flex items-center justify-center text-sm font-bold hover:bg-[#2e2e2e]"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONNECTION */}
        <ConnectionSection />

        {/* AUDIO */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-4">Audio</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Internal Audio</div>
                <div className="text-xs text-[#888]">Enable built-in piano sounds</div>
              </div>
              <button 
                onClick={() => updateSetting('audioEnabled', !settings.audioEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${settings.audioEnabled ? 'bg-[#1D9E75]' : 'bg-[#2e2e2e]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.audioEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#888]">Volume</span>
                <span>{settings.volume}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={settings.volume}
                onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
              />
            </div>

            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div>
                <div className="text-sm font-medium">Sample Set</div>
                <div className="text-xs text-[#888]">Sound engine preset</div>
              </div>
              <div className="flex bg-[#242424] p-1 rounded-lg border border-[#2e2e2e]">
                {['piano', 'synth'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSetting('sampleSet', s as any)}
                    className={`flex-1 sm:px-4 py-1.5 text-xs font-bold capitalize rounded transition-all ${settings.sampleSet === s ? 'bg-[#1D9E75] text-white shadow-lg' : 'text-[#888] hover:text-[#f0f0f0]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* APPEARANCE */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-4">Appearance</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] p-4 sm:p-6 space-y-6">
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div>
                <div className="text-sm font-medium">Accent Color</div>
                <div className="text-xs text-[#888]">Primary theme color</div>
              </div>
              <div className="flex gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      updateSetting('accentColor', color.value);
                      document.documentElement.style.setProperty('--accent', color.value);
                      document.documentElement.style.setProperty('--white-key-pressed', color.value);
                    }}
                    className="w-6 h-6 rounded-full border border-[#2e2e2e] flex items-center justify-center transition-transform active:scale-90"
                    style={{ backgroundColor: color.value }}
                  >
                    {settings.accentColor === color.value && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SYSTEM */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-bold mb-4">System</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2e2e2e] overflow-hidden divide-y divide-[#2e2e2e]">
            <Link 
              to="/about" 
              className="flex items-center justify-between p-4 sm:p-6 hover:bg-[#242424] transition-colors"
            >
              <div>
                <div className="text-sm font-medium">About StudioPro</div>
                <div className="text-xs text-[#888]">Version, shortcuts, and info</div>
              </div>
              <ArrowLeft size={16} className="text-[#888] rotate-180" />
            </Link>
            
            <button 
              onClick={() => {
                if (confirm('Reset all settings to factory defaults?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-[#E24B4A]/5 transition-colors group"
            >
              <div>
                <div className="text-sm font-medium group-hover:text-[#E24B4A]">Reset All Settings</div>
                <div className="text-xs text-[#888]">Clear all preferences and connections</div>
              </div>
              <RefreshCw size={16} className="text-[#888] group-hover:text-[#E24B4A]" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
