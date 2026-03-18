
type WifiStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class WifiMidiService {
  private socket: WebSocket | null = null;
  private status: WifiStatus = 'disconnected';
  private retryCount = 0;
  private onStatusChange: ((status: WifiStatus, retryCount: number) => void) | null = null;

  connect(ip: string, port: number, autoReconnect: boolean, onStatus: (status: WifiStatus, retryCount: number) => void) {
    if (this.socket) {
      this.socket.close();
    }

    this.onStatusChange = onStatus;
    this.status = 'connecting';
    this.onStatusChange(this.status, this.retryCount);

    try {
      this.socket = new WebSocket(`ws://${ip}:${port}`);

      this.socket.onopen = () => {
        this.status = 'connected';
        this.retryCount = 0;
        if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
      };

      this.socket.onclose = () => {
        this.status = 'disconnected';
        if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
        
        if (autoReconnect && this.retryCount < 5) {
          setTimeout(() => {
            this.retryCount++;
            this.connect(ip, port, autoReconnect, onStatus);
          }, 3000);
        }
      };

      this.socket.onerror = () => {
        this.status = 'error';
        if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
      };
    } catch (err) {
      this.status = 'error';
      if (this.onStatusChange) this.onStatusChange(this.status, this.retryCount);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.status = 'disconnected';
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
