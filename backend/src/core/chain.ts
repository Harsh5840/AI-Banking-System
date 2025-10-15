import crypto from "crypto";
import { LedgerEntry } from "./types";

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
}

export function hashEntry(entry: LedgerEntry): string {
  const str = JSON.stringify(entry);
  return crypto.createHash("sha256").update(str).digest("hex");
}

export function buildMerkleTree(entries: LedgerEntry[]): MerkleNode | null {
  if (entries.length === 0) return null;
  let nodes = entries.map((e) => ({ hash: hashEntry(e) }));
  while (nodes.length > 1) {
    const next: MerkleNode[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        const left = nodes[i];
        const right = nodes[i + 1];
        const combined = left.hash + right.hash;
        const hash = crypto.createHash("sha256").update(combined).digest("hex");
        next.push({ hash, left, right });
      } else {
        next.push(nodes[i]);
      }
    }
    nodes = next;
  }
  return nodes[0];
}

export function getMerkleRoot(entries: LedgerEntry[]): string | null {
  const tree = buildMerkleTree(entries);
  return tree ? tree.hash : null;
}