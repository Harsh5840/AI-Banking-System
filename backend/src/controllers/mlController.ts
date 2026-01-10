
// apps/backend/src/controllers/mlController.ts

import { Request, Response } from "express";
import { evaluateRisk } from '../ai/riskEngine';
import { LedgerEntry } from "../core/ledger";

export const handleMLRiskScore = async (req: Request, res: Response) => {
  try {
    const entry: LedgerEntry = req.body;
    const score = await evaluateRisk(entry);

    res.status(200).json({
      success: true,
      riskScore: score,
    });
  } catch (error) {
    console.error("ML risk scoring failed:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
