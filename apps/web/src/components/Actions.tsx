"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address, Hash } from "viem";
import type { ContractSummary, Milestone, UserRole } from "@/lib/types";
import { MilestoneState } from "@/lib/types";
import { getTxUrl } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

// Loading spinner component
const LoadingSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

interface ActionsProps {
  address: Address | null;
  summary: ContractSummary | null;
  milestones: Milestone[];
  userRole: UserRole;
  onLock: (totalAmount: bigint) => Promise<void>;
  onSubmit: (index: number, evidence: string) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  txHash: Hash | null;
}

export function Actions({
  address,
  summary,
  milestones,
  userRole,
  onLock,
  onSubmit,
  onCancel,
  isLoading,
  error,
  txHash,
}: ActionsProps) {
  const { t } = useI18n();
  const [submitIndex, setSubmitIndex] = useState<number>(0);
  const [evidence, setEvidence] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const pendingMilestones = useMemo(
    () =>
      milestones
        .map((m, i) => ({ ...m, index: i }))
        .filter((m) => m.state === MilestoneState.PENDING),
    [milestones]
  );

  // Update default selection when milestones change
  useEffect(() => {
    if (pendingMilestones.length > 0) {
      const isValidIndex = pendingMilestones.some((m) => m.index === submitIndex);
      if (!isValidIndex) {
        setSubmitIndex(pendingMilestones[0].index);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMilestones]);

  if (!summary) return null;

  const isLocked = summary.lockedAmount > 0n;
  const isCancelled = summary.cancelled;
  const hasBuyerLock = userRole === "buyer" && !isLocked;
  const hasProducerSubmit = userRole === "producer" && isLocked && pendingMilestones.length > 0;
  const hasAdminCancel = userRole === "admin";
  const hasAnyActions = hasBuyerLock || hasProducerSubmit || hasAdminCancel;
  const emptyMessage = !address
    ? t("connectWalletHint")
    : userRole === "none"
      ? t("noActionsObserver")
      : t("noActionsAvailable");

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg surface flex items-center justify-center">
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
        <h2 className="section-title">{t("actions")}</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[#FFEBEE]">
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
        <div className="mb-4 p-3 rounded-lg bg-[#E8F5E9]">
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
                className="text-sm text-[var(--color-primary)] hover:underline ml-auto"
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
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FFEBEE] flex items-center justify-center">
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
          {hasBuyerLock && (
            <div className="p-4 rounded-xl bg-[#E3F2FD]">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[var(--color-buyer)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-medium text-[var(--color-text)]">{t("lockFunds")}</h3>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                {t("lockDescription")}
              </p>
              <button
                onClick={() => onLock(summary.totalAmount)}
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    {t("processing")}
                  </>
                ) : (
                  t("lockFunds")
                )}
              </button>
            </div>
          )}

          {/* Producer: Submit (自動支払い) */}
          {hasProducerSubmit && (
            <div className="p-4 rounded-xl bg-[#E8F5E9]">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[var(--color-producer)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium text-[var(--color-text)]">{t("submitMilestone")}</h3>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                {t("autoPaymentNote")}
              </p>
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
                      <LoadingSpinner />
                      {t("processing")}
                    </>
                  ) : (
                    t("submitAndReceive")
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Admin: Cancel */}
          {hasAdminCancel && (
            <div className="p-4 rounded-xl bg-[#FFEBEE]">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-medium text-[var(--color-error)]">{t("cancelContract")}</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t("cancelReasonPlaceholder")}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input"
                />
                <button
                  onClick={() => onCancel(cancelReason)}
                  disabled={isLoading || !cancelReason}
                  className="btn btn-danger w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      {t("processing")}
                    </>
                  ) : (
                    t("cancelRefund")
                  )}
                </button>
              </div>
            </div>
          )}

          {/* No actions available */}
          {!hasAnyActions && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full surface flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
