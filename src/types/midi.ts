export interface MIDIEvent {
  type: 'noteOn' | 'noteOff' | 'cc' | 'pitchBend' | 'allNotesOff';
  note?: number;
  velocity?: number;
  channel: number;
  controller?: number;
  value?: number;
  lsb?: number;
  msb?: number;
}

export type VelocityCurve = 'linear' | 'exponential' | 'logarithmic';

export interface DeviceCapabilities {
  pressure: boolean;
  contactArea: boolean;
  touchInput: boolean;
}

export interface SettingsState {
  numOctaves: number;
  defaultOctave: number;
  showNoteLabels: boolean;
  showOctaveNumbers: boolean;
  keyWidth: 'narrow' | 'normal' | 'wide';
  velocityCurve: VelocityCurve;
  velocityPreset: 'precise' | 'natural' | 'expressive' | 'custom';
  minSpeed: number;
  maxSpeed: number;
  velocitySensitivity: number;
  velocityWindow: number;
  minVelocity: number;
  maxVelocity: number;
  midiChannel: number;
  transpose: number;
  sendNoteOffOnSustainRelease: boolean;
  allNotesOffOnDisconnect: boolean;
  audioEnabled: boolean;
  volume: number;
  sampleSet: 'piano' | 'synth';
  latencyMs: number;
  theme: 'dark' | 'light' | 'auto';
  accentColor: string;
  keyAnimation: boolean;
  wifiIP: string;
  wifiPort: number;
  autoReconnect: boolean;
  lastConnectionMode: string;
  freqCompensationEnabled: boolean;
  freqCompensationAmount: number;
  adaptiveEnabled: boolean;
  melodicIntelligenceEnabled: boolean;
  melodicStrength: 'subtle' | 'natural' | 'expressive';
  pressureMode: 'pen' | 'area' | 'duration';
  minContactArea: number;
  maxContactArea: number;
}
