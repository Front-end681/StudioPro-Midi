/**
 * StudioPro MIDI WiFi Bridge Server
 * 
 * Dependencies:
 * npm install ws midi
 * 
 * Usage:
 * node server.js
 */

const WebSocket = require('ws');
const midi = require('midi');

const output = new midi.Output();
const portCount = output.getPortCount();

if (portCount === 0) {
  console.log('No MIDI output ports found.');
  // On some systems we can open a virtual port
  try {
    output.openVirtualPort('StudioPro MIDI');
    console.log('Virtual MIDI port "StudioPro MIDI" opened.');
  } catch (e) {
    console.error('Could not open virtual port. Please connect a MIDI device.');
    process.exit(1);
  }
} else {
  // List available ports
  console.log('Available MIDI output ports:');
  for (let i = 0; i < portCount; i++) {
    console.log(`Port ${i}: ${output.getPortName(i)}`);
  }
  // Open first available port
  output.openPort(0);
  console.log(`Connected to: ${output.getPortName(0)}`);
}

const wss = new WebSocket.Server({ port: 3001 });
console.log('WebSocket server running on ws://localhost:3001');

wss.on('connection', (ws) => {
  console.log('App connected');
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      
      if (msg.type === 'midi' && Array.isArray(msg.data)) {
        output.sendMessage(msg.data);
      }
      else if (msg.type === 'noteOn') {
        const status = 0x90 + (msg.channel - 1);
        output.sendMessage([status, msg.note, msg.velocity]);
      }
      else if (msg.type === 'noteOff') {
        const status = 0x80 + (msg.channel - 1);
        output.sendMessage([status, msg.note, 0]);
      }
      else if (msg.type === 'cc') {
        const status = 0xB0 + (msg.channel - 1);
        output.sendMessage([status, msg.controller, msg.value]);
      }
      else if (msg.type === 'pitchBend') {
        const status = 0xE0 + (msg.channel - 1);
        output.sendMessage([status, msg.lsb, msg.msb]);
      }
      else if (msg.type === 'allNotesOff') {
        for (let ch = 0; ch < 16; ch++) {
          output.sendMessage([0xB0 + ch, 123, 0]);
          output.sendMessage([0xB0 + ch, 64, 0]);
        }
      }
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });
  
  ws.on('close', () => console.log('App disconnected'));
});
