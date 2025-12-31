"use client";

import type { TimelineEvent } from "@/lib/types";
import { getTxUrl } from "@/lib/config";
import { formatAmount } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

interface TimelineProps {
  events: TimelineEvent[];
  tokenSymbol: string;
  tokenDecimals: number;
  isLoading: boolean;
  error: string | null;
}

export function Timeline({
  events,
  tokenSymbol,
  tokenDecimals,
  isLoading,
  error,
}: TimelineProps) {
  const { t } = useI18n();

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const shortenHash = (hash: string) => `${hash.slice(0, 10)}...`;

  const getEventConfig = (type: string) => {
    switch (type) {
      case "Locked":
        return {
          label: t("eventLocked"),
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          bgColor: "bg-[var(--color-buyer)]",
          borderColor: "border-l-[var(--color-buyer)]",
        };
      case "Completed":
        return {
          label: t("eventCompleted"),
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: "bg-[var(--color-success)]",
          borderColor: "border-l-[var(--color-success)]",
        };
      case "Cancelled":
        return {
          label: t("eventCancelled"),
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          bgColor: "bg-[var(--color-error)]",
          borderColor: "border-l-[var(--color-error)]",
        };
      default:
        return {
          label: type,
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: "bg-[var(--color-text-muted)]",
          borderColor: "border-l-[var(--color-text-muted)]",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-9 h-9 rounded-lg" />
          <div className="skeleton w-24 h-5" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-6 h-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton w-24 h-4" />
                <div className="skeleton w-full h-16 rounded-xl" />
              </div>
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
          <h2 className="section-title">{t("timeline")}</h2>
        </div>
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      </div>
    );
  }

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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="section-title">{t("timeline")}</h2>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full surface flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{t("noEvents")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...events].reverse().map((event, index) => {
            const { label, icon, bgColor, borderColor } = getEventConfig(event.type);

            return (
              <div key={`${event.txHash}-${index}`} className="timeline-item">
                <div className={`timeline-dot ${bgColor} text-white`}>
                  {icon}
                </div>

                <div className={`p-3 rounded-xl bg-[var(--color-surface-variant)] border-l-4 ${borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-[var(--color-text)]">{label}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {t("block")} #{event.blockNumber.toString()}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-text-muted)]">{t("actor")}:</span>
                      <span className="font-mono text-[var(--color-text-secondary)]">
                        {shortenAddress(event.actor)}
                      </span>
                    </div>

                    {event.type === "Locked" && event.amount && (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-text-muted)]">{t("amount")}:</span>
                        <span className="font-semibold text-[var(--color-buyer)]">
                          {formatAmount(event.amount, tokenDecimals, tokenSymbol)}
                        </span>
                      </div>
                    )}

                    {event.type === "Completed" && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-text-muted)]">{t("milestone")}:</span>
                          <span className="font-mono">{event.code}</span>
                        </div>
                        {event.amount && (
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-text-muted)]">{t("amount")}:</span>
                            <span className="font-semibold text-[var(--color-success)]">
                              {formatAmount(event.amount, tokenDecimals, tokenSymbol)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {event.type === "Cancelled" && (
                      <>
                        {event.reason && (
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-text-muted)]">{t("reason")}:</span>
                            <span>{event.reason}</span>
                          </div>
                        )}
                        {event.refundAmount && (
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-text-muted)]">{t("refunded")}:</span>
                            <span className="font-semibold text-[var(--color-warning)]">
                              {formatAmount(event.refundAmount, tokenDecimals, tokenSymbol)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[var(--color-text-muted)]">{t("tx")}:</span>
                      {getTxUrl(event.txHash) ? (
                        <a
                          href={getTxUrl(event.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-[var(--color-primary)] hover:underline"
                        >
                          {shortenHash(event.txHash)} →
                        </a>
                      ) : (
                        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                          {shortenHash(event.txHash)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
