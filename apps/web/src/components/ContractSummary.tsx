"use client";

import type { Address } from "viem";
import type { ContractSummary as ContractSummaryType } from "@/lib/types";
import { formatAmount } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

interface ContractSummaryProps {
  summary: ContractSummaryType | null;
  tokenSymbol: string;
  tokenDecimals: number;
  isLoading: boolean;
  error: string | null;
}

export function ContractSummary({
  summary,
  tokenSymbol,
  tokenDecimals,
  isLoading,
  error,
}: ContractSummaryProps) {
  const { t } = useI18n();

  const shortenAddress = (addr: Address) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Progress calculation
  const progress = summary && summary.totalAmount > 0n
    ? Number((summary.releasedAmount * 100n) / summary.totalAmount)
    : 0;

  // SVG Progress Ring
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  if (isLoading) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-9 h-9 rounded-lg" />
          <div className="skeleton w-32 h-5" />
        </div>
        <div className="flex justify-center mb-5">
          <div className="skeleton w-[100px] h-[100px] rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="skeleton w-20 h-4" />
              <div className="skeleton w-24 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#FFEBEE] flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="section-title">{t("contractSummary")}</h2>
        </div>
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg surface flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="section-title">{t("contractSummary")}</h2>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">{t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg surface flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="section-title">{t("contractSummary")}</h2>
        </div>
        {summary.cancelled && (
          <span className="badge bg-[#FFEBEE] text-[var(--color-error)]">
            {t("cancelled")}
          </span>
        )}
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <svg
            className="progress-ring"
            width={size}
            height={size}
          >
            {/* Background circle */}
            <circle
              className="text-[var(--color-surface-variant)]"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            {/* Progress circle */}
            <circle
              className="progress-ring-circle"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              stroke="var(--color-progress)"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[var(--color-text)]">
              {progress.toFixed(0)}%
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {t("progress")}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 stat-tile">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{t("totalAmount")}</p>
          <p className="font-semibold text-sm text-[var(--color-text)]">
            {formatAmount(summary.totalAmount, tokenDecimals, tokenSymbol)}
          </p>
        </div>
        <div className="p-3 stat-tile">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{t("lockedAmount")}</p>
          <p className={`font-semibold text-sm ${summary.lockedAmount > 0n ? "text-[var(--color-success)]" : "text-[var(--color-text)]"}`}>
            {formatAmount(summary.lockedAmount, tokenDecimals, tokenSymbol)}
          </p>
        </div>
        <div className="p-3 stat-tile">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{t("releasedAmount")}</p>
          <p className="font-semibold text-sm text-[var(--color-buyer)]">
            {formatAmount(summary.releasedAmount, tokenDecimals, tokenSymbol)}
          </p>
        </div>
        <div className="p-3 stat-tile">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{t("refundedAmount")}</p>
          <p className={`font-semibold text-sm ${summary.refundedAmount > 0n ? "text-[var(--color-warning)]" : "text-[var(--color-text)]"}`}>
            {formatAmount(summary.refundedAmount, tokenDecimals, tokenSymbol)}
          </p>
        </div>
      </div>

      {/* Addresses */}
      <div className="space-y-0 text-xs">
        <div className="flex items-center justify-between py-2.5 border-t border-[var(--color-divider)]">
          <span className="text-[var(--color-text-muted)]">{t("buyerAddress")}</span>
          <span className="font-mono text-[var(--color-buyer)]">{shortenAddress(summary.buyer)}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-t border-[var(--color-divider)]">
          <span className="text-[var(--color-text-muted)]">{t("producerAddress")}</span>
          <span className="font-mono text-[var(--color-producer)]">{shortenAddress(summary.producer)}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-t border-[var(--color-divider)]">
          <span className="text-[var(--color-text-muted)]">{t("adminAddress")}</span>
          <span className="font-mono text-[var(--color-admin)]">{shortenAddress(summary.admin)}</span>
        </div>
      </div>
    </div>
  );
}
