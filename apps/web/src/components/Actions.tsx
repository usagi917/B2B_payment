"use client";

import { useState } from "react";
import type { Hash } from "viem";
import type { ContractSummary, Milestone, UserRole } from "@/lib/types";
import { MilestoneState } from "@/lib/types";
import { getTxUrl } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const [submitIndex, setSubmitIndex] = useState<number>(0);
  const [evidence, setEvidence] = useState("");
  const [approveIndex, setApproveIndex] = useState<number>(0);
  const [cancelReason, setCancelReason] = useState("");

  if (!summary) return null;

  const isLocked = summary.lockedAmount > 0n;
  const isCancelled = summary.cancelled;

  const pendingMilestones = milestones
    .map((m, i) => ({ ...m, index: i }))
    .filter((m) => m.state === MilestoneState.PENDING);

  const submittedMilestones = milestones
    .map((m, i) => ({ ...m, index: i }))
    .filter((m) => m.state === MilestoneState.SUBMITTED);

  // Update default selection when milestones change
  if (pendingMilestones.length > 0 && !pendingMilestones.find(m => m.index === submitIndex)) {
    setSubmitIndex(pendingMilestones[0].index);
  }
  if (submittedMilestones.length > 0 && !submittedMilestones.find(m => m.index === approveIndex)) {
    setApproveIndex(submittedMilestones[0].index);
  }

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-bg)] flex items-center justify-center">
          <svg
            className="w-4 h-4 text-[var(--color-text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h2 className="font-semibold text-[var(--color-text)]">{t("actions")}</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {txHash && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-[var(--color-success)] font-medium">{t("success")}</span>
            {getTxUrl(txHash) && (
              <a
                href={getTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-buyer)] hover:underline ml-auto"
              >
                {t("viewTx")} →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Cancelled State */}
      {isCancelled && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{t("contractCancelled")}</p>
        </div>
      )}

      {!isCancelled && (
        <div className="space-y-4">
          {/* Buyer: Lock */}
          {userRole === "buyer" && !isLocked && (
            <div className="p-4 rounded-xl border-2 border-dashed border-[var(--color-buyer)]/30 bg-[var(--color-buyer)]/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔒</span>
                <h3 className="font-medium text-[var(--color-text)]">{t("lockFunds")}</h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {t("lockDescription")}
              </p>
              <button
                onClick={() => onLock(summary.totalAmount)}
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t("lockFunds")}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Producer: Submit */}
          {userRole === "producer" && isLocked && pendingMilestones.length > 0 && (
            <div className="p-4 rounded-xl border-2 border-dashed border-[var(--color-producer)]/30 bg-[var(--color-producer)]/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📝</span>
                <h3 className="font-medium text-[var(--color-text)]">{t("submitMilestone")}</h3>
              </div>
              <div className="space-y-3">
                <select
                  value={submitIndex}
                  onChange={(e) => setSubmitIndex(Number(e.target.value))}
                  className="input"
                >
                  {pendingMilestones.map((m) => (
                    <option key={m.index} value={m.index}>
                      {m.code} ({Number(m.bps) / 100}%)
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder={t("evidencePlaceholder")}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="input"
                />
                <button
                  onClick={() => onSubmit(submitIndex, evidence)}
                  disabled={isLoading || !evidence}
                  className="btn btn-success w-full"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("submit")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Buyer: Approve */}
          {userRole === "buyer" && isLocked && submittedMilestones.length > 0 && (
            <div className="p-4 rounded-xl border-2 border-dashed border-[var(--color-buyer)]/30 bg-[var(--color-buyer)]/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✅</span>
                <h3 className="font-medium text-[var(--color-text)]">{t("approveMilestone")}</h3>
              </div>
              <div className="space-y-3">
                <select
                  value={approveIndex}
                  onChange={(e) => setApproveIndex(Number(e.target.value))}
                  className="input"
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
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("approveRelease")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Admin: Cancel */}
          {userRole === "admin" && (
            <div className="p-4 rounded-xl border-2 border-dashed border-[var(--color-error)]/30 bg-[var(--color-error)]/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <h3 className="font-medium text-[var(--color-error)]">{t("cancelContract")}</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t("cancelReasonPlaceholder")}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input border-[var(--color-error)]/30 focus:border-[var(--color-error)]"
                />
                <button
                  onClick={() => onCancel(cancelReason)}
                  disabled={isLoading || !cancelReason}
                  className="btn btn-danger w-full"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t("cancelRefund")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* No actions available */}
          {userRole === "none" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{t("connectRoleWallet")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
