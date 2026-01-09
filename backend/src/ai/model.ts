/**
 * Simple Statistical Anomaly Detector
 * Uses Z-Score algorithm to detect outliers in transaction amounts.
 * 
 * In a real production system, this would be loaded from a serialized Python model (ONNX/Pickle)
 * or call a dedicated ML inference service.
 */
export class AnomalyDetector {
    private n: number = 0;
    private mean: number = 0;
    private M2: number = 0; // Usage for Welford's online algorithm
  
    constructor(initialData: number[] = []) {
      initialData.forEach(x => this.update(x));
    }
  
    /**
     * Update the running statistics with a new value (Welford's Algorithm)
     * @param x New value
     */
    update(x: number): void {
      this.n += 1;
      const delta = x - this.mean;
      this.mean += delta / this.n;
      const delta2 = x - this.mean;
      this.M2 += delta * delta2;
    }
  
    /**
     * Get current Variance
     */
    getVariance(): number {
      if (this.n < 2) return 0;
      return this.M2 / (this.n - 1);
    }
  
    /**
     * Get current Standard Deviation
     */
    getStdDev(): number {
      return Math.sqrt(this.getVariance());
    }
  
    /**
     * Calculate Z-Score for a value
     * Z = (X - Mean) / StdDev
     */
    getZScore(x: number): number {
      const stdDev = this.getStdDev();
      if (stdDev === 0) return 0; // Avoid division by zero
      return (x - this.mean) / stdDev;
    }
  
    /**
     * Check if value is an anomaly based on threshold (default 3 sigma)
     */
    isAnomaly(x: number, threshold: number = 3): boolean {
      return Math.abs(this.getZScore(x)) > threshold;
    }
  }
  
  // Singleton instance for the application
  // Seeded with some "historical" data for demonstration
  export const amountAnomalyDetector = new AnomalyDetector([
    10, 20, 50, 15, 100, 50, 60, 45, 120, 30, 25, 40, 55, 1000, 20, 10, 5
  ]);