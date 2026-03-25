/**
 * utils/format.ts
 * Shared formatting utilities for Stellar MarketPay.
 */

import { format, formatDistanceToNow } from "date-fns";
import type { JobStatus } from "./types";

export function formatXLM(amount: string | number, decimals = 4): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 XLM";
  return `${num.toLocaleString("en-US", { maximumFractionDigits: decimals })} XLM`;
}

export function timeAgo(dateString: string): string {
  try { return formatDistanceToNow(new Date(dateString), { addSuffix: true }); }
  catch { return dateString; }
}

export function formatDate(dateString: string): string {
  try { return format(new Date(dateString), "MMM d, yyyy"); }
  catch { return dateString; }
}

export function formatDeadline(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  try { return format(date, "MMM d, yyyy"); }
  catch { return ""; }
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

export function statusLabel(status: JobStatus): string {
  return { open: "Open", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" }[status];
}

export function statusClass(status: JobStatus): string {
  return { open: "badge-open", in_progress: "badge-progress", completed: "badge-complete", cancelled: "badge-cancelled" }[status];
}

export const JOB_CATEGORIES = [
  "Smart Contracts", "Frontend Development", "Backend Development",
  "UI/UX Design", "Technical Writing", "DevOps", "Security Audit",
  "Data Analysis", "Mobile Development", "Other",
];

/**
 * Common Web3 and development skill suggestions for autocomplete.
 */
export const SKILL_SUGGESTIONS = [
  // Blockchain & Smart Contracts
  "Rust", "Soroban", "Stellar SDK", "Solidity", "Ethereum", "Smart Contracts",
  "Web3.js", "Ethers.js", "Hardhat", "Foundry", "Anchor", "Solana",
  "DeFi", "NFT", "Token Development", "Cryptography",
  // Frontend
  "React", "Next.js", "TypeScript", "JavaScript", "Vue.js", "Angular",
  "Tailwind CSS", "CSS", "HTML", "Redux", "Zustand", "React Query",
  // Backend
  "Node.js", "Express", "Python", "Go", "Rust", "PostgreSQL", "MongoDB",
  "GraphQL", "REST API", "Docker", "Kubernetes", "Redis", "AWS", "GCP",
  // Design
  "Figma", "UI Design", "UX Design", "Prototyping", "Wireframing",
  // DevOps & Security
  "CI/CD", "Linux", "Security Audit", "Penetration Testing", "DevOps",
  // Mobile
  "React Native", "Flutter", "iOS", "Android",
  // Other
  "Technical Writing", "Documentation", "Agile", "Scrum", "Git",
];

/**
 * Converts an XLM amount to a USD equivalent string.
 * Returns null if price is unavailable so callers can fail silently.
 */
export function formatUSDEquivalent(xlmAmount: string | number, xlmPriceUsd: number | null): string | null {
  if (xlmPriceUsd === null) return null;
  const num = typeof xlmAmount === "string" ? parseFloat(xlmAmount) : xlmAmount;
  if (isNaN(num)) return null;
  const usd = (num * xlmPriceUsd).toFixed(2);
  return `≈ $${usd} USD`;
}
