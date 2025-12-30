"use client";

import { useState } from "react";
import type { Hash } from "viem";
import type { ContractSummary, Milestone, UserRole } from "@/lib/types";
import { MilestoneState } from "@/lib/types";
import { getTxUrl } from "@/lib/config";

interface ActionsProps {
  summary: ContractSummary | null;
  milestones: Milestone[];
  userRole: UserRole;
  onLock: (totalAmount: bigint) => Promise<void>;
  onSubmit: (index: number, evidence: string) => Promise<void>;
  onApprove: (index: number) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txHash: Hash | null;
}

export function Actions({
  summary,
  milestones,
  userRole,
  onLock,
  onSubmit,
  onApprove,
  onCancel,
  isLoading,
  error,
  txHash,
}: ActionsProps) {
  const [submitIndex, setSubmitIndex] = useState<number>(0);
  const [evidence, setEvidence] = useState("");
  const [approveIndex, setApproveIndex] = useState<number>(0);
  const [cancelReason, setCancelReason] = useState("");

  if (!summary) return null;

  const isLocked = summary.lockedAmount > 0n;
  const isCancelled = summary.cancelled;

  // Get pending milestones for submit
  const pendingMilestones = milestones
    .map((m, i) => ({ ...m, index: i }))
    .filter((m) => m.state === MilestoneState.PENDING);

  // Get submitted milestones for approve
  const submittedMilestones = milestones
    .map((m, i) => ({ ...m, index: i }))
    .filter((m) => m.state === MilestoneState.SUBMITTED);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Actions</h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {txHash && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded mb-3 text-sm">
          Success!{" "}
          {getTxUrl(txHash) ? (
            <a
              href={getTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View TX
            </a>
          ) : (
            <span className="font-mono text-xs">{txHash.slice(0, 10)}...</span>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="text-gray-500 text-sm">
          Contract has been cancelled. No further actions available.
        </div>
      )}

      {!isCancelled && (
        <div className="space-y-4">
          {/* Buyer: Lock */}
          {userRole === "buyer" && !isLocked && (
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <h3 className="font-medium mb-2">Lock Funds</h3>
              <p className="text-sm text-gray-500 mb-2">
                Lock the total amount into escrow
              </p>
              <button
                onClick={() => onLock(summary.totalAmount)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Lock Funds"}
              </button>
            </div>
          )}

          {/* Producer: Submit */}
          {userRole === "producer" && isLocked && pendingMilestones.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <h3 className="font-medium mb-2">Submit Milestone</h3>
              <div className="space-y-2">
                <select
                  value={submitIndex}
                  onChange={(e) => setSubmitIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  {pendingMilestones.map((m) => (
                    <option key={m.index} value={m.index}>
                      {m.code} ({Number(m.bps) / 100}%)
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Evidence (URL or description)"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <button
                  onClick={() => onSubmit(submitIndex, evidence)}
                  disabled={isLoading || !evidence}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* Buyer: Approve */}
          {userRole === "buyer" && isLocked && submittedMilestones.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <h3 className="font-medium mb-2">Approve Milestone</h3>
              <div className="space-y-2">
                <select
                  value={approveIndex}
                  onChange={(e) => setApproveIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  {submittedMilestones.map((m) => (
                    <option key={m.index} value={m.index}>
                      {m.code} ({Number(m.bps) / 100}%)
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onApprove(approveIndex)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Approve & Release"}
                </button>
              </div>
            </div>
          )}

          {/* Admin: Cancel */}
          {userRole === "admin" && (
            <div className="border border-red-200 dark:border-red-800 rounded p-3">
              <h3 className="font-medium mb-2 text-red-600">Cancel Contract</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Reason for cancellation"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <button
                  onClick={() => onCancel(cancelReason)}
                  disabled={isLoading || !cancelReason}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Cancel & Refund"}
                </button>
              </div>
            </div>
          )}

          {/* No actions available */}
          {userRole === "none" && (
            <div className="text-gray-500 text-sm">
              Connect a wallet with Buyer, Producer, or Admin role to perform actions.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
