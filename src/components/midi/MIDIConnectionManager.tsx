import { useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useMidiStore } from '../../store/midiStore';
import { useSettingsStore } from '../../store/settingsStore';

export default function MIDIConnectionManager() {
  const { connectionMode, wifiStatus } = useMidiStore();
  const { autoReconnect } = useSettingsStore();
  const { connect: connectWiFi } = useWebSocket();

  useEffect(() => {
    // Initial WiFi connection if auto-reconnect is on
    if (connectionMode === 'wifi' && wifiStatus === 'disconnected' && autoReconnect) {
      connectWiFi();
    }
  }, [connectionMode, autoReconnect, wifiStatus, connectWiFi]);

  return null; // Background component
}
