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

export interface SettingsState {
  numOctaves: number;
  defaultOctave: number;
  showNoteLabels: boolean;
  showOctaveNumbers: boolean;
  keyWidth: 'narrow' | 'normal' | 'wide';
  stabilityFilterEnabled: boolean;
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
  musicalStyle: 'classical' | 'jazz' | 'pop' | 'free';
}
