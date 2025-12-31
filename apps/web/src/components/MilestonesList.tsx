"use client";

import type { Milestone } from "@/lib/types";
import { MilestoneState } from "@/lib/types";
import { useI18n, type TranslationKey } from "@/lib/i18n";

interface MilestonesListProps {
  milestones: Milestone[];
}

export function MilestonesList({ milestones }: MilestonesListProps) {
  const { t } = useI18n();

  const formatTimestamp = (ts: bigint) => {
    if (ts === 0n) return "-";
    return new Date(Number(ts) * 1000).toLocaleString();
  };

  const getStateConfig = (state: MilestoneState) => {
    switch (state) {
      case MilestoneState.PENDING:
        return { label: t("pending"), class: "badge-pending", bgClass: "" };
      case MilestoneState.SUBMITTED:
        return { label: t("submitted"), class: "badge-submitted", bgClass: "bg-[#FFF3E0]" };
      case MilestoneState.APPROVED:
        return { label: t("approved"), class: "badge-approved", bgClass: "bg-[#E8F5E9]" };
    }
  };

  const approvedCount = milestones.filter((m) => m.state === MilestoneState.APPROVED).length;
  const totalCount = milestones.length;
  const progress = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h2 className="section-title">{t("milestones")}</h2>
        </div>
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {approvedCount}/{totalCount}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="milestone-progress">
          <div
            className="milestone-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-2">
        {milestones.map((m, index) => {
          const { label, class: badgeClass, bgClass } = getStateConfig(m.state);
          const description = t(m.code as TranslationKey) || m.code;

          return (
            <div
              key={index}
              className={`p-3 rounded-xl border border-[var(--color-divider)] transition-all ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    m.state === MilestoneState.APPROVED
                      ? "bg-[var(--color-success)] text-white"
                      : m.state === MilestoneState.SUBMITTED
                      ? "bg-[var(--color-warning)] text-white"
                      : "bg-[var(--color-surface-variant)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {m.state === MilestoneState.APPROVED ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : m.state === MilestoneState.SUBMITTED ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-[var(--color-text)]">
                      {m.code}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      ({Number(m.bps) / 100}%)
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {description}
                  </p>
                </div>

                {/* Badge */}
                <span className={`badge ${badgeClass} hidden sm:inline-flex`}>
                  {label}
                </span>
              </div>

              {/* Timestamps (if submitted or approved) */}
              {m.state !== MilestoneState.PENDING && (
                <div className="mt-2 pt-2 border-t border-[var(--color-divider)] flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  {m.submittedAt > 0n && (
                    <span>
                      {t("submittedAt")}: {formatTimestamp(m.submittedAt)}
                    </span>
                  )}
                  {m.approvedAt > 0n && (
                    <span>
                      {t("approvedAt")}: {formatTimestamp(m.approvedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
