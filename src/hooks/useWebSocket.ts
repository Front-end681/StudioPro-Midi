import { useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useMidiStore } from '../store/midiStore';

export function useWebSocket() {
  const { wifiIP, wifiPort, autoReconnect } = useSettingsStore();
  const { wifiStatus, wifiRetryCount, setWifiStatus, setWifiRetryCount } = useMidiStore();
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!wifiIP || !wifiPort) return;
    
    setWifiStatus('connecting');
    const url = `ws://${wifiIP}:${wifiPort}`;
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setWifiStatus('connected');
        setWifiRetryCount(0);
      };
      
      ws.onclose = () => {
        setWifiStatus('disconnected');
        if (autoReconnect && wifiRetryCount < 5) {
          setTimeout(() => {
            setWifiRetryCount(wifiRetryCount + 1);
            connect();
          }, 3000);
        }
      };
      
      ws.onerror = () => {
        setWifiStatus('error');
      };
      
      socketRef.current = ws;
    } catch (err) {
      setWifiStatus('error');
    }
  }, [wifiIP, wifiPort, autoReconnect, wifiRetryCount, setWifiStatus, setWifiRetryCount]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setWifiStatus('disconnected');
  }, [setWifiStatus]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  return {
    connect,
    disconnect,
    sendMessage
  };
}
