import { LedgerEntry } from "../core/types";

// --- Anomaly Detection Model (from model.ts) ---
export class AnomalyDetector {
  private mean: number;
  private m2: number;
  private count: number;
  private static instance: AnomalyDetector;

  // Initialize with some reasonable defaults for transaction amounts
  constructor(initialMean = 50, initialVariance = 1000, initialCount = 10) {
    this.mean = initialMean;
    this.m2 = initialVariance * (initialCount - 1);
    this.count = initialCount;
  }

  static getInstance(): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      // Initialize with mock historical data
      AnomalyDetector.instance = new AnomalyDetector(150, 5000, 100);
    }
    return AnomalyDetector.instance;
  }

  update(value: number) {
    this.count++;
    const delta = value - this.mean;
    this.mean += delta / this.count;
    const delta2 = value - this.mean;
    this.m2 += delta * delta2;
  }

  getVariance(): number {
    return this.count > 1 ? this.m2 / (this.count - 1) : 0;
  }

  getStdDev(): number {
    return Math.sqrt(this.getVariance());
  }

  getZScore(value: number): number {
    const stdDev = this.getStdDev();
    if (stdDev === 0) return 0;
    return (value - this.mean) / stdDev;
  }

  isAnomaly(value: number, threshold = 3): boolean {
    return Math.abs(this.getZScore(value)) > threshold;
  }
}

// --- Rule-Based Logic (from rules.ts) ---
const suspiciousAccounts = ['unknown', 'temp', 'misc', 'offshore'];
const RULE_RISK_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
};

export function ruleBasedScore(entry: LedgerEntry): number {
  let score = 0;
  
  // High amount check
  if (entry.amount > 10000) score += 40;
  else if (entry.amount > 1000) score += 10;

  // Suspicious account check
  if (typeof entry.account === "string" && suspiciousAccounts.some(acc => entry.account.toLowerCase().includes(acc))) {
    score += 30;
  }

  // Time-based check (late night transactions)
  const hour = new Date(entry.timestamp).getHours();
  if (hour < 6 || hour > 23) score += 20;

  // Reversal check
  if (entry.isReversal) score += 10;

  return score;
}

// --- Main Risk Evaluation Function ---
export async function evaluateRisk(entry: LedgerEntry) {
  // 1. Calculate Rule-Based Score
  const ruleScore = ruleBasedScore(entry);

  // 2. Calculate Statistical Anomaly Score (Z-Score based)
  const detector = AnomalyDetector.getInstance();
  const zScore = Math.abs(detector.getZScore(entry.amount));
  
  // Update model with new data point (online learning)
  detector.update(entry.amount);

  // Map Z-Score to a 0-100 risk score safely
  // Z=3 (3 std devs) -> ~100 risk score
  let anomalyRisk = Math.min(zScore * 33, 100); 

  // 3. Combine Scores (Weighted Average)
  // Give more weight to rules for now as they are deterministic
  const totalScore = (ruleScore * 0.6) + (anomalyRisk * 0.4);

  const riskLevel =
    totalScore >= 70 ? "high" :
    totalScore >= 40 ? "medium" :
    "low";

  return {
    ruleScore,
    anomalyScore: Math.round(anomalyRisk),
    totalScore: Math.round(totalScore),
    riskLevel,
    details: {
      zScore: zScore.toFixed(2),
      isStatisticalAnomaly: zScore > 3
    }
  };
}

export async function mlRiskScore(entry: LedgerEntry): Promise<number> {
    const result = await evaluateRisk(entry);
    return result.anomalyScore;
}

export function evaluateAnomaly(value: number): boolean {
    return AnomalyDetector.getInstance().isAnomaly(value);
}
