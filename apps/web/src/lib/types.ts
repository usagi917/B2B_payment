import type { Address, Hash } from "viem";

export enum MilestoneState {
  PENDING = 0,
  COMPLETED = 1,
}

export interface Milestone {
  code: string;
  bps: bigint;
  state: MilestoneState;
  evidenceHash: Hash;
  evidenceText: string;
  completedAt: bigint;
  releasedAmount: bigint;
}

export interface ContractSummary {
  token: Address;
  buyer: Address;
  producer: Address;
  admin: Address;
  totalAmount: bigint;
  lockedAmount: bigint;
  releasedAmount: bigint;
  refundedAmount: bigint;
  cancelled: boolean;
  milestonesCount: bigint;
}

export type EventType = "Locked" | "Completed" | "Cancelled";

export interface TimelineEvent {
  type: EventType;
  actor: Address;
  txHash: Hash;
  blockNumber: bigint;
  timestamp?: number;
  // Locked / Completed
  amount?: bigint;
  // Completed
  index?: bigint;
  code?: string;
  evidenceHash?: Hash;
  // Cancelled
  reason?: string;
  refundAmount?: bigint;
}

export type UserRole = "buyer" | "producer" | "admin" | "none";
