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
          icon: "🔒",
          color: "bg-[var(--color-success)]",
          borderColor: "border-[var(--color-success)]",
        };
      case "Submitted":
        return {
          label: t("eventSubmitted"),
          icon: "📝",
          color: "bg-[var(--color-warning)]",
          borderColor: "border-[var(--color-warning)]",
        };
      case "Released":
        return {
          label: t("eventReleased"),
          icon: "💰",
          color: "bg-[var(--color-buyer)]",
          borderColor: "border-[var(--color-buyer)]",
        };
      case "Cancelled":
        return {
          label: t("eventCancelled"),
          icon: "❌",
          color: "bg-[var(--color-error)]",
          borderColor: "border-[var(--color-error)]",
        };
      default:
        return {
          label: type,
          icon: "📌",
          color: "bg-[var(--color-text-muted)]",
          borderColor: "border-[var(--color-text-muted)]",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="skeleton w-8 h-8 rounded-lg" />
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
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-error)]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-semibold text-[var(--color-text)]">{t("timeline")}</h2>
        </div>
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      </div>
    );
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="font-semibold text-[var(--color-text)]">{t("timeline")}</h2>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">{t("noEvents")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...events].reverse().map((event, index) => {
            const { label, icon, color, borderColor } = getEventConfig(event.type);

            return (
              <div key={`${event.txHash}-${index}`} className="timeline-item">
                <div className={`timeline-dot ${color} text-white`}>
                  {icon}
                </div>

                <div className={`p-4 rounded-xl border-l-4 ${borderColor} bg-[var(--color-bg)]`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[var(--color-text)]">{label}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {t("block")} #{event.blockNumber.toString()}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-text-muted)]">{t("actor")}:</span>
                      <span className="font-mono text-[var(--color-text-secondary)]">
                        {shortenAddress(event.actor)}
                      </span>
                    </div>

                    {event.type === "Locked" && event.amount && (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-text-muted)]">{t("amount")}:</span>
                        <span className="font-semibold text-[var(--color-success)]">
                          {formatAmount(event.amount, tokenDecimals, tokenSymbol)}
                        </span>
                      </div>
                    )}

                    {event.type === "Submitted" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-text-muted)]">{t("milestone")}:</span>
                        <span className="font-mono">{event.code}</span>
                      </div>
                    )}

                    {event.type === "Released" && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-text-muted)]">{t("milestone")}:</span>
                          <span className="font-mono">{event.code}</span>
                        </div>
                        {event.amount && (
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--color-text-muted)]">{t("amount")}:</span>
                            <span className="font-semibold text-[var(--color-buyer)]">
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
                          className="font-mono text-xs text-[var(--color-buyer)] hover:underline"
                        >
                          {shortenHash(event.txHash)} →
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
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
