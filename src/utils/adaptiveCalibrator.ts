
export interface CalibrationProfile {
  detectedMin: number;
  detectedMax: number;
  sampleCount: number;
  progress: number;
  range: number;
}

class AdaptiveCalibrator {
  
  // Rolling window of recent raw signal values
  private history: number[] = [];
  private readonly WINDOW_SIZE = 50;  // last 50 presses
  
  // Dynamic range (updates in real-time)
  private dynamicMin: number = 0.0;
  private dynamicMax: number = 1.0;
  
  // Smoothing factor (0.0 = no update, 1.0 = instant)
  // Low value = gradual adaptation (feels natural)
  private readonly SMOOTH = 0.08;
  
  // Stability: don't update from extreme outliers
  private readonly OUTLIER_THRESHOLD = 2.5;  // std deviations

  constructor() {
    this.load();
  }
  
  private load(): void {
    try {
      const saved = localStorage.getItem('studioPro_calibrationProfile');
      if (saved) {
        const data = JSON.parse(saved);
        this.dynamicMin = data.dynamicMin ?? 0.0;
        this.dynamicMax = data.dynamicMax ?? 1.0;
        this.history = data.history ?? [];
      }
    } catch (e) {
      console.error('Failed to load calibration profile', e);
    }
  }

  private save(): void {
    try {
      localStorage.setItem('studioPro_calibrationProfile', JSON.stringify({
        dynamicMin: this.dynamicMin,
        dynamicMax: this.dynamicMax,
        history: this.history
      }));
    } catch (e) {
      console.error('Failed to save calibration profile', e);
    }
  }
  
  update(rawSignal: number): void {
    // Add to history
    this.history.push(rawSignal);
    if (this.history.length > this.WINDOW_SIZE) {
      this.history.shift();
    }
    
    // Need minimum 5 presses before adapting
    if (this.history.length < 5) {
      this.save();
      return;
    }
    
    // Calculate stats
    const mean = this.history.reduce((a,b) => a+b) / 
                 this.history.length;
    const variance = this.history.reduce((sum, v) => 
      sum + Math.pow(v - mean, 2), 0) / this.history.length;
    const stdDev = Math.sqrt(variance);
    
    // Filter outliers (very occasional extreme presses)
    const filtered = this.history.filter(v => 
      Math.abs(v - mean) < stdDev * this.OUTLIER_THRESHOLD
    );
    
    if (filtered.length < 3) {
      this.save();
      return;
    }
    
    // New min/max from filtered history
    const newMin = Math.min(...filtered);
    const newMax = Math.max(...filtered);
    
    // Smooth update (gradual adaptation)
    this.dynamicMin += (newMin - this.dynamicMin) * this.SMOOTH;
    this.dynamicMax += (newMax - this.dynamicMax) * this.SMOOTH;
    
    // Ensure minimum range to prevent division issues
    if (this.dynamicMax - this.dynamicMin < 0.15) {
      this.dynamicMax = this.dynamicMin + 0.15;
    }

    this.save();
  }
  
  normalize(rawSignal: number): number {
    // Map raw signal to 0.0–1.0 based on player's range
    const range = this.dynamicMax - this.dynamicMin;
    if (range < 0.01) return 0.5;  // not calibrated yet
    
    const normalized = (rawSignal - this.dynamicMin) / range;
    return Math.max(0.0, Math.min(1.0, normalized));
  }
  
  // How calibrated is it? (0% = fresh, 100% = fully learned)
  getCalibrationProgress(): number {
    return Math.min(this.history.length / this.WINDOW_SIZE, 1)
      * 100;
  }
  
  // Current learned range info
  getProfile(): CalibrationProfile {
    return {
      detectedMin: this.dynamicMin,
      detectedMax: this.dynamicMax,
      sampleCount: this.history.length,
      progress: this.getCalibrationProgress(),
      range: this.dynamicMax - this.dynamicMin,
    };
  }
  
  reset(): void {
    this.history = [];
    this.dynamicMin = 0.0;
    this.dynamicMax = 1.0;
    localStorage.removeItem('studioPro_calibrationProfile');
  }
}

export const adaptiveCalibrator = new AdaptiveCalibrator();
