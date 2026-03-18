import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useMidiStore } from '../store/midiStore';
import { wifiMidiService } from '../services/wifiMidiService';

export function useWebSocket() {
  const { wifiIP, wifiPort, autoReconnect } = useSettingsStore();
  const { setWifiStatus, setWifiRetryCount } = useMidiStore();

  const connect = useCallback(() => {
    if (!wifiIP || !wifiPort) return;
    
    wifiMidiService.connect(wifiIP, wifiPort, autoReconnect, (status, retryCount) => {
      setWifiStatus(status);
      setWifiRetryCount(retryCount);
    });
  }, [wifiIP, wifiPort, autoReconnect, setWifiStatus, setWifiRetryCount]);

  const disconnect = useCallback(() => {
    wifiMidiService.disconnect();
    setWifiStatus('disconnected');
  }, [setWifiStatus]);

  const sendMessage = useCallback((type: string, data: any) => {
    wifiMidiService.send(type, data);
  }, []);

  return {
    connect,
    disconnect,
    sendMessage
  };
}
