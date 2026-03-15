interface VelocitySettings {
  minSpeed: number;
  maxSpeed: number;
  curve: number;
  windowMs: number;
  minVelocity: number;
  maxVelocity: number;
}

class VelocityTracker {
  private history: { y: number; t: number }[] = [];
  
  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('pointermove', (e) => {
        const now = performance.now();
        this.history.push({ y: e.clientY, t: now });
        // Trim to last 150ms
        const cutoff = now - 150;
        // Efficiently trim history
        while (this.history.length > 0 && this.history[0].t < cutoff) {
          this.history.shift();
        }
      });
    }
  }
  
  calculate(e: PointerEvent, settings: VelocitySettings): number {
    const now = performance.now();
    
    // 1. Real pressure (Priority override: iPad/Pencil)
    if (e.pressure > 0 && e.pressure !== 0.5 && 
        e.pointerType === 'touch') {
      return Math.max(1, Math.min(127,
        Math.round(Math.pow(e.pressure, 0.75) * 127)));
    }
    
    // 2. Downward speed
    const window = this.history.filter(p => now - p.t <= settings.windowMs);
    
    if (window.length >= 2) {
      const first = window[0];
      const last = window[window.length - 1];
      
      const dy = last.y - first.y;
      const dt = last.t - first.t;
      
      // Speed in pixels per ms (downward only)
      const speed = Math.max(dy, 0) / Math.max(dt, 1);
      
      const normalized = Math.min(
        Math.max(
          (speed - settings.minSpeed) / 
          (settings.maxSpeed - settings.minSpeed), 
          0
        ), 1
      );
      
      const curved = Math.pow(normalized, settings.curve);
      
      return Math.max(1, Math.min(127, Math.round(
        settings.minVelocity + 
        curved * (settings.maxVelocity - settings.minVelocity)
      )));
    }
    
    // 3. Contact area fallback
    if (e.pointerType === 'touch' && e.width > 1) {
      const area = e.width * e.height;
      const ratio = Math.min(Math.max(
        (area - 80) / 700, 0), 1);
      return Math.round(10 + Math.pow(ratio, 0.7) * 117);
    }
    
    // 4. Default
    return 64;
  }
}

export const velocityTracker = new VelocityTracker();
