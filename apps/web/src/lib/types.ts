import type { Address, Hash } from "viem";

export enum MilestoneState {
  PENDING = 0,
  SUBMITTED = 1,
  APPROVED = 2,
}

export interface Milestone {
  code: string;
  bps: bigint;
  state: MilestoneState;
  evidenceHash: Hash;
  submittedAt: bigint;
  approvedAt: bigint;
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

export type EventType = "Locked" | "Submitted" | "Released" | "Cancelled";

export interface TimelineEvent {
  type: EventType;
  actor: Address;
  txHash: Hash;
  blockNumber: bigint;
  timestamp?: number;
  // Locked
  amount?: bigint;
  // Submitted / Released
  index?: bigint;
  code?: string;
  evidenceHash?: Hash;
  // Cancelled
  reason?: string;
  refundAmount?: bigint;
}

export type UserRole = "buyer" | "producer" | "admin" | "none";
