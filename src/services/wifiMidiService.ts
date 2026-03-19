
type WifiStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class WifiMidiService {
  private socket: WebSocket | null = null;
  private status: WifiStatus = 'disconnected';
  private retryCount = 0;
  private maxRetries = 5;
  private onStatusChange: ((status: WifiStatus, retryCount: number) => void) | null = null;
  private currentConfig: { ip: string; port: number; autoReconnect: boolean } | null = null;

  connect(ip: string, port: number, autoReconnect: boolean, onStatus: (status: WifiStatus, retryCount: number) => void, isRetry: boolean = false) {
    // If already connected to the same IP/Port, don't do anything
    if (this.socket && this.socket.readyState === WebSocket.OPEN && 
        this.currentConfig?.ip === ip && this.currentConfig?.port === port) {
      return;
    }

    if (this.socket) {
      this.socket.close();
    }

    if (!isRetry) {
      this.retryCount = 0;
    }

    this.currentConfig = { ip, port, autoReconnect };
    this.onStatusChange = onStatus;
    this.status = 'connecting';
    this.onStatusChange(this.status, this.retryCount);

    try {
      this.socket = new WebSocket(`ws://${ip}:${port}`);

      this.socket.onopen = () => {
        console.log('WiFi MIDI Connected');
        this.status = 'connected';
        this.retryCount = 0;
        if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
      };

      this.socket.onclose = (event) => {
        console.log('WiFi MIDI Disconnected', event.code);
        this.status = 'disconnected';
        if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
        
        // Only auto-reconnect if it wasn't a clean close (code 1000)
        if (autoReconnect && event.code !== 1000 && this.retryCount < this.maxRetries) {
          setTimeout(() => {
            this.retryCount++;
            console.log(`WiFi MIDI Reconnecting... Attempt ${this.retryCount}`);
            this.connect(ip, port, autoReconnect, onStatus, true);
          }, 3000);
        }
      };

      this.socket.onerror = (err) => {
        console.error('WiFi MIDI Error:', err);
        this.status = 'error';
        if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
      };
    } catch (err) {
      console.error('WiFi MIDI Connection Exception:', err);
      this.status = 'error';
      if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
    }
  }

  disconnect() {
    if (this.socket) {
      // Use code 1000 to indicate intentional disconnect
      this.socket.close(1000);
      this.socket = null;
    }
    this.status = 'disconnected';
    this.retryCount = 0;
    if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
  }

  send(type: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...data }));
    }
  }

  getStatus() {
    return this.status;
  }
}

export const wifiMidiService = new WifiMidiService();
